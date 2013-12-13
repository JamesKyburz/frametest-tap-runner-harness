var frameTest = require('frametest')();
var test      = require('tape');
var through   = require('through');
var tapParser = require('tap-parser');

module.exports = function(opt) {
  opt.harness = harness;
  var ctx, wnd, timeoutTimer, i=0, testResults, start;
  frameTest(opt);

  function forEach(a, cb) {
    for (var i = 0; i < a.length; i++) cb(a[i], i);
  }

  function testPlan() {
    return opt.testPlans[i];
  }

  function createParser() {
    return tapParser(function(results) {
      var plan = testPlan();
      var description = testResults[1].split('#')[1];
      clearTimeout(timeoutTimer);
      if (results.ok) {
        ctx.logSuccess(description + ' passed!');
      } else {
        ctx.logFailure(description + ' failed!');
      }

      forEach(results.pass, function(p) {
        ctx.logSuccess(p.number + ' ' + p.name);
      });

      forEach(results.fail, function(f) {
        ctx.logFailure(f.number + ' ' + f.name);
      });

      if (!results.ok) showTestResults();
      var elapsed = new Date().getTime() - start.getTime();
      ctx.logInfo('elapsed: ' + elapsed + ' ms');
      if (opt.reportTestStatusUrl) reportTestStatus(description, elapsed, results);
      i++;
      if (testPlan()) {
        ctx.testCalled = false;
        frameTest(opt);
      } else {
        ctx.logInfo('completed all tests!');
      }
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

  function reportTestStatus(description, elapsed, results) {
    var report = document.createElement('iframe');
    report.style.display = 'none';
    report.src = opt.reportTestStatusUrl +
      '/' +
      (results.ok ? 'reportsuccess' : 'reportfailure') +
      '?results=' +
      encodeURIComponent(JSON.stringify(results)) +
      '&details=' +
      encodeURIComponent(JSON.stringify(testResults)) +
      '&description=' +
      encodeURIComponent(description)
    ;

    ctx.attach(report, 'load', function() {
      report.parentNode.removeChild(report);
    });

    document.querySelector('body').appendChild(report);
  }

  function showTestResults() {
    var line;
    var lines = testResults.slice();
    while(line = lines.shift()) ctx.logInfo(line);
  }

  function createLogger() {
    return through((function() {
      testResults = [];
      start = new Date();
      return function(line) {
        if (line) {
          testResults.push(line);
          this.emit('data', line);
        }
      };
    })());
  }

  var waitForAll = createWait('querySelectorAll', function exists(element) {
    return element.length;
  });

  var waitFor = createWait('querySelector', function exists(element) {
    return element;
  });

  function createWait(method, exists) {
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
        }
      })(this), opt.waitForPoll || 90);
    }
  }

  function harness() {
    wnd = this.iframe.contentWindow;
    ctx = this;

    if (ctx.testCalled) return;
    ctx.testCalled = true;

    ctx.detach(window, 'error', logBrowserErrors);
    ctx.attach(window, 'error', logBrowserErrors);
    ctx.attach(wnd, 'error', logBrowserErrors);

    var harness = test.createHarness();
    var logResults;
    harness.createStream().pipe(logResults = createLogger()).pipe(createParser());

    timeoutTimer = setTimeout(function() {
      clearTimeout(timeoutTimer);
      logResults.end();
      ctx.logFailure('incomplete, timed out');
    }, opt.maxWaitTime || 10000);


    Function(['__ctx', '__helpers'], 'with(__ctx) {with(__helpers){' + testPlan() + '}}')({
      waitFor: opt.cssSelector ? waitForAll : waitFor,
      waitForAll: waitForAll,
      test: harness,
    }, opt.helpers? opt.helpers(ctx) : {});
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
