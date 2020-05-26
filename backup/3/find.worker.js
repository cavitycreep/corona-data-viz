"use strict"

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    try {
        if(event.data.target === "worker.find" && event.data.command === "start") {
            const payload = {};

            const {
                data: {
                    payload: {
                        target,
                        batch,
                        match: matchString,
                    }
                }
            } = event;

            // TODO Questionable if this actually works?
            const match = new Function(matchString);
            const result = match(batch, target);

            payload.result = result || [];

            self.postMessage({ // eslint-disable-line no-restricted-globals
                target: event.data.subject,
                subject: "worker.find",
                command: "done",
                payload,
            });
        }
    } catch(e) {
        console.error(e);
    }
});
