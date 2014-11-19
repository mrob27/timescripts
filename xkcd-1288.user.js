// ==UserScript==
// @namespace mrob.com
// @name XKCD 1288 substitutions by mrob27
// @description See xkcd.com/1288
// @author Robert Munafo (derived from code by Eternal Density)
// @version 9529.72
// @downloadURL http://mrob.com/time/scripts-beta/xkcd-1288.user.js
// @match *://*/*
// ==/UserScript==

// REVISION HISTORY:
//
// np8959.09: Copy from Eternal Density's version and add comments
// np9529.72: replace the pony mappings with those in xkcd 1288
// foo3

function leopardize(str)
{
  return str
    .replace(/\bkeyboard\b/gi,"leopard") // xkcd 1031
    .replace(/\bbird\b/gi,"dinosaur") // xkcd 1211

    .replace(/\bwitnesses\b/gi,"these dudes I know")
    .replace(/\ballegedly\b/gi,"kinda probably")
    .replace(/\bnew study\b/gi,"Tumblr post")
    .replace(/\brebuild\b/gi,"avenge")
    .replace(/\bspace\b/gi,"spaaace")
    .replace(/\bGoogle Glass\b/gi,"Virtual Boy")
    .replace(/\bsmartphone\b/gi,"Pokédex")
    .replace(/\belectric\b/gi,"atomic")
    .replace(/\bsenator\b/gi,"elf-lord")
    .replace(/\bcar\b/gi,"cat")
    .replace(/\belection\b/gi,"eating contest")
    .replace(/\bcongressional leaders\b/gi,"river spirits")
    .replace(/\bHomeland Security\b/gi,"Homestar Runner")
    .replace(/\bcould not be reached for comment\b/gi,"is guilty and everyone knows it")
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
