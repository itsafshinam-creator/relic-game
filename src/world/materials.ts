import * as THREE from 'three';

// Procedural texture generators for ultra-crisp PBR graphics without external assets
export function createNoiseTexture(width = 256, height = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const val = 120 + Math.floor(Math.random() * 45);
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createCobbleTexture(width = 512, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Dark stone background
  ctx.fillStyle = '#475569';
  ctx.fillRect(0, 0, width, height);

  // Draw irregular stones with mortar lines
  const cols = 8;
  const rows = 8;
  const cw = width / cols;
  const ch = height / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offsetX = (r % 2) * (cw / 2);
      const x = (c * cw + offsetX) % width;
      const y = r * ch;

      const stoneGrad = ctx.createRadialGradient(
        x + cw / 2,
        y + ch / 2,
        cw * 0.1,
        x + cw / 2,
        y + ch / 2,
        cw * 0.45
      );
      const tint = 90 + Math.floor(Math.random() * 40);
      stoneGrad.addColorStop(0, `rgb(${tint + 25}, ${tint + 30}, ${tint + 40})`);
      stoneGrad.addColorStop(1, `rgb(${tint - 15}, ${tint - 10}, ${tint})`);

      ctx.fillStyle = stoneGrad;
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, cw - 8, ch - 8, [8, 8, 8, 8]);
      ctx.fill();

      // Stone edge highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createWoodTexture(width = 256, height = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#653818';
  ctx.fillRect(0, 0, width, height);

  // Vertical grain lines
  ctx.fillStyle = 'rgba(40, 20, 8, 0.35)';
  for (let x = 0; x < width; x += 3) {
    if (Math.random() > 0.4) {
      const w = 1 + Math.random() * 2;
      ctx.fillRect(x, 0, w, height);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createMaterials() {
  const noiseTex = createNoiseTexture();
  const cobbleTex = createCobbleTexture();
  cobbleTex.repeat.set(6, 6);
  const woodTex = createWoodTexture();
  woodTex.repeat.set(1, 4);

  return {
    grass: new THREE.MeshStandardMaterial({
      color: '#3F7038',
      roughness: 0.85,
      metalness: 0.04,
      bumpMap: noiseTex,
      bumpScale: 0.04,
    }),
    grassDark: new THREE.MeshStandardMaterial({
      color: '#2F592A',
      roughness: 0.85,
      metalness: 0.04,
    }),
    stoneRoad: new THREE.MeshStandardMaterial({
      color: '#CBD5E1',
      roughness: 0.65,
      metalness: 0.12,
      map: cobbleTex,
      bumpMap: cobbleTex,
      bumpScale: 0.08,
    }),
    ruinStone: new THREE.MeshStandardMaterial({
      color: '#94A3B8',
      roughness: 0.7,
      metalness: 0.15,
      map: cobbleTex,
      bumpMap: noiseTex,
      bumpScale: 0.06,
    }),
    woodLog: new THREE.MeshStandardMaterial({
      color: '#854D27',
      roughness: 0.65,
      metalness: 0.05,
      map: woodTex,
      bumpMap: woodTex,
      bumpScale: 0.06,
    }),
    pineFoliage: new THREE.MeshStandardMaterial({
      color: '#1E4A35',
      roughness: 0.6,
      metalness: 0.05,
    }),
    pineFoliageLight: new THREE.MeshStandardMaterial({
      color: '#2D6A4F',
      roughness: 0.6,
      metalness: 0.05,
    }),
    goldBrick: new THREE.MeshStandardMaterial({
      color: '#FBBF24',
      roughness: 0.22,
      metalness: 0.88,
    }),
    water: new THREE.MeshPhysicalMaterial({
      color: '#38BDF8',
      transmission: 0.6,
      opacity: 0.88,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.333,
    }),
    runeCyan: new THREE.MeshBasicMaterial({
      color: '#38BDF8',
    }),
    fireGlow: new THREE.MeshBasicMaterial({
      color: '#F97316',
    }),
  };
}
