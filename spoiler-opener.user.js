// ==UserScript==
// @namespace http://mrob.com/time/scripts-beta
// @name spoiler-opener for OTT
// @description Open All Spoilers on (Re)Load
// @author       Robert Munafo
// @version      26808.56
// @downloadURL  http://mrob.com/time/scripts-beta/spoiler-opener.user.js.txt
// @grant        GM_getValue
// @grant        GM_setValue
// @include      http://www.forums.xkcd.com/*
// @include      http://forums.xkcd.com/*
// @include      http://echochamber.me/*
// @include      http://fora.xkcd.com/*
// @include      http://1190.bicyclesonthemoon.info/ott*
// @include      http://moonbase.chirpingmustard.com/ott*
// @run-at       document-end
// ==/UserScript==

// REVISION HISTORY:
//
// np5708: Add this script to github
//   Comment out debugging statements ("log" function)
//   Add comments explaining how the script works.
//   Update revision # and make a more descriptive name
// np5718: Change text 'Spoiler:' to height of contained text (bug: it isn't
//   counting height of images yet)
// np5719: Improve comments
// np5725: Use 'load' or 'onload' event listener instead of 'DOMContentLoaded'
// np5732: Set backgroundColor of contents of every spoiler to #BBD
//   so it's obvious which parts were inside the spoilers.
//   Cross-browser method for getting element heights.
// np5757.19 Use setTimeout to run the function twice
// np5757.25 Wait 9.111 seconds; fix a bug
// np5761.68 Fix window.addEventListener/attachEvent calls and add fallback
//   case if neither deferred method is available.
// np5826.91 Do not open the spoilers or change the button title on the
//   second scan (in case user has decided to close spoiler(s) during the
//   interval)
// np5905.00 Run 3 more times instead of just 1, with exponentially increasing
//   delays (this improves performance when the servers are really slow.)
// np6002.91 Make the lavender background a fair bit lighter so it doesn't
//   interfere as much with any images, font colours, etc. that the author
//   might have included.
// np8198.89 If spoiler button is inside a link, change the button text to
//   '> spURLer! < to make it obvious
// np8201.06 Handle a few more cases of Spoiler nested within other tags which
//   are nested in a URL.
// np8233.28 Fix a typo ("lavendar")
// np10050.85 Add 'Zero Margins' option.
// np10937.15 Work on search.php pages.
// np10966.08 If possible, identify href target in URL and scroll to it
// np10966.67 Work on the balthamirror (1190.bicyclesonthemoon.dnsd.info)
// np11640.04 Enforce scrolling to the user's target location as long as
//   the target location keeps changing, but until document.body.scrollTop
//   changes by some other means.
// np11641.26 Neaten up the code a little
// np12165.61 Try harder to change spURLer buttons' text
// np13078.01 Work when viewing PMs
// np13115.92 Broaden balthamirror match pattern
// np13128.24 Add moonbase.chirpingmustard.com
// np13196.35 Slightly broader match pattern for the two balthasar sites
// np14757.49 Remove 'dnsd' from bicyclesonthemoon hostname
// np14771.07 Add www.forums.xkcd.com
// np21083.61 Add @grant and @run-at requests
// np26758.29 Add a semicolon
// np26808.56 Always call convert() explicitly

// A sample forum page is:
//
//   forums.xkcd.com/viewtopic.php?f=7&t=101043&p=3495924#p3495924
//
// A Spoiler:'d item is implemented with the following HTML:
//
// <div style="margin:20px; margin-top:5px">
//   <div class="quotetitle">
//     <b>Spoiler:</b>
//     <input type="button"
//            value="Show"
//            style="width:45px;font-size:10px;margin:0px;padding:0px;"
//            onclick="[js, see below]" />
//   </div>
//   <div class="quotecontent">
//     <div style="display: none;">
//       The butler did it! Now you don't have to read the rest of the book!
//     </div>
//   </div>
// </div>
//
// Where the "[js, see below]" is the following JavaScript:
//
//   if (this.parentNode.parentNode.getElementsByTagName('div')[1]
//        .getElementsByTagName('div')[0].style.display != '')
//   {
//     this.parentNode.parentNode.getElementsByTagName('div')[1]
//       .getElementsByTagName('div')[0].style.display = '';
//     this.innerText = ''; this.value = 'Hide';
//   } else {
//     this.parentNode.parentNode.getElementsByTagName('div')[1].
//       getElementsByTagName('div')[0].style.display = 'none';
//     this.innerText = ''; this.value = 'Show';
//   }
//
// Therefore, we can open all spoilers by finding all buttons labeled "Show"
// and running the "this.parentNode. ... .style.display = '';" on each one.

