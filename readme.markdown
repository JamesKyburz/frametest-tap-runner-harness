# frametest-tap-runner-harness

Using frametest and tap to automate tests

# install

With [npm](http://npmjs.org) do:

```
npm install frametest-tap-runner-harness
```

compile with [browserify](http://browserify.org) using
[brfs](https://github.com/substack/brfs) to inline the `fs.readFile()`
call:

```
browserify -r frametest-tap-runner-harness -t brfs -r frametest > bundle.js
```

# example
```
cd examples && npm install && node index
open http://localhost:5555
```

# license
MIT
