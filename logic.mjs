export function normalize(vector){const norm=Math.hypot(...vector)||1;return Array.from(vector,value=>value/norm);}
export function rankVector(vector,entries){const v=normalize(vector);return entries.map(entry=>({id:entry.id,score:entry.vector.reduce((sum,n,i)=>sum+n*v[i],0)})).sort((a,b)=>b.score-a.score);}
// Similarity is not a probability. Keep tentative candidates distinct from stable results.
export function recognitionFeedback(ranked,stableId){
  const isObject=x=>x&&!x.id.startsWith('_')&&!x.id.startsWith('background-')&&x.score>=.20;
  const first=ranked[0];
  if(!isObject(first))return {id:null,mode:'searching',alternatives:[]};
  const stable=first.id===stableId&&first.score-(ranked[1]?.score??0)>=.018;
  return {id:first.id,mode:stable?'stable':'tentative',alternatives:ranked.slice(1).filter(isObject).map(x=>x.id)};
}
export class Stabilizer{
  constructor(){this.reset();}
  reset(){this.candidate=null;this.count=0;this.current=null;this.lastGood=0;}
  update(ranked,now){
    const [first,second]=ranked;const good=first&&!first.id.startsWith('_')&&!first.id.startsWith('background-')&&first.score>=.20&&first.score-(second?.score??0)>=.018;
    if(good){this.count=first.id===this.candidate?this.count+1:1;this.candidate=first.id;if(this.count>=2){this.current=first.id;this.lastGood=now;}}
    else{this.candidate=null;this.count=0;}
    if(now-this.lastGood>1800)this.current=null;
    return this.current;
  }
}
export function voicesFor(voices,locale){const base=locale.split('-')[0].toLowerCase();return voices.filter(v=>v.lang.toLowerCase().replace('_','-').split('-')[0]===base).sort((a,b)=>voiceScore(b,locale)-voiceScore(a,locale));}
function voiceScore(voice,locale){return (voice.lang.toLowerCase().replace('_','-')===locale.toLowerCase()?100:0)+(/natural|premium|enhanced|neural|google/i.test(voice.name)?20:0)+(voice.default?2:0);}
