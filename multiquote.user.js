// ==UserScript==
// @name Multiquote for the One True Forum
// @description Changes quote buttons behaviour to quote multiple messages
// @author Pikrass and mrob27
// @version 5330
// @resource quote_waiting imgs/quote_waiting.png
// @resource quote_ok imgs/quote_ok.png
// @include http://forums.xkcd.com/viewtopic.php*
// @include http://fora.xkcd.com/viewtopic.php*
// @include http://forums.xkcd.com/posting.php*
// @include http://fora.xkcd.com/posting.php*
// ==/UserScript==

multiquote = {
	init: function() {
		this.quotes = JSON.parse(GM_getValue('quotes', '{}'));
	},

	convert: function() {
		this.init();

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
		/* RPM 2013-10-27: Make a synchronous request (3rd argument false) so that
		 * the text being quoted will be stored in this.quotes[num].quote by
		 * addQuote, so that in turn it is available to makeReplyArea. */
		req.open('get', link.quoteUrl, false);
		req.send();
		link.style.backgroundImage = 'url("'+GM_getResourceURL('quote_waiting')+'")';

		this.makeReplyArea(postbody);
	},

	addQuote: function(req, link) {
		var areaPos = req.responseText.indexOf('<textarea name="message" id="message"');
		var beg = req.responseText.indexOf('[quote', areaPos)
		var end = req.responseText.indexOf('</textarea>', beg);
		var str = req.responseText.substring(beg, end);

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
		/* RPM 2013-10-27: Fill the reply with the quote-text, so that the user
		 * can remove unwanted text right away */
		area.value = this.quotes[pId].quote.replace(/&quot;/gmi, '"')
          .replace(/&#40;/g,'(').replace(/&#41;/g,')')
		  .replace(/&#46;/g,'.').replace(/&#58;/g,':');
		area.style.width = '100%';
		area.style.height = '300px'; /* 100px is Waaaaayyyy too small! */
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

	showReplyArea: function(link, div) {
		div.lastChild.style.display = '';

		link.removeEventListener('click', link.eventListener);
		link.eventListener = this.hideReplyArea.bind(this, link, div);
		link.addEventListener('click', link.eventListener, false);
	},

	hideReplyArea: function(link, div) {
		div.lastChild.style.display = 'none';

		link.removeEventListener('click', link.eventListener);
		link.eventListener = this.showReplyArea.bind(this, link, div);
		link.addEventListener('click', link.eventListener, false);
	},

	onAreaChange: function(area, but) {
		but.value = 'Save';
		but.disabled = false;
	},

	/* addReply is called when the user clicks the "Save" button;
	 * it saves the contents of the textarea into this.quotes[num].reply
	 * note that 'num' is eqivalent to 'pId' seen in makeReplyArea */
	addReply: function(area, num, but) {
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

	dumpQuotes: function() {
		this.init();

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

	flush: function() {
		this.quotes = {};
		GM_deleteValue('quotes');
	},

	aggregateQuotes: function() {
		var s = '';
		var i;
		for(i in this.quotes) {
			if(s != '')
				s += "\n\n";

			/* RPM 2013-10-27: Since we now put the quote text into the reply
			 * we n longer want to add it here. */
			/* s += this.quotes[i].quote; */

			if(this.quotes[i].reply)
				s += "\n" + this.quotes[i].reply;
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

if(location.href.indexOf('viewtopic') != -1)
	window.addEventListener('DOMContentLoaded', multiquote.convert.bind(multiquote));
if(location.href.indexOf('posting') != -1 && location.href.indexOf('mode=edit') == -1)
	window.addEventListener('DOMContentLoaded', multiquote.dumpQuotes.bind(multiquote));
