'use strict';
const
  MobileDetect  = require('mobile-detect');

var phantomTask = function(attributes) {
    var running  = false;
    var size     = undefined;

    var page     = attributes.page;
    var hash     = attributes.hash;
    var request  = attributes.request;
    var response = attributes.response;

    var execute = function() {
        size = _calcScreenSize();
        _fetchAndRenderPage();
    };

    // Detects the size of the screen and applies a custom width to the phantom page
    var _calcScreenSize = function() {
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
    };

    // FETCH AND RENDER PAGE (RECURSIVE),
    var _fetchAndRenderPage = function() {
        console.log("Swayzee has is now stalking ", hash);
        page.set('viewportSize', size);

        page.evaluate(function(hash){
            var previousTitle = document.title;

            if (window.location.hash === hash){
                console.log("PEF: "+hash+" -@- "+document.documentElement.innerHTML);
                document.title = document.title.split(' processed ')[0]+' processed '+Date.now();
                return;
            } else {
                window.location.hash = hash;
                window.prerenderReady = false;
                function isRenderReady() {
                    console.log(hash+" is render Ready ?"+window.prerenderReady)
                    if( window.prerenderReady=== false ) {
                        setTimeout(isRenderReady, 50);
                    } else {
                        setTimeout(function(){
                            console.log("PEF: "+hash+" -@- "+document.documentElement.innerHTML);
                            document.title = document.title+' processed '+Date.now()
                            return;
                        }, 1300);
                    }
                }
            isRenderReady();
            }
        }, function (result) {}, hash);
    };

    return {
        hash     : hash,
        running  : running,
        response : response,
        execute  : execute,
    }
}
module.exports = phantomTask;