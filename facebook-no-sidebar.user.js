// ==UserScript==
// @namespace mrob.com
// @name Facebook-no-sidebar
// @description Remove sidebar in Facebook
// @author Robert Munafo
// @version 6754.08
// @downloadURL http://mrob.com/time/scripts-beta/facebook-no-sidebar.user.js
// @include http://*.facebook.com/*
// @include https://*.facebook.com/*
// @match http://*.facebook.com/*
// @match https://*.facebook.com/*
// ==/UserScript==

// REVISION HISTORY:
//
// np6753.56 First version
// np6753.85 Match https domains, and 'pagelet_rhc_ticker' ID
// np6754.08 Fix syntax errors.

var ttd;
var del;

openallspoilers = {

  // I'd like to know about cross-browser support for console.log(). Until
  // then, this is my replacement.
  //
  log: function (msg) {
    setTimeout(function() {
      throw new Error(msg);
    }, 0);
  },

  convert: function() {
    var sidebar = document.getElementById("pagelet_sidebar");
    if (sidebar) { sidebar.style.display="none"; }

    // Matching 'pagelet_rhc_ticker' from a similar script by Eyal
    // Shahar (@eyalshahar)
    sidebar = document.getElementById('pagelet_rhc_ticker');
    if(sidebar) { sidebar.style.display="none"; }

    // Run myself again a couple more times. Eyal Shahar's version just
    // runs one more time with an interval of 2000.
    if (ttd > 0) {
      recalc = 1;
      setTimeout(openallspoilers.convert.bind(openallspoilers), del);
      ttd -= 1;
      // Go to the next-higher delay interval
      if           (del <= 1011) { del = 9111;
      } else if    (del <= 9111) { del = 100235;
      } else if  (del <= 100235) { del = 1303071;
      } else if (del <= 1303071) { del = 19546083;
      }
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
    openallspoilers.convert.bind(openallspoilers), false);
} else if (window.attachEvent) {
  window.attachEvent('onload',
    openallspoilers.convert.bind(openallspoilers));
} else {
  openallspoilers.convert(openallspoilers);
};
