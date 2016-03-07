// ==UserScript==
// @namespace   http://mrob.com/time/scripts-beta
// @name        Show absolute dates and times on Reddit pages
// @description Shows absolute dates and times on each comment on a Reddit page
// @author      Robert Munafo
// @version     20141202.1808
// @downloadURL http://mrob.com/time/scripts-beta/reddit-show-dates.user.js.txt
// @include     https://reddit.com/*
// @include     https://www.reddit.com/*
// ==/UserScript==

// REVISION HISTORY:
//
// 20141202.1808 First version.

showDates = function (D)
{
  var i, f, j, e;
  var tms = D.getElementsByTagName("time");
  var nt = tms.length;
  for (i=0; i<nt; i++) {
    if (tms[i].title) {
      tms[i].innerHTML = tms[i].title;
    }
  }
};

showDates(document);
