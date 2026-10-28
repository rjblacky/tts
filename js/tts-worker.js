/* Runs the Kokoro AI voice in a background thread so the page never freezes.
   Module worker: started with new Worker('js/tts-worker.js',{type:'module'}) */
const MODEL='onnx-community/Kokoro-82M-v1.0-ONNX';
let tts=null,loading=null;
const files={};
function onProgress(p){
  if(p.status!=='progress'||!p.total)return;
  files[p.file]={l:p.loaded,t:p.total};
  let l=0,t=0;for(const k in files){l+=files[k].l;t+=files[k].t}
  postMessage({type:'progress',pct:Math.min(100,Math.round(l/t*100))});
}
function load(){
  if(tts)return Promise.resolve(tts);
  return loading||(loading=(async()=>{
    const {KokoroTTS}=await import('https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm');
    tts=await KokoroTTS.from_pretrained(MODEL,{dtype:'q8',device:'wasm',progress_callback:onProgress});
    return tts;
  })().catch(e=>{loading=null;throw e}));
}
/* one job at a time, in order */
let queue=Promise.resolve();
onmessage=e=>{queue=queue.then(()=>handle(e.data))};
async function handle(m){
  try{
    const k=await load();
    if(m.type==='load')return postMessage({id:m.id,type:'ready'});
    const a=await k.generate(m.text,{voice:m.voice,speed:m.speed});
    const f=a.audio;
    postMessage({id:m.id,type:'audio',audio:f,sr:a.sampling_rate},[f.buffer]);
  }catch(err){
    postMessage({id:m.id,type:'error',message:String((err&&err.message)||err)});
  }
}
