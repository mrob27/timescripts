// ==UserScript==
// @namespace   http://mrob.com/time/scripts-beta
// @name        soundcloud-kill-autoplay
// @version     20140811
// @author      Robert Munafo (inspired by Andreas J. Schwarz)
// @downloadURL http://mrob.com/time/scripts-beta/soundcloud-kill-autoplay.user.js
// @include     https://soundcloud.com/*
// ==/UserScript==
//
// This script waits 100 seconds and then deletes the JQuery object $.
// This has the effect of stopping the "infinite play" after the
// current song ends. It also means you can't follow any of the links
// to other tracks, use the menubar, etc. but if you want those you
// can just reopen the page in a new window or tab.
//    %%% It would be better to analyze how JQuery is being used by the
// infinite-play, and only patch the specific JQuery function(s) in a way
// sufficient to stop autoplay but not interfere with the rest.
//
// REVISION HISTORY
// 20131119 Original (broken) version.from userscripts.org/scripts/review/160271
// 20140811 Simplify, eliminate switch (we might add it back later) and make it work by deleting the $ object (since the Window.soundManager object is no longer accessible).
var soundcloud_kill_autoplay = function()
{
  var init, initInterval, playlist;
  var ctr = 0;

  playlist = null;

  if (unsafeWindow.top === !unsafeWindow.self) {
    return;
  }

  init = function() {
    if (ctr <= 1) {
      unsafeWindow.console.log('soundcloud_kill_autoplay: waiting 100 sec...');
    };
    ctr++;
    if (ctr > 1000) {
      /* Look for JQuery object */
      playlist = unsafeWindow.$;
      if (playlist != null) {
        /* Delete all JQuery data, functions, and scope */
        unsafeWindow.console.log('soundcloud_kill_autoplay: deleting $');
        unsafeWindow.$ = "";
        clearInterval(initInterval);
      }
    }
    /* 1st removed block was here */
  };

  initInterval = setInterval(init, 100);

  /* 2nd removed block was here */

};

soundcloud_kill_autoplay();

/*
    playlist = (_ref = unsafeWindow.soundManager) != null ? (_ref1 = _ref.soundIDs) != null ? _ref1.slice(0) : void 0 : void 0;
    if (playlist != null) {
      unsafeWindow.console.log('soundcloud_userscript: ready!');
      soundmanager = unsafeWindow.soundManager;
      unsafeWindow.console.log('soundcloud_userscript: soundManager fetched');
      clearInterval(initInterval);
      activated = GM_getValue('status', true);
      if (activated) {
        unsafeWindow.console.log('soundcloud_userscript: infinit play mode started');
        infinitePlayInterval = setInterval(infinitePlay, 500);
      }
      return generateSwitch();
    }
*/


