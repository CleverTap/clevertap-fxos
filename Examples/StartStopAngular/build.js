var browserify = require('browserify'),                                                                                                     
stringify = require('stringify')

var bundle = browserify()
              .transform(stringify(['.html']))
              .add('./index.js')

bundle.bundle().pipe(process.stdout);
