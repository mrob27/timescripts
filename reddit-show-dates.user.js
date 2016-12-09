// ==UserScript==
// @namespace   http://mrob.com/time/scripts-beta
// @name        Show absolute dates and times on Reddit pages
// @description Shows absolute dates and times on each comment on a Reddit page
// @author      Robert Munafo
// @version     20161209.0300
// @downloadURL http://mrob.com/time/scripts-beta/reddit-show-dates.user.js.txt
// @include     https://reddit.com/*
// @include     https://m.reddit.com/*
// @include     https://www.reddit.com/*
// @match       https://reddit.com/*
// @match       https://m.reddit.com/*
// @match       https://www.reddit.com/*
// @grant       none
// ==/UserScript==

// REVISION HISTORY:
//
// 20141202.1808 First version.
// 20161031.0007 Set colours
// 20161203.2129 Add @match keywords and showDates2, try harder to make it run
// 20161209.0300 Add tagMobile

console.debug("foo2");

showDates = function (D, dbg_tag)
{
  console.debug('showDates ' + dbg_tag);
  var i, f, j, e;
  var tms = D.getElementsByTagName("time");
  var nt = tms.length;
  for (i=0; i<nt; i++) {
    if (tms[i].title) {
      tms[i].innerHTML = tms[i].title;
    }
  }
};

showDates2 = function (D, dbg_tag)
{
  var i, f, j, e;
  console.debug('showDates2 ' + dbg_tag);

  var l1 = D.getElementsByTagName("time");

  for (i=0; f=l1[i], f; ++i) {
    if (f.title !== "") {
      var x = D.createElement("div");
      x.innerHTML = f.title; // + ' ' + dbg_tag;
      x.style.color = "#000";
      x.style.background = "#FFF";
      f.parentNode.insertBefore(x, f.nextSibling);
    }
  }
};

// This reminds the user that if they're viewing Reddit's mobile site,
// absolute dates are impossible (the necessary info isn't available anywhere in
// the HTML transmitted to the browser)
tagMobile = function (D, dbg_tag)
{
  var i, f, j, e;
  console.debug('tagMobile');

  var l1 = D.getElementsByClassName("CommentHeader__timestamp");

  for (i=0; f=l1[i], f; ++i) {
    var x = D.createElement("div");
    x.innerHTML = dbg_tag;
    x.style.color = "#000";
    x.style.background = "#FFF";
    f.parentElement.insertBefore(x, f);
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

console.debug('foo3');

setTimeout(function() {
  tagMobile(document, "To see real dates, use www.reddit.com, not m.reddit.com");
}, 10000);

// setTimeout(function() {
//   showDates2(document, 'd');
// }, 10000);
