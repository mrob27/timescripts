// ==UserScript==
// @namespace   http://mrob.com/time/scripts-beta
// @name Show alt text on xkcd and What If pages
// @description Adds a text node below every image that has mouseover text.
// @author      Robert Munafo
// @version     31705.09
// @downloadURL http://mrob.com/time/scripts-beta/xkcd-show-alt-text.user.js.txt
// @include     http://xkcd.com/*
// @include     http://www.xkcd.com/*
// @include     http://what-if.xkcd.com/*
// @include     http://www.xkcd.net/*
// @include     https://xkcd.com/*
// @include     https://www.xkcd.com/*
// @include     https://what-if.xkcd.com/*
// @include     https://www.xkcd.net/*
// ==/UserScript==

// REVISION HISTORY:
//
// np11052.88: First version.
// np11618.09: Work on https URLs
// np11882.18: Add "www.xkcd.com"
// np15884.13: Add "www.xkcd.net"
// np26979.94: Add ", f" to prevent pedantic error message
// np31705.09: Eliminate initialisers in var declarations

showAltText = function (D)
{
  var i, f, j, e;

  for (i=0; f=D.images[i], f; ++i) {
    if (f.title !== "") {
      var x, s;
      x = D.createElement("div");
      s = x.style;
      s.color = "#008";
      s.background = "#FFC";
      x.innerHTML = f.title;
      f.parentNode.insertBefore(x, f.nextSibling);
    }
  }
};

showAltText(document);
