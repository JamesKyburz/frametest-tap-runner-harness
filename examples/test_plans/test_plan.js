test('parent to child 1', function(t) {
  t.plan(4);
  redirect('/parent.html');
  waitFor('a', function(a) {
    t.ok(/parent\.html/.test(window.location.href), 'test location is /parent.html');
    t.ok(true, 'link to child found');
    a.click();
    waitFor('h1', function(h1) {
      t.equals(text(h1), 'Child view...', 'Child view equal');
      t.pass('Test passed');
    });
  });
});
