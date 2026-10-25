(function(){
'use strict';
var overlay, index=0, opened=false, data={}, pending=false, pendingId='off', timer=null, fx, context, last=0, elapsed=0, particles=[], selected='off';
var clips=[{id:'off',name:'Static wallpapers',detail:'Turn motion off · keep your saved background'},
{id:'fire',name:'Ember',detail:'Wood-burning fireplace · 4K upscale from Full HD'},
{id:'snow',name:'Alpine hush',detail:'Snow-covered Alps · native 4K + snowfall'},
{id:'waves',name:'Tidal light',detail:'Breaking ocean waves · 4K upscale from Full HD'},
{id:'amber',name:'Amber drift',detail:'Warm drifting bokeh · 4K upscale from Full HD'}];
function nativeState(){
 try{data=window.AndroidFrame&&AndroidFrame.liveState?JSON.parse(AndroidFrame.liveState()):{selected:'off',clips:[]};}catch(e){data={error:'Could not read live wallpapers.'};}
 selected=data.ready?data.current:'off';
 document.documentElement.classList.toggle('live-active',!!data.ready);
 if(fx){fx.hidden=!data.ready||['fire','snow'].indexOf(selected)<0;}
 if(pending&&((data.ready&&data.current===pendingId)||data.error||(pendingId==='off'&&data.selected==='off'))){pending=false;clearInterval(timer);timer=null;}
 if(window.CleanFrameDock) CleanFrameDock.refresh();
 if(opened)render();
}
function available(id){return id==='off'||(data.clips||[]).some(function(c){return c.id===id&&c.bytes>0;});}
function render(){
 var list=overlay.querySelector('.live-choices');
 list.innerHTML=clips.map(function(c,i){return '<button class="live-choice'+(i===index?' is-focus':'')+'" data-live="'+i+'" aria-pressed="'+(data.selected===c.id)+'"><span class="live-name">'+c.name+'</span><span class="live-detail">'+c.detail+(available(c.id)?'':' · Not installed')+'</span><span class="live-tick">'+(data.selected===c.id?'✓':'')+'</span></button>';}).join('');
 overlay.querySelector('.live-status').textContent=data.error||(pending?'Loading 4K wallpaper…':'OK to apply · Back to return · Silent, local playback');
}
function apply(){
 var id=clips[index].id;
 if(!available(id)){data.error='This wallpaper is not installed.';render();return;}
 try{var error=window.AndroidFrame&&AndroidFrame.liveSelect?AndroidFrame.liveSelect(id):'Live playback is available on the TV.';if(error){data.error=error;render();return;}}
 catch(e){data.error='Could not select wallpaper.';render();return;}
 pending=true;pendingId=id;data.error='';render();clearInterval(timer);timer=setInterval(nativeState,500);
}
function close(){opened=false;overlay.hidden=true;document.documentElement.classList.remove('live-picker');}
function ensure(){
 if(overlay)return;
 overlay=document.createElement('section');overlay.className='live-overlay';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Live wallpapers');
 overlay.innerHTML='<div class="live-card"><div class="live-eyebrow">CleanFrame</div><h2>Live wallpapers</h2><p class="live-intro">A little atmosphere. Choose a scene.</p><div class="live-choices"></div><div class="live-status" aria-live="polite"></div></div>';
 document.getElementById('stage').appendChild(overlay);
 overlay.addEventListener('click',function(e){var b=e.target;while(b&&b!==overlay&&!b.hasAttribute('data-live'))b=b.parentNode;if(!b||b===overlay)return;index=Number(b.getAttribute('data-live'));apply();});
}
window.CleanFrameLive={open:function(){ensure();nativeState();index=0;clips.forEach(function(c,i){if(c.id===data.selected)index=i;});opened=true;overlay.hidden=false;document.documentElement.classList.add('live-picker');render();},close:close,nativeState:nativeState,current:function(){return selected;},name:function(){var name='Off';clips.forEach(function(c){if(c.id===data.selected)name=c.name;});return name;}};
document.addEventListener('keydown',function(e){if(!opened)return;var k=e.keyCode;if([37,38,39,40,13,27,8].indexOf(k)<0)return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat&&(k===13||k===27||k===8))return;if(k===27||k===8){close();return;}if(k===38)index=Math.max(0,index-1);if(k===40)index=Math.min(clips.length-1,index+1);if(k===13)apply();else render();},true);
function effects(now){requestAnimationFrame(effects);if(!fx||fx.hidden||document.hidden||now-last<1000/24)return;var dt=Math.min((now-last)/1000,.08);last=now;elapsed+=dt;context.clearRect(0,0,1920,1080);
 particles.forEach(function(p,i){if(selected==='snow'){p.y+=p.v*dt;p.x+=Math.sin(elapsed*.3+p.phase)*dt*5;if(p.y>1090){p.y=-10;p.x=Math.random()*1920;}context.fillStyle='rgba(239,247,255,'+(.2+p.r*.16)+')';context.beginPath();context.arc(p.x,p.y,p.r,0,Math.PI*2);context.fill();}
 else if(selected==='fire'&&i<34){var age=(elapsed*(.13+p.r*.017)+p.phase)%1,x=1094+(Math.sin(p.phase*11)*.21+Math.sin(age*5+p.phase)*.035)*1920,y=918-age*702;context.strokeStyle='rgba(255,175,72,'+((1-age)*.7)+')';context.lineWidth=Math.max(.6,(1-age)*1.7);context.beginPath();context.moveTo(x,y);context.lineTo(x-2,y+4+age*7);context.stroke();}
});
}
function init(){fx=document.createElement('canvas');fx.id='liveEffects';fx.width=1920;fx.height=1080;fx.hidden=true;document.getElementById('scene').insertBefore(fx,document.getElementById('home'));context=fx.getContext('2d');for(var i=0;i<310;i++)particles.push({x:Math.random()*1920,y:Math.random()*1080,r:1+Math.random()*3.2,v:28+Math.random()*55,phase:Math.random()*6.28});nativeState();requestAnimationFrame(effects);}
document.addEventListener('visibilitychange',function(){if(document.hidden){clearInterval(timer);timer=null;}else{nativeState();if(pending)timer=setInterval(nativeState,500);}});
window.addEventListener('focus',nativeState);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
}());
