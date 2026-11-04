// A deterministic, deliberately coarse world model. Population is in thousands;
// food is measured in thousand person-years. One step advances one year.
export const WIDTH = 36;
export const HEIGHT = 24;
export const ACTIONS = [
  {id:'rain', icon:'◌', name:'Gọi mưa', scope:'region', note:'Nước tăng ba năm; mưa quá nhiều có thể làm mất mùa.'},
  {id:'dam', icon:'▤', name:'Đắp đập', scope:'region', note:'Giữ nước lâu dài ở đây; vùng kề phía hạ lưu chịu thiếu nước.'},
  {id:'forest', icon:'♣', name:'Phục hồi rừng', scope:'region', note:'Đất và nước hồi phục dần; diện tích canh tác giảm trước mắt.'},
  {id:'granary', icon:'▣', name:'Mở kho lương', scope:'region', note:'Cứu đói tức thời; lấy tài sản chung để duy trì kho.'},
  {id:'clinic', icon:'✚', name:'Dựng trạm y', scope:'region', note:'Giảm dịch và tử vong; dân số về sau tăng nhanh hơn.'},
  {id:'school', icon:'◇', name:'Mở trường', scope:'region', note:'Tăng tri thức chậm nhưng bền; tốn của cải năm đầu.'},
  {id:'road', icon:'═', name:'Mở đường', scope:'region', note:'Tăng trao đổi, di cư và khả năng dịch lan theo mạng.'},
  {id:'mine', icon:'◆', name:'Khai mỏ', scope:'region', note:'Giàu lên sớm; suy giảm rừng, đất và sức khỏe.'},
  {id:'open', icon:'⇄', name:'Mở lối di cư', scope:'region', note:'Người thiếu ăn dễ rời đi; vùng nhận có thể căng thẳng.'},
  {id:'close', icon:'⊘', name:'Khép lối di cư', scope:'region', note:'Giảm dòng người qua biên; người ở lại có thể mắc kẹt.'},
  {id:'treaty', icon:'♢', name:'Giảng hòa', scope:'region', note:'Hạ căng thẳng giữa vùng này và một láng giềng.'},
  {id:'cool', icon:'−', name:'Làm mát khí hậu', scope:'world', note:'Giảm nhiệt toàn hành tinh; vùng lạnh có thể mất mùa.'},
  {id:'warm', icon:'+', name:'Làm ấm khí hậu', scope:'world', note:'Tăng nhiệt toàn hành tinh; vùng nóng có thể mất mùa.'}
];

