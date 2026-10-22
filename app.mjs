import { LANGUAGES } from './vocabulary.mjs';
import { DETECTION_VOCAB, DETECTION_BY_LABEL } from './detector-vocabulary.mjs';
import { OPENIMAGES_VOCAB, OPENIMAGES_BY_LABEL } from './openimages-vocabulary.mjs';
import { voicesFor } from './logic.mjs';
import { ObjectTracks, containRect } from './selection.mjs';
const $=id=>document.getElementById(id);
const video=$('video'),language=$('language'),detectorSelect=$('detector'),voiceSelect=$('voice'),synth=window.speechSynthesis;
let voices=[],stream=null,running=false,generation=0,worker=null,initPromise=null,initResolve,initReject,inflight=null,timer=null,current=null,facing='environment',speaking=false,speechTimer,watchdog,speechGeneration=0,frames=0;
const tracker=new ObjectTracks(),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
let cameraRequest=Promise.resolve();
let sourceMode='camera';
const sampleImage=$('sample-image');
function acquireCamera(options,own){
 const request=cameraRequest.then(async()=>{
  if(own!==generation)return null;
  const result=await navigator.mediaDevices.getUserMedia(options);
  if(own!==generation){result.getTracks().forEach(track=>track.stop());return null;}
  return result;
 });
 cameraRequest=request.then(()=>{},()=>{});return request;
}
const byId=new Map([...DETECTION_VOCAB,...OPENIMAGES_VOCAB].map(item=>[item.id,item])),boxButtons=new Map(),choiceButtons=new Map();
for(const lang of LANGUAGES)language.add(new Option(lang.label,lang.id));
language.value='es';
try{const saved=localStorage.getItem('word-lens-language');if(LANGUAGES.some(item=>item.id===saved))language.value=saved;}catch{}
try{const saved=localStorage.getItem('word-lens-detector');if(['expanded','standard'].includes(saved))detectorSelect.value=saved;}catch{}
function detectorLabels(){return detectorSelect.value==='expanded'?OPENIMAGES_BY_LABEL:DETECTION_BY_LABEL;}
function updateCoverage(){
 const expanded=detectorSelect.value==='expanded';
 $('detector-note').textContent=expanded?'Includes buildings, plants and body parts. Try Everyday for small objects.':'Everyday objects such as cups, chairs and books. Excludes houses and body parts.';
 $('coverage').textContent=expanded?`${OPENIMAGES_VOCAB.length} trained categories, including houses, flowers and body parts. Coverage is not an accuracy guarantee. Small, overlapping or dimly lit objects may be missed or misidentified.`:`${DETECTION_VOCAB.length} everyday categories, including cups, chairs, books and animals. Houses and body parts are not included. Small, overlapping or dimly lit objects may be missed or misidentified.`;
}
updateCoverage();
function locale(){return LANGUAGES.find(lang=>lang.id===language.value)?.locale||'en-US';}
function setStatus(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',error);}
function updateSpeak(){
 $('speak').disabled=!current||!voices.length||speaking||!synth;$('live-speak').disabled=$('speak').disabled;
 $('voice-availability').hidden=!current||Boolean(voices.length&&synth);
 $('voice-availability').textContent='No voice for this language. Add one in device settings; the word is still available.';
}
function stopSpeech(){speechGeneration++;clearTimeout(speechTimer);if(synth)synth.cancel();speaking=false;updateSpeak();}
function loadVoices(){
  const old=voiceSelect.value; voices=voicesFor(synth?.getVoices()||[],locale());voiceSelect.replaceChildren();
  if(!voices.length){voiceSelect.add(new Option('No voice available',''));voiceSelect.disabled=true;$('voice-note').textContent='Add a voice for this language in your device settings. You can still explore the words.';}
  else{voiceSelect.disabled=false;voices.forEach((v,i)=>voiceSelect.add(new Option(`${v.name} (${v.lang})`,String(i))));voiceSelect.value=old!==''&&voices[Number(old)]?old:'0';updateVoiceNote();}
  updateSpeak();
}
function updateVoiceNote(){const voice=voices[Number(voiceSelect.value)];if(!voice){$('voice-note').textContent='';return;}const region=voice.lang.toLowerCase().replace('_','-')!==locale().toLowerCase()?`Uses ${voice.lang} pronunciation rather than ${locale()}. `:'';$('voice-note').textContent=region+(voice.localService?'Uses an installed device voice.':'This voice may use an online speech service.');}
function renderWord(id){
 current=id&&byId.has(id)?byId.get(id):null;
 const selected=tracker.selected,visible=selected&&tracker.visible().some(t=>t.id===selected.id);
 $('word').textContent=current?current.words[language.value]:'—';$('word').lang=language.value;
 $('japanese').textContent=current?`English: ${current.words.en}`:(running?'Tap an object to discover its word.':'Your next word starts with a photo.');
 $('result-caption').textContent=current?(visible?'Selected':'Word kept · object out of view'):'Choose an object';
 $('result-note').textContent=current?(visible?'Tap another object to change your selection.':'The object left the frame. Its word stays here until you choose another or clear it.'):'Tap a detection box or an object name.';
 $('live-word').textContent=current?current.words[language.value]:'Tap an object';$('live-word').lang=language.value;
 $('live-caption').textContent=current?`${current.words.en} · ${visible?'Selected':'Out of view · word kept'}`:'Choose an object';
 $('clear-selection').hidden=!current;updateSpeak();
}
language.addEventListener('change',()=>{stopSpeech();try{localStorage.setItem('word-lens-language',language.value);}catch{}voiceSelect.value='';loadVoices();renderWord(current?.id);renderBoxes();});
voiceSelect.addEventListener('change',()=>{stopSpeech();updateVoiceNote();});
$('live-speak').addEventListener('click',()=>$('speak').click());
if(synth){synth.addEventListener('voiceschanged',loadVoices);}loadVoices();
$('speak').addEventListener('click',()=>{
  if(!current||!voices.length||!synth)return;
  const voice=voices[Number(voiceSelect.value)];if(!voice)return;
  stopSpeech();$('speech-status').textContent='';const utterance=new SpeechSynthesisUtterance(current.words[language.value]);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=1;utterance.pitch=1;
  const own=speechGeneration;speaking=true;updateSpeak();
  utterance.onend=()=>{if(own!==speechGeneration)return;clearTimeout(speechTimer);speaking=false;updateSpeak();};
  utterance.onerror=event=>{if(own!==speechGeneration)return;clearTimeout(speechTimer);speaking=false;updateSpeak();if(!['canceled','interrupted'].includes(event.error))$('speech-status').textContent='Pronunciation failed. Try another voice in settings.';};
  speechTimer=setTimeout(()=>{stopSpeech();$('speech-status').textContent='The voice did not respond. Try another voice in settings.';},15000);
  synth.speak(utterance);
});
function choose(id){
 const selected=tracker.select(id);if(!selected)return;
 stopSpeech();renderWord(detectorLabels().get(selected.label)?.id);renderBoxes();
}
function renderBoxes(){
 const now=performance.now(),visible=tracker.visible(now),bounds=$('viewfinder').getBoundingClientRect();
 const sourceWidth=sourceMode==='sample'?sampleImage.naturalWidth:video.videoWidth;
 const sourceHeight=sourceMode==='sample'?sampleImage.naturalHeight:video.videoHeight;
 const rect=containRect(sourceWidth||1,sourceHeight||1,bounds.width,bounds.height),ids=new Set(visible.map(t=>t.id));
 for(const [id,button] of boxButtons)if(!ids.has(id)){button.remove();boxButtons.delete(id);}
 for(const [id,button] of choiceButtons)if(!ids.has(id)){button.remove();choiceButtons.delete(id);}
 for(const t of visible){
  const item=detectorLabels().get(t.label);if(!item)continue;
  let box=boxButtons.get(t.id),choice=choiceButtons.get(t.id);
  if(!box){box=document.createElement('button');box.className='object-box';box.type='button';box.dataset.trackId=t.id;box.append(document.createElement('span'));box.addEventListener('click',()=>choose(t.id));$('object-overlay').append(box);boxButtons.set(t.id,box);}
  if(!choice){choice=document.createElement('button');choice.type='button';choice.dataset.trackId=t.id;choice.addEventListener('click',()=>choose(t.id));$('object-choices').append(choice);choiceButtons.set(t.id,choice);}
  const selected=tracker.selected?.id===t.id;
  for(const button of [box,choice]){button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',`Select ${item.words.en}`);button.dataset.label=t.label;}
  const number=visible.indexOf(t)+1;
  choice.textContent=(selected?'✓ ':'')+`${number} ${item.words.en}`;
  const w=Math.min(rect.width,Math.max(44,t.box.width*rect.width)),h=Math.min(rect.height,Math.max(44,t.box.height*rect.height));
  const left=Math.max(rect.x,Math.min(rect.x+rect.width-w,rect.x+(t.box.x+t.box.width/2)*rect.width-w/2));
  const top=Math.max(rect.y,Math.min(rect.y+rect.height-h,rect.y+(t.box.y+t.box.height/2)*rect.height-h/2));
  box.firstChild.textContent=(selected?'✓ ':'')+(w<80?String(number):`${number} ${item.words.en}`);
  Object.assign(box.style,{left:`${left}px`,top:`${top}px`,width:`${w}px`,height:`${h}px`,zIndex:String(20-Math.round(t.box.width*t.box.height*10))});
 }
 $('object-choices').hidden=!visible.length;
}
$('clear-selection').addEventListener('click',()=>{tracker.clear();stopSpeech();renderWord(null);renderBoxes();});
new ResizeObserver(()=>{if(running)renderBoxes();}).observe($('viewfinder'));
function getModel(){
 if(initPromise)return initPromise;
 worker=new Worker(detectorSelect.value==='expanded'?'/expanded-worker.js?v=1':'/detector-worker.js?v=2');
 initPromise=new Promise((resolve,reject)=>{initResolve=resolve;initReject=reject;});watchdog=setTimeout(failWorker,120000);
 worker.onmessage=({data})=>{
  if(data.type==='progress'&&running){$('progress').hidden=false;$('progress').value=data.percent??(data.progress??0)*100;setStatus(data.message);}
  if(data.type==='ready'){clearTimeout(watchdog);initResolve();$('progress').hidden=true;}
  if(data.type==='result'){clearTimeout(watchdog);const task=inflight;inflight=null;task?.resolve(data);}
  if(data.type==='error')failWorker();
 };
 worker.onerror=failWorker;worker.postMessage({type:'init'});return initPromise;
}
function failWorker(){clearTimeout(watchdog);const error=new Error('recognition');initReject?.(error);inflight?.reject(error);inflight=null;worker?.terminate();worker=null;initPromise=null;}
function infer(bitmap){return new Promise((resolve,reject)=>{inflight={resolve,reject};watchdog=setTimeout(failWorker,30000);try{worker.postMessage({type:'infer',bitmap,timestamp:performance.now()},[bitmap]);}catch(error){bitmap.close();clearTimeout(watchdog);inflight=null;reject(error);}});}
function controls(){
 $('start').hidden=running&&sourceMode==='camera';$('sample').hidden=running&&sourceMode==='sample';
 $('stop').hidden=!running;$('flip').hidden=!running||sourceMode==='sample';
 sampleImage.hidden=!running||sourceMode!=='sample';video.hidden=running&&sourceMode==='sample';
 $('camera-empty').hidden=running;$('live-result').hidden=!running;
 $('viewfinder').classList.toggle('live',running);document.body.classList.toggle('capture-active',running);
}
function stop(reason='Scan stopped. Try the sample or open your camera.'){
 generation++;running=false;clearTimeout(timer);stream?.getTracks().forEach(track=>track.stop());stream=null;video.srcObject=null;tracker.reset();frames=0;
 if(inflight)failWorker();
 for(const button of boxButtons.values())button.remove();for(const button of choiceButtons.values())button.remove();boxButtons.clear();choiceButtons.clear();$('object-choices').hidden=true;
 renderWord(null);stopSpeech();controls();$('camera-status').textContent='Ready when you are';$('timing').textContent='';$('progress').hidden=true;setStatus(reason);
}
async function start(){
 if(running&&sourceMode==='camera')return;
 if(running)stop();sourceMode='camera';
 if(!navigator.mediaDevices?.getUserMedia||!window.createImageBitmap){setStatus('Use a current version of Safari or Chrome with camera support, or try the sample photo.',true);return;}
 const own=++generation;running=true;controls();renderWord(null);setStatus('Allow camera access to start scanning.');$('camera-status').textContent='Preparing camera';
 try{
  const pendingStream=await acquireCamera({audio:false,video:{facingMode:{ideal:facing},width:{ideal:960},height:{ideal:720},frameRate:{ideal:15,max:24}}},own);
  if(!pendingStream)return;
  if(own!==generation){pendingStream.getTracks().forEach(track=>track.stop());return;}
  stream=pendingStream;stream.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>{if(running&&own===generation)stop('Camera disconnected. Open it again to continue.');}));video.srcObject=stream;await video.play();if(own!==generation)return;
  setStatus('Loading the detector. The first scan downloads the model.');await getModel();if(own!==generation)return;
  $('camera-status').textContent='Looking for objects';setStatus('Tap a box to choose an object.');loop(own);
 }catch(error){if(own!==generation)return;stop();const messages={NotAllowedError:'Camera access was denied. Try the sample photo, or allow camera access in site settings.',NotFoundError:'No camera found. Try the sample photo instead.',NotReadableError:'Camera unavailable. Close other camera apps, or try the sample photo.'};setStatus(messages[error.name]||'Could not start detection. Check your connection and try again.',true);}
}
async function startSample(){
 stop();sourceMode='sample';const own=++generation;running=true;controls();renderWord(null);
 $('camera-status').textContent='Sample photo · on-device scan';
 setStatus('Loading the model for a real scan. No camera permission is needed.');
 try{
  if(!window.createImageBitmap)throw Error('bitmap');
  await sampleImage.decode();if(own!==generation)return;
  await getModel();if(own!==generation)return;
  const bitmap=await createImageBitmap(sampleImage);
  if(own!==generation){bitmap.close();return;}
  const result=await infer(bitmap);if(own!==generation)return;
  const visible=tracker.update(validDetections(result),performance.now());renderBoxes();renderWord(null);
  $('timing').textContent=`${Math.round(result.ms)} ms`;
  $('camera-status').textContent=`Sample photo · ${visible.length} ${visible.length===1?'object':'objects'}`;
  setStatus(visible.length?'Real scan complete. Tap a box or an object name below.':'No objects found with this detector. Try the other detector in settings.');
 }catch{if(own===generation){stop();setStatus('Could not scan the sample. Check your connection and try again.',true);}}
}
function validDetections(result){
 return result.detections.filter(d=>detectorLabels().has(d.label)&&Number.isFinite(d.score)&&d.box&&[d.box.x,d.box.y,d.box.width,d.box.height].every(Number.isFinite)&&d.box.width>0&&d.box.height>0);
}
async function loop(own){
 if(!running||own!==generation)return;
 if(inflight||video.readyState<2||!video.videoWidth||!video.videoHeight){timer=setTimeout(()=>loop(own),200);return;}
 try{
  const started=performance.now(),scale=Math.min(1,640/Math.max(video.videoWidth,video.videoHeight));
  canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);ctx.drawImage(video,0,0,canvas.width,canvas.height);
  const bitmap=await createImageBitmap(canvas);if(!running||own!==generation){bitmap.close();return;}
  const result=await infer(bitmap);if(!running||own!==generation)return;
  const valid=validDetections(result);
  const visible=tracker.update(valid,performance.now());renderBoxes();renderWord(tracker.selected?detectorLabels().get(tracker.selected.label)?.id:null);
  frames++;$('camera-status').textContent=`${visible.length} objects · scan ${frames}`;$('timing').textContent=`${Math.round(result.ms)} ms`;
  setStatus(visible.length?'Tap a box or an object name below.':'Looking for objects. Move closer or try another angle.');
  timer=setTimeout(()=>loop(own),Math.max(100,400-(performance.now()-started)));
 }catch{if(own===generation){stop();setStatus('Detection stopped unexpectedly. Start again to retry.',true);}}
}
$('start').addEventListener('click',start);$('stop').addEventListener('click',()=>stop());$('flip').addEventListener('click',()=>{facing=facing==='environment'?'user':'environment';stop();start();});
$('sample').addEventListener('click',startSample);
detectorSelect.addEventListener('change',()=>{const resume=running,previousMode=sourceMode;stop('Detector changed.');failWorker();updateCoverage();try{localStorage.setItem('word-lens-detector',detectorSelect.value);}catch{}if(resume)(previousMode==='sample'?startSample:start)();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)stop('Scan stopped while the page was hidden. Try the sample or open your camera again.');});
window.addEventListener('pagehide',()=>{stop();failWorker();});
window.addEventListener('offline',()=>{if(!running)setStatus('You are offline. Reconnect if the model has not loaded yet.');});
renderWord(null);
