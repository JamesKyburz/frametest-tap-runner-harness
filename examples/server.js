var http       = require('http');
var ecstatic   = require('ecstatic');
var routes     = require('tiny-route');
var stack      = require('stack');
var qs         = require('querystring');
var browserify = require('browserify');
var brfs       = require('brfs');

http.createServer(stack(
  log,
  cors,
  routes.get('/bundle.js', bundle),
  routes.get('/reportsuccess', reportSuccess),
  routes.get('/reportfailure', reportFailure),
  ecstatic({root: './'}),
  empty
)).listen(5555);

function log(q, r, next) {
  console.log(q.url);
  next();
}

function cors(q, r, next) {
  r.setHeader('Access-Control-Allow-Origin', '*');
  r.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  r.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  if (q.method === 'OPTIONS') {
    r.end();
  } else {
    next();
  }
}

function bundle(q, r, next) {
  browserify().
    add('./tests.js').
    require('frametest').
    transform(brfs).
    bundle().
    pipe(r)
  ;
}

function reportSuccess(q, r, next) {
  console.log('success');
  report(q, r, next);
}

function reportFailure(q, r, next) {
  console.log('failure');
  report(q, r, next);
}

function report(q, r, next) {
  var params = paramify = qs.parse(q.url.split('?')[1]);
  var details = JSON.parse(params.details);
  console.log(details.join(''));
  var testResults = details.join('').replace(/[\r\n]/g, '\\n');
  r.writeHead(200, {'Content-Type': 'text/html'});
  r.end('<script>window.top.postMessage(\'' + testResults + '\', \'*\');</script>');
}

function empty(q, r, next) {
  r.writeHead(200, {'Content-Type': 'text/html'});
  r.end();
}
