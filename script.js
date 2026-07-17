import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/+esm";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js/+esm";

const viewer = document.getElementById("viewer");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(4.6, 2.5, 5.6);

const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera,renderer.domElement);
controls.enableDamping = true;
controls.target.set(0,.55,0);
controls.minDistance = 4.2;
controls.maxDistance = 9;
controls.maxPolarAngle = Math.PI*.72;
controls.minPolarAngle = Math.PI*.18;

scene.add(new THREE.HemisphereLight(0xffffff,0x333333,2.1));
const key = new THREE.DirectionalLight(0xffffff,4.2);
key.position.set(4,7,5); key.castShadow=true; scene.add(key);
const rim = new THREE.DirectionalLight(0xf4c400,1.4);
rim.position.set(-5,3,-5); scene.add(rim);

const floor = new THREE.Mesh(new THREE.CircleGeometry(5,64),new THREE.ShadowMaterial({opacity:.35}));
floor.rotation.x=-Math.PI/2; floor.position.y=-1.12; floor.receiveShadow=true; scene.add(floor);

const mat = {
  front:new THREE.MeshStandardMaterial({color:0x111111,roughness:.82}),
  mesh:new THREE.MeshStandardMaterial({color:0x111111,roughness:.72,wireframe:false,transparent:true,opacity:.94}),
  peak:new THREE.MeshStandardMaterial({color:0x111111,roughness:.9}),
  under:new THREE.MeshStandardMaterial({color:0x222222,roughness:.9,side:THREE.DoubleSide}),
  button:new THREE.MeshStandardMaterial({color:0x111111,roughness:.8}),
  strip:new THREE.MeshStandardMaterial({color:0x111111,roughness:.72})
};

const cap = new THREE.Group();
cap.rotation.y = -.35;
scene.add(cap);

// Crown: high/deep 5-panel approximation
const crownGeo = new THREE.SphereGeometry(2.15,64,32,0,Math.PI*2,0,Math.PI*.53);
crownGeo.scale(1,1.12,.92);
const crown = new THREE.Mesh(crownGeo,mat.front);
crown.position.set(0,.2,0);
crown.castShadow=true;
cap.add(crown);

// Mesh side/back shell, slightly larger and clipped visually by front panel overlay
const meshGeo = new THREE.SphereGeometry(2.18,64,28,Math.PI*.28,Math.PI*1.44,0,Math.PI*.56);
meshGeo.scale(1,1.11,.94);
const mesh = new THREE.Mesh(meshGeo,mat.mesh);
mesh.position.set(0,.18,.02); mesh.castShadow=true; cap.add(mesh);

// Front high panel overlay
const frontGeo = new THREE.SphereGeometry(2.19,48,24,-Math.PI*.33,Math.PI*.66,0,Math.PI*.56);
frontGeo.scale(1,1.15,.94);
const frontPanel = new THREE.Mesh(frontGeo,mat.front);
frontPanel.position.set(0,.18,.02); frontPanel.castShadow=true; cap.add(frontPanel);

// Peak
const peakShape = new THREE.Shape();
peakShape.moveTo(-2.05,0); peakShape.quadraticCurveTo(0,-1.1,2.05,0);
peakShape.quadraticCurveTo(1.7,.72,0,.85);
peakShape.quadraticCurveTo(-1.7,.72,-2.05,0);
const peakGeo = new THREE.ExtrudeGeometry(peakShape,{depth:.16,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,curveSegments:40});
peakGeo.rotateX(-Math.PI/2); peakGeo.translate(0,-.42,1.95);
const peak = new THREE.Mesh(peakGeo,mat.peak); peak.castShadow=true; cap.add(peak);

// Undervisor duplicate thin surface
const under = new THREE.Mesh(peakGeo.clone(),mat.under);
under.scale.set(.985,.985,.985); under.position.y=-.1; cap.add(under);

// Top button
const button = new THREE.Mesh(new THREE.SphereGeometry(.22,32,16),mat.button);
button.scale.y=.55; button.position.set(0,2.62,0); button.castShadow=true; cap.add(button);

// Side strips around lower mesh
for (const y of [-.42,-.68]) {
  const strip = new THREE.Mesh(new THREE.TorusGeometry(1.96,.085,10,96,Math.PI*1.45),mat.strip);
  strip.rotation.set(Math.PI/2,0,Math.PI*.27);
  strip.position.set(0,y,-.04); cap.add(strip);
}

