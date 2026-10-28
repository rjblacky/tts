const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const P=(d,f)=>`<svg class="ic${f?' fl':''}" viewBox="0 0 24 24">${d}</svg>`;
const IC={play:['<path d="M8 5v14l11-7z"/>',1],pause:['<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>',1],check:['<path d="M5 13l4 4L19 7"/>'],spark:['<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16v4M17 18h4"/>'],
doc:['<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>'],down:['<path d="M12 4v11M8 11l4 4 4-4M5 20h14"/>'],up:['<path d="M12 16V5M8 9l4-4 4 4M5 20h14"/>'],lock:['<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'],
user:['<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'],type:['<path d="M5 6h14M12 6v13M9 19h6"/>'],gauge:['<path d="M4 18a8 8 0 1116 0"/><path d="M12 14l4-4"/>'],file:['<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 15V9l7-1v6"/><circle cx="8" cy="15" r="1.5"/><circle cx="15" cy="14" r="1.5"/>'],chev:['<path d="M9 6l6 6-6 6"/>'],
swap:['<path d="M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3"/>'],reset:['<path d="M4 12a8 8 0 102.5-5.8M4 4v5h5"/>'],x:['<path d="M6 6l12 12M18 6L6 18"/>'],moon:['<path d="M20 14A8 8 0 1110 4a7 7 0 0010 10z"/>'],sun:['<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>']};
const ic=n=>P(IC[n][0],IC[n][1]),paint=()=>$$('[data-ic]').forEach(e=>e.innerHTML=ic(e.dataset.ic));
const ST={get(k,d){try{return localStorage.getItem('lv_'+k)||d}catch{return d}},set(k,v){try{localStorage.setItem('lv_'+k,v)}catch{}}};/* voices, names and the preview sentence live in js/voices.js; the background workers live in js/engine.js */
const img=(id,c)=>`<img src="https://randomuser.me/api/portraits/${gen(id)==='M'?'men':'women'}/${VM[id][1]}.jpg" onerror="this.onerror=null;this.src='images/avatars/${id}.svg'" alt="${nm(id)}" loading="lazy" decoding="async" ${c||''}>`;
let cur=IDS.includes(ST.get('v'))?ST.get('v'):'am_adam',mode='tts',busy=false,cancel=false,bookText='',bookName='',url='',WL=null;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),3800)}
const status=m=>$('#st').textContent=m,prog=p=>{p=Math.max(0,Math.min(1,p));$('#pb').style.width=p*100+'%';$('#pct').textContent=Math.round(p*100)+'%'};
const E=createEngine('js/',pct=>status(`Downloading voice engine (one time, ~90 MB)… ${pct}%`));
const row=v=>`<div class="vr ${v[0]===cur?'on':''}" role="option" tabindex="0" data-id="${v[0]}"><div class="ph">${img(v[0])}</div><div class="vi"><b>${nm(v[0])}</b><span>${v[2]} · ${acc(v[0])}</span></div><button class="pb" data-p="${v[0]}" aria-label="Preview ${nm(v[0])}">${ic('play')}</button><span class="rk">${ic('check')}</span></div>`;
const renderList=()=>$('#vl').innerHTML='<div class="gh">Male voices</div>'+MEN.map(row).join('')+'<div class="gh">Female voices</div>'+WOM.map(row).join('');
const renderSel=()=>$('#pick').innerHTML=`<div class="ph">${img(cur)}</div><div class="wi"><b>${nm(cur)} (${gen(cur)==='F'?'Female':'Male'})</b><span>${VM[cur][2]} · ${acc(cur)} English</span></div><i class="sw">${ic('swap')}</i>`;
$('#stack').innerHTML=['am_adam','af_heart','am_onyx','af_bella','bm_george','af_nova'].map(i=>img(i)).join('');
$('#tabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;mode=b.dataset.t;$$('#tabs button').forEach(x=>x.classList.toggle('on',x===b));$$('.tab').forEach(t=>t.classList.toggle('on',t.id===mode))};
/* voice popup */
const md=$('#md'),openM=()=>{renderList();md.hidden=false;document.body.style.overflow='hidden';$('#vl').scrollTop=0},closeM=()=>{stopPrev();md.hidden=true;document.body.style.overflow=''};
$('#pick').onclick=openM;$$('[data-open]').forEach(b=>b.onclick=e=>{e.preventDefault();openM()});
md.onclick=e=>{if(e.target===md||e.target.closest('[data-close]'))closeM()};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!md.hidden)closeM()});
$('#vl').onclick=e=>{const p=e.target.closest('.pb');if(p)return preview(p.dataset.p,p);const r=e.target.closest('.vr');if(r){cur=r.dataset.id;ST.set('v',cur);renderSel();closeM()}};
$('#vl').onkeydown=e=>{if(e.key==='Enter'&&e.target.classList.contains('vr'))e.target.click()};

