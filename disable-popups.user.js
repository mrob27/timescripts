// ==UserScript==
// @namespace http://mrob.com/time/scripts-beta
// @name disable-popups
// @description Disable JavaScript Alert, Confirm and Prompt on all sites
// @author Robert Munafo
// @version 18597.51
// @downloadURL http://mrob.com/time/scripts-beta/disable-popups.user.js
// @run-at document-start
// ==/UserScript==

addJS_Node (null, null, overrideSelectNativeJS_Functions);

function overrideSelectNativeJS_Functions ()
{
  window.alert = function alert (message) {
    console.log ('alert(' . message . ')'); }
  window.confirm = function confirm (message) {
    console.log ('confirm(' . message . ')'); }
  window.prompt = function prompt (message) {
    console.log ('prompt(' . message . ')'); }
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
