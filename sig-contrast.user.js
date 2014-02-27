// ==UserScript==
// @namespace mrob.com
// @name sig-contrast for OTT
// @description  Hides signatures and/or make them easily distinguishable
// @author Robert Munafo
// @version 8270.66
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
// np8162.47 Place checkboxes below the 'WHO IS ONLINE' bit
// np8270.66 Change title of one option

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
    this.make_checkbox('opt1', 'Green background', this.opt1, opts_div);

    // Make the checkbox for 'Hidden'
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('opt2', 'Hide Signatures', this.opt2, opts_div);

    container.appendChild(preDiv);
    container.appendChild(opts_div);

    return(container);
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
    var footer = document.getElementById("page-footer");
    var ft_par = footer.parentNode;
    ft_par.insertBefore(this.create_checkboxen(), footer);

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
