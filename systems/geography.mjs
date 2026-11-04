function shareLandBorder(w,a,b,width) {
  if(Math.abs(a.rx-b.rx)+Math.abs(a.ry-b.ry)!==1)return false;
  if(a.rx!==b.rx){
    const x=Math.max(a.rx,b.rx)*6;
    for(let y=a.ry*6;y<a.ry*6+6;y++){
      const left=w.tiles[y*width+x-1],right=w.tiles[y*width+x];
      if(left.land&&right.land&&((left.region===a.id&&right.region===b.id)||(left.region===b.id&&right.region===a.id)))return true;
    }
  }else{
    const y=Math.max(a.ry,b.ry)*6;
    for(let x=a.rx*6;x<a.rx*6+6;x++){
      const north=w.tiles[(y-1)*width+x],south=w.tiles[y*width+x];
      if(north.land&&south.land&&((north.region===a.id&&south.region===b.id)||(north.region===b.id&&south.region===a.id)))return true;
    }
  }
  return false;
}
export function buildGeography(w,width){
  for(const r of w.regions)r.neighbors=w.regions.filter(n=>shareLandBorder(w,r,n,width)).map(n=>n.id);
  for(const r of w.regions){
    const lower=r.neighbors.map(id=>w.regions.find(n=>n.id===id)).filter(n=>n.elevation<r.elevation-.015)
      .sort((a,b)=>a.elevation-b.elevation||a.id-b.id);
    r.downstream=lower[0]?.id??null;
  }
}
