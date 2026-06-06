(async function(){
const THREE = await import('three');
const { OrbitControls } = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js');
const { ThreeMFLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/3MFLoader.js');

const $ = (id) => document.getElementById(id);
const stage = $('viewerStage');
const canvas = $('viewerCanvas');
const resetButton = $('viewerResetBtn');
const state = { model:null, grid:null, bounds:null, token:0, fit:null };

if(stage && canvas){
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 10000);
  camera.up.set(0, 0, 1);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.1;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8b7f6d, 2));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
  keyLight.position.set(70, -90, 120);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x9fd4ff, 0.8);
  fillLight.position.set(-80, 80, 70);
  scene.add(fillLight);

  const text = {
    tr:{
      loading:'yukleniyor',
      ready:'onizleme hazir',
      error:'onizleme hatasi',
      extracting:'Model paketten cikariliyor...',
      noMesh:'3MF icinde cizilebilir mesh verisi bulunamadi.',
      failed:'Onizleme acilamadi: ',
      triangles:'ucgen',
      objects:'obje',
      local:'Three.js onizleme lokal calisir.'
    },
    en:{
      loading:'loading',
      ready:'preview ready',
      error:'preview error',
      extracting:'Extracting model from package...',
      noMesh:'No drawable mesh data was found inside the 3MF.',
      failed:'Preview failed: ',
      triangles:'triangles',
      objects:'objects',
      local:'Three.js preview runs locally.'
    }
  };

  function copy(){
    return text[$('languageSelect')?.value === 'en' ? 'en' : 'tr'];
  }
  function setStatus(kind, value){
    const el = $('viewerState');
    if(!el) return;
    el.textContent = value;
    el.className = `pill${kind ? ` ${kind}` : ''}`;
  }
  function setOverlay(value, hidden=false){
    const el = $('viewerOverlay');
    if(!el) return;
    el.textContent = value;
    el.classList.toggle('hide', hidden);
  }
  function setMeta(value){
    if($('viewerMeta')) $('viewerMeta').textContent = value;
  }
  function formatCount(value){
    return Number(value || 0).toLocaleString($('languageSelect')?.value === 'en' ? 'en-US' : 'tr-TR');
  }
  function disposeObject(object){
    if(!object) return;
    object.traverse((child)=>{
      child.geometry?.dispose?.();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.filter(Boolean).forEach((material)=>material.dispose?.());
    });
  }
  function clearModel(){
    [state.model, state.grid, state.bounds].forEach((object)=>{
      if(!object) return;
      scene.remove(object);
      disposeObject(object);
    });
    state.model = null;
    state.grid = null;
    state.bounds = null;
    state.fit = null;
    resetButton.disabled = true;
  }
  function countModel(object){
    let objects = 0;
    let triangles = 0;
    object.traverse((child)=>{
      if(!child.isMesh || !child.geometry) return;
      objects += 1;
      const geometry = child.geometry;
      triangles += geometry.index ? geometry.index.count / 3 : (geometry.attributes.position?.count || 0) / 3;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.filter(Boolean).forEach((material)=>{
        material.side = THREE.DoubleSide;
        material.needsUpdate = true;
      });
    });
    return {objects, triangles:Math.round(triangles)};
  }
  function gridSize(size){
    const power = Math.pow(10, Math.floor(Math.log10(Math.max(size, 1))));
    return Math.max(10, Math.ceil((size * 1.35) / power) * power);
  }
  function fitModel(object){
    const firstBox = new THREE.Box3().setFromObject(object);
    if(firstBox.isEmpty()) throw new Error('NO_MESH');
    const center = firstBox.getCenter(new THREE.Vector3());
    object.position.sub(center);

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z, 1);
    const distance = Math.max(maxDimension * 1.9, 12);

    state.grid = new THREE.GridHelper(gridSize(maxDimension), 20, 0x9f9586, 0xd8d0c2);
    state.grid.rotation.x = Math.PI / 2;
    state.grid.position.z = box.min.z;
    scene.add(state.grid);

    state.bounds = new THREE.Box3Helper(box, 0x151515);
    scene.add(state.bounds);

    state.fit = {distance, maxDimension};
    resetCamera();
    controls.minDistance = maxDimension * 0.18;
    controls.maxDistance = maxDimension * 8 + 10;
    camera.near = Math.max(0.01, maxDimension / 1000);
    camera.far = Math.max(1000, maxDimension * 20);
    camera.updateProjectionMatrix();
  }
  function resetCamera(){
    if(!state.fit) return;
    camera.position.set(state.fit.distance, -state.fit.distance, state.fit.distance * 0.72);
    controls.target.set(0, 0, 0);
    controls.autoRotate = false;
    controls.update();
  }
  async function preview(file){
    if(!file || !/\.3mf$/i.test(file.name || '')) return;
    const token = ++state.token;
    const messages = copy();
    setStatus('warn', messages.loading);
    setOverlay(messages.extracting);
    setMeta(file.name);
    resetButton.disabled = true;

    try{
      const model = new ThreeMFLoader().parse(await file.arrayBuffer());
      if(token !== state.token) return;
      const stats = countModel(model);
      if(!stats.triangles) throw new Error('NO_MESH');
      clearModel();
      state.model = model;
      scene.add(model);
      fitModel(model);
      controls.autoRotate = true;
      setStatus('ok', messages.ready);
      setOverlay('', true);
      setMeta(`${formatCount(stats.triangles)} ${messages.triangles} - ${stats.objects} ${messages.objects}`);
      resetButton.disabled = false;
    }catch(error){
      if(token !== state.token) return;
      clearModel();
      setStatus('bad', messages.error);
      setOverlay(error?.message === 'NO_MESH' ? messages.noMesh : messages.failed + (error?.message || error));
      setMeta(file.name);
    }
  }
  function resize(){
    const width = Math.max(1, stage.clientWidth);
    const height = Math.max(1, stage.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  function animate(){
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  resetButton?.addEventListener('click', resetCamera);
  $('fileInput')?.addEventListener('change', (event)=>preview(event.target.files?.[0]));
  $('dropZone')?.addEventListener('drop', (event)=>preview(event.dataTransfer?.files?.[0]));
  $('languageSelect')?.addEventListener('change', ()=>{
    if(!state.model) setMeta(copy().local);
  });
  new ResizeObserver(resize).observe(stage);
  setMeta(copy().local);
  resize();
  animate();
}
})().catch((error)=>{
  const state = document.getElementById('viewerState');
  const overlay = document.getElementById('viewerOverlay');
  if(state){
    state.textContent = 'onizleme hatasi';
    state.className = 'pill bad';
  }
  if(overlay) overlay.textContent = `Three.js yuklenemedi: ${error?.message || error}`;
});
