# Swayzee
Server to return static versions of your single page app

## How it works
When the server initializes it creates a phantomjs instance and opens a page with the url of the single page app. When the phantom is ready a express instance starts listening for page requests. When the phantom evaluation function detects that the title of the page has changed it returns the current html.

## TODO : Things to improve
1.Clean the code in a more modular way. Now works but its shit
2.Create workers to launch independent phantom instances in each worker for balancing.
3.Improve the phantom response handling, onConsoleLog i think is not pretty way
4.Implement a flag type value like the prerenderReady
5.Standarize a 404 handling


Inspired in prerender.io and rndr

