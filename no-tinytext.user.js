// ==UserScript==
// @namespace    http://mrob.com/time/scripts-beta
// @name         no-tinytext for OTT
// @description  Locate tiny and/or pale-colored text and make it readable
// @author       Robert Munafo (with help from azule and balthasar_s)
// @version      13095.60
// @downloadURL  http://mrob.com/time/scripts-beta/no-tinytext.user.js
// @include      http://forums.xkcd.com/*
// @include      http://www.forums.xkcd.com/*
// @include      http://fora.xkcd.com/*
// @include      http://echochamber.me/*
// @include      http://1190.bicyclesonthemoon.dnsd.info/ott/view*
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
// np8162.47 Place checkboxes above the page-footer, rather than below the
//   pope's parent node
// np8207.75 Add make_checkbox function; remove console.info calls
// np10050.10 Convert newlines to spaces for alt-text. increase size limit from
//   59 to 65.
// np10051.18 Rename the opts variables.
// np10068.40 Convert <br> to space plus \n, which makes better-looking alt
//   text (but probably only in some browsers)
// np10197.50 Add getInnerText()
// np10966.67: Work on the balthamirror (1190.bicyclesonthemoon.dnsd.info)
// np13032.30: Work on www.forums.xkcd.com
// np13095.60: Broaden the match patterns so it works in PMs

// A sample forum post containing a variety of sizes, including Vytron's
// nested super-size hack, is here:
//
//   fora.xkcd.com/viewtopic.php?p=3448128#p3448128
//
// In the HTML served up by echochamber, tinytext appears within items like:
//
// <span style="font-size: 20%; line-height: 116%;">
//   This would normally be way too small to read
// </span>
//
// I have trouble reading sizes below about 50%.
//
// Here is a post that has a series of lines (footnotes) in a small size:
//
//   fora.xkcd.com/viewtopic.php?p=3342149#p3342149
//
// It is useful for testing anything that deals with multiple lines inside a
// single [size] tag, such as the getInnerText() function that creates
// the title text.
//
// Here is another that has a spoiler inside white text. We currently do not
// handle it properly, only part of the text is noticed and changed.
//
//   fora.xkcd.com/viewtopic.php?p=3465549#p3465549
//
var pat1 = new RegExp('^[0-9]\%$');   // Match '0%' through '9%'
var pat2 = new RegExp('^[0-5][0-9]\%$');   // Match '00%' through '59%'
var pat3 = new RegExp('^[0-9]+\%$');   // Match any number followed by '%'
var pat4 = new RegExp('^[0-9]+');   // Match just a number at the beginning


// A sample post containing font colours deliberately set to be as unreadable
// as possible:
//
//    fora.xkcd.com/viewtopic.php?p=3340789#p3340789
//
// And another with a gradation from white to gray:
//
//    fora.xkcd.com/viewtopic.php?p=3341004#p3341004
//
// Regardless of the HTML, the color will appear to us as a string in
// the syntax 'rgb(123, 234, 210)' or possibly '#80BFFF'

// This matches e.g. 'rgb(123, 234, 210)'
var pc1 = new
   RegExp('rgb\\([12][0-9][0-9], [12][0-9][0-9], [12][0-9][0-9]\\)');
