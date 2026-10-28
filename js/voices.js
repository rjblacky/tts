/* Voice list + helpers. Shared by the app (index.html) and tools/make-previews.html
   [id, randomuser photo number, age group]. Edit the numbers to change a photo. */
const MEN=[['am_adam',32,'Adult'],['am_echo',45,'Adult'],['am_eric',52,'Adult'],['am_fenrir',64,'Adult'],['am_liam',22,'Young'],['am_michael',71,'Mature'],['am_onyx',83,'Senior'],['am_puck',11,'Young'],['am_santa',90,'Senior'],['bm_daniel',36,'Adult'],['bm_fable',19,'Young'],['bm_george',86,'Senior'],['bm_lewis',58,'Mature']];
const WOM=[['af_alloy',44,'Adult'],['af_aoede',21,'Young'],['af_bella',65,'Adult'],['af_heart',68,'Adult'],['af_jessica',33,'Adult'],['af_kore',12,'Adult'],['af_nicole',79,'Mature'],['af_nova',17,'Young'],['af_river',50,'Adult'],['af_sarah',26,'Adult'],['af_sky',85,'Young'],['bf_alice',90,'Adult'],['bf_emma',55,'Adult'],['bf_isabella',62,'Mature'],['bf_lily',9,'Young']];
const ALL=[...MEN,...WOM],IDS=ALL.map(v=>v[0]),VM=Object.fromEntries(ALL.map(v=>[v[0],v]));
const nm=id=>id.split('_')[1][0].toUpperCase()+id.split('_')[1].slice(1),acc=id=>id[0]==='a'?'American':'British',gen=id=>id[1]==='f'?'F':'M';
/* The sentence each pre-recorded preview says (about 7 seconds). Change it, then re-run tools/make-previews.html */
const previewText=id=>`Hi, I'm ${nm(id)}. I can turn your text into natural, clear speech. Pick me, and I'll read your story.`;
