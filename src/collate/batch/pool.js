"use strict"

const {
    BATCH_WORKER_NAME,
    WORKER_POOL_SIZE,
    WORKER_POOL_WAIT_TIMEOUT,
} = require("../../utils/constants");

const LargeWorker = require("worker-loader!./large.worker.js"); // eslint-disable-line import/no-webpack-loader-syntax
const TestsWorker = require("worker-loader!./tests.worker.js"); // eslint-disable-line import/no-webpack-loader-syntax

const message = require("../../utils/message").default;

const getLargeWorkerPool = () => {
    const workerPool = new Array(WORKER_POOL_SIZE);
    for(let i = 0; i < workerPool.length; i++) {
        workerPool[i] = new LargeWorker();
    }
    return workerPool;
};

const getTestsWorkerPool = () => {
    const workerPool = new Array(WORKER_POOL_SIZE);
    for(let i = 0; i < workerPool.length; i++) {
        workerPool[i] = new TestsWorker();
    }
    return workerPool;
};

const create = async (workerPool, parent, name, base, rows) => {
    const workerLoad = Math.floor(rows.length / WORKER_POOL_SIZE);
    const results = [];
    let doneWorkers = 0;

    console.log(`${name} starts the BatchWorker pool`);
    for(let workerIndex = 0; workerIndex < WORKER_POOL_SIZE; workerIndex++) {
        // Pop a worker off the pool
        const worker = workerPool.pop();

        // Listen for "done"
        worker.onmessage = (event) => {
            if(event.data.target === parent
            && event.data.subject === BATCH_WORKER_NAME
            && event.data.command === "done") {
                const {
                    data: {
                        payload
                    }
                } = event;

                console.log(`${name}'s BatchWorker #${doneWorkers+1} is done`)

                // Set result from response
                results.push(...payload);

                // Increment done workers
                doneWorkers++;

                // Kill the worker
                worker.terminate();
            }
        }

        // console.log(`${name} builds the BatchWorker payload`);
        const startIndex = workerIndex * workerLoad;
        const endIndex = startIndex + workerLoad;
        const batch = rows.slice(startIndex, endIndex);

        // console.log(`${name} starts the BatchWorker`);
        worker.postMessage(message(
            BATCH_WORKER_NAME,
            parent,
            "start",
            {
                base,
                batch,
            },
        ));
    }

    // Wait until all workers are back and we're on the last row
    while(true) {
        if(doneWorkers !== WORKER_POOL_SIZE) {
            await new Promise(r => setTimeout(r, WORKER_POOL_WAIT_TIMEOUT));
        } else {
            break;
        }
    }

    return results;
}

export const createTests = async (parent, name, base, rows) => {
    console.log(`${name} spins up BatchWorker pool`);
    const workerPool = getTestsWorkerPool();
    return create(workerPool, parent, name, base, rows)
}

export const createLarge = async (parent, name, base, rows) => {
    console.log(`${name} spins up BatchWorker pool`);
    const workerPool = getLargeWorkerPool();
    return create(workerPool, parent, name, base, rows)
}
