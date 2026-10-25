(function(){
'use strict';
var key='cleanframe.android.dock.v1',saved={size:100,height:0,glass:'classic'},draft=null,overlay,row=0,opened=false,lastGeometry=null,reflection,feedback='';
function copy(p){return {size:p.size,height:p.height,glass:p.glass};}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
try{var read=JSON.parse(localStorage.getItem(key)||'{}');if(typeof read.size==='number'&&isFinite(read.size))saved.size=clamp(Math.round(read.size/5)*5,75,125);if(typeof read.height==='number'&&isFinite(read.height))saved.height=clamp(Math.round(read.height/20)*20,-160,100);if(read.glass==='liquid')saved.glass='liquid';}catch(e){}
function prefs(){return opened?draft:saved;}
function geometry(g){var p=prefs(),scale=Math.min(p.size/100,1760/g.w),bottom=clamp(g.y+g.h+p.height,460+g.h*scale,1008);return {scale:scale,bottom:bottom,left:960-g.w*scale/2,top:bottom-g.h*scale};}
function ensureReflection(){if(reflection)return;reflection=document.createElement('img');reflection.className='dock-reflection';reflection.alt='';reflection.setAttribute('aria-hidden','true');document.querySelector('#dock .mat').appendChild(reflection);}
function layout(g){
 lastGeometry=g;var p=prefs(),b=geometry(g),dock=document.getElementById('dock'),mat=document.getElementById('matImg'),scrim=document.getElementById('matScrim');
 dock.style.transformOrigin='50% 100%';dock.style.transform='translate3d(0,'+(b.bottom-g.y-g.h)+'px,0) scale('+b.scale+')';
 document.documentElement.classList.toggle('dock-liquid',p.glass==='liquid');
 mat.style.left=(-b.left/b.scale)+'px';mat.style.top=(-b.top/b.scale)+'px';mat.style.width=(1920/b.scale)+'px';mat.style.height=(1080/b.scale)+'px';
 scrim.style.left=(-b.left/b.scale)+'px';scrim.style.top=((560-b.top)/b.scale)+'px';scrim.style.width=(1920/b.scale)+'px';scrim.style.height=(520/b.scale)+'px';
 var left=document.getElementById('cueL'),right=document.getElementById('cueR');left.style.left=(b.left-64)+'px';right.style.left=(b.left+g.w*b.scale+16)+'px';left.style.top=right.style.top=(b.top+g.h*b.scale/2-24)+'px';
 document.getElementById('dockAction').style.top=(b.bottom+24)+'px';
 ensureReflection();
 if(p.glass==='liquid'){
  var live=window.CleanFrameLive?CleanFrameLive.current():'off',state=window.ShoreQA&&ShoreQA.state(),wall=state&&state.committed.wall||'misty';
  var src=live!=='off'?'assets/reflections/'+live+'.jpg':'assets/materials/'+wall+'-field-clear.jpg';
  if(reflection.getAttribute('src')!==src)reflection.src=src;
  reflection.style.left=(-b.left/b.scale)+'px';reflection.style.top=(-b.top/b.scale)+'px';reflection.style.width=(1920/b.scale)+'px';reflection.style.height=(1080/b.scale)+'px';
 }
}
function redraw(){if(window.ShoreQA&&ShoreQA.refresh)ShoreQA.refresh();else if(lastGeometry)layout(lastGeometry);}
function anchor(x){return lastGeometry?960+(x-960)*geometry(lastGeometry).scale:x;}
function labelY(){return lastGeometry?geometry(lastGeometry).bottom+24:932;}
function heightText(v){return v===0?'Default':Math.abs(v)+' px '+(v<0?'higher':'lower');}
function render(){if(!opened)return;var p=draft;var effective=lastGeometry?Math.round(geometry(lastGeometry).scale*100):p.size;overlay.querySelector('[data-dock-value="size"]').textContent=effective+'%'+(effective<p.size?' (fit)':'');overlay.querySelector('[data-dock-value="height"]').textContent=heightText(p.height);overlay.querySelector('[data-dock-value="glass"]').textContent=p.glass==='liquid'?'Liquid Glass':'Original';Array.prototype.forEach.call(overlay.querySelectorAll('[data-dock-row]'),function(b){b.classList.toggle('is-focus',Number(b.getAttribute('data-dock-row'))===row);});overlay.querySelector('.dock-editor-status').textContent=feedback||'↑↓ select · ←→ preview · OK apply · Back cancels preview';}
function step(dir){feedback='';if(row===0)draft.size=clamp(draft.size+dir*5,75,125);if(row===1)draft.height=clamp(draft.height+dir*20,-160,100);if(row===2)draft.glass=dir>0?'liquid':'classic';redraw();render();}
function commit(){try{localStorage.setItem(key,JSON.stringify(draft));saved=copy(draft);feedback='Applied';return true;}catch(e){feedback='Could not save. Your previous dock settings are kept.';draft=copy(saved);redraw();return false;}}
function close(){opened=false;draft=null;overlay.hidden=true;document.documentElement.classList.remove('dock-edit');redraw();}
function act(){if(row===3){draft={size:100,height:0,glass:'classic'};commit();redraw();render();}else if(commit()){if(row===4)close();else render();}else render();}
function ensure(){if(overlay)return;overlay=document.createElement('section');overlay.className='dock-editor';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Dock size, position and glass');overlay.innerHTML='<div class="dock-editor-card"><div class="dock-editor-eyebrow">Layout</div><h2>Dock settings</h2><div class="dock-editor-controls">'+['size','height','glass'].map(function(id,i){return '<div class="dock-editor-row" data-dock-row="'+i+'"><span class="dock-editor-label">'+({size:'Dock size',height:'Vertical position',glass:'Surface'})[id]+'</span><div class="dock-stepper"><button data-dock-step="-1" data-row="'+i+'" aria-label="'+({size:'Smaller dock',height:'Move dock higher',glass:'Original surface'})[id]+'">‹</button><span data-dock-value="'+id+'"></span><button data-dock-step="1" data-row="'+i+'" aria-label="'+({size:'Larger dock',height:'Move dock lower',glass:'Liquid Glass surface'})[id]+'">›</button></div></div>';}).join('')+'</div><div class="dock-editor-footer"><button data-dock-row="3" class="dock-editor-reset">Reset dock</button><button data-dock-row="4" class="dock-editor-done">Done</button></div><p class="dock-editor-status"></p></div>';
 document.getElementById('stage').appendChild(overlay);overlay.addEventListener('click',function(e){var b=e.target;while(b&&b!==overlay&&!b.hasAttribute('data-dock-step')&&!b.hasAttribute('data-dock-row'))b=b.parentNode;if(!b||b===overlay)return;if(b.hasAttribute('data-dock-step')){row=Number(b.getAttribute('data-row'));step(Number(b.getAttribute('data-dock-step')));}else{row=Number(b.getAttribute('data-dock-row'));if(row>=3)act();else render();}});
}
window.CleanFrameDock={open:function(){ensure();draft=copy(saved);opened=true;row=0;feedback='';overlay.hidden=false;document.documentElement.classList.add('dock-edit');redraw();render();},layout:layout,anchor:anchor,labelY:labelY,refresh:function(){if(lastGeometry)layout(lastGeometry);},state:function(){return copy(saved);},isOpen:function(){return opened;}};
document.addEventListener('keydown',function(e){if(!opened)return;var k=e.keyCode;if([37,38,39,40,13,27,8].indexOf(k)<0)return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat&&(k===13||k===27||k===8))return;if(k===27||k===8){close();return;}if(k===38)row=Math.max(0,row-1);if(k===40)row=Math.min(4,row+1);if(k===37||k===39)step(k===39?1:-1);else if(k===13)act();else render();},true);
}());