openallspoilers = {

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

    var lbl = document.createElement('label');
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

    var optstitle = document.createTextNode("Spoiler-Opener by Mrob27:");
    preDiv.appendChild(optstitle);

    var opts_div = document.createElement('div');
    opts_div.style.textAlign = 'left';

    // Make the checkbox for 'lavender background'
    opts_div.appendChild(document.createTextNode("　　"));
    this.make_checkbox('o_lavender', 'Lavender Background', this.o_lavender, opts_div);

    // Make the checkbox for '> spURLer <' option
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('o_lbl_spurlers', 'Label SpURLer Buttons', this.o_lbl_spurlers, opts_div);

    // Make the checkbox for 'Zero margins' option
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('o_0_margins', 'Zero Margins', this.o_0_margins, opts_div);

    container.appendChild(preDiv);
    container.appendChild(opts_div);

    return(container);
  },

  convert: function() {
    var buttons = document.getElementsByTagName('input');
    var i;
    // console.info("Found " + buttons.length + " buttons.");

    // First time: initialize options, create the checkboxes.

    this.o_lavender = { val: JSON.parse(GM_getValue('o_lavender', '0')) };
    if (typeof this.o_lavender == 'undefined') {
        this.o_lavender = { val: "0" };
        this.o_lavender.val = JSON.parse(GM_getValue('o_lavender', '0'));
    };

    this.o_lbl_spurlers = { val: JSON.parse(GM_getValue('o_lbl_spurlers', '0')) };
    if (typeof this.o_lbl_spurlers == 'undefined') {
        this.o_lbl_spurlers = { val: "0" };
        this.o_lbl_spurlers.val = JSON.parse(GM_getValue('o_lbl_spurlers', '0'));
    };

    this.o_0_margins = { val: JSON.parse(GM_getValue('o_0_margins', '0')) };
    if (typeof this.o_0_margins == 'undefined') {
        this.o_0_margins = { val: "0" };
        this.o_0_margins.val = JSON.parse(GM_getValue('o_0_margins', '0'));
    };

    var footer = document.getElementById("page-footer");
    var ft_par = footer.parentNode;
    ft_par.insertBefore(this.create_checkboxen(), footer);

    // As a service to our readers, we also eliminate that superfluous
    // 30-pixel margin.
    if (this.o_0_margins.val) {
      footer = document.getElementById("wrap");
      footer.style.padding="0";
    };

    for(i=0 ; i<buttons.length ; i++) {
      if (  (buttons[i].type == 'button')
         && ((buttons[i].value == 'Show') || (buttons[i].value == 'hide')) )
      {
        var myp =
          buttons[i]       // <input type="button" value="Show"  ...
          .parentNode;     // <div class="quotetitle">
        var btext = 'hide';
        var bwid = 100;

        var mygp = myp.parentNode;  // <div style="margin:20px; margin-top:5px">
                                    // or <a href="..." class="postlink">
        var myggp = mygp.parentNode;
        var myg3p = myggp.parentNode;
        var myg4p = myg3p.parentNode;
        var myg5p = myg4p.parentNode;

        // console.info('input ' + i + ' myp is a ' + myp.tagName
        //                           + ' in a ' + mygp.tagName);

        var myx =
          mygp
          .getElementsByTagName('div')[1]; // <div class="quotecontent">

        bwid = buttons[i].offsetWidth;

        if ( (mygp.tagName == 'A') || (myggp.tagName == 'A')
          || (myg3p.tagName == 'A') || (myg4p.tagName == 'A')
          || (myg5p.tagName == 'A'))
        {
          // spURLer! Make it obvious by changing the button text
          // For example, see '20140224 spURLer p23427839.png' which shows how Chrome
          // handles OTT:1315:10#p3427839
          console.info('button ' + i + ' is a spURLer!');
          if (this.o_lbl_spurlers.val) {
            btext = ' > spURLer! < ';
            buttons[i].value = btext;
            // Add 50 to the CSS's specified width
            bwid += 50;
            buttons[i].style.width = bwid+'px';
          };

          if (mygp.tagName == 'A') {
            // We have to go up 1 more level to find the common ancestor of the
            // actual content
            myx = mygp.parentNode.getElementsByTagName('div')[1];
          }
        };

        if (myx) {
          // There is a sibling node with content; go ahead and show it.
          var myz = myx
            .getElementsByTagName('div')[0] // <div style="display: none;">
            .style;

          // This is the first time: open the spoilers and change the button
          myz.display = '';   // remove 'none', making it displayable
          if (this.o_lavender.val) {
            myz.backgroundColor="#DDF";
          };
          buttons[i].value = btext;
          buttons[i].style.width = bwid+'px';

          // The following does not show an accurate height if the spoiler
          // contains images, but it at least works when it contains text.
          var ht;
          if (myx.clientHeight) { // IE
            ht = myx.clientHeight + 'px'; // In some cases we see a scrollbar, so
                                          // maybe scrollHeight would be more
                                          // appropriate
          } else if (window.getComputedStyle) {
            ht = window.getComputedStyle(myx).getPropertyValue('height');
          } else if (myx.style['height']) {
            ht = myx.style['height'];
          } else {
            ht = 'unkn';
          }
          myp.getElementsByTagName('b')[0].innerText = ht;
        } else {
          console.info('button ' + i + ' I found no sibling with content.');
          // we want to change the button text here to make it obvious that there
          // is a bug
          buttons[i].value = '(found no content)';
          buttons[i].style.width = (buttons[i].offsetWidth+50)+'px';
        }
      }
    }
  }
};

