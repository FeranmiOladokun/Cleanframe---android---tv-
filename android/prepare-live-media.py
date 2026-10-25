"""Offline personal wallpaper preparation. Requires ffmpeg/ffprobe; no TV access."""
from pathlib import Path
import subprocess,json,hashlib
root=Path(__file__).resolve().parents[1]
media=root/'.local/live-media'
ffmpeg='/opt/homebrew/bin/ffmpeg';ffprobe='/opt/homebrew/bin/ffprobe'
metadata={}
for name in ['fire','snow','waves','amber']:
    dest=media/(name+'.mp4')
    source=media/(name+'-source.mp4')
    if name!='snow' and not dest.exists():
        cmd=[ffmpeg,'-hide_banner','-loglevel','error','-y']
        if name=='rain':cmd+=['-loop','1','-framerate','24','-i',str(root/'app/assets/wallpapers/forest.jpg'),'-t','12','-vf','scale=3840:2160:flags=lanczos,gblur=sigma=16,eq=brightness=-0.12:saturation=0.8']
        else:cmd+=['-i',str(source),'-vf','scale=3840:2160:force_original_aspect_ratio=increase:flags=lanczos,crop=3840:2160,setsar=1']
        cmd+=['-an','-c:v','hevc_videotoolbox','-b:v','14M','-maxrate','20M','-bufsize','28M','-profile:v','main','-tag:v','hvc1','-pix_fmt','yuv420p','-movflags','+faststart',str(dest)]
        subprocess.run(cmd,check=True)
    info=json.loads(subprocess.check_output([ffprobe,'-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate','-show_entries','format=duration,size','-of','json',str(dest)]))
    video=[s for s in info['streams'] if s.get('width')][0]
    assert video['width']>=3840 and video['height']>=2160
    info['sha256']=hashlib.sha256(dest.read_bytes()).hexdigest()
    info['sourceQuality']='Native 4K' if name=='snow' else '1920x1080 still + procedural overlay' if name=='rain' else '1280x720 upscale' if name=='embers' else '1920x1080 upscale'
    metadata[name]=info
    print(name,video,info['format'],flush=True)
(media/'verified.json').write_text(json.dumps(metadata,indent=2))
