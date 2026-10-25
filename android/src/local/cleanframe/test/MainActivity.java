package local.cleanframe.test;

import android.app.Activity;
import android.os.Bundle;
import android.content.*;
import android.content.pm.*;
import android.webkit.*;
import android.view.*;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.provider.Settings;
import android.media.AudioManager;
import android.media.MediaMetadata;
import android.media.session.MediaController;
import android.media.session.MediaSessionManager;
import android.media.session.PlaybackState;
import android.service.notification.NotificationListenerService;
import android.app.NotificationManager;
import org.json.*;
import java.util.*;
import java.io.*;

public final class MainActivity extends Activity {
    private WebView web;
    private android.widget.FrameLayout root;
    private SurfaceView liveSurface;
    private android.media.MediaPlayer livePlayer;
    private boolean visible, surfaceReady;
    private volatile boolean liveReady;
    private volatile String liveCurrent = "off", liveError = "";
    private volatile int liveWidth, liveHeight;
    private String liveWanted = "off";
    private final String[] liveIds = {"fire","snow","waves","amber"};
    private boolean liveAllowed(String id) { return Arrays.asList(liveIds).contains(id); }
    private File liveFile(String id) { return new File(new File(getExternalFilesDir(null), "live"), id + ".mp4"); }
    private void notifyLive() {
        if(web != null) web.evaluateJavascript("if(window.CleanFrameLive) CleanFrameLive.nativeState();", null);
    }
    private void releaseLive() {
        liveReady=false;
        if(livePlayer!=null) { try { livePlayer.reset(); livePlayer.release(); } catch(Exception ignored) {} livePlayer=null; }

    }
    private void startLive(String id) {
        releaseLive(); liveWanted=id; liveCurrent="off"; liveError=""; liveWidth=liveHeight=0;
        if(id.equals("off")) { notifyLive(); return; }
        if(!visible) return;
        if(!liveAllowed(id) || !liveFile(id).isFile()) { liveError="Wallpaper file is unavailable. Choose another or use Static wallpapers."; notifyLive(); return; }
        liveSurface.setVisibility(View.VISIBLE);
        if(!surfaceReady) return;
        try {
            final android.media.MediaPlayer player=new android.media.MediaPlayer(); livePlayer=player;
            player.setDataSource(liveFile(id).getAbsolutePath());
            player.setDisplay(liveSurface.getHolder()); player.setVolume(0,0); player.setLooping(true);
            player.setOnPreparedListener(mp -> {
                if(livePlayer!=mp || !visible) return;
                liveWidth=mp.getVideoWidth(); liveHeight=mp.getVideoHeight();
                if(liveWidth<3840 || liveHeight<2160) { liveError="This file does not meet the 4K wallpaper requirement."; releaseLive(); notifyLive(); return; }
                liveSurface.getHolder().setFixedSize(liveWidth,liveHeight);
                mp.setVideoScalingMode(android.media.MediaPlayer.VIDEO_SCALING_MODE_SCALE_TO_FIT_WITH_CROPPING);
                mp.start();
            });
            player.setOnInfoListener((mp,what,extra) -> {
                if(mp==livePlayer && what==android.media.MediaPlayer.MEDIA_INFO_VIDEO_RENDERING_START) {
                    liveCurrent=id; liveReady=true;
                    getPreferences(0).edit().putString("liveWallpaper",id).apply();
                    android.util.Log.i("CleanFrameLive", "Playing "+id+" "+liveWidth+"x"+liveHeight);
                    notifyLive();
                } return false;
            });
            player.setOnErrorListener((mp,what,extra) -> {
                if(mp==livePlayer) { liveError="Could not play this wallpaper. Static background restored."; releaseLive(); notifyLive(); }
                return true;
            });
            player.prepareAsync();
            web.postDelayed(() -> { if(livePlayer==player && !liveReady) {liveError="Wallpaper took too long to load. Static background restored.";releaseLive();notifyLive();} },12000);
        } catch(Exception e) { liveError="Could not open wallpaper. Static background restored.";releaseLive();notifyLive(); }
    }
    private volatile String weatherCache = "{}";
    private volatile boolean weatherLoading = false;
    private volatile long weatherAttempt = 0;
    private void refreshWeather() {
        long now = System.currentTimeMillis();
        long fetched = getPreferences(0).getLong("weatherRangeFetched", 0);
        if (weatherLoading || now - fetched < 900000 || now - weatherAttempt < 300000) return;
        weatherLoading = true; weatherAttempt = now;
        new Thread(() -> {
            javax.net.ssl.HttpsURLConnection connection = null;
            try {
                java.net.URL url = new java.net.URL("https://api.open-meteo.com/v1/forecast?latitude=51.7592,52.2297&longitude=19.4560,21.0122&current=temperature_2m,weather_code,is_day&daily=temperature_2m_min,temperature_2m_max&timezone=Europe%2FWarsaw&forecast_days=1");
                connection = (javax.net.ssl.HttpsURLConnection)url.openConnection();
                connection.setConnectTimeout(8000); connection.setReadTimeout(8000);
                connection.setInstanceFollowRedirects(false);
                if (connection.getResponseCode() != 200) throw new IOException("Weather response");
                ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                try (InputStream stream = connection.getInputStream()) {
                    byte[] buffer = new byte[4096]; int n;
                    while ((n=stream.read(buffer)) != -1) { if(bytes.size()+n>65536) throw new IOException("Weather too large"); bytes.write(buffer,0,n); }
                }
                JSONArray locations = new JSONArray(bytes.toString("UTF-8"));
                if(locations.length()!=2) throw new IOException("Weather locations");
                JSONArray cities = new JSONArray(); String[] names={"Łódź","Warsaw"};
                for(int i=0;i<2;i++) {
                    JSONObject c=locations.getJSONObject(i).getJSONObject("current");
                    JSONObject daily=locations.getJSONObject(i).getJSONObject("daily");
                    double low=daily.getJSONArray("temperature_2m_min").getDouble(0), high=daily.getJSONArray("temperature_2m_max").getDouble(0);
                    if(!Double.isFinite(low)||!Double.isFinite(high)||low>high||low < -70 || high > 65) throw new IOException("Weather range");
                    double temperature=c.getDouble("temperature_2m");
                    int code=c.getInt("weather_code");
                    if(!Double.isFinite(temperature)||temperature < -70 || temperature > 65) throw new IOException("Weather temperature");
                    cities.put(new JSONObject().put("name",names[i]).put("temperature",temperature).put("low",low).put("high",high).put("code",code).put("day",c.getInt("is_day")).put("time",c.getString("time")));
                }
                long timestamp=System.currentTimeMillis();
                String value=new JSONObject().put("fetched",timestamp).put("cities",cities).toString();
                getPreferences(0).edit().putString("weatherRange",value).putLong("weatherRangeFetched",timestamp).apply();
                weatherCache=value;
            } catch(Exception ignored) { }
            finally { if(connection!=null) connection.disconnect();weatherLoading=false; }
        }, "CleanFrame-weather").start();
    }
    private volatile byte[] mediaArtwork = new byte[0];
    private volatile int artworkHash;
    public static final class MediaAccess extends NotificationListenerService { }
    private MediaController spotifyController() {
        MediaSessionManager manager = (MediaSessionManager)getSystemService(MEDIA_SESSION_SERVICE);
        for (MediaController c : manager.getActiveSessions(new ComponentName(this, MediaAccess.class)))
            if ("com.spotify.tv.android".equals(c.getPackageName())) return c;
        return null;
    }
    private static final String ORIGIN = "https://cleanframe.local/";
    private final Set<String> allowed = Collections.synchronizedSet(new HashSet<String>());
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().getDecorView().setSystemUiVisibility(5894);
        weatherCache = getPreferences(0).getString("weatherRange", "{}");
        web = new WebView(this);
        root=new android.widget.FrameLayout(this);
        root.setBackgroundColor(0xff101010);
        liveSurface=new SurfaceView(this);
        root.addView(liveSurface,new android.widget.FrameLayout.LayoutParams(-1,-1));
        liveSurface.getHolder().addCallback(new SurfaceHolder.Callback() {
            public void surfaceCreated(SurfaceHolder holder) { surfaceReady=true; if(visible && !liveWanted.equals("off")) startLive(liveWanted); }
            public void surfaceChanged(SurfaceHolder holder,int format,int width,int height) { }
            public void surfaceDestroyed(SurfaceHolder holder) { surfaceReady=false; releaseLive(); }
        });
        web.setBackgroundColor(0x00000000);
        root.addView(web,new android.widget.FrameLayout.LayoutParams(-1,-1));
        setContentView(root);
        liveWanted=getPreferences(0).getString("liveWallpaper","off");
        if(!liveWanted.equals("off") && !liveAllowed(liveWanted)) { liveWanted="off"; getPreferences(0).edit().putString("liveWallpaper","off").apply(); }
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setTextZoom(100);
        web.setInitialScale(0);
        web.setHorizontalScrollBarEnabled(false);
        web.setVerticalScrollBarEnabled(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.addJavascriptInterface(new Bridge(), "AndroidFrame");
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView v, String url) { v.evaluateJavascript("window.dispatchEvent(new Event('resize')); console.log('viewport '+innerWidth+'x'+innerHeight+' dpr '+devicePixelRatio);", null); }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) { return true; }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                String url = req.getUrl().toString();
                if (!url.startsWith(ORIGIN)) return blocked();
                String path = req.getUrl().getPath();
                if (path == null || path.contains("..")) return blocked();
                if (path.equals("/media-art.png")) {
                    byte[] art = mediaArtwork;
                    return new WebResourceResponse("image/png", null, new ByteArrayInputStream(art));
                }
                if (path.startsWith("/app-icon/") && path.endsWith(".png")) {
                    String pkg = path.substring(10, path.length() - 4);
                    if (!allowed.contains(pkg)) return blocked();
                    try {
                        Drawable icon = getPackageManager().getApplicationIcon(pkg);
                        Bitmap image = Bitmap.createBitmap(192, 192, Bitmap.Config.ARGB_8888);
                        icon.setBounds(0, 0, 192, 192);
                        icon.draw(new Canvas(image));
                        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                        image.compress(Bitmap.CompressFormat.PNG, 100, bytes);
                        image.recycle();
                        return new WebResourceResponse("image/png", null, new ByteArrayInputStream(bytes.toByteArray()));
                    } catch (Exception e) { return blocked(); }
                }
                if (path.equals("/")) path = "/index.html";
                String mime = path.endsWith(".html") ? "text/html" : path.endsWith(".js") ? "application/javascript" : path.endsWith(".css") ? "text/css" : path.endsWith(".svg") ? "image/svg+xml" : path.endsWith(".png") ? "image/png" : path.endsWith(".jpg") || path.endsWith(".jpeg") ? "image/jpeg" : path.endsWith(".woff2") ? "font/woff2" : "application/octet-stream";
                try { return new WebResourceResponse(mime, "UTF-8", getAssets().open("web" + path)); }
                catch (IOException e) { return blocked(); }
            }
            private WebResourceResponse blocked() { return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream(new byte[0])); }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage msg) { android.util.Log.d("CleanFrameTest", msg.messageLevel()+": "+msg.message()+" @"+msg.lineNumber()); return true; }
        });
        new Bridge().apps();
        web.loadUrl(ORIGIN + "index.html");
    }
    private Intent appIntent(String pkg) {
        PackageManager pm = getPackageManager();
        Intent i = pm.getLeanbackLaunchIntentForPackage(pkg);
        return i != null ? i : pm.getLaunchIntentForPackage(pkg);
    }
    public final class Bridge {
        @JavascriptInterface public String liveState() {
            try {
                JSONArray clips=new JSONArray();
                for(String id:liveIds) clips.put(new JSONObject().put("id",id).put("bytes",liveFile(id).length()));
                return new JSONObject().put("selected",getPreferences(0).getString("liveWallpaper","off")).put("current",liveCurrent).put("ready",liveReady).put("error",liveError).put("width",liveWidth).put("height",liveHeight).put("clips",clips).toString();
            } catch(Exception e) { return "{}"; }
        }
        @JavascriptInterface public String liveSelect(String id) {
            if(!id.equals("off") && (!liveAllowed(id) || !liveFile(id).isFile())) return "Wallpaper file is unavailable.";
            runOnUiThread(() -> {
                if(id.equals("off")) getPreferences(0).edit().putString("liveWallpaper","off").apply();
                startLive(id);
            }); return "";
        }
        @JavascriptInterface public String weatherState() { refreshWeather(); return weatherCache; }
        @JavascriptInterface public String apps() {
            JSONArray result = new JSONArray();
            Map<String, ResolveInfo> found = new TreeMap<String, ResolveInfo>();
            PackageManager pm = getPackageManager();
            for (String cat : new String[]{Intent.CATEGORY_LEANBACK_LAUNCHER, Intent.CATEGORY_LAUNCHER}) {
                Intent query = new Intent(Intent.ACTION_MAIN).addCategory(cat);
                for (ResolveInfo r : pm.queryIntentActivities(query, 0)) found.put(r.activityInfo.packageName, r);
            }
            allowed.clear();
            for (Map.Entry<String, ResolveInfo> e : found.entrySet()) {
                if (e.getKey().equals(getPackageName()) || !e.getValue().activityInfo.applicationInfo.enabled) continue;
                allowed.add(e.getKey());
                try { result.put(new JSONObject().put("appId", e.getKey()).put("name", e.getValue().loadLabel(pm).toString()).put("icon", "/app-icon/" + e.getKey() + ".png")); }
                catch (JSONException ignored) { }
            }
            return result.toString();
        }
        @JavascriptInterface public String launch(String pkg) {
            if (!allowed.contains(pkg)) return "App is unavailable or disabled.";
            final Intent i = appIntent(pkg);
            if (i == null) return "No TV launch entry found.";
            runOnUiThread(() -> { try { startActivity(i); } catch (Exception e) { android.widget.Toast.makeText(MainActivity.this, "Could not open app", 1).show(); } });
            return "";
        }
        @JavascriptInterface public void home() {
            runOnUiThread(() -> {
                Intent i = appIntent("com.google.android.apps.tv.launcherx");
                if (i == null) i = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME);
                try { startActivity(i); } catch (Exception e) { finish(); }
            });
        }
        @JavascriptInterface public String quickState() {
            JSONObject data = new JSONObject();
            try {
                AudioManager audio = (AudioManager)getSystemService(AUDIO_SERVICE);
                data.put("volume", audio.getStreamVolume(AudioManager.STREAM_MUSIC));
                data.put("volumeMax", audio.getStreamMaxVolume(AudioManager.STREAM_MUSIC));
                data.put("muted", audio.isStreamMute(AudioManager.STREAM_MUSIC));
                data.put("fixedVolume", audio.isVolumeFixed());
                boolean access = ((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).isNotificationListenerAccessGranted(new ComponentName(MainActivity.this, MediaAccess.class));
                data.put("access", access);
                if (access) {
                    MediaController c = spotifyController();
                    data.put("active", c != null);
                    if (c != null) {
                        PlaybackState state = c.getPlaybackState();
                        long actions = state == null ? 0 : state.getActions();
                        if (state != null && state.getPosition() >= 0) {
                            long position = state.getPosition();
                            if (state.getState() == PlaybackState.STATE_PLAYING && state.getLastPositionUpdateTime() > 0)
                                position += (long)((android.os.SystemClock.elapsedRealtime() - state.getLastPositionUpdateTime()) * state.getPlaybackSpeed());
                            data.put("position", Math.max(0, position));
                        }
                        data.put("playing", state != null && state.getState() == PlaybackState.STATE_PLAYING);
                        data.put("canToggle", (actions & (PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE | PlaybackState.ACTION_PLAY_PAUSE)) != 0);
                        data.put("canPrev", (actions & PlaybackState.ACTION_SKIP_TO_PREVIOUS) != 0);
                        data.put("canNext", (actions & PlaybackState.ACTION_SKIP_TO_NEXT) != 0);
                        MediaMetadata m = c.getMetadata();
                        if (m != null) {
                            data.put("duration", m.getLong(MediaMetadata.METADATA_KEY_DURATION));
                            data.put("title", m.getString(MediaMetadata.METADATA_KEY_TITLE));
                            data.put("artist", m.getString(MediaMetadata.METADATA_KEY_ARTIST));
                            data.put("album", m.getString(MediaMetadata.METADATA_KEY_ALBUM));
                            Bitmap bitmap = m.getBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART);
                            if (bitmap == null) bitmap = m.getBitmap(MediaMetadata.METADATA_KEY_ART);
                            if (bitmap == null) bitmap = m.getBitmap(MediaMetadata.METADATA_KEY_DISPLAY_ICON);
                            if (bitmap != null) {
                                int hash = bitmap.getGenerationId();
                                if (hash != artworkHash || mediaArtwork.length == 0) {
                                    Bitmap small = Bitmap.createScaledBitmap(bitmap, 240, 240, true);
                                    ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                                    small.compress(Bitmap.CompressFormat.PNG, 100, bytes);
                                    mediaArtwork = bytes.toByteArray(); artworkHash = hash;
                                    if (small != bitmap) small.recycle();
                                }
                                data.put("art", "/media-art.png?v=" + artworkHash);
                            }
                        }
                    }
                }
            } catch (SecurityException e) { try { data.put("access", false); } catch (JSONException ignored) {} }
            catch (Exception e) { try { data.put("error", "Media information is unavailable"); } catch (JSONException ignored) {} }
            return data.toString();
        }
        @JavascriptInterface public String quickAction(String action) {
            if (action.equals("previous") || action.equals("toggle") || action.equals("next")) {
                try {
                    MediaController c = spotifyController();
                    if(c == null) return "Start music in Spotify first.";
                    if(action.equals("previous")) c.getTransportControls().skipToPrevious();
                    if(action.equals("next")) c.getTransportControls().skipToNext();
                    if(action.equals("toggle")) {
                        PlaybackState p = c.getPlaybackState();
                        if(p != null && p.getState() == PlaybackState.STATE_PLAYING) c.getTransportControls().pause();
                        else c.getTransportControls().play();
                    }
                } catch(Exception e) { return "Spotify access is unavailable."; }
            } else if(action.equals("voldown") || action.equals("volup") || action.equals("mute")) {
                AudioManager audio = (AudioManager)getSystemService(AUDIO_SERVICE);
                if(audio.isVolumeFixed()) return "Use the remote or connected speaker for volume.";
                audio.adjustStreamVolume(AudioManager.STREAM_MUSIC, action.equals("mute") ? AudioManager.ADJUST_TOGGLE_MUTE : action.equals("volup") ? AudioManager.ADJUST_RAISE : AudioManager.ADJUST_LOWER, 0);
            } else if(action.equals("spotify")) return launch("com.spotify.tv.android");
            else {
                final String target = action.equals("bluetooth") ? Settings.ACTION_BLUETOOTH_SETTINGS : action.equals("wifi") ? Settings.ACTION_WIFI_SETTINGS : action.equals("access") ? Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS : action.equals("tvsettings") ? Settings.ACTION_SETTINGS : null;
                if(target == null) return "Unknown action";
                runOnUiThread(() -> { try { startActivity(new Intent(target)); } catch(Exception e) { android.widget.Toast.makeText(MainActivity.this, "This settings screen is unavailable", 1).show(); } });
            }
            return "";
        }
        @JavascriptInterface public void settings() { runOnUiThread(() -> { try { startActivity(new Intent(Settings.ACTION_SETTINGS)); } catch (Exception ignored) { } }); }
    }
    @Override public boolean dispatchKeyEvent(KeyEvent event) {
        int c = event.getKeyCode(), js;
        switch(c) {
            case KeyEvent.KEYCODE_DPAD_LEFT: js=37; break;
            case KeyEvent.KEYCODE_DPAD_UP: js=38; break;
            case KeyEvent.KEYCODE_DPAD_RIGHT: js=39; break;
            case KeyEvent.KEYCODE_DPAD_DOWN: js=40; break;
            case KeyEvent.KEYCODE_DPAD_CENTER: case KeyEvent.KEYCODE_ENTER: js=13; break;
            case KeyEvent.KEYCODE_BACK: js=27; break;
            default: return super.dispatchKeyEvent(event);
        }
        if(event.getAction()==KeyEvent.ACTION_DOWN || event.getAction()==KeyEvent.ACTION_UP) {
            String type=event.getAction()==KeyEvent.ACTION_DOWN ? "keydown" : "keyup";
            web.evaluateJavascript("document.dispatchEvent(new KeyboardEvent('"+type+"',{keyCode:"+js+",which:"+js+",bubbles:true,repeat:"+(event.getRepeatCount()>0)+"}));",null);
        }
        return true;
    }
    @Override protected void onPause() { getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON); visible=false; releaseLive(); if(web!=null) web.onPause(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON); visible=true; if(!liveWanted.equals("off")) startLive(liveWanted); if(web!=null) { web.onResume(); web.evaluateJavascript("window.dispatchEvent(new Event('focus'));",null); } }
    @Override protected void onDestroy() { releaseLive(); if(web!=null) { web.removeJavascriptInterface("AndroidFrame"); web.destroy(); } super.onDestroy(); }
}
