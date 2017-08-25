'use strict';
const port = process.env.PORT || 8000;
const path = require('path');
const target = "http://localhost:"+port;
const mock = {
  "GET /assets/*": function (req, res) {
    res.sendFile(path.resolve('./src'+req.url))
  },
};
// require('fs')
//   .readdirSync(require('path').join(__dirname + '/mock'))
//   .filter(file=>file.endsWith('.js'))
//   .filter(file=>!file.includes('plugin'))
//   .forEach(function (file) {
//     Object.assign(mock, require('./mock/' + file));
//   });

export default mock;