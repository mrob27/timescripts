// ==UserScript==
// @namespace http://mrob.com/time/scripts-beta
// @name cake-time-styler for OTT
// @version 27099.67
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
// 17421.01 add 9111 to the sequence of postcounts resulting in a *Time* frame avatar.
// 26397.23 handle new version of phpBB on the fora server
// 27099.67 fix syntax errors and bogus "expected assignment" complaints from Tampermonkey
//
console.info("cts1");
(function(){
  var a,b,c,d;
  a="101043";

  b=function(b){
    var c;
    c=document.querySelector("#topic-search input[name=t]").value;
    if (c===a) { b(); }
  };

  c=function(a,b,c){
    var d;
      console.info("c(" + a + ", " + b + ", " + c + ")");
    if (null===c) { c=document; }
    a=a.replace(/@class="(.+?)"/g, 'contains(concat(" ", normalize-space(@class), " "), " $1 ")');
    d=document.evaluate(a,c,null,b,null);
    return (b===XPathResult.FIRST_ORDERED_NODE_TYPE ? d.singleNodeValue : d);
  };

  d=function(a){
    var b,d,e,f,p;
    b=function(a,b){
      var d;
        console.info("b (" + a + ", " + b + ")");
      a.style.fontWeight="bold";
      a.style.color=b;
      d=c('ancestor::*[@class="post"]',XPathResult.FIRST_ORDERED_NODE_TYPE,a);
      d.style.border="2px dotted "+b;
    };
    d=a.textContent; /* Post count */
    e=d%100; /* Post count modulo 100, i.e. the last 2 digits of the
                  post count */
    console.info("a = " + a + ", d = " + d + ", e = " + e);
    p=a.parentElement;
    if (e === 0) { b(a,"#859900"); } /* If e is 0 their postcount is an exact multiple
                                        of 100; show it in baby poop green */
    else if (e >= 97) { b(a,"#dc322f"); } /* Coming soon, show in tomato red */
    else if (e <= 3) { b(a,"#268bd2"); } /* round-number happened recently, show in
                                            water blue */
    else if (d == -1987) { b(a,"#F00"); } /* for debugging */
      /* If post count is 1190, or a few other values special to mrob27,
         replace their avatar with a random frame of Time */
    else if (d===27||d===143||d===1011||d===1190||d===9111) {
      f=c('ancestor::*[@class="postprofile"]//img[@alt="User avatar"]', XPathResult.FIRST_ORDERED_NODE_TYPE, a);
      f.src="http://xkcd.mscha.org/frame/random";
    }
  };

  b(
    function(){
      var a,b,e;
      for(b=0,
          a=c('//*[@class="postprofile"]//*[.="Posts:"]', XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE),
          e=a.snapshotLength;
          b<e;
          ++b)
      {
        d(a.snapshotItem(b).nextSibling.nextSibling);
      }
    }
  );
}).call(this);
