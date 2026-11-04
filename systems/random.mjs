// Indexed draws keep exogenous events stable across counterfactual branches.
export function hash(x,y,s) {
  let n=Math.imul(x+17,374761393)^Math.imul(y+91,668265263)^Math.imul(s,2246822519);
  n=Math.imul(n^(n>>>13),1274126177);
  return ((n^(n>>>16))>>>0)/4294967296;
}
export function randomAt(w,process,entity=0,draw=0) {
  return hash(w.year+draw*4099,entity*64+process,w.seed+0x9e3779b9);
}
export const RNG={weather:1,rain:2,outbreak:3,conflict:4,lossHome:5,lossNeighbor:6};