var get_tloc = function() {
  var h1 = location.href.split("#")[1];
  if (typeof h1 === 'string') {
    if (h1 !== '') {
      var target = document.getElementById(h1);
      if (target) {
        return target.offsetTop;
      }
    }
  }
  return 0;
};

// 3 cases for cross-platform, cross-browser: not necessary for this
// application but I want this code to be useful elsewhere too!
if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', // was 'load',
    openallspoilers.convert.bind(openallspoilers), false);
} else if (window.attachEvent) {
  window.attachEvent('onload',
    openallspoilers.convert.bind(openallspoilers));
}
// We also need to just run it explicitly, particularly on versions of
// Tampermonkey for Chorome starting about 201604.
openallspoilers.convert(openallspoilers);


var old_tloc = get_tloc();
var old_dst = document.body.scrollTop;

// Because myx.clientHeight is sometimes not updated properly (e.g.
// Chrome v29 when myx contains newly-loaded images) the global 'ttd'
// will be set if we need to wait a while and re-run this function.
var mont = 1000;

// Make it run itself a few more times, because 'load', 'onload', and
// 'DOMContentLoaded' events all fail to wait long enough for the
// myx.clientHeight property to be correct if myx contains newly-loaded
// images, and because images sometimes take a ch*rping long time to load.
var ttd = 10;

var old_msg = '';
var msg = function(s)
{
  if (s !== old_msg) {
    console.info(s);
    old_msg = s;
  }
};

var mon = function() {
  var t2 = get_tloc();
  var d2 = document.body.scrollTop;
  msg('dst = ' + d2 + ', tgtloc = ' + t2);

  if (mont > 0) {
    /* Because of opening all the spoilers, we're usually not on the message
     * that we want to be on. If there is a hash ("fragment") in the URL,
     * we'll try to locate it and scroll to it. */
    if ((d2 == old_dst) && (d2 != t2)) {
      document.body.scrollTop = t2;
      msg('set dst to ' + t2);
      d2 = t2;
      old_dst = t2;
    }
    if ((ttd <=0) && (d2 != old_dst)) {
      msg('dst = ' + d2 + ', old = ' + old_dst + ': stopping.');
      mont = 0;
    }

    ttd--;
    mont--;
    setTimeout(mon, 100);
  }

  old_tloc = t2;
  old_dst = d2;
};

setTimeout(mon, 100);
