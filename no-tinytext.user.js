// ==UserScript==
// @namespace mrob.com
// @name No Tinytext
// @description Locate tinytext and make it readable
// @author Robert Munafo
// @version 5832.36
// @downloadURL http://mrob.com/time/scripts-beta/no-tinytext.user.js
// @include http://forums.xkcd.com/viewtopic.php*
// @include http://fora.xkcd.com/viewtopic.php*
// ==/UserScript==

// REVISION HISTORY:
//
// np5831.xx alpha
// np5832.36 get it (mostly) working.

// A sample forum page is:
//
//   http://forums.xkcd.com/viewtopic.php?f=7&t=101043&start=29360
//
// Tinytext appears within items like:
//
// <span style="font-size: 50%; line-height: 116%;">
//   edit: spoilered
// </span>

var pat1 = new RegExp('^[0-9]\%$');
var pat2 = new RegExp('^[0-5][0-9]\%$');

notinytext = {

  // I'd like to know about cross-browser support for console.log(). Until
  // then, this is my replacement.
  //
  log: function (msg) {
    setTimeout(function() {
      throw new Error(msg);
    }, 0);
  },

  convert: function() {
    var spans = document.getElementsByTagName('span');
    var i;
    //- this.log('convert started');
    for(i=0 ; i<spans.length ; i++) {
      //- this.log(i + ' ' + spans[i].style.fontSize
      //-            + ' ' + pat2.test(spans[i].style.fontSize));
      if (pat1.test(spans[i].style.fontSize)
        || pat2.test(spans[i].style.fontSize))
      {
        spans[i].style.fontSize = "60%";
      }
    }
  }
};

// 3 cases for cross-platform, cross-browser: not necessary for this
// application but I want this code to be useful elsewhere too!
if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', // was 'load',
    notinytext.convert.bind(notinytext), false);
} else if (window.attachEvent) {
  window.attachEvent('onload',
    notinytext.convert.bind(notinytext));
} else {
  notinytext.convert(notinytext);
};