/* VOICE PREVIEWS: ready-made ~7 second MP3 files in audio/previews/ (no AI model, no waiting).
   Only if a file is missing does it fall back to making that one preview in the background. */
const PV=new Audio(),made={};let PL=null;PV.preload='none';
const btnState=(b,s)=>{b.classList.toggle('pl',s==='pl');b.classList.toggle('ld',s==='ld');b.innerHTML=ic(s==='pl'?'pause':'play')};
function stopPrev(){if(!PL)return;const p=PL;PL=null;PV.pause();btnState(p.b,'')}
PV.onended=stopPrev;
async function preview(id,b){
  const same=PL&&PL.id===id;stopPrev();if(same)return;
  const me=PL={id,b};btnState(b,'ld');
  try{PV.src=`audio/previews/${id}.mp3`;await PV.play()}
  catch(e){
    if(PL!==me)return;                       /* user tapped something else meanwhile */
    if(e&&e.name==='NotAllowedError'){PL=null;return btnState(b,'')}
    try{
      if(busy){PL=null;btnState(b,'');return toast('Please wait until your audio is created, then try the preview again')}
      if(!made[id]){toast('Preview file not found. Creating it now. The first time this downloads the voice engine (~90 MB).');
        const a=await E.synth(previewText(id),id,1);made[id]=URL.createObjectURL(E.wav(a.audio,a.sr))}
      if(PL!==me)return;
      PV.src=made[id];await PV.play();
    }catch(e2){
      if(PL===me)PL=null;btnState(b,'');
      toast(e2&&e2.name==='NotAllowedError'?'Preview is ready. Tap play again.':(e2.message||'Preview failed. Check your internet connection.'));return}
  }
  if(PL===me)btnState(b,'pl');
}

/* text → chunks */
function chunk(t){const o=[];for(let s of t.replace(/[ \t]+/g,' ').split(/(?<=[.!?…])\s+|\n+/)){s=s.trim();while(s.length>200){let k=s.lastIndexOf(' ',200);if(k<50)k=200;o.push(s.slice(0,k));s=s.slice(k).trim()}if(s)o.push(s)}
const m=[];for(const s of o){if(m.length&&m[m.length-1].length+s.length<180)m[m.length-1]+=' '+s;else m.push(s)}return m}

/* inputs */
const txt=$('#txt'),upd=()=>{$('#cnt').textContent=txt.value.length.toLocaleString()+' characters'};txt.oninput=upd;
$('#tf').onchange=async e=>{const f=e.target.files[0];if(f){txt.value=await f.text();upd()}};
$('#sp').oninput=e=>$('#spv').textContent=(+e.target.value).toFixed(2)+'×';
const PJ='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
async function readPdf(f){if(!window.pdfjsLib){await new Promise((ok,no)=>{const s=document.createElement('script');s.src=PJ+'pdf.min.js';s.onload=ok;s.onerror=()=>no(new Error('PDF reader needs internet the first time'));document.head.appendChild(s)});
const w=await(await fetch(PJ+'pdf.worker.min.js')).text();pdfjsLib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([w],{type:'text/javascript'}))}
const pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise,o=[];
for(let i=1;i<=pdf.numPages;i++){const c=await(await pdf.getPage(i)).getTextContent();o.push(c.items.map(x=>x.str).join(' ').replace(/\s+/g,' ').trim());$('#di').textContent=`Reading page ${i} of ${pdf.numPages}…`}
const t=o.join('\n').trim();if(t.length<20)throw new Error('No readable text. This looks like a scanned PDF (images only).');return t}
async function loadBook(f){if(!f)return;try{$('#dn').textContent=f.name;$('#di').textContent='Reading…';bookText=/\.pdf$/i.test(f.name)?await readPdf(f):await f.text();bookName=f.name.replace(/\.\w+$/,'');
$('#di').textContent=bookText.length.toLocaleString()+' characters · about '+Math.max(1,Math.round(bookText.length/900))+' min of audio'}
catch(e){bookText='';$('#dn').textContent='Drop a PDF or TXT file';$('#di').textContent='or click to browse';toast(e.message||'Could not read this file')}}
$('#bf').onchange=e=>loadBook(e.target.files[0]);
const dz=$('#dz');['dragover','dragenter'].forEach(n=>dz.addEventListener(n,e=>{e.preventDefault();dz.classList.add('h')}));['dragleave','drop'].forEach(n=>dz.addEventListener(n,()=>dz.classList.remove('h')));
dz.addEventListener('drop',e=>{e.preventDefault();loadBook(e.dataTransfer.files[0])});

