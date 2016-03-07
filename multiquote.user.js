// ==UserScript==
// @namespace   http://mrob.com/time/scripts-beta
// @name        multiquote for OTT
// @description Changes quote buttons behaviour to quote multiple messages
// @author      Pikrass and mrob27
// @version     8233.07
// @downloadURL http://mrob.com/time/scripts-beta/multiquote.user.js.txt
// @resource quote_waiting imgs/quote_waiting.png
// @resource quote_ok imgs/quote_ok.png
// @include     http://forums.xkcd.com/viewtopic.php*
// @include     http://fora.xkcd.com/viewtopic.php*
// @include     http://echochamber.me/viewtopic.php*
// @include     http://forums.xkcd.com/posting.php*
// @include     http://fora.xkcd.com/posting.php*
// @include     http://echochamber.me/posting.php*
// ==/UserScript==

/*
REVISION HISTORY
 np1674.00 Version by Pikrass that was used as the basis of this version.

 np5330.00 Include the original post text in the editable area, so you
can edit out the parts you don't want right away.
 np8227.61 Add checkboxes at bottom (one currently unused), add
"quoter's name in blue" option
 np8233.07 Second option enables the "mrob27 enhancement"
 */

multiquote = {
  /* Load all our saved quotes/replies, so they're available in case the user wants
     to edit a previously-saved block of text. */
  init: function() {
    this.quotes = JSON.parse(GM_getValue('quotes', '{}'));
  },

  // Set a checkbox to be on or off
  setChkVal: function(chk, val) {
    if (val == 0) {
      chk.checked=false;
    } else {
      chk.checked=true;
    }
  },

  /* opt_action will set or clear an option. */
  opt_action: function(chk, optobj, nam) {
    // If the option was just initialized, it will now become set.
    // This makes sense becuse if they've just installed the script
    // and click on the checkbox, they want to set the checkbox.

    if (optobj.val == 0) {
      optobj.val = 1;
    } else {
      optobj.val = 0;
    }
    
    this.setChkVal(chk, optobj.val);
    chk.disabled = false;
    
    /* Save the user's work in a way that will persist across page loads.
     * see http://wiki.greasespot.net/GM_setValue */
    GM_setValue(nam, JSON.stringify(optobj.val));
  },

  make_checkbox: function(nam, title, optobj, pdiv) {
    // Make the checkbox for 'reveal light text'
    var chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.value = 'temp-' + nam;
    chk.id = nam;

    var lbl = document.createElement('label')
    lbl.htmlFor = nam;
    var lab_text = document.createTextNode(title);
    lbl.appendChild(lab_text);

    this.setChkVal(chk, optobj.val);
    chk.addEventListener('click',
                              this.opt_action.bind(this, chk, optobj, nam));
    pdiv.appendChild(chk); pdiv.appendChild(lbl);
  },

  /* create_checkboxen will add a checkbox that changes an option */
  create_checkboxen: function() {
    var container = document.createElement('div');

    var preDiv = document.createElement('div');
    preDiv.style.marginTop = '1px';
    preDiv.style.fontSize = '1.0em';
    preDiv.style.fontWeight = 'bold';
    preDiv.style.color = '#0B7';

    var optstitle = document.createTextNode("Multiquote by Pikrass, enhanced by Mrob27:");
    preDiv.appendChild(optstitle);

    var opts_div = document.createElement('div');
    opts_div.style.textAlign = 'left';

    // Make the checkbox for
    opts_div.appendChild(document.createTextNode("　　"));
    this.make_checkbox('o_hil_blue', 'Highlight Quoted Name in Blue', this.o_hil_blue, opts_div);

    // Make the checkbox for
    opts_div.appendChild(document.createTextNode("　"));
    this.make_checkbox('o_incl_quoted', 'Include Quoted Text In Edit Area',
                                                                this.o_incl_quoted, opts_div);

    container.appendChild(preDiv);
    container.appendChild(opts_div);

    return(container);
  },

  // Initialize options
  init_options: function() {
    this.o_hil_blue = { val: JSON.parse(GM_getValue('o_hil_blue', '0')) };
    if (typeof this.o_hil_blue == 'undefined') {
      this.o_hil_blue = { val: "0" };
      this.o_hil_blue.val = JSON.parse(GM_getValue('o_hil_blue', '0'));
    };

    this.o_incl_quoted = { val: JSON.parse(GM_getValue('o_incl_quoted', '0')) };
    if (typeof this.o_incl_quoted == 'undefined') {
      this.o_incl_quoted = { val: "0" };
      this.o_incl_quoted.val = JSON.parse(GM_getValue('o_incl_quoted', '0'));
    };
  },

  // Create the checkboxes.
  add_option_controls: function() {
    var footer = document.getElementById("page-footer");
    var ft_par = footer.parentNode;
    ft_par.insertBefore(this.create_checkboxen(), footer);
  },

  convert: function() {
    this.init(); // loads saved quote data

    this.init_options();
    this.add_option_controls();

    var buttons = document.getElementsByClassName('quote-icon');
    var i;
    for(i=0 ; i<buttons.length ; i++) {
      var link = buttons[i].firstChild;
      link.quoteUrl = link.href;
      link.href = 'javascript:;';
      link.eventListener = this.quote.bind(this, link);
      link.addEventListener('click', link.eventListener, false);
    }
  },

  quote: function(link) {
    var postbody = this.findAncestorByClass(link, 'postbody');

    link.removeEventListener('click', link.eventListener);
    link.eventListener = this.hideReplyArea.bind(this, link, postbody);
    link.addEventListener('click', link.eventListener, false);

    var req = new XMLHttpRequest();
    req.addEventListener('load', this.addQuote.bind(this, req, link));
    /* RPM 2013-10-27: We make a synchronous request (req.open's 3rd argument false)
       so that the text being quoted will be stored in this.quotes[num].quote by
       addQuote, so that in turn it is available to makeReplyArea.
          %%% This poses a problem: we're trying to load the whole "compose post"
       page and this might be slow; which means the user will be wondering why
       they just hit the Quote button and no text-input box is appearing. At the
       very least, we'd want to change the button to say "Wait..." after a
       millinewpix or two. Pikrass' proposed solution would be to create two
       text boxes, one of which is editable immediately and the other becomes
       editable after this HTTP request finishes. To avoid having another text
       box appear at an unpredictable time, it would need to be initially
       hidden and you'd have to click a Spoiler-button to make it visible. */
    req.open('get', link.quoteUrl, (this.o_incl_quoted.val == 0));
    req.send();
    link.style.backgroundImage = 'url("'+GM_getResourceURL('quote_waiting')+'")';

    this.makeReplyArea(postbody);
  },

  /* Upon completion of the HTTP request, we extract the body of the post (consisting
     only of the quoted text of the post you're replying to) and save it in our
     quotes[] array. */
  addQuote: function(req, link) {
    var areaPos = req.responseText.indexOf('<textarea name="message" id="message"');
    var beg = req.responseText.indexOf('[quote', areaPos)
    var end = req.responseText.indexOf('</textarea>', beg);
    var str = req.responseText.substring(beg, end);

    if (this.o_hil_blue.val) {
      str = str.replace(/(\[quote=&quot;)([^&]+)(&quot;\])/,
                        "$1\[color=#00C]$2\[/color]$3");
      // console.info("s2 is '" + str + "'");
    };

    var num = link.quoteUrl.match(/&p=(\d+)/)[1];

    if(typeof this.quotes[num] == 'undefined') {
      this.quotes[num] = {};
    }

    this.quotes[num].quote = str;

    GM_setValue('quotes', JSON.stringify(this.quotes));
    link.style.backgroundImage = 'url("'+GM_getResourceURL('quote_ok')+'")';
  },

  makeReplyArea: function(div) {
    var post = this.findAncestorByClass(div, 'post');
    var pId = post.id.substr(1);

    var container = document.createElement('div');

    var preDiv = document.createElement('div');
    preDiv.appendChild(document.createTextNode('Reply:'));
    preDiv.style.marginTop = '10px';
    preDiv.style.fontSize = '1.3em';

    var area = document.createElement('textarea');
    area.className = 'multiquote-reply';
    if (this.o_incl_quoted.val) {
      /* RPM 2013-10-27: Fill the reply with the quote-text, so that the user
       * can remove unwanted text right away */
      area.value = this.quotes[pId].quote.replace(/&quot;/gmi, '"')
        .replace(/&#39;/g,"'").replace(/&#40;/g,'(').replace(/&#41;/g,')')
        .replace(/&#46;/g,'.').replace(/&#58;/g,':');
      area.style.height = '300px'; /* 100px is Waaaaayyyy too small! */
    } else {
      area.style.height = '100px';
    };
    area.style.width = '100%';
    area.style.fontSize = '1.2em';

    var butDiv = document.createElement('div');
    butDiv.style.textAlign = 'right';
    var but = document.createElement('input');
    but.type = 'button';
    but.value = 'Save';
    but.style.fontWeight = 'bold';
    but.addEventListener('click', this.addReply.bind(this, area, pId, but));
    butDiv.appendChild(but);

    area.addEventListener('keypress', this.onAreaChange.bind(this, area, but));

    container.appendChild(preDiv);
    container.appendChild(area);
    container.appendChild(butDiv);

    div.appendChild(container);
  },

  showReplyArea: function(link, div)
  {
    div.lastChild.style.display = '';

    link.removeEventListener('click', link.eventListener);
    link.eventListener = this.hideReplyArea.bind(this, link, div);
    link.addEventListener('click', link.eventListener, false);
  },

  hideReplyArea: function(link, div)
  {
    div.lastChild.style.display = 'none';

    link.removeEventListener('click', link.eventListener);
    link.eventListener = this.showReplyArea.bind(this, link, div);
    link.addEventListener('click', link.eventListener, false);
  },

  onAreaChange: function(area, but)
  {
    but.value = 'Save';
    but.disabled = false;
  },

  /* addReply is called when the user clicks the "Save" button;
   * it saves the contents of the textarea into this.quotes[num].reply
   * note that 'num' is eqivalent to 'pId' seen in makeReplyArea */
  addReply: function(area, num, but)
  {
    if(typeof this.quotes[num] == 'undefined') {
      this.quotes[num] = {}; // This is *absolutely* thread-safe :D
    }

    this.quotes[num].reply = area.value;
    /* Save the user's work in a way that will persist across page loads.
     * see http://wiki.greasespot.net/GM_setValue */
    GM_setValue('quotes', JSON.stringify(this.quotes));

    but.value = 'Saved';
    but.disabled = true;
  },

  dumpQuotes: function()
  {
    this.init();
    this.init_options();

    var tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = this.aggregateQuotes();
    var str = tmpDiv.firstChild.data;

    var area = document.getElementById('message');
    area.value += str;

    var postButton = document.getElementsByName('post')[0];
    var previewButton = document.getElementsByName('preview')[0];
    var saveButton = document.getElementsByName('save')[0];
    postButton.addEventListener('click', this.flush.bind(this));
    previewButton.addEventListener('click', this.flush.bind(this));
    saveButton.addEventListener('click', this.flush.bind(this));
  },

  flush: function()
  {
    this.quotes = {};
    GM_deleteValue('quotes');
  },

  aggregateQuotes: function()
  {
    var s = '';
    var i;
    for (i in this.quotes) {
      if (s != '') {
        s += "\n\n";
      }

      if (this.o_incl_quoted.val) {
        /* RPM 2013-10-27: Since we now put the quote text into the reply
         * we no longer want to add it here. */
      } else {
        s += this.quotes[i].quote;
      };

      if (this.quotes[i].reply) {
        s += "\n" + this.quotes[i].reply;
      }
    }

    return s;
  },


  findAncestorByClass: function(elem, className) {
    if(new RegExp('\\b'+className+'\\b').test(elem.className))
      return elem;
    else {
      if(elem != document.body)
        return this.findAncestorByClass(elem.parentNode, className);
      return null;
    }
  }
};

/* If we are viewing a page, run the convert function, which installs the
   quote() function onto the Quote buttons. */
if(location.href.indexOf('viewtopic') != -1) {
  window.addEventListener('DOMContentLoaded', multiquote.convert.bind(multiquote));
};

/* If we are in the Posting page and not yet doing Preview/Edit, then run the
   dumpQuotes() function. */
if ( location.href.indexOf('posting') != -1
  && location.href.indexOf('mode=edit') == -1)
{
  window.addEventListener('DOMContentLoaded', multiquote.dumpQuotes.bind(multiquote));
};
