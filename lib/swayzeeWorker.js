'use strict';
const
  phantom       = require('phantom'),
  mime          = require('mime-types'),
  express       = require('express'),
  compress      = require('compression'),
  cache         = require('./../services/s3')(),
  tParser       = require('./../utils/textParser'),
  device        = require('./../utils/device'),
  Task          = require('./phantomTask'),
  TaskQueue     = require('./processingQueue'),
  app           = express();


var swayzeeWoker = function(undefined) {
    //Regex
    var ESCAPED_REGEX  = /escaped_fragment_=/g;
    var ERR404_REGEX   = /name="prerender-status-code/g;

    //PhantomJS arguments
    var pharguments = ["--load-images=false", "--ignore-ssl-errors=true", "--ssl-protocol=tlsv1"];

    app.use(compress());

    var tasks = new TaskQueue();

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
                                var prefix = device.getPrefix(req);

                                cache.getPageIfCached(prefix+hash).then(function(error, result) {
                                    if (error) {
                                      tasks.push(new Task({hash: hash, request: req, response: res, page: page}))
                                      tasks.processNext();
                                    } else {
                                      var alreadyProcessedtTask = { hash: hash, response: res };
                                      generateResponse(alreadyProcessedtTask, result);
                                    }
                                })

                            } else {
                                //Redirect asset requests to origin, only works for 2 level path assets ex: /img/avatar.jpg
                                var redirect_url = calcRedirectUrl(origin, req.url)
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
                        var task = tasks.pop();

                        var prefix = device.getPrefix(task.request);

                        if (hash == task.hash) {
                            html = tParser.removeScriptTags(html);
                            generateResponse(task, html);
                            cache.storePage(prefix+task.hash, html);
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
    var calcRedirectUrl = function(origin, url) {
        var splited = url.split("/");
        return origin+(splited[splited.length-2])+"/"+(splited[splited.length-1]);
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