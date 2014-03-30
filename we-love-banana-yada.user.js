// ==UserScript==
// @namespace mrob.com
// @name We Love BANANA-Yada by mrob27 (with help from Eternal Density and words by BlitzGirl)
// @description Replaces the phrase "I love BANANAS" with lines from the first "Boom-de-Yada"
// @author Robert Munafo (inspired by Eternal Density and balthasar_s)
// @version 9007.05
// @downloadURL http://mrob.com/time/scripts-beta/we-love-banana-yada.user.js
// @match *://*/*
// @include http://forums.xkcd.com/viewtopic.php*
// @include http://fora.xkcd.com/viewtopic.php*
// @include http://echochamber.me/viewtopic.php*
// ==/UserScript==

// REVISION HISTORY:
//
// np8959.09: Copy from Eternal Density's version and add comments
// np8962.48: BANANAS->the One True Thread
// np8964.05: On the seaishly molpish suggestion of balthasar_s, replace successive lines with verses from the Boom-de-Yadas
// np8965.06: Fix description in header
// np8979.50: Add yadas[] object and setupmap()
// np8989.31: Update release to OTT: Now has 48 lines (both Boom-de-yadas) and JavaScript object structure (part of refactoring)
// np9007.05: Remove all the text-scanning; instead we now scan the DOM for profiles and insert a title before whatever title is there, if any. This change makes it work on HTML generated before the beginning of BananaMadness.

