var fs = require('fs');
var runner = require('../')({
  waitTimeout: 80,
  testUrl: '/start.html',
  reportTestStatusUrl: 'http://localhost:1338',
  testPlans: [
    fs.readFileSync('./test_plans/test_plan.js'),
    fs.readFileSync('./test_plans/test_plan2.js'),
    fs.readFileSync('./test_plans/test_plan3.js'),
  ],
});
