
'use strict';

const url = require('url');
const crypto = require('crypto');

module.exports = (req) => {
    let r = new URL(req.headers.referer || '');
    let ref = r.href ? r.protocol + r.host + r.pathname : null;

    return ref ? crypto.createHash('md5').update(ref).digest('hex') : null;
}   