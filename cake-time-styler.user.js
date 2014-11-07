// ==UserScript==
// @namespace http://mrob.com/time/scripts-beta
// @name cake-time-styler for OTT
// @version 6459.51
// @description Restyle the post count of people nearby Cake Time
// @author Aluísio Augusto Silva Gonçalves <aasg@chirpingmustard.com>
// @downloadURL http://mrob.com/time/scripts-beta/cake-time-styler.user.js
// @match http://forums.xkcd.com/viewtopic.php*
// @match http://fora.xkcd.com/viewtopic.php*
// @match http://echochamber.me/viewtopic.php*
// @grant none
// ==/UserScript==

// The original was written in LiveScript and compiled into sorta-cryptic
// slightly-obfuscated JavaScript. Formatting and comments are by Robert
// Munafo (mrob27)
//
// REVISION HISTORY:
//
// 6457.14 copied from time.aasg.name/userscripts/CakeTimeStyler.user.js
//   and added formatting; postcounts in the mrob sequence (27, 143, 1011)
//   also cause the random Timeframe to appear.
// 6459.51 add xkcd color names to comments (from the survey results at
//   http://xkcd.com/color/rgb/ )
(function(){
  var a,b,c,d;
  a="101043",

  b=function(b){
    var c;
    c=document.querySelector("#topic-search input[name=t]").value,c===a&&b()
  },

  c=function(a,b,c){
    var d;
    return null==c&&(c=document),
      a=a.replace(/@class="(.+?)"/g,
            'contains(concat(" ", normalize-space(@class), " "), " $1 ")'),
      d=document.evaluate(a,c,null,b,null),
      b===XPathResult.FIRST_ORDERED_NODE_TYPE?d.singleNodeValue:d},

  d=function(a){
    var b,d,e,f;
    b=function(a,b){
      var d;
      return a.style.fontWeight="bold",
        a.style.color=b,
        d=c('ancestor::*[@class="post"]',XPathResult.FIRST_ORDERED_NODE_TYPE,a),
        d.style.border="2px dotted "+b},
        d=+a.textContent, /* Post count */
        e=d%100, /* Post count modulo 100, i.e. the last 2 digits of the
                    post count */
        a=a.parentElement,
        0===e?b(a,"#859900"): /* If e is 0 their postcount is an exact multiple
                                 of 100; show it in baby poop green */
        e>=97?b(a,"#dc322f"): /* Coming soon, show in tomato red */
        3>=e&&b(a,"#268bd2"), /* round-number happened recently, show in
                                  water blue */
        /* If post count is 1190, or a few other values special to mrob27,
           replace their avatar with a random frame of Time */
        (27===d||143===d||1011===d||1190===d)
           &&(f=c('ancestor::*[@class="postprofile"]//img[@alt="User avatar"]',
                    XPathResult.FIRST_ORDERED_NODE_TYPE,a),
              f.src="http://xkcd.mscha.org/frame/random")},

  b(function(){
    var a,b,e,f;
    for(a=c('//*[@class="postprofile"]//*[.="Posts:"]',
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE),
        b=0,e=a.snapshotLength; e>b;++b)
      f=b,
    d(a.snapshotItem(f).nextSibling)
    }
  )
}).call(this);
