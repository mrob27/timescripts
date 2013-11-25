// ==UserScript==
// @namespace mrob.com
// @name No Tinytext
// @description Locate tinytext and make it readable
// @author Robert Munafo (with help from azule)
// @version 6011.51
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

// Maximum brightness we'll accept
var gthres = 190;

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

  // Set a checkbox to be on or off
  setChkVal: function(chk, val) {
    if (val == 0) {
      chk.checked=false;
      this.log('setting checkbox false');
    } else {
      chk.checked=true;
      this.log('setting checkbox true');
    }
  },

  /* opt_action will set or clear an option. */
  opt_action: function(chk, optobj, nam) {
    // If the option was just initialized, it will now become set.
    // This makes sense becuse if they've just installed the script
    // and click on the checkbox, they want to set the checkbox.
    this.log('foo1 ' + nam + ' val is ' + optobj.val);
    if (optobj.val == 0) {
      optobj.val = 1;
    } else {
      optobj.val = 0;
    }
    this.log('foo2 tog to ' + optobj.val);
    
    this.setChkVal(chk, optobj.val);
    chk.disabled = false;
    
    /* Save the user's work in a way that will persist across page loads.
     * see http://wiki.greasespot.net/GM_setValue */
    GM_setValue(nam, JSON.stringify(optobj.val));
  },

  /* create_checkboxen will add a checkbox that changes an option */
  create_checkboxen: function(pagebody) {
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
    var chk1 = document.createElement('input');
    chk1.type = 'checkbox';
    chk1.value = 'temp-opt1';
    chk1.id = 'opt1';

    var lbl1 = document.createElement('label')
    lbl1.htmlFor = "opt1";
    var lab_text = document.createTextNode('Reveal Light Text');
    lbl1.appendChild(lab_text);

    this.setChkVal(chk1, this.opt1.val);
    chk1.addEventListener('click',
                this.opt_action.bind(this, chk1, this.opt1, 'opt1'));

    // Make the checkbox for 'highlight light text'
    var chk4 = document.createElement('input');
    chk4.type = 'checkbox';
    chk4.value = 'temp-opt4';
    chk4.id = 'opt4';
    var lbl4 = document.createElement('label')
    lbl4.htmlFor = "opt4";
    var lab_text = document.createTextNode('Highlight Light Text');
    lbl4.appendChild(lab_text);
    this.setChkVal(chk4, this.opt4.val);
    chk4.addEventListener('click',
                this.opt_action.bind(this, chk4, this.opt4, 'opt4'));

    // Make the checkbox for 'embiggen tiny text'
    var chk2 = document.createElement('input');
    chk2.type = 'checkbox';
    chk2.value = 'temp-opt2';
    chk2.id = 'opt2';
    
    var lbl2 = document.createElement('label')
    lbl2.htmlFor = "opt2";
    var lab2_text = document.createTextNode('Embiggen TinyText');
    lbl2.appendChild(lab2_text);
    
    this.setChkVal(chk2, this.opt2.val);
    chk2.addEventListener('click',
                this.opt_action.bind(this, chk2, this.opt2, 'opt2'));

    // Make the checkbox for 'highlight tiny text'
    var chk3 = document.createElement('input');
    chk3.type = 'checkbox';
    chk3.value = 'temp-opt3';
    chk3.id = 'opt3';
    
    var lbl3 = document.createElement('label')
    lbl3.htmlFor = "opt3";
    var lab3_text = document.createTextNode('Highlight TinyText');
    lbl3.appendChild(lab3_text);
    
    this.setChkVal(chk3, this.opt3.val);
    chk3.addEventListener('click',
                this.opt_action.bind(this, chk3, this.opt3, 'opt3'));

    opts_div.appendChild(document.createTextNode("　　")); // CJK space, for indentation
    opts_div.appendChild(chk1); opts_div.appendChild(lbl1);
    opts_div.appendChild(document.createTextNode("　"));
    opts_div.appendChild(chk4); opts_div.appendChild(lbl4);
    opts_div.appendChild(document.createTextNode("　"));
    opts_div.appendChild(chk2); opts_div.appendChild(lbl2);
    opts_div.appendChild(document.createTextNode("　"));
    opts_div.appendChild(chk3); opts_div.appendChild(lbl3);

    container.appendChild(preDiv);
    container.appendChild(opts_div);

    // Put the options at the bottom of the page
    pagebody.appendChild(container);

    // This code puts the options at the top of the page
    // pagebody.insertBefore(container, pagebody.firstChild);
  },

  convert: function() {
    var spans = document.getElementsByTagName('span');
    var i; var so; var sz;

    this.opt1 = { val: JSON.parse(GM_getValue('opt1', '0')) }; 
    this.log('init1 opt1 val ' + this.opt1.val);    
    if (typeof this.opt1 == 'undefined') {
      this.opt1 = { val: "0" }; 
      this.log('init this.obj1 to ' + JSON.stringify(this.opt1));
      this.opt1.val = JSON.parse(GM_getValue('opt1', '0'));
    };
    this.log('init2 opt1 val ' + this.opt1.val);

    this.opt2 = { val: JSON.parse(GM_getValue('opt2', '0')) }; 
    this.log('init1 opt2 val ' + this.opt2.val);
    if (typeof this.opt2 == 'undefined') {
      this.opt2 = { val: "0" };
      this.log('init this.obj2 to ' + JSON.stringify(this.opt2));
      this.opt2.val = JSON.parse(GM_getValue('opt2', '0'));
    };
    this.log('init2 opt2 val ' + this.opt2.val);

    this.opt3 = { val: JSON.parse(GM_getValue('opt3', '0')) }; 
    this.log('init1 opt3 val ' + this.opt3.val);
    if (typeof this.opt3 == 'undefined') {
      this.opt3 = { val: "0" };
      this.log('init this.obj3 to ' + JSON.stringify(this.opt3));
      this.opt3.val = JSON.parse(GM_getValue('opt3', '0'));
    };
    this.log('init2 opt3 val ' + this.opt3.val);

    this.opt4 = { val: JSON.parse(GM_getValue('opt4', '0')) }; 
    this.log('init1 opt4 val ' + this.opt4.val);
    if (typeof this.opt4 == 'undefined') {
      this.opt4 = { val: "0" };
      this.log('init this.obj4 to ' + JSON.stringify(this.opt4));
      this.opt4.val = JSON.parse(GM_getValue('opt4', '0'));
    };
    this.log('init2 opt4 val ' + this.opt4.val);

    // Create the options checkboxes.
    var popes = document.getElementsByClassName('first');
    var pope = popes[0];
    this.log('got pope: ' + pope);
    if (pope) {
      var pagebody = this.findAncestorById(pope, 'page-body');
      this.log('got pagebody: ' + pagebody);
      if (pagebody) {
        this.create_checkboxen(pagebody);
      }
    }

    //- this.log('convert started');
    for(i=0 ; i<spans.length ; i++) {
      //- this.log(i + ' ' + spans[i].style.fontSize
      //-            + ' ' + pat2.test(spans[i].style.fontSize));
      if (this.opt2.val || this.opt3.val) {
        if (pat3.test(spans[i].style.fontSize) )
        {
          // Get so (size original) by extracting the number before '%'
          so = pat4.exec(spans[i].style.fontSize);

          // mrob27's method of revealing tinytext: compute a new size
          // for the really small sizes.
          if (this.opt2.val) {
            sz = so;
            if (so < 50) {
              // 0->7, 25->8, 50->9
              sz = 7 + so/25;
            } else {
              // 50->9, 75->11.5, 100->14, 150->19, 200->24
              sz = 4 + (so / 10);
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
        if ( pc3.test(spans[i].style.color) )
        {
          so = 1;
        };
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
