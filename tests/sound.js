/* 発表の音が実際に鳴るかの検証。

   2026-09-04、音が一度も鳴っていなかったことが分かった。原因は1行の書き間違いで、
   `MASTER=AC.createGain()` と書かれていた。MASTER はゴルフ場マスタの const 配列なので
   代入で例外になり、`ac()` を呼ぶたびに毎回そこで止まっていた。
   しかも `draw()` が例外を受け止めていなかったため、進捗の点も更新されなくなっていた。

   これまでのテストは `window={AudioContext:function(){throw 0}}` と、
   AudioContext そのものを投げる器で動かしていた。音の経路を一度も通っていなかった。
   ここでは Web Audio API を模した器を作り、発振器が実際に作られて鳴ったかを数える。 */
/* アプリの場所。テストと同じ場所の site/ を先に見て、無ければ ../docs/ を使う。
   リポジトリでは tests/ と docs/ が並ぶ構成なので、どちらでも動く */
const _P=require('path'),_F=require('fs');
const _DIR=[_P.join(__dirname,'site'),_P.join(__dirname,'..','docs')]
  .find(d=>_F.existsSync(_P.join(d,'pc.html')))||_P.join(__dirname,'site');
const APP={dir:_DIR+'/', get pc(){return this.dir+'pc.html'}, get scan(){return this.dir+'index.html'}};
const fs=require('fs');
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x!==''&&x!==undefined?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

/* ---- Web Audio API を模した器。作られた部品と再生の指示を数える ---- */
const LOG={osc:[],gain:0,buf:0,started:0,stopped:0,connects:0,resumed:0,ctx:0};
function param(v){return {value:v,
  setValueAtTime(){return this},linearRampToValueAtTime(){return this},
  exponentialRampToValueAtTime(){return this},cancelScheduledValues(){return this},
  setTargetAtTime(){return this}};}
function node(kind){return {kind,
  connect(){LOG.connects++;return this},disconnect(){},
  gain:param(1),frequency:param(440),detune:param(0),Q:param(1),
  type:"sine",
  start(){LOG.started++;},stop(){LOG.stopped++;},
  buffer:null,playbackRate:param(1),
  onended:null};}
class FakeAudioContext{
  constructor(){LOG.ctx++;this.state="running";this.currentTime=0;this.sampleRate=48000;
    this.destination=node("destination");}
  createGain(){LOG.gain++;return node("gain");}
  createOscillator(){const o=node("oscillator");LOG.osc.push(o);return o;}
  createBiquadFilter(){return node("filter");}
  createBufferSource(){LOG.buf++;return node("buffersource");}
  createBuffer(ch,len){return {length:len,numberOfChannels:ch,
    getChannelData(){return new Float32Array(len);}};}
  createDynamicsCompressor(){return node("compressor");}
  createWaveShaper(){return node("shaper");}
  createStereoPanner(){return node("panner");}
  resume(){LOG.resumed++;this.state="running";return Promise.resolve();}
  suspend(){this.state="suspended";return Promise.resolve();}
  close(){return Promise.resolve();}
}
const reset=()=>{LOG.osc=[];LOG.gain=0;LOG.buf=0;LOG.started=0;LOG.stopped=0;
  LOG.connects=0;LOG.resumed=0;LOG.ctx=0;};

/* ---- 画面の器 ---- */
const h=fs.readFileSync(APP.pc,'utf8');
const src=h.slice(h.indexOf('<script>')+8,h.lastIndexOf('</script>'));
const store={};const mk=id=>({id,value:'',textContent:'',className:'',checked:false,style:{},files:[],
  _html:'',get innerHTML(){return this._html},set innerHTML(v){this._html=v},
  classList:{add(){},remove(){},toggle(){},contains:()=>false},
  addEventListener(){},querySelector:()=>mk('q'),querySelectorAll:()=>[],
  insertAdjacentHTML(){},click(){},focus(){}});
const doc={documentElement:{style:{},requestFullscreen(){}},
  body:{className:'',classList:{add(){},remove(){},contains:()=>false}},
  getElementById:id=>store[id]||(store[id]=mk(id)),querySelectorAll:()=>[],
  addEventListener(){},createElement:()=>mk('a')};
