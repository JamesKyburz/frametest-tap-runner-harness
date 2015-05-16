/*jshint evil:true */
var frameTest = require('frametest')();
var test      = require('tape');
var through   = require('through2');
var tapParser = require('tap-parser');

module.exports = runner;
module.exports.createHelpers = createHelpers;

function runner(opt) {
  opt.harness = harness;
  var ctx, wnd, testResults, logResults;

  opt.helpers = opt.helpers || createHelpers;

  frameTest(opt);

  function forEach(a, cb) {
    for (var i = 0; i < (a || []).length; i++) cb(a[i], i);
  }

  function createParser() {
    return tapParser(function(results) {
      clearTestTimer();
      if (results.ok) {
        ctx.logSuccess('passed!');
      } else {
        ctx.logFailure('failed!');
      }

      forEach(results.pass, function(p) {
        ctx.logSuccess(p.number + ' ' + p.name);
      });

      forEach(results.fail, function(f) {
        ctx.logFailure(f.number + ' ' + f.name);
      });

      if (typeof opt.reportTestStatusUrl !== 'undefined') {
        reportTestStatus(results);
        reportTestsComplete();
      }
      ctx.logInfo('test run finished');

      adjustLogAreaScroll();
    });
  }

  function adjustLogAreaScroll() {
    var area = ctx.logArea;
    if ('scrollHeight' in area &&
        'scrollTop' in area) {
        area.scrollTop = area.scrollHeight;
    }
  }

  function reportTestStatus(results) {
    var report = document.createElement('iframe');
    report.style.display = 'none';
    report.src = opt.reportTestStatusUrl +
      '/' +
      (results.ok ? 'reportsuccess' : 'reportfailure') +
      '?details=' +
      encodeURIComponent(JSON.stringify(testResults))
    ;

    ctx.attach(report, 'load', function() {
      report.parentNode.removeChild(report);
    });

    document.querySelector('body').appendChild(report);
  }

  function reportTestsComplete() {
    var report = document.createElement('iframe');
    report.style.display = 'none';
    report.src = opt.reportTestStatusUrl + '/end';

    ctx.attach(report, 'load', function() {
      report.parentNode.removeChild(report);
    });

    document.querySelector('body').appendChild(report);
  }

  function createLogger() {
    return through.obj((function() {
      testResults = [];
      return function(line, enc, callback) {
        console.log(line);
        if (/TAP version 13/.test(line)) {
          clearTestTimer();
          testTimer();
        }
        if (line) {
          ctx.logInfo(line);
          adjustLogAreaScroll();
          testResults.push(line);
          this.push(line);
          callback();
        }
      };
    })());
  }

  function testTimer() {
    testTimer.timer = setTimeout(function() {
      ctx.logFailure('tests timed out');
      logResults.end();
    }, opt.maxWaitTime || 30000);
  }

  function clearTestTimer() {
    clearTimeout(testTimer.timer);
  }

  var waitForAll = createWait('querySelectorAll', function exists(element) {
    return element.length;
  });

  var waitFor = createWait('querySelector', function exists(element) {
    return element;
  });

  function createWait(method, exists) {
    var time = new Date();
    return function wait(cssSelector, callback) {
      if (ctx.loaded) {
        var element = opt.cssSelector ?
          opt.cssSelector(cssSelector)
          :
          wnd.document[method](cssSelector);
        if (exists(element)) return callback(element);
      }

      setTimeout((function(context) {
        return function() {
          wait.apply(context, [cssSelector, callback]);
        };
      })(this), opt.waitForPoll || 90);
    };
  }

  function harness() {
    wnd = this.iframe.contentWindow;
    ctx = this;

    ctx.attach(wnd, 'error', logBrowserErrors);

    if (ctx.testCalled) return;
    ctx.testCalled = true;

    ctx.attach(window, 'error', logBrowserErrors);

    ctx.waitFor = opt.cssSelector ? waitForAll : waitFor;
    ctx.waitForAll = waitForAll;

    Function(['__ctx', '__helpers'], 'with(__ctx) {with(__helpers){' + opt.testPlans.join('') + '}}')({
      waitFor: ctx.waitFor,
      waitForAll: ctx.waitForAll,
      test: testWrapper(),
    }, opt.helpers(ctx));
  }

  function testWrapper() {
    var testHarness = test.createHarness();
    logResults = createLogger();
    testHarness.createStream().pipe(logResults).pipe(createParser());
    return function(description, cb) {
      frameTest(opt);
      testHarness(description, cb);
    };
  }

  function logBrowserErrors(e) {
    ctx.logFailure(errorMessage(e));
  }

  function errorMessage(e) {
    var message = '';
    for(var key in e)
      message += '\n' + key + '=' + e[key];
    return message;
  }
}

function createHelpers(context) {
  context.window = null;
  load();
  context.attach(context.iframe, 'load', load);
  return context;
  function load() {
    context.window = context.iframe.contentWindow;
  }
}
