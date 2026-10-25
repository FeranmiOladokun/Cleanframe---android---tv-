(function(){
'use strict';
var key='cleanframe.android.spotify.v1',choices=['left','center','weather','off'],names=['Lower left','Above dock','Below weather','Off'],saved='left',draft='left',row=0,opened=false,banner,editor,timer=null,lastRead=0,data={},readAt=0,lastArt='';
try{var p=localStorage.getItem(key);if(choices.indexOf(p)>=0)saved=p;}catch(e){}
function time(ms){var n=Math.max(0,Math.floor(ms/1000));return Math.floor(n/60)+':'+('0'+n%60).slice(-2);}
function refresh(force){
 if(!banner||document.hidden)return;
 var state=window.ShoreQA&&ShoreQA.state(),home=state&&state.view==='home',position=opened?draft:saved;
 var blocked=document.documentElement.classList.contains('quick-open')||document.documentElement.classList.contains('dock-edit');
 if((!home&&!opened)||blocked||position==='off'){banner.hidden=true;return;}
 var now=Date.now();
 if(force||now-lastRead>=3000){lastRead=now;try{data=JSON.parse(AndroidFrame.quickState());readAt=now;}catch(e){data={};}}
 banner.hidden=!(data.access&&data.active&&data.playing);if(banner.hidden)return;
 banner.querySelector('.music-title').textContent=data.title||'Spotify';banner.querySelector('.music-artist').textContent=data.artist||data.album||'';
 var art=data.art||'',img=banner.querySelector('.music-art-img');if(art!==lastArt){if(art)img.src=art;else img.removeAttribute('src');lastArt=art;}img.hidden=!art;banner.querySelector('.music-art-placeholder').hidden=!!art;
 var duration=Number(data.duration),valid=duration>0&&typeof data.position==='number'&&data.position>=0,elapsed=valid?Math.min(duration,Math.max(0,data.position+(now-readAt))):0;
 banner.querySelector('.music-timeline').hidden=!valid;banner.querySelector('.music-fill').style.width=(valid?elapsed/duration*100:0)+'%';banner.querySelector('.music-elapsed').textContent=time(elapsed);banner.querySelector('.music-duration').textContent=time(duration||0);
 var top=700;
 if(position==='weather')top=420;
 if(position==='center'){
  var stage=document.getElementById('stage').getBoundingClientRect(),dock=document.getElementById('dock').getBoundingClientRect();
  top=state.committed.layout==='dock'?Math.max(440,Math.min(760,(dock.top-stage.top)/(stage.width/1920)-188)):640;
 }
 banner.style.left=(position==='center'?720:96)+'px';banner.style.top=top+'px';
}
function render(){Array.prototype.forEach.call(editor.querySelectorAll('[data-music-choice]'),function(b,i){b.classList.toggle('is-focus',i===row);b.setAttribute('aria-checked',String(choices[i]===draft));b.querySelector('small').textContent=choices[i]===draft?'Selected':'';});refresh(true);}
function close(apply){if(apply){try{localStorage.setItem(key,draft);saved=draft;}catch(e){editor.querySelector('.music-help').textContent='Could not save. Back keeps your previous placement.';return;}}opened=false;editor.hidden=true;document.documentElement.classList.remove('music-edit');refresh(true);}
function ensure(){if(banner)return;
 banner=document.createElement('aside');banner.className='music-banner';banner.hidden=true;banner.setAttribute('aria-label','Spotify Now Playing');banner.innerHTML='<div class="music-art"><img class="music-art-img" alt="Album art" hidden><div class="music-art-placeholder" aria-hidden="true">♪</div></div><div class="music-copy"><div class="music-title"></div><div class="music-artist"></div><div class="music-timeline"><div class="music-progress"><div class="music-fill"></div></div><div class="music-times"><span class="music-elapsed"></span><span class="music-duration"></span></div></div></div><div class="music-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></div>';
 document.getElementById('stage').appendChild(banner);
 editor=document.createElement('section');editor.hidden=true;editor.className='music-editor';editor.setAttribute('role','dialog');editor.setAttribute('aria-modal','true');editor.setAttribute('aria-label','Spotify placement');editor.innerHTML='<div class="music-editor-card"><div class="music-eyebrow">Layout</div><h2>Spotify placement</h2><p>Floating artwork, song details and progress.<br>Appears only while Spotify is playing.</p>'+choices.map(function(c,i){return '<button data-music-choice="'+c+'" role="radio" aria-checked="false"><span>'+names[i]+'</span><small></small></button>';}).join('')+'<p class="music-help">↑↓ preview · OK save · Back cancel</p></div>';
 document.getElementById('stage').appendChild(editor);editor.addEventListener('click',function(e){var b=e.target;while(b&&b!==editor&&!b.hasAttribute('data-music-choice'))b=b.parentNode;if(!b||b===editor)return;row=choices.indexOf(b.getAttribute('data-music-choice'));draft=choices[row];close(true);});
}
function start(){ensure();clearInterval(timer);refresh(true);timer=setInterval(function(){refresh(false);},1000);}
window.CleanFrameMusic={open:function(){ensure();draft=saved;row=choices.indexOf(saved);opened=true;editor.hidden=false;document.documentElement.classList.add('music-edit');render();},name:function(){return names[choices.indexOf(saved)];},state:function(){return saved;},refresh:function(){refresh(true);},preview:function(p){if(choices.indexOf(p)>=0){saved=p;refresh(true);}}};
document.addEventListener('keydown',function(e){if(!opened)return;var k=e.keyCode;if([37,38,39,40,13,27,8].indexOf(k)<0)return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat&&(k===13||k===27||k===8))return;if(k===27||k===8){close(false);return;}if(k===13){close(true);return;}row=Math.max(0,Math.min(3,row+(k===38||k===37?-1:1)));draft=choices[row];render();},true);
document.addEventListener('DOMContentLoaded',start);document.addEventListener('visibilitychange',function(){if(document.hidden){clearInterval(timer);timer=null;banner.hidden=true;}else start();});window.addEventListener('focus',function(){refresh(true);});
}());