/*
  infinitePlay = function() {
    var track, trackID, _i, _len;
    if (activated) {
      playlist = soundmanager.soundIDs;
      for (_i = 0, _len = playlist.length; _i < _len; _i++) {
        trackID = playlist[_i];
        track = soundmanager.getSoundById(trackID);
        if (track.position > 0 && track.paused === false) {
          if (track.duration - track.position < 600) {
            track.togglePause();
            unsafeWindow.console.log('soundcloud_userscript: track stopped');
            return true;
          }
        }
      }
    }
  };

  handleSwitch = function() {
    activated = !activated;
    GM_setValue('status', activated);
    if (activated) {
      unsafeWindow.console.log('soundcloud_userscript: infinit play mode started');
      return infinitePlayInterval = setInterval(infinitePlay, 500);
    } else {
      clearInterval(infinitePlayInterval);
      return unsafeWindow.console.log('soundcloud_userscript: infinite play mode stopped');
    }
  };

  generateSwitch = function() {
    var checkbox, panel, switchContainer, _ref, _ref1, _ref2;
    switchContainer = document.createElement('div');
    switchContainer.id = 'switchContainer';
    if (activated) {
      checkbox = 'unchecked';
    } else {
      checkbox = 'checked';
    }
    switchContainer.innerHTML = '<div id="onoffswitch" class="onoffswitch">' + '<input type="checkbox" id="onoffswitchID" name="onoffswitch" class="onoffswitch-checkbox"' + ("" + checkbox) + '>' + '<label class="onoffswitch-label" for="onoffswitchID">' + '<div class="onoffswitch-inner"></div>' + '<div class="onoffswitch-switch"></div>' + '</label>' + '</div>' + '<div class="switch-outerlabel">&nbsp;&nbsp;INFINITE PLAY&nbsp;&nbsp;</div>';
    panel = (_ref = document.getElementsByClassName('header__container')) != null ? _ref[0] : void 0;
    if ((_ref1 = panel.parentNode) != null) {
      _ref1.insertBefore(switchContainer, panel.nextSibling);
    }
    return (_ref2 = document.getElementById('onoffswitchID')) != null ? _ref2.onclick = handleSwitch : void 0;
  };

  GM_addStyle("#switchContainer{  background-color:#FFFFFF;}");

  GM_addStyle("#onoffswitch{  float: right;  margin-top: 12px;}");

  GM_addStyle(".switch-outerlabel{  float: right;  margin: 13px 0px 25px 5px;  background-color:white;  border-radius: 5px;  text-align: right;}");

  GM_addStyle(".onoffswitch{   position: relative;  width: 56px;  -webkit-user-select:none;  -moz-user-select:none;  -ms-user-select: none;}");

  GM_addStyle(".onoffswitch-checkbox{  display: none;}");

  GM_addStyle(".onoffswitch-label{  display: block; overflow: hidden; cursor: pointer;  border: 2px solid #999999; border-radius: 5px;}");

  GM_addStyle(".onoffswitch-inner {  width: 200%; margin-left: -100%;  -moz-transition: margin 0.3s ease-in 0s; -webkit-transition: margin 0.3s ease-in 0s;  -o-transition: margin 0.3s ease-in 0s; transition: margin 0.3s ease-in 0s;}");

  GM_addStyle(".onoffswitch-inner:before, .onoffswitch-inner:after{  float: left; width: 50%; height: 19px; padding: 0; line-height: 19px;  font-size: 12px; color: white; font-family: Trebuchet, Arial, sans-serif; font-weight: bold;  -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box;}");

  GM_addStyle(".onoffswitch-inner:before{  content: 'ON';  padding-left: 5px;  background-color: #FF4A00; color: #FFFFFF;}");

  GM_addStyle(".onoffswitch-inner:after{  content: 'OFF';  padding-right: 5px;  background-color: #D7D7D7; color: #999999;  text-align: right;}");

  GM_addStyle(".onoffswitch-switch{  width: 19px; margin: 0px;  background: #FFFFFF;  border: 2px solid #999999; border-radius: 5px;  position: absolute; top: 0; bottom: 0; right: 33px;  -moz-transition: all 0.3s ease-in 0s; -webkit-transition: all 0.3s ease-in 0s;  -o-transition: all 0.3s ease-in 0s; transition: all 0.3s ease-in 0s;  background-image: -moz-linear-gradient(center top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%);  background-image: -webkit-linear-gradient(center top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%);  background-image: -o-linear-gradient(center top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%);  background-image: linear-gradient(center top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%);}");

  GM_addStyle(".onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner{  margin-left: 0;}");

  GM_addStyle(".onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-switch{  right: 0px;}");
*/


