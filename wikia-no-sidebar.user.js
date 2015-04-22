// ==UserScript==
// @namespace http://mrob.com/time/scripts-beta
// @name wikia-no-sidebar
// @description Remove sidebar in Wikia pages
// @author Robert Munafo
// @version 11951.41
// @downloadURL http://mrob.com/time/scripts-beta/wikia-no-sidebar.user.js
// @include http://*.wikia.com/*
// @include https://*.wikia.com/*
// @match http://*.wikia.com/*
// @match https://*.wikia.com/*
// ==/UserScript==

// REVISION HISTORY:
//
// np11951.41 First version (based on facebok-no-sidebar)

var ttd;
var del;

wiknosb = {

  // I'd like to know about cross-browser support for console.log(). Until
  // then, this is my replacement.
  //
  log: function (msg) {
    setTimeout(function() {
      throw new Error(msg);
    }, 0);
  },

  convert: function() {
    var sidebar = document.getElementById("WikiaMainContentContainer");
    if (sidebar) { sidebar.style.marginRight="0px"; }

    sidebar = document.getElementById('WikiaRail');
    if(sidebar) { sidebar.style.display="none"; }

    // Run myself again a couple more times. Eyal Shahar's version just
    // runs one more time with an interval of 2000.
    if (ttd > 0) {
      recalc = 1;
      setTimeout(wiknosb.convert.bind(wiknosb), del);
      ttd -= 1;
      // Go to the next-higher delay interval
      if         (del <= 1011) { del = 9111;     }
      else if    (del <= 9111) { del = 100235;   }
      else if  (del <= 100235) { del = 1303071;  }
      else if (del <= 1303071) { del = 19546083; }
    }
  }
};

// Make it run itself a few more times, because I suspect that some
// Wikia JavaScript is putting the sidebar there after the 'load',
// 'onload', and 'DOMContentLoaded' events have all fired.
ttd = 3; del = 1011;

// 3 cases for cross-platform, cross-browser: not necessary for this
// application but I want this code to be useful elsewhere too!
if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', // was 'load',
    wiknosb.convert.bind(wiknosb), false);
} else if (window.attachEvent) {
  window.attachEvent('onload',
    wiknosb.convert.bind(wiknosb));
} else {
  wiknosb.convert(wiknosb);
};