// ==UserScript==
// @namespace mrob.com
// @name No Tinytext
// @description Locate tinytext and make it readable
// @author Robert Munafo
// @version 5949.74
// @downloadURL http://mrob.com/time/scripts-beta/no-tinytext.user.js
// @include http://forums.xkcd.com/viewtopic.php*
// @include http://fora.xkcd.com/viewtopic.php*
// @include http://forums.xkcd.com/posting.php*
// @include http://fora.xkcd.com/posting.php*
// ==/UserScript==

// REVISION HISTORY:
//
// np5831.xx alpha
// np5832.36 get it (mostly) working.
// np5848.50 more sophisticated size mapping, and defeat nested constructs
//   (innermost size is the one that will take effect)
// np5848.86 Add comment pointing to my sample post
// np5949.74 Detect and fix very light font colors by changing the background
//   to black.

// A sample forum post containing a variety of sizes, including Vytron's
// nested super-size hack, is here:
//
//   http://forums.xkcd.com/viewtopic.php?p=3448128#p3448128
//
// In the HTML served up by echochamber, tinytext appears within items like:
//
// <span style="font-size: 20%; line-height: 116%;">
//   This would normally be way too small to read
// </span>
//
// I have trouble reading sizes below about 50%.

var pat1 = new RegExp('^[0-9]\%$');   // Match '0%' through '9%'
var pat2 = new RegExp('^[0-5][0-9]\%$');   // Match '00%' through '59%'
var pat3 = new RegExp('^[0-9]+\%$');   // Match any number followed by '%'
var pat4 = new RegExp('^[0-9]+');   // Match just a number at the beginning

var pc1 = new RegExp('rgb\\([12][0-9][0-9], [12][0-9][0-9], [12][0-9][0-9]\\)'); // e.g. 'rgb(123, 234, 210)'
var pc2 = new RegExp('rgb\\(([12][0-9][0-9]), ([12][0-9][0-9]), ([12][0-9][0-9])\\)'); // for use with .match()
var gthres = 190;
var pc3 = new RegExp('\#[A-F][0-9A-F][A-F][0-9A-F][A-F][0-9A-F]'); // e.g. '#BFFFFF' (best friends forever!)

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
    var i; var sz;
    //- this.log('convert started');
    for(i=0 ; i<spans.length ; i++) {
      //- this.log(i + ' ' + spans[i].style.fontSize
      //-            + ' ' + pat2.test(spans[i].style.fontSize));
      if (pat3.test(spans[i].style.fontSize) )
      {
        // Extract the number before '%'
        sz = pat4.exec(spans[i].style.fontSize);
        if (sz < 50) {
          // 0->7, 25->8, 50->9
          sz = 7 + sz/25;
        } else {
          // 50->9, 75->11.5, 100->14, 150->19, 200->24
          sz = 4 + (sz / 10);
        }
        spans[i].style.fontSize = sz + "px";
      }

      // Fix text that has a very light colour by changing the background to black
      if ( pc2.test(spans[i].style.color) )
      {
        if ((RegExp.$1 > gthres) && (RegExp.$2 > gthres)
         && (RegExp.$3 > gthres))
        {
          spans[i].style.backgroundColor = '#000';
        }
        this.log(i + ' ' + spans[i].style.color);
      };
      // Test color again using '#80BFFF' syntax
      if ( pc3.test(spans[i].style.color) )
      {
        spans[i].style.backgroundColor = '#000';
        this.log(i + ' ' + spans[i].style.color);
      };
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
