import test from 'node:test';
import assert from 'node:assert/strict';
import {makeWorld,step,advance,intervene,serialize,restore,ACTIONS} from './engine.mjs';
import {exchange,foundSettlements} from './systems/settlements.mjs';

test('same seed and decisions replay the same history, including after import',()=>{
  const a=makeWorld(4815),b=makeWorld(4815),id=a.regions[0].id;
  for(const w of [a,b]){advance(w,7);intervene(w,'forest',id);advance(w,13);intervene(w,'school',id);advance(w,25);}
  assert.equal(serialize(a),serialize(b));
  const imported=restore(serialize(a));advance(a,10);advance(imported,10);
  assert.equal(serialize(a),serialize(imported));
  assert.notEqual(serialize(makeWorld(4815)),serialize(makeWorld(4816)));
});

test('a dam changes water along the mapped downstream edge',()=>{
  const control=makeWorld(777),changed=makeWorld(777);
  const upstream=changed.regions.find(r=>r.pop>=1&&changed.regions.find(n=>n.id===r.downstream)?.pop>=1);
  assert.ok(upstream);
  const down=changed.regions.find(n=>n.id===upstream.downstream);
  intervene(changed,'dam',upstream.id);step(control);step(changed);
  assert.ok(changed.regions.find(r=>r.id===down.id).last.water<control.regions.find(r=>r.id===down.id).last.water);
  assert.ok(changed.regions.find(r=>r.id===upstream.id).last.water>control.regions.find(r=>r.id===upstream.id).last.water);
});

test('branches share weather even after their event histories diverge',()=>{
  const control=makeWorld(1);advance(control,100);
  const changed=structuredClone(control);
  intervene(changed,'dam',changed.regions.find(r=>r.pop>=1).id);
  for(let i=0;i<40;i++){
    step(control);step(changed);
    assert.equal(control.lastWeather,changed.lastWeather,`year ${control.year}`);
  }
  assert.notEqual(serialize(control),serialize(changed));
});

test('unoccupied districts can be founded without player intervention',()=>{
  const w=makeWorld(1),initial=w.regions.filter(r=>r.pop>=1).length;
  assert.equal(initial,8);
  advance(w,100);
  assert.ok(w.history.some(e=>e.kind==='decision'));
  assert.ok(w.history.some(e=>e.kind==='founding'));
  assert.ok(w.regions.filter(r=>r.pop>=1).length>initial);
  assert.ok(w.regions.some(r=>r.inhabitedBefore&&r.lastFounded>0));
});

test('trade and founding transfer people, food and wealth without creating them',()=>{
  const w=makeWorld(235),donor=w.regions.find(r=>r.pop>=1&&r.neighbors.some(id=>{const n=w.regions.find(n=>n.id===id);return n?.pop<1&&n.land>=12;}));
  const empty=w.regions.find(r=>r.id===donor.neighbors.map(id=>w.regions.find(n=>n.id===id)).filter(n=>n.pop<1&&n.land>=12).sort((a,b)=>b.moisture-a.moisture||a.id-b.id)[0].id);
  const sum=key=>w.regions.reduce((s,r)=>s+r[key],0);
  for(const r of w.regions)r.lastFounded=20;
  w.year=20;donor.lastFounded=0;donor.pop=Math.round(donor.capacity*.7*10)/10;donor.food=donor.pop*1.5;donor.wealth=40;
  const before=['pop','food','wealth'].map(sum);
  foundSettlements(w,()=>{});
  assert.ok(empty.pop>=1);
  for(const [i,key] of ['pop','food','wealth'].entries())assert.ok(Math.abs(sum(key)-before[i])<1e-8,key);

  const a=w.regions.find(r=>r.pop>=1&&r.neighbors.some(id=>w.regions.find(n=>n.id===id)?.pop>=1));
  const b=w.regions.find(r=>r.id===a.neighbors.find(id=>w.regions.find(n=>n.id===id)?.pop>=1));
  for(const r of w.regions){r.policy='dự trữ';r.food=Math.max(r.food,r.pop*1.5);}
  a.policy='trao đổi';a.food=100;b.food=0;
  const beforeTrade=['pop','food','wealth'].map(sum);
  exchange(w,()=>{});
  assert.ok(b.food>0);
  for(const [i,key] of ['pop','food','wealth'].entries())assert.ok(Math.abs(sum(key)-beforeTrade[i])<1e-8,key);
});

test('old saves are upgraded in place and retain their history',()=>{
  const old=makeWorld(482);advance(old,12);
  old.version=1;
  for(const r of old.regions){delete r.downstream;delete r.policy;delete r.lastPolicyYear;delete r.lastTradePartner;delete r.lastFounded;delete r.inhabitedBefore;}
  const before=old.history.map(e=>e.id);
  const upgraded=restore(serialize(old));
  assert.equal(upgraded.version,2);
  assert.equal(upgraded.year,12);
  assert.deepEqual(upgraded.history.slice(1).map(e=>e.id),before);
  assert.ok(upgraded.regions.every(r=>typeof r.policy==='string'&&Array.isArray(r.neighbors)));
  advance(upgraded,10);
  assert.equal(upgraded.year,22);
});

test('clinic reduces infection when starting from the same epidemic state',()=>{
  const a=makeWorld(711),b=makeWorld(711),id=a.regions[0].id;
  a.regions[0].disease=.55;b.regions[0].disease=.55;
  intervene(b,'clinic',id);step(a);step(b);
  assert.ok(b.regions[0].disease<a.regions[0].disease);
  assert.ok(b.regions[0].pop>a.regions[0].pop);
});

test('all interventions run; long histories stay finite and bounded',()=>{
  for(const seed of [1,42,9172]){
    const w=makeWorld(seed),target=w.regions.find(r=>r.neighbors.length);
    for(const action of ACTIONS)intervene(w,action.id,target.id);
    advance(w,350);
    assert.equal(w.year,350);assert.equal(w.trends.length,240);
    assert.ok(w.history.length>35);
    for(const r of w.regions){
      for(const key of ['pop','food','soil','forest','health','knowledge','wealth','trust','tension','disease'])assert.ok(Number.isFinite(r[key]),`${seed} ${r.name} ${key}`);
      for(const key of ['soil','forest','health','trust','tension','disease'])assert.ok(r[key]>=0&&r[key]<=1,`${seed} ${r.name} ${key}`);
      assert.ok(r.pop>=0&&r.food>=0);
    }
  }
});
