var fs = require('fs');

function createHelpers(context) {
  var helpers = {
    text: text,
    redirect: redirect,
    window: null,
  };

  load();
  context.attach(context.iframe, 'load', load);

  function load() {
    helpers.window = context.iframe.contentWindow;
  }

  return helpers;

  function text(element) {
    return element[('textContent' in element ? 'textContent' : 'innerText')];
  }

  function redirect(href) {
    helpers.window.location.href = href;
  };
}

var runner = require('../')({
  maxWaitTime: 240000,
  waitTimeout: 80,
  testUrl: '/start.html',
  reportTestStatusUrl: '',
  helpers: createHelpers,
  testPlans: [
    fs.readFileSync('./test_plans/test_plan.js'),
    fs.readFileSync('./test_plans/test_plan2.js'),
    fs.readFileSync('./test_plans/test_plan3.js'),
  ],
});
