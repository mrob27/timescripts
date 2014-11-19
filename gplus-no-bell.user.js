// ==UserScript==
// @namespace http://mrob.com/time/scripts-beta
// @name Gplus-no-bell
// @description Attempt to remove G+ "bell" from Google title bar
// @author Robert Munafo
// @version 20141018.0014
// @downloadURL http://mrob.com/time/scripts-beta/gplus-no-bell.user.js
// @include http://*.google.com/*
// @include https://*.google.com/*
// @match http://*.google.com/*
// @match https://*.google.com/*
// ==/UserScript==

// REVISION HISTORY:
//
// 20140519.0409 First version
// 20140521.0616 Match the target href rather than the <div> class
// 20141018.0014 Add testing of aria-label attribute

var ttd;
var del;

nobell = {
  convert: function() {
    var ancs = document.getElementsByTagName('a');
    for(var i=0; i<ancs.length; i++) {
      var lab;
      if (ancs[i].href.indexOf("plus.google.com/u/0/notifications") != -1) {
        ancs[i].style.display="none";
      }
      lab = ancs[i].getAttribute("aria-label");
      if (lab) {
        // console.info(' ' + i + ' ' + lab + ' ' + (typeof lab));
        if (lab.indexOf("notifications") > -1) {
          ancs[i].style.display="none";
        }
      }
    }

    // Run myself again a couple more times. Eyal Shahar's version just
    // runs one more time with an interval of 2000.
    if (ttd > 0) {
      recalc = 1;
      setTimeout(nobell.convert.bind(nobell), del);
      ttd -= 1;
      // Go to the next-higher delay interval
      if         (del <= 1011) { del = 9111;     }
      else if    (del <= 9111) { del = 100235;   }
      else if  (del <= 100235) { del = 1303071;  }
      else if (del <= 1303071) { del = 19546083; }
    }
  }
};

// Make it run itself a few more times, because I suspect that other
// fb JavaScript might run even after the 'load', 'onload', and
// 'DOMContentLoaded' events have all fired.
ttd = 3; del = 1011;

// 3 cases for cross-platform, cross-browser: not necessary for this
// application but I want this code to be useful elsewhere too!
if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', // was 'load',
    nobell.convert.bind(nobell), false);
} else if (window.attachEvent) {
  window.attachEvent('onload',
    nobell.convert.bind(nobell));
} else {
  nobell.convert(nobell);
};
