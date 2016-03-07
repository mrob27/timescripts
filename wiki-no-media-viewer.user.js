// ==UserScript==
// @namespace    http://mrob.com/time/scripts-beta
// @name         wikipedia-disable-media-viewer
// @description  Disable Wikipedia's "Media Viewer", even when not logged in
// @author       Robert Munafo
// @version      11570.26
// @downloadURL  http://mrob.com/time/scripts-beta/wiki-no-media-viewer.user.js.txt
// @include      http://*.wikipedia.org/*
// @include      https://*.wikipedia.org/*
// @include      http://*.wikimedia.org/*
// @include      https://*.wikimedia.org/*
// @include      http://*.wikibooks.org/*
// @include      https://*.wikibooks.org/*
// @match        http://*.wikipedia.org/*
// @match        https://*.wikipedia.org/*
// @match        http://*.wikimedia.org/*
// @match        https://*.wikimedia.org/*
// @match        http://*.wikibooks.org/*
// @match        https://*.wikibooks.org/*
// @run-at       document-end
// ==/UserScript==

// REVISION HISTORY:
//
// np11570.26 First version
// 20140902 Add wikimedia.org
// 20151114 Add @run-at directive and use setTimeout (because the object mw is not defined right away)

/* Source:
  en.wikipedia.org/wiki/Wikipedia_talk:Media_Viewer/June_2014_RfC

  As far as I can tell, putting the following code into
  MediaWiki:Common.js should do the trick:

    mw.config.set("wgMediaViewerOnClick", false);

  This makes the decision to enable or disable Media Viewer within the
  purview of local site administrators. There are a variety of ways to
  make this code conditional, such as only applying it to users who
  use a particular skin (Vector, Monobook, etc.), users who are in a
  particular user group (autoconfirmed, sysop, etc.), users with a
  specified edit count or account registration date, and much more!
  Hope that helps. --MZMcBride (talk) 19:15, 10 July 2014 (UTC)

*/

setTimeout(function() {
  if (mw) {
    if (mw.config) {
      if (mw.config.set) {
        mw.config.set("wgMediaViewerOnClick", false);
      }
    }
  }
}, 1000);
