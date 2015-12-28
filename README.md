# Swayzee
Server to return static versions of your single page app.

## How it works
When the server initializes it creates a phantomjs instance and opens a page with the url of the single page app. When the phantom is ready a express instance starts listening for page requests. When the phantom evaluation function detects that the title of the page has changed it returns the current html.

## Conventions
* Swayzee works with the #! escaped_fragment google convention.
* Swayzee asumes that when the title changes means that the page has finished loading.
* Swayzee looks for a this tag in the html ```<meta name="prerender-status-code" content="404">``` to detect 404 errors.

## TODO : Things to improve
### Refactor
1. Clean the code in a more modular way. Now works but its shit.
2. Improve the phantom response handling, onConsoleLog i think is not pretty way

### Improvements
1. Create workers to launch independent phantom instances in each worker for balancing. (Done)
2. Implement a flag type value like the prerenderReady
3. Standarize a 404 handling
4. Dynamicly set multiple ORIGINS.
5. BlackList
6. Caching
7. Error handling module

### Fix
1. Ensure all the phantom process get killed when exit or error.

## How to start
1. Point the ORIGIN the url of your server.
2. ```npm start``` or ```node swayzee.js --harmony```
3. Make a request: ``http://localhost:1333/&_escaped_fragment_=/url/example```


Inspired in [prerender.io](https://github.com/prerender/prerender).

<img width="393" alt="captura de pantalla 2015-12-23 a las 18 40 06" src="https://cloud.githubusercontent.com/assets/5477232/11981630/cf9fb35c-a9a4-11e5-9208-1b63c761a552.png">

