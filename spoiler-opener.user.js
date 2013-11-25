// ==UserScript==
// @namespace mrob.com
// @name Open All Spoilers on (Re)Load
// @description Open all spoilers in the forum posts
// @author Robert Munafo
// @version 6002.91
// @downloadURL http://mrob.com/time/scripts-beta/spoiler-opener.user.js
// @include http://forums.xkcd.com/viewtopic.php*
// @include http://fora.xkcd.com/viewtopic.php*
// @include http://echochamber.me/viewtopic.php*
// @include http://forums.xkcd.com/posting.php*
// @include http://fora.xkcd.com/posting.php*
// @include http://echochamber.me/posting.php*
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
// np6002.91 Make the lavendar background a fair bit lighter so it doesn't
//   interfere as much with any images, font colours, etc. that the author
//   might have included.

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

var ttd;
var del;
var recalc;

openallspoilers = {

  // I'd like to know about cross-browser support for console.log(). Until
  // then, this is my replacement.
  //
  log: function (msg) {
    setTimeout(function() {
      throw new Error(msg);
    }, 0);
  },

  convert: function() {
    var buttons = document.getElementsByTagName('input');
    var i;
    //- this.log('convert started');
    for(i=0 ; i<buttons.length ; i++) {
      //- this.log(i + ' ' + buttons[i].value);
      if (  (buttons[i].type == 'button')
         && ((buttons[i].value == 'Show') || (buttons[i].value == 'hide')) )
      {
        var myp =
          buttons[i]       // <input type="button" value="Show"  ...
          .parentNode;     // <div class="quotetitle">

        var myx =
          myp.parentNode     // <div style="margin:20px; margin-top:5px">
          .getElementsByTagName('div')[1]; // <div class="quotecontent">

        var myz = myx
          .getElementsByTagName('div')[0] // <div style="display: none;">
          .style;

        if (recalc == 0) {
          // This is the first time: open th spoilers and change the button
          myz.display = '';   // remove 'none', making it displayable
          myz.backgroundColor="#DDF";
          buttons[i].value = 'hide';
        }

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
      }
    }

    // Because myx.clientHeight is sometimes not updated properly (e.g.
    // Chrome v29 when myx contains newly-loaded images) the global 'ttd'
    // will be set if we need to wait a while and re-run this function.
    if (ttd > 0) {
      recalc = 1;
      setTimeout(openallspoilers.convert.bind(openallspoilers), del);
      ttd -= 1;
      // Go to the next-higher delay interval
      if (del <= 9111) {
        del = 100235;
      } else if (del <= 100235) {
        del = 1303071;
      } else if (del <= 1303071) {
        del = 19546083;
      }
    }
  }
};

// Make it run itself a few more times, because 'load', 'onload', and
// 'DOMContentLoaded' events all fail to wait long enough for the
// myx.clientHeight property to be correct if myx contains newly-loaded
// images, and because images sometimes take a ch*rping long time to load.
ttd = 3; del = 9111;
recalc = 0;

// 3 cases for cross-platform, cross-browser: not necessary for this
// application but I want this code to be useful elsewhere too!
if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', // was 'load',
    openallspoilers.convert.bind(openallspoilers), false);
} else if (window.attachEvent) {
  window.attachEvent('onload',
    openallspoilers.convert.bind(openallspoilers));
} else {
  openallspoilers.convert(openallspoilers);
};

// %%% Ask Pikrass if the "addEventListener('DOMContentLoaded',...)"
// is needed for non-GreaseMonkey platforms/environments. acto AluisioASG,
// *Monkey always runs the script after the DOM is built (HTML loaded and
// converted to a hierarchical tree of objects).
//
// Pikrass' version also tests if we're reading or posting with:
// if(location.href.indexOf('viewtopic') != -1)


// The following is a LiveScript version by Aluísio Augusto Silva Gonçalves
//
// # Find the corresponding spoiler content to a given current spoiler button.
// find-spoiler-content = (spoiler-button) ->
//   eval-XPath '
//     ancestor::*[@class="quotetitle"]
//     /following-sibling::*[@class="quotecontent"]
//     /div',
//     XPathResult.FIRST_ORDERED_NODE_TYPE, spoiler-button
//   .singleNodeValue
// 
// # Wrap the document's XPath evaluator to simplify the call.
// eval-XPath = (xpath, result-type, context=document) ->
//   document.evaluate xpath, context, null, result-type, null
// 
// 
// snapshot = eval-XPath '
//   //*[@class="quotetitle"]
//   //*[.="Spoiler:"]
//   /following-sibling::input[@type="button"]',
//   XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE
// for let i til snapshot.snapshotLength
//   spoiler-button = snapshot.snapshotItem i
//   if (find-spoiler-content spoiler-button)?
//     that.style.display = ''
//     spoiler-button.value = 'Hide'
//   else
//     console.error "Failed to find spoiler content node"