// Ponytail opening (dark inset) and snapback
const opening = new THREE.Mesh(new THREE.TorusGeometry(.73,.12,16,64,Math.PI),new THREE.MeshStandardMaterial({color:0x050505}));
opening.rotation.set(Math.PI/2,0,Math.PI/2);
opening.position.set(0,-.55,-1.78); cap.add(opening);
const snap = new THREE.Mesh(new THREE.BoxGeometry(1.35,.18,.13),mat.strip);
snap.position.set(0,-.92,-1.83); cap.add(snap);

// Front logo/text plane
const frontCanvas = document.createElement("canvas"); frontCanvas.width=1024; frontCanvas.height=512;
const frontTex = new THREE.CanvasTexture(frontCanvas); frontTex.colorSpace=THREE.SRGBColorSpace;
const frontPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.95,.95),new THREE.MeshBasicMaterial({map:frontTex,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
frontPlane.position.set(0,.85,1.98); frontPlane.rotation.x=-.08; cap.add(frontPlane);
let uploadedImage=null;

function drawFront(){
  const c=frontCanvas.getContext("2d"); c.clearRect(0,0,frontCanvas.width,frontCanvas.height);
  if(uploadedImage){const r=Math.min(760/uploadedImage.width,360/uploadedImage.height);const w=uploadedImage.width*r,h=uploadedImage.height*r;c.drawImage(uploadedImage,(1024-w)/2,(512-h)/2,w,h);}
  const txt=document.getElementById("frontText").value.trim();
  if(txt){c.fillStyle=document.getElementById("frontTextColor").value;c.textAlign="center";c.textBaseline="middle";c.font="bold 88px Arial";c.fillText(txt,512,420,900);}
  frontTex.needsUpdate=true;
}

// Side strip text sprites
const leftSprite=createTextSprite(); leftSprite.position.set(-2.0,-.5,-.1); leftSprite.scale.set(1.5,.35,1); cap.add(leftSprite);
const rightSprite=createTextSprite(); rightSprite.position.set(2.0,-.5,-.1); rightSprite.scale.set(1.5,.35,1); cap.add(rightSprite);
function createTextSprite(){const cv=document.createElement("canvas");cv.width=1024;cv.height=256;const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:false}));sp.userData={cv,tx};return sp;}
function updateSideSprite(sp,text){const {cv,tx}=sp.userData,ctx=cv.getContext("2d");ctx.clearRect(0,0,cv.width,cv.height);ctx.fillStyle="#fff";ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="bold 92px Arial";ctx.fillText(text.toUpperCase(),512,128,950);tx.needsUpdate=true;}
leftSprite.material.rotation=Math.PI/2; rightSprite.material.rotation=-Math.PI/2;

// Curved rear wording around ponytail hole using character sprites
const rearTextGroup=new THREE.Group(); rearTextGroup.position.set(0,-.52,-1.97); cap.add(rearTextGroup);
function rebuildRearArc(){
  rearTextGroup.clear();
  const text=document.getElementById("rearArcText").value.trim().toUpperCase();
  if(!text)return;
  const color=document.getElementById("rearTextColor").value;
  const bottom=document.getElementById("arcDirection").value==="bottom";
  const radius=.98;
  const start=bottom?Math.PI*.12:Math.PI*1.12;
  const end=bottom?Math.PI*.88:Math.PI*1.88;
  [...text].forEach((ch,i)=>{
    const t=text.length===1?.5:i/(text.length-1);
    const a=start+(end-start)*t;
    const sp=charSprite(ch,color);
    sp.position.set(Math.cos(a)*radius,Math.sin(a)*radius,0);
    sp.scale.set(.23,.23,1);
    sp.material.rotation=bottom?a-Math.PI/2:a+Math.PI/2;
    rearTextGroup.add(sp);
  });
}
function charSprite(ch,color){
  const cv=document.createElement("canvas");cv.width=cv.height=128;const ctx=cv.getContext("2d");
  ctx.clearRect(0,0,128,128);ctx.fillStyle=color;ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="bold 92px Arial";ctx.fillText(ch,64,66);
  const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;
  return new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:false}));
}

