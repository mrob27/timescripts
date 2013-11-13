// ==UserScript==
// @namespace mrob.com
// @name Open All Spoilers on (Re)Load
// @description Open all spoilers in the forum posts
// @author Robert Munafo
// @version 5723
// @downloadURL http://mrob.com/time/scripts-beta/spoiler-opener.user.js
// @include http://forums.xkcd.com/viewtopic.php*
// @include http://fora.xkcd.com/viewtopic.php*
// ==/UserScript==

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
	//- log: function (msg) {
	//-    setTimeout(function() {
    //-	    throw new Error(msg);
	//-    }, 0);
	//- },

	convert: function() {
		var buttons = document.getElementsByTagName('input');
		var i;
		for(i=0 ; i<buttons.length ; i++) {
			//- this.log(i + ' ' + buttons[i].value);
            if (  (buttons[i].type == 'button')
               && (buttons[i].value == 'Show'))
            {
              var myp =
                buttons[i]       // <input type="button" value="Show"  ...
                .parentNode;     // <div class="quotetitle">

              var myx =
                myp.parentNode     // <div style="margin:20px; margin-top:5px">
                .getElementsByTagName('div')[1]; // <div class="quotecontent">

              myx
                .getElementsByTagName('div')[0] // <div style="display: none;">
                .style.display = '';   // remove 'none', making it displayable

              buttons[i].value = 'Hide'; // + myx.scrollHeight + 'px';

              // The following does not show an accurate height if the spoiler
              // contains images, but it at least works when it contains text.
              myp.getElementsByTagName('b')[0].innerText
                = myx.clientHeight + 'px';
			}
		}
	}
};

if(location.href.indexOf('viewtopic') != -1)
	window.addEventListener('DOMContentLoaded',
      openallspoilers.convert.bind(openallspoilers) );

// The following is an earlier version by Aluísio Augusto Silva Gonçalves
// It is written in LiveScript
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