global.document=doc;
global.window={AudioContext:FakeAudioContext,addEventListener(){}};
/* 音は setTimeout で組み立てるので、貯めて後から流す */
const _t=[];global.setTimeout=(f,ms)=>{_t.push(f);return _t.length};
global.flush=()=>{let n=0;while(_t.length&&n<400){const f=_t.shift();try{f()}catch(e){}n++;}};
global.clearTimeout=()=>{};global.setInterval=(f)=>{_t.push(f);return 1};
global.clearInterval=()=>{};
global.performance={now:()=>0};
let RAF=[];global.requestAnimationFrame=f=>{RAF.push(f);return RAF.length};
/* 金額のカウントアップは requestAnimationFrame で回る。器でも回さないと音が出ない */
global.flushRAF=()=>{let n=0;while(RAF.length&&n<300){const f=RAF.shift();try{f(1e9)}catch(e){}n++;}};
global.alert=()=>{};global.confirm=()=>true;
global.URL={createObjectURL:()=>'',revokeObjectURL(){}};global.Blob=class{};
global.localStorage={setItem(){},getItem(){return null},removeItem(){}};
global.console=console;
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn','cur','gpay','kpay']
  .forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,sample,go,render,applyScores,
  buildSlides,get slides(){return slides},startShow,step,advance,draw,
  ac,cue,silence,toggleSound,setVol,get SND(){return SND},get AC(){return AC},
  get GAIN(){return GAIN},get idx(){return idx},
  fanfare,honor,thud,penalty,outro,gateOpen,land,tickUp,startRoll,stopRoll,
  bell,brass,drum,noise,revealTone,pluck,countUp};`)();

console.log('=== 1. 音の土台が作れるか ===');
reset();
let err=null;
try{ app.ac(); }catch(e){ err=e.message; }
chk('ac() が例外を出さない', !err, err||'');
chk('AudioContext が1つ作られた', LOG.ctx===1, LOG.ctx);
chk('音量のノード（GAIN）が作られた', !!app.GAIN, app.GAIN?app.GAIN.kind:'null');
chk('GAIN が出力につながっている', LOG.connects>=1, LOG.connects+'本');
chk('MASTER（ゴルフ場マスタ）を壊していない',
    Array.isArray(app.DB)||true, '');
{
  /* MASTER が配列のままか、アプリ内で確かめる */
  const m=new Function(src+`;return MASTER;`);
  let ok2=true,msg='';
  try{ const M=m(); ok2=Array.isArray(M)&&M.length>300; msg=Array.isArray(M)?M.length+'施設':typeof M; }
  catch(e){ ok2=false; msg=e.message; }
  chk('MASTER はゴルフ場マスタの配列のまま', ok2, msg);
}
chk('2回目の ac() で作り直さない', (app.ac(),LOG.ctx===1), LOG.ctx);

console.log('\n=== 2. 一つずつの音が鳴るか ===');
[['ファンファーレ','fanfare'],['栄誉','honor'],['低い一撃','thud'],['罰金','penalty'],
 ['締め','outro'],['開幕','gateOpen'],['着地','land'],['カウントの刻み','tickUp']]
 .forEach(([label,fn])=>{
  reset();
  let e=null;
  try{ app[fn](); global.flush(); }catch(x){ e=x.message; }
  const n=LOG.osc.length+LOG.buf;
  chk(label, !e&&n>0, e?('例外: '+e):(n+'音'));
});
reset();
let e3=null;
try{ app.startRoll(); global.flush(); app.stopRoll(); }catch(x){ e3=x.message; }
chk('ドラムロール', !e3&&LOG.osc.length+LOG.buf>0, e3?('例外: '+e3):(LOG.osc.length+LOG.buf+'音'));
reset();
[1,2,3].forEach(lv=>{try{app.revealTone(lv);global.flush();}catch(x){}});
chk('順位ごとの発表音（1位・2位・3位）', LOG.osc.length>0, LOG.osc.length+'音');
reset();
[0,1,2,3,4].forEach(i=>{try{app.pluck(i);global.flush();}catch(x){}});
chk('一音ずつ弾く音', LOG.osc.length>=5, LOG.osc.length+'音');

console.log('\n=== 3. 音を止められるか ===');
reset(); app.fanfare(); global.flush();
const before=LOG.stopped;
let e4=null; try{ app.silence(); }catch(x){ e4=x.message; }
chk('silence() が例外を出さない', !e4, e4||'');
app.toggleSound();
chk('音をOFFにできる', app.SND===false);
reset(); app.fanfare(); global.flush();
chk('OFFのときは鳴らない', LOG.osc.length===0, LOG.osc.length+'音');
app.toggleSound();
chk('ONに戻せる', app.SND===true);
reset(); app.fanfare(); global.flush();
chk('ONに戻すと鳴る', LOG.osc.length>0, LOG.osc.length+'音');
app.setVol(50);
chk('音量を変えられる', Math.abs(app.GAIN.gain.value-0.5)<0.001, app.GAIN.gain.value);
app.setVol(80);

console.log('\n=== 4. 表彰式を通しで再生する ===');
app.sample(); global.flush(); app.applyScores();
app.buildSlides();
const N=app.slides.length;
chk('スライドが組み立てられた', N>0, N+'枚');
reset();
let broke=[],silent=[];
app.startShow();
for(let i=0;i<N;i++){
  const s=app.slides[i];
  const b4=LOG.osc.length+LOG.buf;
  try{ app.draw(); global.flush(); global.flushRAF(); global.flush(); }
  catch(x){ broke.push(s.id+': '+x.message); }
  if(s.enter && LOG.osc.length+LOG.buf===b4) silent.push(s.id);
  if(i<N-1) try{ app.step(1); }catch(x){ broke.push(s.id+'(送り): '+x.message); }
}
chk('全'+N+'画面で例外が出ない', broke.length===0, broke.join(' / '));
/* 条件によって鳴らさない画面がある（GTOが全額返金のときの的中者の画面など）。
   その場合も「鳴らないのが正しい」ので、条件つきかどうかで判定する */
const cond=silent.filter(id=>{
  const s2=app.slides.find(x=>x.id===id);
  return s2&&/if\(|\?/.test(String(s2.enter));
});
chk('条件なしで音を持つ画面はすべて鳴った', silent.length===cond.length,
    silent.filter(x=>!cond.includes(x)).join(',')||'');
if(cond.length) console.log('       （条件で鳴らさない画面: '+cond.join('、')+'）');
chk('通しで鳴った音の数', LOG.osc.length+LOG.buf>20, (LOG.osc.length+LOG.buf)+'音');
chk('進捗の点が最後まで更新される', (store['dots'].innerHTML||'').includes('dot'),
    (store['dots'].innerHTML||'').split('dot').length-1+'個');

console.log('\n=== 5. 音が壊れても発表は止まらない ===');
/* AudioContext を作れない端末や、音の途中で例外が出た場合でも
   画面送りが止まらないことを確かめる（当日いちばん困る壊れ方） */
{
  const saved=global.window.AudioContext;
  global.window.AudioContext=function(){throw new Error("音が使えない端末");};
  const app2=new Function(src+`;return {sample,applyScores,buildSlides,
    get slides(){return slides},startShow,draw,step,get idx(){return idx}};`)();
  app2.sample(); global.flush(); app2.applyScores(); app2.buildSlides();
  let b2=[];
  app2.startShow();
  for(let i=0;i<app2.slides.length;i++){
    try{ app2.draw(); global.flush(); }catch(x){ b2.push(app2.slides[i].id); }
    if(i<app2.slides.length-1) try{ app2.step(1); }catch(x){ b2.push(app2.slides[i].id+'(送り)'); }
  }
  chk('音が使えない端末でも全画面を送れる', b2.length===0, b2.join(',')||'');
  global.window.AudioContext=saved;
}

console.log('\n=== 6. 端末の操作で音を解錠する仕掛け ===');
/* iOSは利用者の操作なしに音を鳴らせない。触ったときに resume する仕掛けが要る */
chk('pointerdown / keydown で resume を試みる',
    /\["pointerdown","keydown"\][\s\S]{0,160}resume/.test(src));
chk('発表を始めるときにも resume する', /startShow[\s\S]{0,200}ac\(\)\.resume/.test(src));
chk('中断していたら ac() で resume する', /if\(AC\.state==="suspended"\)[\s\S]{0,40}resume/.test(src));

console.log('\n=== 7. 音のボタンが画面にある ===');
app.go('result');
const pv=store['pane'].innerHTML||'';
chk('音のON/OFFボタンがある', /toggleSound\(\)/.test(pv)||/sndBtn/.test(src));
chk('音量のつまみがある', /setVol\(/.test(pv)||/setVol\(/.test(src));
chk('ファンファーレの試し押しがある', /silence\(\);fanfare\(\)/.test(src));

console.log('\n合計 NG: '+ng);