/* settings */
const fmt=s=>isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';
$('#pi').oninput=e=>$('#piv').textContent=(e.target.value>0?'+':'')+Math.round(e.target.value*100)+'%';$('#vo').oninput=e=>$('#vov').textContent=Math.round(e.target.value*100)+'%';
$('#rst').onclick=()=>{[['sp',1],['pi',0],['vo',1]].forEach(([i,v])=>{$('#'+i).value=v;$('#'+i).dispatchEvent(new Event('input'))})};
$('#cl').onclick=()=>{txt.value='';upd()};
/* player for the generated MP3 */
const au=$('#au'),sk=$('#sk');let D=0;const dur=()=>isFinite(au.duration)&&au.duration>0?au.duration:D;
$('#pp').innerHTML=ic('play');$('#pp').onclick=()=>au.paused?au.play():au.pause();
au.onplay=()=>$('#pp').innerHTML=ic('pause');au.onpause=()=>$('#pp').innerHTML=ic('play');
au.ontimeupdate=()=>{sk.value=dur()?au.currentTime/dur()*1000:0;$('#tc').textContent=fmt(au.currentTime)};au.onended=()=>{au.currentTime=0;sk.value=0};
sk.oninput=()=>{au.currentTime=sk.value/1000*dur()};

/* GENERATE: text -> small parts -> Kokoro voice (background worker) -> MP3 (second worker).
   The page itself only updates the progress bar, so it never freezes. Click again to stop. */
const setGo=b=>{const g=$('#go');g.classList.toggle('stop',b);g.innerHTML=b?ic('x')+'Stop':ic('spark')+'Generate Speech';document.body.classList.toggle('busy',b)};
const wake=async()=>{try{WL=await navigator.wakeLock.request('screen')}catch{}},unwake=()=>{try{WL&&WL.release()}catch{}WL=null};
addEventListener('beforeunload',e=>{if(busy){e.preventDefault();e.returnValue=''}});
$('#go').onclick=async()=>{
  if(busy){cancel=true;status('Stopping after this part…');return}
  const text=mode==='tts'?txt.value.trim():bookText;
  if(!text)return toast(mode==='tts'?'Enter some text first':'Choose a PDF or TXT file first');
  if(text.length>20000&&!confirm(`About ${Math.round(text.length/900)} minutes of audio. This can take a while. Keep this tab open. Continue?`))return;
  busy=true;cancel=false;setGo(true);$('#plr').hidden=true;au.pause();$('#pgw').hidden=false;prog(0);stopPrev();wake();
  let enc=null;
  try{
    status('Loading voice engine…');await E.load();
    status('Voice engine ready'+(self.crossOriginIsolated?' · multi-core on':''));
    enc=E.encoder(24000,96);
    const r=1+(+$('#pi').value),vol=+$('#vo').value,sp=+$('#sp').value,speed=Math.min(2,Math.max(.5,sp/r)),parts=chunk(text),total=text.length;
    let done=0,skipped=0;const t0=performance.now();
    for(let i=0;i<parts.length;i++){
      if(cancel)break;
      if(enc.failed)throw enc.failed;
      const left=done?` · about ${fmt((performance.now()-t0)/done*(total-done)/1000)} left`:'';
      status(`Creating audio · part ${i+1} of ${parts.length}${left}`);
      try{const a=await E.synth(parts[i],cur,speed);enc.add(a.audio,r,vol)}
      catch(e){if(e.fatal)throw e;skipped++}      /* a part with no speakable text is skipped */
      done+=parts[i].length;prog(done/total*.98);
    }
    if(skipped===parts.length)throw new Error('Could not turn this text into speech');
    const res=await enc.finish();enc=null;prog(1);
    if(!res.secs){status('Stopped');return}
    const name=((mode==='tts'?'speech-'+nm(cur):bookName+'-'+nm(cur)).replace(/[^\w\- ]+/g,'').trim().slice(0,60)||'speech')+'.mp3';
    if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(res.blob);
    const d=$('#dl');d.href=url;d.download=name;au.src=url;D=res.secs;sk.value=0;$('#tc').textContent='0:00';$('#td').textContent=fmt(res.secs);$('#plr').hidden=false;
    status((cancel?'Stopped · partial audio ready':'Ready')+` · ${fmt(res.secs)} of audio. Press play to listen.`+(skipped?` (${skipped} part${skipped>1?'s':''} skipped)`:''));
  }catch(e){if(enc)enc.kill();status('Generation failed');toast(e.message||'Generation failed')}
  finally{busy=false;cancel=false;setGo(false);unwake()}
};
const root=document.documentElement,setTheme=t=>{root.dataset.theme=t;ST.set('theme',t);$('#theme').innerHTML=ic(t==='dark'?'sun':'moon')};
setTheme(root.dataset.theme);$('#theme').onclick=()=>setTheme(root.dataset.theme==='dark'?'light':'dark');
paint();renderSel();upd();setGo(false);
