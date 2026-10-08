export function createMaterialFactory(THREE){
  const cache=new Map();
  return (color,roughness=1)=>{
    const key=`${color}_${roughness}`;
    if(!cache.has(key)) cache.set(key,new THREE.MeshStandardMaterial({color,roughness}));
    return cache.get(key);
  };
}
