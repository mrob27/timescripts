// ==UserScript==
// @namespace mrob.com
// @name No Tinytext
// @description Locate tinytext and make it readable
// @author Robert Munafo
// @version 5971.34
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
// np5971.34 Add a button at the top of the page that toggles the "reveal
//   light text" functionality.

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


// A sample post containing font colours deliberately set to be as unreadable
// as possible:
//
//    forums.xkcd.com/viewtopic.php?p=3340789#p3340789
//
// Regardless of the HTML, the color will appear to us as a string in
// the syntax 'rgb(123, 234, 210)' or possibly '#80BFFF'

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

  findAncestorById: function(elem, idName) {
    this.log('fABC ' + elem.id);
    if(new RegExp('\\b'+idName+'\\b').test(elem.id))
      return elem;
    else {
      if(elem != document.body)
        return this.findAncestorById(elem.parentNode, idName);
      return null;
    }
  },
  
  // Set button title based on value of an option.
  setButTitle: function(but, val) {
    if (val == 0) {
      but.value = 'Reveal Light Text';
    } else {
      but.value = 'Stop Revealing Light Text';
    }
  },

  /* addReply will set or clear an option. */
  addReply: function(but, val) {
    if(typeof this.opt1 == 'undefined') {
      this.opt1 = 0; // This is *absolutely* thread-safe :D
    }
    
    // this.opt1 = val; // set value
    // no, toggle it instead
    if (this.opt1 == 0) {
      this.opt1 = 1;
    } else {
      this.opt1 = 0;
    }
    
    this.setButTitle(but, this.opt1);
    but.disabled = false;
    
    /* Save the user's work in a way that will persist across page loads.
		 * see http://wiki.greasespot.net/GM_setValue */
    GM_setValue('opt1', JSON.stringify(this.opt1));
  },
  
  /* makeReplyArea will add a checkbox that changes an option */
  makeReplyArea: function(pagebody) {
    var container = document.createElement('div');
    
    var preDiv = document.createElement('div');
    preDiv.appendChild(document.createTextNode("mrob27's options:"));
    preDiv.style.marginTop = '10px';
    preDiv.style.fontSize = '1.3em';
    
    var butDiv = document.createElement('div');
    butDiv.style.textAlign = 'center';
    var but = document.createElement('input');
    but.type = 'button';
    but.value = 'temp-opt1';
    this.setButTitle(but, this.opt1);
    but.style.fontWeight = 'bold';
    but.addEventListener('click', this.addReply.bind(this, but, 2));
    butDiv.appendChild(but);
    
    container.appendChild(preDiv);
    container.appendChild(butDiv);
    
    // pagebody.appendChild(container);
    pagebody.insertBefore(container, pagebody.firstChild);
  },

  convert: function() {
    var spans = document.getElementsByTagName('span');
    var i; var sz;

    this.opt1 = JSON.parse(GM_getValue('opt1', '0'));
        
    // Create the options button.
    var popes = document.getElementsByClassName('first');
    var pope = popes[0];
    this.log('got pope: ' + pope);
    if (pope) {
      var pagebody = this.findAncestorById(pope, 'page-body');
      this.log('got pagebody: ' + pagebody);
      if (pagebody) {
        this.makeReplyArea(pagebody);
      }
    }

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

      if (this.opt1) {
        // Fix text that has a very light colour by changing the
        // background to black
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
