var fs = require('fs');

function createHelpers(context) {
  var helpers = {
    text: text,
    redirect: redirect,
  };

  Object.defineProperty(helpers, 'window', {
    get: function() {
      context.logInfo('getting window....');
      return context.iframe.contentWindow;
    }
  });

  return helpers;

  function text(element) {
    return element[('textContent' in element ? 'textContent' : 'innerText')];
  }

  function redirect(href) {
    helpers.window.location.href = href;
  };
}

var runner = require('../')({
  waitTimeout: 80,
  testUrl: '/start.html',
  reportTestStatusUrl: 'http://localhost:1338',
  helpers: createHelpers,
  testPlans: [
    fs.readFileSync('./test_plans/test_plan.js'),
    fs.readFileSync('./test_plans/test_plan2.js'),
    fs.readFileSync('./test_plans/test_plan3.js'),
  ],
});
