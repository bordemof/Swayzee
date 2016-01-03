'use strict';

var textParser = function(undefined) {

    var SCRIPT_REGEX   = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

    // Removes all script tags from the html
    var removeScriptTags = function(html) {
        while (SCRIPT_REGEX.test(html)) { html = html.replace(SCRIPT_REGEX, ""); }
        return html;
    };

    // Extracts the hash and adds back the #! convention
    var extractHashURL = function(url) {
        return  '#!'+url.split("_escaped_fragment_=")[1].split("%2F").join("/");
    };

    return {
        extractHashURL   : extractHashURL,
        removeScriptTags : removeScriptTags
    }
}

module.exports = textParser();