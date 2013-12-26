// ==UserScript==
// @namespace mrob.com
// @name Facebook-no-sidebar
// @description Remove sidebar in Facebook
// @author Robert Munafo
// @version 6753.56
// @downloadURL http://mrob.com/time/scripts-beta/facebook-no-sidebar.user.js
// @include http://www.facebook.com
// ==/UserScript==

// REVISION HISTORY:
//
// np6753.56 First version

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
    if(sidebar) {
      sidebar.style.display="none";
    }

    // Run myself again a couple more times
    if (ttd > 0) {
      recalc = 1;
      setTimeout(openallspoilers.convert.bind(openallspoilers), del);
      ttd -= 1;
      // Go to the next-higher delay interval
      if (del <= 9111) {
        del = 100235;
      } else if (del <= 100235) {
        del = 1303071;
      } else if (del <= 1303071) {
        del = 19546083;
      }
    }
  }
};

// Make it run itself a few more times, because 'load', 'onload', and
// 'DOMContentLoaded' events all fail to wait long enough for the
// other JavaScript stuff to finish running.
ttd = 3; del = 9111;

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
