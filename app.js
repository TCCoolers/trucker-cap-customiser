
const $=id=>document.getElementById(id);
const canvas=$('designerCanvas'),ctx=canvas.getContext('2d');
const views={front:'front.png',left:'left.png',right:'right.png',back:'back.png',under:'under.png'};
const titles={front:'Front View',left:'Left View',right:'Right View',back:'Back View',under:'Under-Peak View'};
const images={}; let currentView='front',logoImage=null,underImage=null,dragging=null,dragOffset={x:0,y:0};
const art={logo:{x:600,y:335,scale:1.25,rotation:0},under:{x:600,y:430,scale:1,rotation:0}};
const swatches=['#111111','#ffffff','#3b3b3b','#7d7d7d','#835f3d','#c6a477','#52623b','#233b67','#2451a4','#bd1f2d','#7c2335','#0e4535','#203d31','#e0b000','#f07822'];

function load(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
async function init(){for(const[k,v]of Object.entries(views)){images[k]=await load(v)}buildSwatches();bind();draw()}
function buildSwatches(){const w=$('colourSwatches');swatches.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.className='swatch'+(i===0?' active':'');b.style.background=c;b.addEventListener('click',()=>{document.querySelectorAll('.swatch').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('frontColor').value=c;$('peakColor').value=c;$('upperStripColor').value=c;$('lowerStripColor').value=c;$('buttonColor').value=c;draw()});w.appendChild(b)})}
function bind(){document.querySelectorAll('#viewTabs button').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
['frontColor','meshColor','peakColor','upperStripColor','lowerStripColor','buttonColor','underColor','frontText','frontTextColor','leftUpperText','leftLowerText','rightUpperText','rightLowerText','rearText','rearTextColor','rearSize','rearPosition','underMode'].forEach(id=>$(id).addEventListener('input',draw));
$('logoUpload').addEventListener('change',e=>upload(e,'logo'));$('underUpload').addEventListener('change',e=>upload(e,'under'));
$('removeLogo').addEventListener('click',()=>{logoImage=null;$('logoUpload').value='';draw()});$('removeUnder').addEventListener('click',()=>{underImage=null;$('underUpload').value='';draw()});
$('logoScale').addEventListener('input',e=>{art.logo.scale=+e.target.value/100;draw()});$('logoRotation').addEventListener('input',e=>{art.logo.rotation=+e.target.value*Math.PI/180;draw()});
$('underScale').addEventListener('input',e=>{art.under.scale=+e.target.value/100;draw()});$('underRotation').addEventListener('input',e=>{art.under.rotation=+e.target.value*Math.PI/180;draw()});
$('centreLogo').addEventListener('click',()=>{art.logo.x=600;art.logo.y=330;draw()});$('resetDesign').addEventListener('click',reset);
$('downloadProof').addEventListener('click',download);$('printProof').addEventListener('click',()=>window.print());$('quoteForm').addEventListener('submit',submitQuote);
canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up)}
function setView(v){currentView=v;$('viewTitle').textContent=titles[v];document.querySelectorAll('#viewTabs button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));draw()}
function reset(){art.logo={x:600,y:335,scale:1.25,rotation:0};art.under={x:600,y:430,scale:1,rotation:0};$('logoScale').value=125;$('logoRotation').value=0;$('underScale').value=100;$('underRotation').value=0;draw()}
function upload(e,type){
  const f=e.target.files?.[0];
  if(!f)return;
  const r=new FileReader();
  r.onerror=()=>alert('The image could not be read. Please try a PNG, JPG, SVG or WEBP file.');
  r.onload=async()=>{
    try{
      const i=await load(r.result);
      if(type==='logo'){
        logoImage=i;
        art.logo.x=600; art.logo.y=335; art.logo.scale=1.25;
        $('logoScale').value=125;
        setView('front');
      }else{
        underImage=i;
        setView('under');
      }
      draw();
    }catch(err){
      alert('The image could not be loaded. Please try another file.');
    }
  };
  r.readAsDataURL(f);
}
function fit(img){const s=Math.min(canvas.width/img.width,canvas.height/img.height),w=img.width*s,h=img.height*s;return{x:(canvas.width-w)/2,y:(canvas.height-h)/2,w,h}}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);const img=images[currentView];if(!img)return;const r=fit(img);ctx.drawImage(img,r.x,r.y,r.w,r.h);drawColour(currentView,r);if(['front','left','right'].includes(currentView)&&logoImage)drawArt(logoImage,art.logo,currentView==='front'?390:270,currentView==='front'?220:170);drawText(currentView,r);if(currentView==='under'&&underImage)drawUnder(r)}
function fillPath(points,color,alpha=.52){ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();ctx.restore()}
function ellipse(x,y,rx,ry,color,alpha=.52){ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawColour(v,r){
  const f=$('frontColor').value,m=$('meshColor').value,p=$('peakColor').value,
        u=$('upperStripColor').value,l=$('lowerStripColor').value,
        b=$('buttonColor').value,under=$('underColor').value;
  const X=t=>r.x+r.w*t,Y=t=>r.y+r.h*t;

  if(v==='front'){
    // Front solid crown panel.
    fillPath([[X(.18),Y(.10)],[X(.82),Y(.10)],[X(.86),Y(.57)],[X(.72),Y(.66)],[X(.28),Y(.66)],[X(.14),Y(.57)]],f,.48);
    // Narrow visible mesh sections only.
    fillPath([[X(.055),Y(.12)],[X(.18),Y(.12)],[X(.18),Y(.63)],[X(.06),Y(.69)]],m,.28);
    fillPath([[X(.82),Y(.12)],[X(.945),Y(.12)],[X(.94),Y(.69)],[X(.82),Y(.63)]],m,.28);
    // Peak.
    fillPath([[X(.08),Y(.61)],[X(.92),Y(.61)],[X(.91),Y(.90)],[X(.77),Y(.97)],[X(.23),Y(.97)],[X(.09),Y(.90)]],p,.50);
    ellipse(X(.5),Y(.055),r.w*.026,r.h*.025,b,.58);
  }

  if(v==='left'){
    // Front solid panel on left-side drawing.
    fillPath([[X(.13),Y(.11)],[X(.47),Y(.08)],[X(.49),Y(.59)],[X(.39),Y(.68)],[X(.17),Y(.61)]],f,.48);
    // Mesh crown.
    fillPath([[X(.43),Y(.10)],[X(.86),Y(.12)],[X(.90),Y(.53)],[X(.79),Y(.68)],[X(.47),Y(.65)]],m,.27);
    // Peak.
    fillPath([[X(.08),Y(.56)],[X(.49),Y(.51)],[X(.62),Y(.68)],[X(.46),Y(.77)],[X(.18),Y(.79)],[X(.07),Y(.72)]],p,.50);
    // Side strips, kept narrow.
    fillPath([[X(.43),Y(.49)],[X(.87),Y(.50)],[X(.88),Y(.555)],[X(.43),Y(.555)]],u,.52);
    fillPath([[X(.43),Y(.57)],[X(.87),Y(.58)],[X(.87),Y(.635)],[X(.43),Y(.625)]],l,.52);
    ellipse(X(.515),Y(.06),r.w*.025,r.h*.024,b,.58);
  }

  if(v==='right'){
    fillPath([[X(.53),Y(.08)],[X(.87),Y(.11)],[X(.83),Y(.61)],[X(.61),Y(.68)],[X(.51),Y(.59)]],f,.48);
    fillPath([[X(.14),Y(.12)],[X(.57),Y(.10)],[X(.53),Y(.65)],[X(.21),Y(.68)],[X(.10),Y(.53)]],m,.27);
    fillPath([[X(.38),Y(.51)],[X(.92),Y(.56)],[X(.93),Y(.72)],[X(.82),Y(.79)],[X(.54),Y(.77)],[X(.38),Y(.68)]],p,.50);
    fillPath([[X(.13),Y(.50)],[X(.57),Y(.49)],[X(.57),Y(.555)],[X(.12),Y(.555)]],u,.52);
    fillPath([[X(.13),Y(.58)],[X(.57),Y(.57)],[X(.57),Y(.625)],[X(.13),Y(.635)]],l,.52);
    ellipse(X(.485),Y(.06),r.w*.025,r.h*.024,b,.58);
  }

  if(v==='back'){
    // Mesh only; exclude pony opening, snapback and strip regions.
    ctx.save();
    ctx.globalCompositeOperation='multiply';
    ctx.globalAlpha=.27;
    ctx.fillStyle=m;
    ctx.beginPath();
    ctx.moveTo(X(.20),Y(.10));
    ctx.quadraticCurveTo(X(.50),Y(.01),X(.80),Y(.10));
    ctx.lineTo(X(.88),Y(.58));
    ctx.lineTo(X(.74),Y(.56));
    ctx.quadraticCurveTo(X(.50),Y(.45),X(.26),Y(.56));
    ctx.lineTo(X(.12),Y(.58));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    fillPath([[X(.08),Y(.555)],[X(.30),Y(.60)],[X(.30),Y(.665)],[X(.07),Y(.62)]],u,.50);
    fillPath([[X(.70),Y(.60)],[X(.92),Y(.555)],[X(.93),Y(.62)],[X(.70),Y(.665)]],u,.50);
    fillPath([[X(.07),Y(.65)],[X(.30),Y(.69)],[X(.30),Y(.755)],[X(.06),Y(.72)]],l,.50);
    fillPath([[X(.70),Y(.69)],[X(.93),Y(.65)],[X(.94),Y(.72)],[X(.70),Y(.755)]],l,.50);
    ellipse(X(.5),Y(.045),r.w*.025,r.h*.023,b,.58);
  }

  if(v==='under'){
    // Under-peak colour only follows the supplied under-view brim shape.
    ctx.save();
    ctx.globalCompositeOperation='multiply';
    ctx.globalAlpha=.40;
    ctx.fillStyle=under;
    ctx.beginPath();
    ctx.ellipse(X(.50),Y(.52),r.w*.385,r.h*.355,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}
function drawArt(img,s,maxW,maxH){const q=Math.min(maxW/img.width,maxH/img.height),w=img.width*q*s.scale,h=img.height*q*s.scale;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rotation);ctx.drawImage(img,-w/2,-h/2,w,h);ctx.restore();s.bounds={x:s.x-w/2,y:s.y-h/2,w,h}}
function drawText(v,r){ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
if(v==='front'&&$('frontText').value){ctx.fillStyle=$('frontTextColor').value;ctx.font='bold 52px Arial';ctx.fillText($('frontText').value,r.x+r.w*.5,r.y+r.h*.50,r.w*.55)}
if(v==='left'){ctx.fillStyle='#111';ctx.font='bold 23px Arial';ctx.fillText($('leftUpperText').value.toUpperCase(),r.x+r.w*.67,r.y+r.h*.57,r.w*.30);ctx.fillText($('leftLowerText').value.toUpperCase(),r.x+r.w*.67,r.y+r.h*.64,r.w*.30)}
if(v==='right'){ctx.fillStyle='#111';ctx.font='bold 23px Arial';ctx.fillText($('rightUpperText').value.toUpperCase(),r.x+r.w*.33,r.y+r.h*.57,r.w*.30);ctx.fillText($('rightLowerText').value.toUpperCase(),r.x+r.w*.33,r.y+r.h*.64,r.w*.30)}
if(v==='back'&&$('rearText').value){
  const pos=+$('rearPosition').value/100;
  // Low arc positioned immediately above the ponytail opening.
  const cy=r.y+r.h*(.665 + (pos-.88)*.045);
  drawArc(
    $('rearText').value.toUpperCase(),
    r.x+r.w*.5,
    cy,
    r.w*.145,
    Math.PI*1.10,
    Math.PI*1.90,
    $('rearTextColor').value,
    +$('rearSize').value
  );
}
ctx.restore()}
function drawArc(text,cx,cy,rad,start,end,color,size){const a=[...text],step=(end-start)/Math.max(a.length-1,1);ctx.fillStyle=color;ctx.font=`bold ${size}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';a.forEach((ch,i)=>{const ang=start+step*i;ctx.save();ctx.translate(cx+Math.cos(ang)*rad,cy+Math.sin(ang)*rad);ctx.rotate(ang+Math.PI/2);ctx.fillText(ch,0,0);ctx.restore()})}
function drawUnder(r){ctx.save();ctx.beginPath();ctx.ellipse(r.x+r.w*.50,r.y+r.h*.50,r.w*.41,r.h*.39,0,0,Math.PI*2);ctx.clip();ctx.translate(art.under.x,art.under.y);ctx.rotate(art.under.rotation);const mode=$('underMode').value;let s=Math.min(r.w/underImage.width,r.h/underImage.height)*art.under.scale;if(mode==='cover')s=Math.max(r.w*.82/underImage.width,r.h*.72/underImage.height)*art.under.scale;if(mode==='contain')s=Math.min(r.w*.76/underImage.width,r.h*.62/underImage.height)*art.under.scale;if(mode==='center')s*=.55;const w=underImage.width*s,h=underImage.height*s;if(mode==='repeat'){const pw=Math.max(90,w*.25),ph=Math.max(70,h*.25);for(let x=-r.w;x<r.w;x+=pw)for(let y=-r.h;y<r.h;y+=ph)ctx.drawImage(underImage,x,y,pw,ph)}else ctx.drawImage(underImage,-w/2,-h/2,w,h);ctx.restore();art.under.bounds={x:art.under.x-230,y:art.under.y-170,w:460,h:340}}
function pt(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
function hit(b,p){return b&&p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h}
function down(e){const p=pt(e);if(currentView==='under'&&underImage&&hit(art.under.bounds,p))dragging='under';else if(['front','left','right'].includes(currentView)&&logoImage&&hit(art.logo.bounds,p))dragging='logo';if(dragging){dragOffset.x=p.x-art[dragging].x;dragOffset.y=p.y-art[dragging].y;canvas.setPointerCapture(e.pointerId)}}
function move(e){if(!dragging)return;const p=pt(e);art[dragging].x=p.x-dragOffset.x;art[dragging].y=p.y-dragOffset.y;draw()}
function up(e){dragging=null;try{canvas.releasePointerCapture(e.pointerId)}catch{}}
function download(){draw();const a=document.createElement('a');a.download=`tc-coolers-${currentView}-proof.png`;a.href=canvas.toDataURL('image/png');a.click()}
async function submitQuote(e){e.preventDefault();$('designSummary').value=[`Front panel: ${$('frontColor').value}`,`Mesh: ${$('meshColor').value}`,`Peak: ${$('peakColor').value}`,`Upper strip: ${$('upperStripColor').value}`,`Lower strip: ${$('lowerStripColor').value}`,`Top button: ${$('buttonColor').value}`,`Under peak: ${$('underColor').value}`,`Front text: ${$('frontText').value||'None'}`,`Left upper: ${$('leftUpperText').value||'None'}`,`Left lower: ${$('leftLowerText').value||'None'}`,`Right upper: ${$('rightUpperText').value||'None'}`,`Right lower: ${$('rightLowerText').value||'None'}`,`Back curved text: ${$('rearText').value||'None'}`,`Logo uploaded: ${logoImage?'Yes':'No'}`,`Under-peak artwork uploaded: ${underImage?'Yes':'No'}`,`Quantity: ${$('quantity').value}`].join('\\n');$('status').textContent='Sending…';try{const r=await fetch(e.target.action,{method:'POST',body:new FormData(e.target),headers:{Accept:'application/json'}});if(!r.ok)throw new Error();$('status').textContent='Thank you — your quote request has been sent.'}catch{$('status').textContent='The form could not be sent. Please email tccoolers@gmail.com.'}}
init();
