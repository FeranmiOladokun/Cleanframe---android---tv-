/* Android adapter for bundled, offline CleanFrame assets. */
(function () {
  'use strict';
  var brands = {'com.nuvio.app':'nuvio','com.stremio.one':'stremio','org.smarttube.stable':'smarttube','com.spotify.tv.android':'spotify','tv.twitch.android.app':'twitch'};
  function call(name, arg, done) {
    if (!window.AndroidFrame) { done({message:'Open CleanFrame Test on the TV to use this control.'}); return; }
    try { var error = arg === null ? AndroidFrame[name]() : AndroidFrame[name](arg); done(error ? {message:String(error)} : null); }
    catch(e) { done({message:'Could not open this screen.',detail:String(e)}); }
  }
  window.FrameDevice = {
    launchApp:function(id,done){call('launch',id,done);},
    launch:function(id,done){done({message:'Select an installed Android app.'});},
    home:function(done){call('home',null,done);},
    art:function(done){call('home',null,done);},
    settings:function(done){call('settings',null,done);},
    apps:function(done){
      if(!window.AndroidFrame){done({message:'Installed apps are available on the TV.'});return;}
      try {var a=JSON.parse(AndroidFrame.apps());a.forEach(function(x){x.brand=brands[x.appId]||'';});done(null,a);}
      catch(e){done({message:'Could not read installed apps.',detail:String(e)});}
    }
  };
}());
