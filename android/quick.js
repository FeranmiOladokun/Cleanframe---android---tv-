(function(){
'use strict';
var overlay, row=0, col=1, timer=null, open=false, data={}, lastArt='', feedback='', closing=false, closeTimer=null;
var rows=[['previous','toggle','next'],['voldown','mute','volup'],['spotify','bluetooth','wifi'],['tvsettings','close']];
var labels={previous:'Previous',toggle:'Play',next:'Next',voldown:'Volume −',mute:'Mute',volup:'Volume +',spotify:'Spotify',bluetooth:'Bluetooth',wifi:'Wi-Fi',tvsettings:'TV settings',close:'Close'};
var icons={previous:'<path d="M5 4h3v16H5zm14 0v16L8 12z"/>',next:'<path d="M16 4h3v16h-3zM5 4l11 8-11 8z"/>',play:'<path d="m7 3 15 9-15 9z"/>',pause:'<path d="M5 3h5v18H5zm9 0h5v18h-5z"/>'};
function by(id){return document.getElementById(id);}
function svg(key){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[key]+'</svg>';}
function can(action){if(['previous','toggle','next'].indexOf(action)<0)return true;return !!data.access&&!!data.active&&!!data[action==='toggle'?'canToggle':action==='previous'?'canPrev':'canNext'];}
function focus(){Array.prototype.forEach.call(overlay.querySelectorAll('[data-quick]'),function(b){var a=b.getAttribute('data-quick');b.className='quick-button'+(a===rows[row][col]?' is-focus':'')+(can(a)?'':' is-unavailable');});}
function render(){
 by('quickSong').textContent=data.active?(data.title||'Spotify'):'Spotify';
 by('quickArtist').textContent=data.active?(data.artist||data.album||''):(data.access?'Start a song in Spotify':'Notification access is needed for song details');
 by('quickStatus').textContent=feedback||data.error||(data.active?(data.playing?'Playing':'Paused'):(data.access?'No active Spotify session':'Spotify controls are not connected'));
 by('quickVolume').textContent=data.fixedVolume?'External volume':data.muted?'Muted':(typeof data.volume==='number'?data.volume+' / '+data.volumeMax:'—');
 by('quickBar').style.width=data.volumeMax?Math.round(data.volume/data.volumeMax*100)+'%':'0%';
 var b=overlay.querySelector('[data-quick="toggle"]');b.innerHTML=svg(data.playing?'pause':'play');b.setAttribute('aria-label',data.playing?'Pause':'Play');
 overlay.querySelector('[data-quick="mute"]').textContent=data.muted?'Unmute':'Mute';
 var art=data.active&&data.art?data.art:'';
 if(art!==lastArt){by('quickArt').src=art;lastArt=art;}
 by('quickArt').hidden=!art;by('quickArtPlaceholder').hidden=!!art;
 focus();
}
function refresh(){if(!open||document.hidden)return;try{data=window.AndroidFrame?JSON.parse(AndroidFrame.quickState()):{access:false,volume:0,volumeMax:100};}catch(e){data={error:'Could not read media controls'};}render();}
function close(){if(closing||!open)return;open=false;closing=true;clearInterval(timer);timer=null;feedback='';overlay.classList.add('is-closing');var reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;closeTimer=setTimeout(function(){overlay.hidden=true;document.documentElement.classList.remove('quick-open');overlay.classList.remove('is-closing');closing=false;closeTimer=null;},reduced?0:160);}
function act(a){if(a==='close'){close();return;}if(!can(a)){feedback=data.access?'Start music in Spotify to use this control.':'Spotify notification access is not enabled.';render();return;}try{feedback=window.AndroidFrame?AndroidFrame.quickAction(a)||'':'Open CleanFrame on the TV to use this control.';}catch(e){feedback='This control is unavailable.';}refresh();}
function ensure(){if(overlay)return;overlay=document.createElement('section');overlay.className='quick-overlay';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Quick controls');
 var buttons=rows.map(function(r){return '<div class="quick-row">'+r.map(function(a){return '<button class="quick-button" data-quick="'+a+'" aria-label="'+labels[a]+'">'+(icons[a]?svg(a):labels[a])+'</button>';}).join('')+'</div>';});
 overlay.innerHTML='<div class="quick-shade"></div><div class="quick-card"><img class="quick-material" id="quickMaterial" alt=""><div class="quick-veil"></div><div class="quick-content"><div class="quick-handle" aria-hidden="true"></div><header class="quick-header"><h2 class="quick-title">Quick controls</h2><span class="quick-eyebrow">CleanFrame</span></header><div class="quick-cards"><section class="quick-section quick-music" aria-label="Spotify playback"><div class="quick-track"><img class="quick-art" id="quickArt" alt="Album art" hidden><div class="quick-art quick-art-placeholder" id="quickArtPlaceholder">♪</div><div class="quick-track-copy"><div class="quick-song" id="quickSong"></div><div class="quick-artist" id="quickArtist"></div><div class="quick-status" id="quickStatus"></div></div></div>'+buttons[0]+'</section><section class="quick-section quick-audio" aria-label="Volume"><div class="quick-volume"><span>Volume</span><span id="quickVolume"></span></div><div class="quick-bar"><div class="quick-bar-fill" id="quickBar"></div></div>'+buttons[1]+'</section></div><section class="quick-section quick-shortcuts" aria-label="Shortcuts"><div class="quick-shortcuts-title">Shortcuts</div>'+buttons[2]+buttons[3]+'</section><div class="quick-footer">Arrows to move · OK to select · Back to close</div></div></div>';
 by('stage').appendChild(overlay);
 overlay.addEventListener('click',function(e){var b=e.target;while(b&&b!==overlay&&!b.getAttribute('data-quick'))b=b.parentNode;if(!b||b===overlay)return;var a=b.getAttribute('data-quick');rows.forEach(function(r,i){var c=r.indexOf(a);if(c>=0){row=i;col=c;}});act(a);});
}
window.CleanFrameQuick={open:function(){ensure();var s=window.ShoreQA&&ShoreQA.state(),w=s&&s.committed.wall||'misty';var live=window.CleanFrameLive?CleanFrameLive.current():'off';by('quickMaterial').src=live!=='off'?'assets/reflections/'+live+'.jpg':'assets/materials/'+w+'-field-frost.jpg';clearTimeout(closeTimer);closeTimer=null;closing=false;overlay.classList.remove('is-closing');open=true;document.documentElement.classList.add('quick-open');row=0;col=1;feedback='';overlay.hidden=false;refresh();clearInterval(timer);timer=setInterval(refresh,3000);},close:close,isOpen:function(){return open;}};
function move(k){
 var current=rows[row][col],top=['previous','toggle','next','voldown','mute','volup'],target=current,list=null,i;
 if(k===37||k===39){
  list=top.indexOf(current)>=0?top:row===2?rows[2]:rows[3];
  i=list.indexOf(current);target=list[Math.max(0,Math.min(list.length-1,i+(k===39?1:-1)))];
 }else{
  var down={previous:'spotify',toggle:'spotify',next:'bluetooth',voldown:'bluetooth',mute:'wifi',volup:'wifi',spotify:'tvsettings',bluetooth:'tvsettings',wifi:'close'};
  var up={spotify:'toggle',bluetooth:'next',wifi:'mute',tvsettings:'spotify',close:'wifi'};
  target=(k===40?down:up)[current]||current;
 }
 rows.forEach(function(items,r){var c=items.indexOf(target);if(c>=0){row=r;col=c;}});
}
document.addEventListener('keydown',function(e){if(!open&&!closing)return;var k=e.keyCode;if([37,38,39,40,13,27,8].indexOf(k)<0)return;e.preventDefault();e.stopImmediatePropagation();if(closing)return;if(e.repeat&&(k===13||k===27||k===8))return;if(k===27||k===8){close();return;}if(k===13)act(rows[row][col]);else{move(k);focus();}},true);

document.addEventListener('visibilitychange',function(){if(!open)return;if(document.hidden){clearInterval(timer);timer=null;}else{refresh();clearInterval(timer);timer=setInterval(refresh,3000);}});
}());
