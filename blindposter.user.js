// ==UserScript==
// @namespace mrob.com
// @name blindposter for OTT
// @description Hide the "TOPIC REVIEW" section, so you can make a blindpost without being spoiled by anything you might see there
// @author Robert Munafo
// @version 7980.35
// @downloadURL http://mrob.com/time/scripts-beta/blindposter.user.js
// @include http://forums.xkcd.com/posting.php*
// @include http://fora.xkcd.com/posting.php*
// @include http://echochamber.me/posting.php*
// ==/UserScript==

// %%% NOTE: I still need to find out how to identify the section that
//     shows a new post if you hit 'Submit' and another post has shown up in
//     the meantime. I'll probably have to actually post something in order
//     to get that bit to appear. By rooting around in the CSS I think it might
//     be 'message-box', 'notice', 'posthilit'
// If someone can tell me what the ID is, I'll make the change sooner.
//
// REVISION HISTORY:
//
// np7936.14 First version
// np7977.62 Add a prominent message saying 'Topic Review hidden by
//   blindposter script' to remind user they're using this script
// np7979.02 Recognize and hide any 'ninja' posts
// np7980.35 Do not hide my own post preview

blindposter = {
  hideit: function(elem) {
    elem.style.display="none";

    var container = elem.parentNode;

    var notice = document.createElement('div');

    var text1 = document.createTextNode(
                                   "(Content hidden by blindposter script)");
    notice.style.fontSize = '18.0px';
    notice.style.fontStyle = 'italic';
    notice.style.fontWeight = 'bold';
    notice.style.color = '#0B7';

    notice.appendChild(text1);

    container.insertBefore(notice, elem);
  },

  convert: function() {
    var topicreview = document.getElementById("topicreview");
    if (topicreview) {
      this.hideit(topicreview);
    };

    var preview = document.getElementById("preview");

    /* If you 'Submit' a post and a new post has been submitted by someone
       else since the last time you did a 'Preview', it presents the message:

           "At least one new post has been made to this topic.
            You may wish to review your post in light of this."

       followed by one or more messages formatted the normal way in
       tags like <div class="post bg2">. So we hide those too. */
    var i;
    var inners = document.getElementsByClassName('post bg1');
    for(i=0 ; i<inners.length ; i++) {
      if (inners[i] != preview) {
        this.hideit(inners[i]);
      }
    };
    inners = document.getElementsByClassName('post bg2');
    for(i=0 ; i<inners.length ; i++) {
      if (inners[i] != preview) {
        this.hideit(inners[i]);
      }
    };
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
