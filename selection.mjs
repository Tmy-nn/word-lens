export function intersectionOverUnion(a,b){
  const w=Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x));
  const h=Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
  const intersection=w*h;return intersection/(a.width*a.height+b.width*b.height-intersection||1);
}
export function containRect(sourceWidth,sourceHeight,width,height){
  const scale=Math.min(width/sourceWidth,height/sourceHeight);
  const w=sourceWidth*scale,h=sourceHeight*scale;
  return {x:(width-w)/2,y:(height-h)/2,width:w,height:h};
}
export class ObjectTracks{
  constructor(){this.reset();}
  reset(){this.tracks=[];this.nextId=1;this.selected=null;}
  update(detections,now){
    const old=this.tracks.filter(t=>t.missed<2&&now-t.seen<5000),pairs=[];
    detections.forEach((d,di)=>old.forEach((t,ti)=>{if(t.label===d.label){const overlap=intersectionOverUnion(t.box,d.box);if(overlap>=.3)pairs.push({di,ti,overlap});}}));
    pairs.sort((a,b)=>b.overlap-a.overlap);const matched=new Map(),used=new Set();
    for(const p of pairs)if(!matched.has(p.di)&&!used.has(p.ti)){matched.set(p.di,p.ti);used.add(p.ti);}
    this.tracks=detections.map((d,i)=>({...d,id:matched.has(i)?old[matched.get(i)].id:this.nextId++,seen:now,missed:0}));
    this.tracks.push(...old.filter((_,i)=>!used.has(i)).map(t=>({...t,missed:t.missed+1})));
    this.tracks.sort((a,b)=>a.id-b.id);
    if(this.selected){const seen=this.tracks.find(t=>t.id===this.selected.id);if(seen)this.selected={...seen};}
    return this.visible(now);
  }
  visible(){return this.tracks.filter(t=>t.missed===0);}
  select(id){const track=this.tracks.find(t=>t.id===id);if(track)this.selected={...track};return this.selected;}
  clear(){this.selected=null;}
}
