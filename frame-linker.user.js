// ==UserScript==
// @namespace http://mrob.com/time/scripts-beta
// @name frame-linker for OTT
// @copyright 2013+, Aluisio Augusto Silva Goncalves
// @copyright 2014, Robert Munafo (mrob27)
// @description Detects frame references on the xkcd 1190 forums thread, formatted like 'M#2440a', and replaces them with links for the viewers of the various frame numbering standards.
// @version 8026.18
// @downloadURL http://mrob.com/time/scripts-beta/frame-linker.user.js.txt
// @include http://forums.xkcd.com/viewtopic.php*
// @include http://fora.xkcd.com/viewtopic.php*
// @include http://echochamber.me/viewtopic.php*
// @include http://forums.xkcd.com/posting.php*
// @include http://fora.xkcd.com/posting.php*
// @include http://echochamber.me/posting.php*
// @run-at document-start
// ==/UserScript==

/*

Here is an example, of the original text (in "BBCode", really plain
ASCII since there are no BBCode tags here):

 A mscha frame:  M#2440
 mscha special:  M#2440a
 An Aubron frame:  A#42
 A GeekWagon frame:  G#403

In HTML as normally delivered by the server, each post (not counting
the signature, etc.) ends up being in a <div class="content"> block,
like this:

  <div class="content">A mscha frame:  M#2440<br /><br />mscha special:  M#2440aAn Aubron frame:  A#42<br />A GeekWagon frame:  G#403</div>

REVISION HISTORY
 Original version by AluisioASG:
  np2684.00 First version, announced in OTT:1052:2#p3403655. Compiled
to JavaScript by CoffeeScript 1.6.3
 Versions by Robert Munafo (mrob27):
  np7361.01 Formatting cleanup and block-header comments
  np7366.81 Convert to plain ASCII and add a few more comments
  np7369.27 Preserve original text, i.e. the link's text remains "M#2345"
instead of being turned into "2345 [mscha]"
  np8026.18 Also act on posting.php
  np8059.23 Stricter match patterns

*/

