/* Pitch change + MP3 encoding in a background thread (classic worker). */
importScripts('https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js');
let enc=null,parts=[],samples=0,SR=24000;
function resample(d,r){
  if(Math.abs(r-1)<.005)return d;
  const n=Math.floor(d.length/r),o=new Float32Array(n);
  for(let i=0;i<n;i++){const x=i*r,j=x|0,f=x-j;o[i]=d[j]*(1-f)+(d[j+1]??d[j])*f}
  return o;
}
onmessage=e=>{
  const d=e.data;
  try{
    if(d.type==='start'){SR=d.sr;enc=new lamejs.Mp3Encoder(1,d.sr,d.kbps);parts=[];samples=0}
    else if(d.type==='chunk'){
      const a=resample(d.audio,d.r),s=new Int16Array(a.length);
      for(let j=0;j<a.length;j++)s[j]=Math.max(-1,Math.min(1,a[j]*d.vol))*32767;
      samples+=a.length;
      for(let p=0;p<s.length;p+=1152){const b=enc.encodeBuffer(s.subarray(p,p+1152));if(b.length)parts.push(new Uint8Array(b))}
    }else if(d.type==='finish'){
      const f=enc.flush();if(f.length)parts.push(new Uint8Array(f));
      postMessage({type:'done',blob:new Blob(parts,{type:'audio/mpeg'}),secs:samples/SR});
      parts=[];enc=null;
    }
  }catch(err){postMessage({type:'error',message:String((err&&err.message)||err)})}
};