const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const round = (v,n=1) => Math.round(v*10**n)/10**n;
function random(world) {
  let x=world.rng|0;
  x^=x<<13; x^=x>>>17; x^=x<<5;
  world.rng=x>>>0;
  return world.rng/4294967296;
}
function seeded(seed) { return {rng:(Number(seed)>>>0)||0x9e3779b9}; }
function hash(x,y,s) {
  let n=Math.imul(x+17,374761393)^Math.imul(y+91,668265263)^Math.imul(s,2246822519);
  n=Math.imul(n^(n>>>13),1274126177);
  return ((n^(n>>>16))>>>0)/4294967296;
}
function noise(x,y,s,scale) {
  const ax=Math.floor(x/scale), ay=Math.floor(y/scale), fx=x/scale-ax, fy=y/scale-ay;
  const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  const a=hash(ax,ay,s)*(1-u)+hash(ax+1,ay,s)*u;
  const b=hash(ax,ay+1,s)*(1-u)+hash(ax+1,ay+1,s)*u;
  return a*(1-v)+b*v;
}
export function makeWorld(seed=Date.now()) {
  const s=(Number(seed)>>>0)||1, world={version:1,seed:s,rng:s,year:0,climate:0,tiles:[],regions:[],history:[],trends:[],lastStep:[],nextEvent:1};
  const centers=[{x:8,y:9,r:11},{x:23,y:16,r:10},{x:29,y:6,r:7},{x:15,y:20,r:5}];
  for(let y=0;y<HEIGHT;y++) for(let x=0;x<WIDTH;x++) {
    const continent=Math.max(...centers.map(c=>1-Math.hypot(x-c.x,(y-c.y)*1.12)/c.r));
    const elevation=clamp(.43+continent*.49+(noise(x,y,s,7)-.5)*.24+(noise(x,y,s+1,3)-.5)*.16,0,1);
    const land=elevation>.48, latitude=Math.abs((y/(HEIGHT-1))-.5)*2;
    const moisture=clamp(.31+noise(x,y,s+2,6)*.48-latitude*.14+(elevation<.6?.1:0),.08,1);
    world.tiles.push({x,y,land,elevation:round(elevation,3),moisture:round(moisture,3),region:null});
  }
  const letters=['Aru','Bêla','Cơm','Daru','Ên','Fera','Galin','Hao','Ilan','Kê','Lomu','Mira','Naru','Ôma','Pelu','Raha','Sêra','Tami','Ulan','Vê','Xaru','Yên','Zêla','Nê'];
  for(let ry=0;ry<4;ry++) for(let rx=0;rx<6;rx++) {
    const cells=[]; for(let y=ry*6;y<ry*6+6;y++) for(let x=rx*6;x<rx*6+6;x++) cells.push(world.tiles[y*WIDTH+x]);
    const landCells=cells.filter(t=>t.land), land=landCells.length;
    if(land<9) continue;
    const id=ry*6+rx, latitude=Math.abs(((ry*6+3)/(HEIGHT-1))-.5)*2;
    const moisture=landCells.reduce((a,t)=>a+t.moisture,0)/land;
    const elev=landCells.reduce((a,t)=>a+t.elevation,0)/land;
    const capacity=land*(2.4+moisture*2.3)*(1-latitude*.25);
    const pop=capacity*(.27+random(world)*.25);
    const region={id,name:letters[id],rx,ry,land,latitude:round(latitude,3),moisture:round(moisture,3),elevation:round(elev,3),capacity:round(capacity),pop:round(pop),food:round(pop*(.25+random(world)*.35)),soil:round(.62+random(world)*.3,3),forest:round(.35+random(world)*.4,3),health:round(.68+random(world)*.2,3),knowledge:round(5+random(world)*14),wealth:round(16+random(world)*24),trust:round(.45+random(world)*.35,3),tension:round(.09+random(world)*.22,3),disease:0,infra:0,industry:0,school:0,clinic:0,dam:0,openness:.5,rainBoost:0,neighbors:[],last:{},trend:[]};
    world.regions.push(region);
    cells.forEach(t=>{if(t.land)t.region=id;});
  }
  for(const r of world.regions) r.neighbors=world.regions.filter(n=>Math.abs(n.rx-r.rx)+Math.abs(n.ry-r.ry)===1).map(n=>n.id);
  record(world,'Khởi nguyên',`Bản ghi bắt đầu tại năm 0. ${world.regions.length} cộng đồng đã tồn tại; nguồn gốc sâu hơn chưa được xác lập.`,null,'start');
  snapshot(world);
  return world;
}
function record(w,title,detail,region=null,kind='system') {
  const e={id:w.nextEvent++,year:w.year,title,detail,region,kind};
  w.history.unshift(e);
  w.lastStep.push(e); return e;
}
function snapshot(w) {
  const total=w.regions.reduce((a,r)=>a+r.pop,0);
  const food=w.regions.reduce((a,r)=>a+r.food,0);
  const sample={year:w.year,pop:round(total),food:round(food),climate:round(w.climate,2),conflict:w.history.filter(e=>e.kind==='conflict'&&e.year===w.year).length};
  w.trends.push(sample); if(w.trends.length>240)w.trends.shift();
}
export function totals(w) {
  const pop=w.regions.reduce((a,r)=>a+r.pop,0);
  return {pop:round(pop),food:round(w.regions.reduce((a,r)=>a+r.food,0)),knowledge:round(w.regions.reduce((a,r)=>a+r.knowledge*r.pop,0)/Math.max(1,pop)),wealth:round(w.regions.reduce((a,r)=>a+r.wealth,0)),communities:w.regions.filter(r=>r.pop>=1).length};
}
export function intervene(w,actionId,regionId) {
  const a=ACTIONS.find(x=>x.id===actionId), r=w.regions.find(x=>x.id===Number(regionId));
  if(!a || (a.scope==='region'&&!r)) throw new Error('Can thiệp không hợp lệ.');
  if(a.scope==='region' && r.pop<1) throw new Error('Cộng đồng này không còn người để can thiệp.');
  let detail='';
  switch(actionId){
    case 'rain': r.rainBoost=Math.max(r.rainBoost,3);detail='Mưa được duy trì ba năm. Nước tăng; nếu vượt sức chịu của đất, mùa màng có thể hỏng.';break;
    case 'dam': r.dam++;r.wealth=Math.max(0,r.wealth-12);detail='Đập giữ nước cho vùng này. Vùng kề phía nam sẽ nhận ít nước hơn.';break;
    case 'forest':r.forest=clamp(r.forest+.22,0,1);r.soil=clamp(r.soil+.06,0,1);r.food=Math.max(0,r.food-r.pop*.16);detail='Rừng và đất phục hồi, một phần ruộng tạm ngừng sản xuất.';break;
    case 'granary':r.food+=r.pop*.65;r.wealth=Math.max(0,r.wealth-14);detail='Kho dự trữ đủ nuôi dân thêm khoảng tám tháng; nguồn của cải chung giảm.';break;
    case 'clinic':r.clinic++;r.health=clamp(r.health+.14,0,1);r.disease*=.42;r.wealth=Math.max(0,r.wealth-12);detail='Dịch giảm, sức khỏe tăng. Nhu cầu lương thực của dân số sống sót vẫn tiếp tục.';break;
    case 'school':r.school++;r.wealth=Math.max(0,r.wealth-10);detail='Một trường được dựng. Tri thức sẽ tích lũy qua các năm.';break;
    case 'road':r.infra++;r.wealth=Math.max(0,r.wealth-13);detail='Đường nối vùng lân cận: trao đổi, di cư và lây bệnh đều dễ hơn.';break;
    case 'mine':r.industry++;r.wealth+=25;r.forest=clamp(r.forest-.1,0,1);r.soil=clamp(r.soil-.08,0,1);r.health=clamp(r.health-.025,0,1);detail='Tài sản tăng nhanh, rừng và đất suy giảm.';break;
    case 'open':r.openness=clamp(r.openness+.35,0,1);detail='Vùng này nhận người dễ hơn; nguồn lực và lòng tin sẽ quyết định kết quả.';break;
    case 'close':r.openness=clamp(r.openness-.35,0,1);r.trust=clamp(r.trust-.04,0,1);detail='Lối đi thu hẹp, người thiếu ăn khó tìm chỗ khác.';break;
    case 'treaty':{let n=r.neighbors.map(id=>w.regions.find(x=>x.id===id)).filter(Boolean).sort((a,b)=>b.tension-a.tension)[0]; if(!n)throw new Error('Vùng này không có láng giềng trên đất liền.');r.tension=clamp(r.tension-.4,0,1);n.tension=clamp(n.tension-.4,0,1);r.trust=clamp(r.trust+.08,0,1);n.trust=clamp(n.trust+.08,0,1);detail=`Thỏa thuận với ${n.name} hạ căng thẳng ở cả hai phía.`;break;}
    case 'cool':w.climate=clamp(w.climate-.25,-2,2);detail='Nhiệt trung bình giảm. Tác động khác nhau theo vĩ độ.';break;
    case 'warm':w.climate=clamp(w.climate+.25,-2,2);detail='Nhiệt trung bình tăng. Tác động khác nhau theo vĩ độ.';break;
  }
  record(w,`Can thiệp: ${a.name}`,`${a.scope==='region'?r.name+': ':''}${detail}`,a.scope==='region'?r.id:null,'choice');
  return w;
}
export function step(w) {
  w.year++;w.lastStep=[];
  const weather=(random(w)-.5)*.45, deltas=new Map(w.regions.map(r=>[r.id,0]));
  const previous=new Map(w.regions.map(r=>[r.id,{pop:r.pop,food:r.food,disease:r.disease,infra:r.infra,openness:r.openness,wealth:r.wealth}]));
  for(const r of w.regions){
    if(r.pop<1)continue;
    const priorShortage=r.last?.shortage||0;
    const downstream=w.regions.filter(n=>n.rx===r.rx && n.ry===r.ry-1).reduce((s,n)=>s+n.dam,0);
    const rain=clamp(r.moisture+weather+(random(w)-.5)*.16+(r.rainBoost?.32:0)+r.forest*.1-r.dam*.015-downstream*.11,.02,1.35);
    const temperature=clamp(1-r.latitude*.77-r.elevation*.2+w.climate*.13,0,1.5);
    const tempFitness=clamp(1-Math.abs(temperature-.62)*.88,.28,1.06);
    const water=clamp(rain+r.dam*.12,.02,1.4);
    const flood=Math.max(0,water-1.04)*1.5;
    const farmLand=1-r.forest*.23;
    const yieldFood=r.capacity*(.49+r.soil*.43)*(.34+water*.84)*tempFitness*farmLand*(1+r.infra*.045+r.knowledge*.0025)*(1-flood);
    const available=r.food+yieldFood;
    const shortage=clamp((r.pop-available)/Math.max(1,r.pop),0,1);
    const consumed=Math.min(available,r.pop);
    r.food=clamp(available-consumed,0,r.pop*2.2);
    const density=r.pop/Math.max(1,r.capacity);
    const tradeExposure=r.neighbors.reduce((sum,id)=>sum+(previous.get(id)?.disease||0)*(1+(previous.get(id)?.infra||0)*.15),0)/Math.max(1,r.neighbors.length);
    const infection=clamp(r.disease*.66+tradeExposure*(.055+r.infra*.025)+Math.max(0,density-.75)*.08+(random(w)<.015?.22:0)-r.clinic*.065,0,.85);
    r.disease=infection;
    const deaths=clamp(shortage*.24+infection*(.055-r.clinic*.008)+r.industry*.002,0,.35);
    const births=clamp(.022*(.35+r.health*.7)*(1-shortage*.8),0,.04);
    r.pop=round(Math.max(0,r.pop*(1+births-deaths)));
    r.health=clamp(r.health+(r.clinic*.004)-infection*.025-shortage*.03-r.industry*.0015, .18,1);
    r.forest=clamp(r.forest+.008*(1-r.forest)-r.industry*.004-r.pop/r.capacity*.002,0,1);
    r.soil=clamp(r.soil+.006*r.forest-.004*density-r.industry*.002, .15,1);
    r.knowledge=clamp(r.knowledge+r.school*.38+r.infra*.08+.04,0,100);
    const surplus=Math.max(0,yieldFood-r.pop);
    r.wealth=clamp(r.wealth+surplus*.045+r.industry*1.6+r.infra*.18-r.school*.3-r.clinic*.35-shortage*6,0,1000);
    r.trust=clamp(r.trust+.0015*(1-shortage)-shortage*.035-r.disease*.01,0,1);
    const crowding=Math.max(0,density-.72);
    const rivalWealth=r.neighbors.reduce((m,id)=>Math.max(m,previous.get(id)?.wealth||0),0);
    const disparity=Math.max(0,rivalWealth-r.wealth)/Math.max(25,rivalWealth);
    r.tension=clamp(r.tension+shortage*.055+crowding*.016+disparity*.006+r.industry*.001+(1-r.trust)*.002-.0045,0,1);
    r.last={rain:round(rain,2),water:round(water,2),yield:round(yieldFood),shortage:round(shortage,2),deaths:round(deaths,3),births:round(births,3),temperature:round(temperature,2)};
    if(r.rainBoost)r.rainBoost--;
    if(shortage>.28 && priorShortage<=.28)record(w,'Mất mùa ở '+r.name,`Nước ${round(water,2)}, sản lượng ${round(yieldFood)} và lương dự trữ không đủ cho ${round(previous.get(r.id).pop)} nghìn người; thiếu ${Math.round(shortage*100)}% nhu cầu.`,r.id,'famine');
    if(infection>.31 && previous.get(r.id).disease<=.31)record(w,'Dịch lan ở '+r.name,`Mức lây nhiễm lên ${Math.round(infection*100)}%; mật độ, đường giao thương và trạm y đều tác động đến diễn biến.`,r.id,'disease');
    if(r.pop<1 && previous.get(r.id).pop>=1)record(w,'Cộng đồng '+r.name+' tan rã','Dân số còn dưới một nghìn người; vùng không tiếp tục tự tăng trưởng.',r.id,'collapse');
  }
  // Migration uses a snapshot so the order of regions cannot create extra food.
  for(const r of w.regions){
    const before=previous.get(r.id);if(!before||r.pop<1)continue;
    const hunger=r.last?.shortage||0;
    if(hunger<.08)continue;
    const candidates=r.neighbors.map(id=>w.regions.find(x=>x.id===id)).filter(n=>n&&n.pop>=1&&n.openness>.05)
      .map(n=>({n,room:Math.max(0,n.food+n.capacity*.12-n.pop*.4)})).filter(x=>x.room>0).sort((a,b)=>b.room-a.room);
    if(!candidates.length)continue;
    const {n,room}=candidates[0],moved=Math.min(r.pop*.055*hunger*n.openness,room*.22);
    if(moved<.05)continue;
    deltas.set(r.id,deltas.get(r.id)-moved);deltas.set(n.id,deltas.get(n.id)+moved);
    n.tension=clamp(n.tension+moved/Math.max(1,n.pop)*(.35-n.trust*.2),0,1);
    if(moved>.5)record(w,'Di cư '+r.name+' → '+n.name,`${round(moved)} nghìn người rời vùng thiếu lương; ${n.name} có dư địa và lối vào mở.`,r.id,'migration');
  }
  for(const r of w.regions)r.pop=round(Math.max(0,r.pop+deltas.get(r.id)));
  const fought=new Set();
  for(const r of w.regions){
    if(r.pop<3||r.tension<.58)continue;
    const n=r.neighbors.map(id=>w.regions.find(x=>x.id===id)).filter(x=>x&&x.pop>=3).sort((a,b)=>b.wealth-a.wealth)[0];
    if(!n||fought.has([r.id,n.id].sort((a,b)=>a-b).join(':')))continue;
    if(random(w)<(r.tension-.5)*.12){
      fought.add([r.id,n.id].sort((a,b)=>a-b).join(':'));
      const lossR=r.pop*(.008+random(w)*.02),lossN=n.pop*(.004+random(w)*.014);
      r.pop=round(Math.max(0,r.pop-lossR));n.pop=round(Math.max(0,n.pop-lossN));
      r.wealth=Math.max(0,r.wealth-7);n.wealth=Math.max(0,n.wealth-5);
      r.tension=clamp(r.tension-.18,0,1);n.tension=clamp(n.tension+.1,0,1);
      record(w,'Xung đột '+r.name+' – '+n.name,`Căng thẳng tại ${r.name} vượt ngưỡng; hai vùng mất ${round(lossR+lossN)} nghìn người và tài sản.`,r.id,'conflict');
    }
  }
  if(w.year%10===0)record(w,`Mốc năm ${w.year}`,`Toàn thế giới có ${totals(w).pop} nghìn người tại ${totals(w).communities} cộng đồng còn sống.`,null,'milestone');
  snapshot(w); return w;
}
export function advance(w,years=1){for(let i=0;i<years;i++)step(w);return w;}
export function serialize(w){return JSON.stringify(w);}
export function restore(text){
  const w=JSON.parse(text);
  if(w.version!==1||!Array.isArray(w.regions)||!Array.isArray(w.tiles)||w.tiles.length!==WIDTH*HEIGHT||!Number.isFinite(w.year)||!Number.isFinite(w.rng)||!Array.isArray(w.history))throw new Error('Tệp lưu không đúng định dạng.');
  w.lastStep=[];return w;
}
