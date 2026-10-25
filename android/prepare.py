from pathlib import Path
import sys, shutil, re, json
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'scripts'))
from font_assets import font_overlay,is_runtime_source
out=root/'android/out/assets/web'
out.mkdir(parents=True,exist_ok=True)
for source in (root/'app').rglob('*'):
    if source.is_file() and is_runtime_source(source.relative_to(root/'app').as_posix()) and source.name!='config.xml':
        target=out/source.relative_to(root/'app'); target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
for relative,data in font_overlay(root,False).items():
    target=out/relative;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data if isinstance(data,bytes) else data.read_bytes())
shutil.copy2(root/'android/device.js',out/'device.js')
s=(out/'main.js').read_text()
apps=[('nuvio','Nuvio','com.nuvio.app'),('stremio','Stremio','com.stremio.one'),('smarttube','SmartTube','org.smarttube.stable'),('spotify','Spotify','com.spotify.tv.android'),('twitch','Twitch','tv.twitch.android.app')]
data=[dict(id=i,name=n,appId=p,icon='/app-icon/'+p+'.png',mark=True) for i,n,p in apps]
s=re.sub(r'var PRIMARY_APPS = \[.*?\n  \];','var PRIMARY_APPS = '+json.dumps(data)+';',s,count=1,flags=re.S)

s=s.replace('window.innerWidth', 'document.documentElement.clientWidth').replace('window.innerHeight', 'document.documentElement.clientHeight')
s=s.replace('Samsung Home','Google TV').replace('Samsung’s Home screen','Google TV home screen').replace("label: 'Samsung'","label: 'TV'").replace("samsung: 'Samsung'","samsung: 'TV'")
s=s.replace("art: ['Art Mode', 'art']","art: ['Google TV', 'home']").replace("perform('Art Mode', FrameDevice.art)","perform('Google TV', FrameDevice.home)")
(out/'main.js').write_text(s)
for name in ['LICENSE','THIRD_PARTY_NOTICES.md']:
    shutil.copy2(root/name,out/name)
print('Prepared Android UI assets:',out)

for icon in (root/'android/icons').glob('*.svg'):
    shutil.copy2(icon,out/'assets/icons'/icon.name)
with (out/'assets/icons/metrics.js').open('a') as f:
    f.write('\nObject.assign(window.FrameIconMetrics, '+json.dumps({i:dict(n=24,x=0,y=0,w=24,h=24,fill=.45) for i in ['nuvio','smarttube','twitch']})+');\n')

# Android-only quick controls; upstream UI and preferences remain intact.
shutil.copy2(root/'android/quick.js',out/'quick.js')
shutil.copy2(root/'android/quick.css',out/'quick.css')
s=(out/'main.js').read_text()
s=s.replace("function utils() { return ['art', 'apps', 'settings']; }", "function utils() { return ['quick', 'art', 'apps', 'settings']; }")
s=s.replace("var UTIL = {", "var UTIL = { quick: ['Quick controls', 'settings'],")
s=s.replace("function utilAction(u) {", "function utilAction(u) {\n    if (u === 'quick') { window.CleanFrameQuick.open(); return; }")
(out/'main.js').write_text(s)
html=(out/'index.html').read_text().replace('</head>','<link rel="stylesheet" href="quick.css">\n</head>').replace('<script src="main.js">','<script src="quick.js"></script>\n<script src="main.js">')
(out/'index.html').write_text(html)

# City-only weather, no device location access.
for name in ['weather.js','weather.css']:
    shutil.copy2(root/'android'/name,out/name)
s=(out/'main.js').read_text()
s=s.replace("setHTML(caption, html);", "html += '<div id=\"cleanWeather\" class=\"clean-weather\" aria-label=\"Weather for Łódź and Warsaw\"></div>';\n    setHTML(caption, html);\n    if (window.CleanFrameWeather) window.CleanFrameWeather.render();")
(out/'main.js').write_text(s)
html=(out/'index.html').read_text().replace('</head>','<link rel="stylesheet" href="weather.css">\n</head>').replace('<script src="main.js">','<script src="weather.js"></script>\n<script src="main.js">')
(out/'index.html').write_text(html)

# Top-bar focus should leave no remembered app highlight.
s=(out/'main.js').read_text()
s=s.replace("tileSel ? ' on-sel' : ''", "tileSel && hs.zone !== 'util' ? ' on-sel' : ''")
s=s.replace("S.c.focus === 'glass' && remembered ? 'on-sel'", "S.c.focus === 'glass' && remembered && hs.zone !== 'util' ? 'on-sel'")
(out/'main.js').write_text(s)
s=(out/'main.js').read_text()
s=s.replace("sel = tileSel && i === anchor;", "sel = tileSel && hs.zone !== 'util' && i === anchor;")
s=s.replace("(remembered && i === anchor ? ' is-sel' : '')", "(remembered && hs.zone !== 'util' && i === anchor ? ' is-sel' : '')")
(out/'main.js').write_text(s)

