/*!
// ==UserScript==
// @namespace time.aasg.name
// @name Spoiler Scroller
// @version 6462.69
// @description Scroll appropriately when a spoiler is closed (for use with 'Clever Spoilers' by Pikrass)
// @author Aluísio Augusto Silva Gonçalves <aasg@chirpingmustard.com>
// @downloadURL http://mrob.com/time/scripts-beta/spoiler-scroller.user.js
// @match http://forums.xkcd.com/viewtopic.php*
// @match http://fora.xkcd.com/viewtopic.php*
// @match http://echochamber.me/viewtopic.php*
// @grant none
// ==/UserScript==

// BUGS
//
// The calculation may be a bit off in some browsers. In Mac Chrome 29.0.x
// for example, if you repeatedly open and close the same spoiler over and
// over again it scrolls down a few pixels each time - the exact amount varies
// based on which spoiler (try the one in mscha's signature)
//
// REVISION HISTORY
//
// 6462.69 First version: retrieved from original version 0.3.1 at URL
//   time.aasg.name/userscripts/SpoilerScroller.user.js and formatted;
//   make @description more accurate.
*/
(function(){
  function a(a){
    var b;
    b=h.snapshotItem(a),
    b.addEventListener("click",d),
    b.addEventListener("click",
      function(){
        var a;
        null!=(a=g(b))&&a.addEventListener("click",d.bind(b))
      }
    )
  }
  var b,c,d,e,f,g,h,i,j;
  for(
    b=function(a){
      return c('ancestor::*[@class="quotetitle"]/following-sibling::*[@class="quotecontent"]/div',
      XPathResult.FIRST_ORDERED_NODE_TYPE,a)
    },
    c=function(a,b,c){
      var d;
      return null==c&&(c=document),
        a=a.replace(/@class="(.+?)"/g,
          'contains(concat(" ", normalize-space(@class), " "), " $1 ")'),
        d=document.evaluate(a,c,null,b,null),
        b===XPathResult.FIRST_ORDERED_NODE_TYPE?d.singleNodeValue:d
    },
    d=function(){
      var a;
      null!=(a=this.dataset.viewportOffset)
        ?(f(this,JSON.parse(a)),delete this.dataset.viewportOffset)
        :this.dataset.viewportOffset=JSON.stringify(e(this))
    },
    e=function(a){
      var b,c;
      return b=document.documentElement,
        c=a.getBoundingClientRect(),
        { top:c.top+b.clientTop,
          left:c.left+b.clientLeft }
    },
    f=function(a,b){
      var c,d,e;
      for(c=a.offsetLeft-b.left,d=a.offsetTop-b.top;
          null!=(e=a=a.offsetParent);)
        c+=e.offsetLeft,
        d+=e.offsetTop;
      return window.scrollTo(c,d)
    },
    g=function(a){
      var d;
      return d=b(a),
        null==d?(console.error("Failed to find spoiler content node"),null)
          :c('./div[position()=last()]/input[@type="button" and @value="Hide"]',
             XPathResult.FIRST_ORDERED_NODE_TYPE,d)
    },
    h=c('//*[@class="quotetitle"]//*[.="Spoiler:"]/following-sibling::input[@type="button"]',
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE),
    i=0,
    j=h.snapshotLength;
  j>i;
  ++i)
      a.call(this,i)
}).call(this);
