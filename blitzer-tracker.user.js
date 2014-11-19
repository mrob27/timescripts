/*!
// ==UserScript==
// @namespace mrob.com
// @name Blitzer Tracker
// @version 6026.68
// @description Automatically reports a blitzer's location on the OTT to AluisioASG's database
// @author Aluísio Augusto Silva Gonçalves <aasg@chirpingmustard.com>
// @downloadURL http://mrob.com/time/scripts-beta/blitzer-tracker.user.js
// @match http://forums.xkcd.com/viewtopic.php*
// @match http://fora.xkcd.com/viewtopic.php*
// @match http://echochamber.me/viewtopic.php*
// @grant GM_getValue
// @grant GM_setValue
// ==/UserScript==
//
// originally from http://time.aasg.name/userscripts/BlitzerTracker.user.js
//   version 0.5.0 of 20131017
// Aluísio wrote this in LiveScript, and compiled into the compact form
//   seen here. I have de-obfuscated it a bit to add comments, disambiguate the
//   error messages, etc.
//
// REVISION HISTORY
// 6026.68 First version
// 6458.58 Renamed and revision history added
*/
(function(){
function a(a){
b[a.toLowerCase()]=function(b,c,d,e){
var f;f=this.createRequest(a,b,d,e),
f.setRequestHeader("Content-Type","application/json"),
f.send(JSON.stringify(c))}}
var b,c,d,e,f,g,h,i,j,k,l,m,n,o;
for(b={},b.root="http://v3.db.aasg.name",
b.createRequest=function(a,b,c,d){
var e;
return e=new XMLHttpRequest,
  e.open(a,this.root+"/"+b,!0),
  e.addEventListener("load",
  function(){
var a;switch(!1){
case 200!==(a=e.status)&&204!==a:c(e); break;
default:"function"==typeof d&&d(e,e.status)}}),
e.addEventListener("error",function(){
"function"==typeof d&&d(e,"error")}),
e.addEventListener("abort",function(){
"function"==typeof d&&d(e,"aborted")}),e},
b.get=function(a,b,c){
var d;d=this.createRequest("GET",a,b,c),d.send()},
c=0,d=["POST","PUT"].length;d>c;++c)a.call(this,["POST","PUT"][c]);
e="101043",f=function(a){
var b;b=document.querySelector("#topic-search input[name=t]").value,
b===e&&a()},g=5,h=90,i=function(){
var a;return"undefined"!=typeof on_page&&null!==on_page?+on_page:
(a=document.querySelector("h2 a").href.replace(/.*\bstart=(\d+)\b.*/,"$1"),+a/40+1)},
j=function(a,c){
b.get("blitzertracker/locations/"+a,function(a){
var b;c(!(null==(b=JSON.parse(a.responseText))||!b.nukeLocalRecord))},
function(){c(!1)})},
k=function(a,c){
var d;d={location:c,nukeLocalRecord:!1},
b.put("blitzertracker/locations/"+a,d,function(){
console.info("Blitzer Tracker: report sent successfully"),
GM_setValue("lastLocation",c)},function(a,b){
console.error(function(){
switch(b){
  case"error":return"Blitzer Tracker: err-01 unknown error during report send";
  case"aborted":return"Blitzer Tracker: err-02 report send aborted";
  default:return"Blitzer Tracker: err-03 failed to send report: code "+b}}())})},
l=function(a,c){
var d;return null==c&&(c=new Date),d={lastCheckin:c},
b.put("blitzertracker/checkins/"+a,d,function(){
console.info("Blitzer Tracker: checked in successfully")},
function(a,b){console.error(function(){
switch(b){
  case"error":return"Blitzer Tracker: err-04 unknown error during check-in";
  case"aborted":return"Blitzer Tracker: err-05 check-in aborted";
  default:return"Blitzer Tracker: err-06 failed to check in: code "+b}}())}),c},
m=function(a,b,c){
return a||c>b&&b+g>=c},
n=function(a){
var b;b=l(a),document.addEventListener("visibilitychange",function(){
var c,d;c=new Date,d=(c-b)/1e3,!document.hidden&&d>h&&(b=l(a,c))})},
o=function(){
var a,b;return(a=GM_getValue("setupComplete"))?!0:(b=prompt(
  "Thank you for using the Blitzer Tracker!\n"
+ "Please enter your forum username so we can begin tracking your location."
))?(GM_setValue("username",b),GM_setValue("setupComplete",!0),!0):void 0},
f(function(){
var a;return o()?(a=GM_getValue("username"),n(a),j(a,
function(b){
var c,d;c=i(),(null==(d=GM_getValue("lastLocation"))||m(b,d,c))&&k(a,c)}),
void 0):(console.error("Blitzer Tracker: err-07 not configured"),
void 0)})}).call(this);
