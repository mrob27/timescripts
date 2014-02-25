// ==UserScript==
// @namespace mrob.com
// @name no-tinytext for OTT
// @description Locate tiny and/or pale-colored text and make it readable
// @author Robert Munafo (with help from azule)
// @version 8207.75
// @downloadURL http://mrob.com/time/scripts-beta/no-tinytext.user.js
// @include http://forums.xkcd.com/viewtopic.php*
// @include http://fora.xkcd.com/viewtopic.php*
// @include http://echochamber.me/viewtopic.php*
// @include http://forums.xkcd.com/posting.php*
// @include http://fora.xkcd.com/posting.php*
// @include http://echochamber.me/posting.php*
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
// np5979.01 Change the button to a checkbox.
// np5991.71 Refactor code to pass an object pointer into the action function
//   (which should make it easier to add more options)
// np5993.10 Add second checkbox controlling the 'embiggen tinytext' action
// np5993.54 Add third checkbox and azule's "red outline with titletext"
//   method for tinytext
// np6011.51 Add an Azule-like highlighting option for light-colored text.
// np6294.73 The smallest sizes are still a bit too small for my liking.
// np6317.70 Start at size 8 instead of size 9
// np7611.06 Recognize colors 'white' and e.g. '#BFC'
// np8162.47 Place checkboxes above the page-footer, rather than below the pope's
//   parent node
// np8207.75 Add make_checkbox function; remove console.info calls

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
// And another with a gradation from white to gray:
//
//    forums.xkcd.com/viewtopic.php?p=3341004#p3341004
//
// Regardless of the HTML, the color will appear to us as a string in
// the syntax 'rgb(123, 234, 210)' or possibly '#80BFFF'

// This matches e.g. 'rgb(123, 234, 210)'
var pc1 = new
   RegExp('rgb\\([12][0-9][0-9], [12][0-9][0-9], [12][0-9][0-9]\\)');
// This matches the same thing but savee the three numbers, for use
// with .match()
var pc2 = new
   RegExp('rgb\\(([12][0-9][0-9]), ([12][0-9][0-9]), ([12][0-9][0-9])\\)');
// This matches e.g. '#BFFFFF' (best friends forever!)
var pc3 = new RegExp('\#[A-F][0-9A-F][A-F][0-9A-F][A-F][0-9A-F]');
var pc4 = new RegExp('\#[A-F][A-F][A-F]');
var pc5 = new RegExp('white');

// Maximum brightness we'll accept
var gthres = 190;

