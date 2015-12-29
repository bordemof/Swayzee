'use strict';
const
  phantom       = require('phantom'),
  mime          = require('mime-types'),
  cache         = require('./../services/s3')(),
  express       = require('express'),
  tParser       = require('./../utils/textParser'),
  Task          = require('./phantomTask'),
  taskQueue     = new require('./processingQueue')(),
  app           = express();


var swayzeeWoker = function(undefined) {
    //Regex
    var ESCAPED_REGEX  = /escaped_fragment_=/g;
    var ERR404_REGEX   = /name="prerender-status-code/g;

    //PhantomJS arguments
    var pharguments = ["--load-images=false", "--ignore-ssl-errors=true", "--ssl-protocol=tlsv1"];

    var initialize = function(origin, port) {
        phantom.create(function (ph) {
            ph.createPage(function (page) {
                page.open(origin, function (status) {
                        console.log("Swayzee has awakened and is looking for "+origin+"...");

                        app.get('*', function(req, res) {
                            var hasEscapedFragment = req.url.match(ESCAPED_REGEX);
                            var isAsset            = mime.lookup(req.url);

                            if (hasEscapedFragment && !isAsset) {
                                console.log("Receiving :",req.url);
                                var hash = tParser.extractHashURL(req.url);
                                cache.getPageIfCached(hash).then(function(error, result) {
                                    if (error) {
                                      taskQueue.push(new Task({hash: hash, request: req, response: res, page: page}))
                                      taskQueue.processNext();
                                    } else {
                                      var alreadyProcessedtTask = { hash: hash, response: res };
                                      generateResponse(alreadyProcessedtTask, result);
                                    }
                                })

                            } else {
                                //Redirect asset requests to origin, only works for 2 level path assets ex: /img/avatar.jpg
                                var redirect_url = calcRedirectUrl(req.url)
                                res.redirect(redirect_url);
                            }

                        });

                        app.listen( port, function(){ console.log("Swayzee is ready to receive requests."); });
               });

               // HANDLE PHANTOM OUTPUT
               page.set('onConsoleMessage', function (msg) {
                    if (msg.indexOf('PEF: ') > -1) {
                        var hash = msg.replace('PEF: ','').split(' -@- ')[0];
                        var html = msg.replace('PEF: ','').split(' -@- ')[1];
                        var task = taskQueue.pop();

                        if (hash == task.hash) {
                            html = tParser.removeScriptTags(html);
                            generateResponse(task, html);
                            cache.storePage(task.hash, html);
                        }
                    } else {
                        console.log("Phantom Console: " + msg);
                    }
               });

           });

        }, pharguments);

        process.on('SIGINT', function() {
            console.log("Closing ");
            require('child_process').spawn('pkill', ['phantomjs']);
            process.exit();
        });
    };

    // Calcs the origin url of the requested resource
    var calcRedirectUrl = function(url) {
        var splited = url.split("/");
        return ORIGIN+(splited[splited.length-2])+"/"+(splited[splited.length-1]);
    };

    // Handles the task response, detects also 404
    var generateResponse = function(task, html) {
        console.log("Response ready for ", task.hash);
        if (html.match(ERR404_REGEX)) {
          task.response.status(404).send(html);
        } else {
          task.response.status(200).send(html);
        }
    };

    return {
        initialize: initialize
    }
}

module.exports = swayzeeWoker;