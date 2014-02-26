// ==UserScript==
// @name newpix-converter for OTT
// @description Converts phpBB dates into the One Time Unit: the newpix. For this to work your date format must be: "D M d, Y g:i:s a e" without the quotes.
// @author Mrob27, Pikrass, and Smithers
// @version 8251.68
// @downloadURL http://mrob.com/time/scripts-beta/newpix-convertor.user.js
// @include http://forums.xkcd.com/viewtopic.php*
// @include http://fora.xkcd.com/viewtopic.php*
// @include http://echochamber.me/viewtopic.php*
// @include http://forums.xkcd.com/posting.php*
// @include http://fora.xkcd.com/posting.php*
// @include http://echochamber.me/posting.php*
// ==/UserScript==

// REVISION HISTORY
// np1050.12 Original version, posted in OTT:506:24|#p3345722
// np1050.78 Fix 'NaN.oo B.T.' which happened when date format was "D M d, Y g:i a e"
// np1814 Version that mrob27 used as the basis for this
//
// np4200 Display date as both Heretical and Newpix
// np7990.29 Color the 'Last edited by' various shades of pink/red based on how much time has passed between the original post and the most recent edit
// np8251.51 Add options checkboxes for 'keep heretical date' and 'color Last edited notices'
// np8251.68 Fix title of options <div>

newpixConverter = {
  // Change this according to your preference
  decimals: 2,

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
    chk.value = 'npcv-' + nam;
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

    var optstitle = document.createTextNode("Newpix-Convertor Options:");
    preDiv.appendChild(optstitle);

    var opts_div = document.createElement('div');
    opts_div.style.textAlign = 'left';

    // Make the checkbox for 'lavender background'
    opts_div.appendChild(document.createTextNode("　　"));
    this.make_checkbox('opt1', 'Keep Heretical Date', this.opt1, opts_div);

    // Make the checkbox for '> spURLer <' option
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('opt2', 'Color "Last edited" notices', this.opt2, opts_div);

    container.appendChild(preDiv);
    container.appendChild(opts_div);

    return(container);
  },

  getUtcOffset: function() {
    var offset = {np: 0, fnp: 0};
    var rights = document.getElementsByClassName('rightside');
    var text = rights[rights.length-1].innerHTML;

    var reg = /UTC (-|\+) (\d+)(?::(\d{2}))? hour/;
    var m = text.match(reg);
    if(m != null) {
      offset.np = (m[1] == '+' ? parseInt(m[2]) : -parseInt(m[2]));
      if(m[3] != undefined) {
        offset.fnp = (m[1] == '+' ? parseInt(m[3]) : -parseInt(m[3]));
      }
    }

    if(text.indexOf('DST') != -1) {
      offset.np++;
    }

    return offset;
  },

  dateToNewpix: function(date) {
    var oneTrueBeginningOfTime = new Date('Mon Mar 25, 2013 4:00 am UTC');
    var np = (date - oneTrueBeginningOfTime) / 1800000;

    // Old newpix -> new newpix
    if(np >= 240) {
      np = 240 + (np - 240)/2;
    }

    if(np >= 0) {
      return np + 1;
    } else {
      return np - 1;
    }
  },

  hereticToNewpix: function(hereticString) {
    var hereticDate = new Date(hereticString);
    var off = this.getUtcOffset();
    hereticDate.setHours(hereticDate.getHours() - off.np);
    hereticDate.setMinutes(hereticDate.getMinutes() - off.fnp);

    var realDate = this.dateToNewpix(hereticDate);
    return realDate;
  },

  npToString: function(np) {
    var str = np.toString();

    var dot = str.indexOf('.');
    var dec;
    if(dot == -1) {
      str += '.';
      dec = 0;
    } else {
      dec = str.length - dot - 1;
    }

    while(dec < this.decimals) {
      str += '0';
      dec++;
    }
    str = str.substr(0, str.length - (dec - this.decimals));

    return str;
  },

  NewpixToString: function(realDate) {
    if (realDate >= 0) {
      return 'newpix ' + this.npToString(realDate);
    } else {
      return 'newpix ' + this.npToString(-realDate) + ' B.T.';
    }
  },

  convert: function() {
    // Check if we're on the One True Thread
    if (location.href.indexOf('t=101043') == -1) return;
    // if (document.title.indexOf('1190') == -1)  return;

    // Initialize options, create the checkboxes.
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

    var footer = document.getElementById("page-footer");
    var ft_par = footer.parentNode;
    ft_par.insertBefore(this.create_checkboxen(), footer);

    var i, j, npd;
    var newpix_dates = new Array();
    var postnodes = new Array();
 
    // Convert original post times.
    var authors = document.getElementsByClassName('author');
    for (i = 0; i < authors.length; i++) {
      npd = this.hereticToNewpix(authors[i].lastChild.data.substr(3));
      if (this.opt1.val == 0) {
        authors[i].lastChild.data = ' ';
      } else {
        authors[i].lastChild.data += ' = ';
      };
      authors[i].lastChild.data += this.NewpixToString(npd);
      newpix_dates[i] = npd;
      postnodes[i] = authors[i].parentNode;
    }

    // Convert "last edited" times.
    var edits = document.getElementsByClassName('notice');
    for (i = 0; i < edits.length; i++) {
      var str = edits[i].lastChild.data;
      var edpar = edits[i].parentNode;
      var comma = str.lastIndexOf(',');
      npd = this.hereticToNewpix(str.substr(4, comma-4));
      edits[i].lastChild.data = ' at ';
      if (this.opt1.val) {
        edits[i].lastChild.data += (str.substr(4, comma-4) + ' = ');
      };
      edits[i].lastChild.data += (this.NewpixToString(npd) + str.substr(comma));
      if (this.opt2.val) {
        // Change the color of the edited message based on how much later
        // it was edited.
        for(j=0; j<postnodes.length; j++) {
          if (postnodes[j] == edpar) {
            var diff = npd - newpix_dates[j];
            if (diff < 1.0) {
              edits[i].style.backgroundColor = '#ECC';
            } else if (diff < 24.0) {
              edits[i].style.backgroundColor = '#FBB';
            } else {
              edits[i].style.backgroundColor = '#FAA';
            }
          }
        }
      }
    }

    // Convert joined dates.
    var profiles = document.getElementsByClassName('postprofile');
    for (i = 0; i < profiles.length; i++) {
      for (j = 0; j < profiles[i].childNodes.length; j++) {
        var node = profiles[i].childNodes[j];
        if (node.localName == 'dd'
           && node.firstChild.outerHTML == '<strong>Joined:</strong>')
        {
          npd = this.hereticToNewpix(node.lastChild.data.substr(1));
          node.lastChild.data = ' ' + this.NewpixToString(npd);
          break;
        }
      }
    }
  },

};

window.addEventListener('DOMContentLoaded',
  newpixConverter.convert.bind(newpixConverter));
