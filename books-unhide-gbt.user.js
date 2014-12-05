// ==UserScript==
// @namespace   http://mrob.com/time/scripts-beta
// @name books-unhide-gbt
// @description Alter style of gbt elements.
// @author    Robert Munafo
// @version   20141205.1557
// @downloadURL http://mrob.com/time/scripts-beta/books-unhide-gbt.user.js
// @include   https://*.googleusercontent.com/*
// ==/UserScript==

// REVISION HISTORY:
//
// 20141205.1557 First version.

var ttd;

guc_scanner = {
  scan: function ()
  {
    var i, f, j, e;
    var tms = document.getElementsByTagName("gbt");
    var nt = tms.length;
    console.info("got " + nt + " gbt elements");
    f = "";
    if (nt != ttd) {
      for (i=0; i<nt; i++) {
        if (tms[i].style) {
          tms[i].style.WebkitUserSelect = "text";
        }
        /* tms[i].innerHTML = tms[i].innerText + " "; */
        if (tms[i].innerText !== " ") {
          f = f + tms[i].innerText + " ";
        }
      }
      console.info(f);
      if (0) {
        /* Did not work -- I wonder why :-) */
        document.innerHTML = "<html><head></head><body>" + f + "</body>";
      }
      ttd = nt;
    }
    setTimeout(guc_scanner.scan.bind(guc_scanner), 1000);
  }
};

ttd = 0;

if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', // was 'load',
              guc_scanner.scan.bind(guc_scanner), false);
} else if (window.attachEvent) {
  window.attachEvent('onload',
             guc_scanner.scan.bind(guc_scanner));
} else {
  guc_scanner.scan(guc_scanner);
};

