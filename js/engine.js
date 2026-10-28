/* Talks to the background workers. Used by the app and by tools/make-previews.html
   createEngine('js/')  or  createEngine('../js/') */
function createEngine(base,onProgress){
  let W=null,n=0,ready=null,idle=null;const pend=new Map();
  const failAll=e=>{pend.forEach(p=>p.no(e));pend.clear()};
  function worker(){
    if(W)return W;
    if(location.protocol==='file:')throw new Error('Open the site with a web address (https:// or http://localhost), not by double-clicking the file. Run: python -m http.server 8000');
    try{W=new Worker(base+'tts-worker.js',{type:'module'})}
    catch(e1){W=new Worker(base+'tts-worker.js')}   /* older browsers: classic worker (the script only uses import()) */
    W.onmessage=({data:m})=>{
      if(m.type==='progress'){onProgress&&onProgress(m.pct);return}
      const p=pend.get(m.id);if(!p)return;pend.delete(m.id);
      if(m.type==='error')p.no(new Error(m.message));else p.ok(m);
    };
    W.onerror=ev=>{
      const e=new Error('The voice engine stopped'+(ev&&ev.message?': '+ev.message:'')+'. Close other tabs and try again.');
      e.fatal=true;try{W.terminate()}catch{}W=null;ready=null;failAll(e);
    };
    return W;
  }
  /* free memory after 5 idle minutes (the model is re-read from the browser cache next time) */
  const touch=()=>{clearTimeout(idle);idle=setTimeout(()=>{if(W&&!pend.size){W.terminate();W=null;ready=null}},3e5)};
  const call=msg=>new Promise((ok,no)=>{
    const id=++n;pend.set(id,{ok,no});touch();
    try{worker().postMessage({...msg,id})}catch(e){pend.delete(id);no(new Error('Voice engine could not start: '+(e&&e.message||e)))}
  }).finally(touch);
  const load=()=>ready||(ready=call({type:'load'}).catch(e=>{ready=null;throw e}));
  const synth=(text,voice,speed)=>call({type:'gen',text,voice,speed}).then(m=>({audio:m.audio,sr:m.sr}));

  /* MP3 encoder worker: add() chunks as they are made, finish() returns {blob,secs} */
  function encoder(sr=24000,kbps=96){
    const w=new Worker(base+'encoder-worker.js');let ok,no,err=null;
    const done=new Promise((a,b)=>{ok=a;no=b});done.catch(e=>{err=e});
    w.onmessage=e=>e.data.type==='done'?ok(e.data):no(new Error(e.data.message||'MP3 encoder failed'));
    w.onerror=()=>no(new Error('MP3 encoder could not start (it needs internet the first time)'));
    w.postMessage({type:'start',sr,kbps});
    return{
      get failed(){return err},
      add:(audio,r=1,vol=1)=>w.postMessage({type:'chunk',audio,r,vol},[audio.buffer]),
      finish:()=>{w.postMessage({type:'finish'});return done.finally(()=>w.terminate())},
      kill:()=>w.terminate()
    };
  }
  /* Float32 PCM -> WAV blob (used only for the rare "preview file missing" fallback) */
  function wav(f,sr){
    const k=f.length,b=new DataView(new ArrayBuffer(44+k*2)),w=(o,s)=>{for(let i=0;i<s.length;i++)b.setUint8(o+i,s.charCodeAt(i))};
    w(0,'RIFF');b.setUint32(4,36+k*2,true);w(8,'WAVEfmt ');b.setUint32(16,16,true);b.setUint16(20,1,true);b.setUint16(22,1,true);
    b.setUint32(24,sr,true);b.setUint32(28,sr*2,true);b.setUint16(32,2,true);b.setUint16(34,16,true);w(36,'data');b.setUint32(40,k*2,true);
    for(let i=0;i<k;i++)b.setInt16(44+i*2,Math.max(-1,Math.min(1,f[i]))*32767,true);
    return new Blob([b],{type:'audio/wav'});
  }
  return{load,synth,encoder,wav};
}
