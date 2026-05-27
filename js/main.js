/* ═══════════════════════════════════════
   WordArt Studio - Main Application
   ═══════════════════════════════════════ */

(function(){

/* ── State ── */
var state = {
  text: 'Hello World!',
  fontFamily: 'Arial',
  fontSize: 56,
  fontWeight: 'bold',
  letterSpacing: 4,
  col1: '#ff0044',
  col2: '#ffdd00',
  outlineColor: '#000000',
  outlineWidth: 2,
  depth: 10,
  gradDir: 'diag',
  curve: 'none',
  curvature: 0.5,
  amplitude: 40,
  rotationOffset: 0,
  coilRadius: 120,
  coilSweep: 180,
  animPreset: 'idle',
  speed: 1,
  waveFreq: 3,
  bounceHeight: 12,
  flickerIntensity: 0.15,
  glowEnabled: true,
  glowBlur: 15,
  glowAlpha: 0.25,
  particlesEnabled: false,
  particleType: 'stars',
  particleCount: 40,
  bgGridEnabled: false,
  scanlinesEnabled: false,
  bgColor: '#0a0a14',
};

var undoStack = [];
var redoStack = [];
var snapshots = [];
var particles = [];

/* ── DOM refs ── */
var canvas, ctx;
var ctrlText, ctrlFont, ctrlSize, ctrlLSpace;
var ctrlCol1, ctrlCol2, ctrlOutline, ctrlOWidth, ctrlDepth;
var ctrlCurv, ctrlAmp, ctrlRotOff, ctrlRad, ctrlSweep;
var ctrlSpeed, ctrlFreq, ctrlBounce, ctrlFlick;
var ctrlGlow, ctrlGBlur, ctrlGAlpha;
var ctrlParticles, ctrlPType, ctrlPCnt;
var ctrlBgGrid, ctrlSyncLines;

/* ── Init ── */
document.addEventListener('DOMContentLoaded', function(){
  canvas = document.getElementById('mainCanvas');
  ctx = canvas.getContext('2d');

  bindDOM();
  buildPresets();
  buildShapes();
  buildAnims();
  bindEvents();
  restoreFromHash();
  initParticles(state.particleCount);
  resize();
  window.addEventListener('resize', resize);
  pushHistory('Initialized');
  requestAnimationFrame(loop);
});

function bindDOM(){
  ctrlText = document.getElementById('ctrlText');
  ctrlFont = document.getElementById('ctrlFont');
  ctrlSize = document.getElementById('ctrlSize');
  ctrlLSpace = document.getElementById('ctrlLSpace');
  ctrlCol1 = document.getElementById('ctrlCol1');
  ctrlCol2 = document.getElementById('ctrlCol2');
  ctrlOutline = document.getElementById('ctrlOutline');
  ctrlOWidth = document.getElementById('ctrlOWidth');
  ctrlDepth = document.getElementById('ctrlDepth');
  ctrlCurv = document.getElementById('ctrlCurv');
  ctrlAmp = document.getElementById('ctrlAmp');
  ctrlRotOff = document.getElementById('ctrlRotOff');
  ctrlRad = document.getElementById('ctrlRad');
  ctrlSweep = document.getElementById('ctrlSweep');
  ctrlSpeed = document.getElementById('ctrlSpeed');
  ctrlFreq = document.getElementById('ctrlFreq');
  ctrlBounce = document.getElementById('ctrlBounce');
  ctrlFlick = document.getElementById('ctrlFlick');
  ctrlGlow = document.getElementById('ctrlGlow');
  ctrlGBlur = document.getElementById('ctrlGBlur');
  ctrlGAlpha = document.getElementById('ctrlGAlpha');
  ctrlParticles = document.getElementById('ctrlParticles');
  ctrlPType = document.getElementById('ctrlPType');
  ctrlPCnt = document.getElementById('ctrlPCnt');
  ctrlBgGrid = document.getElementById('ctrlBgGrid');
  ctrlSyncLines = document.getElementById('ctrlScanlines');
}

/* ── Presets ── */
var PRESETS = [
  { name:'Rainbow', icon:'🌈', text:'HELLO WORLD', col1:'#ff0044', col2:'#ffdd00', olc:'#000', olw:2, dep:10, curve:'wave', curv:0.12, amp:30, freq:3, speed:2, anim:'wave', fw:'bold', font:'Arial', size:56, lsp:4, glow:true, gblur:15, galpha:0.2, particles:false, bg:'#1a1a3e' },
  { name:'Neon', icon:'💜', text:'NEON CITY', col1:'#00ffff', col2:'#ff00ff', olc:'#111', olw:1, dep:4, curve:'wave', curv:0.08, amp:18, freq:2, speed:1.5, anim:'flicker', fw:'bold', font:'Courier New', size:56, lsp:8, glow:true, gblur:20, galpha:0.3, particles:true, ptype:'stars', pcnt:30, bg:'#050510' },
  { name:'Fire', icon:'🔥', text:'BLAZE AWAY', col1:'#ff4500', col2:'#ffff00', olc:'#5a0000', olw:2, dep:10, curve:'wave', curv:0.1, amp:25, freq:3, speed:2.5, anim:'shake', fw:'bold', font:'Arial', size:48, lsp:4, glow:true, gblur:18, galpha:0.25, particles:true, ptype:'embers', pcnt:30, bg:'#1a0500' },
  { name:'Ice', icon:'❄️', text:'CRYSTAL ICE', col1:'#00e5ff', col2:'#e0ffff', olc:'#006688', olw:2, dep:8, curve:'coil', curv:0, amp:0, freq:0, speed:0.8, anim:'spin', fw:'bold', font:'Trebuchet MS', size:44, lsp:3, glow:true, gblur:14, galpha:0.2, particles:true, ptype:'snow', pcnt:25, bg:'#0a1228' },
  { name:'Chrome', icon:'🪩', text:'FORGED', col1:'#e8e8e8', col2:'#888888', olc:'#222', olw:3, dep:14, curve:'pulse', curv:0, amp:0, freq:0, speed:1.5, anim:'pulse', fw:'bold', font:'Impact', size:60, lsp:5, glow:false, gblur:0, galpha:0, particles:false, bg:'#3a3a3a' },
  { name:'Dream', icon:'🌙', text:'DREAM ON', col1:'#9b59b6', col2:'#e74c3c', olc:'#6c3483', olw:2, dep:10, curve:'bounce', curv:0, amp:0, freq:0, speed:2, anim:'bounce', fw:'bold', font:'Arial', size:56, lsp:6, glow:true, gblur:16, galpha:0.25, particles:true, ptype:'stars', pcnt:50, bg:'#0a0a18' },
  { name:'Retro', icon:'👾', text:'OUTRUN', col1:'#ff00ff', col2:'#00ffff', olc:'#ff00ff', olw:2, dep:8, curve:'pulse', curv:0, amp:0, freq:0, speed:1, anim:'flicker', fw:'bold', font:'Courier New', size:56, lsp:10, glow:true, gblur:20, galpha:0.3, particles:false, bg:'#0a0015', grid:true, scan:true },
  { name:'Power', icon:'💥', text:'ACTION', col1:'#ffffff', col2:'#cccccc', olc:'#440000', olw:5, dep:16, curve:'shake', curv:0, amp:0, freq:0, speed:4, anim:'shake', fw:'900', font:'Impact', size:70, lsp:6, glow:false, gblur:0, galpha:0, particles:false, bg:'#cc0000' },
  { name:'Nature', icon:'🌿', text:'FOREVER GREEN', col1:'#00aa00', col2:'#aaff00', olc:'#2d5a27', olw:2, dep:8, curve:'wave', curv:0.1, amp:28, freq:4, speed:1.5, anim:'wave', fw:'bold', font:'Comic Sans MS', size:38, lsp:2, glow:false, gblur:0, galpha:0, particles:true, ptype:'dots', pcnt:20, bg:'#1a2a0a' },
  { name:'Sky', icon:'☁️', text:'SKY HIGH', col1:'#ffffff', col2:'#b0d4f1', olc:'#4682b4', olw:2, dep:6, curve:'arch', curv:0.4, amp:40, freq:0, speed:0, anim:'idle', fw:'bold', font:'Segoe UI', size:42, lsp:4, glow:false, gblur:0, galpha:0, particles:false, bg:'#87ceeb' },
  { name:'Sunset', icon:'🌅', text:'SUNSET', col1:'#fff5ee', col2:'#ffe4b5', olc:'#cd5c5c', olw:3, dep:12, curve:'coil', curv:0, amp:0, freq:0, speed:0.5, anim:'spin', fw:'bold', font:'Georgia', size:50, lsp:6, glow:true, gblur:12, galpha:0.15, particles:true, ptype:'embers', pcnt:15, bg:'#ff6347' },
  { name:'Matrix', icon:'💻', text:'MATRIX', col1:'#00ff00', col2:'#003300', olc:'#001a00', olw:1, dep:6, curve:'none', curv:0, amp:0, freq:0, speed:3, anim:'glitch', fw:'bold', font:'Courier New', size:64, lsp:10, glow:true, gblur:25, galpha:0.4, particles:true, ptype:'dots', pcnt:40, bg:'#000800' },
];

function buildPresets(){
  var grid = document.getElementById('presetGrid');
  PRESETS.forEach(function(p, idx){
    var el = document.createElement('div');
    el.className = 'preset-item';
    el.textContent = p.icon + ' ' + p.name;
    el.setAttribute('data-idx', idx);
    el.addEventListener('click', function(){ applyPreset(idx); });
    grid.appendChild(el);
  });
}

function applyPreset(idx){
  var p = PRESETS[idx];
  snapshotState();
  Object.assign(state, {
    text: p.text,
    fontFamily: p.font,
    fontSize: p.size,
    fontWeight: p.fw,
    col1: p.col1,
    col2: p.col2,
    outlineColor: p.olc,
    outlineWidth: p.olw,
    depth: p.dep,
    curve: p.curve,
    curvature: p.curv,
    amplitude: p.amp,
    waveFreq: p.freq,
    speed: p.speed,
    animPreset: p.anim,
    letterSpacing: p.lsp,
    glowEnabled: p.glow,
    glowBlur: p.gblur,
    glowAlpha: p.galpha,
    particlesEnabled: p.particles,
    particleType: p.ptype || 'stars',
    particleCount: p.pcnt || 0,
    bgGridEnabled: !!p.grid,
    scanlinesEnabled: !!p.scan,
    bgColor: p.bg,
  });
  syncUI();
  initParticles(state.particleCount);
  pushHistory('Preset: ' + p.name);
}

/* ── Shapes ── */
var SHAPES = [
  { id:'none', label:'Straight' },
  { id:'arch', label:'Arch Up' },
  { id:'arc', label:'Arc Down' },
  { id:'wave', label:'Wave' },
  { id:'slant', label:'Slant' },
  { id:'coil', label:'Coil' },
  { id:'bounce', label:'Bounce' },
  { id:'pulse', label:'Pulse' },
  { id:'shake', label:'Shake' },
];

function buildShapes(){
  var grid = document.getElementById('shapeGrid');
  SHAPES.forEach(function(s){
    var el = document.createElement('div');
    el.className = 'shape-item';
    el.textContent = s.label;
    el.setAttribute('data-curve', s.id);
    el.addEventListener('click', function(){
      snapshotState();
      state.curve = s.id;
      syncUI();
      pushHistory('Shape: ' + s.label);
    });
    grid.appendChild(el);
  });
}

/* ── Animations ── */
var ANIMS = [
  { id:'idle', label:'Idle' },
  { id:'wave', label:'Wave' },
  { id:'bounce', label:'Bounce' },
  { id:'spin', label:'Spin' },
  { id:'pulse', label:'Pulse' },
  { id:'flicker', label:'Flicker' },
  { id:'shake', label:'Shake' },
  { id:'glitch', label:'Glitch' },
  { id:'rainbow', label:'Rainbow' },
];

function buildAnims(){
  var grid = document.getElementById('animGrid');
  ANIMS.forEach(function(a){
    var el = document.createElement('div');
    el.className = 'anim-item';
    el.textContent = a.label;
    el.setAttribute('data-anim', a.id);
    el.addEventListener('click', function(){
      snapshotState();
      state.animPreset = a.id;
      syncUI();
      pushHistory('Anim: ' + a.label);
    });
    grid.appendChild(el);
  });
}

/* ── Events ── */
function bindEvents(){
  // Tabs
  document.querySelectorAll('.tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelectorAll('.panel-body').forEach(function(p){ p.classList.remove('panel-active'); });
      var panId = 'panel' + {'text':'Text','style':'Style','curve':'Curve','animation':'Anim','fx':'Fx'}[tab.dataset.tab];
      document.getElementById(panId).classList.add('panel-active');
    });
  });

  // Text controls
  ctrlText.addEventListener('input', function(){ snapshotState(); state.text = this.value; syncUI(); });
  ctrlFont.addEventListener('change', function(){ snapshotState(); state.fontFamily = this.value; });
  ctrlSize.addEventListener('input', function(){ snapshotState(); state.fontSize = +this.value; updateLabel('valSize', this.value); });
  ctrlLSpace.addEventListener('input', function(){ snapshotState(); state.letterSpacing = +this.value; updateLabel('valLSpace', this.value); });

  // Style controls
  ctrlCol1.addEventListener('input', function(){ snapshotState(); state.col1 = this.value; });
  ctrlCol2.addEventListener('input', function(){ snapshotState(); state.col2 = this.value; });
  ctrlOutline.addEventListener('input', function(){ snapshotState(); state.outlineColor = this.value; });
  ctrlOWidth.addEventListener('input', function(){ snapshotState(); state.outlineWidth = +this.value; updateLabel('valOWidth', this.value); });
  ctrlDepth.addEventListener('input', function(){ snapshotState(); state.depth = +this.value; updateLabel('valDepth', this.value); });

  // Grad direction
  document.getElementById('gradDirGroup').querySelectorAll('.chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      document.getElementById('gradDirGroup').querySelectorAll('.chip').forEach(function(c){ c.classList.remove('selected'); });
      chip.classList.add('selected');
      state.gradDir = chip.dataset.dir;
    });
  });

  // Font weight
  document.getElementById('weightGroup').querySelectorAll('.chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      document.getElementById('weightGroup').querySelectorAll('.chip').forEach(function(c){ c.classList.remove('selected'); });
      chip.classList.add('selected');
      state.fontWeight = chip.dataset.val;
    });
  });

  // Curve controls
  ctrlCurv.addEventListener('input', function(){ snapshotState(); state.curvature = +this.value; updateLabel('valCurv', parseFloat(this.value).toFixed(2)); });
  ctrlAmp.addEventListener('input', function(){ snapshotState(); state.amplitude = +this.value; updateLabel('valAmp', this.value); });
  ctrlRotOff.addEventListener('input', function(){ snapshotState(); state.rotationOffset = +this.value; updateLabel('valRotOff', this.value); });
  ctrlRad.addEventListener('input', function(){ snapshotState(); state.coilRadius = +this.value; updateLabel('valRad', this.value); });
  ctrlSweep.addEventListener('input', function(){ snapshotState(); state.coilSweep = +this.value; updateLabel('valSweep', this.value); });

  // Anim controls
  ctrlSpeed.addEventListener('input', function(){ snapshotState(); state.speed = +this.value; updateLabel('valSpeed', parseFloat(this.value).toFixed(1)); });
  ctrlFreq.addEventListener('input', function(){ snapshotState(); state.waveFreq = +this.value; updateLabel('valFreq', this.value); });
  ctrlBounce.addEventListener('input', function(){ snapshotState(); state.bounceHeight = +this.value; updateLabel('valBounce', this.value); });
  ctrlFlick.addEventListener('input', function(){ snapshotState(); state.flickerIntensity = +this.value; updateLabel('valFlick', parseFloat(this.value).toFixed(2)); });

  // FX
  ctrlGlow.addEventListener('change', function(){ state.glowEnabled = this.checked; });
  ctrlGBlur.addEventListener('input', function(){ state.glowBlur = +this.value; updateLabel('valGBlur', this.value); });
  ctrlGAlpha.addEventListener('input', function(){ state.glowAlpha = +this.value; updateLabel('valGAlpha', parseFloat(this.value).toFixed(2)); });
  ctrlParticles.addEventListener('change', function(){ state.particlesEnabled = this.checked; initParticles(state.particleCount); });
  ctrlPType.addEventListener('change', function(){ state.particleType = this.value; });
  ctrlPCnt.addEventListener('input', function(){ state.particleCount = +this.value; updateLabel('valPCnt', this.value); initParticles(state.particleCount); });
  ctrlBgGrid.addEventListener('change', function(){ state.bgGridEnabled = this.checked; });
  ctrlSyncLines.addEventListener('change', function(){ state.scanlinesEnabled = this.checked; });

  // Buttons
  document.getElementById('btnReset').addEventListener('click', resetAll);
  document.getElementById('btnUndo').addEventListener('click', undo);
  document.getElementById('btnRedo').addEventListener('click', redo);
  document.getElementById('btnExport').addEventListener('click', function(){ document.getElementById('modalBackdrop').classList.add('open'); });
  document.getElementById('btnShare').addEventListener('click', shareConfig);

  // Modal close
  document.querySelectorAll('.modal-close').forEach(function(btn){
    btn.addEventListener('click', function(){ btn.closest('.modal-backdrop').classList.remove('open'); });
  });
  document.getElementById('modalBackdrop').addEventListener('click', function(e){
    if(e.target === this) this.classList.remove('open');
  });

  // Export settings
  document.getElementById('formatGroup').querySelectorAll('.chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      document.getElementById('formatGroup').querySelectorAll('.chip').forEach(function(c){ c.classList.remove('selected'); });
      chip.classList.add('selected');
    });
  });
  document.getElementById('scaleGroup').querySelectorAll('.chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      document.getElementById('scaleGroup').querySelectorAll('.chip').forEach(function(c){ c.classList.remove('selected'); });
      chip.classList.add('selected');
    });
  });
  document.getElementById('bgModeGroup').querySelectorAll('.chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      document.getElementById('bgModeGroup').querySelectorAll('.chip').forEach(function(c){ c.classList.remove('selected'); });
      chip.classList.add('selected');
    });
  });

  document.getElementById('btnDownload').addEventListener('click', downloadImage);
  document.getElementById('btnCopyLink').addEventListener('click', copyShareLink);

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e){
    if(e.ctrlKey && e.key === 'z'){ e.preventDefault(); undo(); }
    if(e.ctrlKey && e.key === 'y'){ e.preventDefault(); redo(); }
    if(e.ctrlKey && e.key === 's'){ e.preventDefault(); downloadImage(); }
  });
}

