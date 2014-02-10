// ==UserScript==
// @namespace mrob.com
// @name sig-contrast for OTT
// @description  Hides signatures and/or make them easily distinguishable
// @author Robert Munafo
// @version 7858.45
// @downloadURL http://mrob.com/time/scripts-beta/sig-contrast.user.js
// @include http://forums.xkcd.com/viewtopic.php*
// @include http://fora.xkcd.com/viewtopic.php*
// @include http://echochamber.me/viewtopic.php*
// @run-at     document-end
// @copyright  2014, Robert Munafo
// ==/UserScript==
//
// REVISION HISTORY:
// np7858.45 first version, based mainly on no-tinytext

sig_contrast = {

  findAncestorById: function(elem, idName) {
    //- console.info('fABC ' + elem.id);
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
      console.info('setting checkbox false');
    } else {
      chk.checked=true;
      console.info('setting checkbox true');
    }
  },

  /* opt_action will set or clear an option. */
  opt_action: function(chk, optobj, nam) {
    // If the option was just initialized, it will now become set.
    // This makes sense becuse if they've just installed the script
    // and click on the checkbox, they want to set the checkbox.
    console.info('foo1 ' + nam + ' val is ' + optobj.val);
    if (optobj.val == 0) {
      optobj.val = 1;
    } else {
      optobj.val = 0;
    }
    console.info('foo2 tog to ' + optobj.val);
    
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
    
    var optstitle = document.createTextNode("Signature display options by Mrob27:");
    preDiv.appendChild(optstitle);

    var opts_div = document.createElement('div');
    opts_div.style.textAlign = 'left';

    // Make the checkbox for 'Green background'
    var chk1 = document.createElement('input');
    chk1.type = 'checkbox';
    chk1.value = 'temp-opt1';
    chk1.id = 'opt1';

    var lbl1 = document.createElement('label')
    lbl1.htmlFor = "opt1";
    var lab_text = document.createTextNode('Green background');
    lbl1.appendChild(lab_text);

    this.setChkVal(chk1, this.opt1.val);
    chk1.addEventListener('click',
                this.opt_action.bind(this, chk1, this.opt1, 'opt1'));

    // Make the checkbox for 'Hidden'
    var chk2 = document.createElement('input');
    chk2.type = 'checkbox';
    chk2.value = 'temp-opt2';
    chk2.id = 'opt2';
    
    var lbl2 = document.createElement('label')
    lbl2.htmlFor = "opt2";
    var lab2_text = document.createTextNode('Hidden');
    lbl2.appendChild(lab2_text);
    
    this.setChkVal(chk2, this.opt2.val);
    chk2.addEventListener('click',
                this.opt_action.bind(this, chk2, this.opt2, 'opt2'));

    opts_div.appendChild(document.createTextNode("　　")); // CJK space, for indentation
    opts_div.appendChild(chk1); opts_div.appendChild(lbl1);
    opts_div.appendChild(document.createTextNode("　"));
    opts_div.appendChild(chk2); opts_div.appendChild(lbl2);

    container.appendChild(preDiv);
    container.appendChild(opts_div);

    // Put the options at the bottom of the page
    pagebody.appendChild(container);

    // This code puts the options at the top of the page
    // pagebody.insertBefore(container, pagebody.firstChild);
  },

  convert: function() {
    var spans = document.getElementsByTagName('span');
    var sigs = document.getElementsByClassName('signature');
    var i; var so; var sz;

    this.opt1 = { val: JSON.parse(GM_getValue('opt1', '0')) }; 
    if (typeof this.opt1 == 'undefined') {
      this.opt1 = { val: "0" }; 
      console.info('init this.obj1 to ' + JSON.stringify(this.opt1));
      this.opt1.val = JSON.parse(GM_getValue('opt1', '0'));
    };
    console.info('init2 opt1 val ' + this.opt1.val);

    this.opt2 = { val: JSON.parse(GM_getValue('opt2', '0')) }; 
    if (typeof this.opt2 == 'undefined') {
      this.opt2 = { val: "0" };
      console.info('init this.obj2 to ' + JSON.stringify(this.opt2));
      this.opt2.val = JSON.parse(GM_getValue('opt2', '0'));
    };
    console.info('init2 opt2 val ' + this.opt2.val);

    // Create the options checkboxes.
    var popes = document.getElementsByClassName('first');
    var pope = popes[0];
    console.info('got pope: ' + pope);
    if (pope) {
      var pagebody = this.findAncestorById(pope, 'page-body');
      console.info('got pagebody: ' + pagebody);
      if (pagebody) {
        this.create_checkboxen(pagebody);
      }
    }

    for(i=0 ; i<sigs.length ; i++) {
      if (this.opt1.val) {
        sigs[i].style.backgroundColor = '#CEC';
      }
      if (this.opt2.val) {
        sigs[i].style.display = 'none';
      }
    }
  }
};

// 3 cases for cross-platform, cross-browser: not necessary for this
// application but I want this code to be useful elsewhere too!
if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', // was 'load',
    sig_contrast.convert.bind(sig_contrast), false);
} else if (window.attachEvent) {
  window.attachEvent('onload',
    sig_contrast.convert.bind(sig_contrast));
} else {
  sig_contrast.convert(sig_contrast);
};
