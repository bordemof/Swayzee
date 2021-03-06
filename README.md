# Swayzee
![license](https://img.shields.io/badge/license-MIT-blue.svg) ![issues](https://img.shields.io/github/issues/bordemof/Swayzee.svg)

Server to return static versions of your single page app.

[![NPM](https://nodei.co/npm/swayzee.png)](https://nodei.co/npm/swayzee/)

## How it works
When the server initializes it creates a phantomjs instance and opens a page with the url of the single page app. When the phantom is ready a express instance starts listening for page requests. When the phantom evaluation function detects that the flag(Global variable) window.prerenderReady is set to true the static HTML is given as response.

![captura de pantalla 2016-01-04 a las 21 30 48](https://cloud.githubusercontent.com/assets/5477232/12099714/82734fdc-b32a-11e5-97c5-cfb4fb98f1ba.png)

## Conventions
* Swayzee works with the #! escaped_fragment google convention.
* Swayzee knows when the static is ready to ve served watching the window.prerenderReady boolean value, it must be setted to true when the spa has finished the rendering process.
* Swayzee looks for a this convention tag in the html ```<meta name="prerender-status-code" content="404">``` to detect 404 errors.

## TODO : Things to improve
### Refactor
1. Improve the phantom response handling, onConsoleLog i think is not pretty way

### Improvements
1. Dynamicly set multiple ORIGINS.
2. BlackList
3. Caching Handler (Now only avaible s3)
4. Multiclient

## How to start
1. Point the ORIGIN the url of your server.
2. ```npm start``` or ```node swayzee.js --harmony```
3. Make a request: ``http://localhost:1333/&_escaped_fragment_=/url/example```


## How to redirect the crawler request to my swayzee
There are some prerender middlewares officialy develoveped by the community and [@todd](https://gist.github.com/thoop) and the community to fit this need:

* ExpressJS (Javascript): https://github.com/prerender/prerender-node
* Rails (Ruby): https://github.com/prerender/prerender_rails 
* Nginx: https://gist.github.com/thoop/8165802
* Apache: https://gist.github.com/thoop/8072354
* Spring (Java): https://github.com/greengerong/prerender-java
* ASP.NET MVC (C#): https://github.com/greengerong/Prerender_asp_mvc
* Zend Framework2 (PHP): https://github.com/zf-fr/zfr-prerender
* Symfony 2 (PHP): https://github.com/rjanot/YuccaPrerenderBundle
* Laravel (PHP): https://github.com/JeroenNoten/laravel-prerender
* Tornado (Python): https://gist.github.com/ysimonson/7120798
* Django (Python): https://github.com/skoczen/django-seo-js
* Spray (Scala): https://github.com/Jarlakxen/spray-prerender
* Koa (Javascript): https://github.com/RisingStack/koa-prerender
* Hapi (Javascript): https://github.com/wrangr/hapi-prerender

https://prerender.io/documentation/install-middleware

Inspired in [prerender.io](https://github.com/prerender/prerender).

<img width="393" alt="captura de pantalla 2015-12-23 a las 18 40 06" src="https://cloud.githubusercontent.com/assets/5477232/11981630/cf9fb35c-a9a4-11e5-9208-1b63c761a552.png">

