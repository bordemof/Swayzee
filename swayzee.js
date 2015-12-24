'use strict';
const
  phantom       = require('phantom'),
  cluster       = require('cluster'),
  express       = require('express'),
  http          = require('http'),
  numCPUs       = require('os').cpus().length,
  MobileDetect  = require('mobile-detect'),
  app           = express();

//Regex
var SCRIPT_REGEX   = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
var ASSET_REGEX    = /\.(jpg|jpeg|png|gif|css|js|woff|\/img|\/css|\/js)/g;
var ESCAPED_REGEX  = /escaped_fragment_=/g;
var ERR404_REGEX   = /name="prerender-status-code/g;

// Url of the single page application
var ORIGIN      = 'http://localhost:8080/';
var port        = process.env.PORT || 1333;
//PhantomJS arguments
var pharguments = ["--load-images=false", "--ignore-ssl-errors=true", "--ssl-protocol=tlsv1"];


//-----------------------------------------------------

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) { cluster.fork(); }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });

} else {

    var processingQueue = [];
    phantom.create(function (ph) {

        ph.createPage(function (page) {

            page.open(ORIGIN, function (status) {
                    console.log("Swayzee has awakened and is looking for "+ORIGIN+"...");

                    app.get('*', function(req, res) {
                        var hasEscapedFragment = req.url.match(ESCAPED_REGEX);
                        var isAsset            = req.url.match(ASSET_REGEX)


                        if (hasEscapedFragment && !isAsset) {
                            console.log("Receiving :",req.url);
                            var hash = '#!'+req.url.split("_escaped_fragment_=")[1];
                            processingQueue.push({hash: hash, request: req, response: res, page: page, running: false})
                            processNext();
                        } else {
                            //Redirect asset requests to origin, only works for 2 level path assets ex: /img/avatar.jpg
                            var splited = req.url.split("/");
                            var redirect_url = ORIGIN+(splited[splited.length-2])+"/"+(splited[splited.length-1])
                            res.redirect(redirect_url);
                        }

                    });

                    app.listen( port, function(){ console.log("Swayzee is ready to receive requests."); });

           });

           // HANDLE PHANTOM OUTPUT
           page.set('onConsoleMessage', function (msg) {
                // Uncomment for debuging your client output
                // console.log("Phantom Console: " + msg);
                if (msg.indexOf('PEF: ') > -1) {

                    var hash = msg.replace('PEF: ','').split(' -@- ')[0];
                    var html = msg.replace('PEF: ','').split(' -@- ')[1];

                    var task = processingQueue.shift();

                    if (hash == task.hash){
                        //Remove script tags from the html
                        while (SCRIPT_REGEX.test(html)) { html = html.replace(SCRIPT_REGEX, ""); }

                        console.log("Response ready for ", hash);
                        if (html.match(ERR404_REGEX)) {
                          task.response.status(404).send(html);
                        } else {
                          task.response.status(200).send(html);
                        }
                    }
                }
           });
       });

    }, pharguments);

    process.on('SIGINT', function() {
        console.log("Closing ");
        require('child_process').spawn('pkill', ['phantomjs']);
        process.exit();
    });
}


// FETCH AND RENDER PAGE (RECURSIVE),
var fetchAndRenderPage = function(page, hash, size) {
    console.log("Swayzee has is now stalking ", hash);
    page.set('viewportSize', size);

    page.evaluate(function(hash){
        var previousTitle = document.title;
        var iteration=0;
        window.location.hash = hash;

        function isRenderReady() {
            // console.log(iteration+") Title : ",previousTitle, ' vs ',document.title);
            if( previousTitle===document.title && iteration < 40) {
                iteration++;
                setTimeout(isRenderReady, 50);
            } else {
                setTimeout(function(){
                    console.log("PEF: "+hash+" -@- "+document.documentElement.innerHTML);
                    document.title =  document.title+' processed '+Date.now()
                    return;
                }, 1200);
            }
        }
        isRenderReady();
    }, function (result) {}, hash);
}

// Process the next task in the queue
var processNext = function(){
    if (processingQueue.length > 0) {
        var task = processingQueue[0];
        if (task.running == false) {
            var size = calcScreenSize(task.request);
            fetchAndRenderPage(task.page, task.hash, size);
            task.running = true;
        }
    }
}

var calcScreenSize = function(request) {
    var md = new MobileDetect(request.headers['user-agent']);
    var size = { width: 1440, height: 718 };
    if (md.phone()){
        console.log("Mobile size detected.");
        size = { width: 479, height: 718 };
    } else if (md.tablet()) {
        console.log("Tablet size detected.");
        size = { width: 961, height: 718 };
    }
    return size;
}

// ON EXIT


