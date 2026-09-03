(() => {
  const THREE = window.THREE;
  const root = document.getElementById('app');
  const video = document.getElementById('camera');
  const handCanvas = document.getElementById('handCanvas');
  const handCtx = handCanvas.getContext('2d');
  const launcher = document.getElementById('launcher');
  const startBtn = document.getElementById('startBtn');
  const statusEl = document.getElementById('status');
  const gestureEl = document.getElementById('gesture');
  const themeEl = document.getElementById('theme');
  const errorEl = document.getElementById('error');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020304);
  scene.fog = new THREE.FogExp2(0x020304, 0.018);
  const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 1000);
  camera.position.set(0, 0.5, 37);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  root.appendChild(renderer.domElement);

  const treeGroup = new THREE.Group();
  treeGroup.position.y = 1.2;
  scene.add(treeGroup);

  const COUNT = 5200;
  const positions = new Float32Array(COUNT * 3);
  const treeTargets = new Float32Array(COUNT * 3);
  const burstTargets = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const phases = new Float32Array(COUNT);
  const palettes = [
    [0xffd86b, 0xffffff, 0xff6b6b, 0x58d68d],
    [0xaeefff, 0xffffff, 0x6fa8ff, 0xe0c3fc],
    [0xff9bd5, 0xffffff, 0xffd166, 0xa78bfa],
    [0x8fffc1, 0xffffff, 0xffe66d, 0x68d5db]
  ];
  const themeNames = ['经典圣诞', '冰雪极光', '梦幻糖果', '翡翠星河'];
  let themeIndex = 0;
  const randn = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  for (let i = 0; i < COUNT; i++) {
    const k = i * 3;
    const layer = Math.floor((i / COUNT) * 13) / 13;
    const y = -13 + layer * 25;
    const radius = Math.max(0.25, 10.5 * Math.pow(1 - layer, 1.05));
    const angle = i * 2.39996323;
    const r = radius * Math.sqrt(Math.random());
    treeTargets[k] = Math.cos(angle) * r + randn() * 0.22;
    treeTargets[k + 1] = y - r * 0.32 + randn() * 0.35;
    treeTargets[k + 2] = Math.sin(angle) * r + randn() * 0.22;
    burstTargets[k] = randn() * 54;
    burstTargets[k + 1] = randn() * 54;
    burstTargets[k + 2] = randn() * 54;
    positions[k] = burstTargets[k];
    positions[k + 1] = burstTargets[k + 1];
    positions[k + 2] = burstTargets[k + 2];
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const glow = document.createElement('canvas');
  glow.width = glow.height = 64;
  const gg = glow.getContext('2d');
  const grad = gg.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, '#fff');
  grad.addColorStop(.2, 'rgba(255,245,200,.95)');
  grad.addColorStop(.55, 'rgba(255,205,80,.35)');
  grad.addColorStop(1, 'rgba(255,180,40,0)');
  gg.fillStyle = grad; gg.fillRect(0, 0, 64, 64);
  const points = new THREE.Points(geom, new THREE.PointsMaterial({
    size: .55, map: new THREE.CanvasTexture(glow), transparent: true, opacity: .96,
    vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  treeGroup.add(points);

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.45, 4.6, 16), new THREE.MeshBasicMaterial({ color: 0x4d2e1e }));
  trunk.position.y = -13.9; treeGroup.add(trunk);
  const starCanvas = document.createElement('canvas'); starCanvas.width = starCanvas.height = 128;
  const sg = starCanvas.getContext('2d'); sg.translate(64,64); sg.fillStyle = '#fff3a5'; sg.shadowColor = '#ffd86b'; sg.shadowBlur = 24; sg.beginPath();
  for (let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5; const r=i%2===0?44:18; sg.lineTo(Math.cos(a)*r,Math.sin(a)*r); }
  sg.closePath(); sg.fill();
  const star = new THREE.Sprite(new THREE.SpriteMaterial({ map:new THREE.CanvasTexture(starCanvas), transparent:true, blending:THREE.AdditiveBlending, depthWrite:false }));
  star.position.set(0,13.2,0); star.scale.set(4.4,4.4,1); treeGroup.add(star);

  const SNOW = 850, snowPos = new Float32Array(SNOW * 3), snowGeom = new THREE.BufferGeometry();
  for(let i=0;i<SNOW;i++){ snowPos[i*3]=(Math.random()-.5)*55; snowPos[i*3+1]=(Math.random()-.5)*42; snowPos[i*3+2]=(Math.random()-.5)*35; }
  snowGeom.setAttribute('position', new THREE.BufferAttribute(snowPos,3));
  const snow = new THREE.Points(snowGeom, new THREE.PointsMaterial({ color:0xffffff,size:.12,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false }));
  snow.visible = false; scene.add(snow);
  const fireworks = [];

  function firework(){
    const n=180,p=new Float32Array(n*3),v=[],ox=(Math.random()-.5)*20,oy=5+Math.random()*12;
    for(let i=0;i<n;i++){ p[i*3]=ox;p[i*3+1]=oy;p[i*3+2]=(Math.random()-.5)*4; const a=Math.random()*Math.PI*2,s=.07+Math.random()*.28; v.push(new THREE.Vector3(Math.cos(a)*s,Math.sin(a)*s+(Math.random()-.2)*.2,(Math.random()-.5)*s)); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(p,3));
    const m=new THREE.PointsMaterial({color:palettes[themeIndex][Math.floor(Math.random()*4)],size:.24,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false});
    const obj=new THREE.Points(g,m); scene.add(obj); fireworks.push({obj,v,life:1});
  }

  function applyTheme(){
    const pal=palettes[themeIndex], temp=new THREE.Color();
    for(let i=0;i<COUNT;i++){ temp.setHex(pal[i%4]); const b=.8+Math.random()*.55; colors[i*3]=Math.min(1,temp.r*b); colors[i*3+1]=Math.min(1,temp.g*b); colors[i*3+2]=Math.min(1,temp.b*b); }
    geom.attributes.color.needsUpdate=true; themeEl.textContent='主题：'+themeNames[themeIndex];
  }
  applyTheme();

  let gathered=false,targetRotX=0,targetRotY=0,currentRotX=0,currentRotY=0;
  let stable='NONE',stableFrames=0,lastTrigger='NONE';
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z||0)-(b.z||0));
  const connections=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];

  function drawHand(lm){
    handCtx.clearRect(0,0,640,480);
    if(!lm) return;
    handCtx.lineWidth=4; handCtx.strokeStyle='#66ffb3'; handCtx.fillStyle='#fff4a8';
    for(const [a,b] of connections){ handCtx.beginPath(); handCtx.moveTo(lm[a].x*640,lm[a].y*480); handCtx.lineTo(lm[b].x*640,lm[b].y*480); handCtx.stroke(); }
    for(const p of lm){ handCtx.beginPath(); handCtx.arc(p.x*640,p.y*480,5,0,Math.PI*2); handCtx.fill(); }
  }

  function fingerOpen(lm,tip,pip,mcp){
    const wrist=lm[0], tipD=dist(lm[tip],wrist), pipD=dist(lm[pip],wrist), mcpD=dist(lm[mcp],wrist);
    return tipD > pipD*1.06 && tipD > mcpD*1.18;
  }

  function classify(lm){
    const i=fingerOpen(lm,8,6,5), m=fingerOpen(lm,12,10,9), r=fingerOpen(lm,16,14,13), p=fingerOpen(lm,20,18,17);
    const palmWidth=Math.max(.001,dist(lm[5],lm[17]));
    const t=dist(lm[4],lm[5]) > palmWidth*.55;
    const count=[t,i,m,r,p].filter(Boolean).length;
    const avg=[8,12,16,20].map(x=>dist(lm[x],lm[0])).reduce((a,b)=>a+b,0)/4;
    const palmScale=Math.max(.001,dist(lm[0],lm[9]));
    if(count<=1 && avg<palmScale*2.05) return ['FIST',count];
    if(i&&m&&r&&p) return ['OPEN',count];
    if(i&&!m&&!r&&!p) return ['ONE',1];
    if(i&&m&&!r&&!p) return ['TWO',2];
    if(i&&m&&r&&!p) return ['THREE',3];
    return ['OTHER',count];
  }

  function runGesture(name,lm,count){
    if(name==='FIST'){ gathered=true; targetRotY=((1-lm[9].x)-.5)*2.2; targetRotX=(lm[9].y-.5)*1.2; gestureEl.textContent='手势：✊ 握拳 · 聚合 / 旋转'; }
    else if(name==='OPEN'){ gathered=false; gestureEl.textContent='手势：🖐 张掌 · 粒子散开'; }
    else if(name==='ONE'){ gestureEl.textContent='手势：☝ 1 指 · 切换主题'; }
    else if(name==='TWO'){ gestureEl.textContent='手势：✌ 2 指 · 飘雪'; }
    else if(name==='THREE'){ gestureEl.textContent='手势：🤟 3 指 · 烟花'; }
    else gestureEl.textContent='手势：已检测手 · '+count+' 根伸展手指';
    if(name==='ONE'&&lastTrigger!=='ONE'){ themeIndex=(themeIndex+1)%palettes.length; applyTheme(); }
    if(name==='TWO'&&lastTrigger!=='TWO') snow.visible=!snow.visible;
    if(name==='THREE'&&lastTrigger!=='THREE'){ firework();setTimeout(firework,120);setTimeout(firework,240); }
    lastTrigger=name;
  }

  function onResults(results){
    const hands=results.multiHandLandmarks;
    if(!hands||!hands.length){ drawHand(null); stable='NONE';stableFrames=0;lastTrigger='NONE';gestureEl.textContent='手势：摄像头正常 · 未检测到手'; return; }
    const lm=hands[0]; drawHand(lm); const [name,count]=classify(lm);
    if(name===stable) stableFrames++; else { stable=name;stableFrames=1; }
    if(stableFrames>=2) runGesture(name,lm,count);
  }

  let handCamera=null, hands=null, starting=false;
  async function startHands(){
    if(starting||handCamera) return;
    starting=true; startBtn.disabled=true; errorEl.textContent=''; statusEl.textContent='正在加载本地手势模型…';
    try{
      if(!window.Hands||!window.Camera) throw new Error('本地手势运行库没有加载成功。');
      hands=new Hands({ locateFile:file=>`./vendor/${file}` });
      hands.setOptions({ maxNumHands:1, modelComplexity:1, minDetectionConfidence:.45, minTrackingConfidence:.4 });
      hands.onResults(onResults);
      handCamera=new Camera(video,{ onFrame:async()=>{ if(video.readyState>=2) await hands.send({image:video}); }, width:640, height:480 });
      await handCamera.start();
      launcher.style.display='none'; statusEl.textContent='摄像头已连接 · 把整只手放进右上角画面'; gestureEl.textContent='手势：等待检测';
    }catch(err){
      console.error(err); handCamera=null; hands=null; startBtn.disabled=false; statusEl.textContent='手势启动失败';
      errorEl.textContent=(err&&err.message?err.message:'无法启动摄像头')+'；请检查浏览器摄像头权限。';
    }finally{ starting=false; }
  }
  startBtn.addEventListener('click',startHands);

  document.querySelectorAll('.manual button').forEach(btn=>btn.addEventListener('click',()=>{
    const a=btn.dataset.action;
    if(a==='gather') gathered=true;
    if(a==='burst') gathered=false;
    if(a==='theme'){ themeIndex=(themeIndex+1)%palettes.length;applyTheme(); }
    if(a==='snow') snow.visible=!snow.visible;
    if(a==='firework'){ firework();setTimeout(firework,120); }
  }));

  let t=0;
  function animate(){
    requestAnimationFrame(animate); t+=.016;
    const pos=geom.attributes.position.array,target=gathered?treeTargets:burstTargets,ease=gathered?.075:.035;
    for(let i=0;i<COUNT;i++){ const k=i*3,w=gathered?Math.sin(t*1.7+phases[i])*.018:Math.sin(t*.8+phases[i])*.045; pos[k]+=(target[k]-pos[k])*ease+w; pos[k+1]+=(target[k+1]-pos[k+1])*ease; pos[k+2]+=(target[k+2]-pos[k+2])*ease+w*.6; }
    geom.attributes.position.needsUpdate=true;
    currentRotX+=(targetRotX-currentRotX)*.06; currentRotY+=(targetRotY-currentRotY)*.06; treeGroup.rotation.x=currentRotX; treeGroup.rotation.y=currentRotY+t*.06;
    star.material.opacity=.72+.28*Math.sin(t*4.2); star.scale.setScalar(4.2+.35*Math.sin(t*3.1));
    if(snow.visible){ const a=snowGeom.attributes.position.array; for(let i=0;i<SNOW;i++){ a[i*3+1]-=.035+(i%5)*.004; a[i*3]+=.008*Math.sin(t+i); if(a[i*3+1]<-22)a[i*3+1]=22; } snowGeom.attributes.position.needsUpdate=true; }
    for(let i=fireworks.length-1;i>=0;i--){ const f=fireworks[i],a=f.obj.geometry.attributes.position.array; f.life-=.012; for(let j=0;j<f.v.length;j++){ const k=j*3; a[k]+=f.v[j].x; a[k+1]+=f.v[j].y; f.v[j].y-=.0028; a[k+2]+=f.v[j].z; } f.obj.geometry.attributes.position.needsUpdate=true; f.obj.material.opacity=Math.max(0,f.life); if(f.life<=0){ scene.remove(f.obj); f.obj.geometry.dispose(); f.obj.material.dispose(); fireworks.splice(i,1); } }
    renderer.render(scene,camera);
  }
  animate();
  addEventListener('resize',()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); });
})();