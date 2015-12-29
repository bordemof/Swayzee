'use strict';
const
  cluster       = require('cluster'),
  numCPUs       = require('os').cpus().length,
  swayzee       = require('./lib/swayzeeWorker')();

//-----------------------------------------------------

// Url of the single page application
var origin      = process.env.ORIGIN || 'http://localhost:3000/';
var port        = process.env.PORT || 1333;

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) { cluster.fork(); }

    cluster.on('exit', function (worker) {
        console.log('Worker %d died :( restarting...', worker.id);
        cluster.fork();
    });

} else {
    swayzee.initialize(origin, port);
}





