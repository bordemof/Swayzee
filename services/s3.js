'use strict';

const
    knox   = require('knox'),
    Hope   = require('hope'),
    client = knox.createClient({
        key   : process.env.AMAZON_KEY || 'AMAZON-KEY',
        secret: process.env.AMAZON_KEY || 'AMAZON-SECRET',
        bucket: process.env.AMAZON_BUCKET || 'AMAZON-BUCKET'
    });


var s3wrapper = function(undefined) {

    var priority = 0;

    var _getPageIfCached = function(hash) {
        var promise = new Hope.Promise();
        console.log("Searching in cache for ", hash+'.html')
        client.get(hash+'.html').on('response', function(res){
              var body = '';
              res.on('data', function(chunk){
                 body += chunk;
              });

              res.setEncoding('utf8');

              res.on('end', function(){
                if (res.statusCode === 200) {
                    promise.done(null,body)
                } else {
                    promise.done(true,null)
                }
              });
        }).end();

        return promise;

    };

    var _storePage = function(hash, html) {
        var string = html;
        var req = client.put(hash+'.html', {
            'Content-Length': Buffer.byteLength(string)
          , 'Content-Type'  : 'document'
        });
        req.on('response', function(res){
          if (200 == res.statusCode) { console.log('saved to %s', req.url); }
        });
        req.end(string);
    };

    return {
        getPageIfCached   : _getPageIfCached,
        storePage         : _storePage
    };

}

module.exports = s3wrapper;
