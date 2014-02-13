// ==UserScript==
// @namespace mrob.com
// @name blindposter for OTT
// @description Hide the "TOPIC REVIEW" section, so you can make a blindpost without being spoiled by anything you might see there
// @author Robert Munafo
// @version 7936.14
// @downloadURL http://mrob.com/time/scripts-beta/blindposter.user.js
// @include http://forums.xkcd.com/posting.php*
// @include http://fora.xkcd.com/posting.php*
// @include http://echochamber.me/posting.php*
// ==/UserScript==

// %%% NOTE: I still need to find out how to identify the section that
//     shows a new post if you hit 'Submit' and another post has shown up in
//     the meantime. I'll probably have to actually post something in order
//     to get that bit to appear.
// If someone can tell me what the ID is, I'll make the change sooner.
//
// REVISION HISTORY:
//
// np7936.14 First version

blindposter = {
  convert: function() {
    var topicreview = document.getElementById("topicreview");
    if (topicreview) {
      topicreview.style.display="none";
    }
  }
};

// 3 cases for cross-platform, cross-browser: not necessary for this
// application but I want this code to be useful elsewhere too!
if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', // was 'load',
    blindposter.convert.bind(blindposter), false);
} else if (window.attachEvent) {
  window.attachEvent('onload',
    blindposter.convert.bind(blindposter));
} else {
  blindposter.convert(blindposter);
};
