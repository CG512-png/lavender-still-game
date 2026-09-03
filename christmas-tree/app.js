(() => {
  const THREE = window.THREE;
  const root = document.getElementById('app');
  const video = document.getElementById('camera');
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
  renderer.outputColorSpace = THREE.SRGBColorSpace;
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
  const temp = new THREE.Color();
  const paletteSets = [
    [0xffd86b, 0xffffff, 0xff6b6b, 0x58d68d],
    [0xaeefff, 0xffffff, 0x6fa8ff, 0xe0c3fc],
    [0xff9bd5, 0xffffff, 0xffd166, 0xa78bfa],
    [0x8fffc1, 0xffffff, 0xffe66d, 0x68d5db]
  ];
  const themeNames = ['经典圣诞', '冰雪极光', '梦幻糖果', '翡翠星河'];
  let themeIndex = 0;

  const randn = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const t = i / COUNT;
    const layer = Math.floor(t * 13) / 13;
    const y = -13 + layer * 25;
    const radius = Math.max(0.25, 10.5 * Math.pow(1 - layer, 1.05));
    const angle = i * 2.39996323;
    const r = radius * Math.sqrt(Math.random());
    treeTargets[i3] = Math.cos(angle) * r + randn() * 0.22;
    treeTargets[i3 + 1] = y - r * 0.32 + randn() * 0.35;
    treeTargets[i3 + 2] = Math.sin(angle) * r + randn() * 0.22;
    const spread = 54;
    burstTargets[i3] = randn() * spread;
    burstTargets[i3 + 1] = randn() * spread;
    burstTargets[i3 + 2] = randn() * spread;
    positions[i3] = burstTargets[i3];
    positions[i3 + 1] = burstTargets[i3 + 1];
    positions[i3 + 2] = burstTargets[i3 + 2];
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 64;
  const g = glowCanvas.getContext('2d');
  const grad = g.createRadialGradient(32,32,0,32,32,32);
  grad.addColorStop(0,'rgba(255,255,255,1)');
  grad.addColorStop(.18,'rgba(255,244,190,.98)');
  grad.addColorStop(.55,'rgba(255,210,90,.35)');
  grad.addColorStop(1,'rgba(255,180,40,0)');
  g.fillStyle = grad;
  g.fillRect(0,0,64,64);

  const points = new THREE.Points(geom, new THREE.PointsMaterial({
    size:.55,
    map:new THREE.CanvasTexture(glowCanvas),
    transparent:true,
    opacity:.95,
    vertexColors:true,
    blending:THREE.AdditiveBlending,
    depthWrite:false,
    sizeAttenuation:true
  }));
  treeGroup.add(points);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05,1.45,4.6,16),
    new THREE.MeshBasicMaterial({color:0x4d2e1e})
  );
  trunk.position.y = -13.9;
  treeGroup.add(trunk);

  const starCanvas = document.createElement('canvas');
  starCanvas.width = starCanvas.height = 128;
  const sg = starCanvas.getContext('2d');
  sg.translate(64,64);
  sg.fillStyle='#fff3a5';
  sg.shadowColor='#ffd86b';
  sg.shadowBlur=24;
  sg.beginPath();
  for(let i=0;i<10;i++){
    const a=-Math.PI/2+i*Math.PI/5;
    const r=i%2===0?44:18;
    sg.lineTo(Math.cos(a)*r,Math.sin(a)*r);
  }
  sg.closePath();
  sg.fill();
  const star = new THREE.Sprite(new THREE.SpriteMaterial({
    map:new THREE.CanvasTexture(starCanvas),
    transparent:true,
    blending:THREE.AdditiveBlending,
    depthWrite:false
  }));
  star.position.set(0,13.2,0);
  star.scale.set(4.4,4.4,1);
  treeGroup.add(star);

  const SNOW=850;
  const snowPos=new Float32Array(SNOW*3);
  const snowGeom=new THREE.BufferGeometry();
  for(let i=0;i<SNOW;i++){
    snowPos[i*3]=(Math.random()-.5)*55;
    snowPos[i*3+1]=(Math.random()-.5)*42;
    snowPos[i*3+2]=(Math.random()-.5)*35;
  }
  snowGeom.setAttribute('position',new THREE.BufferAttribute(snowPos,3));
  const snow=new THREE.Points(snowGeom,new THREE.PointsMaterial({
    color:0xffffff,size:.12,transparent:true,opacity:.7,
    blending:THREE.AdditiveBlending,depthWrite:false
  }));
  snow.visible=false;
  scene.add(snow);

  const fireworks=[];
  function firework(){
    const n=180,p=new Float32Array(n*3),v=[];
    const ox=(Math.random()-.5)*20,oy=5+Math.random()*12;
    for(let i=0;i<n;i++){
      p[i*3]=ox;p[i*3+1]=oy;p[i*3+2]=(Math.random()-.5)*4;
      const a=Math.random()*Math.PI*2,s=.07+Math.random()*.28,up=(Math.random()-.2)*.2;
      v.push(new THREE.Vector3(Math.cos(a)*s,Math.sin(a)*s+up,(Math.random()-.5)*s));
    }
    const gg=new THREE.BufferGeometry();
    gg.setAttribute('position',new THREE.BufferAttribute(p,3));
    const mm=new THREE.PointsMaterial({
      color:paletteSets[themeIndex][Math.floor(Math.random()*4)],size:.24,
      transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false
    });
    const obj=new THREE.Points(gg,mm);
    scene.add(obj);
    fireworks.push({obj,v,life:1});
  }

  function applyTheme(){
    const pal=paletteSets[themeIndex];
    for(let i=0;i<COUNT;i++){
      temp.setHex(pal[i%4]);
      const b=.8+Math.random()*.55;
      colors[i*3]=Math.min(1,temp.r*b);
      colors[i*3+1]=Math.min(1,temp.g*b);
      colors[i*3+2]=Math.min(1,temp.b*b);
    }
    geom.attributes.color.needsUpdate=true;
    themeEl.textContent='主题：'+themeNames[themeIndex];
  }
  applyTheme();

  let gathered=false;
  let targetRotX=0,targetRotY=0,currentRotX=0,currentRotY=0;
  let oneLatch=false,twoLatch=false,threeLatch=false;
  let stableGesture='NONE',stableFrames=0,lastTriggered='NONE';

  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z||0)-(b.z||0));

  function isFingerOpen(lm, tip, pip, mcp) {
    const wrist=lm[0];
    const tipD=dist(lm[tip],wrist);
    const pipD=dist(lm[pip],wrist);
    const mcpD=dist(lm[mcp],wrist);
    return tipD > pipD * 1.08 && tipD > mcpD * 1.22;
  }

  function classifyGesture(lm){
    const index=isFingerOpen(lm,8,6,5);
    const middle=isFingerOpen(lm,12,10,9);
    const ring=isFingerOpen(lm,16,14,13);
    const pinky=isFingerOpen(lm,20,18,17);

    const palmWidth=dist(lm[5],lm[17]);
    const thumbOpen=dist(lm[4],lm[5]) > palmWidth*0.62 && dist(lm[4],lm[2]) > palmWidth*0.36;
    const fingers=[thumbOpen,index,middle,ring,pinky];
    const count=fingers.filter(Boolean).length;

    const foldedDistances=[8,12,16,20].map(i=>dist(lm[i],lm[0]));
    const avgFolded=foldedDistances.reduce((a,b)=>a+b,0)/foldedDistances.length;
    const palmScale=Math.max(.001,dist(lm[0],lm[9]));

    const fist = count <= 1 && avgFolded < palmScale*1.95;
    const openPalm = index && middle && ring && pinky && count >= 4;

    if(fist) return {name:'FIST',count};
    if(openPalm) return {name:'OPEN',count};
    if(index && !middle && !ring && !pinky) return {name:'ONE',count:1};
    if(index && middle && !ring && !pinky) return {name:'TWO',count:2};
    if(index && middle && ring && !pinky) return {name:'THREE',count:3};
    return {name:'OTHER',count};
  }

  function executeGesture(name,lm,count){
    const palmX=1-lm[9].x;
    const palmY=lm[9].y;

    if(name==='FIST'){
      gathered=true;
      targetRotY=(palmX-.5)*2.2;
      targetRotX=(palmY-.5)*1.2;
      gestureEl.textContent='手势：✊ 握拳 · 聚合 / 旋转';
    } else if(name==='OPEN'){
      gathered=false;
      gestureEl.textContent='手势：🖐 张掌 · 粒子散开';
    } else if(name==='ONE'){
      gestureEl.textContent='手势：☝ 1 指 · 切换主题';
    } else if(name==='TWO'){
      gestureEl.textContent='手势：✌ 2 指 · 飘雪';
    } else if(name==='THREE'){
      gestureEl.textContent='手势：🤟 3 指 · 烟花';
    } else {
      gestureEl.textContent='手势：检测到 '+count+' 根伸展手指';
    }

    if(name==='ONE' && lastTriggered!=='ONE'){
      themeIndex=(themeIndex+1)%paletteSets.length;
      applyTheme();
    }
    if(name==='TWO' && lastTriggered!=='TWO'){
      snow.visible=!snow.visible;
    }
    if(name==='THREE' && lastTriggered!=='THREE'){
      firework();setTimeout(firework,120);setTimeout(firework,240);
    }
    lastTriggered=name;
  }

  function onResults(results){
    const hands=results.multiHandLandmarks;
    if(!hands||!hands.length){
      stableGesture='NONE';stableFrames=0;lastTriggered='NONE';
      gestureEl.textContent='手势：未检测到手';
      return;
    }

    const lm=hands[0];
    const info=classifyGesture(lm);

    if(info.name===stableGesture) stableFrames++;
    else {stableGesture=info.name;stableFrames=1;}

    if(stableFrames>=2) executeGesture(info.name,lm,info.count);
  }

  async function initHands(){
    try{
      statusEl.textContent='正在请求摄像头权限…';
      if(!window.Hands||!window.Camera) throw new Error('MediaPipe CDN 加载失败，请刷新页面或更换网络。');

      const hands=new Hands({
        locateFile:file=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      hands.setOptions({
        maxNumHands:1,
        modelComplexity:1,
        minDetectionConfidence:.5,
        minTrackingConfidence:.45
      });
      hands.onResults(onResults);

      const cam=new Camera(video,{
        onFrame:async()=>{
          if(video.readyState>=2) await hands.send({image:video});
        },
        width:640,
        height:480
      });

      await cam.start();
      statusEl.textContent='摄像头已连接 · 手势识别运行中';
      errorEl.textContent='';
    }catch(err){
      console.error(err);
      statusEl.textContent='手势识别未启动';
      errorEl.textContent=err?.message||'请允许摄像头权限，并确认浏览器支持摄像头。';
    }
  }
  initHands();

  let t=0;
  function animate(){
    requestAnimationFrame(animate);
    t+=.016;
    const pos=geom.attributes.position.array;
    const target=gathered?treeTargets:burstTargets;
    const ease=gathered?.075:.035;
    for(let i=0;i<COUNT;i++){
      const i3=i*3;
      const wobble=gathered?Math.sin(t*1.7+phases[i])*.018:Math.sin(t*.8+phases[i])*.045;
      pos[i3]+=(target[i3]-pos[i3])*ease+wobble;
      pos[i3+1]+=(target[i3+1]-pos[i3+1])*ease;
      pos[i3+2]+=(target[i3+2]-pos[i3+2])*ease+wobble*.6;
    }
    geom.attributes.position.needsUpdate=true;

    currentRotX+=(targetRotX-currentRotX)*.06;
    currentRotY+=(targetRotY-currentRotY)*.06;
    treeGroup.rotation.x=currentRotX;
    treeGroup.rotation.y=currentRotY+t*.06;
    star.material.opacity=.72+.28*Math.sin(t*4.2);
    star.scale.setScalar(4.2+.35*Math.sin(t*3.1));

    if(snow.visible){
      const a=snowGeom.attributes.position.array;
      for(let i=0;i<SNOW;i++){
        a[i*3+1]-=.035+(i%5)*.004;
        a[i*3]+=.008*Math.sin(t+i);
        if(a[i*3+1]<-22)a[i*3+1]=22;
      }
      snowGeom.attributes.position.needsUpdate=true;
    }

    for(let i=fireworks.length-1;i>=0;i--){
      const f=fireworks[i],a=f.obj.geometry.attributes.position.array;
      f.life-=.012;
      for(let j=0;j<f.v.length;j++){
        const k=j*3;
        a[k]+=f.v[j].x;
        a[k+1]+=f.v[j].y;
        f.v[j].y-=.0028;
        a[k+2]+=f.v[j].z;
      }
      f.obj.geometry.attributes.position.needsUpdate=true;
      f.obj.material.opacity=Math.max(0,f.life);
      if(f.life<=0){
        scene.remove(f.obj);
        f.obj.geometry.dispose();
        f.obj.material.dispose();
        fireworks.splice(i,1);
      }
    }

    renderer.render(scene,camera);
  }
  animate();

  addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });
})();