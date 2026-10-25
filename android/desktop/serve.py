"""Loopback-only desktop TV preview. Serves only generated UI and approved media."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import mimetypes,re
ROOT=Path(__file__).resolve().parents[2]
UI=ROOT/'android/out/assets/web'
DESKTOP=Path(__file__).resolve().parent
MEDIA=ROOT/'.local/desktop-media'
IDS={'fire','snow','waves','amber'}
class Preview(BaseHTTPRequestHandler):
 def do_HEAD(self):self.serve(False)
 def do_GET(self):self.serve(True)
 def serve(self,body):
  route=unquote(urlsplit(self.path).path)
  data=None;file=None
  if route=='/':file=DESKTOP/'index.html'
  elif route=='/desktop/bridge.js':file=DESKTOP/'bridge.js'
  elif route in ['/tv/','/tv/index.html']:
   html=(UI/'index.html').read_text()
   html=html.replace('</head>','<style>#desktopVideo{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none}#stage{z-index:1}</style><script src="/desktop/bridge.js"></script></head>')
   data=html.encode()
  elif route.startswith('/tv/'):
   candidate=(UI/route[4:]).resolve()
   if candidate.is_relative_to(UI.resolve()) and candidate.is_file():file=candidate
  elif re.fullmatch(r'/media/(fire|snow|waves|amber)\.mp4',route):
   id=Path(route).stem
   file=(ROOT/'.local/live-media/snow.mp4') if id=='snow' else MEDIA/(id+'.mp4')
  if file is not None and not file.is_file():self.send_error(404);return
  if data is None and file is None:self.send_error(404);return
  size=len(data) if data is not None else file.stat().st_size
  start=0;end=size-1;status=200
  if self.headers.get('Range'):
   match=re.fullmatch(r'bytes=(\d+)-(\d*)',self.headers['Range'])
   if not match:self.send_error(416);return
   start=int(match[1]);end=min(int(match[2]),end) if match[2] else end
   if start>end:self.send_error(416);return
   status=206
  self.send_response(status)
  self.send_header('Content-Type','text/html; charset=utf-8' if data is not None else mimetypes.guess_type(str(file))[0] or 'application/octet-stream')
  self.send_header('Content-Length',str(end-start+1));self.send_header('Accept-Ranges','bytes');self.send_header('Cache-Control','no-cache')
  self.send_header('X-Content-Type-Options','nosniff')
  if status==206:self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
  self.end_headers()
  if not body:return
  try:
   if data is not None:self.wfile.write(data[start:end+1]);return
   with file.open('rb') as f:
    f.seek(start);remaining=end-start+1
    while remaining:
     chunk=f.read(min(1024*1024,remaining))
     if not chunk:break
     self.wfile.write(chunk);remaining-=len(chunk)
  except (BrokenPipeError,ConnectionResetError):pass
 def log_message(self,*args):pass
if __name__=='__main__':
 print('Desktop TV preview: http://localhost:4798',flush=True)
 ThreadingHTTPServer(('127.0.0.1',4798),Preview).serve_forever()
