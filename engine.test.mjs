import test from 'node:test';
import assert from 'node:assert/strict';
import {makeWorld,step,advance,intervene,serialize,restore,ACTIONS} from './engine.mjs';

test('same seed and decisions replay the same history, including after import',()=>{
  const a=makeWorld(4815),b=makeWorld(4815),id=a.regions[0].id;
  for(const w of [a,b]){advance(w,7);intervene(w,'forest',id);advance(w,13);intervene(w,'school',id);advance(w,25);}
  assert.equal(serialize(a),serialize(b));
  const imported=restore(serialize(a));advance(a,10);advance(imported,10);
  assert.equal(serialize(a),serialize(imported));
  assert.notEqual(serialize(makeWorld(4815)),serialize(makeWorld(4816)));
});

test('an upstream dam changes water available to a southern neighbor',()=>{
  const control=makeWorld(777),changed=makeWorld(777);
  const upstream=changed.regions.find(r=>changed.regions.some(n=>n.rx===r.rx&&n.ry===r.ry+1));
  assert.ok(upstream);
  const south=changed.regions.find(n=>n.rx===upstream.rx&&n.ry===upstream.ry+1);
  intervene(changed,'dam',upstream.id);step(control);step(changed);
  assert.ok(changed.regions.find(r=>r.id===south.id).last.water<control.regions.find(r=>r.id===south.id).last.water);
  assert.ok(changed.regions.find(r=>r.id===upstream.id).last.water>control.regions.find(r=>r.id===upstream.id).last.water);
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
