// ==UserScript==
// @name            AUTOMOMEify for OTT
// @namespace       http://mrob.com/time/scripts-beta
// @description     Inserts automeme output in the xkcd fora.
// @version         26494.20
// @downloadURL     http://mrob.com/time/scripts-beta/automomeify.user.js.txt
// @include         http://forums.xkcd.com/*
// @include         http://www.forums.xkcd.com/*
// @include         http://fora.xkcd.com/*
// @include         http://www.fora.xkcd.com/*
// @include         http://forums3.xkcd.com/*
// @include         http://echochamber.me/*
// @include         http://www.echochamber.me/*
// @grant           GM_xmlhttpRequest
// ==/UserScript==

/* AUTOMOMEify version 26494.20
 * Copyright (C) 2014 Penguin Development and Robert Munafo (mrob27)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.

NOTES

Here are some posts that can be used to test what this script does:

   fora.xkcd.com/viewtopic.php?p=3592407#p3592407


REVISION HISTORY
 np10194.38 First version by @Link, OTT:1951:12#p3590925
 np10252.58 Many changes by @mrob27 to make it play better with other
userscripts. More needs to be done as this version does not make nice HTML
memes, it just substitutes plain text.
 np12258.49 Maximum title langth is actually 60 characters.
 np26307.28 Use mrob.com URL because @Link's version is randomly
doubling letters without my consent.
 np26493.87 Start subject lines with "1190: Time: "
 np26494.20 Use Link's much more thorough tests to find out if we're
on any OTT-related page; this makes the meme-in-subject thing work
when posting a reply via the "quote" button, in addition to when
making an original comment with the Post Reply button.

 */

var memes = [];
var mix = 0; // meme array index

function htmlify(m)
{
  var spl = m.split ('_');
  var s = spl[0];

  for (j = 1; j < spl.length - 1; j++) {
    s = s + ((j % 2) ? "<span style=\"font-style: italic\">" : "<\/span>")
          + spl[j];
  }

  if (spl.length > 1) {
    s = s + ((spl.length % 2) ? "<\/span>" : "_")
          + spl[spl.length - 1];
  }

  return ("<blockquote><div><cite>" + 
    "<a href=\"http://automome.penguindevelopment.org/\"" + 
    " class=\"postlink\">AUTOMOME</a> wrote:</cite>" + s +
    "</div></blockquote>");
};

/* Submit a request to Link's AUTOMOME server and get some meme
 * phrases. %%% I should also initiate a request to
 * http://mrob.com/time/automome/butan.php?n=27 and whichever request
 * completes first can set a flag telling the other to just do the
 * memes.concat() and not call automomeify. This will make the script
 * more resilient to the failage caused by a non-responsive server.*/
function get_memes ()
{
  if (memes.length == 0) {
    var req = new GM_xmlhttpRequest ({
      method: "GET",
           /* "http://automome.penguindevelopment.org/automome-web.py?n=32" */
      url:    "http://mrob.com/time/automome/butan.php?n=32",
      onload: function (resp)
      {
        memes = memes.concat(resp.responseText.trim().split ("\n"));
        // console.info('got ' + memes.length + ' memes');
        automomeify(false);
      }
    });
  } else {
    automomeify(false);
  }
};

/* %%% Once I figure out how O_o, this will:
 *   Change a text node to a more complex node containing some of the
 * original text plus HTML for an embedded AUTOMOME
 *
 * But for now we just change the text to the same text with memes in place
 * of any found magichars. */
function replaceTextContent(tNode)
{
  /* Get the node's text */
  var txt = tNode.textContent;

  /* Replace any embedded &Ue4a6 chars with the meme we just got. */
  var idx;
  while ((idx = txt.indexOf ("\uE4A6")) != -1) {
    // console.info('rtc found magic char in "' + txt + '"');

    mix = (mix + 1) % (memes.length);
    txt = txt.slice(0, idx)
          // + htmlify(memes[mix])
          + memes[mix] // plain-text cop-out
          + txt.slice(idx + 1);
  }

  // tNode.innerHTML = txt; // This does not work `\O_o/'
  tNode.textContent = txt; // plain-text cop-out
};

/* This recursively (depth-first) traverses a given DOM node and its
 * subnodes for text, and applies the filter to each. */
function changeTextNodes(node)
{
  var length, childNodes;

  // If this is a text node, AUTOMOMEify it
  if (node.nodeType == Node.TEXT_NODE) {
    replaceTextContent(node);
  } else {
    // This is something other than a text node, recurse any children
    childNodes = node.childNodes;
    length = childNodes.length;
    for (var i=0; i<length; ++i) {
      changeTextNodes(childNodes[i]);
    }
  }
};

/* Maximum length for the title "subject" of a post. The posting page
 * lets you type 64 characters, but silently truncates it to 60; we
 * need 12 for "1190: Time: " */
var max_title_length = 64 - 4 - 12;

/* If the 'detect' flag is true, determine whether there is any
 * AUTOMOMEing to do on this page, and return true or false. If
 * 'detect' is false, memes have been loaded from the server and we
 * can proceed to momeify. */
function automomeify (detect)
{
  /* Check if we're in the OTT. */
  var body = document.getElementById("page-body");
  if (!body)
    return false;
  var inTime = false;
  for (var i = 0; i < body.childNodes.length; i++)
  {
    var node = body.childNodes[i];
    /* Check for h2.topic-title or h2.posting-title, and see if it contains
     * '1190: "Time"'.  Then we are in the OTT, or in a thread that pretends
     * to be the OTT. */
    if (node.nodeName == "H2" && (node.className == "topic-title" ||
        node.className == "posting-title") &&
        node.innerHTML.indexOf("1190: \"Time\"") != -1)
    {
      inTime = true;
      break;
    }
  }
  if (!inTime)
    return false;

  if (document.location.href.indexOf ("posting.php") != -1)
  {
    /* We we in the "Compose Post" or "Post a Reply" page (but not post
     * preview). We want to fetch a random meme and automatically paste
     * it into the Subject field. The user may edit it to something else. */
    var subj = document.getElementById ("subject");
    // console.info("subj.value is '" + subj.value + "'");
    /* Test for the generic subject; if it's anything else we should
     * leave it alone. */
    if (subj.value == "Re: 1190: \"Time\"") {
      if (memes.length == 0) {
        if (detect) {
          return true;
        } else {
          get_memes(); // Note this calls automomeify again after getting stuff
          return false;
        }
      }

      var m = memes.pop();

      /* Discard any that are too long for a subject line */
      while (m.length > max_title_length && memes.length > 0) {
        m = memes.pop();
      }

      // console.info("got '" + m + "'");

      if (m.length < max_title_length) {
        subj.value = "1190: Time: " + m;
      } else {
        if (detect) {
          return true;
        } else {
          get_memes(); // Note this calls automomeify again after getting stuff
          return false;
        }
      }
    }
  } else if (document.location.href.indexOf ("viewtopic.php") != -1) {
    if (detect) {
       /* We're just detecting. Use innerHTML as a quick way to spot
        * the presence of the magic character */
       if (document.body.innerHTML.indexOf("\uE4A6") != -1) {
         return true;
       }
       return false;
    }
    changeTextNodes(document.body);
  };
  return false;
}

/* Ask automomeify to detect if there is any work to do on this page */
if (automomeify(true)) {
  /* Yes! We need memes. get_memes will call automomeify(false) when
   * it gets some. */
  get_memes();
}