# Local native-video wallpapers, separate from static wallpaper preferences.
for name in ['live.js','live.css']:
    shutil.copy2(root/'android'/name,out/name)
s=(out/'main.js').read_text()
s=s.replace("{ id: 'layout', label: 'Layout', value: VALUE_NAMES[S.c.layout] },", "{ id: 'live', label: 'Live wallpapers', value: window.CleanFrameLive ? CleanFrameLive.name() : 'Off' },\n      { id: 'layout', label: 'Layout', value: VALUE_NAMES[S.c.layout] },")
s=s.replace("function settingsOk(id) {", "function settingsOk(id) {\n    if (id === 'live') { window.CleanFrameLive.open(); return; }")
(out/'main.js').write_text(s)
html=(out/'index.html').read_text().replace('</head>','<link rel="stylesheet" href="live.css">\n</head>').replace('<script src="main.js">','<script src="live.js"></script>\n<script src="main.js">')
(out/'index.html').write_text(html)

# Remote-adjustable Android dock; isolated preferences preserve upstream schema.
for name in ['dock.js','dock.css']:
    shutil.copy2(root/'android'/name,out/name)
reflection_dir=out/'assets/reflections'
reflection_dir.mkdir(parents=True,exist_ok=True)
for source in (root/'android/reflections').glob('*'):
    shutil.copy2(source,reflection_dir/source.name)
s=(out/'main.js').read_text()
s=s.replace("{ id: 'controls', title: 'Home controls', horizontal: true, items: options('controls', ['text', 'icons', 'both']) }", "{ id: 'controls', title: 'Home controls', horizontal: true, items: options('controls', ['text', 'icons', 'both']) },\n      { id: 'dock', title: 'Dock', items: [{action: 'layout.dock', label: 'Size, position & glass', disabled: S.c.layout !== 'dock'}], reason: S.c.layout !== 'dock' ? 'Choose Dock to adjust its size, position and surface.' : '' }")
s=s.replace("function detailOk(t, item) {", "function detailOk(t, item) {\n    if (item.action === 'layout.dock' && !item.disabled) { window.CleanFrameDock.open(); return; }")
s=s.replace("  }\n\n  function photoModeTransition", "    if(window.CleanFrameDock) CleanFrameDock.layout(g);\n  }\n\n  function photoModeTransition")
s=s.replace("x = clamp(dockAnchorCenter - width / 2, 140, 1780 - width); y = 932;", "x = clamp(CleanFrameDock.anchor(dockAnchorCenter) - width / 2, 80, 1840 - width); y = CleanFrameDock.labelY();")
s=s.replace("ax = clamp(ax + (g.tw - width) / 2, 112, 1808 - width);", "ax = clamp(CleanFrameDock.anchor(ax + g.tw / 2) - width / 2, 80, 1840 - width);")
s=s.replace("QA.ready = function ()", "QA.refresh = function () { render(); };\n  QA.ready = function ()")
(out/'main.js').write_text(s)
html=(out/'index.html').read_text().replace('</head>','<link rel="stylesheet" href="dock.css">\n</head>').replace('<script src="main.js">','<script src="dock.js"></script>\n<script src="main.js">')
(out/'index.html').write_text(html)

# Floating Spotify metadata and placement preferences; no playback controls.
for name in ['music.js','music.css']:
    shutil.copy2(root/'android'/name,out/name)
s=(out/'main.js').read_text()
s=s.replace("reason: S.c.layout !== 'dock' ? 'Choose Dock to adjust its size, position and surface.' : '' }", "reason: S.c.layout !== 'dock' ? 'Choose Dock to adjust its size, position and surface.' : '' },\n      { id: 'spotify', title: 'Spotify placement', items: [{action: 'layout.spotify', label: 'Position & visibility'}] }")
s=s.replace('function detailOk(t, item) {', "function detailOk(t, item) {\n    if (item.action === 'layout.spotify') { window.CleanFrameMusic.open(); return; }")
(out/'main.js').write_text(s)
html=(out/'index.html').read_text().replace('</head>','<link rel="stylesheet" href="music.css">\n</head>').replace('<script src="main.js">','<script src="music.js"></script>\n<script src="main.js">')
(out/'index.html').write_text(html)
