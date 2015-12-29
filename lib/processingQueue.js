'use strict';


var processingQueue = function(undefined) {

    var queue = [];

    // Process the next task in the queue
    var processNext = function() {
        if (queue.length > 0) {
            var task = queue[0];
            if (task.running == false) {
                task.execute();
                task.running = true;
            }
        }
    };

    var push = function(task) {
        queue.push(task);
    };

    var pop = function() {
        return queue.shift();
    };

    return {
        push       : push,
        pop        : pop,
        processNext: processNext
    }

}

module.exports = processingQueue;
