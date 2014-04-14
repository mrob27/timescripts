// ==UserScript==
// @namespace mrob.com
// @name We Love BANA-na-Yada for OTT
// @description Replaces the phrase "I love BANANAS" with lines from the first "Boom-de-Yada"
// @author Robert Munafo (words by BlitzGirl and OTTers; script inspired by Eternal Density and balthasar_s)
// @version 9361.14
// @downloadURL http://mrob.com/time/scripts-beta/we-love-banana-yada.user.js
// @include http://forums.xkcd.com/viewtopic.php*
// @include http://fora.xkcd.com/viewtopic.php*
// @include http://echochamber.me/viewtopic.php*
// ==/UserScript==

// To test on a local HTML file, add @match *://*/* above, then go into
// Chrome Settings > Extensions > Tampermonkey and check "Allow access to
// file URLs"

// REVISION HISTORY:
//
// np8959.09: Copy from Eternal Density's version and add comments
// np8962.48: BANANAS->the One True Thread
// np8964.05: On the seaishly molpish suggestion of balthasar_s, replace successive lines with verses from the Boom-de-Yadas
// np8965.06: Fix description in header
// np8979.50: Add yadas[] object and setupmap()
// np8989.31: Update release to OTT: Now has 48 lines (both Boom-de-yadas) and JavaScript object structure (part of refactoring)
// np9007.05: Remove all the text-scanning; instead we now scan the DOM for profiles and insert a title before whatever title is there, if any. This change makes it work on HTML generated before the beginning of BananaMadness.
// np9072.01: Move fhorn and pelrigg to the bottom of song 2 to preserve the sequence of the first 48 lines.
// np9095.72: Add functions vget, vstr, jse, jsd; and adapt the loading/storing of preferences to use these: it now works as a plain user script, and no longer requires being run within a GreaseMonkey environment.
// np9201.88: Implement "Use Usernames" and "BANANAS" options.
// np9224.91: Detect username when there is no avatar
// np9361.14: Add 'Post Numbers' option.

console.info("We Love BANA-na-Yada: A 'GM_getValue is not supported' message following this one is benign and results from a runtime compatibility test.");

