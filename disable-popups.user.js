// ==UserScript==
// @namespace http://mrob.com/time/scripts-beta
// @name disable-popups
// @description Disable JavaScript Alert, Confirm and Prompt on all sites
// @author Robert Munafo
// @version 18597.51
// @downloadURL http://mrob.com/time/scripts-beta/disable-popups.user.js.txt
// @run-at document-start
// ==/UserScript==
//
// Source:
//   superuser.com/questions/455863/how-can-i-disable-javascript-popups-alerts-in-chrome

addJS_Node (null, null, overrideSelectNativeJS_Functions);

function overrideSelectNativeJS_Functions ()
{
  window.alert = function alert (message) {
    console.log ('alert(' . message . ')'); }
  window.confirm = function confirm (message) {
    console.log ('confirm(' . message . ')'); }
  window.prompt = function prompt (message, defmsg) {
    console.log ('prompt(' . message . ', ' . defmsg . ')'); }
}

function addJS_Node (text, s_URL, funcToRun) {
  var D                                   = document;
  var scriptNode                          = D.createElement ('script');
  scriptNode.type                         = "text/javascript";
  if (text)       scriptNode.textContent  = text;
  if (s_URL)      scriptNode.src          = s_URL;
  if (funcToRun)  scriptNode.textContent  = '(' + funcToRun.toString() + ')()';

  var targ = D.getElementsByTagName ('head')[0] || D.body || D.documentElement;
  targ.appendChild (scriptNode);
}