nanaParty = {
  incr : 0,
  NUM_LINES : 48,  // The first 48 array elements are the lines from the two Boom-de-Yadas by BlitzGirl

  opt1 : { val: "0" },
  opt2 : { val: "0" },

  yadas : {
  // We Love the Thread of Time ( OTT:464:10#p3342732 )
  //
  "- 1.00"     : "I love sandcastles",
  "Angelastic" : "I love our weird haiku",
  "Latent22"   : "I love the Book of Time",
  "Kieryn"     : "I love to chart all you",

  "cmyk"       : "I love the whole thread",
  "KarMann"    : "and all its hatted folks",
  "StratPlayer": "Boom de yada, boom de yada",
  "azule"      : "Boom de yada, boom de yada",

  "tman2nd"    : "I love sigcouragement",
  "- 1.09"     : "the semencoffeesea¹  (¹ BIG)",
  "mscha"      : "I love the newpixbot",
  "patzer"     :  "I love the wiki!",

  "Eternal Density" : "I love the whole thread",
  "Helper"     : "and all its mysteries",
  "ChronosDragon" : "Boom de yada, boom de yada",
  "macraw83"   : "Bboz dr yndn, bboz dr yndn",

  "- 1.16"     : "I love photo manips", // cmyk already has one
  "RobIrr"     : "I love our visitors",
  "buffygirl"  : "I love to make you hats!",
  "Dracomax"   : "I love inquisitors",

  "manvandmaan": "I love the whole thread",
  "BlitzGirl"  : "The Future's pretty cool!",
  "- 1.22"     : "Boom de yada, boom de yada",
  "- 1.23"     :  "Boom de yada, boom de yada",

  // We Love the Thread of Time, Too! ( OTT:707:34#p3365539 )
  //
  "- 2.00"     : "I love to journey",
  "- 2.01"     : "I love our beesnakes too",// azule already has one
  "edfel"      : "I love Time-mapping",
  "Valarya"    : "I love to cupcake you!",

  "- 2.04"     : "I love the whole thread",  // BlitzGirl already has one
  "- 2.05"     : "and all its footnote jokes",
  "HES"        : "Boom de yada, boom de yada",
  "Neil_Boekend" : "Boom de yada, boom de yada",

  "HAL9000"    : "I love newpages",
  "astrocub"   : "I love my flashy GIF",
  "spamjam"    : "I (might) love waffles...",
  "Pikrass"    : "I love to make you scripts",

  "Goggalor"   : "I love the whole Thread",
     "fhorn"   : "I love the whole Thread",
     "pelrigg" : "I love the whole Thread",
  "- 2.13"     : "And all its mysteries",
  "Sciscitor"  : "Boom de yada, boom de yada",
  "Earthling on Mars" : "Boom de yada, boom de yada",

  "jjjdavidson" : "I love D-Dactyls",
  "yappobiscuits" : "I love our blitzers",
  "- 2.18"     : "I love to molpy-hunt",  // mscha already has one
  "k.bookbinder" : "I love the whispers",

  "ucim"        : "I love the whole Thread",
  "Vytron"      : "The Future's pretty cool!",
  "- 2.22"      : "Boom de yada, boom de yada",
  "- 2.23"      : "ɐpɐʎ ǝp ɯooq 'ɐpɐʎ ǝp ɯooB",

  // I'm the author of this scriptmolpy, to I'll retcon myself in too
  "mrob27"      : "I love Time-Capsule-ing",

  // On NP1841 (newpix 8975.14) I solicited boom-de-yada lines from any
  // OTTers who wanted to be included
  "ergman"      : "I love spur of the Mome",  // NP1842
  "Exodies"     : "I love to misconstrue",    // by PM, newpix 8979
  "ggh"         : "I love the molpish vibes", // NP1841
  "NoMouse"     : "I love time machines!",    // by PM, newpix 8972
  "SilentTimer" : "I love Time After Time!",  // by PM, newpix 8980
  "taixzo"      : "I love to OTTify.",        // by PM, newpix 8974
  "Tatiana"     : "I love redundameowps",     // by PM, newpix 8982
  // ZoomanSP   : // Random by user request, NP1842

  "- end"       : ""
  },
    
  /* ix_uname can be used to turn an array index (a number from 0 to N-1)
   into one of the usernames that have a verse associated with it */
  ix_uname : [],
  nix : 0,
  keys: [],
    
  /* Fill in the ix_uname array */
  setupmap: function()
  {
    var i;
    for (var k in this.yadas) {
        this.keys.push(k);
        this.nix++;
    }
    for (i=0; i<this.nix; i++) {
      // console.info(i + " : '" + this.keys[i] + "' -> '"
      //   + this.yadas[this.keys[i]] + "'");
    }
  },

  nextline: function(sel)
  {
    var x, s;
    if (this.opt1.val == 0) {
      x = this.incr;
    } else {
      x = Math.floor(Math.random() * this.NUM_LINES);
    }
    this.incr = (this.incr+1) % this.NUM_LINES;
    s = '' +
      // x + ': ' + 
      this.yadas[this.keys[x]];
    return s;
  },

  banana_transform: function (str)
  {
    if (str == "I love BANANAS") {
      return (
        'banana' + this.incr + ": " + 
        this.nextline(0)
      );
    }
    return str;
  },

/*
For a user with a title (e.g. azule, SBN, and everybody during Mod
Madness 2014), the HTML looks like this:

  <dl class="postprofile" id="profile123">
 1  <dt>
      <a href="./memberlist.php?mode=viewprofile&u=123&sid=3e9a...">
        <img src="./download/file.php?avatar=123_136543210.jpg" width="128" height="135" alt="User avatar">
      </a>
      <br>
      <a href="./memberlist.php?mode=viewprofile&u=123&sid=3e9a=...">
        SBN
      </a>
    </dt>
 3  <dd>Saved</dd>
 5  <dd>&nbsp;</dd>
 7  <dd>
      <strong>Posts:</strong> 1272
    </dd>
    ...

For everybosy else, we get this:

  <dl class="postprofile" id="profile123">
 1  <dt>
      <a href="./memberlist.php?mode=viewprofile&u=456&sid=5aed...">
        <img src="./download/file.php?avatar=456_139543210.png" width="128" height="126" alt="User avatar">
      </a>
      <br>
      <a href="./memberlist.php?mode=viewprofile&u=456&sid=5aed...">
        BlitzGirl
      </a>
    </dt>
 3  <dd>&nbsp;</dd>
 5  <dd>
      <strong>Posts:</strong> 5474
    </dd>
    ...

The only difference is the addition of a "<dd>Title goes here</dd>" element
right after <dt> containing the avatar and username. It becomes child
3, replacing the '&nbsp;' that would normally be at that position.

*/

  // Scan the profiles, inserting (or changing) any found title.
  bananascanner: function() {
    var i, j, npd, node, s;
    
    // Scan profiles.
    var profiles = document.getElementsByClassName('postprofile');
    for (i = 0; i < profiles.length; i++) {
      node = profiles[i].childNodes[3];
      // console.info('i=' + i + ' j=' + 3 + ' ' + node.outerHTML);
      // console.info('     ' + node.localName);
      // console.info('     |' + node.innerHTML + '|');
      if (node.localName == 'dd') {
        s = node.innerHTML;
        if (s == 'I love BANANAS') {
          s = '';
        }
        s = ''
          // + i + ': '
          + this.nextline(i) + '<br />'
          + s
        ;
        node.innerHTML = s;
      }
      
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

    var optstitle = document.createTextNode("We-Love-BANA-na-Yada Options:");
    preDiv.appendChild(optstitle);

    var opts_div = document.createElement('div');
    opts_div.style.textAlign = 'left';

    // Make the checkbox for random verse selection
    opts_div.appendChild(document.createTextNode("　　"));
    this.make_checkbox('opt1', 'Randomize', this.opt1, opts_div);

    // Make the checkbox for [redacted]
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('opt2', 'Treeish', this.opt2, opts_div);

    container.appendChild(preDiv);
    container.appendChild(opts_div);

    return(container);
  },

  bananayada: function() {
    // Check if we're on the One True Thread
    // Commented-out because I like having the Boom-de-Yada verses as
    // a reminder of the OTT when I'm in other threads.
    // if ( (location.href.indexOf('t=101043') == -1)
    //   && (document.title.indexOf('1190') == -1) )  return;

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

    this.bananascanner();
  },

  xx_end : 0
};

nanaParty.setupmap();

window.addEventListener('DOMContentLoaded',
                        nanaParty.bananayada.bind(nanaParty));
