const SOURCES = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.158.0/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js',
  'https://unpkg.com/three@0.158.0/build/three.min.js'
];
function loadScript(src, timeout=9000){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    const timer=setTimeout(()=>{s.remove();reject(new Error(`Timeout loading ${src}`));},timeout);
    s.onload=()=>{clearTimeout(timer);resolve();};
    s.onerror=()=>{clearTimeout(timer);s.remove();reject(new Error(`Failed loading ${src}`));};
    document.head.appendChild(s);
  });
}
export async function ensureThree(){
  if(window.THREE) return window.THREE;
  for(const src of SOURCES){ try { await loadScript(src); if(window.THREE) return window.THREE; } catch {} }
  throw new Error('Three.js could not be loaded. Check CDN/internet access.');
}
export async function ensureTelegram(){
  if(window.Telegram?.WebApp) return window.Telegram.WebApp;
  try { await loadScript('https://telegram.org/js/telegram-web-app.js',4000); } catch {}
  return window.Telegram?.WebApp || null;
}
