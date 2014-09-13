// ==UserScript==
// @namespace http://mrob.com/time/scripts-beta
// @name sig-contrast for OTT
// @description  Hides signatures and/or make them easily distinguishable
// @author Robert Munafo
// @version 10966.67
// @downloadURL http://mrob.com/time/scripts-beta/sig-contrast.user.js
// @include http://forums.xkcd.com/viewtopic.php*
// @include http://fora.xkcd.com/viewtopic.php*
// @include http://echochamber.me/viewtopic.php*
// @include http://1190.bicyclesonthemoon.dnsd.info/ott/view*
// @run-at     document-end
// @copyright  2014, Robert Munafo
// ==/UserScript==
//
// REVISION HISTORY:
// np7858.45 first version, based mainly on no-tinytext
// np8162.47 Place checkboxes below the 'WHO IS ONLINE' bit
// np8270.66 Change title of one option
// np10078.16 Remove some console.info statements.
// np10966.67: Work on the balthamirror (1190.bicyclesonthemoon.dnsd.info)

sig_contrast = {

  findAncestorById: function(elem, idName) {
    if (new RegExp('\\b'+idName+'\\b').test(elem.id)) {
      return elem;
    } else {
      if(elem != document.body)
        return this.findAncestorById(elem.parentNode, idName);
      return null;
    }
  },

  // Set a checkbox to be on or off
  setChkVal: function(chk, val) {
    chk.checked = (val != 0);
  },

  /* opt_action will set or clear an option. */
  opt_action: function(chk, optobj, nam) {
    // If the option was just initialized, it will now become set.
    // This makes sense becuse if they've just installed the script
    // and click on the checkbox, they want to set the checkbox.
    optobj.val = (optobj.val == 0) ? 1 : 0;
    
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
    chk.value = 'sigo-' + nam;
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
    
    var optstitle = document.createTextNode("Signature display options by Mrob27:");
    preDiv.appendChild(optstitle);

    var opts_div = document.createElement('div');
    opts_div.style.textAlign = 'left';

    // Make the checkbox for 'Green background'
    opts_div.appendChild(document.createTextNode("　　"));
    this.make_checkbox('o_green_bkg', 'Green background', this.o_green_bkg, opts_div);

    // Make the checkbox for 'Hidden'
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('o_hide_sigs', 'Hide Signatures', this.o_hide_sigs, opts_div);

    container.appendChild(preDiv);
    container.appendChild(opts_div);

    return(container);
  },

  convert: function() {
    var spans = document.getElementsByTagName('span');
    var sigs = document.getElementsByClassName('signature');
    var i; var so; var sz;

    this.o_green_bkg = { val: JSON.parse(GM_getValue('o_green_bkg', '0')) }; 
    if (typeof this.o_green_bkg == 'undefined') {
      this.o_green_bkg = { val: "0" }; 
      this.o_green_bkg.val = JSON.parse(GM_getValue('o_green_bkg', '0'));
    };

    this.o_hide_sigs = { val: JSON.parse(GM_getValue('o_hide_sigs', '0')) }; 
    if (typeof this.o_hide_sigs == 'undefined') {
      this.o_hide_sigs = { val: "0" };
      this.o_hide_sigs.val = JSON.parse(GM_getValue('o_hide_sigs', '0'));
    };

    // Create the options checkboxes.
    var footer = document.getElementById("page-footer");
    var ft_par = footer.parentNode;
    ft_par.insertBefore(this.create_checkboxen(), footer);

    for(i=0 ; i<sigs.length ; i++) {
      if (this.o_green_bkg.val) {
        sigs[i].style.backgroundColor = '#CEC';
      }
      if (this.o_hide_sigs.val) {
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
