# Swayzee
Server to return static versions of your single page app

## How it works
When the server initializes it creates a phantomjs instance and opens a page with the url of the single page app. When the phantom is ready a express instance starts listening for page requests. When the phantom evaluation function detects that the title of the page has changed it returns the current html.

## Conventions
*Swayzee asumes that when the title changes means that the page has finished loading.
*Swayzee looks for a this tag in the html '<meta name="prerender-status-code" content="404">' to detect 404.

## TODO : Things to improve
### Refactor
1. Clean the code in a more modular way. Now works but its shit.
2. Improve the phantom response handling, onConsoleLog i think is not pretty way

### Improvements
1. Create workers to launch independent phantom instances in each worker for balancing.
2. Implement a flag type value like the prerenderReady
3. Standarize a 404 handling



Inspired in prerender.io and rndr

