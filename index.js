'use strict';

const http = require('http');
const url = require('url');

const port = 3000;

http.createServer((req, res) => {

    let uri = new URL(req.url, "http://localhost:3000/").pathname;
    res.end(uri);

}).listen(port);

console.log(`page hit web service running on port ${port}`);
