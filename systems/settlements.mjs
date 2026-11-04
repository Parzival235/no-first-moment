const round=(v,n=1)=>Math.round(v*10**n)/10**n;
const vi=v=>Number(v).toLocaleString('vi-VN',{maximumFractionDigits:1});

export function choosePolicies(w,record){
  for(const r of w.regions){
    if(r.pop<1||w.year-r.lastPolicyYear<3)continue;
    const neighborInNeed=r.neighbors.some(id=>{const n=w.regions.find(x=>x.id===id);return n?.pop>=1&&n.food<n.pop*.25;});
    const next=(r.last?.shortage||0)>.08||r.food<r.pop*.32?'canh tác':
      r.soil<.55||r.forest<.28?'phục hồi':
      r.food>r.pop*1.15&&neighborInNeed?'trao đổi':'dự trữ';
    if(next!==r.policy){
      r.policy=next;r.lastPolicyYear=w.year;
      const reasons={'canh tác':'kho lương thấp hoặc vừa thiếu ăn','phục hồi':'đất hay rừng suy kiệt','trao đổi':'có lương dư trong khi láng giềng thiếu','dự trữ':'ưu tiên duy trì kho và sinh kế ổn định'};
      record(w,`${r.name} chọn ${next}`,`Cộng đồng tự chọn: ${reasons[next]}. Quyết định này đổi sản lượng, tài nguyên hoặc dòng trao đổi các năm tiếp theo.`,r.id,'decision');
    }
  }
}

export function exchange(w,record){
  const outgoing=new Map(),incoming=new Map(),plans=[];
  for(const r of w.regions){
    if(r.pop<1||r.policy!=='trao đổi'||r.food<r.pop*.45)continue;
    const targets=r.neighbors.map(id=>w.regions.find(n=>n.id===id)).filter(n=>n?.pop>=1)
      .sort((a,b)=>(a.food/a.pop)-(b.food/b.pop)||a.id-b.id);
    const n=targets.find(n=>n.food+(incoming.get(n.id)||0)<n.pop*.3);
    if(!n)continue;
    const amount=round(Math.max(0,Math.min(r.food-r.pop*.4-(outgoing.get(r.id)||0),n.pop*.4-n.food-(incoming.get(n.id)||0),r.pop*.14)),1);
    if(amount<.1)continue;
    outgoing.set(r.id,(outgoing.get(r.id)||0)+amount);incoming.set(n.id,(incoming.get(n.id)||0)+amount);
    plans.push({from:r,to:n,amount});
  }
  for(const {from,to,amount} of plans){
    from.food-=amount;to.food+=amount;
    const paid=round(Math.min(to.wealth,amount*.3));to.wealth-=paid;from.wealth+=paid;
    if(amount>=.5&&(from.lastTradePartner!==to.id||w.year%10===0))record(w,`${from.name} trao lương cho ${to.name}`,`${vi(amount)} nghìn người-năm lương chuyển qua biên trong năm ghi nhận; dòng trao đổi có thể tiếp diễn những năm sau.`,from.id,'trade');
    from.lastTradePartner=to.id;
  }
}

export function foundSettlements(w,record){
  const plans=[];
  for(const r of w.regions){
    if(r.pop<r.capacity*.48||r.food<r.pop*.9||r.health<.55||w.year-r.lastFounded<15)continue;
    const target=r.neighbors.map(id=>w.regions.find(n=>n.id===id)).filter(n=>n.pop<1&&n.land>=12)
      .sort((a,b)=>b.moisture-a.moisture||a.id-b.id)[0];
    if(target&&!plans.some(p=>p.target.id===target.id))plans.push({r,target});
  }
  for(const {r,target} of plans){
    if(r.pop<1||target.pop>=1)continue;
    const people=round(Math.min(r.pop*.12,target.capacity*.18),1);
    if(people<1)continue;
    const provision=round(Math.min(r.food,people*.7),1),property=round(Math.min(r.wealth,4),1);
    r.pop=round(r.pop-people);target.pop=round(target.pop+people);
    r.food-=provision;target.food+=provision;
    r.wealth-=property;target.wealth+=property;
    target.health=r.health;target.knowledge=round(r.knowledge*.85);target.trust=r.trust;target.inhabitedBefore=true;
    r.lastFounded=w.year;target.lastFounded=w.year;
    record(w,`${target.name} được định cư`,`${vi(people)} nghìn người từ ${r.name} mang ${vi(provision)} nghìn người-năm lương tới vùng đất mới.`,target.id,'founding');
  }
}
