import { GAME_CONFIG } from './config.js';
import { normalizeState } from './state.js';
export function createSaveSystem(state, getDiscoveries, setDiscoveries){
  const key=GAME_CONFIG.save.key;
  return {
    save(){ try { localStorage.setItem(key,JSON.stringify({...state,invOpen:false,dead:false,discovered:[...getDiscoveries()]})); } catch {} },
    load(){ try { const raw=JSON.parse(localStorage.getItem(key)||'null'); if(raw){ Object.assign(state,normalizeState(raw)); setDiscoveries(new Set(raw.discovered||[])); } } catch {} },
    reset(){ try { localStorage.removeItem(key); } catch {} }
  };
}
