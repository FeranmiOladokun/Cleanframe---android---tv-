/* Desktop-only bridge. Preview actions never contact or control the TV. */
(function(){
'use strict';
var ids=['fire','snow','waves','amber'],video,ready=false,error='',selected=localStorage.getItem('cleanframe.desktop.live')||'waves';
var mediaStarted=Date.now();
var media={access:true,active:true,title:'All My Life (feat. J. Cole)',artist:'Lil Durk',playing:true,canToggle:true,canPrev:true,canNext:true,volume:26,volumeMax:100};
if(ids.indexOf(selected)<0&&selected!=='off')selected='waves';
if(!localStorage.getItem('cleanframe.home.v1'))localStorage.setItem('cleanframe.home.v1',JSON.stringify({version:2,look:{bg:'photo',layout:'dock',apps:'icons',controls:'icons',focus:'glass',material:'tint',font:'manrope',wall:'alpine'},home:['nuvio','stremio','smarttube','spotify','twitch'],lastApp:'nuvio',mode:'fixed'}));
if(!localStorage.getItem('cleanframe.android.dock.v1'))localStorage.setItem('cleanframe.android.dock.v1',JSON.stringify({size:80,height:60,glass:'liquid'}));
function notify(){if(window.CleanFrameLive)CleanFrameLive.nativeState();}
function select(id){selected=id;ready=false;error='';localStorage.setItem('cleanframe.desktop.live',id);video.pause();if(id==='off'){video.removeAttribute('src');video.load();video.hidden=true;notify();return;}video.hidden=false;video.src='/media/'+id+'.mp4';video.load();video.play().catch(function(){error='Click the TV frame to start the wallpaper.';notify();});notify();}
window.AndroidFrame={
 apps:function(){return JSON.stringify([{appId:'com.nuvio.app',name:'Nuvio'},{appId:'com.stremio.one',name:'Stremio'},{appId:'org.smarttube.stable',name:'SmartTube'},{appId:'com.spotify.tv.android',name:'Spotify'},{appId:'tv.twitch.android.app',name:'Twitch'}]);},
 launch:function(){return 'This desktop preview shows the launcher. Apps open on your TV.';},home:function(){return 'Google TV is available on the television.';},settings:function(){return 'Device settings are available on the television.';},
 quickState:function(){media.duration=222000;media.position=(84000+(media.playing?Date.now()-mediaStarted:0))%222000;return JSON.stringify(media);},quickAction:function(action){if(action==='toggle')media.playing=!media.playing;if(action==='voldown')media.volume=Math.max(0,media.volume-1);if(action==='volup')media.volume=Math.min(100,media.volume+1);if(action==='mute')media.muted=!media.muted;if(['spotify','bluetooth','wifi','tvsettings'].indexOf(action)>=0)return 'Preview only — this opens a device screen on the TV.';return '';},
 weatherState:function(){return JSON.stringify({fetched:Date.now(),cities:[{name:'Łódź',temperature:10,low:8,high:11,code:3,day:1},{name:'Warsaw',temperature:9,low:7,high:11,code:3,day:1}]});},
 liveState:function(){return JSON.stringify({selected:selected,current:ready?selected:'off',ready:ready,error:error,width:video?video.videoWidth:0,height:video?video.videoHeight:0,clips:ids.map(function(id){return {id:id,bytes:1};})});},
 liveSelect:function(id){if(id!=='off'&&ids.indexOf(id)<0)return 'Wallpaper unavailable';select(id);return '';}
};
document.addEventListener('DOMContentLoaded',function(){video=document.createElement('video');video.id='desktopVideo';video.muted=true;video.loop=true;video.autoplay=true;video.playsInline=true;video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('aria-hidden','true');document.body.insertBefore(video,document.body.firstChild);video.addEventListener('playing',function(){ready=true;error='';notify();});video.addEventListener('error',function(){ready=false;error='Wallpaper could not load.';notify();});document.addEventListener('pointerdown',function(){if(selected!=='off'&&video.paused)video.play().catch(function(){});},{once:true});select(selected);});
document.addEventListener('keydown',function(e){var k=e.key.toLowerCase();if(k==='h'||k==='f'){e.preventDefault();e.stopImmediatePropagation();parent.postMessage({cleanframeKey:k},location.origin);}},true);
document.addEventListener('visibilitychange',function(){if(!video)return;if(document.hidden)video.pause();else if(selected!=='off')video.play().catch(function(){});});
}());

addEventListener('message',function(e){if(e.origin===location.origin&&e.source===parent&&e.data&&window.CleanFrameMusic)CleanFrameMusic.preview(e.data.musicPlacement);});