function updateLabel(id, val){ document.getElementById(id).textContent = val; }

/* ── Sync UI to state ── */
function syncUI(){
  ctrlText.value = state.text;
  ctrlFont.value = state.fontFamily;
  ctrlSize.value = state.fontSize; updateLabel('valSize', state.fontSize);
  ctrlLSpace.value = state.letterSpacing; updateLabel('valLSpace', state.letterSpacing);
  ctrlCol1.value = state.col1;
  ctrlCol2.value = state.col2;
  ctrlOutline.value = state.outlineColor;
  ctrlOWidth.value = state.outlineWidth; updateLabel('valOWidth', state.outlineWidth);
  ctrlDepth.value = state.depth; updateLabel('valDepth', state.depth);
  ctrlCurv.value = state.curvature; updateLabel('valCurv', parseFloat(state.curvature).toFixed(2));
  ctrlAmp.value = state.amplitude; updateLabel('valAmp', state.amplitude);
  ctrlRotOff.value = state.rotationOffset; updateLabel('valRotOff', state.rotationOffset);
  ctrlRad.value = state.coilRadius; updateLabel('valRad', state.coilRadius);
  ctrlSweep.value = state.coilSweep; updateLabel('valSweep', state.coilSweep);
  ctrlSpeed.value = state.speed; updateLabel('valSpeed', parseFloat(state.speed).toFixed(1));
  ctrlFreq.value = state.waveFreq; updateLabel('valFreq', state.waveFreq);
  ctrlBounce.value = state.bounceHeight; updateLabel('valBounce', state.bounceHeight);
  ctrlFlick.value = state.flickerIntensity; updateLabel('valFlick', parseFloat(state.flickerIntensity).toFixed(2));
  ctrlGlow.checked = state.glowEnabled;
  ctrlGBlur.value = state.glowBlur; updateLabel('valGBlur', state.glowBlur);
  ctrlGAlpha.value = state.glowAlpha; updateLabel('valGAlpha', parseFloat(state.glowAlpha).toFixed(2));
  ctrlParticles.checked = state.particlesEnabled;
  ctrlPType.value = state.particleType;
  ctrlPCnt.value = state.particleCount; updateLabel('valPCnt', state.particleCount);
  ctrlBgGrid.checked = state.bgGridEnabled;
  ctrlSyncLines.checked = state.scanlinesEnabled;

  // Active chips
  document.getElementById('gradDirGroup').querySelectorAll('.chip').forEach(function(c){
    c.classList.toggle('selected', c.dataset.dir === state.gradDir);
  });
  document.getElementById('weightGroup').querySelectorAll('.chip').forEach(function(c){
    c.classList.toggle('selected', c.dataset.val === state.fontWeight);
  });

  // Active shape
  document.querySelectorAll('.shape-item').forEach(function(el){
    el.classList.toggle('active', el.dataset.curve === state.curve);
  });

  // Active anim
  document.querySelectorAll('.anim-item').forEach(function(el){
    el.classList.toggle('active', el.dataset.anim === state.animPreset);
  });

  // Active preset highlight
  document.querySelectorAll('.preset-item').forEach(function(el){
    el.classList.remove('active');
  });
}

