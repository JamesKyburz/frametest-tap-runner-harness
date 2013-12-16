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
  waitTimeout: 80,
  testUrl: '/start.html',
  reportTestStatusUrl: '//localhost:5555',
  helpers: createHelpers,
  testPlans: [
    fs.readFileSync('./test_plans/test_plan.js'),
    fs.readFileSync('./test_plans/test_plan2.js'),
    fs.readFileSync('./test_plans/test_plan3.js'),
  ],
});
