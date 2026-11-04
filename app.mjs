import {WIDTH,HEIGHT,ACTIONS,makeWorld,advance,intervene,totals,serialize,restore} from './engine.mjs?v=2';

const $=id=>document.getElementById(id);
const STORAGE='dia-gioi-world-v1';
const elements={map:$('world-map'),trend:$('trend'),history:$('history'),select:$('region-select'),actions:$('actions')};
let world,selected=null,auto=null,hover=null,pending=null,mapMode='terrain';
try{world=restore(localStorage.getItem(STORAGE));}catch{world=makeWorld(Math.floor(Math.random()*0xffffffff));}
selected=world.regions.find(r=>r.pop>=1)?.id??world.regions[0]?.id;

function save(){
  try{localStorage.setItem(STORAGE,serialize(world));$('save-state').textContent='● Đã lưu';}
  catch{$('save-state').textContent='○ Chưa lưu — hãy xuất tệp';}
}
function n(value,d=0){return Number(value).toLocaleString('vi-VN',{maximumFractionDigits:d});}
function region(){return world.regions.find(r=>r.id===selected)||world.regions[0];}
function color(tile){
  if(!tile.land){const v=Math.floor(25+tile.elevation*42);return `rgb(${Math.round(v*.55)},${v+23},${v+41})`;}
  if(mapMode!=='terrain' && tile.region!==null){
    const r=world.regions.find(x=>x.id===tile.region);
    if(r){
      const value=mapMode==='food'?Math.min(1,r.food/Math.max(1,r.pop)):mapMode==='disease'?r.disease: r.tension;
      const bad=mapMode==='food'?1-value:value;
      const v=Math.round(Math.max(0,Math.min(1,bad))*255);
      return `rgb(${Math.round(70+v*.52)},${Math.round(134-v*.25)},${Math.round(101-v*.26)})`;
    }
  }
  const lat=Math.abs((tile.y/(HEIGHT-1))-.5)*2;
  if(tile.elevation>.79)return '#87918b';
  if(lat>.78)return '#82918d';
  if(tile.moisture<.4)return '#a28e65';
  if(tile.moisture>.68)return '#426d5e';
  return '#668269';
}
function drawMap(){
  const c=elements.map,ctx=c.getContext('2d'),cw=c.width/WIDTH,ch=c.height/HEIGHT;
  ctx.clearRect(0,0,c.width,c.height);
  for(const tile of world.tiles){ctx.fillStyle=color(tile);ctx.fillRect(tile.x*cw,tile.y*ch,cw+.6,ch+.6);}
  ctx.strokeStyle='#dae2ca33';ctx.lineWidth=.7;
  for(let x=6;x<WIDTH;x+=6){ctx.beginPath();ctx.moveTo(x*cw,0);ctx.lineTo(x*cw,c.height);ctx.stroke();}
  for(let y=6;y<HEIGHT;y+=6){ctx.beginPath();ctx.moveTo(0,y*ch);ctx.lineTo(c.width,y*ch);ctx.stroke();}
  for(const r of world.regions){
    const x=(r.rx*6+3)*cw,y=(r.ry*6+3)*ch;
    ctx.beginPath();ctx.arc(x,y,Math.max(2.5,Math.min(8,2.5+Math.sqrt(r.pop)/2.5)),0,Math.PI*2);
    ctx.fillStyle=r.pop<1?'#727e7b':r.id===selected?'#fff0be':'#ecd9a7';ctx.fill();
    ctx.strokeStyle='#172829';ctx.lineWidth=1.5;ctx.stroke();
    if(r.id===selected||r.id===hover){ctx.font='bold 12px Arial';ctx.fillStyle='#f6efdd';ctx.textAlign='center';ctx.fillText(r.name,x,y-13);}
  }
  const r=region();if(r){ctx.strokeStyle='#f1dda3';ctx.lineWidth=2;ctx.strokeRect(r.rx*6*cw+1,r.ry*6*ch+1,6*cw-2,6*ch-2);}
}
function drawMapKey(){
  const labels={terrain:['ĐẤT','BIỂN','Chọn một cộng đồng trên bản đồ để quan sát.'],food:['DƯ LƯƠNG','THIẾU LƯƠNG','Màu đỏ: kho dự trữ dưới một năm nhu cầu.'],disease:['ÍT DỊCH','NHIỀU DỊCH','Màu đỏ: tỷ lệ nhiễm bệnh cao.'],tension:['YÊN ỔN','CĂNG THẲNG','Màu đỏ: căng thẳng giữa cộng đồng cao.']};
  const [low,high,explain]=labels[mapMode];$('scale-low-label').textContent=low;$('scale-high-label').textContent=high;$('map-explain').textContent=explain;
  $('scale-low').style.background=mapMode==='terrain'?'#6d946e':'#468665';$('scale-high').style.background=mapMode==='terrain'?'#1d4b60':'#c95748';
}
function drawTrend(){
  const c=elements.trend,ctx=c.getContext('2d'),list=world.trends;
  ctx.clearRect(0,0,c.width,c.height);if(list.length<2)return;
  const values=list.map(x=>x.pop),min=Math.min(...values)*.94,max=Math.max(...values)*1.05;
  ctx.strokeStyle='#a6bbaf44';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,c.height-10);ctx.lineTo(c.width,c.height-10);ctx.stroke();
  ctx.beginPath();ctx.lineWidth=2.4;ctx.strokeStyle='#cbd9b4';
  list.forEach((p,i)=>{const x=i/(list.length-1)*(c.width-4)+2,y=(c.height-18)-(p.pop-min)/Math.max(1,max-min)*(c.height-30);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});ctx.stroke();
  ctx.font='10px Arial';ctx.fillStyle='#a7bbb1';ctx.fillText(`NĂM ${list[0].year}`,3,c.height-1);ctx.textAlign='right';ctx.fillText(`NĂM ${list.at(-1).year}`,c.width-3,c.height-1);ctx.textAlign='left';
}
function drawHistory(){
  const filter=$('event-filter').value,list=world.history.filter(e=>filter==='all'||e.kind===filter).slice(0,70);
  elements.history.replaceChildren();
  if(!list.length){const p=document.createElement('p');p.className='small-note';p.textContent='Chưa có sự kiện thuộc loại này.';elements.history.append(p);return;}
  const fragment=document.createDocumentFragment();
  for(const e of list){const card=document.createElement('div');card.className='event '+e.kind;
    const year=document.createElement('span');year.className='event-year';year.textContent=String(e.year).padStart(4,'0');
    const body=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('p');title.textContent=e.title;detail.textContent=e.detail;body.append(title,detail);card.append(year,body);
    if(e.region!==null){card.style.cursor='pointer';card.title='Chọn vùng trong bản ghi';card.addEventListener('click',()=>{selected=e.region;render();});}
    fragment.append(card);
  }elements.history.append(fragment);
}
function drawRegion(){
  const r=region();if(!r)return;
  $('region-name').textContent=r.name;
  $('region-desc').textContent=`${r.land} ô đất, độ ẩm nền ${n(r.moisture,2)}. ${r.neighbors.length} cộng đồng có chung biên giới trên đất liền. ${r.pop<1?'Cộng đồng đã tan rã.':'Nơi đây vẫn có người sinh sống.'}`;
  const entries=[['Dân số',n(r.pop,1)+' nghìn'],['Kho lương',n(r.food/Math.max(1,r.pop),1)+' năm nhu cầu'],['Sức khỏe',Math.round(r.health*100)+'%'],['Tri thức',n(r.knowledge,1)],['Đất canh tác',Math.round(r.soil*100)+'%'],['Rừng',Math.round(r.forest*100)+'%'],['Căng thẳng',Math.round(r.tension*100)+'%'],['Dịch',Math.round(r.disease*100)+'%']];
  $('region-stats').replaceChildren(...entries.map(([label,value])=>{const node=document.createElement('div');node.className='stat';const small=document.createElement('small');small.textContent=label;const strong=document.createElement('strong');strong.textContent=value;node.append(small,strong);return node;}));
  $('region-cause').textContent=r.last?.yield!==undefined?`Năm vừa qua: mưa ${n(r.last.rain,2)}, nước khả dụng ${n(r.last.water,2)}, sản lượng ${n(r.last.yield,1)} nghìn suất; ${r.last.shortage?`thiếu ${Math.round(r.last.shortage*100)}% nhu cầu.`:'đủ nhu cầu hiện tại.'}`:'Các điều kiện đầu tiên đã được ghi. Hãy cho thời gian trôi để xem các quan hệ vận hành.';
}
function drawActions(){
  elements.actions.replaceChildren(...ACTIONS.map(a=>{const b=document.createElement('button');b.className='action '+a.scope;b.disabled=a.scope==='region'&&region()?.pop<1;b.title=a.note;b.setAttribute('aria-label',`${a.name}. ${a.note}`);
    const icon=document.createElement('span');icon.className='icon';icon.textContent=a.icon;
    const label=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=a.name;small.textContent=a.note;label.append(strong,small);b.append(icon,label);
    b.addEventListener('click',()=>preview(a));return b;}));
}
function clearDecision(){pending=null;$('decision').hidden=true;$('decision').replaceChildren();}
function preview(a){
  stop();
  try{
    const target=a.scope==='region'?region():null;
    const baseline=structuredClone(world),changed=structuredClone(world);
    intervene(changed,a.id,selected);
    const baseline1=structuredClone(baseline),changed1=structuredClone(changed);
    advance(baseline1,1);advance(changed1,1);
    advance(baseline,5);advance(changed,5);
    pending={id:a.id,region:selected,year:world.year};
    const after=target?changed.regions.find(r=>r.id===target.id):null;
    const before=target?baseline.regions.find(r=>r.id===target.id):null;
    const rows=[['Dân số toàn thế giới',totals(baseline).pop,totals(changed).pop,' nghìn']];
    if(a.scope==='world')rows.push(['Lệch nhiệt khí hậu',baseline.climate,changed.climate,'']);
    if(after&&before){
      rows.push([`Dân số ${target.name}`,before.pop,after.pop,' nghìn'],[`Kho lương ${target.name}`,before.food,after.food,' nghìn người-năm']);
      const metrics={rain:['Nước năm đầu',r=>r.last.water,''],dam:['Nước năm thứ 5',r=>r.last.water,''],forest:['Rừng',r=>r.forest*100,'%'],granary:['Kho lương năm đầu',r=>r.food,' nghìn người-năm'],clinic:['Sức khỏe',r=>r.health*100,'%'],school:['Tri thức',r=>r.knowledge,''],road:['Hạ tầng',r=>r.infra,''],mine:['Tài sản',r=>r.wealth,''],open:['Độ mở biên',r=>r.openness*100,'%'],close:['Độ mở biên',r=>r.openness*100,'%'],treaty:['Căng thẳng',r=>r.tension*100,'%']};
      const [label,value,unit]=metrics[a.id],first=['rain','granary'].includes(a.id),b=(first?baseline1:baseline).regions.find(r=>r.id===target.id),c=(first?changed1:changed).regions.find(r=>r.id===target.id);
      rows.push([`${label} ${target.name}`,value(b),value(c),unit]);
    }
    if(a.id==='dam'&&target){const down=world.regions.find(r=>r.rx===target.rx&&r.ry===target.ry+1);if(down){const b=baseline.regions.find(r=>r.id===down.id),c=changed.regions.find(r=>r.id===down.id);rows.push([`Kho lương ${down.name} (hạ lưu)`,b.food,c.food,' nghìn người-năm']);}}
    const box=$('decision');box.replaceChildren();box.hidden=false;
    const title=document.createElement('h3');title.textContent=`Nếu ${a.name.toLowerCase()}${target?' tại '+target.name:''}`;
    const note=document.createElement('p');note.textContent='Hai nhánh từ cùng trạng thái. Các chỉ số sau 5 năm, trừ hàng ghi "năm đầu". Đây là kết quả mô hình, không phải lời tiên tri.';
    const table=document.createElement('table');const head=document.createElement('tr');for(const label of ['Chỉ số','Giữ nguyên','Can thiệp']){const th=document.createElement('th');th.textContent=label;head.append(th);}table.append(head);
    for(const [label,b,c,unit] of rows){const tr=document.createElement('tr');for(const value of [label,n(b,1)+unit,n(c,1)+unit]){const td=document.createElement('td');td.textContent=value;tr.append(td);}table.append(tr);}
    const controls=document.createElement('div');controls.className='decision-controls';const commit=document.createElement('button');commit.className='primary';commit.textContent='Thực hiện can thiệp';const cancel=document.createElement('button');cancel.textContent='Xem lựa chọn khác';
    commit.addEventListener('click',()=>{if(!pending||pending.year!==world.year||pending.region!==selected)return clearDecision();try{intervene(world,pending.id,pending.region);clearDecision();save();render();}catch(err){alert(err.message);}});
    cancel.addEventListener('click',clearDecision);controls.append(commit,cancel);box.append(title,note,table,controls);box.scrollIntoView({block:'nearest',behavior:'smooth'});
  }catch(err){clearDecision();alert(err.message);}
}
function render(){
  const t=totals(world);$('year').textContent=String(world.year).padStart(4,'0');$('population').textContent=n(t.pop,1);$('communities').textContent=t.communities;$('food').textContent=n(t.food,1);$('knowledge').textContent=n(t.knowledge,1);$('climate').textContent=(world.climate>=0?'+':'')+n(world.climate,2);
  const selectedNow=selected;elements.select.replaceChildren(...world.regions.map(r=>{const o=document.createElement('option');o.value=String(r.id);o.textContent=r.name+(r.pop<1?' · tan rã':'');return o;}));elements.select.value=String(selectedNow);
  drawMapKey();drawMap();drawTrend();drawRegion();drawHistory();drawActions();
}
function stop(){if(auto){clearInterval(auto);auto=null;}$('run').textContent='▶ Tự chạy';$('run').setAttribute('aria-pressed','false');}
function years(count){clearDecision();advance(world,count);save();render();}
$('one-year').addEventListener('click',()=>years(1));$('ten-years').addEventListener('click',()=>years(10));
$('run').addEventListener('click',()=>{if(auto){stop();return;}auto=setInterval(()=>years(1),650);$('run').textContent='Ⅱ Tạm dừng';$('run').setAttribute('aria-pressed','true');});
elements.select.addEventListener('change',e=>{clearDecision();selected=Number(e.target.value);render();});
$('map-mode').addEventListener('change',e=>{mapMode=e.target.value;drawMapKey();drawMap();});
$('jump-actions').addEventListener('click',()=>$('intervention').scrollIntoView({behavior:'smooth',block:'start'}));
$('event-filter').addEventListener('change',drawHistory);
elements.map.addEventListener('click',e=>{const rect=elements.map.getBoundingClientRect(),x=Math.floor((e.clientX-rect.left)/rect.width*WIDTH),y=Math.floor((e.clientY-rect.top)/rect.height*HEIGHT);const tile=world.tiles[y*WIDTH+x];if(tile?.region!==null&&tile?.region!==undefined){clearDecision();selected=tile.region;render();}});
elements.map.addEventListener('mousemove',e=>{const rect=elements.map.getBoundingClientRect(),x=Math.floor((e.clientX-rect.left)/rect.width*WIDTH),y=Math.floor((e.clientY-rect.top)/rect.height*HEIGHT);const next=world.tiles[y*WIDTH+x]?.region??null;if(next!==hover){hover=next;drawMap();}});
elements.map.addEventListener('mouseleave',()=>{hover=null;drawMap();});
$('export-btn').addEventListener('click',()=>{const blob=new Blob([serialize(world)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`dia-gioi-nam-${world.year}-hat-${world.seed}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('import-btn').addEventListener('click',()=>$('import-file').click());
$('import-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{world=restore(await file.text());selected=world.regions.find(r=>r.pop>=1)?.id??world.regions[0]?.id;stop();clearDecision();save();render();}catch(err){alert(err.message);}e.target.value='';});
$('new-world').addEventListener('click',()=>{if(!confirm('Tạo thế giới mới sẽ thay bản lưu tự động. Anh đã xuất tệp nếu muốn giữ thế giới cũ?'))return;stop();clearDecision();world=makeWorld(Math.floor(Math.random()*0xffffffff));selected=world.regions.find(r=>r.pop>=1)?.id;save();render();});
save();render();