/* ── History (Undo/Redo) ── */
function snapshotState(){
  undoStack.push(JSON.parse(JSON.stringify(state)));
  if(undoStack.length > 50) undoStack.shift();
  redoStack = [];
}

function undo(){
  if(!undoStack.length) return;
  redoStack.push(JSON.parse(JSON.stringify(state)));
  state = undoStack.pop();
  syncUI();
  pushHistory('Undo');
}

function redo(){
  if(!redoStack.length) return;
  undoStack.push(JSON.parse(JSON.stringify(state)));
  state = redoStack.pop();
  syncUI();
  pushHistory('Redo');
}

function pushHistory(msg){
  var log = document.getElementById('historyLog');
  var entry = document.createElement('div');
  entry.className = 'log-entry';
  var ts = new Date();
  entry.textContent = ts.getHours().toString().padStart(2,'0')+':'+ts.getMinutes().toString().padStart(2,'0')+' '+msg;
  log.insertBefore(entry, log.firstChild);
  if(log.children.length > 50) log.removeChild(log.lastChild);
}

/* ── Reset ── */
function resetAll(){
  snapshotState();
  state.text = 'Hello World!';
  state.fontFamily = 'Arial';
  state.fontSize = 56;
  state.fontWeight = 'bold';
  state.letterSpacing = 4;
  state.col1 = '#ff0044';
  state.col2 = '#ffdd00';
  state.outlineColor = '#000000';
  state.outlineWidth = 2;
  state.depth = 10;
  state.gradDir = 'diag';
  state.curve = 'none';
  state.curvature = 0.5;
  state.amplitude = 40;
  state.rotationOffset = 0;
  state.coilRadius = 120;
  state.coilSweep = 180;
  state.animPreset = 'idle';
  state.speed = 1;
  state.waveFreq = 3;
  state.bounceHeight = 12;
  state.flickerIntensity = 0.15;
  state.glowEnabled = true;
  state.glowBlur = 15;
  state.glowAlpha = 0.25;
  state.particlesEnabled = false;
  state.particleType = 'stars';
  state.particleCount = 40;
  state.bgGridEnabled = false;
  state.scanlinesEnabled = false;
  state.bgColor = '#0a0a14';
  syncUI();
  initParticles(0);
  pushHistory('Reset');
}