notinytext = {

  findAncestorById: function(elem, idName) {
    if(new RegExp('\\b'+idName+'\\b').test(elem.id))
      return elem;
    else {
      if(elem != document.body)
        return this.findAncestorById(elem.parentNode, idName);
      return null;
    }
  },

  // Set a checkbox to be on or off
  setChkVal: function(chk, val) {
    if (val == 0) {
      chk.checked=false;
    } else {
      chk.checked=true;
    }
  },

  /* opt_action will set or clear an option. */
  opt_action: function(chk, optobj, nam) {
    // If the option was just initialized, it will now become set.
    // This makes sense becuse if they've just installed the script
    // and click on the checkbox, they want to set the checkbox.

    if (optobj.val == 0) {
      optobj.val = 1;
    } else {
      optobj.val = 0;
    }
    
    this.setChkVal(chk, optobj.val);
    chk.disabled = false;
    
    /* Save the user's work in a way that will persist across page loads.
     * see http://wiki.greasespot.net/GM_setValue */
    GM_setValue(nam, JSON.stringify(optobj.val));
  },

  make_checkbox: function(nam, title, optobj, pdiv) {
    // Make the checkbox for 'reveal light text'
    var chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.value = 'temp-' + nam;
    chk.id = nam;

    var lbl = document.createElement('label')
    lbl.htmlFor = nam;
    var lab_text = document.createTextNode(title);
    lbl.appendChild(lab_text);

    this.setChkVal(chk, optobj.val);
    chk.addEventListener('click',
                              this.opt_action.bind(this, chk, optobj, nam));
    pdiv.appendChild(chk); pdiv.appendChild(lbl);
  },

  /* create_checkboxen will add a checkbox that changes an option */
  create_checkboxen: function() {
    var container = document.createElement('div');

    var preDiv = document.createElement('div');
    preDiv.style.marginTop = '1px';
    preDiv.style.fontSize = '1.0em';
    preDiv.style.fontWeight = 'bold';
    preDiv.style.color = '#0B7';
    
    var optstitle = document.createTextNode("Blitzenhelfern by Mrob27:");
    preDiv.appendChild(optstitle);

    var opts_div = document.createElement('div');
    opts_div.style.textAlign = 'left';

    // Make the checkbox for 'reveal light text'
    opts_div.appendChild(document.createTextNode("　　")); // CJK space, for indentation
    this.make_checkbox('opt1', 'Reveal Light Text', this.opt1, opts_div);

    // Make the checkbox for 'highlight light text'
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('opt4', 'Highlight Light Text', this.opt4, opts_div);

    // Make the checkbox for 'embiggen tiny text'
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('opt2', 'Embiggen TinyText', this.opt2, opts_div);

    // Make the checkbox for 'highlight tiny text'
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('opt3', 'Highlight TinyText', this.opt3, opts_div);

    container.appendChild(preDiv);
    container.appendChild(opts_div);

    return(container);
  },

  convert: function() {
    var spans = document.getElementsByTagName('span');
    var i; var so; var sz;

    this.opt1 = { val: JSON.parse(GM_getValue('opt1', '0')) }; 
    if (typeof this.opt1 == 'undefined') {
      this.opt1 = { val: "0" }; 
      this.opt1.val = JSON.parse(GM_getValue('opt1', '0'));
    };

    this.opt2 = { val: JSON.parse(GM_getValue('opt2', '0')) }; 
    if (typeof this.opt2 == 'undefined') {
      this.opt2 = { val: "0" };
      this.opt2.val = JSON.parse(GM_getValue('opt2', '0'));
    };

    this.opt3 = { val: JSON.parse(GM_getValue('opt3', '0')) }; 
    if (typeof this.opt3 == 'undefined') {
      this.opt3 = { val: "0" };
      this.opt3.val = JSON.parse(GM_getValue('opt3', '0'));
    };

    this.opt4 = { val: JSON.parse(GM_getValue('opt4', '0')) }; 
    if (typeof this.opt4 == 'undefined') {
      this.opt4 = { val: "0" };
      this.opt4.val = JSON.parse(GM_getValue('opt4', '0'));
    };

    // Create the options checkboxes.
    var footer = document.getElementById("page-footer");
    var ft_par = footer.parentNode;
    ft_par.insertBefore(this.create_checkboxen(), footer);

    for(i=0 ; i<spans.length ; i++) {
      if (this.opt2.val || this.opt3.val) {
        if (pat3.test(spans[i].style.fontSize) )
        {
          // Get so (size original) by extracting the number before '%'
          so = pat4.exec(spans[i].style.fontSize);

          // mrob27's method of revealing tinytext: compute a new size
          // for the really small sizes.
          if (this.opt2.val) {
            sz = so;
            if (so < 100) {
              // 0->8, 50->10, 100->12
              sz = 8 + so/25;
            } else {
              // 100->12, 150->17, 200->22
              sz = 2 + (so / 10);
            }
            spans[i].style.fontSize = sz + "px";
          };

          // np5993.51: azule's method of revealing tinytext
          if (this.opt3.val) {
            if (so < 20) {
              spans[i].style.outline = "1px dotted red";
            };
            if (so < 60) {
              spans[i].setAttribute('title', spans[i].textContent);
            };
          };
        }
      }

      if (this.opt1.val || this.opt4.val) {
        // Fix text that has a very light colour by changing the
        // background to black
        so = 0;
        if ( pc2.test(spans[i].style.color) )
        {
          if ((RegExp.$1 > gthres) && (RegExp.$2 > gthres)
           && (RegExp.$3 > gthres))
          {
            so = 1;
          }
        };
        // Test color again using '#80BFFF' syntax
        if ( pc3.test(spans[i].style.color) ) { so = 1; };
        if ( pc4.test(spans[i].style.color) ) { so = 1; };
        if ( pc5.test(spans[i].style.color) ) { so = 1; };
        if (so) {
          if (this.opt1.val) {
            spans[i].style.backgroundColor = '#000';
          } else {
            spans[i].style.outline = "1px dotted red";
            spans[i].setAttribute('title', spans[i].textContent);
          }
        }
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