/*

Here is another version that seems to be more accurate. Note change in %%%
  To find the new anchor and button classnames one can use jQuery commands like:
  jQuery("a")
  jQuery("button")
  jQuery("button.sc-ir")

// ==UserScript==
// @name           SoundCloud Continuous Play Disable/Enable Switch 
// @namespace      http://www.technowise.in
// @author         Technowise
// @description    Adds switch to Disable or Enable Continuous Play in SoundCloud.
// @include        http://www.soundcloud.com/*
// @include        https://www.soundcloud.com/*
// @include        http://soundcloud.com/*
// @include        https://soundcloud.com/*
// @version        0.2
// ==/UserScript==

//-------------------------------------------------------------------
// SoundCloud Continuous Play Disable/Enable Switch
// By Technowise — Last update Oct 18, 2013

var sc_cp = {};
sc_cp.JQ = null;
sc_cp.lastTitle = null;
sc_cp.userSwitchedPlay = false;
sc_cp.continuousPlayActivated =  false;//Default = disable continuous play( Set this to true for enabling by default).
sc_cp.checkTitleInterval = null;

GM_wait();

function myMain()
{  
  sc_cp.lastTitle = sc_cp.JQ("a.playbackTitle:first").attr("title");
    
  if( !sc_cp.continuousPlayActivated )
  {
    sc_cp.checkTitleInterval = setInterval(checkTitle, 900);
  }

  sc_cp.JQ(".sc-button-play, .skipControl, .sound__waveform").live("click", function()
  {
    sc_cp.userSwitchedPlay = true;
    sc_cp.lastTitle = sc_cp.JQ("a.playbackTitle:first").attr("title");
  });
  setTimeout(generateSwitch, 2000);//Setup the switch after 2 seconds from page load.
}

function checkTitle()
{
  // %%% Change this to: "a.soundTitle__title:first"
  //
  titleNow = sc_cp.JQ("a.playbackTitle:first").attr("title");
  if( typeof sc_cp.lastTitle != 'undefined' && titleNow != sc_cp.lastTitle  && sc_cp.userSwitchedPlay != true )
  {
    sc_cp.lastTitle = titleNow;
    sc_cp.JQ(".playControl.playing").click();//Pause the track. (Do not autoplay next track you smart nut SoundCloud!).
  }
  else
  if( sc_cp.userSwitchedPlay )//silently change the sc_cp.lastTitle.
  {
     sc_cp.lastTitle = titleNow;
  }
  sc_cp.userSwitchedPlay = false;
}

function GM_wait() 
{  
    if(typeof unsafeWindow.jQuery == 'undefined') 
  { 
    window.setTimeout(GM_wait, 200);
  }
    else 
    { 
    sc_cp.JQ = unsafeWindow.jQuery;
        myMain();
  }
}

function generateSwitch()
{
    var checkbox = 'checked', switchContainer;
    switchContainer = document.createElement('div');
    switchContainer.id = 'switchContainer';
    if ( !sc_cp.continuousPlayActivated ) 
  {
      checkbox = 'unchecked';
    } 
    switchContainer.innerHTML = '<div id="cp_onoffswitch" class="onoffswitch">' + '<input type="checkbox" id="onoffswitchID" name="onoffswitch" class="onoffswitch-checkbox"' + ("" + checkbox) + '>' + '<label class="onoffswitch-label" for="onoffswitchID">' + '<div class="onoffswitch-inner"></div>' + '<div class="onoffswitch-switch"></div>' + '</label>' + '</div>' + '<div class="switch-outerlabel">&nbsp;&nbsp;Continuous Play&nbsp;&nbsp;</div>';
    
  if( sc_cp.JQ("#onoffswitchID").length == 0 )
  {
    sc_cp.JQ(".header__container").append( switchContainer );
  }
  //Add styles to our little switches.

  GM_addStyle("#switchContainer{  background-color:#FFFFFF;}");
  GM_addStyle("#cp_onoffswitch{  float: right;  margin-top: 7px;}");
  GM_addStyle(".switch-outerlabel{  float: right;  margin: 7px 0px 7px 5px;  background-color:white;  border-radius: 5px;  text-align: right;}");
  GM_addStyle(".onoffswitch{   position: relative;  width: 56px;  -webkit-user-select:none;  -moz-user-select:none;  -ms-user-select: none;}");
  GM_addStyle(".onoffswitch-checkbox{  display: none;}");
  GM_addStyle(".onoffswitch-label{  display: block; overflow: hidden; cursor: pointer;  border: 2px solid #999999; border-radius: 5px;}");
  GM_addStyle(".onoffswitch-inner {  width: 200%; margin-left: -100%;  -moz-transition: margin 0.3s ease-in 0s; -webkit-transition: margin 0.3s ease-in 0s;  -o-transition: margin 0.3s ease-in 0s; transition: margin 0.3s ease-in 0s;}");
  GM_addStyle(".onoffswitch-inner:before, .onoffswitch-inner:after{  float: left; width: 50%; height: 19px; padding: 0; line-height: 19px;  font-size: 12px; color: white; font-family: Trebuchet, Arial, sans-serif; font-weight: bold;  -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box;}");
  GM_addStyle(".onoffswitch-inner:before{  content: 'ON';  padding-left: 5px;  background-color: #FF4A00; color: #FFFFFF;}");
  GM_addStyle(".onoffswitch-inner:after{  content: 'OFF';  padding-right: 5px;  background-color: #D7D7D7; color: #999999;  text-align: right;}");
  GM_addStyle(".onoffswitch-switch{  width: 19px; margin: 0px;  background: #FFFFFF;  border: 2px solid #999999; border-radius: 5px;  position: absolute; top: 0; bottom: 0; right: 33px;  -moz-transition: all 0.3s ease-in 0s; -webkit-transition: all 0.3s ease-in 0s;  -o-transition: all 0.3s ease-in 0s; transition: all 0.3s ease-in 0s;  background-image: -moz-linear-gradient(center top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%);  background-image: -webkit-linear-gradient(center top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%);  background-image: -o-linear-gradient(center top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%);  background-image: linear-gradient(center top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%);}");
  GM_addStyle(".onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner{  margin-left: 0;}");
  GM_addStyle(".onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-switch{  right: 0px;}");
  sc_cp.JQ("#onoffswitchID").click( toggleContinuousPlay );
};

function toggleContinuousPlay(event)
{
  sc_cp.continuousPlayActivated = !sc_cp.continuousPlayActivated;    
    if ( sc_cp.continuousPlayActivated ) 
  {
    clearInterval(sc_cp.checkTitleInterval);
    } 
  else 
  {
    sc_cp.checkTitleInterval = setInterval(checkTitle, 900);
    }
  return true;
}

*/
