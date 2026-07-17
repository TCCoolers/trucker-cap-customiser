
const $ = id => document.getElementById(id);
const bindings = {
  frontColor: 'frontOverlay',
  meshColor: 'meshOverlay',
  peakColor: 'peakOverlay',
  stripColor: 'stripOverlay'
};
Object.entries(bindings).forEach(([input, overlay])=>{
  $(input).addEventListener('input', e => $(overlay).style.background = e.target.value);
});
[['frontText','frontTextOut'],['leftText','leftTextOut'],['rightText','rightTextOut'],['rearText','rearArcOut']].forEach(([input,out])=>{
  $(input).addEventListener('input',e=>$(out).textContent=e.target.value);
});

$('quoteForm').addEventListener('submit', async e=>{
  e.preventDefault();
  $('designSummary').value = [
    `Front panels: ${$('frontColor').value}`,
    `Mesh: ${$('meshColor').value}`,
    `Peak: ${$('peakColor').value}`,
    `Side strips: ${$('stripColor').value}`,
    `Front wording: ${$('frontText').value||'None'}`,
    `Left strip: ${$('leftText').value||'None'}`,
    `Right strip: ${$('rightText').value||'None'}`,
    `Curved rear wording: ${$('rearText').value||'None'}`
  ].join('\n');
  $('status').textContent='Sending…';
  try{
    const r=await fetch(e.target.action,{method:'POST',body:new FormData(e.target),headers:{Accept:'application/json'}});
    if(!r.ok) throw new Error();
    $('status').textContent='Thank you — your quote request has been sent.';
    e.target.reset();
  }catch{
    $('status').textContent='The form could not be sent. Please email tccoolers@gmail.com.';
  }
});