const presetData=[
  ["#111111","#111111","#111111"],["#111111","#ffffff","#111111"],["#111111","#d4a800","#111111"],
  ["#122038","#ffffff","#122038"],["#414141","#111111","#111111"],["#7b7656","#111111","#111111"],
  ["#c6aa7a","#111111","#c6aa7a"],["#ffffff","#ffffff","#ffffff"]
];
const presets=document.getElementById("presets");
presetData.forEach((p,i)=>{const b=document.createElement("button");b.className="preset";b.type="button";b.title="Preset colour combination";b.innerHTML=`<span style="background:${p[0]}"></span><span style="background:${p[1]}"></span>`;b.addEventListener("click",()=>{document.querySelectorAll(".preset").forEach(x=>x.classList.remove("active"));b.classList.add("active");setColor("frontColor",p[0]);setColor("meshColor",p[1]);setColor("peakColor",p[2]);});presets.appendChild(b);if(i===0)b.classList.add("active");});
function setColor(id,value){const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event("input"));}

const bindings={frontColor:mat.front,meshColor:mat.mesh,peakColor:mat.peak,underColor:mat.under,buttonColor:mat.button,stripColor:mat.strip};
Object.entries(bindings).forEach(([id,m])=>document.getElementById(id).addEventListener("input",e=>m.color.set(e.target.value)));
["frontText","frontTextColor"].forEach(id=>document.getElementById(id).addEventListener("input",drawFront));
document.getElementById("leftStripText").addEventListener("input",e=>updateSideSprite(leftSprite,e.target.value));
document.getElementById("rightStripText").addEventListener("input",e=>updateSideSprite(rightSprite,e.target.value));
["rearArcText","rearTextColor","arcDirection"].forEach(id=>document.getElementById(id).addEventListener("input",rebuildRearArc));

document.getElementById("logoUpload").addEventListener("change",e=>{const f=e.target.files?.[0];if(!f)return;const url=URL.createObjectURL(f);const img=new Image();img.onload=()=>{uploadedImage=img;drawFront();URL.revokeObjectURL(url)};img.src=url;});
document.getElementById("removeLogo").addEventListener("click",()=>{uploadedImage=null;document.getElementById("logoUpload").value="";drawFront();});

let autoRotate=false;
document.getElementById("toggleRotate").addEventListener("click",e=>{autoRotate=!autoRotate;controls.autoRotate=autoRotate;e.currentTarget.textContent=autoRotate?"Stop rotation":"Auto rotate";});
document.getElementById("resetView").addEventListener("click",()=>setView("front"));
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
function setView(v){const pos={front:[0,1.8,6.2],left:[-6.2,1.5,0],back:[0,1.4,-6.2],right:[6.2,1.5,0]}[v];camera.position.set(...pos);controls.target.set(0,.55,0);controls.update();}

function resize(){const w=viewer.clientWidth,h=viewer.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
window.addEventListener("resize",resize);resize();
document.getElementById("loading").remove();

function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}animate();

const form=document.getElementById("quoteForm");
form.addEventListener("submit",async e=>{
  e.preventDefault();
  const summary=[
    `Front panels: ${document.getElementById("frontColor").value}`,
    `Mesh: ${document.getElementById("meshColor").value}`,
    `Peak: ${document.getElementById("peakColor").value}`,
    `Undervisor: ${document.getElementById("underColor").value}`,
    `Button: ${document.getElementById("buttonColor").value}`,
    `Side strips: ${document.getElementById("stripColor").value}`,
    `Front wording: ${document.getElementById("frontText").value||"None"}`,
    `Left strip: ${document.getElementById("leftStripText").value||"None"}`,
    `Right strip: ${document.getElementById("rightStripText").value||"None"}`,
    `Curved rear branding: ${document.getElementById("rearArcText").value||"None"}`,
    `Rear arc direction: ${document.getElementById("arcDirection").value}`,
    `Quantity: ${document.getElementById("quantity").value}`
  ].join("\n");
  document.getElementById("designSummary").value=summary;
  const status=document.getElementById("formStatus");status.textContent="Sending…";
  try{
    const res=await fetch(form.action,{method:"POST",body:new FormData(form),headers:{Accept:"application/json"}});
    const data=await res.json();
    if(!res.ok)throw new Error(data.message||"Submission failed");
    status.textContent="Thank you — your design enquiry has been sent to TC Coolers.";
    form.reset();
  }catch(err){status.textContent="The form could not be sent. Please email tccoolers@gmail.com.";}
});
