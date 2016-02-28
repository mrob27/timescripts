// ==UserScript==
// @namespace http://mrob.com/time/scripts-beta
// @name Facebook-no-sidebar
// @description Remove sidebar in Facebook
// @author Robert Munafo
// @version 20141119.1122
// @downloadURL http://mrob.com/time/scripts-beta/facebook-no-sidebar.user.js
// @include http://*.facebook.com/*
// @include https://*.facebook.com/*
// @match http://*.facebook.com/*
// @match https://*.facebook.com/*
// @run-at       document-end
// ==/UserScript==

// REVISION HISTORY:
//
// 20131226.1233 First version
// 20131226.1251 Match https domains, and 'pagelet_rhc_ticker' ID
// 20131226.1304 Fix syntax errors.
// 20141119.1122 Add debugging messages.

var ttd;
var del;

fbnochat = {
  convert: function() {
    console.info("fbnochat checking (ttd " + ttd + ")...");
    var sidebar = document.getElementById("pagelet_sidebar");
    console.info("pagelet_sidebar: " + sidebar);
    if (sidebar) {
      console.info("sb.sty.disp='" + sidebar.style.display + "'");
      sidebar.style.display="none";
    }

    // Matching 'pagelet_rhc_ticker' from a similar script by Eyal
    // Shahar (@eyalshahar)
    sidebar = document.getElementById('pagelet_rhc_ticker');
    console.info("pagelet_rhc_ticker: " + sidebar);
    if (sidebar) {
      console.info("sb.sty.disp='" + sidebar.style.display + "'");
      sidebar.style.display="none";
    }

    // Run myself again a couple more times. Eyal Shahar's version just
    // runs one more time with an interval of 2000.
    if (ttd > 0) {
      recalc = 1;
      setTimeout(fbnochat.convert.bind(fbnochat), del);
      ttd -= 1;
      // Go to the next-higher delay interval
      if (del <= 1011) {
        del = 2011;
      } else if (del <= 2011) {
        del = 3111; 
      } else if  (del <= 3111) {
        del = 9111;
      } else if (del <= 9111) {
        del = 100235;
      };
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
              fbnochat.convert.bind(fbnochat), false);
} else if (window.attachEvent) {
  window.attachEvent('onload',
             fbnochat.convert.bind(fbnochat));
} else {
  fbnochat.convert(fbnochat);
};
