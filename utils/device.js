const
  MobileDetect  = require('mobile-detect');

var device = function(undefined) {

    var getPrefix = function(request) {
        var md = new MobileDetect(request.headers['user-agent']);
        var size = 'desktop/';
        if (md.phone()){
            console.log("Mobile size detected.");
            size = 'mobile/'
        }
        return size;
    };

    // Detects the size of the screen and applies a custom width to the phantom page
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
    };

    return {
        calcScreenSize: calcScreenSize,
        getPrefix     : getPrefix
    }
}

module.exports = device();