// This matches the same thing but saves the three numbers, for use
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
  /* <br> and <br /> are ignored in alt-text. This causes connecting
   * the last word in a line with the first word in the next one. We
   * don't want this, so we convert <br> to a space plus a newline. */
  getInnerText: function(elem)
  {
    var text = elem.innerHTML
                  .replace(/<br\s*\/?>/gi,"\n")  // <br>, <br/>, <br />
                  .replace(/(<([^>]+)>)/gi, ""); // <foo bar="baz">
    return text;

    /* Old version of getInnerText, using a more roundabout method but
     * not dependent on regexps.
     *
     * We temporarily change the contents (via its innerHTML property)
     * then get it in text format via the textContent property; then
     * we restore the original unaltered html. */
    // console.info("e.ih == '" + elem.innerHTML + "'");
    // ihtml = elem.innerHTML;
    // elem.innerHTML = ihtml.replace(/<br\s*\/?>/g, ' \n');
    // var text = elem.textContent;
    // elem.innerHTML = ihtml;
    // return text;
  },

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
    chk.value = 'nott-' + nam;
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
    this.make_checkbox('o_reveal_light', 'Reveal Light Text', this.o_reveal_light, opts_div);

    // Make the checkbox for 'highlight light text'
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('o_hgl_light', 'Highlight Light Text', this.o_hgl_light, opts_div);

    // Make the checkbox for 'embiggen tiny text'
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('o_embiggen', 'Embiggen TinyText', this.o_embiggen, opts_div);

    // Make the checkbox for 'highlight tiny text'
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('o_hgl_tiny', 'Highlight TinyText', this.o_hgl_tiny, opts_div);

    container.appendChild(preDiv);
    container.appendChild(opts_div);

    return(container);
  },

  convert: function() {
    var spans = document.getElementsByTagName('span');
    var i; var so; var sz;

    this.o_reveal_light = { val: JSON.parse(GM_getValue('o_reveal_light', '0')) }; 
    if (typeof this.o_reveal_light == 'undefined') {
      this.o_reveal_light = { val: "0" }; 
      this.o_reveal_light.val = JSON.parse(GM_getValue('o_reveal_light', '0'));
    };

    this.o_embiggen = { val: JSON.parse(GM_getValue('o_embiggen', '0')) }; 
    if (typeof this.o_embiggen == 'undefined') {
      this.o_embiggen = { val: "0" };
      this.o_embiggen.val = JSON.parse(GM_getValue('o_embiggen', '0'));
    };

    this.o_hgl_tiny = { val: JSON.parse(GM_getValue('o_hgl_tiny', '0')) }; 
    if (typeof this.o_hgl_tiny == 'undefined') {
      this.o_hgl_tiny = { val: "0" };
      this.o_hgl_tiny.val = JSON.parse(GM_getValue('o_hgl_tiny', '0'));
    };

    this.o_hgl_light = { val: JSON.parse(GM_getValue('o_hgl_light', '0')) }; 
    if (typeof this.o_hgl_light == 'undefined') {
      this.o_hgl_light = { val: "0" };
      this.o_hgl_light.val = JSON.parse(GM_getValue('o_hgl_light', '0'));
    };

    // Create the options checkboxes.
    var footer = document.getElementById("page-footer");
    var ft_par = footer.parentNode;
    ft_par.insertBefore(this.create_checkboxen(), footer);

    for(i=0 ; i<spans.length ; i++) {
      if (this.o_embiggen.val || this.o_hgl_tiny.val) {
        if (pat3.test(spans[i].style.fontSize) )
        {
          // Get so (size original) by extracting the number before '%'
          so = pat4.exec(spans[i].style.fontSize);

          // mrob27's method of revealing tinytext: compute a new size
          // for the really small sizes.
          if (this.o_embiggen.val) {
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
          if (this.o_hgl_tiny.val) {
            if (so < 20) {
              spans[i].style.outline = "1px dotted red";
            };
            // For some screens and eyes, size 65 and smaller is too small
            // to read, so we add titletext (also called "alt text" or
            // "hovertext")
            if (so <= 65) {
              spans[i].setAttribute('title', notinytext.getInnerText(spans[i]));
            };
          };
        }
      }

      if (this.o_reveal_light.val || this.o_hgl_light.val) {
        // Fix text that has a very light colour by changing the
        // background to black
        so = 0;
        if (spans[i].style.color === '') {
        } else if ( pc2.test(spans[i].style.color) ) {
          if ((RegExp.$1 > gthres) && (RegExp.$2 > gthres)
           && (RegExp.$3 > gthres))
          {
            so = 1;
          }
        // Test color again using '#80BFFF' syntax
        } else if ( pc3.test(spans[i].style.color) ) {
          so = 1;
        } else if ( pc4.test(spans[i].style.color) ) {
          so = 1;
        } else if ( pc5.test(spans[i].style.color) ) {
          so = 1;
        }
        if (so) {
          if (this.o_reveal_light.val) {
            spans[i].style.backgroundColor = '#000';
          } else {
            spans[i].style.outline = "1px dotted red";
          }
          spans[i].setAttribute('title', notinytext.getInnerText(spans[i]));
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