(function() {
  var CONVERTERS, STANDARDS, findTargetNodes, generateLink,
      generateTooltip, getConverter, getStandards, insertNodes,
      mapFrameNumber, match, rewriteNode,
    __slice = [].slice;

  STANDARDS = [
    {
      name: 'mscha',
      Nm: 'M',
      regexp: /\bM#(\d\d\d+[a-z]?)\b/i,
      rewrite: function(frame) {
        return "http://xkcd.mscha.org/viewer/" + frame;
      }
    }, {
      name: 'Aubron',
      Nm: 'A',
      regexp: /\bA#(\d\d\d+)\b/i,
      rewrite: function(frame) {
        return "http://xkcd.aubronwood.com/?i=" + frame + "&playing=0";
      }
    }, {
      name: 'geekwagon',
      Nm: 'G',
      regexp: /\bG#(\d\d\d+)\b/i,
      rewrite: function(frame) {
        return "http://geekwagon.net/projects/xkcd1190/?frame=" + frame;
      }
    }
  ];

  getStandards = function() {
    return STANDARDS;
  };

  match = function() {
    var args, fallback, result, test, _i, _len, _ref;
    fallback = arguments[0],
    args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      _ref = args[_i], test = _ref[0], result = _ref[1];
      if (test) {
        return result.toString();
      }
    }
    return fallback.toString();
  };

  CONVERTERS = {
    'mscha -> geekwagon': function(frameId) {
      var $, _, _ref;
      if (/^\d+[a-z]$/.test(frameId)) {
        _ref = [parseInt(frameId.slice(0, -1), 10),
        frameId.slice(-1)], $ = _ref[0], _ = _ref[1];
        return match('-', [(256 <= $ && $ <= 258), '-'],
                                       [$ === 2440, 2344 + _.charCodeAt(0)]);
      } else {
        $ = parseInt(frameId, 10);
        return match($, [$ >= 2441, $ + 5]);
      }
    },
    'mscha -> Aubron': function(frameId) {
      var $, _, _ref;
      if (/^\d+[a-z]$/.test(frameId)) {
        _ref = [parseInt(frameId.slice(0, -1), 10),
        frameId.slice(-1)], $ = _ref[0], _ = _ref[1];
        return match('-', [(256 <= $ && $ <= 258), $],
                                       [$ === 2440, 2347 + _.charCodeAt(0)]);
      } else {
        $ = parseInt(frameId, 10);
        return match($, [$ > 2440, $ + 8], [$ > 255, $ + 3]);
      }
    },
    'geekwagon -> mscha': function(frameId) {
      var $;
      $ = parseInt(frameId, 10);
      return match($, [(2441 <= $ && $ <= 2445),
                   2440 + String.fromCharCode($ - 2344)], [$ > 2445, $ - 5]);
    },
    'Aubron -> mscha': function(frameId) {
      var $;
      $ = parseInt(frameId, 10);
      return match($, [(2444 <= $ && $ <= 2448),
                      2440 + String.fromCharCode($ - 2347)],
                      [(256 <= $ && $ <= 258), $ + 'a'],
                      [$ > 2448, $ - 8], [$ > 258, $ - 3]);
    }
  };

  /* getConverter returns a function to convert a frame number from one
     system to another. If a direct conversion does not exist, it constructs
     a function that converts in two steps using mscha as the intermediate. */
  getConverter = function(sourceStandard, targetStandard) {
    var hasConverter, srcName, tgtName, _ref;
    hasConverter = function(from, to) {
      return ("" + from + " -> " + to) in CONVERTERS;
    };
    _ref = [sourceStandard.name, targetStandard.name],
    srcName = _ref[0], tgtName = _ref[1];
    if (hasConverter(srcName, tgtName)) {
      return CONVERTERS["" + srcName + " -> " + tgtName];
    } else if ((hasConverter(srcName, 'mscha'))
            && (hasConverter('mscha', tgtName))) {
      return function(frameId) {
        return CONVERTERS["mscha -> " + tgtName](
                             CONVERTERS["" + srcName + " -> mscha"](frameId));
      };
    } else {
      return function() {
        return '-';
      };
    }
  };

  mapFrameNumber = function(frameNumber, sourceStandard, targetStandard) {
    return (getConverter(sourceStandard, targetStandard))(frameNumber);
  };

  generateTooltip = function(frameNumber, sourceStandard, standardList) {
    var all, target;
    all = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = standardList.length; _i < _len; _i++) {
        target = standardList[_i];
        if (target.name !== sourceStandard.name) {
          _results.push("" + target.name + " "
                    + (mapFrameNumber(frameNumber, sourceStandard, target)));
        }
      }
      return _results;
    })();
    return all.join(' / ');
  };

  generateLink = function(frameNumber, standard, text) {
    var link;
    link = document.createElement('a');
    link.href = standard.rewrite(frameNumber);
    // link.textContent = "" + text + " [" + standard.name + "]";
    link.textContent = standard.Nm + "#" + text;
    link.title = generateTooltip(frameNumber, standard, getStandards());
    return link;
  };

  /* findTargetNodes uses an XPath query to find all the <div class="content">
     items, which contain the actual posts */
  findTargetNodes = function() {
    var xpath;
    xpath = '//div[@class="content"]//text()';
    return document.evaluate(xpath, document, null,
                             XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  };

  /* rewriteNode does most of the work. It takes a block of text in
     'node.node.textContent', splits it using the regexp of a given standard,
     and performs the transformation on the odd-number-indexed segments,
     concatenating it all together into a new text node. */
  rewriteNode = function(node, standard) {
    var i, part, text, _i, _len, _ref, _results;
    text = node.textContent;
    if (!text) {
      return [];
    }
    _ref = text.split(standard.regexp);
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      part = _ref[i];
      if ((i + 1) % 2 === 0) {
        _results.push(generateLink(part, standard, part));
      } else {
        _results.push(new Text(part));
      }
    }
    return _results;
  };

  insertNodes = function(originalNode, newNodes) {
    var node, parent, _i, _len;
    parent = originalNode.parentNode;
    for (_i = 0, _len = newNodes.length; _i < _len; _i++) {
      node = newNodes[_i];
      parent.insertBefore(node, originalNode);
    }
    return parent.removeChild(originalNode);
  };

  document.addEventListener('DOMContentLoaded', function() {
    var i, newNodes, node, standard, targetNodes, _i, _j, _len, _ref, _ref1;
    /* Get the specifications for each type of link we want to transform */
    _ref = getStandards();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      standard = _ref[_i];
      /* Get the posts' content */
      targetNodes = findTargetNodes();
      /* Iterate through each post. The loop is complex to deal with the
         possibility of snapshotLength being negative. %%% Does that ever
         happen? This might be CoffeeScript compiler boilerplate */
      for (i = _j = 0, _ref1 = targetNodes.snapshotLength;
           0 <= _ref1 ? _j < _ref1 : _j > _ref1;
           i = 0 <= _ref1 ? ++_j : --_j) {
        node = targetNodes.snapshotItem(i);
        newNodes = rewriteNode(node, standard);
        insertNodes(node, newNodes);
      }
    }
  });

}).call(this);