/* ── Snapshots ── */
function takeSnapshot(){
  var offscreen = document.createElement('canvas');
  offscreen.width = 200;
  offscreen.height = 112;
  var octx = offscreen.getContext('2d');
  octx.drawImage(canvas, 0, 0, 200, 112);

  var container = document.getElementById('snapshotList');
  var item = document.createElement('div');
  item.className = 'snapshot-item';
  item.title = 'Snapshot';
  item.addEventListener('click', function(){
    // Just highlight; restoring full state would need saved config
  });
  item.appendChild(offscreen);
  container.insertBefore(item, container.firstChild);
  if(container.children.length > 12) container.removeChild(container.lastChild);
}

/* ── Particles ── */
function initParticles(count){
  particles = [];
  for(var i = 0; i < count; i++){
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 2.5 + 0.5,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

function drawParticles(time){
  if(!state.particlesEnabled) return;
  var W = canvas.width, H = canvas.height;

  for(var i = 0; i < particles.length; i++){
    var p = particles[i];
    p.phase += 0.02 * state.speed;

    if(state.particleType === 'snow'){
      p.vy = 0.5 + Math.sin(p.phase) * 0.3;
      p.vx = Math.sin(p.phase * 0.7) * 0.3;
      var col = 'rgba(200,230,255,' + (0.2 + Math.sin(p.phase)*0.15) + ')';
    } else if(state.particleType === 'embers'){
      p.vy = -1.2 - Math.random() * 0.5;
      p.vx = Math.sin(p.phase) * 0.4;
      col = 'rgba(255,' + Math.round(100+Math.sin(p.phase)*80) + ',0,' + (0.3 + Math.sin(p.phase)*0.2) + ')';
    } else if(state.particleType === 'dots'){
      p.vx = (Math.random()-0.5)*0.5;
      p.vy = (Math.random()-0.5)*0.5;
      col = 'rgba(138,180,248,' + (0.15 + Math.sin(p.phase)*0.1) + ')';
    } else { // stars
      p.vx = Math.sin(p.phase*0.3)*0.2;
      p.vy = Math.cos(p.phase*0.3)*0.2;
      col = 'rgba(255,255,255,' + (0.1 + Math.sin(p.phase)*0.25) + ')';
    }

    p.x += p.vx;
    p.y += p.vy;

    if(p.x < -10) p.x = W + 10;
    if(p.x > W + 10) p.x = -10;
    if(p.y < -10) p.y = H + 10;
    if(p.y > H + 10) p.y = -10;

    if(state.particleType === 'stars'){
      drawStar(ctx, p.x, p.y, 4, p.size, 2, col);
    } else {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

function drawStar(c, cx, cy, spikes, outerR, innerR, color){
  var rot = Math.PI / 2 * 3;
  var step = Math.PI / spikes;
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(cx, cy - outerR);
  for(var i = 0; i < spikes; i++){
    c.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    c.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  c.closePath();
  c.fill();
}

/* ── Resize ── */
function resize(){
  var stage = document.getElementById('stage');
  canvas.width = stage.clientWidth;
  canvas.height = stage.clientHeight;
}

/* ── Render helpers ── */
function shadeColor(hex, amt){
  var n = parseInt(hex.slice(1), 16);
  var r = Math.min(255, Math.max(0, (n >> 16) + amt));
  var g = Math.min(255, Math.max(0, ((n >> 8) & 0xFF) + amt));
  var b = Math.min(255, Math.max(0, (n & 0xFF) + amt));
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

function hsl(h,s,l){ return 'hsl('+h+','+s+'%,'+l+'%)'; }

/* ── Core WordArt ── */
function renderWordArt(time){
  var W = canvas.width, H = canvas.height;
  var txt = state.text;
  var fs = state.fontSize;
  var ch = txt.split('');

  ctx.font = state.fontWeight + ' ' + fs + 'px "' + state.fontFamily + '"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  var wid = ch.map(function(d){ return ctx.measureText(d).width; });
  var totalW = 0;
  for(var j = 0; j < wid.length; j++) totalW += wid[j];
  totalW += state.letterSpacing * Math.max(0, ch.length - 1);

  var gradShift = (time * 0.08 * state.speed) % 1;

  // Animate colors for rainbow mode
  var c1 = state.col1, c2 = state.col2;
  if(state.animPreset === 'rainbow'){
    var h1 = (time * 80 * state.speed) % 360;
    var h2 = (h1 + 180) % 360;
    c1 = hsl(h1, 100, 55);
    c2 = hsl(h2, 100, 55);
  }

  // Flicker multiplier
  var flickMul = 1;
  if(state.animPreset === 'flicker'){
    flickMul = 0.8 + Math.sin(time * 12) * state.flickerIntensity + Math.sin(time * 7.3) * state.flickerIntensity;
  }

  // Shake offset
  var shakeX = 0, shakeY = 0;
  if(state.animPreset === 'shake'){
    shakeX = Math.sin(time * 15 * state.speed) * 3;
    shakeY = Math.cos(time * 13 * state.speed) * 2;
  }

  // Glitch offset
  var glitchX = 0;
  if(state.animPreset === 'glitch'){
    if(Math.sin(time * 25) > 0.95) glitchX = (Math.random() - 0.5) * 20;
  }

  // Spin rotation
  var spinRot = 0;
  if(state.animPreset === 'spin' && state.curve === 'coil'){
    spinRot = time * 0.3 * state.speed;
  }

  // Coil animation
  var coilRotBase = 0;
  if(state.curve === 'coil' && state.animPreset !== 'spin'){
    coilRotBase = time * 0.15 * state.speed;
  }

  for(var i = 0; i < ch.length; i++){
    var px, py, ang = 0;
    var t = (i + 0.5) / ch.length;
    var rotDeg = state.rotationOffset * Math.PI / 180;

    switch(state.curve){
      case 'none': {
        var rx = W/2 - totalW/2;
        px = rx + wid[i]/2;
        for(var jj = 0; jj < i; jj++) rx += wid[jj] + state.letterSpacing;
        px = rx + wid[i]/2;
        py = H/2;
        if(state.animPreset === 'bounce'){
          py -= Math.abs(Math.sin(time * 2 * state.speed + i * 0.4)) * state.bounceHeight;
        }
        if(state.animPreset === 'pulse'){
          ang = Math.sin(time * 3 * state.speed + i * 0.3) * 0.05;
        }
        break;
      }
      case 'arch': {
        var ca = state.curvature;
        var amp = state.amplitude;
        ang = -Math.sin(t * Math.PI) * ca + rotDeg;
        px = W/2 + (i - (ch.length-1)/2) * (wid[i]*0.6 + state.letterSpacing*0.6);
        py = H/2 - Math.sin(t * Math.PI) * amp;
        break;
      }
      case 'arc': {
        ang = Math.sin(t * Math.PI) * state.curvature + rotDeg;
        px = W/2 + (i - (ch.length-1)/2) * (wid[i]*0.6 + state.letterSpacing*0.6);
        py = H/2 + Math.sin(t * Math.PI) * state.amplitude;
        break;
      }
      case 'wave': {
        var wspeed = state.speed;
        ang = Math.sin(t * Math.PI * state.waveFreq + time * wspeed * 2) * state.curvature;
        px = W/2 + (i - (ch.length-1)/2) * (wid[i]*0.6 + state.letterSpacing*0.6);
        py = H/2 + Math.sin(t * Math.PI * state.waveFreq + time * wspeed * 2) * state.amplitude;
        break;
      }
      case 'slant': {
        ang = 0.25 + rotDeg;
        px = W/2 + (i - (ch.length-1)/2) * (wid[i]*0.6 + state.letterSpacing*0.6);
        py = H/2 + (i - (ch.length-1)/2) * 8;
        break;
      }
      case 'coil': {
        var rad = state.coilRadius;
        var sa = Math.PI + coilRotBase;
        var sw = state.coilSweep * Math.PI / 180;
        var a = sa + t * sw + spinRot;
        px = W/2 + Math.cos(a) * rad;
        py = H/2 + Math.sin(a) * rad;
        ang = a + Math.PI/2;
        break;
      }
      case 'bounce': {
        var rb = W/2 - totalW/2;
        px = rb + wid[i]/2;
        for(var kb = 0; kb < i; kb++) rb += wid[kb] + state.letterSpacing;
        px = rb + wid[i]/2;
        py = H/2 - Math.abs(Math.sin(time * 2 * state.speed + i * 0.4)) * state.bounceHeight;
        break;
      }
      case 'pulse': {
        var rp = W/2 - totalW/2;
        px = rp + wid[i]/2;
        for(var kp = 0; kp < i; kp++) rp += wid[kp] + state.letterSpacing;
        px = rp + wid[i]/2;
        py = H/2;
        ang = Math.sin(time * 3 * state.speed + i * 0.3) * 0.05;
        break;
      }
      case 'shake': {
        var rs = W/2 - totalW/2;
        px = rs + wid[i]/2;
        for(var ks = 0; ks < i; ks++) rs += wid[ks] + state.letterSpacing;
        px = rs + wid[i]/2 + (Math.random()-0.5)*4;
        py = H/2 + (Math.random()-0.5)*3;
        break;
      }
      default: {
        var rn = W/2 - totalW/2;
        px = rn + wid[i]/2;
        for(var kn = 0; kn < i; kn++) rn += wid[kn] + state.letterSpacing;
        px = rn + wid[i]/2;
        py = H/2;
      }
    }

    px += shakeX + glitchX;
    py += shakeY;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(ang);

    // Extrusion shadow
    for(var s = state.depth; s >= 1; s--){
      ctx.fillStyle = shadeColor(state.outlineColor, -20 * (s / state.depth));
      ctx.fillText(ch[i], s, s);
    }

    // Gradient fill
    var grd;
    if(state.gradDir === 'radial'){
      grd = ctx.createRadialGradient(0, 0, 0, 0, 0, fs);
    } else if(state.gradDir === 'h'){
      grd = ctx.createLinearGradient(-fs, 0, fs, 0);
    } else if(state.gradDir === 'v'){
      grd = ctx.createLinearGradient(0, -fs, 0, fs);
    } else {
      grd = ctx.createLinearGradient(-fs, -fs, fs, fs);
    }
    grd.addColorStop(((0 + gradShift) % 1 + 1) % 1, c1);
    grd.addColorStop(1, c2);
    ctx.fillStyle = grd;
    ctx.fillText(ch[i], 0, 0);

    // Outline
    if(state.outlineWidth > 0){
      ctx.strokeStyle = state.outlineColor;
      ctx.lineWidth = state.outlineWidth;
      ctx.strokeText(ch[i], 0, 0);
    }

    ctx.restore();
  }

  // Glow pass
  if(state.glowEnabled && state.glowBlur > 0){
    ctx.save();
    ctx.filter = 'blur(' + state.glowBlur + 'px)';
    ctx.globalAlpha = state.glowAlpha * flickMul;
    redrawAll(ctx, ch, wid, totalW, time, c1, c2, gradShift, 0);
    ctx.restore();
  }
}

// Helper to redraw all glyphs (used for glow pass)
function redrawAll(c, ch, wid, totalW, time, c1, c2, gradShift, _unused){
  c.font = state.fontWeight + ' ' + state.fontSize + 'px "' + state.fontFamily + '"';
  c.textAlign = 'center';
  c.textBaseline = 'middle';

  for(var i = 0; i < ch.length; i++){
    var px, py, ang = 0;
    var t = (i + 0.5) / ch.length;
    var W = canvas.width, H = canvas.height;

    switch(state.curve){
      case 'none': {
        var rx = W/2 - totalW/2;
        px = rx + wid[i]/2;
        for(var jj = 0; jj < i; jj++) rx += wid[jj] + state.letterSpacing;
        px = rx + wid[i]/2;
        py = H/2;
        break;
      }
      case 'arch': {
        ang = -Math.sin(t*Math.PI)*state.curvature;
        px = W/2+(i-(ch.length-1)/2)*(wid[i]*0.6+state.letterSpacing*0.6);
        py = H/2-Math.sin(t*Math.PI)*state.amplitude;
        break;
      }
      case 'wave': {
        ang = Math.sin(t*Math.PI*state.waveFreq+time*state.speed*2)*state.curvature;
        px = W/2+(i-(ch.length-1)/2)*(wid[i]*0.6+state.letterSpacing*0.6);
        py = H/2+Math.sin(t*Math.PI*state.waveFreq+time*state.speed*2)*state.amplitude;
        break;
      }
      case 'coil': {
        var rad = state.coilRadius;
        var sa = Math.PI;
        var sw = state.coilSweep*Math.PI/180;
        var a = sa+t*sw;
        px = W/2+Math.cos(a)*rad;
        py = H/2+Math.sin(a)*rad;
        ang = a+Math.PI/2;
        break;
      }
      case 'bounce': {
        var rb = W/2-totalW/2;
        px = rb+wid[i]/2;
        for(var kb=0;kb<i;kb++) rb+=wid[kb]+state.letterSpacing;
        px = rb+wid[i]/2;
        py = H/2-Math.abs(Math.sin(time*2*state.speed+i*0.4))*state.bounceHeight;
        break;
      }
      case 'pulse': {
        var rp = W/2-totalW/2;
        px = rp+wid[i]/2;
        for(var kp=0;kp<i;kp++) rp+=wid[kp]+state.letterSpacing;
        px = rp+wid[i]/2;
        py = H/2;
        ang = Math.sin(time*3*state.speed+i*0.3)*0.05;
        break;
      }
      default: {
        var rn = W/2-totalW/2;
        px = rn+wid[i]/2;
        for(var kn=0;kn<i;kn++) rn+=wid[kn]+state.letterSpacing;
        px = rn+wid[i]/2;
        py = H/2;
      }
    }

    c.save();
    c.translate(px, py);
    c.rotate(ang);

    var grd;
    if(state.gradDir==='h') grd=c.createLinearGradient(-state.fontSize,0,state.fontSize,0);
    else if(state.gradDir==='v') grd=c.createLinearGradient(0,-state.fontSize,0,state.fontSize);
    else if(state.gradDir==='radial') grd=c.createRadialGradient(0,0,0,0,0,state.fontSize);
    else grd=c.createLinearGradient(-state.fontSize,-state.fontSize,state.fontSize,state.fontSize);
    grd.addColorStop(0,c1);
    grd.addColorStop(1,c2);
    c.fillStyle=grd;
    c.fillText(ch[i],0,0);

    if(state.outlineWidth>0){
      c.strokeStyle=state.outlineColor;
      c.lineWidth=state.outlineWidth;
      c.strokeText(ch[i],0,0);
    }
    c.restore();
  }
}

/* ── Background ── */
function drawBackground(time){
  var W = canvas.width, H = canvas.height;

  // Base bg color - use preset-aware darkening
  var bg = state.bgColor;
  // Parse bg and darken slightly
  var r,g,b;
  try {
    var tmp = document.createElement('canvas').getContext('2d');
    tmp.fillStyle = bg;
    tmp.fillRect(0,0,1,1);
    var data = tmp.getImageData(0,0,1,1).data;
    r=data[0]; g=data[1]; b=data[2];
  } catch(e) { r=10; g=10; b=20; }

  var bgGrad = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2);
  bgGrad.addColorStop(0, 'rgb('+Math.round(r*1.2)+','+Math.round(g*1.2)+','+Math.round(b*1.2)+')');
  bgGrad.addColorStop(1, 'rgb('+Math.round(r*0.5)+','+Math.round(g*0.5)+','+Math.round(b*0.5)+')');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Grid
  if(state.bgGridEnabled){
    ctx.strokeStyle = 'rgba(255,0,255,0.08)';
    ctx.lineWidth = 1;
    var gridOff = (time * 15 * state.speed) % 12;
    for(var gx=0; gx<W; gx+=25){
      ctx.beginPath();
      ctx.moveTo(gx, H/2+10);
      ctx.lineTo(gx-(gx-W/2)*0.4, H);
      ctx.stroke();
    }
    for(var gy=H/2+10+gridOff; gy<H; gy+=12){
      ctx.beginPath();
      ctx.moveTo(0,gy); ctx.lineTo(W,gy);
      ctx.stroke();
    }
  }

  // Retro sun (when retro-ish)
  if(state.bgGridEnabled){
    var sunSize = 45 + Math.sin(time*2)*5;
    var sunG = ctx.createLinearGradient(W/2,H/2-sunSize,W/2,H/2);
    sunG.addColorStop(0,'#ff0080');
    sunG.addColorStop(1,'#ffdd00');
    ctx.fillStyle = sunG;
    ctx.beginPath();
    ctx.arc(W/2, H/2-20, sunSize, 0, Math.PI);
    ctx.fill();
    for(var sl=H/2-20; sl<H/2-20+sunSize; sl+=5){
      ctx.fillStyle='rgba(10,0,21,0.5)';
      ctx.fillRect(W/2-sunSize, sl, sunSize*2, 2);
    }
  }

  // Scanlines
  if(state.scanlinesEnabled){
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for(var sy=0; sy<H; sy+=3){
      ctx.fillRect(0, sy, W, 1);
    }
  }

  // Flash for impact/shake
  if(state.animPreset === 'shake'){
    var flashA = Math.max(0, Math.sin(time*4*state.speed)*0.04);
    ctx.fillStyle = 'rgba(255,255,255,'+flashA+')';
    ctx.fillRect(0,0,W,H);
  }
}

/* ── Animation Loop ── */
var startTime = performance.now();
var fpsCounter = { frames: 0, lastTime: 0 };

function loop(now){
  var elapsed = (now - startTime) / 1000;
  var time = elapsed;

  // FPS
  fpsCounter.frames++;
  if(now - fpsCounter.lastTime >= 1000){
    document.getElementById('infoFPS').textContent = fpsCounter.frames + ' FPS';
    document.getElementById('infoChars').textContent = state.text.length + ' chars';
    fpsCounter.frames = 0;
    fpsCounter.lastTime = now;
  }

  drawBackground(time);
  drawParticles(time);
  renderWordArt(time);

  requestAnimationFrame(loop);
}

/* ── Export / Download ── */
function downloadImage(){
  var format = document.getElementById('formatGroup').querySelector('.chip.selected').dataset.format;
  var scale = +document.getElementById('scaleGroup').querySelector('.chip.selected').dataset.scale;
  var bgMode = document.getElementById('bgModeGroup').querySelector('.chip.selected').dataset.bg;

  var mimeTypes = { png:'image/png', jpg:'image/jpeg', webp:'image/webp' };
  var ext = format === 'jpg' ? 'jpeg' : format;

  var offscreen = document.createElement('canvas');
  offscreen.width = canvas.width * scale;
  offscreen.height = canvas.height * scale;
  var octx = offscreen.getContext('2d');

  // Handle transparency
  if(bgMode === 'transparent'){
    // Draw only the text portion
    // For simplicity, we draw the current canvas
    octx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);
  } else if(bgMode === 'dark'){
    octx.fillStyle = '#0a0a14';
    octx.fillRect(0,0,offscreen.width,offscreen.height);
    octx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);
  } else if(bgMode === 'light'){
    octx.fillStyle = '#f0f0f0';
    octx.fillRect(0,0,offscreen.width,offscreen.height);
    octx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);
  } else {
    octx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);
  }

  var link = document.createElement('a');
  link.download = 'wordart.' + format;
  link.href = offscreen.toDataURL(mimeTypes[format], 0.95);
  link.click();

  document.getElementById('modalBackdrop').classList.remove('open');
  pushHistory('Export: ' + format.toUpperCase() + ' ' + scale + 'x');
}

/* ── Share ── */
function shareConfig(){
  var configStr = JSON.stringify(state);
  var encoded = btoa(unescape(encodeURIComponent(configStr)));
  var url = window.location.origin + window.location.pathname + '?c=' + encoded;
  document.getElementById('shareUrl').value = url;
  document.getElementById('shareModal').classList.add('open');
  pushHistory('Shared config');
}

function copyShareLink(){
  var ta = document.getElementById('shareUrl');
  ta.select();
  document.execCommand('copy');
  pushHistory('Copied link');
}

/* ── Restore from hash/params ── */
function restoreFromHash(){
  try {
    var params = new URLSearchParams(window.location.search);
    var c = params.get('c');
    if(c){
      var decoded = decodeURIComponent(escape(atob(c)));
      var parsed = JSON.parse(decoded);
      Object.assign(state, parsed);
      syncUI();
      initParticles(state.particleCount || 0);
      pushHistory('Loaded from URL');
    }
  } catch(e){
    console.warn('Could not parse config from URL:', e);
  }
}

})();
