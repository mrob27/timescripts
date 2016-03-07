// ==UserScript==
// @namespace mrob.com
// @name Drumpf by mrob27
// @description Replaces "Trump", "trump", etc. with "Drumpf", "drumpf" etc.
// @author John Oliver
// @version 20160301
// @downloadURL http://mrob.com/time/scripts-beta/drumpf.user.js.txt
// @match *://*/*
// ==/UserScript==

// REVISION HISTORY:
//
// 20160301 First version

function leopardize(str)
{
  return str
    .replace(/drumpf/g,"drümpf")
    .replace(/Drumpf/g,"Drümpf")
    .replace(/DRUMPF/g,"DRÜMPF")
    .replace(/d[Rr][Uu][Mm][Pp][Ff]/g,"drümpf")
    .replace(/D[Rr][Uu][Mm][Pp][Ff]/g,"Drümpf")
    .replace(/trump/g,"drumpf")
    .replace(/Trump/g,"Drumpf")
    .replace(/TRUMP/g,"DRUMPF")
    .replace(/t[Rr][Uu][Mm][Pp]/g,"drumpf")
    .replace(/T[Rr][Uu][Mm][Pp]/g,"Drumpf")
    //.replace(/(?<!my pants|\.)\.( |$)/gi,' in my pants.$1') //invalid group???
    ;
};

var replacingContent = false;

function replaceTextContent(node)
{
  //flag that content is being replaced so the event it generates
  //won't trigger another replacement
  replacingContent = true;
  node.textContent = leopardize(node.textContent);
  replacingContent = false;
};

/* This recursively (depth-first) traverses a given DOM node and its
   subnodes for text, and applies the leopard filter to each. */
function changeTextNodes(node)
{
  var length, childNodes;

  //If this is a text node, leopardize it
  if (node.nodeType == Node.TEXT_NODE) {
    replaceTextContent(node);
  //If this is anything other than a text node, recurse any children
  } else {
    childNodes = node.childNodes;
    length = childNodes.length;
    for (var i=0; i<length; ++i) {
      changeTextNodes(childNodes[i]);
    }
  }
};

function insertion_listener(event) {
  //change any new text nodes in a node that is added to the body
  changeTextNodes(event.target);
};

function cdm_listener(event) {
  // avoid infinite loop by ignoring events triggered by our own replacement
  if (!replacingContent) {
    replaceTextContent(event.target);
  }
};

changeTextNodes(document.body);
document.title = leopardize(document.title);
document.body.addEventListener("DOMNodeInserted", insertion_listener, false);
document.body.addEventListener("DOMCharacterDataModified",
                                                        cdm_listener, false);
