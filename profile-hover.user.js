// ==UserScript==
// @namespace mrob.com
// @name profile-hover
// @description  Makes the profile info stay on screen when you scroll through a post.
// @author Ondrej Mosnáček and Robert Munafo
// @version 7661.48
// @downloadURL http://mrob.com/time/scripts-beta/profile-hover.user.js
// @include http://forums.xkcd.com/viewtopic.php*
// @include http://fora.xkcd.com/viewtopic.php*
// @include http://echochamber.me/viewtopic.php*
// @require    http://zeptojs.com/zepto.min.js
// @run-at     document-end
// @copyright  2013+, Ondrej Mosnáček
// ==/UserScript==
//
// REVISION HISTORY:
// np2895.59 first version, by Ondrej Mosnáček
//
// np7661.48 Clean up formatting; add lots of comments

/* Get every <div class="post"> and extract the <div class="postbody"> and
   <div class="postprofile">, and put all into an array that we can walk
   through */
var posts = $('div.post').map(function() {
  var $el = $(this);
  return {
    post: $el,
    body: $el.find('div.postbody'),
    profile: $el.find('dl.postprofile')
  };
}).get();

//GM_log(posts);

$(document).on('scroll', function() {
  for(var i = 0; i < posts.length; i++) {
    var post = posts[i];
    var $profile = post.profile;
    var $body = post.body;
    var postStart = $body.offset().top;
    /* Calculate the height of the post, which is the greater of the heights
       of the body (message + signature) and the profile. */
    var postEnd = postStart + Math.max($body.height(), $profile.height());
    //GM_log([postStart, postEnd].join(', '));
    /* Calculate where the top of the visible area of the window is, in
       relation to the top of this post. This will be positive when the
       top of the post is higher than the top of the visible area. */
    var off = window.pageYOffset - postStart;
    var min = 0;
    /* Calculate the maximum amount by which we can push the profile down,
       before it hits the bottom edge of the post */
    var max = postEnd - $profile.height() - postStart;

    if (off < min) {
      /* We're crolled far enough up that the top fo the profile should be
         pinned to the top of the post (this is the way it would normally be
         displayed without this script running) */
      $profile.css({ position: '', top: '' });
    } else if (off > max) {
      /* We're scrolled far enough down that the profile has to be pinned to
         the bottom of the post */
      $profile.css({ position: 'relative', top: max + 'px' });
    } else {
      /* We're in the middle area, where the profile should be pinned to
         the top of the window */
      $profile.css({ position: 'relative', top: off + 'px' });
    }
  }
});
