// ==UserScript==
// @namespace   http://mrob.com/time/scripts-beta
// @name        Show absolute dates and times on Reddit pages
// @description Shows absolute dates and times on each comment on a Reddit page
// @author      Robert Munafo
// @version     20161031.0007
// @downloadURL http://mrob.com/time/scripts-beta/reddit-show-dates.user.js.txt
// @include     https://reddit.com/*
// @include     https://www.reddit.com/*
// @match       https://reddit.com/*
// @match       https://www.reddit.com/*
// @grant       none
// ==/UserScript==

// REVISION HISTORY:
//
// 20141202.1808 First version.
// 20161031.0007 Set colours
// 20161203.2129 Add @match keywords and showDates2, try harder to make it run

showDates = function (D)
{
  console.debug('showDates');
  var i, f, j, e;
  var tms = D.getElementsByTagName("time");
  var nt = tms.length;
  for (i=0; i<nt; i++) {
    if (tms[i].title) {
      tms[i].innerHTML = tms[i].title;
      tms[i].style.color = "#000";
      tms[i].style.background = "#FFF";
    }
  }
};

showDates2 = function (D, tag)
{
  var i, f, j, e;
  console.debug('showDates2');

  var l1 = D.getElementsByTagName("time");

  for (i=0; f=l1[i], f; ++i) {
    if (f.title !== "") {
      var x = D.createElement("div");
      x.innerHTML = f.title; // + ' ' + tag;
      x.style.color = "#000";
      x.style.background = "#FFF";
      f.parentNode.insertBefore(x, f.nextSibling);
    }
  }
};

// 3 cases for cross-platform, cross-browser: not necessary for this
// application but I want this code to be useful elsewhere too!
if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', // was 'load',
    showDates2(document, 'a'));
} else if (window.attachEvent) {
  window.attachEvent('onload',
    showDates2(document, 'b'));
} else {
  showDates2(document, 'c');
}

// setTimeout(function() {
//   showDates2(document, 'd');
// }, 10000);
