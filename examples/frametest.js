require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"RTdtdx":[function(require,module,exports){
module.exports = function() {
  var iframe, logArea, context;
  return function(opt) {
    opt = opt || {};
    var HEIGHT_MARGIN = 40;
    var SCROLL_POLL = 1500;

    context = context || {
      logArea: logArea,
      iframe: iframe,
      attach: attach,
      detach: detach,
      logSuccess: log('success'),
      logFailure: log('failure'),
      logInfo: log('info'),
    };

    var body, logArea;

    if (iframe) {
      capture();
    } else {
      attach(window, 'load', function load() {
        var fs = require('fs');
        var insertCss = require('insert-css');
        var css = ".log-line {\n  font-size: 18px;\n  line-height: 18px;\n  font-weight: bold;\n}\n\n.log-line.success {\n  color: #29EC16;\n}\n\n.log-line.info {\n  color: #CFEDF4;\n}\n\n.log-line.failure {\n  color: #F00;\n}\n\n.box {\n  height: 100%;\n  padding: 10px;\n  width: 46%;\n  border-radius: 28px;\n  -webkit-border-radius: 28px;\n  -moz-border-radius: 28px;\n  -ms-border-radius: 28px;\n  -o-border-radius: 28px;\n  border: solid 8px rgb(41, 236, 22);\n  overflow-y: scroll;\n}\n\n.log-area {\n  float: right;\n  background-color: #202020;\n}\n\n.frame {\n  float: left;\n}\n\n@media (max-width: 900px) {\n  .box.log-area, .box.frame {\n    clear: both;\n    float: left;\n    width: 100%;\n    border: none;\n    border-radius: 0;\n    -webkit-border-radius: 0;\n    -moz-border-radius: 0;\n    -ms-border-radius: 0;\n    -o-border-radius: 0;\n  }\n}\n";
        insertCss(css);
        body = document.getElementsByTagName('body')[0];
        body.innerHTML = '';
        logArea = logArea || createLogArea();
        iframe = iframe || createIframe();

        attach(window, 'resize', resizeWindow);
        resizeWindow();
        capture();
      });
    }

    function capture() {
      context.iframe = iframe;
      iframe.src = opt.testUrl;
    }

    function load() {
      context.loaded = true;
      attach(iframe.contentWindow, 'unload', unload);
      opt.harness.call(context);
    }

    function unload() {
      context.loaded = false;
      detach(iframe.contentWindow, 'unload', unload);
    }

    function attachIframeEvents(iframe) {
      attach(iframe, 'load', load);
    }

    function attach(o, name, cb) {
      o.addEventListener ?
        o.addEventListener(name, cb, false)
        :
        o.attachEvent && o.attachEvent('on' + name, cb)
      ;
    }

    function detach(o, name, cb) {
      o.removeEventListener ?
        o.removeEventListener(name, cb)
        :
        o.detachEvent && o.detachEvent('on' + name, cb)
      ;
    }

    function createLogArea() {
      var area = body.appendChild(document.createElement('div'));
      area.setAttribute('class', 'log-area box');
      !function scroll() {
        if ('scrollHeight' in area &&
            'scrollTop' in area) {
          area.scrollTop = area.scrollHeight;
          setTimeout(scroll, SCROLL_POLL);
        }
      }();

      return body.appendChild(area);
    }

    function createIframe() {
      var f = body.appendChild(document.createElement('iframe'));
      f.setAttribute('class', 'frame box');
      f.marginwidth = f.marginheight = '';
      f.frameborder = '0';
      attachIframeEvents(f);
      return f;
    }

    function log(css) {
      return function(text) {
        var p = document.createElement('p');
        p.setAttribute('class', 'log-line ' + css);
        p[('textContent' in p ? 'textContent' : 'innerText')] = text;
        logArea.appendChild(p);
      };
    }

    function pageY(elem) {
      return elem.offsetParent ? (elem.offsetTop + pageY(elem.offsetParent)) : elem.offsetTop;
    }

    function resizeWindow() {
      var height = document.documentElement.clientHeight;
      height -= pageY(iframe);
      height = (height < 0) ? 0 : height;
      height -= HEIGHT_MARGIN;
      iframe.style.height = height + 'px';
      logArea.style.height = height + 'px';
    }
  };
};

},{"fs":4,"insert-css":3}],"frametest":[function(require,module,exports){
module.exports=require('RTdtdx');
},{}],3:[function(require,module,exports){
var inserted = [];

module.exports = function (css) {
    if (inserted.indexOf(css) >= 0) return;
    inserted.push(css);
    
    var elem = document.createElement('style');
    var text = document.createTextNode(css);
    elem.appendChild(text);
    
    if (document.head.childNodes.length) {
        document.head.insertBefore(elem, document.head.childNodes[0]);
    }
    else {
        document.head.appendChild(elem);
    }
};

},{}],4:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}]},{},[])
;