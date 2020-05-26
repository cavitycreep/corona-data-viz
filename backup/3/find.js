const {
    BATCH_SIZE,
    WORKER_POOL_SIZE,
    WORKER_POOL_RETRY_TIMEOUT,
    WORKER_POOL_WAIT_TIMEOUT,
} = require("../../constants");

const FindWorker = require("worker-loader!./find.worker.js"); // eslint-disable-line import/no-webpack-loader-syntax

const getWorkerPool = () => {
    const workerPool = new Array(WORKER_POOL_SIZE);
    for(let i = 0; i < workerPool.length; i++) {
        workerPool[i] = new FindWorker();
    }
    return workerPool;
};

// NOTE: Rows must be paired down to one row per representation
// Ie, doesn't account for multiple dates per representation
export default async (name, rows, target, match) => {
    try {
        // Spin up worker pool
        const workerPool = getWorkerPool();
        let foundResults = [];
        let lastRow = false;

        // Loop rows in batch
        for(let i = 0; i < rows.length; i += BATCH_SIZE) {
            // Wait until there's a worker available
            while(true) {
                if(!workerPool.length) {
                    await new Promise(r => setTimeout(r, WORKER_POOL_RETRY_TIMEOUT));
                } else {
                    break;
                }
            }

            // Get a worker from the pool
            const worker = workerPool.pop();
            const batch = [];

            // Listen for "done"
            worker.onmessage = (event) => {
                if(event.data.target === name
                && event.data.subject === "worker.find"
                && event.data.command === "done") {
                    const {
                        data: {
                            payload: {
                                result: searchResult,
                            }
                        }
                    } = event;

                    // Set result from response
                    foundResults.push(...searchResult);

                    // Return worker to pool
                    workerPool.push(worker);
                }
            }

            // Fill the batch
            if(i > rows.length - BATCH_SIZE - 1) {
                batch.push(...rows.slice(i));
                lastRow = true;
            } else {
                batch.push(...rows.slice(i, i + BATCH_SIZE));
            }

            // Send the worker the batch, the target, and the match fn
            worker.postMessage({
                target: "worker.find",
                subject: name,
                command: "start",
                payload: {
                    target,
                    batch,
                    match: match.toString(),
                }
            });
        }

        // Wait until all workers are back and we're on the last row
        while(true) {
            if(lastRow === false && workerPool.length !== WORKER_POOL_SIZE) {
                await new Promise(r => setTimeout(r, WORKER_POOL_WAIT_TIMEOUT));
            } else {
                break;
            }
        }

        // Kill the workers
        workerPool.forEach((worker) => worker.terminate());

        // Return found result
        return foundResults;
    } catch(e) {
        throw new Error(e);
    }
};
