'use strict';

const http = require('http');
const url = require('url');

const httpResponse = require('./lib/httpresponse');
const pagehit = new (require('./lib/pagehit'))();

const port = 3000;

http.createServer((req, res) => {

    let count = pagehit.count(req);

    if (!count) {
        httpResponse({ res, status: 400, content: "No referrer" });
        return;
    }

    let uri = new URL(req.url, "http://localhost:3000/").pathname;
    switch (uri) {

        // JavaScript document.write() counter
        case '/counter.js':

            httpResponse({
                res,
                mime: 'application/javascript',
                content: `document.write('<span class="pagecounter">${count}</span>');`
            });
            break;

        // error: invalid HTTP request
        default:
            httpResponse({ res, status: 404, content: 'Not found' });
            break;

    }

}).listen(port);

console.log(`page hit web service running on port ${port}`);
