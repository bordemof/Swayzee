'use strict';
const
  device  = require('./../utils/device');

var phantomTask = function(attributes) {
    var running  = false;
    var size     = undefined;

    var page     = attributes.page;
    var hash     = attributes.hash;
    var request  = attributes.request;
    var response = attributes.response;

    var execute = function() {
        running = true;
        _fetchAndRenderPage();
    };


    // FETCH AND RENDER PAGE (RECURSIVE),
    var _fetchAndRenderPage = function() {
        console.log("Swayzee has is now stalking ", hash);
        size = device.calcScreenSize(request);
        page.set('viewportSize', size);

        page.evaluate(function(hash){
            var previousTitle = document.title;

            window.prerenderReady = false;
            window.location.hash = hash;

            function isRenderReady() {
                console.log(hash+" is render Ready ? "+window.prerenderReady)
                if( window.prerenderReady === false ) {
                    setTimeout(isRenderReady, 50);
                } else {
                    setTimeout(function() {
                        console.log("PEF: "+hash+" -@- "+document.documentElement.innerHTML);
                        document.title = document.title+' processed '+Date.now()
                        return;
                    }, 1500);
                }
            }
            isRenderReady();

        }, function (result) {}, hash);
    };

    return {
        hash     : hash,
        running  : running,
        request  : request,
        response : response,
        execute  : execute
    }
}
module.exports = phantomTask;