nanaParty = {
  incr : 0,
  NUM_LINES : 48,  // The first 48 array elements are the lines from the two Boom-de-Yadas by BlitzGirl
  BANA_LINES : 24,

  o_randomize : { val: "0" },
  o_use_uname : { val: "0" },
  o_banana :    { val: "0" },
  o_numbers :   { val: "0" },

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
  "- 1.07"     : "Boom de yada, boom de yada",// azule's verse is at 2.01

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
  "azule"      : "I love our beesnakes too",
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

  "Goggalor"   : "I love the whole Thread", // fhorn and pelrigg too, they're below
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
  "charlie_grumbles" : "ɐpɐʎ ǝp ɯooq 'ɐpɐʎ ǝp ɯooB",

  // - - - - BEGINNING OF PERSONALIZED VERSES SECTION - - - -

  // Extra people for item 2.12
     "fhorn"   : "I love the whole Thread",
     "pelrigg" : "I love the whole Thread",


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

  // - - - - BANANA VERSES FROM FURIOUS DOODLING 2014 - - - -

  // We Love BANANAS, by BlitzGirl, NP1841
  "- 3.00"      : "I love BANANAS",
  "- 3.01"      : "I love banana peels",
  "- 3.02"      : "I love BANANAS",
  "- 3.03"      : "I love banana meals",

  "- 3.04"      : "I love the whole fruit",
  "- 3.05"      : "And when it's sliced in half",
  "- 3.06"      : "Doom ba Nana, Doom ba Nana",
  "- 3.07"      : "Doom ba Nana, Doom ba Nana",

  "- 3.08"      : "I love BANANAS",
  "- 3.09"      : "I love banana chips",
  "- 3.10"      : "I love BANANAS",
  "- 3.11"      : "And our banana scripts",

  "- 3.12"      : "I love the whole fruit",
  "- 3.13"      : "And all its mysteries",
  "- 3.14"      : "Doom ba Nana, Doom ba Nana",
  "- 3.15"      : "Doom ba Nana, Doom ba Nana",

  "- 3.16"      : "I love BANANAS",
  "- 3.17"      : "I love banana splits",
  "- 3.18"      : "I love BANANAS",
  "- 3.19"      : "I love banana blitz",

  "- 3.20"      : "I love the whole fruit",
  "- 3.21"      : "Banana's pretty cool!",
  "- 3.22"      : "Doom ba Nana, Doom ba Nana",
  "- 3.23"      : "Doom ba Nana, Doom ba Nana",

  "- end"       : ""
  },
    
  /* ix_uname can be used to turn an array index (a number from 0 to N-1)
   into one of the usernames that have a verse associated with it */
  ix_uname : [],
  nix : 0,
  keys: [],
  k_ix: [],
  
  /* Fill in the ix_uname array */
  setupmap: function()
  {
    var i;
    for (var k in this.yadas) {
        this.keys.push(k);
        this.k_ix[k] = this.nix;
        this.nix++;
    }
    for (i=0; i<this.nix; i++) {
      // console.info(i + " : '" + this.keys[i] + "' -> '"
      //   + this.yadas[this.keys[i]] + "'");
    }
  },

  verse_base: function()
  {
    if (this.o_banana.val) {
      return this.k_ix['- 3.00'];
    }
    return 0;
  },

  verse_size: function()
  {
    if (this.o_banana.val) {
      return this.BANA_LINES;
    }
    return this.NUM_LINES;
  },

  /* Return a random verse-line from either the standard verses
     or "We Love BANANAS" depending on the bananas option */
  randomyada: function()
  {
    var x, s;
    x = this.verse_base() + Math.floor(Math.random() * this.verse_size());
    s = this.yadas[this.keys[x]];
    return s;
  },

  /* Return the next verse in sequence, using either the standard verses
     or "We Love BANANAS" depending on the bananas option */
  nextline: function()
  {
    var x, s;
    x = this.verse_base() + this.incr;;
    this.incr = (this.incr+1) % this.verse_size();
    s = this.yadas[this.keys[x]];
    return s;
  },

  /* Given a post number (0 - 39) and a username, select a verse-line
     based on all three options. */
  select_line: function(n, uname) {
    var rv;
    if (this.o_use_uname.val) {
      // Choose a line based on user's name
      rv = this.yadas[uname];
      if (typeof rv === "undefined") {
        rv = // 'r1: ' + 
             this.randomyada();
      } else {
        // rv = 'u: ' + rv;
      }
    } else {
      if (this.o_randomize.val) {
        rv = // 'r2: ' +
             this.randomyada();
      } else {
        rv = // 's: ' +
             this.nextline();
      }
    }
    if (this.o_numbers.val) {
      rv = rv + ' (' + n + ')';
    }
    return rv;
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

To identify the username, we look inside that first element, the <dt>. Here
there are also two possibilities. Those above represent users with an avatar.
If the user does not have an avatar, the <dt> section looks like:

    <dt>
      <a href="./memberlist.php?mode=viewprofile&u=456&sid=5aed...">
        jimbobmacdoodle
      </a>
    </dt>

*/

  // Scan the profiles, inserting (or changing) any found title.
  bananascanner: function() {
    var i, j, npd, node, s;
    var avnode, uname, ch4;

    // Scan profiles.
    var profiles = document.getElementsByClassName('postprofile');
    for (i = 0; i < profiles.length; i++) {
      // Get the first node, which contains the avatar and/or username
      avnode = profiles[i].childNodes[1];
      // 4th child is usually the username
      ch4 = avnode.childNodes[4];
      if (typeof ch4 === 'undefined') {
        // There is no avatar; username will be child[1]
        ch4 = avnode.childNodes[1];
      }
      if (typeof ch4 === 'undefined') {
        // Still undefined, so just forget about trying to find the username
        uname = '';
      } else {
        uname = ch4.innerHTML;
      }
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
          + this.select_line(i, uname) + '<br />'
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
  jse: function(obj) {
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
  jsd: function(str) {
    if (typeof str === "undefined") {
      return 0;
    }
    try {
      return JSON.parse(str);
    } catch(e) {
      return JSON.decode(str);
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
    this.vstr(nam, this.jse(optobj.val));
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
    this.make_checkbox('o_randomize', 'Randomize', this.o_randomize, opts_div);

    // Make the checkbox for 'Use Usernames'
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('o_use_uname', 'Use Usernames', this.o_use_uname, opts_div);

    // Make the checkbox for 'Use Usernames'
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('o_banana', 'BANANAS', this.o_banana, opts_div);

    // Make the checkbox for 'Numbers'
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('o_numbers', 'Numbers', this.o_numbers, opts_div);

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
    this.o_randomize = { val: this.jsd(this.vget('o_randomize', '0')) };
    if (typeof this.o_randomize === "undefined") {
      this.o_randomize = { val: "0" };
      this.o_randomize.val = this.jsd(this.vget('o_randomize', '0'));
    };

    this.o_use_uname = { val: this.jsd(this.vget('o_use_uname', '0')) };
    if (typeof this.o_use_uname === "undefined") {
      this.o_use_uname = { val: "0" };
      this.o_use_uname.val = this.jsd(this.vget('o_use_uname', '0'));
    };

    this.o_banana = { val: this.jsd(this.vget('o_banana', '0')) };
    if (typeof this.o_banana === "undefined") {
      this.o_banana = { val: "0" };
      this.o_banana.val = this.jsd(this.vget('o_banana', '0'));
    };

    this.o_numbers = { val: this.jsd(this.vget('o_numbers', '0')) };
    if (typeof this.o_numbers === "undefined") {
      this.o_numbers = { val: "0" };
      this.o_numbers.val = this.jsd(this.vget('o_numbers', '0'));
    };

    var footer = document.getElementById("page-footer");
    var ft_par = footer.parentNode;
    ft_par.insertBefore(this.create_checkboxen(), footer);

    this.bananascanner();
  },

  xx_end : 0
};

// console.info('we-love-bananayada on ' + (nanaParty.isGM ? "GM" : "not-GM"));

nanaParty.setupmap();

/* A 1-second delay does not seem to be necessary: Script doesn't get run
   until the HTML is parsed and a DOM created for its elements, and our
   functionality does not depend on images having been loaded.
setTimeout(nanaParty.bananayada.bind(nanaParty), 1000);
*/

nanaParty.bananayada();

/* Not available when installed as a user script directly into Chrome
   extensions
  unsafeWindow.addEventListener('DOMContentLoaded',
                             nanaParty.bananayada.bind(nanaParty));

*/
