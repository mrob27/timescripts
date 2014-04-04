// ==UserScript==
// @name newpix-converter for OTT
// @description Converts phpBB dates into the One Time Unit: the newpix. For this to work your date format must be: "D M d, Y g:i:s a e" without the quotes.
// @author Mrob27, Pikrass, and Smithers
// @version 9117.43
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
// np8549.01 Go back to '1190' method of determining if we're in OTT
// np9035.92 Add option to act in all threads (OTTers sometimes post elesewhere)
// np9117.43 Use cross-platform functions to load and save options settings.

console.info("Newpix Converter: A 'GM_getValue is not supported' message following this one is benign and results from a runtime compatibility test.");

newpixConverter = {
  // Change this according to your preference
  decimals: 2,

  o_keep_heret  : { val: "0" },
  o_spurler     : { val: "0" },
  o_all_threads : { val: "0" },


  /* Chrome provides a bogus nonfunctional GM_getValue function,
     so we have to do this stupid two-step test */
  isGM: ((typeof GM_getValue != 'undefined')
         && (typeof GM_getValue('a', 'b') != 'undefined')),

  /* Use this instead of GM_getValue */
  vget: function(key, def) {
    var rv;
    if (this.isGM) {
      rv = GM_getValue(key, def);
    } else {
      rv = localStorage[key];
    }
    if (typeof rv === "undefined") {
      rv = def;
    }
    return rv;
  },

  /* Use this instead of GM_setValue */
  vstr: function(key, val) {
    if (this.isGM) {
      GM_setValue(key, val);
    } else {
      localStorage[key] = val;
    }
  },

  /* Use this instead of JSON.stringify */
  jsenc: function(obj) {
    if (typeof obj === "undefined") {
      return "";
    }
    try {
      return JSON.stringify(obj);
    } catch(e) {
      return JSON.encode(obj);
    }
  },

  /* Use this instead of JSON.parse */
  jsdec: function(str) {
    if (typeof str === "undefined") {
      return 0;
    }
    try {
      return JSON.parse(str);
    } catch(e) {
      return JSON.decode(str);
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
    this.vstr(nam, this.jsenc(optobj.val));
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

    // Make the checkbox for 'Keep Heretical Date'
    opts_div.appendChild(document.createTextNode("　　"));
    this.make_checkbox('o_keep_heret', 'Keep Heretical Date',
      this.o_keep_heret, opts_div);

    // Make the checkbox for 'Color "last edited" Notices'
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('o_spurler', 'Color "Last edited" notices',
      this.o_spurler, opts_div);

    // Make the checkbox for 'Act on All Threads' option
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('o_all_threads', 'Act in All Threads',
      this.o_all_threads, opts_div);

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
    // Initialize options, create the checkboxes.
    this.o_keep_heret = { val: this.jsdec(this.vget('o_keep_heret', '0')) };
    if (typeof this.o_keep_heret == 'undefined') {
      this.o_keep_heret = { val: "0" };
      this.o_keep_heret.val = this.jsdec(this.vget('o_keep_heret', '0'));
    };

    this.o_spurler = { val: this.jsdec(this.vget('o_spurler', '0')) };
    if (typeof this.o_spurler == 'undefined') {
      this.o_spurler = { val: "0" };
      this.o_spurler.val = this.jsdec(this.vget('o_spurler', '0'));
    };

    this.o_all_threads = {val: this.jsdec(this.vget('o_all_threads', '0')) };
    if (typeof this.o_all_threads == 'undefined') {
      this.o_all_threads = { val: "0" };
      this.o_all_threads.val = this.jsdec(this.vget('o_all_threads', '0'));
    };

    var footer = document.getElementById("page-footer");
    var ft_par = footer.parentNode;
    ft_par.insertBefore(this.create_checkboxen(), footer);

    // Check if we're on the One True Thread or if the act on all threads
    // option is selected.
    if (this.o_all_threads.val == 0) {
      if ( (location.href.indexOf('t=101043') == -1)
        && (document.title.indexOf('1190') == -1) )  return;
    }

    var i, j, npd;
    var newpix_dates = new Array();
    var postnodes = new Array();
 
    // Convert original post times.
    var authors = document.getElementsByClassName('author');
    for (i = 0; i < authors.length; i++) {
      npd = this.hereticToNewpix(authors[i].lastChild.data.substr(3));
      if (this.o_keep_heret.val == 0) {
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
      if (this.o_keep_heret.val) {
        edits[i].lastChild.data += (str.substr(4, comma-4) + ' = ');
      };
      edits[i].lastChild.data += (this.NewpixToString(npd) + str.substr(comma));
      if (this.o_spurler.val) {
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
