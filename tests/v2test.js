/* ゴルフコンペ総合運営システム v2 の通しテスト */
/* アプリの場所。テストと同じ場所の site/ を先に見て、無ければ ../docs/ を使う。
   リポジトリでは tests/ と docs/ が並ぶ構成なので、どちらでも動く */
const _P=require('path'),_F=require('fs');
const _DIR=[_P.join(__dirname,'site'),_P.join(__dirname,'..','docs')]
  .find(d=>_F.existsSync(_P.join(d,'pc.html')))||_P.join(__dirname,'site');
const APP={dir:_DIR+'/', get pc(){return this.dir+'pc.html'}, get scan(){return this.dir+'index.html'}};
const fs = require('fs');
const h = fs.readFileSync(APP.pc, 'utf8');
const src = h.slice(h.indexOf('<script>') + 8, h.lastIndexOf('</script>'));

const store = {};
const mk = id => ({
  id, value: '', textContent: '', className: '', checked: false, style: {}, files: [],
  _html: '', get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
  insertAdjacentHTML(_, s) { this._html = s + this._html; }, click() {}, focus() {}
});
const doc = {
  documentElement: { style: {}, requestFullscreen() {} },
  body: { className: '', classList: { add() {}, remove() {}, contains: c => doc.body.className.includes(c) } },
  getElementById: id => store[id] || (store[id] = mk(id)),
  querySelectorAll: () => [], addEventListener() {}, createElement: () => mk('a')
};
global.document = doc;
global.window = { AudioContext: function () { throw 0; }, addEventListener() {} };
const _t = [];
global.setTimeout = f => { _t.push(f); return _t.length; };
global.flush = () => { _t.splice(0).forEach(f => { try { f(); } catch (e) {} }); };
global.setInterval = () => 1; global.clearInterval = () => {}; global.clearTimeout = () => {};
global.performance = { now: () => 0 }; global.requestAnimationFrame = () => {};
global.alert = m => console.log('[alert]', m);
global.confirm = () => true;
global.URL = { createObjectURL: () => 'blob:', revokeObjectURL() {} };
global.Blob = class { constructor(a) { this.a = a; } };
global.FileReader = class { readAsText(f) { this.result = f._text; this.onload(); } };
const LSD = {};
global.localStorage = {
  _fail: false,
  setItem(k, v) { if (this._fail) throw 0; LSD[k] = String(v); },
  getItem(k) { if (this._fail) throw 0; return k in LSD ? LSD[k] : null; },
  removeItem(k) { delete LSD[k]; }
};
['show', 'hud', 'dots', 'tabs', 'saveState', 'hdTitle', 'pane', 'sndBtn', 'jsonFile', 'bulk',
 'ka_v', 'ka_a', 'ka_b', 'ka_q', 'ka_msg', 'ga_v', 'ga_1', 'ga_2', 'ga_3', 'ga_q', 'ga_msg',
 'r_t1', 'r_t2', 'r_fa', 'r_fb', 'r_l1', 'r_l2', 'r_l3', 'slideCt']
  .forEach(id => { global[id] = doc.getElementById(id); });

const app = new Function(src + `
  ;return {DB:()=>DB,setDB:d=>{DB=d},blank,migrate,calcK,calcG,calcB,votes,ledger,
    kAdd,gAdd,pAdd,bulkPreview,bulkApply,pEdit,pMove,pSort,gAuto,gAddGroup,gpStart,gpDrop,prizeSet,
    buildSlides,render,go,sample,touch,tabList,
    RUN,VOT,FRAMES,inGroup,standings,hcOf,grossOf,coursePar,applyScores,scoreOf,SCset,
    get slides(){return slides}, get LS_OK(){return LS_OK},skillRows,feeTotal,settle,prizeTotal,sampleHard,holeWarn,frameCheck,collectPlan,dayToggle,tabAll,hiddenTabs,get TAB(){return TAB},prizeRows,
    setPhase,PHASE,phOpen,useSet,flowSteps,nextStep,payToggle,get NEWTABS(){return NEWTABS},
    get FOLD(){return FOLD},payOnly,get PAYONLY(){return PAYONLY},yen,sideHtml,btmHtml,pageHead,resultText,copyResult,sideCount,foldSet,foldAll,foldOpen,goStep,netFix,scFocus,scoreCheck,tieWhy,SCset,BG,PZ,setLS:v=>{LS_OK=v},
    SD:()=>({paySettle:typeof paySettle==='function'?paySettle:null,payCover:typeof payCover==='function'?payCover:null,payWhy:typeof payWhy==='function'?payWhy:null,cancelOf:typeof cancelOf==='function'?cancelOf:null,cancelCard:typeof cancelCard==='function'?cancelCard:null,budget:typeof budget==='function'?budget:null,sideCount0:typeof sideCount0==='function'?sideCount0:null,scoreState:typeof scoreState==='function'?scoreState:null,scoreOf:typeof scoreOf==='function'?scoreOf:null}),
    SA:()=>({ncOf:typeof ncOf==='function'?ncOf:null,scoreState:typeof scoreState==='function'?scoreState:null,scSet:typeof scSet==='function'?scSet:null,scoreOf:typeof scoreOf==='function'?scoreOf:null,grossOf:typeof grossOf==='function'?grossOf:null,hcOf:typeof hcOf==='function'?hcOf:null,hcRaw:typeof hcRaw==='function'?hcRaw:null,hcCalc:typeof hcCalc==='function'?hcCalc:null,allSum:typeof allSum==='function'?allSum:null,standings:typeof standings==='function'?standings:null,RUN:typeof RUN==='function'?RUN:null,flowSteps:typeof flowSteps==='function'?flowSteps:null,m2Html:typeof m2Html==='function'?m2Html:null,scView:typeof scView==='function'?scView:null,SCset:typeof SCset==='function'?SCset:null,vHelp:typeof vHelp==='function'?vHelp:null}),
    S9:()=>({joinSet:typeof joinSet==='function'?joinSet:null,pExp:typeof pExp==='function'?pExp:null,pCards:typeof pCards==='function'?pCards:null,mstCount:typeof mstCount==='function'?mstCount:null,pAdd:typeof pAdd==='function'?pAdd:null,pMove:typeof pMove==='function'?pMove:null,pDel:typeof pDel==='function'?pDel:null,cAdd:typeof cAdd==='function'?cAdd:null,get PEXP(){return typeof PEXP==='undefined'?null:PEXP},setFILE:v=>{FILENAME=v}}),
    S8:()=>({mobHead:typeof mobHead==='function'?mobHead:null,goAll:typeof goAll==='function'?goAll:null,m2Fields:typeof m2Fields==='function'?m2Fields:null,m2Key:typeof m2Key==='function'?m2Key:null,m2Field:typeof m2Field==='function'?m2Field:null,m2Next:typeof m2Next==='function'?m2Next:null,m2Person:typeof m2Person==='function'?m2Person:null,scView:typeof scView==='function'?scView:null,m2Html:typeof m2Html==='function'?m2Html:null,scSet:typeof scSet==='function'?scSet:null,scoreOf:typeof scoreOf==='function'?scoreOf:null,get SCVIEW(){return typeof SCVIEW==='undefined'?null:SCVIEW},get M2(){return typeof M2==='undefined'?null:M2},get RKSORT(){return typeof RKSORT==='undefined'?null:RKSORT},setRK:v=>{if(typeof RKSORT!=='undefined')RKSORT=v},get PHOPEN(){return PHOPEN}}),
    S7:()=>({resultStale:typeof resultStale==='function'?resultStale:null,applyScores:typeof applyScores==='function'?applyScores:null,startShow:typeof startShow==='function'?startShow:null,backToWork:typeof backToWork==='function'?backToWork:null,draw:typeof draw==='function'?draw:null,step:typeof step==='function'?step:null,advance:typeof advance==='function'?advance:null,panelOpen:typeof panelOpen==='function'?panelOpen:null,panelPaint:typeof panelPaint==='function'?panelPaint:null,panelJump:typeof panelJump==='function'?panelJump:null,panelHtml:typeof panelHtml==='function'?panelHtml:null,slideFrame:typeof slideFrame==='function'?slideFrame:null,buildSlides:typeof buildSlides==='function'?buildSlides:null,silence:typeof silence==='function'?silence:null,toggleSound:typeof toggleSound==='function'?toggleSound:null,setVol:typeof setVol==='function'?setVol:null,get PANEL(){return typeof PANEL==='undefined'?undefined:PANEL},setPANEL:v=>{if(typeof PANEL!=='undefined')PANEL=v},get idx(){return idx},setIdx:v=>{idx=v},get SND(){return SND}}),
    S6:()=>({inFrame:typeof inFrame==='function'?inFrame:null,betsTab:typeof betsTab==='function'?betsTab:null,bFrame:typeof bFrame==='function'?bFrame:null,gPick:typeof gPick==='function'?gPick:null,bQty:typeof bQty==='function'?bQty:null,bClear:typeof bClear==='function'?bClear:null,betsClose:typeof betsClose==='function'?betsClose:null,betsWait:typeof betsWait==='function'?betsWait:null,kGrid:typeof kGrid==='function'?kGrid:null,kPaste:typeof kPaste==='function'?kPaste:null,kPasteApply:typeof kPasteApply==='function'?kPasteApply:null,gPaste:typeof gPaste==='function'?gPaste:null,gPasteApply:typeof gPasteApply==='function'?gPasteApply:null,kQ:typeof kQ==='function'?kQ:null,gQ:typeof gQ==='function'?gQ:null,kDel:typeof kDel==='function'?kDel:null,gDel:typeof gDel==='function'?gDel:null,votes:typeof votes==='function'?votes:null,get BTAB(){return typeof BTAB==='undefined'?null:BTAB},get BSEL(){return typeof BSEL==='undefined'?null:BSEL},get GSEL(){return typeof GSEL==='undefined'?null:GSEL},get BV(){return typeof BV==='undefined'?null:BV},get BQ(){return typeof BQ==='undefined'?null:BQ},get BPASTE(){return typeof BPASTE==='undefined'?null:BPASTE}}),
    S5:()=>({scKey:typeof scKey==='function'?scKey:null,showPlan:typeof showPlan==='function'?showPlan:null,scStatus:typeof scStatus==='function'?scStatus:null,prizeTotal:typeof prizeTotal==='function'?prizeTotal:null,feeTotal:typeof feeTotal==='function'?feeTotal:null,feeMembers:typeof feeMembers==='function'?feeMembers:null,buildSlides:typeof buildSlides==='function'?buildSlides:null,scSet:typeof scSet==='function'?scSet:null,scoreOf:typeof scoreOf==='function'?scoreOf:null,useSet:typeof useSet==='function'?useSet:null,prizeSet:typeof prizeSet==='function'?prizeSet:null}),
    S4:()=>({pColSet:typeof pColSet==='function'?pColSet:null,gPickI:typeof gPickI==='function'?gPickI:null,gMoveI:typeof gMoveI==='function'?gMoveI:null,gFill:typeof gFill==='function'?gFill:null,gTimeFill:typeof gTimeFill==='function'?gTimeFill:null,gStartSet:typeof gStartSet==='function'?gStartSet:null,tParse:typeof tParse==='function'?tParse:null,gSetG:typeof gSetG==='function'?gSetG:null,gTime:typeof gTime==='function'?gTime:null,lpStart:typeof lpStart==='function'?lpStart:null,lpMove:typeof lpMove==='function'?lpMove:null,lpEnd:typeof lpEnd==='function'?lpEnd:null,lpCancel:typeof lpCancel==='function'?lpCancel:null,gWait:typeof gWait==='function'?gWait:null,gpStart:typeof gpStart==='function'?gpStart:null,gpDrop:typeof gpDrop==='function'?gpDrop:null,cAdd:typeof cAdd==='function'?cAdd:null,joinSet:typeof joinSet==='function'?joinSet:null,vPlayers:typeof vPlayers==='function'?vPlayers:null,get PCOL(){return typeof PCOL==='undefined'?null:PCOL},get GPICK(){return typeof GPICK==='undefined'?null:GPICK},get LP(){return typeof LP==='undefined'?null:LP}}),
    /* 段階3で足した関数。前の版では無いので null にして、項目ごとに NG にする */
    S3:()=>({evDate:typeof evDate==='function'?evDate:null,dateJa:typeof dateJa==='function'?dateJa:null,daysLeft:typeof daysLeft==='function'?daysLeft:null,recentAdd:typeof recentAdd==='function'?recentAdd:null,recentList:typeof recentList==='function'?recentList:null,openPick:typeof openPick==='function'?openPick:null,newCompe:typeof newCompe==='function'?newCompe:null,copyRules:typeof copyRules==='function'?copyRules:null,copyPrev:typeof copyPrev==='function'?copyPrev:null,mkStep:typeof mkStep==='function'?mkStep:null,mkDone:typeof mkDone==='function'?mkDone:null,mkBare:typeof mkBare==='function'?mkBare:null,mkPlaceUse:typeof mkPlaceUse==='function'?mkPlaceUse:null,ruleOnN:typeof ruleOnN==='function'?ruleOnN:null,barHead:typeof barHead==='function'?barHead:null,holeApplyFit:typeof holeApplyFit==='function'?holeApplyFit:null,dlJson:typeof dlJson==='function'?dlJson:null,upJson:typeof upJson==='function'?upJson:null,hubStats:typeof hubStats==='function'?hubStats:null,paintSave:typeof paintSave==='function'?paintSave:null,get NOTE(){return typeof NOTE==='undefined'?null:NOTE},get MKSTEP(){return typeof MKSTEP==='undefined'?null:MKSTEP},get FILENAME(){return typeof FILENAME==='undefined'?null:FILENAME}}),};`)();

const ok = (l, c, x = '') => console.log((c ? '  OK  ' : '  NG  ') + l + (x ? '  ' + x : ''));
let ng = 0; const chk = (l, c, x) => { if (!c) ng++; ok(l, c, x); };

console.log('=== 1. 初期状態（空から始められるか）===');
chk('参加者0名', app.DB().players.length === 0);
/* 段階2（2026-09-17）で大会ハブ・順位・表彰・集金・結果共有・出力の4つを足して15。
   段階3で追加ルールを大会設定から独立させて16 */
chk('タブは16個', app.tabList().length === 16, app.tabList().map(t => t[1]).join('/'));
app.DB().meta.use.keiba = false; app.DB().meta.use.gto = false;
chk('馬券・GTOを切ると2タブ減る', app.tabList().length === 14, app.tabList().map(t => t[1]).join('/'));
app.DB().meta.use.keiba = true; app.DB().meta.use.gto = true;

console.log('\n=== 2. 参加者のまとめて追加 ===');
store['bulk'].value = '山田　太郎\n鈴木　一郎\t営業部\n佐々木　花子';
store['bulk'].value='山田　太郎\n鈴木　一郎\t営業部\n佐々木　花子';app.bulkPreview();app.bulkApply();
chk('3名追加', app.DB().players.length === 3);
chk('所属も取り込む', app.DB().players[1].org === '営業部', app.DB().players[1].org);

console.log('\n=== 3. サンプルで一括検証 ===');
app.sample(); global.flush();
const D = app.DB();
chk('16名', D.players.length === 16);
chk('4組（同じ時間に回る4名ずつ）', D.groups.length === 4, D.groups.length+'組');
chk('全員が組に入る', D.players.every(p => p.g > 0));
/* 組と枠は別物。枠は組をまたぎ、実力が拮抗するように割り振る */
chk('枠は組と一致しない（組をまたぐ）', D.players.some(p => +p.f !== +p.g));
chk('8枠', app.FRAMES().length === 8, app.FRAMES().join(','));
chk('1組4名', app.inGroup(1).length === 4, app.inGroup(1).length+'名');
const K = app.calcK(), G = app.calcG();
chk('馬券100口', K.units === 100, K.units + '口');
chk('GTO50口', G.units === 50, G.units + '口');
chk('回収 100×200+50×500 = 45,000円', K.sales + G.sales === 45000, K.sales + G.sales + '円');

console.log('\n=== 4. 重複は口数でまとまる ===');
/* サンプル①は予想を締め切った状態（段階6）。足すので解除しておく */
D.meta.betsClosed = false;
const before = app.DB().keiba.length;
store['ka_v'].value = D.players[0].n; store['ka_a'].value = '2'; store['ka_b'].value = '3'; store['ka_q'].value = '2';
app.kAdd();
store['ka_a'].value = '3'; store['ka_b'].value = '2'; store['ka_q'].value = '3'; app.kAdd();
const row = app.DB().keiba.find(r => r.v === D.players[0].n && r.a === 2 && r.b === 3);
chk('2-3 と 3-2 が1行', app.DB().keiba.length === before + 1, '行数 ' + before + '→' + app.DB().keiba.length);
chk('口数が合算', row.q === 5, 'q=' + row.q);

console.log('\n=== 5. 結果と罰金 ===');
const pop = Object.entries(app.DB().keiba.reduce((m, r) => {
  const k = Math.min(r.a, r.b) + '-' + Math.max(r.a, r.b); m[k] = (m[k] || 0) + r.q; return m; }, {}))
  .sort((a, b) => b[1] - a[1])[0];
app.DB().result.frame = pop[0];
console.log('  最多の買い目', pop[0], pop[1] + '口');
app.DB().result.low = [D.players[0].n, D.players[5].n, D.players[9].n];
D.players.forEach((p, i) => app.DB().result.gross[p.n] = 85 + (i * 4) % 34);
const K2 = app.calcK(), G2 = app.calcG(), B2 = app.calcB();
chk('馬券の配当が出る', K2.win > 0 && K2.pay > 0, K2.win + '口 / ' + K2.pay + '円');
chk('配当×口数 ≤ 売上', K2.pay * K2.win <= K2.sales);
chk('罰金の対象者が出る', B2.list.length > 0, B2.list.length + '名 / ' + B2.total + '円');
chk('選抜者3名', B2.sel.filter(Boolean).length === 3, B2.sel.join(' / '));
chk('選抜者は罰金対象外', !B2.list.some(x => B2.sel.includes(x.n)));
const L = app.ledger();
chk('精算の払戻合計が配当と一致',
  L.reduce((s, x) => s + x.back, 0) === K2.pay * K2.win + (G2.refund ? G2.refundTotal : G2.pay * G2.win));

console.log('\n=== 6. ニアピン・ドラコン ===');
app.prizeSet('near', 12, 'who', D.players[3].n);
app.prizeSet('near', 12, 'rec', '0.9m');
chk('受賞者を記録', app.DB().near.find(x => x.hole === 12).who === D.players[3].n);

console.log('\n=== 7. 発表画面（機能の入切で増減）===');
app.buildSlides();
const full = app.slides.length;
chk('全機能で' + full + '画面', full > 20, app.slides.map(s => s.id).join(','));
let e = 0; app.slides.forEach(s => { try { s.html(); } catch (x) { e++; console.log('  ★', s.id, x.message); } });
chk('全画面が描画できる', e === 0);
app.DB().meta.use = { score:false, keiba:false, gto:false, fine:false, near:true, nearAny:false, drako:false, prize:false, budget:false };
app.buildSlides();
chk('ニアピンだけなら減る', app.slides.length < full, app.slides.length + '画面');
e = 0; app.slides.forEach(s => { try { s.html(); } catch (x) { e++; } });
chk('その状態でも描画できる', e === 0);
app.DB().meta.use = { score:true, keiba:true, gto:true, fine:true, near:true, nearAny:true, drako:true, prize:true, budget:true };

console.log('\n=== 7.5 ダブルペリア集計 ===');
app.setDB(app.blank()); app.sample(); global.flush();
chk('コースパー72', app.coursePar() === 72, 'par=' + app.coursePar());
const st = app.standings();
chk('16名ぶん順位が出る', st.net.length === 16, st.net.length + '名');
const w = st.net[0];
chk('ネット＝グロス−HDCP', Math.abs((w.g - w.hc) - w.net) < 0.05,
    'グロス' + w.g + ' − HDCP' + w.hc + ' = ' + w.net);
chk('ネット順に並ぶ', st.net.every((r, i, a) => i === 0 || a[i - 1].net <= r.net));
chk('HDCPが上限30以内', st.rows.every(r => r.hc === null || (r.hc >= 0 && r.hc <= 30)),
    '最大 ' + Math.max(...st.rows.map(r => r.hc)));
/* 手計算で1名検証 */
const p0 = app.RUN()[0], sc0 = app.scoreOf(p0.n), M0 = app.DB().meta.sc;
let sum = 0; M0.hidden.slice(0, 12).forEach(hh => sum += Math.min(+sc0.h[hh], (M0.par[hh - 1]) * 3));
const manual = Math.min(30, Math.max(0, Math.round(((sum * 1.5 - 72) * 0.8) * 10) / 10));
chk('HDCPの手計算と一致', Math.abs(app.hcOf(p0) - manual) < 0.001,
    'アプリ ' + app.hcOf(p0) + ' / 手計算 ' + manual);
/* 新ペリアに切替 */
app.SCset('system', 'new'); app.SCset('hidden', [3, 6, 9, 12, 15, 18]);
const st2 = app.standings();
chk('新ペリアでも算出できる', st2.net.length === 16 && st2.net[0].hc !== null,
    'HDCP ' + st2.net[0].hc);
app.SCset('system', 'double'); app.SCset('hidden', [2,3,5,6,8,9,11,12,14,15,17,18]);
/* トリプルパーカット */
const hcCut = app.hcOf(p0);
app.SCset('cut', 'none');
chk('上限なしにするとHDCPが増える（か同じ）', app.hcOf(p0) >= hcCut,
    'カットあり ' + hcCut + ' → なし ' + app.hcOf(p0));
app.SCset('cut', 'triplePar');
/* 結果の自動反映 */
app.applyScores();
const R = app.DB().result;
chk('上位2名が入る', R.top2[0] === st.net[0].n && R.top2[1] === st.net[1].n, R.top2.join(' / '));
chk('当選枠が入る', /^\d+-\d+$/.test(R.frame), R.frame);
chk('GTOの下位3名が入る', R.low.filter(Boolean).length === 3, R.low.join(' / '));
chk('罰金用のグロスが全員入る', Object.keys(R.gross).length === 16);
chk('下位3名＝グロス最多3名', R.low[0] === st.worst3[0].n, R.low.join('/') + ' vs ' + st.worst3.map(r => r.n + '(' + r.g + ')').join('/'));

console.log('\n=== 7.6 何でもニアピンと表彰演出 ===');
chk('何でもニアピンが記録される', app.DB().nearAny.length > 0, JSON.stringify(app.DB().nearAny[0]));
app.buildSlides();
const ids = app.slides.map(s => s.id);
chk('何でもニアピンの画面がある', ids.some(x => x.startsWith('nearAny')), ids.filter(x => x.startsWith('nearAny')).join(','));
chk('順位発表の画面がある', ids.includes('s-1') && ids.includes('s-best'), ids.filter(x => x.startsWith('s-')).join(','));
let e2 = 0; app.slides.forEach(s => { try { s.html(); } catch (x) { e2++; console.log('  ★', s.id, x.message); } });
chk('全' + app.slides.length + '画面が描画できる', e2 === 0);

console.log('\n=== 8. 旧版データの移行 ===');
const v1 = {
  meta: { org: '旧コンペ', place: 'A CC', date: '2026.8.29', kPrice: 200, gPrice: 500, mode: '3連単' },
  roster: [{ f: 1, n: 'A　一郎', vote: true }, { f: 1, n: 'B　二郎', vote: true },
           { f: 2, n: 'C　三郎', vote: true }, { f: 0, n: 'D　四郎', vote: true }],
  keiba: [{ v: 'A　一郎', a: 1, b: 2, q: 5 }], gto: [{ v: 'A　一郎', p: ['A　一郎', 'B　二郎', 'C　三郎'], q: 2 }],
  result: { frame: '1-2', low: ['A　一郎', 'B　二郎', 'C　三郎'], gross: {}, sel: ['', '', ''] }
};
app.setDB(app.migrate(v1));
chk('大会名を引き継ぐ', app.DB().meta.name === '旧コンペ');
chk('参加者4名', app.DB().players.length === 4);
chk('出走3名・投票4名', app.RUN().length === 3 && app.VOT().length === 4);
chk('馬券5口が残る', app.calcK().units === 5);
chk('3連単を引き継ぐ', app.DB().meta.gMode === '3連単');

console.log('\n=== 9. 自動保存 ===');
chk('有効', app.LS_OK);
app.touch(); global.flush();
chk('保存される', !!LSD['golfCompe.autosave.v2']);
global.localStorage._fail = true;
let crash = false; try { app.touch(); global.flush(); } catch (x) { crash = true; }
chk('使えない環境でも落ちない', !crash);
global.localStorage._fail = false;

console.log('\n=== 10. 全タブ描画 ===');
e = 0;
app.setDB(app.blank()); app.sample(); global.flush();
app.tabList().forEach(([k]) => { try { app.go(k); } catch (x) { e++; console.log('  ★', k, x.message); } });
chk('全タブ描画', e === 0);

console.log('\n=== サンプルの大会が本番の稽古になっているか ===');
/* 2026-09-08、サンプルを本番と近い規模に作り直した。
   当日の予行演習に使うので、空欄が無く、順位も結果も確定していること。
   ここが崩れると「試したつもり」で本番を迎えることになる。 */
app.sample(); global.flush();
const SD=app.DB(), SK=app.calcK(), SG=app.calcG(), SS=app.standings();
console.log('  -- 規模 --');
chk('参加者16名・4組・8枠', SD.players.length===16&&SD.groups.length===4&&app.FRAMES().length===8,
    `${SD.players.length}名 ${SD.groups.length}組 ${app.FRAMES().length}枠`);
/* 組は同じ時間に回る4名、枠は馬券の賭け単位で2名。別物であることを固定する */
chk('1組4名ずつ', SD.groups.every(g=>SD.players.filter(p=>+p.g===g.no).length===4),
    SD.groups.map(g=>SD.players.filter(p=>+p.g===g.no).length).join('/'));
chk('1枠2名ずつ', app.FRAMES().every(f=>SD.players.filter(p=>+p.f===f).length===2),
    app.FRAMES().map(f=>SD.players.filter(p=>+p.f===f).length).join('/'));
{
  const FC2=app.frameCheck();
  chk('すべての枠が組をまたぐ', FC2.sameGroup===0, FC2.sameGroup+'つが同じ組どうし');
  chk('実力が拮抗している（合計の差が10以内）', FC2.spread!==null&&FC2.spread<=10,
      '差 '+FC2.spread);
  const top2=SS.net.slice(0,2).map(r=>+SD.players.find(p=>p.n===r.n).f);
  chk('ネット上位2名が別の枠にいる', top2[0]!==top2[1], top2.join('-')+'枠');
}
chk('馬券100口（本番95口と同じ）', SK.units===100, SK.units+'口');
chk('GTO50口（本番34口と同じ桁）', SG.units===50, SG.units+'口');
chk('無効の口はゼロ', SK.badUnits===0&&SG.badUnits===0, `馬券${SK.badUnits} GTO${SG.badUnits}`);
console.log('  -- 順位が確定している --');
chk('16名すべてグロスが入っている', SS.rows.every(r=>r.g!==null), SS.rows.filter(r=>r.g===null).length+'名が未入力');
chk('16名すべてネットが出ている', SS.net.length===16, SS.net.length+'名');
chk('ネットに同点が無い', new Set(SS.net.map(r=>r.net)).size===16,
    (16-new Set(SS.net.map(r=>r.net)).size)+'組が同点');
chk('グロスにも同点が無い', new Set(SS.rows.map(r=>r.g)).size===16,
    (16-new Set(SS.rows.map(r=>r.g)).size)+'組が同点');
chk('18ホールすべて埋まっている',
    SD.players.every(p=>{const s=app.scoreOf(p.n);
      return SD.meta.sc.par.every((_,k)=>+s.h[k+1]>0);}));
console.log('  -- 予想の結果が出ている --');
chk('当選枠が決まっている', /^\d+-\d+$/.test(SD.result.frame), SD.result.frame);
chk('馬券に的中口がある', SK.win>0, SK.win+'口 → '+SK.pay+'円/口');
chk('配当が100円未満切り捨て', SK.pay%100===0, SK.pay+'円');
chk('下位3名が決まっている', SD.result.low.filter(Boolean).length===3, SD.result.low.join(' / '));
chk('GTOにも的中口がある（全額返金にならない）', SG.win>0&&!SG.refund, SG.win+'口 → '+SG.pay+'円/口');
console.log('  -- 技能賞に空欄が無い --');
app.skillRows().forEach(r=>chk(r.label+' が全ホール埋まっている', r.wonN===r.n, `${r.wonN}/${r.n}ホール`));
chk('記録もすべて入っている',
    [...SD.near,...SD.nearAny,...SD.drako].every(x=>x.who&&x.rec),
    [...SD.near,...SD.nearAny,...SD.drako].filter(x=>!x.who||!x.rec).length+'件が空欄');
console.log('  -- 罰金が発生する --');
const SB=app.calcB();
chk('選抜者が3名決まっている', SB.sel.filter(Boolean).length===3, SB.sel.join(' / '));
/* 選抜者がグロス下位3名と一致すると罰金が0円になり、計算の確かめにならない */
chk('選抜者と下位3名が完全一致していない',
    SB.sel.join('|')!==SS.worst3.map(r=>r.n).join('|'),
    '選抜 '+SB.sel.join('/')+' ／ 下位 '+SS.worst3.map(r=>r.n).join('/'));
chk('罰金の対象者がいる', SB.list.length>0, SB.list.length+'名 計'+SB.total+'円');
chk('得票が並んでいない（手動指定が要らない）', !SB.tie);
console.log('  -- 収支が組める --');
chk('会費 6,000×16＝96,000円', app.feeTotal()===96000, app.feeTotal());
{
  const S2=app.settle(), playAll=S2.reduce((a,b)=>a+(b.play||0),0);
  chk('徴収合計＝プレー代＋会費＋馬券＋GTO',
      S2.reduce((a,b)=>a+b.bill,0)===playAll+96000+SK.sales+SG.sales,
      `プレー代${playAll} ＋会費96000 ＋馬券${SK.sales} ＋GTO${SG.sales} = ${S2.reduce((a,b)=>a+b.bill,0)}円`);
  chk('事前の見積りと当日の徴収がほぼ合う',
      Math.abs(S2.reduce((a,b)=>a+b.bill,0)-app.collectPlan().total)<=16,
      '徴収'+S2.reduce((a,b)=>a+b.bill,0)+' / 見積り'+app.collectPlan().total);
}
chk('賞金の総額が出る', app.prizeTotal().all>0, app.prizeTotal().all+'円');

console.log('\n=== サンプル②　つまずきやすい大会 ===');
/* 当日いちばん迷うのは、決まりきらない場面。同点・同票・欠席・無効・
   該当者なし・ノーカードを一度に起こし、アプリがどう出るかを事前に見る。
   ここが崩れると「難しい場面を試していない」まま本番を迎える（2026-09-08）。 */
app.sampleHard(); global.flush();
const HD=app.DB(), HK=app.calcK(), HG=app.calcG(), HS=app.standings(), HB=app.calcB();
chk('①と同じ16名を使う', HD.players.length===16, HD.players.length+'名');
chk('大会名で見分けられる', /つまずきやすい/.test(HD.meta.name), HD.meta.name);
console.log('  -- 欠席とノーカード --');
const abs2=HD.players.filter(p=>!p.f);
chk('欠席者が2名いる（組が未定）', abs2.length===2, abs2.map(p=>p.n).join('、'));
const ncs=HD.players.filter(p=>{const x=HD.scores[p.n];return x&&x.gross==='';});
chk('ノーカードが1名いる（グロス空欄）', ncs.length===1, ncs.map(p=>p.n).join('、'));
chk('順位に出るのは13名（欠席2＋ノーカード1を除く）', HS.net.length===13, HS.net.length+'名');
chk('ノーカードは順位に出ない', !HS.net.some(r=>r.n===ncs[0].n));
chk('ノーカードは下位3名にも入らない', !HS.worst3.some(r=>r.n===ncs[0].n),
    HS.worst3.map(r=>r.n).join('/'));
console.log('  -- 同点 --');
const nc2={}; HS.net.forEach(r=>nc2[r.net]=(nc2[r.net]||0)+1);
chk('ネットに同点がある（年長者で決まる）',
    Object.values(nc2).some(v=>v>1),
    Object.entries(nc2).filter(([k,v])=>v>1).map(([k,v])=>k+'が'+v+'名').join(' / ')||'なし');
const gc2={}; HS.rows.forEach(r=>{if(r.g!==null)gc2[r.g]=(gc2[r.g]||0)+1;});
chk('グロスにも同点がある（下位3名の並びが揺れる）',
    Object.values(gc2).some(v=>v>1),
    Object.entries(gc2).filter(([k,v])=>v>1).map(([k,v])=>k+'が'+v+'名').join(' / ')||'なし');
console.log('  -- 選抜者の得票が並ぶ --');
chk('得票が並んでいる（手動指定が必要）', HB.tie===true, HB.tie?'同票あり':'同票なし');
chk('選抜者にノーカードが入らない', !HB.sel.includes(ncs[0].n), HB.sel.join('/'));
console.log('  -- 無効になる口が3種そろう --');
chk('馬券に無効口がある（無くなった枠）', HK.badUnits>0, HK.badUnits+'口');
chk('GTOに無効口がある', HG.badUnits>0, HG.badUnits+'口');
const why=[...HK.bad,...HG.bad].map(r=>r.why);
chk('無くなった枠を指名した口', why.some(w=>/無くなった枠/.test(w)));
chk('出走しない方を指名した口', why.some(w=>/出走しない方/.test(w)));
chk('同じ人を2回指名した口', why.some(w=>/同じ人を2回/.test(w)));
chk('掛金が返る', HK.badTotal+HG.badTotal>0, (HK.badTotal+HG.badTotal)+'円');
console.log('  -- 技能賞に該当者のいないホール --');
const sr2=app.skillRows();
chk('該当者のいないホールがある', sr2.some(r=>r.wonN<r.n),
    sr2.map(r=>r.label+' '+r.wonN+'/'+r.n).join(' '));
chk('用意する賞金と実際に出る賞金がずれる',
    sr2.reduce((a,b)=>a+b.total,0)>sr2.reduce((a,b)=>a+b.wonTotal,0),
    sr2.reduce((a,b)=>a+b.total,0)+'円 → '+sr2.reduce((a,b)=>a+b.wonTotal,0)+'円');
console.log('  -- 対象ホールの警告が出る --');
chk('パーと噛み合わない設定になっている', app.holeWarn().length>0,
    app.holeWarn().map(w=>w.label).join('、')||'警告なし');

console.log('\n=== 発表で空白を出さない ===');
/* 受賞者のいないホールや、氏名の入っていない順位を発表すると場が止まる。
   読み上げる相手がいる画面だけを出す（2026-09-08） */
app.buildSlides();
let blank=[];
app.slides.forEach(s=>{try{
  const x=s.html();
  if(/該当なし|未設定|>—</.test(x)) blank.push(s.id);
}catch(e){blank.push(s.id+'(例外)');}});
chk('空白の画面が1枚も無い', blank.length===0, blank.join(', ')||'なし');
const ids2=app.slides.map(s=>s.id);
chk('受賞者のいないニアピンのホールは出さない', !ids2.includes('near7')&&!ids2.includes('near16'),
    ids2.filter(x=>x.startsWith('near')).join(','));
chk('受賞者のいるホールは出す', ids2.includes('near3')&&ids2.includes('near11'));
/* サンプル②はドラコンの受賞者が0名。見出しごと出さない */
chk('受賞者が1人もいない種目は幕ごと出さない', ids2.filter(x=>x.startsWith('drako')).length===0,
    ids2.filter(x=>x.startsWith('drako')).join(',')||'出さない');
chk('全'+app.slides.length+'画面が描画できる', blank.length===0);
console.log('  -- ①では空白が出ないことも確かめる --');
app.sample(); global.flush(); app.buildSlides();
let blank1=[];
app.slides.forEach(s=>{try{if(/該当なし|未設定|>—</.test(s.html()))blank1.push(s.id);}catch(e){blank1.push(s.id);}});
chk('①も空白なし', blank1.length===0, blank1.join(', ')||'なし');
chk('①は技能賞8ホールすべて出る',
    app.slides.filter(s=>/^(near|nearAny|drako)\d+$/.test(s.id)).length===8,
    app.slides.filter(s=>/^(near|nearAny|drako)\d+$/.test(s.id)).length+'枚');

console.log('\n=== 発表の並びが理にかなっているか ===');
/* 2026-09-08まで「馬券 → 順位発表」の順だった。
   馬券の当選枠はネット上位2名が入る枠なので、先に出すと優勝者が割れる。
   実際「上位2名」の画面で優勝者と2位の氏名が出たあとに、
   第3位→第2位→優勝と発表していた。答え合わせになってしまう。
   予想ゲームは順位が確定してからの精算なので、後に置くのが筋。 */
app.sample(); global.flush(); app.buildSlides();
const ORD=app.slides.map(s=>s.id);
const at=id=>ORD.indexOf(id);
chk('優勝の発表が、馬券の上位2名より前にある', at('s-1')<at('k-top'),
    `優勝${at('s-1')+1}枚目 / 馬券の上位2名${at('k-top')+1}枚目`);
/* 予想ゲームの中では馬券を先に出す。馬券は上位2名（明るい話）、
   GTOは下位3名（落ちの話）なので、この順のほうが流れが自然（2026-09-08） */
chk('馬券がGTOより前にある', at('k-act')<at('g-mode'),
    `馬券${at('k-act')+1}枚目 / GTO${at('g-mode')+1}枚目`);
chk('馬券にも幕の見出しがある', at('k-act')>=0);
chk('優勝の発表が、馬券の当選枠より前にある', at('s-1')<at('k-draw'),
    `優勝${at('s-1')+1}枚目 / 当選枠${at('k-draw')+1}枚目`);
chk('技能賞は競技結果より前（軽い賞から重い賞へ）', at('near-in')<at('s-in'));
chk('ベスグロ→3位→2位→優勝の順', at('s-best')<at('s-3')&&at('s-3')<at('s-2')&&at('s-2')<at('s-1'));
chk('予想ゲームは優勝発表より後（精算だから）', at('k-act')>at('s-1'),
    `馬券${at('k-act')+1}枚目 / 優勝${at('s-1')+1}枚目`);
chk('罰金は選抜者の後', at('b-fine')>at('b-sel'));
chk('抽選と締めが最後', at('lucky')===ORD.length-2&&at('end')===ORD.length-1);
console.log('  -- 幕番号が通し番号で振られる --');
const acts=app.slides.map(s=>{try{return (s.html().match(/第 (\d+) 幕/)||[])[1];}catch(e){return null;}})
  .filter(Boolean).map(Number);
chk('幕番号が1から順に飛ばず並ぶ', acts.every((v,i)=>v===i+1), acts.join(','));
console.log('  -- 使わない機能を外しても番号が飛ばない --');
{
  const D=app.DB(); D.meta.use.keiba=false; D.meta.use.fine=false;
  app.buildSlides();
  const a2=app.slides.map(s=>{try{return (s.html().match(/第 (\d+) 幕/)||[])[1];}catch(e){return null;}})
    .filter(Boolean).map(Number);
  chk('馬券と罰金を外しても幕番号が1から順', a2.every((v,i)=>v===i+1), a2.join(','));
  chk('馬券の画面が消える', !app.slides.some(s=>s.id.startsWith('k-')));
  D.meta.use.keiba=true; D.meta.use.fine=true;
}

console.log('\n=== 準備 → 当日 → 発表 ===');
/* 11本のタブを使う時期で3段階に束ねる（2026-09-16、デザイン案の取り込み）。
   前の段階は1行に畳む。消さない。押せば開く。
   以前の「当日モード」（2026-09-08）はこの中の「当日」にあたる。
   当日は準備のタブを触らない（触ると壊しかねない）ので、畳む範囲は変わらない。 */
app.sample(); global.flush();
{
  const pane=()=>store['pane'].innerHTML, tabs=()=>store['tabs'].innerHTML;
  console.log('  -- 既定は準備 --');
  chk('既定は準備', app.PHASE()==='prep', app.PHASE());
  chk('既定では全タブ出る', app.tabList().length===app.tabAll().length,
      app.tabList().length+' / '+app.tabAll().length);
  chk('畳んでいるタブは無い', app.hiddenTabs().length===0);
  app.go('meta');
  chk('タブ列に3つの段階の見出し', /1 ／ 準備 ・ NOW/.test(tabs())&&/2 ／ 当日/.test(tabs())&&/3 ／ 発表/.test(tabs()));
  chk('段階の順にタブが並ぶ（集金→スコア→技能賞）',
      /go\('hub'\)[\s\S]*go\('groups'\)[\s\S]*go\('bets'\)[\s\S]*go\('money'\)[\s\S]*go\('collect'\)[\s\S]*go\('score'\)[\s\S]*go\('prize'\)[\s\S]*go\('rank'\)[\s\S]*go\('result'\)[\s\S]*go\('share'\)/.test(tabs()));
  chk('ヘッダーに3つの切替', ['準備中','当日','発表'].every(l=>store['dayBtn'].innerHTML.includes('>'+l+'</button>')));
  chk('いまの段階が押された状態', /class="on" aria-pressed="true"\s*onclick="setPhase\('prep'\)"/.test(store['dayBtn'].innerHTML));

  console.log('  -- 当日にする --');
  app.setPhase('day');
  chk('タブが16から10に減る', app.tabList().length===10, app.tabList().length+'個');
  /* 賞金・収支は金額を決める画面なので準備に入る（当日の集金は「集金」画面） */
  chk('準備の6タブが畳まれる',
      app.hiddenTabs().map(x=>x[1]).join('/')==='大会設定/追加ルール/参加者/組み合わせ/予想入力/賞金・収支',
      app.hiddenTabs().map(x=>x[1]).join('/'));
  chk('当日に使うタブは残る（大会ハブも）',
      ['hub','collect','score','prize','rank','sum','result','share','data','help']
        .every(k=>app.tabList().some(([x])=>x===k)));
  chk('古い形の dayMode も立つ', app.DB().meta.dayMode===true);
  chk('畳んだ段階が1行で出る（消えていない）', /phOpen\('prep',true\)[^>]*>(✓ )?準備 6項目 ▸/.test(tabs()), (tabs().match(/準備 \d項目 ▸/)||[''])[0]);
  chk('準備のタブを開いていたら当日の最初のタブ（集金）へ', app.TAB==='collect', app.TAB);
  chk('畳んだことを案内に出す', /準備のタブ（大会設定・追加ルール・参加者・組み合わせ・予想入力・賞金・収支）は畳んでいます/.test(pane()));

  console.log('  -- 畳んだ段階は押せば開く --');
  app.phOpen('prep',true);
  chk('開くと16タブに戻る', app.tabList().length===16);
  chk('畳むボタンが出る', /phOpen\('prep',false\)/.test(tabs()));
  app.go('meta');
  chk('準備のタブを開ける', app.TAB==='meta');
  app.phOpen('prep',false);
  chk('畳むと見えるタブへ移る', app.tabList().some(([k])=>k===app.TAB), app.TAB);

  console.log('  -- 当日の「次にやること」 --');
  chk('サンプル①は対象ホールとパーが噛み合う（予行演習で警告を出さない）', app.holeWarn().length===0,
      app.holeWarn().map(w=>w.label+':'+w.bad.join(',')).join(' '));
  chk('サンプル①の準備は全部済んでいる', app.flowSteps().filter(s=>s.ph==='prep').every(s=>s.done),
      app.flowSteps().filter(s=>s.ph==='prep'&&!s.done).map(s=>s.label).join('/'));
  const D=app.DB();
  const P=pane();
  chk('次にやることが出る', /次にやること/.test(P));
  chk('手順が順に並ぶ', /１　集金する[\s\S]*２　スコアを入れる[\s\S]*３　ニアピン・ドラコンを入れる/.test(P));
  chk('当日の手順は3つ（発表は次の段階）', (P.match(/class="nx-st[ "]/g)||[]).length===3, (P.match(/class="nx-st[ "]/g)||[]).length);
  const n0=app.nextStep().n;
  chk('サンプルは未集金なので、次は集金', n0&&n0.tab==='collect', n0&&n0.label);
  chk('残りの人数を出す', n0&&/^残り\d+名$/.test(n0.rest), n0&&n0.rest);
  /* 集金は独立した画面になり、表が上にあるので「下の表へ」は要らない */
  chk('いまの画面なら「開く」は出さない', app.TAB==='collect'&&/この画面です ↓/.test(P));
  chk('集金の画面に集金表がある', /id="sec-collect"/.test(P));
  app.go('score');
  chk('別の画面なら「開く」で飛べる', /onclick="goStep\('collect',''\)">開く<\/button>/.test(pane()));
  chk('判定が済まなくても次の段階へ進める', /setPhase\('award'\)">「発表」へ進む/.test(pane()));
  app.settle().forEach(x=>app.payToggle(x.n,true));
  const n1=app.nextStep().n;
  /* サンプル①はスコアも技能賞も埋まっているので、集金が済めば当日の作業は終わる */
  chk('全員集金すると当日の作業が済む', n1===null, n1&&n1.label);
  chk('済んだら「発表」へ誘う', /setPhase\('award'\)">「発表」に切り替える/.test(pane()));
  chk('集金に ✓ が付く', app.flowSteps().find(s=>s.tab==='collect').done);
  chk('済んだタブに ✓', /<i class="tk">✓<\/i>集金/.test(tabs()));

  console.log('  -- 使わない機能があっても番号が飛ばない --');
  D.meta.use.near=false; D.meta.use.nearAny=false; D.meta.use.drako=false;
  app.render();
  const P2=pane();
  const ns=(P2.match(/<span>([１-９])　/g)||[]).map(x=>x[6]);
  chk('1から順に並ぶ', ns.join('')==='１２３'.slice(0,ns.length)&&ns.length===2, ns.join(''));
  chk('使わない機能の手順は出ない', !/ニアピン・ドラコンを入れる/.test(P2));
  console.log('  -- 機能を全部外しても見えるタブに居る --');
  D.meta.use.budget=false; D.meta.use.prize=false; D.meta.use.score=false;
  app.render();
  chk('見えないタブに取り残されない', app.tabList().some(([k])=>k===app.TAB), app.TAB);
  chk('当日の作業が無ければ次の段階へ誘う', /「発表」に切り替える/.test(pane()));
  D.meta.use.score=true; D.meta.use.budget=true; D.meta.use.prize=true;
  D.meta.use.near=true; D.meta.use.nearAny=true; D.meta.use.drako=true;

  console.log('  -- 発表 --');
  app.setPhase('award');
  chk('準備と当日が畳まれる（大会ハブは残る）', app.tabList().map(x=>x[0]).join('/')==='hub/rank/sum/result/share/data/help', app.tabList().map(x=>x[0]).join('/'));
  app.setPhase('day'); app.go('score'); app.setPhase('award');
  chk('当日の画面から切り替えると、発表の最初（順位・表彰）へ', app.TAB==='rank', app.TAB);
  chk('次にやることは順位の確認', app.nextStep().n.tab==='rank', app.nextStep().n.label);
  chk('その次が発表', app.nextStep().mine.map(s=>s.tab).join('/')==='rank/result');
  chk('当日の畳みも1行', /当日 3項目 ▸/.test(tabs()));

  console.log('  -- 準備に戻せる --');
  app.dayToggle();
  chk('前の版の切替は準備へ戻す', app.PHASE()==='prep');
  chk('全タブが戻る', app.tabList().length===app.tabAll().length);
  chk('畳みの案内が消える', !/畳んでいます/.test(pane()));
  app.dayToggle();
  chk('前の版の切替で当日へ', app.PHASE()==='day');
  app.setPhase('prep');

  console.log('  -- 準備の「次にやること」 --');
  {
    const O=app.blank(); app.setDB(O); app.go('meta');
    const s=app.nextStep();
    chk('空の大会は「大会の基本」から', s.n&&s.n.label==='大会の基本を入れる', s.n&&s.n.label);
    chk('使い方の画面には出さない', (app.go('help'),!/次にやること/.test(pane())));
    O.meta.name='テスト大会'; O.meta.place='テストコース'; O.meta.date='2027.8.28';
    O.meta.nearHoles=[1];
    chk('パーと合わないホールを先に知らせる', app.nextStep().n.label==='技能賞の対象ホールを直す', app.nextStep().n.label);
    /* 既定のホール（ニアピン4・7・12・16／ドラコン5・14）は既定のパーと噛み合わない。
       新しい大会で最初に知らせるのは正しい動き */
    O.meta.nearHoles=[3,7,11,16]; O.meta.drakoHoles=[4,14];
    chk('直すと参加者へ進む', app.nextStep().n.label==='参加者を登録する', app.nextStep().n.label);
    O.players=[{n:'甲',org:'',bd:'',g:0,f:0,vote:true,fee:true,feeAmt:''},
               {n:'乙',org:'',bd:'',g:1,f:0,vote:true,fee:true,feeAmt:''},
               {n:'丙',org:'',bd:'',g:0,f:0,vote:true,fee:false,feeAmt:''}];
    const g=app.nextStep().n;
    chk('組の決まっていない人を数える（予想のみは数えない）', g.label==='組み合わせを決める'&&g.rest==='残り1名', g.label+' '+g.rest);
    O.players[0].g=1;
    /* 段階4で「スタート時刻を入れる」を足した */
    const tm=app.nextStep().n;
    chk('次はスタート時刻', tm.label==='スタート時刻を入れる'&&tm.rest==='残り1組'&&tm.at==='g-start', tm.label+' '+tm.rest);
    O.groups[0].time='8:00';
    const f=app.nextStep().n;
    chk('次は枠', f.label==='馬券の枠を決める'&&f.rest==='残り2名', f.label+' '+f.rest);
    chk('枠が組と同じなら列は切り替えない', f.at==='', f.at);
    O.meta.frameMode='manual';
    chk('枠を自分で決めるなら参加者の「枠と実力」の列へ送る', app.nextStep().n.at==='@pcol-f', app.nextStep().n.at);
    O.meta.frameMode='group';
    O.players[0].f=1; O.players[1].f=1;
    chk('次は集める額', app.nextStep().n.label==='当日集める額を決める', app.nextStep().n.label);
    O.meta.budget.collect[0].amt=13500;
    chk('次は予想', app.nextStep().n.label==='予想を入力する', app.nextStep().n.label);
    O.keiba.push({v:'甲',a:1,b:1,q:1});
    /* 段階6：予想は締め切ったら済む（代金は締め切ってから集める） */
    const kb=app.nextStep().n;
    chk('1口入れても締め切るまでは済まない', kb&&kb.label==='予想を入力する'&&kb.rest==='締め切り前（1口）', kb&&(kb.label+' '+kb.rest));
    O.meta.betsClosed=true;
    chk('準備が済むと当日へ誘う', app.nextStep().n===null);
    app.go('players');
    chk('切替ボタンが出る', /setPhase\('day'\)">「当日」に切り替える/.test(pane()));
    chk('準備が済んだと出る', /準備の作業は済みました/.test(pane()));
  }

  console.log('  -- 使う機能を足すと、増えたタブに NEW --');
  {
    const O=app.blank(); O.meta.use.keiba=false; O.meta.use.gto=false; app.setDB(O); app.go('rules');
    chk('選ぶ前に増える画面を書く', /画面が増える：予想入力・集計/.test(pane()));
    chk('切替は useSet を通す', /onchange="useSet\('keiba',this.checked\)"/.test(pane()));
    app.useSet('keiba',true);
    chk('予想入力と集計に NEW', app.NEWTABS.bets&&app.NEWTABS.sum);
    chk('タブに NEW と出る', /予想入力<em class="nw">NEW<\/em>/.test(tabs()));
    app.go('bets');
    chk('開くと NEW が消える', !app.NEWTABS.bets&&!/予想入力<em/.test(tabs()));
    app.useSet('keiba',false);
    chk('外すと NEW も消える', !app.NEWTABS.sum);
    app.go('rules');
    chk('罰金はGTOと一緒に使うと書く', /GTOと一緒に使います/.test(pane()));
  }

  console.log('  -- ヘッダーの保存表示 --');
  chk('予想入力の文言がヘッダーに出ない', !/まだ投票がありません/.test(src.slice(src.indexOf('function paintSave'),src.indexOf('const touch='))));
  console.log('  -- 古い大会データを開いても落ちない --');
  {
    const O=app.blank(); delete O.meta.dayMode; delete O.meta.phase; app.setDB(O);
    let e=null; try{ app.render(); }catch(x){ e=x.message; }
    chk('例外にならない', !e, e||'');
    chk('準備として扱う', app.tabList().length===app.tabAll().length);
    const J=app.blank(); J.v=2; J.meta.dayMode=true; delete J.meta.phase;
    const M=app.migrate(JSON.parse(JSON.stringify(J)));
    chk('当日モードで保存したファイルは「当日」で開く', M.meta.phase==='day', M.meta.phase);
    app.setDB(M);
    chk('当日として扱う', app.PHASE()==='day'&&app.tabList().length===10);
    app.setPhase('prep');
  }
}

console.log('\n=== 大会設定を畳む（デザイン案の段階2） ===');
/* 大会設定だけで約1万文字あった（2026-09-08の実測 9,875文字）。
   基本4項目と追加ルールだけを開き、ほかは今の設定を1行にして畳む。中身は消さない。 */
app.sample(); global.flush(); app.setPhase('prep'); app.go('meta');
{
  const P=()=>store['pane'].innerHTML;
  const visible=h=>h.split('<div class="fold-b">').map((x,i)=>i?x.slice(x.indexOf('</details>')):x).join('')
    .replace(/<[^>]*>/g,'').replace(/\$\{[^}]*\}/g,'').replace(/\s/g,'');
  console.log('  -- 見える量 --');
  const v=visible(P()), all=P().replace(/<[^>]*>/g,'').replace(/\s/g,'');
  chk('開いて見える文字が3,000字未満', v.length<3000, v.length+'字（畳んだ中身を含めると '+all.length+'字）');
  chk('畳んだ中身も画面に残っている（消していない）', all.length>6000&&/mSet\('pref'/.test(P())&&/SCset\('system'/.test(P()));
  console.log('  -- 基本 --');
  chk('基本は4項目', /<h2>基本 /.test(P())&&['大会名','会場','開催日','1組の人数'].every(l=>P().includes('<label>'+l+'</label>')));
  console.log('  -- 追加ルール（段階3で独立した画面へ。大会設定には札だけ） --');
  chk('大会設定には使っているルールの札', /<h2>追加ルール <small>11個を使っています/.test(P())&&/class="rl-c"/.test(P())
      &&/onclick="go\('rules'\)">追加ルールを変える →/.test(P())&&!/class="mod rcard/.test(P()));
  app.go('rules');
  chk('ルールのカードが11枚', (P().match(/class="mod rcard/g)||[]).length===11, (P().match(/class="mod rcard/g)||[]).length);
  chk('表彰式の飾り罫（.rule）と名前が重ならない', !/class="mod rule/.test(P()));
  chk('3つのまとまりに分ける', ['競技','予想ゲーム','賞とお金'].every(t=>P().includes('<div class="rule-gt">'+t+'</div>')));
  chk('使っている数を出す', /11個を使っています/.test(P()), (P().match(/\d+個を使っています/)||[''])[0]);
  app.go('meta');
  console.log('  -- 詳しく --');
  const F=['course','method','holes','games','budget'];
  const isOpen=k=>{const m=P().match(new RegExp('id="sec-'+k+'"\\s*(open)?\\s*data-d="(\\d)"'));return m?[!!m[1],m[2]]:null;};
  chk('5つを畳む', F.every(k=>P().includes('id="sec-'+k+'"')));
  chk('既定では閉じている', F.every(k=>{const o=isOpen(k);return o&&!o[0]&&o[1]==='0';}), F.map(k=>k+':'+isOpen(k)).join(' '));
  chk('閉じていても今の設定が1行で分かる', /<span class="fold-s">ダブルペリア・上限パー×3・ハンディ上限30・同スコアは年長者<\/span>/.test(P()),
      (P().match(/id="sec-method"[\s\S]*?<span class="fold-s">([^<]*)/)||[])[1]);
  chk('コースの要約にパー', /<span class="fold-s">パー72（OUT 36・IN 36）/.test(P()));
  chk('技能賞の要約にホール', /ニアピン 3・7・11・16／何でもニアピン 9・18／ドラコン 4・14/.test(P()));
  console.log('  -- 開閉を覚える --');
  app.foldSet('course',false,{dataset:{d:'0'}});
  chk('描画した状態と同じ通知は記録しない', app.FOLD.course===undefined);
  const el={dataset:{d:'0'}};
  app.foldSet('course',true,el); app.render();
  chk('開いたら作り直しても開いたまま', isOpen('course')[0]&&app.FOLD.course===true, String(isOpen('course')));
  app.foldSet('course',false,el);
  chk('閉じたら記録が戻る', app.FOLD.course===false);
  app.foldAll(true);
  chk('すべて開く', F.every(k=>app.foldOpen(k))&&/foldAll\(false\)">すべて閉じる/.test(P()));
  app.foldAll(false);
  chk('すべて閉じる', F.every(k=>!app.foldOpen(k)));
  console.log('  -- 直すものがあれば開いて知らせる --');
  for(const k of F) delete app.FOLD[k];
  const D=app.DB(); const keep=D.meta.nearHoles.slice();
  D.meta.nearHoles=[1,3]; app.render();
  chk('パーと合わないと技能賞が開く', isOpen('holes')[0], String(isOpen('holes')));
  chk('見出しに「要確認」', /技能賞の対象ホール[\s\S]{0,120}<span class="fold-s">[^<]*<\/span><span class="fold-w">要確認/.test(P()));
  chk('「次にやること」から技能賞へ送る', app.flowSteps().find(s=>s.label==='技能賞の対象ホールを直す').at==='sec-holes');
  D.meta.nearHoles=keep; app.FOLD.holes=false; app.render();
  app.goStep('meta','sec-holes');
  chk('送ると畳んだ中が開く', app.FOLD.holes===true&&isOpen('holes')[0]);
  const fee=app.BG().fee; app.BG().fee=100; app.render();
  chk('賞金が原資を超えるとお金の欄が開く', isOpen('budget')[0]&&/賞金の原資と当日集める額[\s\S]{0,200}要確認/.test(P()));
  app.BG().fee=fee; app.foldAll(false);
}

console.log('\n=== 検算エラーカード（デザイン案P7） ===');
app.sample(); global.flush(); app.SCset('entry','sheet');
{
  const P=()=>{app.go('score');return store['pane'].innerHTML;};
  const run=app.RUN(), a=run[0].n, b=run[1].n;
  run.forEach(p=>{const sc=app.scoreOf(p.n); sc.hc=10; sc.gross=90; sc.netRef=80;});
  app.scoreOf(a).netRef=79.4;
  app.render();
  chk('合わない行は1行', app.scoreCheck().filter(x=>x.st==='ng').length===1);
  chk('どう合わないかを式で出す', /90 − 10 ＝ <b class="ngc-v">80<\/b> のはず。\s*入れたネットは 79.4（差 \+0.6）/.test(P()));
  chk('「集計表が正しい」ボタンは出さない', !/集計表が正しい/.test(P()));
  chk('ネットを直すボタン', P().includes(`netFix('${a}')">ネットの打ち間違い → 80 に直す`));
  chk('グロスかHDCPへ行くボタン', P().includes(`scFocus('${a}')">グロスかHDCPを直す`));
  chk('ネットは順位に使わないと書く', /ネットは照合にだけ使い、順位はグロス − HDCP で決まります/.test(P()));
  chk('合わない行に印', /class="zebra ngrow" id="sr-0"/.test(P()));
  chk('グロスの欄に行き先の印', /id="sg-0"/.test(P()));
  let e=null; try{ app.scFocus(a); app.scFocus('いない人'); }catch(x){ e=x.message; }
  chk('グロスの欄へ移れる（落ちない）', !e, e||'');
  app.netFix(a);
  chk('直すとネットが計算値になる', +app.scoreOf(a).netRef===80, app.scoreOf(a).netRef);
  chk('カードが消える', !/class="ngc"/.test(P()));
  chk('順位には影響しない', app.standings().rows.find(r=>r.n===a).net===80);
  app.SCset('entry','hidden');
}

console.log('\n=== 同点の理由を出す（デザイン案P8） ===');
app.sample(); global.flush();
{
  /* 競技結果は段階2で「順位・表彰」へ移った */
  const P=()=>{app.go('rank');return store['pane'].innerHTML;};
  const st=app.standings(), r0=st.net[0], r1=st.net[1];
  /* 1位と2位を同ネットにする */
  const hc1=r1.hc, need=r0.net+hc1-r1.g;
  const sc1=app.scoreOf(r1.n);
  for(let h=1;h<=18;h++){ if(!app.DB().meta.sc.hidden.includes(h)){ sc1.h[h]=+sc1.h[h]+need; break; } }
  sc1.gross=+sc1.gross+need;
  app.render();
  const s2=app.standings();
  chk('準備：1位と2位が同ネット', s2.net[0].net===s2.net[1].net, s2.net[0].net+' / '+s2.net[1].net);
  chk('同ネットの注記が出る', /<tr class="tie"><td colspan="6">1位と2位は同ネット（[\d.]+）。年長者を上位にしました（大会設定）/.test(P()),
      (P().match(/<tr class="tie">[^\n]*?<\/tr>/)||[''])[0].replace(/<[^>]+>/g,''));
  app.SCset('tiebreak','none');
  chk('決めない設定なら、決めてほしいと出す', /入力順です。表彰の前に決めてください/.test(P()));
  app.SCset('tiebreak','lowhc');
  chk('ハンディで決めたと出す', /ハンディの小さい方を上位にしました|ハンディも同じなので入力順です/.test(P()));
  app.SCset('tiebreak','older');
  const bd=s2.net[0].p.bd; s2.net[0].p.bd='';
  chk('生年月日が無ければそう出す', /生年月日が入っていない方がいるので、入っている方を上位にしました/.test(P()));
  s2.net[0].p.bd=bd;
  chk('同点でない行には出さない', (P().match(/<tr class="tie">/g)||[]).length===1, (P().match(/<tr class="tie">/g)||[]).length);
}
app.sampleHard(); global.flush();
{
  const H=(app.go('rank'),store['pane'].innerHTML);
  const g=app.standings().gross;
  chk('サンプル②のベスグロ同点に理由が出る', g[0].g!==g[1].g||/ベスグロは同グロス（\d+）が\d名。/.test(H),
      g[0].g+' / '+g[1].g);
}

console.log('\n=== スマホの集金カード（段階1-A） ===');
/* 当日の朝、スマホで集金するときに表が画面幅の約3倍あった（9/8実測）。
   760px以下では1人1枚のカードにし、表は印刷とPCだけで使う。 */
app.sample(); global.flush(); app.setPhase('day'); app.go('collect');
{
  const P=()=>{app.render();return store['pane'].innerHTML;};
  const T=app.settle(), H=P();
  const cards=(H.match(/<button type="button" class="pay-c[ "]/g)||[]).length;
  chk('1人1枚のカード', cards===T.length, cards+' / '+T.length);
  chk('表も残す（印刷とPC用）', /<table class="hscroll pay-table">/.test(H));
  /* 実機で label の転送が効かなかった（名前や金額を押しても入らない）。カード自体を押せるボタンにする */
  chk('カード自体がボタン（名前や金額を押しても入る）', new RegExp(`<button type="button" class="pay-c" role="checkbox" aria-checked="false"\\s*onclick="payToggle\\('${T[0].n}',true\\)">`).test(H));
  chk('チェック欄への転送（label）に頼らない', !/<label class="pay-c/.test(H)&&!/class="pay-ck"[^>]*onchange/.test(H));
  chk('徴収額を大きく出す', H.includes(`<span class="pay-y"><b>${app.yen(T[0].bill)}</b>`));
  const D0=(H.match(/<span class="pay-d">([\s\S]*?)<\/span>\s*(<span class="pay-d">|<\/span>)/)||['',''])[1].replace(/<[^>]+>/g,'');
  chk('内訳を1行で出す', /^実費 [\d,]+・原資 [\d,]+・馬券 \d+口・GTO \d+口/.test(D0), D0);
  chk('項目の途中で改行しない', /<span class="nw">馬券 \d+口<\/span>/.test(H));
  chk('受け取り済みの数', new RegExp('<b class="pay-n">0<span> / '+T.length+'</span></b>').test(H));
  const rest=T.reduce((a,b)=>a+b.bill,0);
  chk('残りの金額と人数', H.includes(`<b class="pay-rest">${app.yen(rest)}円</b>`)&&H.includes(`残り ${T.length}名`));
  app.payToggle(T[0].n,true);
  const H2=P();
  chk('押すと受け取り済みになる', /<button type="button" class="pay-c got" role="checkbox" aria-checked="true"/.test(H2)&&/<b class="pay-n">1<span>/.test(H2));
  chk('もう一度押すと戻せる', new RegExp(`aria-checked="true"\\s*onclick="payToggle\\('${T[0].n}',false\\)"`).test(H2));
  chk('受け取り済みの印が出る', /<span class="pay-ck" aria-hidden="true">✓<\/span>/.test(H2)&&/<span class="pay-ok">受け取り済<\/span>/.test(H2));
  chk('並び順は変えない（押したカードが動かない）', H2.indexOf(`payToggle('${T[0].n}'`)<H2.indexOf(`payToggle('${T[1].n}'`));
  app.payOnly(true);
  const H3=P();
  const C3=H3.slice(H3.indexOf('<div class="pay-cards">'),H3.indexOf('<table class="hscroll pay-table">'));
  chk('未集金だけに絞れる', (C3.match(/<button type="button" class="pay-c[ "]/g)||[]).length===T.length-1&&!C3.includes(`payToggle('${T[0].n}'`));
  chk('絞っても数は全体で出す', /<b class="pay-n">1<span> \/ /.test(H3));
  chk('絞り込みはファイルに残さない', !JSON.stringify(app.DB()).includes('PAYONLY')&&app.PAYONLY===true);
  T.forEach(x=>app.payToggle(x.n,true));
  const H4=P();
  chk('全員済めば「完了」', /<b class="">完了<\/b>/.test(H4)&&/全員から受け取りました/.test(H4));
  chk('絞った結果が空でも案内を出す', /未集金の方はいません/.test(H4));
  app.payOnly(false);
  const pz=app.settle().find(x=>x.pz||x.back);
  chk('精算がある人はお渡しも出す', !pz||P().includes(`<span class="nw">お渡し <b>${app.yen(pz.net)}円</b></span>`));
  console.log('  -- 画面幅で切り替える --');
  const css=h.slice(h.indexOf('/* ---- スマホの集金カード（2026-09-17） ----'));
  chk('PCではカードを出さない', /^[^@]*\.pay-cards\{display:none\}/.test(css.split('@media')[0]+'@'));
  chk('760px以下でカードを出し、表を隠す', /@media screen and \(max-width:760px\)\{\s*\.pay-cards\{display:block\}\s*\.card table\.pay-table\{display:none\}/.test(css));
  /* 段階2で下タブができたので、その上に貼り付ける */
  chk('合計の帯は画面の下（下タブの上）に貼り付く', /\.pay-sum\{position:sticky;bottom:calc\(68px \+ env\(safe-area-inset-bottom\)\)/.test(css));
  chk('押しやすい高さ（64px以上）', /\.pay-c\{[^}]*min-height:64px/.test(css));
  chk('受け取り済みは地の色と枠が変わる', /\.pay-c\.got\{background:rgba\(217,177,102,\.16\);border:2px solid var\(--brass\)/.test(css));
  chk('押した瞬間に反応が見える', /\.pay-c:active\{/.test(css)&&/-webkit-tap-highlight-color:transparent/.test(css));
  chk('印刷ではカードを出さない', /@media print\{\.pay-cards\{display:none!important\}\}/.test(css));
  app.setPhase('prep');
}

console.log('\n=== 画面の骨格（段階2） ===');
/* PCは左のサイドバー、スマホは下タブ。どの画面にも見出し。
   「大会ハブ」「集金」「順位・表彰」「結果共有・出力」を独立させた。既存の11画面のキーは残す。 */
app.sample(); global.flush(); app.setPhase('prep');
{
  const P=()=>store['pane'].innerHTML, SD=()=>store['side'].innerHTML, BT=()=>store['btm'].innerHTML;
  console.log('  -- 画面の一覧 --');
  const keys=app.tabAll().map(x=>x[0]);
  chk('既存の11画面のキーが残る', ['meta','players','groups','score','bets','sum','prize','money','result','data','help'].every(k=>keys.includes(k)));
  chk('新しい4画面がある', ['hub','collect','rank','share'].every(k=>keys.includes(k)), keys.join('/'));
  let e=[]; app.tabAll().forEach(([k])=>{try{app.go(k);}catch(x){e.push(k+':'+x.message);}});
  chk('全画面が描ける', !e.length, e.join(' '));
  console.log('  -- 見出し --');
  app.go('collect');
  chk('画面の名前を見出しに出す', /<h2 class="pg-t">集金<\/h2>/.test(P()));
  chk('大会の概要を出す', /<div class="pg-m">2027\.8\.28（土）・○○カントリークラブ・16名・4組<\/div>/.test(P()), (P().match(/<div class="pg-m">[^<]*/)||[''])[0]);
  chk('見出しは「次にやること」より上', P().indexOf('pghead')<P().indexOf('次にやること'));
  console.log('  -- サイドバー（PC） --');
  app.go('hub');
  chk('大会名を出す', /<div class="sd-file"><small>いまの大会<\/small><b>第10回 親睦ゴルフコンペ<\/b>/.test(SD()));
  chk('大会ハブが段階の外（いちばん上）', SD().indexOf("go('hub')")<SD().indexOf('1 ／ 準備'));
  chk('段階ごとの見出し', /1 ／ 準備 ・ NOW/.test(SD())&&/2 ／ 当日/.test(SD())&&/3 ／ 発表/.test(SD()));
  chk('いまの画面に印（aria-current）', /class="sd-i on sd-hub" onclick="go\('hub'\)" aria-current="page"/.test(SD()));
  chk('参加者の人数', /参加者<\/span><small>16<\/small>/.test(SD()));
  chk('組合せの進み', /組み合わせ<\/span><small>4\/4<\/small>/.test(SD()), app.sideCount('groups'));
  chk('集金の進み', /集金<\/span><small>0\/16<\/small>/.test(SD()));
  chk('スコアの進み', /スコア入力<\/span><small>16\/16<\/small>/.test(SD()));
  chk('予想入力の進み', /予想入力<\/span><small>\d+\/\d+<\/small>/.test(SD()));
  chk('データ・使い方は下にまとめる', /<div class="sd-foot">[\s\S]*go\('data'\)[\s\S]*go\('help'\)/.test(SD()));
  app.setPhase('day');
  chk('当日は準備を1行に畳む', /<button class="sd-fold" onclick="phOpen\('prep',true\)">✓ 準備 6項目 ▸<\/button>/.test(SD()));
  app.phOpen('prep',true);
  chk('開くと畳むボタンが出る', /class="sd-close" onclick="phOpen\('prep',false\)"/.test(SD()));
  app.phOpen('prep',false);
  console.log('  -- 下タブ（スマホ） --');
  const bt=(BT().match(/onclick="go\('(\w+)'\)"/g)||[]).map(x=>x.slice(13,-3));
  chk('大会ハブ＋当日の画面', bt.join('/')==='hub/collect/score/prize', bt.join('/'));
  chk('短い名前で出す', ['ハブ','集金','スコア','技能賞'].every(l=>BT().includes('<b>'+l+'</b>')));
  chk('多くても5つ', bt.length<=5);
  app.setPhase('award');
  const bt2=(BT().match(/onclick="go\('(\w+)'\)"/g)||[]).map(x=>x.slice(13,-3));
  chk('発表では順位・集計・発表・共有', bt2.join('/')==='hub/rank/sum/result/share', bt2.join('/'));
  app.setPhase('prep');
  console.log('  -- 置き場所（CSS） --');
  const css=h.slice(h.indexOf('/* ---- 画面の骨格：サイドバー・見出し・下タブ・大会ハブ'));
  chk('ふだんはサイドバーも下タブも出さない', /^[^@]*\.side,\.btm\{display:none\}/.test(css));
  /* #work は body.work #work{display:block} で出している。#work だけでは負けて、サイドバーが全幅になった */
  chk('並べる指定が作業画面の表示指定に負けない', /body\.work #work\{display:grid;grid-template-columns:236px/.test(css));
  chk('1024px以上でサイドバーを出し、上のタブを隠す', /@media screen and \(min-width:1024px\)\{[\s\S]*?\.side\{display:flex;[\s\S]*?#work>\.top \.tabs,#work>\.top \.brand,#work>\.top \.vr,#work>\.top #hdTitle\{display:none\}/.test(css));
  chk('760px以下で下タブを画面下に固定', /@media screen and \(max-width:760px\)\{\s*\.btm\{display:flex;position:fixed;left:0;right:0;bottom:0/.test(css));
  chk('下タブがiPhoneの下端に重ならない', /env\(safe-area-inset-bottom\)/.test(css));
  chk('本文が下タブに隠れない', /#work>\.wrap\{padding-bottom:calc\(76px/.test(css));
  chk('印刷には出さない', /@media print\{\.side,\.btm,\.pghead\{display:none!important\}\}/.test(css));
  chk('HTMLに置き場所がある', /<nav class="side no-print" id="side"/.test(h)&&/<nav class="btm no-print" id="btm"/.test(h));
  console.log('  -- 大会ハブ（P4・P9） --');
  app.go('hub');
  /* 段階3で起動はホーム（P1）に変えた。ホームの検査は「入口（段階3）」にある */
  chk('起動したらホーム', /let DB=blank\(\), dirty=false, TAB="home";/.test(src));
  /* 段階3：予想ゲームを使う準備中は、馬券・GTO・罰金のカード（P9） */
  chk('数字のカード', /<small>馬券（枠連）<\/small><b>200<em>円／口<\/em><\/b>/.test(P())&&/<small>GTO（下位予想）<\/small>/.test(P())&&/<small>罰金<\/small>/.test(P()));
  chk('いまの段階のチェックリスト', /<h2>準備のチェックリスト<small>\d+ \/ \d+<\/small><\/h2>/.test(P())&&/<h2>当日の流れ<small>/.test(P()));
  chk('大会ハブでは帯の下の手順を重ねて出さない', !/class="nx-steps"/.test(P())&&/次にやること/.test(P()));
  chk('押すとその画面へ', /class="hb-li ok" onclick="goStep\('players',''\)"/.test(P()));
  chk('使っているルールの状態', /<small>馬券（枠連）<\/small><b>[\d,]+<em>円／口<\/em><\/b>\s*<span class="ok">✓ 枠は/.test(P()));
  app.DB().players[0].f=0; app.DB().meta.frameMode='manual'; app.render();
  chk('枠が決まっていなければ知らせる', /<span class="ng">● 枠が決まっていない方がいます<\/span>/.test(P()));
  app.sample(); global.flush(); app.setPhase('prep');
  console.log('  -- 集金（独立） --');
  app.go('collect');
  chk('集金の画面に集金表', /id="sec-collect"/.test(P())&&/<div class="pay-cards">/.test(P()));
  app.go('money');
  chk('賞金・収支には集金表を出さない（重複させない）', !/id="sec-collect"/.test(P())&&/<h2>収支<\/h2>/.test(P()));
  console.log('  -- 順位・表彰（独立） --');
  app.go('rank');
  chk('競技結果の表', /競技結果/.test(P())&&/<th class="c" style="width:56px">順位<\/th>/.test(P()));
  const w=app.standings().net[0];
  /* 段階5で名前の横の札から「賞」の列に移した（印刷にも出す） */
  chk('受賞した賞を賞の列に出す', new RegExp('<b>'+w.n+'</b>[\\s\\S]*?<td class="r-pzs">[^\\n]*<span class="r-pz">優勝 <b>10,000円</b></span>').test(P()), (P().match(new RegExp(w.n+'[^\\n]{0,160}'))||[''])[0]);
  chk('技能賞のまとめ', /<h2>技能賞 <small>\d+ \/ \d+ 決定<\/small><\/h2>/.test(P()));
  /* 段階7で、反映済みならその場で始めるボタンにした。結果・発表の画面へのボタンも残す */
  chk('発表の画面へ行ける', /onclick="go\('result'\)">結果・発表の画面へ/.test(P())&&/onclick="startShow\(\)">▶ 発表をはじめる/.test(P()));
  app.go('score');
  chk('スコア入力からは順位・表彰へ案内する', /onclick="go\('rank'\)">順位・表彰を見る →/.test(P())&&!/競技結果/.test(P()));
  console.log('  -- 結果共有・出力 --');
  app.go('share');
  const T=app.resultText();
  chk('結果の文章', T.startsWith('第10回 親睦ゴルフコンペ　競技結果')&&new RegExp('^1位　'+w.n+'　ネット','m').test(T), T.split('\n').slice(0,4).join(' / '));
  chk('ベスグロと技能賞も入る', /^ベスグロ　/m.test(T)&&/^ニアピン　/m.test(T));
  chk('画面に文章とコピーのボタン', /<textarea id="shareText" rows="10" readonly/.test(P())&&/onclick="copyResult\(\)">コピーする/.test(P()));
  let ce=null; try{ app.copyResult(); }catch(x){ ce=x.message; }
  chk('コピーで落ちない（クリップボードが無い端末でも）', !ce, ce||'');
  chk('ファイルに書き出せる', /onclick="dlJson\(\)">ファイルに書き出す/.test(P()));
}

console.log('\n=== 入口（段階3：上の帯・ホーム・作成画面・大会ハブの仕上げ） ===');
/* 2026-09-17。デザイン案P1〜P4・P9。
   ・PCでは見出し・保存状態・切替を上の帯の1行にする
   ・起動はホーム（P1）。最近のファイルは名前と概要だけを端末に残す（オフラインで開き直せないため）
   ・作成画面（P2・P3）は参加者が0名のときだけ。9/16に却下した「毎回のウィザード」にしない
   ・追加ルールを大会設定から独立させる（サイドバーの項目）
   ・大会ハブは左に次にやること・数字・チェックリスト、右に追加ルール・次の段階の流れ・集金の見込み */
{
  const S3=app.S3();
  /* 前の検査で保存の失敗を再現しているので、使える状態に戻してから始める */
  localStorage._fail=false; app.setLS(true);
  const P=()=>store['pane'].innerHTML, SD=()=>store['side'].innerHTML, BT=()=>store['btm'].innerHTML;
  /* 前の版に当てたときも途中で止まらず、項目ごとに NG を出す */
  const X=(f,...a)=>{try{return S3[f]?S3[f](...a):undefined;}catch(e){console.log('  （'+f+' で例外：'+e.message+'）');}};
  const T=(l,f,x)=>{let v,e='';try{v=f();}catch(err){v=false;e=String(err&&err.message||err);}chk(l,!!v,e||(typeof x==='function'?(()=>{try{return x();}catch(_){return '';}})():x||''));};
  const css=h.slice(h.indexOf('/* ---- 段階3：上の帯を1行に')>=0?h.indexOf('/* ---- 段階3：上の帯を1行に'):h.length);
  console.log('  -- 開催日を読む --');
  T('4通りの書き方を読む', ()=>['2027.8.28','2027/8/28','2027-08-28','2027年8月28日'].every(d=>{const x=S3.evDate(d);return x&&x.getFullYear()===2027&&x.getMonth()===7&&x.getDate()===28;}));
  T('ありえない日付と空欄は読まない', ()=>S3.evDate('2027.2.30')===null&&S3.evDate('')===null&&S3.evDate('来年の夏')===null);
  T('曜日を付ける', ()=>S3.dateJa('2027.8.28')==='2027.8.28（土）', ()=>S3.dateJa('2027.8.28'));
  T('読めない日付はそのまま', ()=>S3.dateJa('未定')==='未定');
  T('開催までの日数', ()=>S3.daysLeft('2027.8.28','2027-08-25T21:00:00')===3&&S3.daysLeft('2027.8.28','2027-08-28T09:00:00')===0&&S3.daysLeft('2027.8.28','2027-08-30T09:00:00')===-2);

  console.log('  -- 上の帯（PC） --');
  app.sample(); global.flush(); app.setPhase('prep'); app.go('collect');
  /* 段階8でスマホの見出し（mHead）を間に足し、2026-09-18に「押すとホーム」にした */
  T('帯に見出しの置き場所', ()=>/<h1 id="hdTitle">—<\/h1>\s*<div class="pgbar" id="pgBar"><\/div>\s*<button class="mhead" id="mHead" onclick="go\('home'\)" aria-label="ホームへ戻る" title="ホームへ"><\/button>\s*<div class="save" id="saveState">/.test(h));
  T('帯に画面名と大会の概要', ()=>store['pgBar'].innerHTML==='<h2 class="pg-t">集金</h2><span class="pg-m">2027.8.28（土）・○○カントリークラブ・16名・4組</span>', ()=>store['pgBar'].innerHTML);
  T('本文の見出しも残す（760px以下と印刷で使う）', ()=>/class="pghead no-print"/.test(P()));
  T('PCでは帯に出して本文の見出しを隠す', ()=>/@media screen and \(min-width:1024px\)\{[\s\S]*?\.pgbar\{display:flex;[\s\S]*?#work>\.wrap \.pghead\{display:none\}/.test(css));
  T('ふだんは帯の見出しを出さない', ()=>/^[^@]*\.pgbar\{display:none\}/.test(css));
  T('帯は1行（折り返さない・高さ72px）', ()=>/#work>\.top \.bar\{max-width:none;min-height:72px;padding:14px 36px;flex-wrap:nowrap\}/.test(css));
  T('長い会場名は省略記号で切る', ()=>/\.pgbar \.pg-m\{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap\}/.test(css));
  T('PCの帯では保存の補足を隠す', ()=>/#work>\.top \.save \.sv-sub\{display:none\}/.test(css));
  /* v46：grid の中の .wrap{margin:0 auto} が中身の幅まで縮み、空の大会で本文が中央に細く寄っていた */
  T('本文が列の幅いっぱいに広がる', ()=>/#work>\.wrap\{width:100%;/.test(css));
  T('印刷に帯の見出し・ホーム・作成画面を出さない', ()=>/@media print\{\.pgbar,\.hm,\.mk\{display:none!important\}\}/.test(css));
  app.touch(); global.flush();
  T('保存の表示に点と補足', ()=>/^<i class="sv-dot"><\/i>自動保存 \d/.test(store['saveState'].innerHTML)&&/<span class="sv-sub">　／ 終了前にファイル保存を<\/span>/.test(store['saveState'].innerHTML), ()=>store['saveState'].innerHTML);

  console.log('  -- 追加ルールの画面 --');
  const keys=app.tabAll().map(x=>x[0]);
  T('大会設定の次に追加ルール', ()=>keys.indexOf('rules')===keys.indexOf('meta')+1, keys.join('/'));
  app.go('rules');
  T('見出しは「追加ルール」', ()=>/<h2 class="pg-t">追加ルール<\/h2>/.test(P()));
  T('サイドバーに使っている数', ()=>/追加ルール<\/span><small>11<\/small>/.test(SD())&&S3.ruleOnN()===11);
  T('スマホの下タブには出さない（年に数回しか触らない）', ()=>(BT().match(/go\('(\w+)'\)/g)||[]).join('')==="go('hub')go('meta')go('players')go('groups')go('bets')", ()=>(BT().match(/go\('(\w+)'\)/g)||[]).join(''));
  T('大会設定には札とリンクだけ（同じカードを2か所に出さない）', ()=>{app.go('meta');return !/class="mod rcard/.test(P())&&/onclick="go\('rules'\)">追加ルールを変える/.test(P());});
  T('タブ列からホームへ戻れる', ()=>/<span class="ph etc"><button class="tab" onclick="go\('home'\)">ホーム<\/button>/.test(store['tabs'].innerHTML));

  console.log('  -- 技能賞のカードで対象ホールを直す --');
  {
    const O=app.blank(); app.setDB(O); app.go('rules');
    T('対象ホールを出す', ()=>/<small class="fn tg ng">対象：4・7・12・16番　● パー3と合いません（パー3は 3・7・11・16番）<\/small>/.test(P()));
    T('その場で合わせるボタン（label の中なので既定の動きを止める）', ()=>/onclick="event\.preventDefault\(\);holeApplyFit\('near'\)">パー3のホールに合わせる<\/button>/.test(P()));
    X('holeApplyFit','near');
    T('合わせると注意が消える', ()=>/<small class="fn tg">対象：3・7・11・16番<\/small>/.test(P())&&!/holeApplyFit\('near'\)/.test(P()));
  }

  console.log('  -- ホーム（P1） --');
  T('起動はホーム', ()=>/let DB=blank\(\), dirty=false, TAB="home";/.test(src));
  {
    const O=app.blank(); app.setDB(O); app.go('home');
    T('サイドバー・帯・下タブを出さない1枚の画面', ()=>store['work'].className==='solo'&&store['pgBar'].innerHTML==='');
    T('そのための指定', ()=>/#work\.solo>\.side,#work\.solo>\.top,#work\.solo>\.btm\{display:none!important\}/.test(css)&&/body\.work #work\.solo\{display:block\}/.test(css));
    T('次にやることの帯は重ねない', ()=>!/class="nx no-print"/.test(P())&&!/class="pghead/.test(P()));
    T('空の大会は「大会を作る」から', ()=>/<button class="hm-go" onclick="go\('make'\)">つづきから：大会を作る →<\/button>/.test(P()));
    T('開催日が無いと知らせる', ()=>/<span class="hm-when">開催日が未設定<\/span>/.test(P()));
    T('新しい大会・前回からコピー・書き出す・読み込む', ()=>/onclick="newCompe\(\)"/.test(P())&&/onclick="copyPick\(\)">前回のファイルから設定をコピー/.test(P())&&/onclick="dlJson\(\)">書き出す/.test(P())&&/onclick="openPick\(-1\)">読み込む/.test(P()));
    T('最近のファイルが無いときの案内', ()=>/その名前がここに残ります（この端末だけ。中身は残りません）/.test(P()));
    app.go('hub');
    T('ほかの画面に戻ると枠が戻る', ()=>store['work'].className===''&&store['pgBar'].innerHTML!=='');
  }
  app.sample(); global.flush(); app.setPhase('prep');
  X('recentAdd','コンペ_第10回_テスト.json');
  app.go('home');
  T('大会カード', ()=>/<div class="hm-name">第10回 親睦ゴルフコンペ<\/div>/.test(P())&&/<div class="hm-info">2027\.8\.28（土）・○○カントリークラブ・16名・4組<\/div>/.test(P()));
  T('準備が済んだら「当日」へ', ()=>/<button class="hm-go" onclick="setPhase\('day'\)">つづきから：「当日」に切り替える →<\/button>/.test(P()));
  T('段階の進み（％）', ()=>/<small>準備の進み<\/small><b>100<em>%<\/em><\/b>/.test(P()));
  T('画面ごとの進みの帯', ()=>{const n=(P().match(/<div class="hm-bar">([\s\S]*?)<\/div>/)||['',''])[1].match(/<i /g).length;
    return n===new Set(app.flowSteps().map(s=>s.tab)).size;});
  T('済んだ画面に✓の印', ()=>/<span class="ok">参加者 16<\/span>/.test(P())&&/<span class="ok">組合せ 4\/4<\/span>/.test(P()));
  T('開催までの日数', ()=>{const d=S3.daysLeft('2027.8.28');
    return d>0?P().includes('開催まで <b>'+d+'</b> 日'):d===0?P().includes('<b>今日</b>が開催日'):P().includes((-d)+'日前に開催');});
  T('ファイル名を出す', ()=>/<code class="hm-file">コンペ_第10回_テスト\.json<\/code>/.test(P()));
  T('大会ハブへ', ()=>/onclick="go\('hub'\)">大会ハブを開く/.test(P()));
  app.setPhase('day'); app.go('home');
  T('当日は集金から', ()=>/<button class="hm-go" onclick="goStep\('collect',''\)">つづきから：集金する →<\/button>/.test(P())&&/<small>当日の進み<\/small>/.test(P()));
  T('途中の画面に●', ()=>/<span class="cur">集金 0\/16<\/span>/.test(P()));
  app.setPhase('prep');

  console.log('  -- 最近のファイル --');
  app.go('home');
  const R=X('recentList')||[];
  T('名前と概要だけを残す', ()=>R.length===1&&R[0].file==='コンペ_第10回_テスト.json'&&R[0].name==='第10回 親睦ゴルフコンペ'&&R[0].n===16&&R[0].g===4&&R[0].par.length===18&&R[0].place==='○○カントリークラブ'&&!('db' in R[0])&&!('players' in R[0]), ()=>JSON.stringify(R[0]).slice(0,120));
  T('優勝者を残す（スコアがあるとき）', ()=>R[0].win===app.standings().net[0].n);
  T('ホームに並ぶ', ()=>/<button class="hm-r" onclick="openPick\(0\)">[\s\S]*?<b>第10回 親睦ゴルフコンペ<\/b>[\s\S]*?16名・4組[\s\S]*?優勝 /.test(P()));
  X('recentAdd','コンペ_第10回_テスト.json');
  T('同じファイルは1行', ()=>S3.recentList().length===1);
  for(let i=0;i<10;i++) X('recentAdd','f'+i+'.json');
  T('8件まで・新しい順', ()=>S3.recentList().length===8&&S3.recentList()[0].file==='f9.json');
  app.go('home'); X('openPick',0);
  T('開くときはファイル名を示して選んでもらう', ()=>/「f9\.json」を選んでください。ファイルの置き場所はこの端末では覚えていません。/.test(P()));
  app.go('hub');
  T('画面を移ると知らせは消える', ()=>S3.NOTE==='');
  X('dlJson');
  T('書き出したファイル名を覚える', ()=>/^コンペ_第10回 親睦ゴルフコンペ_2027828\.json$/.test(S3.FILENAME)&&S3.recentList()[0].file===S3.FILENAME, ()=>S3.FILENAME);
  T('サイドバーにファイル名', ()=>SD().includes('<code>'+S3.FILENAME+'</code>'));
  {
    const json=JSON.stringify(app.DB());
    app.go('home');
    X('upJson',{name:'読み込み.json',_text:json});
    T('ホームで読み込むと大会ハブへ', ()=>app.TAB==='hub'&&S3.recentList()[0].file==='読み込み.json'&&S3.FILENAME==='読み込み.json', ()=>app.TAB);
  }

  console.log('  -- 作成画面（P2・P3） --');
  {
    const O=app.blank(); app.setDB(O); app.go('hub');
    const f=app.flowSteps()[0];
    T('参加者がいない間、大会の基本は作成画面へ', ()=>f.label==='大会の基本を入れる'&&f.at==='@make');
    T('次にやることのボタン', ()=>/<button class="nx-go" onclick="go\('make'\)">作成画面を開く<\/button>/.test(P()));
    T('チェックリストからも', ()=>/onclick="goStep\('meta','@make'\)"/.test(P()));
    app.goStep('meta','@make');
    T('送ると作成画面', ()=>app.TAB==='make'&&store['work'].className==='solo');
    T('段の表示（基本・競技方法・追加ルール）', ()=>/<button class="mk-st on" onclick="mkStep\(1\)" aria-current="step">\s*<i>1<\/i>基本<\/button>/.test(P())&&/<i>2<\/i>競技方法/.test(P())&&/<i>3<\/i>追加ルール<small>任意<\/small>/.test(P()));
    T('1段目は基本4項目', ()=>/STEP 1 \/ 3/.test(P())&&['大会名','開催日','1組の人数'].every(l=>P().includes('>'+l+'</label>'))&&/<label for="mkPlace">会場 /.test(P()));
    T('名前と会場は打つたびに作り直さない（日本語入力）', ()=>/id="mkName"[^>]*oninput="DB\.meta\.name=this\.value;touch\(\)"/.test(P())&&!/id="mkName"[^>]*render/.test(P())&&/id="mkPlace"[^>]*oninput="DB\.meta\.place=this\.value;touch\(\)"/.test(P()));
    T('開催日は確定時に曜日を出す', ()=>/id="mkDate"[^>]*oninput="DB\.meta\.date=this\.value;touch\(\)" onchange="render\(\)"/.test(P()));
    T('ゴルフ場マスタから選べる', ()=>/<details class="mk-find"/.test(P())&&/id="crsQ"/.test(P())&&/oncompositionend="mComp\(false,this\.value\)"/.test(P()));
    T('1組の人数を押して選ぶ', ()=>/<button class="on" aria-pressed="true" onclick="M\('groupSize',4\)">4<\/button>/.test(P())&&/onclick="M\('groupSize',5\)"/.test(P()));
    T('既定のパーのままなら知らせる', ()=>/まだ既定の配分です。/.test(P()));
    T('前回から引き継げる', ()=>/onclick="copyPick\(\)">前回のファイルから設定を引き継ぐ/.test(P()));
    O.meta.date='2027.8.28'; app.render();
    T('曜日が出る', ()=>/<small class="mk-dw">（土）/.test(P()));
    O.meta.date='そのうち'; app.render();
    T('読めない日付は知らせる', ()=>/日付として読めません/.test(P()));
    X('mkStep',2);
    T('2段目は競技方法', ()=>/STEP 2 \/ 3/.test(P())&&(P().match(/class="mk-opt[ "]/g)||[]).length===3&&/class="mk-opt on" aria-pressed="true" onclick="SCset\('system','double'\)"/.test(P()));
    T('方式は大きな選択肢だけ（選択欄を重ねない）', ()=>!/SCset\('system',this\.value\)/.test(P())&&/SCset\('cut',this\.value\)/.test(P())&&/SCset\('tiebreak',this\.value\)/.test(P()));
    T('戻る先は基本', ()=>/<button class="mk-back" onclick="mkStep\(1\)">← 基本<\/button>/.test(P()));
    app.SCset('system','new');
    T('押すと選ばれ、段は変わらない', ()=>/class="mk-opt on" aria-pressed="true" onclick="SCset\('system','new'\)"/.test(P())&&S3.MKSTEP===2);
    app.SCset('system','double');
    X('mkStep',3);
    T('3段目は追加ルールのカード', ()=>/STEP 3 \/ 3 ・ 任意/.test(P())&&(P().match(/class="mod rcard/g)||[]).length===11);
    T('増える画面の数', ()=>/7個を使用中 → 画面が <b>＋7<\/b>/.test(P()), ()=>(P().match(/\d+個を使用中[^<]*<b>[^<]*/)||[''])[0]);
    app.useSet('lucky',true);
    T('発表の画面だけ増えるルールは画面の数を変えない', ()=>/8個を使用中 → 画面が <b>＋7<\/b>/.test(P()));
    T('作るボタンとルールなしのボタン', ()=>/onclick="mkDone\(\)">この内容で大会を作る/.test(P())&&/onclick="mkBare\(\)">ルールなしで作る/.test(P()));
    X('mkDone');
    T('作ると大会ハブへ', ()=>app.TAB==='hub');
    app.go('make');
    T('次に開くと1段目から', ()=>/STEP 1 \/ 3/.test(P()));
    X('mkStep',3); X('mkBare');
    T('ルールなしはスコアだけ残す', ()=>Object.entries(O.meta.use).every(([k,v])=>k==='score'?v===true:v===false)&&app.TAB==='hub', ()=>JSON.stringify(O.meta.use));
    O.players.push({n:'甲　一郎',org:'',bd:'',g:0,f:0,vote:true,fee:true,feeAmt:''});
    app.go('make');
    T('参加者が入ったら作成画面は出さない（大会設定へ）', ()=>app.TAB==='meta');
    T('次にやることも大会設定へ', ()=>app.flowSteps()[0].at==='');
  }
  {
    app.sample(); global.flush();
    X('newCompe');
    T('新しい大会は白紙で作成画面へ', ()=>app.TAB==='make'&&app.DB().players.length===0&&app.DB().keiba.length===0&&S3.FILENAME==='');
    X('recentAdd','前回.json');
    const r=(X('recentList')||[])[0]||{}; r.place='△△ゴルフ場'; r.par=[5,4,3,4,4,5,3,4,4, 4,4,3,5,4,4,3,4,5];
    localStorage.setItem('golfCompe.recent.v1',JSON.stringify([r]));
    app.render();
    T('最近使った会場を出す', ()=>/onclick="mkPlaceUse\(0\)">△△ゴルフ場<\/button>/.test(P()));
    X('mkPlaceUse',0);
    T('押すと会場とパーが入る', ()=>app.DB().meta.place==='△△ゴルフ場'&&app.DB().meta.sc.par[0]===5);
  }

  console.log('  -- 前回の設定を引き継ぐ（ルール・賞・コースだけ） --');
  {
    app.sample(); global.flush();
    const prev=JSON.parse(JSON.stringify(app.DB()));
    prev.meta.kPrice=300; prev.meta.nearHoles=[3,7]; prev.meta.sc.system='new'; prev.meta.use.team=true;
    prev.meta.prizes.rank[0].amt=20000; prev.meta.budget.fee=5000; prev.meta.budget.income=[{label:'協賛',amt:10000}];
    prev.courses=[{name:'前回のコース',par:prev.meta.sc.par.slice()}];
    const O=app.blank(); app.setDB(O); app.go('make');
    X('copyPrev',{_text:JSON.stringify(prev)});
    const m=app.DB().meta;
    T('大会名は回数を1つ進める', ()=>m.name==='第11回 親睦ゴルフコンペ', ()=>m.name);
    T('開催日・参加者・予想・スコアは引き継がない', ()=>m.date===''&&app.DB().players.length===0&&app.DB().keiba.length===0&&Object.keys(app.DB().scores).length===0);
    T('ルール・競技方法・ホール・単価を引き継ぐ', ()=>m.use.team===true&&m.sc.system==='new'&&m.nearHoles.join()==='3,7'&&m.kPrice===300);
    T('賞と原資を引き継ぐ', ()=>m.prizes.rank[0].amt===20000&&m.budget.fee===5000&&m.budget.collect[0].amt===prev.meta.budget.collect[0].amt);
    T('収支の実績は引き継がない', ()=>m.budget.income.length===0);
    T('会場と登録済みのコース', ()=>m.place==='○○カントリークラブ'&&app.DB().courses.some(c=>c.name==='前回のコース'));
    T('複製なので前回のデータとつながらない', ()=>{prev.meta.nearHoles.push(9);prev.meta.prizes.rank[0].amt=1;return m.nearHoles.join()==='3,7'&&m.prizes.rank[0].amt===20000;});
    T('作成画面で結果を知らせる', ()=>app.TAB==='make'&&/第10回 親睦ゴルフコンペ」のルール・賞・コースを引き継ぎました。大会名は「第11回 親睦ゴルフコンペ」にしました。/.test(P()));
    const before=JSON.stringify(app.DB());
    X('copyPrev',{_text:'壊れたファイル'});
    T('読めないファイルでは何も変えない', ()=>JSON.stringify(app.DB())===before);
    app.DB().players.push({n:'乙　二郎',org:'',bd:'',g:0,f:0,vote:true,fee:true,feeAmt:''});
    app.DB().meta.name='秋の大会';
    X('copyPrev',{_text:JSON.stringify(prev)});
    T('参加者がいれば名前は変えず、大会設定で知らせる', ()=>app.DB().meta.name==='秋の大会'&&app.DB().players.length===1&&app.TAB==='meta');
  }

  console.log('  -- 大会ハブ（P4・P9の仕上げ） --');
  app.sample(); global.flush(); app.setPhase('prep');
  const D=app.DB();
  app.go('hub');
  T('左に次にやること・数字・チェックリスト、右に追加ルール・流れ・集金', ()=>/<div class="hb-main">\s*<div class="hb-left"><div class="nx no-print">[\s\S]*<div class="hb-stats">[\s\S]*class="card hb-ck"[\s\S]*<div class="hb-right"><div class="card hb-rl">[\s\S]*class="card hb-fl"[\s\S]*class="card hb-est"/.test(P()));
  T('次にやることは1つだけ', ()=>(P().match(/class="nx-k">次にやること/g)||[]).length===1);
  T('使っているルールの札', ()=>/<button class="rl-c" onclick="go\('rules'\)">ニアピン ×4<\/button>/.test(P())&&/<button class="rl-c add" onclick="go\('rules'\)">＋ 足す<\/button>/.test(P()));
  T('馬券・GTOを使っているときの説明', ()=>/「予想入力」と「集計」の画面があります/.test(P()));
  T('当日の流れ（発表まで）', ()=>/<h2>当日の流れ<small>5つ<\/small><\/h2>\s*<ol><li class=""><b>1<\/b><span>集金する<\/span><\/li>/.test(P())&&/<li class=" after"><b>5<\/b><span>発表する<small>（発表）<\/small>/.test(P()));
  T('予想が入っていれば集金は平均', ()=>/<h2>集金の平均（ひとり）<\/h2><b>[\d,]+<em>円<\/em><\/b>/.test(P()));
  T('内訳を出す', ()=>/<span>プレー代 [\d,]+ ＋ [\s\S]*馬券（[\d.]+口） [\d,]+/.test(P()));
  T('チェックリストは2列', ()=>/\.hb-cl\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/.test(css));
  T('右の列は340px（P4）', ()=>/\.hb-main\{display:grid;grid-template-columns:minmax\(0,1fr\) 340px;/.test(css));
  app.useSet('budget',false); app.useSet('budget',true); app.render();
  T('足したルールで増えた当日の画面は色を変える（P9）', ()=>/<li class="nw"><b>1<\/b><span>集金する/.test(P()));
  app.go('collect'); app.go('hub');
  T('開けば色は戻る', ()=>/<li class=""><b>1<\/b><span>集金する/.test(P()));
  D.meta.use.keiba=false; D.meta.use.gto=false; D.meta.use.fine=false; app.render();
  T('予想ゲームを外せば、口数が残っていても見込み', ()=>/<h2>集金の見込み（ひとり）<\/h2>/.test(P()));
  T('予想ゲームが無ければ参加者・組合せ・競技方法（P4）', ()=>{const L=[...P().matchAll(/<button class="hb-s"[^>]*><small>([^<]*)/g)].map(x=>x[1]);return L.join('/')==='参加者/組合せ/競技方法';}, ()=>[...P().matchAll(/<button class="hb-s"[^>]*><small>([^<]*)/g)].map(x=>x[1]).join('/'));
  T('競技方法は和文の書体で、要約から方式名を除く', ()=>/<small>競技方法<\/small><b><span class="tx">ダブルペリア<\/span><\/b>\s*<span class="">上限パー×3・ハンディ上限30・同スコアは年長者<\/span>/.test(P()));
  T('組とスタート時刻', ()=>/<small>組合せ<\/small><b>4<em> \/ <\/em>4<em>組<\/em><\/b>/.test(P()));
  T('馬券・GTOが無いときの説明', ()=>/馬券・GTOは入れていません。入れると「予想入力」と「集計」の画面が現れます。/.test(P()));
  D.groups.forEach(g=>g.time=''); app.render();
  T('スタート時刻が無ければ知らせる', ()=>/<span class="ng">● スタート時刻 未設定 4組<\/span>/.test(P()));
  D.groups.forEach((g,i)=>g.time='8:'+(10+i*8)); app.render();
  T('入っていれば済み', ()=>/<span class="ok">✓ スタート時刻 設定済<\/span>/.test(P()));
  D.meta.use.keiba=true; D.meta.use.gto=true; D.meta.use.fine=true;
  app.setPhase('day'); app.go('hub');
  T('当日は集金・スコア・技能賞の進み', ()=>[...P().matchAll(/<button class="hb-s"[^>]*><small>([^<]*)/g)].map(x=>x[1]).join('/')==='集金/スコア/ニアピン・ドラコン');
  T('当日のチェックリストと発表の流れ', ()=>/<h2>当日のチェックリスト<small>/.test(P())&&/<h2>発表の流れ<small>2つ<\/small>/.test(P()));
  T('いま取りかかる行を目立たせる', ()=>/class="hb-li cur" onclick="goStep\('collect',''\)"/.test(P()));
  console.log('  -- サイドバーの印 --');
  T('いま取りかかる画面は黄色の輪', ()=>/class="sd-i part" onclick="go\('collect'\)"/.test(SD()));
  T('済んだ画面は✓', ()=>/class="sd-i ok" onclick="go\('score'\)"/.test(SD()));
  app.setPhase('award'); app.go('hub');
  T('発表では次の流れを出さない', ()=>!/class="card hb-fl"/.test(P())&&/<h2>発表のチェックリスト/.test(P()));
  app.setPhase('prep'); app.go('hub');
  T('準備中は手を付けていない集金に輪を付けない', ()=>/class="sd-i" onclick="go\('collect'\)"/.test(SD()));
  T('ロゴからホームへ', ()=>/<button class="sd-brand" onclick="go\('home'\)"/.test(SD()));
  T('足元にホーム・データ・使い方', ()=>/<div class="sd-foot"><button class="sd-l" onclick="go\('home'\)">ホーム<\/button><button class="sd-l" onclick="go\('data'\)">データ<\/button><button class="sd-l" onclick="go\('help'\)">使い方<\/button><\/div>/.test(SD()));
  {
    const O=app.blank(); app.setDB(O); app.go('hub');
    T('参加者がいなければ枠の注意は出さない', ()=>/<span class="">枠は参加者を入れてから決めます<\/span>/.test(P()));
    T('予想が無ければ集金は見込み', ()=>/<h2>集金の見込み（ひとり）<\/h2><b>2,700<em>円<\/em><\/b>/.test(P()));
    T('手を付けていない技能賞に輪を付けない', ()=>/class="sd-i" onclick="go\('prize'\)"/.test(SD()));
  }
  app.sample(); global.flush(); app.setPhase('prep'); app.go('hub');
}

console.log('\n=== 準備（段階4：参加者P5・組合せP6） ===');
/* 2026-09-17。決めたこと：
   ・参加者の表は「基本（氏名・所属・生年月日・組）」を既定にし、枠と実力／参加とお金の列はまとまりで切り替える。列は削らない
   ・スマホで人を組へ移すのは「押して行き先の組を選ぶ」＋「長押しで運ぶ」（以前の組ごとの選択欄は置き換える）
   ・スタート時刻は「最初の時刻＋間隔」で全組に入れられる（データは項目の追加のみ） */
{
  const S4=app.S4();
  localStorage._fail=false; app.setLS(true);
  const P=()=>store['pane'].innerHTML;
  const X=(f,...a)=>{try{return S4[f]?S4[f](...a):undefined;}catch(e){console.log('  （'+f+' で例外：'+e.message+'）');}};
  const T=(l,f,x)=>{let v,e='';try{v=f();}catch(err){v=false;e=String(err&&err.message||err);}chk(l,!!v,e||(typeof x==='function'?(()=>{try{return x();}catch(_){return '';}})():x||''));};
  const i4=h.indexOf('/* ---- 段階4：参加者（P5）・組合せ（P6）');
  const css=i4>=0?h.slice(i4,h.indexOf('/* ---- 準備 → 当日 → 発表',i4)):'';

  console.log('  -- 参加者：列のまとまり --');
  app.sample(); global.flush(); app.setPhase('prep'); app.go('players');
  T('既定は基本の列', ()=>S4.PCOL==='b'&&/<div class="pwrap v-b">/.test(P()));
  T('切替は3つ（枠を自分で決めるサンプル①）', ()=>/<button class="on" aria-pressed="true" onclick="pColSet\('b'\)">基本<\/button><button class="" aria-pressed="false" onclick="pColSet\('f'\)">枠と実力<\/button><button class="" aria-pressed="false" onclick="pColSet\('m'\)">参加とお金<\/button>/.test(P()), ()=>(P().match(/<div class="p-seg"[\s\S]*?<\/div>/)||[''])[0]);
  T('基本は氏名・所属・生年月日・組', ()=>/<th style="min-width:10\.5em">氏名<\/th><th class="col cb" style="min-width:8em">所属・部署<\/th><th class="col cb" style="min-width:8\.5em">生年月日<\/th>\s*<th class="c col cb cf" style="min-width:6em">組<\/th>/.test(P()));
  T('枠と実力の列', ()=>/<th class="c col cf" style="min-width:7\.5em">枠<\/th><th class="n col cf" style="min-width:7em">実力の目安<\/th>/.test(P()));
  T('参加とお金の列', ()=>/<th class="c col cm" style="min-width:12\.5em">参加のしかた<\/th>/.test(P())&&/<th class="c col cm" style="width:56px">原資<\/th><th class="n col cm" style="min-width:6\.5em">個別額<\/th>/.test(P()));
  T('列は削らず全部描く（見せる列だけを選ぶ）', ()=>(P().match(/joinSet\(/g)||[]).length===16&&(P().match(/pEdit\(\d+,'feeAmt'/g)||[]).length===16&&(P().match(/pEdit\(\d+,'skill'/g)||[]).length===16);
  T('見せる列を選ぶ指定', ()=>/\.ptab \.col\{display:none\}/.test(css)&&/\.pwrap\.v-b \.ptab \.cb,\.pwrap\.v-f \.ptab \.cf,\.pwrap\.v-m \.ptab \.cm\{display:table-cell\}/.test(css));
  T('説明もまとまりごとに出す', ()=>/<div class="msg pv pv-m">[\s\S]*参加のしかた<\/b>は3つから選びます/.test(P())&&/\.pwrap\.v-b \.pv-b,\.pwrap\.v-f \.pv-f,\.pwrap\.v-m \.pv-m\{display:block\}/.test(css));
  T('枠を割り振るボタンは枠と実力の中', ()=>/<span class="pv pv-f"><button class="btn ghost" onclick="fPair2\(\)">/.test(P()));
  X('pColSet','m');
  T('参加とお金に切り替える', ()=>/<div class="pwrap v-m">/.test(P())&&/aria-pressed="true" onclick="pColSet\('m'\)"/.test(P()));
  app.go('hub'); app.go('players');
  T('画面を移っても選んだまとまりを保つ（ファイルには残さない）', ()=>/<div class="pwrap v-m">/.test(P())&&!('pcol' in app.DB().meta)&&!JSON.stringify(app.DB()).includes('PCOL'));
  app.DB().meta.frameMode='group'; X('pColSet','f');
  T('枠が組と同じなら「枠と実力」は出さず、基本に戻す', ()=>!/pColSet\('f'\)/.test(P())&&/<div class="pwrap v-b">/.test(P()));
  T('枠が組と同じ番号になると知らせる', ()=>/<div class="msg pv pv-b">組を決めると、<b>馬券の枠は組と同じ番号が自動で入ります<\/b>/.test(P()));
  app.DB().meta.frameMode='manual';
  app.useSet('keiba',false);
  T('馬券を使わなければ「枠と実力」は出さない', ()=>!/pColSet\('f'\)/.test(P()));
  app.useSet('keiba',true);
  app.DB().players[0].f=0; app.render();
  T('枠の決まっていない方がいると印', ()=>/枠と実力<i class="p-w">●<\/i><\/button>/.test(P()));
  app.goStep('players','@pcol-f');
  T('次にやることから枠と実力へ', ()=>app.TAB==='players'&&S4.PCOL==='f');
  app.sample(); global.flush(); X('cAdd','車代（1台あたり）','unit'); app.go('players');
  T('車を出す方が決まっていなければ印', ()=>/参加とお金<i class="p-w">●<\/i><\/button>/.test(P()));
  X('pColSet','b');
  console.log('  -- 参加者：上の操作と右の列 --');
  app.sample(); global.flush(); app.go('players');
  T('1名追加と次へ', ()=>/<button class="btn" onclick="pAdd\(\)">＋ 1名追加<\/button>\s*<button class="btn primary" onclick="go\('groups'\)">次へ：組合せ →<\/button>/.test(P()));
  T('人数と入力の進み', ()=>/<span class="p-sum">16名・生年月日 16\/16・所属 16\/16<\/span>/.test(P()));
  T('貼り付けは右の列（主役）', ()=>/<div class="p-side no-print">\s*<div class="card"><h2>貼り付けて取り込む<\/h2>[\s\S]*<textarea id="bulk"[\s\S]*onclick="bulkPreview\(\)">読み取って追加する/.test(P()));
  T('右の列は340px。1列に畳むときもはみ出さない', ()=>/\.p-grid\{display:grid;grid-template-columns:minmax\(0,1fr\) 340px;/.test(css)&&/@media screen and \(max-width:1180px\)\{\.p-grid\{grid-template-columns:minmax\(0,1fr\)\}/.test(css));
  T('生年月日が要る理由（年長者を上位）', ()=>/<h2>生年月日はなぜ必要？<\/h2>\s*<p>同スコアのとき年長者を上位にする設定のためです。/.test(P()));
  app.SCset('tiebreak','lowhc');
  T('使わない設定ならそう書く', ()=>/いまの設定（同スコアはハンディの小さい方）では順位に使いません。/.test(P()));
  app.SCset('tiebreak','older');
  T('並べ替えと削除は1つの欄に', ()=>/<td class="c no-print p-ops"><button class="mv" onclick="pMove\(0,-1\)" aria-label="上へ">▲<\/button><button class="mv" onclick="pMove\(0,1\)" aria-label="下へ">▼<\/button><button class="del" onclick="pDel\(0\)" aria-label="削除">×<\/button><\/td>/.test(P()));
  T('氏名と所属は打つたびに作り直さない', ()=>/oninput="pEdit\(0,'n',this\.value\)"/.test(P())&&/oninput="pEdit\(0,'org',this\.value\)"/.test(P()));
  app.setDB(app.blank()); app.go('players');
  T('空のときは貼り付けを先に（スマホで上）', ()=>/<div class="p-side no-print first">/.test(P())&&/\.p-side\.first\{order:-1\}/.test(css));
  T('空の表から貼り付けへ案内', ()=>/「貼り付けて取り込む」（PCでは右、スマホでは下）で、Excelから一度に入れられます/.test(P()));

  console.log('  -- 組合せ：カードとトレイ --');
  app.sample(); global.flush(); app.setPhase('prep');
  const D=app.DB();
  /* 12〜14：名簿に足したばかりで組の決まっていない方（原資の対象のまま）。15：予想のみ */
  [12,13,14,15].forEach(k=>{D.players[k].g=0; D.players[k].f=0;});
  X('joinSet',15,'vote');
  app.go('groups');
  T('未割り当ては組の決まっていない方（予想のみは入れない）', ()=>(X('gWait')||[]).map(p=>p.n).join()===D.players.slice(12,15).map(p=>p.n).join(), ()=>(X('gWait')||[]).length);
  T('トレイは運べる場所（data-g="0"）で人数を出す', ()=>/<div class="card g-tray no-print" data-g="0" ondragover="gpOver\(event,0\)" ondrop="gpDrop\(event,0\)"[^>]*>\s*<h2>未割り当て<small>3<\/small><\/h2>/.test(P()));
  T('予想のみの方はトレイの下に分けて出す', ()=>/<div class="g-vo"><div class="g-voh">組から外した方・予想のみの方<small>1<\/small><\/div>[\s\S]*data-i="15"/.test(P()));
  T('人は押せるボタン（押す・長押し・ドラッグ）', ()=>new RegExp('<button class="gp" draggable="true" data-i="12" ondragstart="gpStart\\(event,\'[^\']+\'\\)"\\s*ontouchstart="lpStart\\(event,12\\)" onclick="gPickI\\(12\\)" title="押すと行き先の組を選べます"><b>').test(P()));
  T('組ごとの選択欄は置き換えた', ()=>!/title="組を変える"/.test(P())&&!/onchange="gMove\(/.test(P()));
  T('組のカードは運べる場所（data-g）', ()=>/<div class="gcard" data-g="1" ondragover="gpOver\(event,1\)"/.test(P()));
  T('組番号と時刻', ()=>/<h3><b class="g-no">1<\/b><span>組<\/span><input class="g-time" value="8:00" placeholder="8:00" aria-label="1組のスタート時刻" onchange="gTime\(1,this\.value\)">/.test(P()));
  T('人のいない組は運び先を大きく出す', ()=>{const c=P().split('data-g="4"')[1].split('class="gcard')[0];return /<div class="g-slot g-empty no-print">ここへ運ぶ（4名）<\/div>/.test(c);});
  T('上の操作（スタート・自動割り当て・印刷）', ()=>/<div class="g-top no-print" id="g-start">/.test(P())&&/<b>3名が未割り当て<\/b>/.test(P())&&/onclick="gTimeFill\(\)">全組に時刻を入れる/.test(P())&&/<button class="btn primary" onclick="gFill\(\)">残りを自動で割り当てる<\/button>/.test(P())&&/onclick="window\.print\(\)">スタート表を印刷/.test(P()));
  T('トレイの下にも自動の割り当て', ()=>/<button class="btn primary g-fill" onclick="gFill\(\)">残りを自動で割り当てる<\/button>/.test(P()));
  T('全員を割り当て直すのは別のボタン', ()=>/onclick="gAuto\(\)">全員を上から順に割り当て直す/.test(P()));
  T('トレイは右（260px）、狭い画面では上', ()=>/\.g-grid\{display:grid;grid-template-columns:minmax\(0,1fr\) 260px;/.test(css)&&/\.g-grid\{grid-template-columns:minmax\(0,1fr\)\}\.g-tray\{position:static;order:-1\}/.test(css));
  T('スマホの組カードは1列のまま（760px以下は既存の指定）', ()=>/@media screen and \(min-width:761px\)\{\.g-main \.gcards\{/.test(css));
  T('長押しで文字選択やメニューを出さない', ()=>/\.gp\{[^}]*-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:manipulation/.test(css));
  T('印刷では人を文字だけに', ()=>/@media print\{\.g-grid\{display:block\}\.gp\{min-height:0;/.test(css));

  console.log('  -- 押して行き先の組を選ぶ --');
  X('gPickI',12);
  T('行き先の欄が出る', ()=>S4.GPICK===12&&/<div class="gsheet no-print" role="dialog" aria-label="[^"]+さんの組を選ぶ">/.test(P()));
  T('満員の組は選べない', ()=>/<button class="" disabled onclick="gMoveI\(12,1\)">1組<small>満員<\/small><\/button>/.test(P()));
  T('空きのある組は人数を出す', ()=>/<button class="" onclick="gMoveI\(12,4\)">4組<small>0\/4<\/small><\/button>/.test(P()));
  T('新しい組も作れる', ()=>/onclick="gMoveI\(12,-1\)">＋ 新しい組<\/button>/.test(P()));
  T('未割り当ての人には「未割り当てへ」を出さない', ()=>!/gMoveI\(12,0\)/.test(P()));
  T('押した人に印', ()=>/<button class="gp on"[^>]*data-i="12"/.test(P()));
  T('画面の下に固定（スマホは下タブの上）', ()=>/\.gsheet\{position:fixed;left:50%;bottom:16px;/.test(css)&&/\.gsheet\{bottom:calc\(76px \+ env\(safe-area-inset-bottom\)\)\}/.test(css));
  X('gPickI',12);
  T('もう一度押すと閉じる', ()=>S4.GPICK===-1&&!/class="gsheet/.test(P()));
  X('gPickI',12); X('gMoveI',12,4);
  T('空きを見せる（4組は1名なので空き3つ）', ()=>{const c=P().split('data-g="4"')[1].split('class="gcard')[0];return (c.match(/class="g-slot no-print">空き</g)||[]).length===3;});
  T('選ぶと移り、欄が閉じる', ()=>+D.players[12].g===4&&S4.GPICK===-1&&!/class="gsheet/.test(P()));
  T('枠を自分で決める運用では、組に入っても枠は自分で決める', ()=>+D.players[12].f===0);
  X('gPickI',12);
  T('いまの組は選べない・組から外せる', ()=>/<button class="cur" disabled onclick="gMoveI\(12,4\)">4組<small>いまの組<\/small><\/button>/.test(P())&&/onclick="gMoveI\(12,0\)">組から外す<\/button>/.test(P()));
  X('gMoveI',12,-1);
  T('新しい組を作って入れる', ()=>D.groups.length===5&&+D.players[12].g===5&&D.groups[4].time==='');
  D.players[12].f=7; X('gMoveI',12,0); D.groups.pop(); app.render();
  /* 組から外すと原資も外れる（touch.js・9/8の決まり）。データの上では予想のみと同じになるので、
     トレイの下の段に出る。消えてしまわないことを確かめる */
  T('組から外した方は消えずにトレイの下の段に出る', ()=>+D.players[12].g===0&&D.players[12].fee===false&&/<div class="g-vo">[\s\S]*data-i="12"/.test(P()));
  X('gMoveI',12,4); X('gMoveI',12,0); D.players[12].fee=true; app.render();

  console.log('  -- ドラッグで落とす（PC） --');
  D.players[0].f=1;
  const ev={preventDefault(){},dataTransfer:{effectAllowed:'',setData(){}},currentTarget:{classList:{add(){},remove(){}}}};
  X('gpStart',ev,D.players[0].n); X('gpDrop',ev,0);
  /* v47まで：p.g だけを変えていたので、枠を自分で決める運用で未割り当てへ戻しても枠と原資が残った */
  T('未割り当てへ落とすと枠も外れ、原資の対象からも外れる', ()=>+D.players[0].g===0&&+D.players[0].f===0&&D.players[0].fee===false, ()=>JSON.stringify([D.players[0].g,D.players[0].f,D.players[0].fee]));
  X('gpStart',ev,D.players[0].n); X('gpDrop',ev,1);
  T('組へ落とす', ()=>+D.players[0].g===1);

  console.log('  -- 長押しで運ぶ（スマホ・タブレット） --');
  {
    const el={classList:{add(){},remove(){}}};
    const tv=(x,y,extra)=>Object.assign({touches:[{clientX:x,clientY:y}],currentTarget:el},extra||{});
    let prevented=0; const pd={cancelable:true,preventDefault(){prevented++;}};
    const zone=g=>({closest:()=>({dataset:{g:String(g)},classList:{add(){},remove(){}}})});
    const n13=D.players[13];
    X('lpStart',tv(100,100),13);
    X('lpMove',tv(100,130,pd));
    T('押してすぐ指が動いたらスクロール（運ばない）', ()=>S4.LP===null&&prevented===0);
    global.flush();
    T('取りやめた長押しが後から動き出さない', ()=>S4.LP===null);
    X('lpStart',tv(100,100),13);
    T('押した直後はまだ運ばない', ()=>S4.LP&&S4.LP.on===false);
    global.flush();
    T('長く押すと運ぶ状態になる', ()=>S4.LP&&S4.LP.on===true);
    document.elementFromPoint=()=>zone(4);
    X('lpMove',tv(300,400,pd));
    T('運んでいる間はスクロールを止める', ()=>prevented===1&&S4.LP.to===4);
    X('lpEnd',pd);
    T('離した組へ移る', ()=>+n13.g===4&&S4.LP===null&&prevented===2);
    X('gPickI',13);
    T('運んだ直後の「押した」は無視する', ()=>S4.GPICK===-1);
    const inLP=h.indexOf('function lpStart');
    T('長押しは450ms（LPMS）', ()=>/const LPMS=450;/.test(h)&&inLP>0);
    X('lpStart',tv(100,100),14); global.flush();
    document.elementFromPoint=()=>({closest:()=>null});
    X('lpMove',tv(10,10,pd)); X('lpEnd',pd);
    T('組の外で離すと何もしない', ()=>+D.players[14].g===0&&S4.LP===null);
    delete document.elementFromPoint;
    X('lpStart',{touches:[{clientX:0,clientY:0},{clientX:5,clientY:5}],currentTarget:el},14);
    T('2本指では始めない（拡大縮小を邪魔しない）', ()=>S4.LP===null);
    T('スクロールを止められるよう passive:false で受ける', ()=>/document\.addEventListener\("touchmove",lpMove,\{passive:false\}\);/.test(h)&&/document\.addEventListener\("touchend",lpEnd,\{passive:false\}\);/.test(h)&&/document\.addEventListener\("touchcancel",\(\)=>lpCancel\(\)\);/.test(h));
    T('運ぶ人の名前を指の上に出す', ()=>/gh\.className="lp-ghost"/.test(h)&&/\.lp-ghost\{position:fixed;[^}]*pointer-events:none/.test(css));
  }

  console.log('  -- 残りを自動で割り当てる --');
  app.sample(); global.flush(); app.setPhase('prep');
  const E=app.DB(); const keep=E.players.slice(0,8).map(p=>p.g).join();
  [9,10,14].forEach(k=>{E.players[k].g=0;E.players[k].f=0;});
  X('gFill');
  T('決めた組は動かさない', ()=>E.players.slice(0,8).map(p=>p.g).join()===keep);
  T('空いた組へ上から入る', ()=>+E.players[9].g===3&&+E.players[10].g===3&&+E.players[14].g===4, ()=>[9,10,14].map(k=>E.players[k].g).join());
  T('どの組も定員を超えない', ()=>E.groups.every(g=>app.inGroup(g.no).length<=4));
  E.players.push({n:'追加　一郎',org:'',bd:'',g:0,f:0,vote:true,fee:true,feeAmt:''});
  X('gFill');
  T('空きが無ければ組を足す', ()=>E.groups.length===5&&+E.players[16].g===5);
  let msg=null; const al=global.alert; global.alert=m=>{msg=m;};
  X('gFill');
  global.alert=al;
  T('全員決まっていれば知らせるだけ', ()=>msg==='組の決まっていない方はいません。');

  console.log('  -- スタート時刻 --');
  T('時刻を読む', ()=>X('tParse','8:00')===480&&X('tParse','８：０５')===485&&X('tParse','8時5分')===485&&X('tParse',' 7.30 ')===450);
  T('ありえない時刻は読まない', ()=>X('tParse','25:00')===null&&X('tParse','8:60')===null&&X('tParse','')===null&&X('tParse','朝')===null);
  T('サンプルは 8:00 から 8分間隔', ()=>E.meta.startAt==='8:00'&&E.meta.startGap===8);
  T('古いファイルには既定値を補う', ()=>{const o=JSON.parse(JSON.stringify(E));delete o.meta.startAt;delete o.meta.startGap;const m=app.migrate(o).meta;return m.startAt===''&&m.startGap===7;});
  X('gStartSet','at',' 7:30 '); X('gStartSet','gap','9');
  T('最初の時刻と間隔を入れる', ()=>E.meta.startAt==='7:30'&&E.meta.startGap===9);
  X('gTimeFill');
  T('全組に間隔をそろえて入る', ()=>E.groups.map(g=>g.time).join()==='7:30,7:39,7:48,7:57,8:06', ()=>E.groups.map(g=>g.time).join());
  X('gStartSet','gap','abc'); T('間隔が読めなければ7分', ()=>E.meta.startGap===7);
  X('gStartSet','gap','500'); T('間隔は60分まで', ()=>E.meta.startGap===60);
  X('gStartSet','gap','0'); T('0分は7分に', ()=>E.meta.startGap===7);
  X('gStartSet','at','23:55'); X('gStartSet','gap','10'); X('gTimeFill');
  T('日をまたいでも崩れない', ()=>E.groups[1].time==='0:05', ()=>E.groups[1].time);
  const before=E.groups.map(g=>g.time).join(); msg=null; global.alert=m=>{msg=m;};
  X('gStartSet','at','あさ'); X('gTimeFill');
  global.alert=al;
  T('最初の時刻が読めなければ入れない', ()=>msg&&/「8:00」の形/.test(msg)&&E.groups.map(g=>g.time).join()===before);
  app.go('groups');
  T('入れた値が欄に出る', ()=>/id="gStartAt" value="あさ"/.test(P())&&/id="gStartGap" type="number" min="1" max="60" value="10"/.test(P()));
  if(E.groups[4]) E.groups[4].time='';
  const st=app.flowSteps().find(x=>x.label==='スタート時刻を入れる');
  T('時刻の無い組があれば「次にやること」に出す', ()=>st&&!st.done&&st.rest==='残り1組'&&st.tab==='groups'&&st.at==='g-start');
  X('gTime',5,' 9:00 ');
  T('組ごとに入れても済む（空白は除く）', ()=>E.groups[4].time==='9:00'&&app.flowSteps().find(x=>x.label==='スタート時刻を入れる').done);
  T('人のいない組は数えない', ()=>{E.groups.push({no:6,time:''});const r=app.flowSteps().find(x=>x.label==='スタート時刻を入れる').done;E.groups.pop();return r;});
}

console.log('\n=== 当日と結果（段階5：スコア入力P7・順位・表彰P8） ===');
/* 2026-09-17。決めたこと：
   ・集計表方式だけ右の列（検算・貼り付け・入力後の案内）。隠しホール／18ホールは表を全幅
   ・Enter で次の欄（数値欄だけ、変換中は除外）。Tab はブラウザの標準のまま
   ・順位表に「賞」の列を足す（印刷にも出す） */
{
  const S5=app.S5();
  const P=()=>store['pane'].innerHTML;
  const X=(f,...a)=>{try{return S5[f]?S5[f](...a):undefined;}catch(e){console.log('  （'+f+' で例外：'+e.message+'）');}};
  const T=(l,f,x)=>{let v,e='';try{v=f();}catch(err){v=false;e=String(err&&err.message||err);}chk(l,!!v,e||(typeof x==='function'?(()=>{try{return x();}catch(_){return '';}})():x||''));};
  const i5=h.indexOf('/* ---- 段階5：スコア入力（P7）・順位・表彰（P8）');
  const css=i5>=0?h.slice(i5,h.indexOf('/* ---- 準備 → 当日 → 発表',i5)):'';

  console.log('  -- スコア入力：集計表方式（右の列） --');
  app.sample(); global.flush(); app.setPhase('day'); app.SCset('entry','sheet');
  const run=app.RUN();
  run.forEach(p=>{const sc=app.scoreOf(p.n); sc.gross=''; sc.hc=''; sc.netRef='';});
  app.go('score');
  T('空のときは貼り付けを開いておく', ()=>/<details class="card s-paste" open><summary>集計表を貼り付けて取り込む<\/summary>/.test(P())&&/<textarea id="paste"/.test(P()));
  run.forEach((p,i)=>{if(i<12){const sc=app.scoreOf(p.n); sc.gross=90; sc.hc=10; sc.netRef=80;}});
  app.scoreOf(run[2].n).netRef=79.4;
  app.scoreOf(run[12].n).gross=95;
  app.scoreOf(run[13].n).gross=88; app.scoreOf(run[13].n).hc=8;
  app.go('score');
  T('上に入力の進み', ()=>/<div class="s-prog" role="progressbar" aria-label="入力の進み" aria-valuemin="0" aria-valuemax="16" aria-valuenow="13"><i style="width:81%"><\/i><\/div>/.test(P()));
  T('入力済みの数と確定の条件', ()=>/<span class="s-cnt"><b>13 \/ 16<\/b> 入力済<\/span>/.test(P())&&/<b class="s-ngc">× 1行<\/b> ・ 全行○で確定/.test(P()));
  T('入れ方は上で切り替える', ()=>/<div class="s-seg" role="group" aria-label="スコアの入れ方"><button class="on" aria-pressed="true" onclick="SCset\('entry','sheet'\)">ゴルフ場の集計表から<\/button><button class="" aria-pressed="false" onclick="SCset\('entry','hidden'\)">/.test(P()));
  T('左に表、右に検算・貼り付け・入力後の案内', ()=>/<div class="s-grid">\s*<div class="card no-print s-main">[\s\S]*<div class="s-side no-print">\s*<div class="card s-check"><h2>打ち込みの検算[\s\S]*<details class="card s-paste"><summary>[\s\S]*<div class="card s-end"><h2>入力が終わったら<\/h2>/.test(P()));
  T('入力が進めば貼り付けは畳む', ()=>/<details class="card s-paste"><summary>/.test(P()));
  T('貼り付けの確認は表の上に全幅で', ()=>P().indexOf('<div id="pv" class="no-print"></div>')>=0&&P().indexOf('id="pv"')<P().indexOf('class="s-grid"'));
  T('右の列は340px。1列に畳むときもはみ出さない', ()=>/\.s-grid\{display:grid;grid-template-columns:minmax\(0,1fr\) 340px;/.test(css)&&/\.s-grid\{grid-template-columns:minmax\(0,1fr\)\}/.test(css));
  T('列は 組・氏名・グロス・HDCP・ネット・検算・順位', ()=>/<th class="c" style="min-width:2\.5em">組<\/th><th style="min-width:10\.5em">氏名<\/th>\s*<th class="n" style="width:82px">グロス<\/th><th class="n" style="width:82px">HDCP<\/th>\s*<th class="n" style="width:82px">ネット<\/th>\s*<th class="c" style="width:64px">検算<\/th>\s*<th class="c" style="width:52px">順位<\/th>/.test(P()));
  T('組の番号を出す', ()=>new RegExp('<td class="c s-g">'+run[0].g+'</td>').test(P()));
  const row=i=>P().split('id="sr-'+i+'"')[1].split('</tr>')[0];
  T('一致した行は ○', ()=>/<b class="s-ok">○<\/b>/.test(row(0)));
  T('合わない行は計算値に「?」、ネットの欄を赤く', ()=>/<b class="s-ng" title="差 0\.6">80\?<\/b>/.test(row(2))&&/<input class="q ng" type="number" step="0\.1" data-r="2" data-c="2"/.test(row(2)));
  T('ネットが無い行は計算値を薄く', ()=>/<span class="s-calc" title="グロス − HDCP">80<\/span>/.test(row(13)));
  T('途中まで入れた行は …', ()=>/<span class="s-dim">…<\/span>/.test(row(12)));
  T('何も入れていない行は —', ()=>/<span class="s-dim">—<\/span>/.test(row(15)));
  T('欄に行き先の番号（行・列）と Enter の処理', ()=>/<input class="q" type="number" id="sg-0" data-r="0" data-c="0"\s*value="90" onkeydown="scKey\(event\)" onchange="scSet\('[^']+','gross',this\.value\)"/.test(P())
    &&/data-r="0" data-c="1"\s*value="10" onkeydown="scKey\(event\)" onchange="scSet\('[^']+','hc',this\.value\)"/.test(P()));
  T('検算のカードは右の列（式と2つのボタン）', ()=>/<div class="card s-check">[\s\S]*90 − 10 ＝ <b class="ngc-v">80<\/b> のはず。[\s\S]*netFix\([\s\S]*scFocus\([\s\S]*<details class="card s-paste">/.test(P()));
  T('入力後は順位・表彰へ', ()=>/<div class="card s-end">[\s\S]*onclick="go\('rank'\)">順位・表彰を見る →/.test(P()));
  T('表の欄は大きく（38px）', ()=>/\.s-tab\.s-sheet input\.q\{width:100%;min-width:64px;min-height:38px;/.test(css)&&/\.s-tab input\.q\.ng\{border-color:#ff7f7f\}/.test(css));

  console.log('  -- Enter で次の欄 --');
  {
    /* 器に入力欄を探す関数を足す。data-r・data-c を画面の HTML から読み、呼ぶたびに新しい欄を返す（作り直しを真似る） */
    const log=[];
    const cells=()=>[...P().matchAll(/<input class="q[^"]*"[^>]*data-r="(\d+)" data-c="(\d+)"/g)].map(m=>[+m[1],+m[2]]);
    const mkEl=(r,c)=>({dataset:{r:String(r),c:String(c)},focus(){log.push('focus '+r+','+c);},select(){log.push('select '+r+','+c);},
      blur(){log.push('blur '+r+','+c);app.render();}});
    const qs=document.querySelector, qsa=document.querySelectorAll;
    document.querySelector=sel=>{const m=/data-r="(-?\d+)"\]\[data-c="(-?\d+)"/.exec(sel);if(!m)return null;
      return cells().some(([r,c])=>r===+m[1]&&c===+m[2])?mkEl(+m[1],+m[2]):null;};
    document.querySelectorAll=sel=>{const m=/data-r="(-?\d+)"\]$/.exec(sel);if(!m)return qsa?qsa(sel):[];
      return cells().filter(([r])=>r===+m[1]).map(([r,c])=>mkEl(r,c));};
    const key=(r,c,o)=>{let pd=0;const e=Object.assign({key:'Enter',keyCode:13,isComposing:false,shiftKey:false,target:mkEl(r,c),preventDefault(){pd++;}},o||{});
      log.length=0; X('scKey',e); return pd;};
    let pd=key(0,0);
    T('グロスから HDCP へ（確定してから移る）', ()=>pd===1&&log.join('/')==='blur 0,0/focus 0,1/select 0,1', ()=>log.join('/'));
    pd=key(0,2);
    T('行の終わり（ネット）から次の人のグロスへ', ()=>pd===1&&log.join('/')==='blur 0,2/focus 1,0/select 1,0', ()=>log.join('/'));
    pd=key(1,0,{shiftKey:true});
    T('Shift＋Enter で前の人のネットへ', ()=>log.join('/')==='blur 1,0/focus 0,2/select 0,2', ()=>log.join('/'));
    pd=key(0,0,{isComposing:true});
    T('変換中の Enter は拾わない', ()=>pd===0&&log.length===0);
    pd=key(0,0,{keyCode:229});
    T('keyCode 229（変換の確定）も拾わない', ()=>pd===0&&log.length===0);
    pd=key(0,0,{key:'Tab',keyCode:9});
    T('Tab はブラウザの標準のまま', ()=>pd===0&&log.length===0);
    pd=key(0,0,{ctrlKey:true});
    T('Ctrl＋Enter は拾わない', ()=>pd===0&&log.length===0);
    pd=key(15,2);
    T('最後の欄では確定だけ（移る先が無い）', ()=>pd===1&&log.join('/')==='blur 15,2', ()=>log.join('/'));
    app.SCset('entry','hidden'); app.go('score');
    const cols=app.DB().meta.sc.hidden.length;
    pd=key(0,cols-1);
    T('隠しホール方式：最後のホールからグロスへ', ()=>log.join('/')===`blur 0,${cols-1}/focus 0,${cols}/select 0,${cols}`, ()=>log.join('/'));
    pd=key(0,cols);
    T('隠しホール方式：グロスから次の人の最初のホールへ', ()=>log.join('/')===`blur 0,${cols}/focus 1,0/select 1,0`, ()=>log.join('/'));
    document.querySelector=qs; document.querySelectorAll=qsa;
    T('変換中を除く条件がコードにある（落とし穴2）', ()=>/if\(e\.key!=="Enter"\|\|e\.isComposing\|\|e\.keyCode===229\|\|e\.altKey\|\|e\.ctrlKey\|\|e\.metaKey\) return;/.test(h));
  }

  console.log('  -- スコア入力：隠しホール・18ホール方式（全幅） --');
  app.go('score');
  T('右の列は作らない（表を全幅）', ()=>!/class="s-grid"/.test(P())&&/<div class="card no-print"><h2>スコア入力 <small>Enter で次の欄へ<\/small><\/h2><table class="hscroll s-tab">/.test(P()));
  T('貼り付けは出さない', ()=>!/id="paste"/.test(P()));
  const nNet=app.standings().net.length, nG=app.standings().rows.filter(r=>r.g!==null).length;
  T('順位への案内は下に', ()=>new RegExp('<h2>順位 <small>入力済み '+nNet+' / 16名</small></h2>[\\s\\S]*onclick="go\\(\'rank\'\\)">順位・表彰を見る →').test(P()), ()=>nNet);
  T('ホールの欄にも行き先の番号', ()=>/data-r="0" data-c="0"\s*value="\d+" onkeydown="scKey\(event\)" onchange="scSet\('[^']+',\d+,this\.value\)" aria-label="[^"]+ \d+番"/.test(P()));
  /* 2026-09-18：進みは「ネットが出た人数」で数える（グロスだけではハンディの欠けに気づけなかった） */
  T('進みはネットが出た人数', ()=>new RegExp('<span class="s-cnt"><b>'+nNet+' / 16</b> 入力済</span>').test(P())&&/ネットが出れば順位に入ります/.test(P()), ()=>nNet);
  app.SCset('entry','all'); app.go('score');
  /* 2026-09-18：18ホール方式でもグロスとハンディを直接入れられる欄と、ノーカードの印を足した（18＋3） */
  T('18ホール方式は18ホール＋グロス・HDCP（直接）＋ノーカード', ()=>{const row=P().split('id="sr-0"')[1].split('</tr>')[0];
    return (row.match(/<input /g)||[]).length===21
      &&/placeholder="\d+" onkeydown="scKey\(event\)"\s*onchange="scSet\('[^']+','gross',this\.value\)"/.test(row)
      &&/onchange="scSet\('[^']+','hcOver',this\.value\)"/.test(row)&&/','nc',this\.checked\)/.test(row);});

  console.log('  -- 順位・表彰 --');
  app.sample(); global.flush(); app.setPhase('award');
  X('buildSlides'); const before=app.slides;
  app.go('rank');
  const st=app.standings(), w=st.net[0];
  T('上に件数・印刷・発表の画面へ', ()=>new RegExp('<span class="r-cnt">全員入力済 ・ いまの1位 '+w.n+'</span>').test(P())&&/onclick="window\.print\(\)">競技結果を印刷<\/button>\s*<button class="btn ghost" onclick="go\('result'\)">結果・発表の画面へ<\/button>/.test(P()));
  T('左に順位表、右に技能賞・発表の順番・賞金合計', ()=>/<div class="r-grid"><div class="card r-main">[\s\S]*<div class="r-side no-print">\s*<div class="card r-sk">[\s\S]*<div class="card r-plan">[\s\S]*<div class="card r-sum">/.test(P()));
  T('列は 順位・氏名・グロス・HDCP・ネット・賞（所属は名前の下）', ()=>/<th class="c" style="width:56px">順位<\/th><th style="min-width:10\.5em">氏名<\/th>\s*<th class="n" style="width:70px">グロス<\/th><th class="n" style="width:66px">HDCP<\/th>\s*<th class="n" style="width:78px">ネット<\/th><th style="min-width:9em">賞<\/th>/.test(P())&&!/>所属<\/th>/.test(P()));
  T('所属は名前の下', ()=>new RegExp('<td class="r-nm"><b>'+w.n+'</b><small>'+w.p.org+'</small></td>').test(P()));
  T('上位3名を大きく（1位は色を付ける）', ()=>/<tr class="zebra r-top r-1"><td class="c r-rk">1<\/td>/.test(P())&&/<tr class="zebra r-top r-3"><td class="c r-rk">3<\/td>/.test(P())&&/<tr class="zebra"><td class="c r-rk">4<\/td>/.test(P()));
  T('賞の列（ベスグロは設定の賞として1つだけ）', ()=>{const r=P().split('<td class="c r-rk">1</td>')[1].split('</tr>')[0];
    return /<span class="r-pz">優勝 <b>10,000円<\/b><\/span>/.test(r)&&(r.match(/ベスグロ/g)||[]).length===(st.best.n===w.n?1:0);});
  T('賞の列は印刷にも出す', ()=>/<th style="min-width:9em">賞<\/th>/.test(P())&&/<td class="r-pzs">/.test(P())&&/@media print\{\.r-grid,\.s-grid\{display:block\}\.r-pz\{color:#000\}/.test(css));
  app.useSet('prize',false);
  T('賞金を使わなくてもベスグロは出す', ()=>new RegExp('<b>'+st.best.n+'</b>[\\s\\S]*?<td class="r-pzs"><span class="r-pz">ベスグロ</span></td>').test(P())&&!/class="card r-sum"/.test(P()));
  app.useSet('prize',true);
  T('技能賞をホールごとに', ()=>/<h2>技能賞 <small>8 \/ 8 決定<\/small><\/h2>\s*<ul><li><span>ニアピン 3番<\/span><b class="">/.test(P()));
  app.DB().near[0].who=''; app.render();
  T('決まっていないホールは「未定」', ()=>/<b class="r-yet">未定<\/b>/.test(P())&&/<h2>技能賞 <small>7 \/ 8 決定<\/small>/.test(P()));
  const plan=X('showPlan')||{n:0,parts:[]};
  X('buildSlides');
  T('発表の順番は実際の枚数と同じ', ()=>plan.n===app.slides.length&&new RegExp('<h2>発表の順番 <small>'+plan.n+'枚</small></h2>').test(P()), ()=>plan.n+' / '+app.slides.length);
  /* 9/8に確定した並び。サンプル①は団体賞と抽選賞も使う */
  T('区切りの並び（開幕 → 技能賞 → 競技結果 → 団体賞 → 賞 → 馬券 → GTO → 選抜者・罰金 → 抽選 → 締め）', ()=>plan.parts.map(x=>x.l).join('/')==='開幕/ニアピン/何でもニアピン/ドラコン/競技結果/団体賞/賞/馬券/GTO/選抜者・罰金/抽選/締め', ()=>plan.parts.map(x=>x.l+x.n).join('/'));
  T('枚数を添える', ()=>/<li>競技結果<small>5枚<\/small><\/li>/.test(P())&&/<li>開幕<\/li>/.test(P()));
  app.go('rank');
  {
    X('buildSlides'); const keep=app.slides; app.render();
    T('要約を作ったあとも slides は同じもの', ()=>app.slides===keep);
  }
  const PT=X('prizeTotal')||{all:0};
  T('賞金合計', ()=>new RegExp('<h2>賞金合計</h2><b>'+app.yen(PT.all)+'<em>円</em></b>').test(P()));
  T('原資と残り', ()=>new RegExp('原資 '+app.yen(X('feeTotal'))+'円（'+X('feeMembers').length+'名）・ 残 '+app.yen(X('feeTotal')-PT.all)+'円').test(P()));
  const fee=app.BG().fee; app.BG().fee=100; app.render();
  T('原資が足りなければ赤く', ()=>/<span class="ng">原資 [\d,]+円（\d+名）・ 残 -[\d,]+円<\/span>/.test(P()));
  app.BG().fee=fee;
  T('反映ボタンは順位表の下', ()=>/<div class="card r-main">[\s\S]*onclick="applyScores\(\)">この結果を馬券・GTO・罰金へ反映/.test(P()));
  T('右の列は300px。1列に畳むときもはみ出さない', ()=>/\.r-grid\{display:grid;grid-template-columns:minmax\(0,1fr\) 300px;/.test(css)&&/\.r-grid\{grid-template-columns:minmax\(0,1fr\)\}/.test(css));
  T('印刷は1列で右の列は出さない', ()=>/@media print\{\.r-grid,\.s-grid\{display:block\}/.test(css)&&/<div class="r-side no-print">/.test(P()));
  {
    const O=app.blank(); app.setDB(O); app.setPhase('award'); app.go('rank');
    T('まだ誰も入っていなければそう出す', ()=>/<span class="r-cnt">入力済み 0 \/ 0名<\/span>/.test(P())&&/スコアを入れると、ネットの順位がここに並びます。/.test(P()));
  }
  app.sample(); global.flush(); app.setPhase('prep');
}

console.log('\n=== 予想入力（段階6：P10） ===');
/* 2026-09-17。決めたこと：
   ・「予想を入力する」は締め切ったら済む（代金は締め切ってから集める）
   ・馬券の人気のマス目は予想入力の右に出し、集計では当選の印つきで残す
   ・馬券とGTOは画面の中で切り替える
   締め切ると入力を止め、解除もできる（4.9の決定3） */
{
  const S6=app.S6();
  const P=()=>store['pane'].innerHTML;
  const X=(f,...a)=>{try{return S6[f]?S6[f](...a):undefined;}catch(e){console.log('  （'+f+' で例外：'+e.message+'）');}};
  const T=(l,f,x)=>{let v,e='';try{v=f();}catch(err){v=false;e=String(err&&err.message||err);}chk(l,!!v,e||(typeof x==='function'?(()=>{try{return x();}catch(_){return '';}})():x||''));};
  const i6=h.indexOf('/* ---- 段階6：予想入力（P10）');
  const css=i6>=0?h.slice(i6,h.indexOf('/* ---- 準備 → 当日 → 発表',i6)):'';
  const AL=[]; const al0=global.alert; global.alert=m=>AL.push(m);

  console.log('  -- 締め切りのデータ --');
  T('新しい大会は締め切っていない', ()=>app.blank().meta.betsClosed===false&&app.blank().meta.betsClosedAt==='');
  T('古いファイルには既定値を補う', ()=>{const o=app.blank();delete o.meta.betsClosed;delete o.meta.betsClosedAt;const m=app.migrate(o).meta;return m.betsClosed===false&&m.betsClosedAt==='';});
  app.sample(); global.flush(); app.setPhase('prep');
  const D=app.DB();
  T('サンプル①は締め切った状態（本番の稽古）', ()=>D.meta.betsClosed===true&&D.meta.betsClosedAt==='21:30');
  const step=()=>app.flowSteps().find(x=>x.label==='予想を入力する');
  T('締め切っていれば「予想を入力する」は済み', ()=>step().done===true);
  D.meta.betsClosed=false;
  T('締め切る前は済まない（口数を出す）', ()=>step().done===false&&step().rest==='締め切り前（150口）', ()=>step().rest);
  T('説明に締め切りのこと', ()=>/入れ終わったら「締め切る」を押します（代金は締め切ってから集めます）/.test(step().desc));

  console.log('  -- 馬券とGTOを画面の中で切り替える --');
  app.go('bets');
  T('既定は馬券', ()=>S6.BTAB==='k'&&/<div class="b-seg" role="group" aria-label="予想の種類"><button class="on" aria-pressed="true" onclick="betsTab\('k'\)">馬券（枠連）<small>100口<\/small><\/button><button class="" aria-pressed="false" onclick="betsTab\('g'\)">GTO（下位予想）<small>50口<\/small><\/button><\/div>/.test(P()));
  T('馬券の画面にGTOの欄は出さない', ()=>/id="ka_v"/.test(P())&&!/id="ga_v"/.test(P())&&/id="kp"/.test(P())&&!/id="gp"/.test(P()));
  X('betsTab','g');
  T('GTOに切り替える', ()=>S6.BTAB==='g'&&/aria-pressed="true" onclick="betsTab\('g'\)"/.test(P())&&/id="ga_v"/.test(P())&&!/id="ka_v"/.test(P()));
  app.useSet('keiba',false);
  T('馬券を使わなければGTOだけ', ()=>!/betsTab\('k'\)/.test(P())&&S6.BTAB==='g');
  app.useSet('keiba',true); app.useSet('gto',false);
  T('GTOを使わなければ馬券へ戻る', ()=>!/betsTab\('g'\)/.test(P())&&S6.BTAB==='k');
  app.useSet('gto',true);
  T('右の列は300px。1列に畳むときもはみ出さない', ()=>/\.b-grid\{display:grid;grid-template-columns:minmax\(0,1fr\) 300px;/.test(css)&&/\.b-grid\{grid-template-columns:minmax\(0,1fr\)\}/.test(css));
  T('上に「紙の予想を貼り付け」と「締め切る」', ()=>/onclick="BPASTE=!BPASTE;render\(\)">紙の予想を貼り付け<\/button>/.test(P())&&/<button class="btn primary" onclick="betsClose\(true\)">締め切る<\/button>/.test(P()));
  T('「締切まで◯分」は出さない（4.7）', ()=>!/締切まで/.test(P()));

  console.log('  -- 馬券：枠を押して選ぶ --');
  X('betsTab','k');
  T('枠のボタンが枠の数だけ', ()=>(P().match(/class="b-f[" ]/g)||[]).length===app.FRAMES().length&&/onclick="bFrame\(8\)"/.test(P()));
  T('枠の色と人の名前', ()=>new RegExp('<span class="b-fc" style="background:[^"]+"></span><b>1</b><small>'+X('inFrame',1)[0].split(/[\\s　]/)[0]+' ほか1名</small>').test(P()));
  T('選ぶ前は追加できない', ()=>/<button class="btn primary b-add" onclick="kAdd\(\)" disabled>枠を2つ選んでください<\/button>/.test(P()));
  X('bFrame',3);
  T('1つ目', ()=>S6.BSEL.join()==='3'&&/<button class="b-f on" onclick="bFrame\(3\)" aria-pressed="true">/.test(P())&&/枠を2つ選んでください/.test(P()));
  X('bFrame',5);
  T('2つ目で追加できる', ()=>S6.BSEL.join()==='3,5'&&/<button class="btn primary b-add" onclick="kAdd\(\)">3-5 を追加（Enter）<\/button>/.test(P()));
  T('選んだ枠を隠し欄に入れる（kAdd が読む）', ()=>/<input type="hidden" id="ka_a" value="3"><input type="hidden" id="ka_b" value="5">/.test(P()));
  T('人気のマス目に選んだ組合せの印', ()=>/class="[^"]*selc[^"]*"[^>]*>7</.test(P()));
  const cnt={}; D.keiba.forEach(r=>{const k=Math.min(r.a,r.b)+'-'+Math.max(r.a,r.b);cnt[k]=(cnt[k]||0)+r.q;});
  const best=Object.entries(cnt).sort((x,y)=>y[1]-x[1])[0];
  T('一番人気といま選んでいる組合せの口数', ()=>P().includes(`一番人気は <b>${best[0]}</b>（${best[1]}口）。いま選んでいる 3-5 は ${cnt['3-5']||0}口。`), ()=>best.join(':'));
  T('一番人気のマスに印', ()=>/class="[^"]*topc[^"]*"/.test(P()));
  X('bFrame',6);
  T('3つ目を押すと選び直し', ()=>S6.BSEL.join()==='6');
  X('bFrame',6);
  T('同じ枠を2回でゾロ目', ()=>S6.BSEL.join()==='6,6'&&/6-6 を追加（Enter）/.test(P())&&/<button class="b-f on" onclick="bFrame\(6\)" aria-pressed="true">[\s\S]*?<em>×2<\/em>/.test(P()));
  console.log('  -- 口数・投票者 --');
  X('bQty',1); X('bQty',1);
  T('＋で口数が増える', ()=>S6.BQ===3&&/<input id="ka_q" type="number" min="1" value="3"/.test(P()));
  X('bQty',-9);
  T('−でも1より減らない', ()=>S6.BQ===1);
  T('口数の欄は − と ＋ で挟む', ()=>/<div class="b-qty"><button onclick="bQty\(-1\)" aria-label="1口減らす">−<\/button>\s*<input id="ka_q"[\s\S]*?<button onclick="bQty\(1\)" aria-label="1口増やす">＋<\/button><\/div>/.test(P()));
  const v5=app.VOT()[5].n;
  store['ka_v'].value=v5; app.render();
  T('投票者の選択は描き直しても変わらない（BV）', ()=>/onchange="BV=this\.value"/.test(P()));
  console.log('  -- 追加 --');
  const n0=D.keiba.length;
  store['ka_v'].value=v5; store['ka_a'].value='6'; store['ka_b'].value='6'; store['ka_q'].value='2';
  X('bFrame',6); X('bFrame',6);
  app.kAdd();
  T('ゾロ目を2口追加', ()=>D.keiba.length===n0+1&&D.keiba.some(r=>r.v===v5&&r.a===6&&r.b===6&&r.q===2));
  T('投票者はそのまま、枠と口数は選び直し', ()=>S6.BV===v5&&S6.BSEL.length===0&&S6.BQ===1&&new RegExp('<option selected>'+v5+'</option>').test(P()));
  store['ka_a'].value='0'; store['ka_b'].value='0';
  app.kAdd();
  T('枠を選ばずに追加すると知らせる', ()=>D.keiba.length===n0+1&&store['ka_msg'].textContent==='枠を2つ選んでください');
  T('件数と未投票', ()=>new RegExp('<div class="b-foot"><span>'+D.keiba.length+'件</span><span>全員が投票しました</span></div>').test(P()));
  const lone=app.VOT()[0].n; const keepK=D.keiba.slice(); D.keiba=D.keiba.filter(r=>r.v!==lone); app.render();
  T('投票していない方の名前を出す', ()=>P().includes(`<span>未投票 1名：${lone}</span>`));
  D.keiba=keepK; app.render();
  T('貼り付けは普段は畳む', ()=>/<details class="card b-paste no-print" ontoggle="BPASTE=this\.open"><summary>紙の予想を貼り付けて取り込む<\/summary>/.test(P()));
  global.BPASTE=undefined;
  document.getElementById('kp').value='';
  T('上のボタンで開く', ()=>/onclick="BPASTE=!BPASTE;render\(\)"/.test(P()));

  console.log('  -- GTO：押した順に選ぶ --');
  X('betsTab','g');
  const R=app.RUN().map(p=>p.n);
  T('出走する方のボタン', ()=>(P().match(/class="b-p[" ]/g)||[]).length===R.length);
  T('選ぶ前は追加できない', ()=>/<button class="btn primary b-add" onclick="gAdd\(\)" disabled>3名を選んでください<\/button>/.test(P()));
  X('gPick',R[4]); X('gPick',R[9]);
  T('押した順に最下位・下位2位', ()=>S6.GSEL.join()===[R[4],R[9]].join()&&P().includes(`<span class="on"><small>最下位</small><b>${R[4]}</b></span><span class="on"><small>下位2位</small><b>${R[9]}</b></span><span class=""><small>下位3位</small><b>—</b></span>`));
  T('押した順の番号', ()=>new RegExp('<em>1</em><b>'+R[4]+'</b>').test(P())&&new RegExp('<em>2</em><b>'+R[9]+'</b>').test(P()));
  X('gPick',R[4]);
  T('もう一度押すと外れて順が詰まる', ()=>S6.GSEL.join()===R[9]);
  X('gPick',R[4]); X('gPick',R[1]);
  T('3名そろうと追加できる', ()=>S6.GSEL.length===3&&/<button class="btn primary b-add" onclick="gAdd\(\)">この順で追加（Enter）<\/button>/.test(P()));
  T('ほかの方は押せない（4人目は選べない）', ()=>new RegExp('onclick="gPick\\(\''+R[0]+'\'\\)" aria-pressed="false" disabled>').test(P()));
  X('gPick',R[7]);
  T('4人目を押しても変わらない', ()=>S6.GSEL.length===3&&!S6.GSEL.includes(R[7]));
  T('選んだ3名を隠し欄に入れる（gAdd が読む）', ()=>P().includes(`<input type="hidden" id="ga_1" value="${R[9]}"><input type="hidden" id="ga_2" value="${R[4]}"><input type="hidden" id="ga_3" value="${R[1]}">`));
  const g0=D.gto.length;
  store['ga_v'].value=v5; store['ga_1'].value=R[9]; store['ga_2'].value=R[4]; store['ga_3'].value=R[1]; store['ga_q'].value='1';
  app.gAdd();
  T('GTOを追加すると選び直し', ()=>D.gto.length===g0+1&&S6.GSEL.length===0&&S6.BV===v5);
  store['ga_1'].value=''; app.gAdd();
  T('3名そろわずに追加すると知らせる', ()=>D.gto.length===g0+1&&store['ga_msg'].textContent==='3名を選んでください');
  X('gPick',R[2]); X('bClear');
  T('選び直す', ()=>S6.GSEL.length===0);
  T('得票の多い方（★は罰金の基準）', ()=>/<h2>得票の多い方 <small>有効な口だけ<\/small><\/h2>\s*<ol class="b-votes"><li><span>★ /.test(P())&&(P().match(/<li><span>★ /g)||[]).length===D.meta.fineTop);
  T('GTOの売上と方式', ()=>new RegExp('<h2>GTO 売上</h2><b>[\\d,]+<em>円</em></b><span>\\d+口 × 500円・'+D.meta.gMode).test(P()));
  const gv=D.gto[0].p[0]; const gp=D.players.find(p=>p.n===gv); const gg=gp.g, gf=gp.f; gp.g=0; gp.f=0; app.render();
  T('無効の口があれば切替に印', ()=>/GTO（下位予想）<small>\d+口<\/small><i class="b-bad">無効\d+<\/i><\/button>/.test(P()));
  gp.g=gg; gp.f=gf; app.render();

  console.log('  -- 締め切る --');
  AL.length=0;
  X('betsClose',true);
  T('締め切ると時刻を残す', ()=>D.meta.betsClosed===true&&/^\d\d:\d\d$/.test(D.meta.betsClosedAt), ()=>D.meta.betsClosedAt);
  T('上に「締め切り済」と「解除」', ()=>new RegExp('<span class="b-lock">締め切り済 '+D.meta.betsClosedAt+'</span><button class="btn ghost" onclick="betsClose\\(false\\)">解除</button>').test(P())&&!/betsClose\(true\)/.test(P()));
  T('入力を止めたと知らせる', ()=>/予想を締め切りました（\d\d:\d\d）。追加・口数の変更・削除・貼り付けはできません。/.test(P()));
  T('GTOのボタン・追加・口数・貼り付けを押せない', ()=>/onclick="gPick\('[^']+'\)" aria-pressed="false" disabled>/.test(P())&&/onclick="gAdd\(\)" disabled>/.test(P())&&/<input id="ga_q"[^>]*disabled>/.test(P())&&/<textarea id="gp"[^>]*disabled><\/textarea>/.test(P()));
  T('一覧の口数は変えられず、×も出さない', ()=>/onchange="gQ\(0,this\.value\)" disabled>/.test(P())&&!/onclick="gDel\(/.test(P()));
  X('betsTab','k');
  T('馬券の枠も押せない', ()=>/onclick="bFrame\(1\)" aria-pressed="false" disabled>/.test(P())&&!/onclick="kDel\(/.test(P()));
  T('押せない部品は薄く出す', ()=>/\.b-pick button:disabled,[^{]*\{opacity:\.45;cursor:not-allowed\}/.test(css));
  const snapK=JSON.stringify(D.keiba), snapG=JSON.stringify(D.gto);
  store['ka_v'].value=v5; store['ka_a'].value='1'; store['ka_b'].value='2'; store['ka_q'].value='1';
  app.kAdd();
  store['ga_v'].value=v5; store['ga_1'].value=R[0]; store['ga_2'].value=R[1]; store['ga_3'].value=R[2];
  app.gAdd();
  X('kQ',0,99); X('gQ',0,99); X('kDel',0); X('gDel',0);
  document.getElementById('kp').value=v5+'\t1-2\t3'; X('kPaste'); X('kPasteApply');
  document.getElementById('gp').value=[v5,R[0],R[1],R[2],'1'].join('\t'); X('gPaste'); X('gPasteApply');
  T('締め切り中は追加・口数・削除・貼り付けのどれも変えない', ()=>JSON.stringify(D.keiba)===snapK&&JSON.stringify(D.gto)===snapG);
  T('押したら解除の方法を知らせる', ()=>AL.length>=6&&AL.every(m=>m==='予想は締め切っています。直すときは「解除」を押してください。'), ()=>AL.length+'回');
  T('締め切れば「予想を入力する」が済む', ()=>step().done===true);
  const cf=global.confirm; global.confirm=()=>false;
  X('betsClose',false);
  T('解除の確認で「いいえ」なら締め切ったまま', ()=>D.meta.betsClosed===true);
  global.confirm=cf;
  X('betsClose',false);
  T('解除すると入力できる', ()=>D.meta.betsClosed===false&&D.meta.betsClosedAt===''&&/betsClose\(true\)/.test(P())&&!/class="b-lock"/.test(P()));
  global.confirm=()=>false; X('betsClose',true); global.confirm=cf;
  T('締め切りの確認で「いいえ」なら開いたまま', ()=>D.meta.betsClosed===false);
  T('口数の欄の Enter は変換中を拾わない', ()=>/if\(ev\.key!=="Enter"\|\|ev\.isComposing\|\|ev\.keyCode===229\) return;/.test(h));

  console.log('  -- 集金・集計 --');
  app.setPhase('day'); app.go('collect');
  T('締め切る前の集金では知らせる', ()=>/予想がまだ締め切られていません。[\s\S]*onclick="go\('bets'\)">予想入力へ<\/button>/.test(P()));
  D.meta.betsClosed=true; app.render();
  T('締め切っていれば知らせない', ()=>!/予想がまだ締め切られていません/.test(P()));
  app.setPhase('award'); app.go('sum');
  T('集計にも人気のマス目（当選の印）', ()=>/<h2>馬券の人気 <small>マス目の数字は口数。当選の組合せに印/.test(P())&&/class="hitc"/.test(P()));
  T('集計では選んだ組合せ・一番人気の印は出さない', ()=>!/selc|topc/.test(P()));
  T('マス目は1つの部品（予想入力と集計）', ()=>(h.match(/kGrid\(\{/g)||[]).length===2);
  global.alert=al0;
  app.sample(); global.flush(); app.setPhase('prep');
}

console.log('\n=== 発表（段階7：発表スクリーンP11・操作パネル） ===');
/* 2026-09-17。決めたこと：
   ・操作パネルは別ウィンドウ。開いている間はスクリーンの操作の帯（HUD）を隠す
   ・次の予告は、スクリーンには賞の名前だけ。操作パネルには次の受賞者名も出す
   ・順位・表彰の「発表をはじめる」は、反映済みならその場で始める。順位が変わっていたら知らせて反映へ */
{
  const S7=app.S7();
  const P=()=>store['pane'].innerHTML, SH=()=>store['show'].innerHTML;
  const X=(f,...a)=>{try{return S7[f]?S7[f](...a):undefined;}catch(e){console.log('  （'+f+' で例外：'+e.message+'）');}};
  const T=(l,f,x)=>{let v,e='';try{v=f();}catch(err){v=false;e=String(err&&err.message||err);}chk(l,!!v,e||(typeof x==='function'?(()=>{try{return x();}catch(_){return '';}})():x||''));};
  const i7=h.indexOf('/* ---- 段階7：発表スクリーン（P11）');
  const css=i7>=0?h.slice(i7,h.indexOf('/* ---- 準備 → 当日 → 発表',i7)):'';
  const AL=[]; const al0=global.alert; global.alert=m=>AL.push(m);
  /* 器の show と hud に classList の記録を付ける */
  const cls=el=>{const set=new Set();el.classList={add:c=>set.add(c),remove:c=>set.delete(c),contains:c=>set.has(c),
    toggle:(c,on)=>{if(on===undefined)on=!set.has(c);on?set.add(c):set.delete(c);return on;}};return set;};
  const showCls=cls(store['show']), hudCls=cls(store['hud']);
  document.body.classList={add(){},remove(){},contains:c=>document.body.className.includes(c)};

  app.sample(); global.flush(); app.setPhase('award');
  const D=app.DB(), st=app.standings();
  console.log('  -- 1人を発表する画面（2列） --');
  X('buildSlides');
  const sl=id=>app.slides.find(x=>x.id===id);
  const h3=sl('s-3').html(), r3=st.net[2];
  T('左に見出しと大きな順位', ()=>/<div class="ws">\s*<div class="ws-l"><div class="kicker">第 3 位<\/div>\s*<div class="ws-big">3<small>位<\/small><\/div>/.test(h3));
  T('右に所属・名前・成績（伏せておく）', ()=>new RegExp('<div class="veil hidden" id="veil"><div class="ws-org">'+r3.p.org+'</div><div class="name-xl">'+r3.n+'</div>\\s*<div class="ws-stats"><div class="hi"><i>ネット</i><b>'+r3.net+'</b></div><div class=""><i>グロス</i><b>'+r3.g+'</b></div>').test(h3));
  T('賞金は伏せずに見せる', ()=>/<\/div>\s*<div class="ws-prize">3位賞<b>3,000円<\/b><\/div>/.test(h3));
  T('優勝の見出し', ()=>/<div class="kicker">優　勝<\/div>\s*<div class="ws-big">1<small>位<\/small>/.test(sl('s-1').html())&&/<div class="ws-prize">優勝賞<b>10,000円<\/b>/.test(sl('s-1').html()));
  T('ベスグロは打数を大きく', ()=>new RegExp('<div class="ws-big">'+st.best.g+'<small>打</small></div>').test(sl('s-best').html()));
  const nh=D.near.find(x=>x.who).hole;
  T('技能賞はホール番号を大きく、記録と賞金', ()=>new RegExp('<div class="ws-big">'+nh+'<small>番</small></div>').test(sl('near'+nh).html())&&/<i>記録<\/i>/.test(sl('near'+nh).html())&&/<div class="ws-prize">ニアピン賞<b>1,000円<\/b>/.test(sl('near'+nh).html()));
  T('賞の画面は賞の名前を大きく', ()=>/<div class="ws-big txt">BB<\/div>/.test(sl('s-pz2').html())&&/ネットの下から 2 番目/.test(sl('s-pz2').html()));
  T('GTOの結果も同じ形（打数の多い方から）', ()=>/<div class="ws-big">2<small>位<\/small><\/div>\s*<div class="ws-tie">打数の多い方から<\/div>/.test(sl('g2').html()));
  T('伏せている間は所属と成績もぼかす', ()=>/\.veil\.hidden \.ws-org,\.veil\.hidden \.ws-stats\{filter:blur\(18px\);opacity:\.25\}/.test(css));
  T('スマホでは1列に', ()=>/@media \(max-width:760px\)\{\s*\.ws\{grid-template-columns:1fr;/.test(css));
  {
    /* 1位と2位を同ネットにして、同点の理由が出るか */
    const r1=st.net[1], sc=app.scoreOf(r1.n), need=st.net[0].net-r1.net;
    for(let hh=1;hh<=18;hh++){ if(!D.meta.sc.hidden.includes(hh)){ sc.h[hh]=+sc.h[hh]+need; break; } }
    sc.gross=+sc.gross+need; X('buildSlides');
    T('同ネットなら左に理由', ()=>/<div class="ws-tie">ネット同スコア（[\d.]+）。年長者を上位にしました（大会設定）<\/div>/.test(sl('s-1').html())&&/ネット同スコア/.test(sl('s-2').html()));
    app.sample(); global.flush(); app.setPhase('award');
  }
  console.log('  -- 画面ごとの見出しと受賞者 --');
  X('buildSlides');
  const S=app.slides;
  T('どの画面にも見出し', ()=>S.every(x=>typeof x.lab==='string'&&x.lab.length>0), ()=>S.filter(x=>!x.lab).map(x=>x.id).join(','));
  T('見出しは読みやすく（字間の空白なし）', ()=>S.every(x=>!/[ 　]{1}.[ 　]/.test(x.lab.replace(/ \d+番$/,''))), ()=>S.map(x=>x.lab).join('/'));
  T('受賞者を持つ画面', ()=>sl('s-1').who===st.net[0].n&&sl('s-best').who===st.best.n&&sl('near'+nh).who===D.near.find(x=>+x.hole===nh).who&&sl('k-draw').who===D.result.frame);
  T('名前を伏せる画面の印（rv）', ()=>['s-1','s-2','s-3','s-best','near'+nh,'s-pz0','g1'].every(k=>sl(k).rv===1)&&!sl('k-pay').rv);

  console.log('  -- スクリーンの枠 --');
  X('startShow');
  X('setIdx',S.findIndex(x=>x.id==='s-3')); X('draw');
  const i3=S.findIndex(x=>x.id==='s-3');
  T('上に大会名・日付・会場と枚数', ()=>SH().startsWith(`<div class="sf-top"><span>${D.meta.name} ・ ${D.meta.date} ・ ${D.meta.place}</span><b>${i3+1} / ${S.length}</b></div><div class="slide on" id="cur">`));
  T('下に前の発表（名前つき）と次の予告（賞の名前だけ）', ()=>SH().includes(`<span class="sf-prev">← ベストグロス ${st.best.n}</span>`)&&SH().includes('<span class="sf-next">次：2位 →</span>')&&!new RegExp('sf-next">[^<]*'+st.net[1].n).test(SH()));
  T('進みの点（済み・いま）', ()=>(SH().match(/<i class="done"><\/i>/g)||[]).length===i3&&(SH().match(/<i class="on"><\/i>/g)||[]).length===1);
  X('setIdx',0); X('draw');
  T('最初の画面では前の発表を出さない', ()=>SH().includes('<span class="sf-prev"></span>'));
  X('setIdx',S.findIndex(x=>x.id==='k-pay')+1); X('draw');
  T('名前を伏せない画面の後は見出しだけ', ()=>SH().includes('<span class="sf-prev">← 馬券 払戻</span>'));
  X('setIdx',S.length-1); X('draw');
  T('最後の画面', ()=>SH().includes('<span class="sf-next">最後の画面です</span>'));
  T('操作の帯と重ならない（パネルが無いときは上へずらす）', ()=>/#show:not\(\.paneled\) \.sf-bot\{bottom:calc\(64px \+ env\(safe-area-inset-bottom\)\)\}/.test(css));
  T('進みの点は HUD にも残す', ()=>/class="dot on"/.test(store['dots'].innerHTML));

  console.log('  -- 操作パネル（別ウィンドウ） --');
  X('setIdx',i3); X('draw');
  const wopen0=global.window.open;
  global.window.open=undefined;
  AL.length=0; X('panelOpen');
  T('開けないときは知らせる', ()=>AL[0]==='操作パネルを開けませんでした。ブラウザでこのページのポップアップを許可してください。'&&S7.PANEL===null);
  /* 別ウィンドウの器。書き込まれた HTML から要素を作り、押す処理を受け取れるようにする */
  /* 段階7の見直し（v51）：パネルは document.write ではなく、空のページに DOM で差し込む */
  const mkWin=()=>{
    const els={}; const head=[];
    const el=id=>els[id]||(els[id]={id,textContent:'',_h:'',get innerHTML(){return this._h},set innerHTML(v){this._h=v;
      for(const m of v.matchAll(/id="(pn-[a-z]+)"/g)) el(m[1]);},onclick:null,oninput:null});
    const doc={title:'',documentElement:{lang:''},written:0,
      write(){doc.written++;},open(){},close(){},
      head:{_h:'x',get innerHTML(){return this._h},set innerHTML(v){this._h=v;head.length=0;},appendChild:n=>head.push(n)},
      body:{_h:'',get innerHTML(){return this._h},set innerHTML(v){this._h=v;for(const m of v.matchAll(/id="(pn-[a-z]+)"/g)) el(m[1]);}},
      createElement:tag=>({tag,textContent:'',attrs:{},setAttribute(k,v){this.attrs[k]=v;}}),
      getElementById:id=>els[id]||null,querySelectorAll:()=>[],querySelector:()=>null,onkeydown:null};
    const w={closed:false,focused:0,focus(){this.focused++;},close(){this.closed=true;if(this.onpagehide)this.onpagehide();},
      onpagehide:null,document:doc,els,head};
    return w;
  };
  let W=null, opened=[];
  /* 前の版（パネルが無い）でも止まらないよう、押す操作は受け止める */
  const CL=id=>{try{W.els[id].onclick();}catch(e){}};
  const KD=k=>{try{W.document.onkeydown({key:k,preventDefault(){}});}catch(e){}};
  global.window.open=(u,n,f)=>{opened.push([u,n,f]);W=mkWin();return W;};
  X('panelOpen');
  T('空のページを名前つきで開く', ()=>opened.length===1&&opened[0][0]===''&&opened[0][1]==='compePanel'&&/width=720/.test(opened[0][2]));
  T('パネルに題名・スタイル・本文を差し込む（外部の読み込みなし）', ()=>W&&W.document.title==='操作パネル — CompeMaster Pro'&&W.document.documentElement.lang==='ja'
    &&W.head.some(n=>n.tag==='style'&&/#pn-next\{background:var\(--brass\)/.test(n.textContent))&&W.head.some(n=>n.tag==='meta'&&n.attrs.charset==='utf-8')
    &&/id="pn-body"/.test(W.document.body.innerHTML)&&!/(src|href)="http/.test(W.document.body.innerHTML));
  T('document.write は使わない', ()=>W&&W.document.written===0);
  T('開くとスクリーンの操作の帯を隠す', ()=>hudCls.has('off')&&showCls.has('paneled'));
  T('帯を隠す指定', ()=>/#hud\.off\{display:none!important\}/.test(css));
  const B=()=>W.els['pn-body'].innerHTML;
  T('いまの画面と受賞者', ()=>B().includes(`<div class="now"><small>いま</small><b>3位</b><span>${st.net[2].n}</span></div>`));
  T('次の画面と次の受賞者名（パネルだけ）', ()=>B().includes(`<div class="next"><small>次</small><b>2位</b><span>${st.net[1].n}</span></div>`));
  T('枚数', ()=>W.els['pn-pos'].textContent===(i3+1)+' / '+S.length);
  T('一覧（先の受賞者名は出さない）', ()=>(B().match(/<li class/g)||[]).length===S.length&&B().includes(`<li class="on"><button data-i="${i3}"><i>${i3+1}</i>3位<em>${st.net[2].n}</em></button></li>`)&&!B().includes(`<i>${i3+3}</i>優勝<em>${st.net[0].n}</em>`));
  CL('pn-next');
  T('パネルの「次へ」で進む', ()=>S7.idx===i3+1&&W.els['pn-pos'].textContent===(i3+2)+' / '+S.length);
  CL('pn-prev');
  T('パネルの「戻る」で戻る', ()=>S7.idx===i3);
  KD('ArrowRight');
  T('パネルで → を押すと進む', ()=>S7.idx===i3+1);
  KD('ArrowLeft');
  T('パネルで ← を押すと戻る', ()=>S7.idx===i3);
  X('panelJump',0);
  T('一覧から飛べる', ()=>S7.idx===0);
  X('panelJump',999);
  T('範囲外には飛ばない', ()=>S7.idx===0);
  const snd=S7.SND; CL('pn-snd');
  T('パネルで音を切り替える', ()=>S7.SND===!snd);
  CL('pn-snd');
  X('panelOpen');
  T('もう一度押すと同じパネルを前に出す', ()=>opened.length===1&&W.focused===1);
  {
    /* 同じ名前のパネルが残っていたとき（スクリーン側を読み込み直したなど）も、スタイルとキーの受け手は1つ */
    const keep=S7.PANEL, wo=global.window.open; global.window.open=()=>W; X('setPANEL',null); X('panelOpen'); global.window.open=wo;
    T('残っていたパネルに入れ直しても重ならない', ()=>W.head.filter(n=>n.tag==='style').length===1&&typeof W.document.onkeydown==='function');
    X('setPANEL',keep);
  }
  {
    /* スクリーン側を読み込み直すと、残っていたパネルは別の出どころになり触れない（ファイルを直接開いたとき）。
       触れないパネルは閉じて、別の名前で開き直す */
    const keep=S7.PANEL, wo=global.window.open, calls=[];
    const stale={closed:false,closedBy:0,close(){this.closedBy++;this.closed=true;},get document(){throw new Error('SecurityError');}};
    const fresh=mkWin();
    global.window.open=(u,n)=>{calls.push(n);return calls.length===1?stale:fresh;};
    X('setPANEL',null); X('panelOpen');
    T('触れないパネルが残っていたら閉じて、同じ名前で開き直す', ()=>stale.closedBy===1&&calls.join()==='compePanel,compePanel'&&S7.PANEL===fresh&&/id="pn-body"/.test(fresh.document.body.innerHTML), ()=>calls.join(','));
    {
      /* 閉じきる前の同じウィンドウが返るブラウザでは、別の名前で開く */
      const c2=[], f2=mkWin(); stale.closedBy=0; stale.closed=false;
      global.window.open=(u,n)=>{c2.push(n);return c2.length<3?stale:f2;};
      X('setPANEL',null); X('panelOpen');
      T('同じ名前で触れなければ、別の名前で開く', ()=>c2.length===3&&c2[0]==='compePanel'&&c2[1]==='compePanel'&&/^compePanel\d+$/.test(c2[2])&&S7.PANEL===f2, ()=>c2.join(','));
    }
    global.window.open=()=>stale; stale.closed=false;
    AL.length=0; X('setPANEL',null); X('panelOpen');
    T('開き直しても触れなければ知らせる（例外で止まらない）', ()=>AL[0]==='操作パネルを開けませんでした。ブラウザでこのページのポップアップを許可してください。');
    X('setPANEL',stale); stale.closed=false;
    let e=null; try{ X('panelPaint'); X('draw'); }catch(x){ e=x.message; }
    T('触れないパネルを持ったままでも描ける', ()=>!e&&SH().includes('class="slide on"'), e||'');
    global.window.open=wo; X('setPANEL',keep);
  }
  CL('pn-back');
  T('作業画面に戻るとパネルは「発表していません」', ()=>/いまは発表していません。/.test(B())&&W.els['pn-pos'].textContent==='—');
  CL('pn-start');
  T('パネルから発表をはじめられる', ()=>document.body.className==='showing'&&S7.idx===0);
  if(W) W.close();
  T('パネルを閉じるとスクリーンの帯が戻る', ()=>S7.PANEL===null&&!hudCls.has('off')&&!showCls.has('paneled'));
  X('draw');
  T('閉じたあとも描ける', ()=>SH().includes('class="slide on"'));
  global.window.open=wopen0;
  X('backToWork');
  T('HUD に「操作パネル」', ()=>/<button onclick="panelOpen\(\)">操作パネル<\/button>/.test(h));

  console.log('  -- 反映済みかどうか --');
  app.sample(); global.flush(); app.setPhase('award');
  T('サンプル①は反映済み', ()=>(X('resultStale')||['?']).length===0, ()=>(X('resultStale')||[]).join('・'));
  app.go('rank');
  T('反映済みならその場で始める', ()=>/<button class="btn primary" onclick="startShow\(\)">▶ 発表をはじめる<\/button>/.test(P())&&/onclick="startShow\(\);panelOpen\(\)">操作パネルつきで始める/.test(P())&&!/結果を反映して発表の準備へ/.test(P()));
  {
    const r0=st.net[0], r1=st.net[1];
    const s0=app.scoreOf(r0.n);
    for(let hh=1;hh<=18;hh++){ if(!D.meta.sc.hidden.includes(hh)){ s0.h[hh]=+s0.h[hh]+20; break; } }
    s0.gross=+s0.gross+20; app.render();
    const sv=X('resultStale')||[];
    T('スコアを直すと、合っていない項目を返す', ()=>sv.includes('馬券の上位2名')&&sv.includes('罰金のグロス'), ()=>sv.join('・'));
    T('順位が変わったら知らせて反映へ', ()=>/<button class="btn primary" onclick="applyScores\(\)">結果を反映して発表の準備へ<\/button>/.test(P())&&!/onclick="startShow\(\)">▶ 発表をはじめる/.test(P())&&/いまの順位が、発表に使う結果（[^）]*馬券の上位2名[^）]*）と合っていません。/.test(P()));
    app.go('result');
    T('結果・発表の画面でも知らせる', ()=>/いまの順位が、上の結果（[^）]*）と合っていません。\s*<button class="btn ghost" style="margin-left:8px" onclick="applyScores\(\)">順位から反映し直す/.test(P()));
    X('applyScores');
    T('反映すると合う', ()=>(X('resultStale')||['?']).length===0);
    T('反映後は結果・発表の画面', ()=>app.TAB==='result'&&!/いまの順位が、上の結果/.test(P()));
  }
  T('結果・発表の画面にパネルつきの開始', ()=>/onclick="panelOpen\(\);startShow\(\)">操作パネルを開いて発表をはじめる/.test(P())&&/先にパネルを開いてから、発表の画面をプロジェクター側で全画面（F）にしてください/.test(P()));
  {
    const O=app.blank(); app.setDB(O); app.setPhase('award'); app.go('rank');
    T('スコアが無ければ開始のボタンは出さない', ()=>!/startShow\(\)/.test(P())&&!/applyScores\(\)/.test(P()));
    T('スコアが無いときの判定', ()=>(X('resultStale')||[]).join()==='スコア');
  }
  global.alert=al0;
  document.body.classList={add(){},remove(){},contains:c=>document.body.className.includes(c)};
  app.sample(); global.flush(); app.setPhase('prep');
}

console.log('\n=== スマホ（段階8：M1ハブ・M2スコア入力・M3順位・低い上部） ===');
/* 2026-09-17。決めたこと：
   ・上部はデザインどおり低くする（大会名と段階・開催日、段階の切替）。すべての画面へは大会ハブの「すべての画面」から
   ・1人ずつのスコア入力は画面の数字キー（端末のキーボードを出さない）
   ・今回は M1〜M3 と上部まで。参加者の表のカード化は段階9 */
{
  const S8=app.S8();
  const P=()=>store['pane'].innerHTML;
  const X=(f,...a)=>{try{return S8[f]?S8[f](...a):undefined;}catch(e){console.log('  （'+f+' で例外：'+e.message+'）');}};
  const T=(l,f,x)=>{let v,e='';try{v=f();}catch(err){v=false;e=String(err&&err.message||err);}chk(l,!!v,e||(typeof x==='function'?(()=>{try{return x();}catch(_){return '';}})():x||''));};
  const i8=h.indexOf('/* ---- 段階8：スマホ（M1〜M3）と低い上部');
  const css=i8>=0?h.slice(i8,h.indexOf('/* ---- 準備 → 当日 → 発表',i8)):'';
  const mq=css.slice(css.indexOf('@media screen and (max-width:760px){'));

  console.log('  -- 低い上部 --');
  app.sample(); global.flush(); app.setPhase('day'); app.go('hub');
  T('大会名を小さく、段階と開催日を大きく', ()=>X('mobHead')==='<small><i class="mh-i">⌂</i>第10回 親睦ゴルフコンペ</small><b>当日 08.28</b>', ()=>X('mobHead'));
  T('描画すると上の帯に入る', ()=>store['mHead'].innerHTML===X('mobHead'));
  T('帯に置き場所（押すとホーム）', ()=>/<button class="mhead" id="mHead" onclick="go\('home'\)" aria-label="ホームへ戻る"/.test(h));
  app.DB().meta.date='未定';
  T('開催日が読めなければ段階だけ', ()=>X('mobHead')==='<small><i class="mh-i">⌂</i>第10回 親睦ゴルフコンペ</small><b>当日</b>');
  app.DB().meta.date='2027.8.28';
  app.go('home');
  T('ホームでは空', ()=>store['mHead'].innerHTML==='');
  app.go('hub');
  T('ふだん（PC）は出さない', ()=>/^[^@]*\.mhead,\.m2,\.m3,\.hb-all,\.hb-foot,\.s-onebtn,\.hb-n,\.hb-home\{display:none\}/.test(css));
  T('スマホではロゴ・大会名・保存状態・PCの見出し・タブ列を隠す', ()=>/#work>\.top \.brand,#work>\.top \.vr,#work>\.top #hdTitle,#work>\.top \.save,#work>\.top \.pgbar,#work>\.top \.tabs\{display:none\}/.test(mq)&&/\.mhead\{display:flex;/.test(mq));
  T('次にやること：大会ハブは大きく、ほかの画面は小さく', ()=>/<div class="nx no-print">/.test(P())&&(app.go('collect'),/<div class="nx no-print nx-mini">/.test(P())));
  T('小さい帯では説明と手順を隠す', ()=>/#work \.nx\.nx-mini \.nx-d,#work \.nx\.nx-mini \.nx-steps,#work \.nx\.nx-mini \.nx-note,#work \.nx\.nx-mini \.nx-skip\{display:none\}/.test(mq));
  T('印刷には出さない', ()=>/@media print\{\.m2,\.m3,\.hb-all,\.mhead\{display:none!important\}\}/.test(css));

  console.log('  -- M1：大会ハブ --');
  app.go('hub');
  T('まだの手順は番号、済んだ手順は✓', ()=>/<button class="hb-li cur" onclick="goStep\('collect',''\)"><i><b class="hb-no">1<\/b><\/i>/.test(P())&&/<button class="hb-li ok" onclick="goStep\('score',''\)"><i>✓<\/i>/.test(P()));
  T('手順の下に画面の名前と進み', ()=>/集金する<em class="hb-n">集金 0\/16<\/em>/.test(P())&&/スコアを入れる<em class="hb-n">スコア入力 16\/16<\/em>/.test(P()));
  T('前の段階の画面の案内とホームへの道', ()=>/<p class="hb-foot">前の段階の画面は、下の「すべての画面」から開けます。大会を新しく作る・前回からコピーするときは<b>ホーム<\/b>へ（上の大会名を押すか、下の「ホーム」）。<\/p>/.test(P()));
  T('すべての画面（畳んでいる準備も出す）', ()=>/<div class="card hb-all no-print"><h2>すべての画面<\/h2>/.test(P())&&/<small>準備（畳んでいます）<\/small><button class="" onclick="goAll\('meta'\)">大会設定<\/button>/.test(P())&&/<small>当日（いま）<\/small>/.test(P()));
  /* 2026-09-18：ホーム・データ・使い方は足元に1か所だけ（すべての画面の中と二重にしない） */
  T('ホーム・データ・使い方は足元に1か所', ()=>!/goAll\('home'\)/.test(P())&&(P().match(/onclick="go\('home'\)"/g)||[]).length===1&&/<div class="hb-home no-print">/.test(P()));
  T('進み数も添える', ()=>/onclick="goAll\('players'\)">参加者<em>16<\/em><\/button>/.test(P()));
  X('goAll','meta');
  T('畳んでいる画面も開ける（段階を開いてから移る）', ()=>app.TAB==='meta'&&S8.PHOPEN.prep===true);
  app.phOpen('prep',false); app.go('hub');
  T('スマホでは数字のカード・追加ルール・次の流れを隠し、すべての画面を出す', ()=>/\.hb-stats,\.hb-rl,\.hb-fl\{display:none\}/.test(mq)&&/\.hb-all\{display:block;/.test(mq));
  T('手順はカード（押しやすい高さ）', ()=>/\.hb-cl \.hb-li\{grid-template-columns:30px minmax\(0,1fr\) auto;min-height:62px;/.test(mq));

  console.log('  -- ホームへ戻る道（2026-09-18） --');
  /* スマホではホームへの道が「大会ハブ →すべての画面→ ホーム」の1つだけで、
     ページを1画面ぶん送らないと届かなかった。上部の大会名を押せるようにし、大会ハブの足元にも置いた */
  app.go('hub');
  T('大会ハブの足元にホーム・データ・使い方', ()=>/<div class="hb-home no-print"><button onclick="go\('home'\)">⌂ ホーム<\/button><button onclick="go\('data'\)">データ<\/button><button onclick="go\('help'\)">使い方<\/button><\/div>/.test(P()));
  T('足元はスマホだけ（PCはサイドバーの足元にある）', ()=>/\.hb-home\{display:flex;gap:8px;/.test(mq)&&/\.hb-home button\{flex:1;min-height:44px;/.test(mq));
  T('大会名に押せる印（家のしるし）', ()=>/<i class="mh-i">⌂<\/i>/.test(X('mobHead')||'')&&/\.mh-i\{margin-right:5px;/.test(mq));
  T('押すとホームへ', ()=>{app.go('score'); store['mHead'].onclick&&store['mHead'].onclick(); app.go('home'); return app.TAB==='home';});
  app.go('hub');

  console.log('  -- M2：1人ずつのスコア入力（集計表方式） --');
  app.sample(); global.flush(); app.setPhase('day'); app.SCset('entry','sheet');
  const R=app.RUN();
  R.forEach((p,i)=>{const sc=app.scoreOf(p.n); if(i<10){sc.gross=90;sc.hc=10;sc.netRef=80;} else {sc.gross='';sc.hc='';sc.netRef='';}});
  X('scView','one'); app.go('score');
  T('スマホは1人ずつが既定', ()=>S8.SCVIEW==='one'&&/<div class="s-wrap s-one"><div class="m2 no-print">/.test(P()));
  T('入っていない最初の人から始める', ()=>S8.M2.i===10&&P().includes(`<strong>${R[10].n}</strong>`));
  const pos=R.filter(x=>+x.g===+R[10].g).indexOf(R[10])+1;
  T('組と組の中の順番', ()=>P().includes(`<small>${R[10].g}組・${pos}人目</small>`));
  T('一覧・人数・次の人', ()=>/<button onclick="scView\('list'\)">‹ 一覧<\/button>/.test(P())&&/<b>11 \/ 16<\/b>/.test(P())&&/<button onclick="m2Person\(1\)">次の人 ›<\/button>/.test(P()));
  T('枠はグロス・HDCP・ネット（いまはグロス）', ()=>/<button class="m2-f on" onclick="m2Field\(0\)"><small>グロス<\/small><span>—<\/span><\/button><button class="m2-f" onclick="m2Field\(1\)"><small>HDCP<\/small>/.test(P()));
  T('画面の数字キー（入力欄を使わない＝端末のキーボードを出さない）', ()=>{const m=P().split('<div class="m2 no-print">')[1].split('<div class="s-top')[0];
    return (m.match(/onclick="m2Key\('/g)||[]).length===12&&!/<input/.test(m)&&/aria-label="1文字消す">⌫<\/button>/.test(m);});
  T('グロスでは小数点を押せない', ()=>/onclick="m2Key\('\.'\)" disabled aria-label="\.">\.<\/button>/.test(P()));
  T('次の欄のボタン', ()=>/<button class="m2-next" onclick="m2Next\(\)">次の欄へ（HDCP）<\/button>/.test(P()));
  T('表と上の操作はスマホで隠す（1人ずつのとき）', ()=>/\.s-one>:not\(\.m2\)\{display:none\}/.test(mq)&&/\.pane\.m2mode>\.pghead,\.pane\.m2mode>\.nx\{display:none\}/.test(mq)&&/pane\.classList\.toggle\("m2mode",TAB==="score"&&SCVIEW==="one"\)/.test(h));
  const sc10=app.scoreOf(R[10].n);
  X('m2Key','9'); X('m2Key','2');
  T('押すたびに保存する', ()=>sc10.gross==='92');
  X('m2Key','1'); X('m2Key','2');
  T('グロスは3桁まで', ()=>sc10.gross==='921');
  X('m2Key','del');
  T('⌫で1文字消す', ()=>sc10.gross==='92');
  X('m2Key','.');
  T('グロスに小数点は入らない', ()=>sc10.gross==='92');
  X('m2Next');
  T('次の欄へ（HDCP）', ()=>S8.M2.f===1&&/<button class="m2-f on" onclick="m2Field\(1\)">/.test(P())&&!/m2Key\('\.'\)" disabled/.test(P()));
  ['1','4','.','.','4','9'].forEach(k=>X('m2Key',k));
  T('HDCPは小数点1つ・小数1桁まで', ()=>sc10.hc==='14.4', ()=>sc10.hc);
  X('m2Next'); ['7','7','.','6'].forEach(k=>X('m2Key',k));
  T('3つそろって一致', ()=>sc10.netRef==='77.6'&&/<p class="m2-note">3つが一致しました<\/p>/.test(P()));
  T('最後の欄のボタンは「次の人へ」', ()=>/>次の人へ<\/button>/.test(P()));
  X('m2Field',2); X('m2Key','8');
  T('欄に移った直後の数字は置き換える', ()=>sc10.netRef==='8');
  T('合わなければ知らせてネットの枠を赤く', ()=>/<p class="m2-note ng">グロス − HDCP ＝ 77\.6 のはず（入れたネットは 8）<\/p>/.test(P())&&/<button class="m2-f ng" onclick="m2Field\(2\)">|<button class="m2-f on ng" onclick="m2Field\(2\)">/.test(P()));
  X('m2Key','del'); X('m2Key','.'); X('m2Key','5');
  T('小数点から打つと 0. になる', ()=>sc10.netRef==='0.5', ()=>sc10.netRef);
  X('m2Field',2); X('m2Key','0'); X('m2Key','7');
  T('先頭の0は残さない', ()=>sc10.netRef==='7', ()=>sc10.netRef);
  X('m2Field',2); ['7','7','.','6'].forEach(k=>X('m2Key',k));
  X('m2Next');
  T('最後の欄から次の人の最初の欄へ', ()=>S8.M2.i===11&&S8.M2.f===0);
  X('m2Person',-1);
  T('前の人へ', ()=>S8.M2.i===10&&S8.M2.f===0);
  X('m2Person',-99);
  T('先頭より前には行かない', ()=>S8.M2.i===0&&/aria-label="前の人" disabled>/.test(P()));
  X('m2Person',99);
  T('最後より後には行かない', ()=>S8.M2.i===15&&/aria-label="次の人" disabled>/.test(P()));
  X('m2Field',2);
  T('最後の人の最後の欄は「一覧で確かめる」', ()=>/>一覧で確かめる<\/button>/.test(P()));
  X('m2Next');
  T('一覧へ戻る', ()=>S8.SCVIEW==='list'&&/<div class="s-wrap"><button class="btn s-onebtn no-print" onclick="scView\('one'\)">1人ずつ入力する<\/button>/.test(P()));
  T('一覧では表を出す', ()=>/class="s-grid"/.test(P())&&/\.s-onebtn\{display:flex;/.test(mq));
  X('scView','one');
  T('1人ずつに戻ると、入っていない人から', ()=>S8.M2.i===11, ()=>S8.M2.i);

  console.log('  -- M2：隠しホール・18ホール方式 --');
  app.SCset('entry','hidden');
  const hid=app.DB().meta.sc.hidden.slice(0,12);
  /* 12番目の人だけホールとグロスを空にする（ほかはグロスあり） */
  R.forEach(p=>{const x=app.scoreOf(p.n); if(!(+x.gross>0)) x.gross=90;});
  const sc12=app.scoreOf(R[12].n); Object.keys(sc12.h).forEach(k=>sc12.h[k]=''); sc12.gross='';
  X('scView','one');
  T('隠しホールとグロス（13の枠を詰めて並べる）', ()=>{const F=X('m2Fields')||[];return F.length===13&&F[0][0]===hid[0]&&F[12][0]==='gross'&&/<div class="m2-fields many">/.test(P());});
  T('入っていない人から（ホールも見る）', ()=>S8.M2.i===12, ()=>S8.M2.i);
  X('m2Key','5'); X('m2Key','5');
  T('ホールは2桁まで', ()=>sc12.h[hid[0]]==='55');
  X('m2Field',0); X('m2Key','6');
  T('ホールの枠に保存する', ()=>sc12.h[hid[0]]==='6');
  app.SCset('entry','all');
  T('18ホール方式はホールだけ（6つずつ並べる）', ()=>{const F=X('m2Fields')||[];return F.length===18&&F.every(f=>typeof f[0]==='number')&&/<div class="m2-fields many six">/.test(P());});
  T('合計は表示で知らせる', ()=>/<p class="m2-note">(グロス \d+　HDCP [\d.—]+　ネット [\d.—]+|ホールの打数を入れると、グロスとネットが出ます)<\/p>/.test(P()));
  T('背の低いスマホでも「次の欄へ」を下タブの上に', ()=>/@media screen and \(max-width:760px\) and \(max-height:700px\)\{/.test(css)&&/\.m2-fields\.many~\.m2-keys button\{min-height:44px;/.test(mq));
  T('数字キーは押しやすく（二度押しで拡大しない）', ()=>/\.m2-keys button\{min-height:52px;[^}]*touch-action:manipulation/.test(mq));
  app.SCset('entry','hidden');

  console.log('  -- M3：順位のカード --');
  app.sample(); global.flush(); app.setPhase('award'); X('setRK','n');
  app.go('rank');
  const st=app.standings();
  T('順位はカードで（次にやることのすぐ下、表より上）', ()=>{const i=P().indexOf('<div class="m3 no-print">');
    return i>P().indexOf('class="nx no-print')&&i<P().indexOf('class="r-bar')&&(P().match(/<li class="m3-c/g)||[]).length===st.net.length;});
  T('1位は目立たせる', ()=>new RegExp('<li class="m3-c first"><span class="m3-rk">1</span>\\s*<span class="m3-nm"><strong>'+st.net[0].n+'</strong><small>'+st.net[0].g+' − '+st.net[0].hc).test(P()));
  T('受賞をカードに添える', ()=>new RegExp('<strong>'+st.net[0].n+'</strong><small>[^<]*・ 優勝').test(P()));
  T('ネットを大きく', ()=>P().includes(`<span class="m3-v">${st.net[0].net}</span>`));
  T('確定の状態と方式', ()=>/<small>順位確定・ダブルペリア<\/small>/.test(P()));
  T('発表をはじめる・結果を共有する', ()=>/<div class="m3-act"><button class="btn primary" onclick="startShow\(\)">▶ 発表をはじめる<\/button><small>プロジェクターにつないだPCで開くのがおすすめです<\/small>\s*<button class="btn" onclick="go\('share'\)">結果を共有する<\/button>/.test(P()));
  T('スマホでは表と上の操作を隠す（右の列は残す）', ()=>/\.r-bar,\.r-main,\.r-stale\{display:none\}/.test(mq)&&/\.m3\{display:block\}/.test(mq));
  T('ネットとグロスの切替', ()=>/<div class="m3-sort" role="group" aria-label="並べ方"><button class="on" onclick="RKSORT='n';render\(\)">ネット<\/button><button class="" onclick="RKSORT='g';render\(\)">グロス<\/button><\/div>/.test(P()));
  X('setRK','g'); app.render();
  T('グロス順に並べ替える', ()=>{const m=[...P().matchAll(/<li class="m3-c[^"]*"><span class="m3-rk">(\d+)<\/span>\s*<span class="m3-nm"><strong>([^<]+)<\/strong>[\s\S]*?<span class="m3-v">(\d+)<\/span>/g)];
    return m.length===st.gross.length&&m[0][2]===st.gross[0].n&&+m[0][3]===st.gross[0].g&&m.every((x,i)=>i===0||+x[3]>=+m[i-1][3]);});
  X('setRK','n');
  {
    const r1=st.net[1], sc=app.scoreOf(r1.n), need=st.net[0].net-r1.net;
    for(let hh=1;hh<=18;hh++){ if(!app.DB().meta.sc.hidden.includes(hh)){ sc.h[hh]=+sc.h[hh]+need; break; } }
    sc.gross=+sc.gross+need; app.render();
    T('同ネットは理由を短く', ()=>/・ 同ネット・年長者が上<\/small>/.test(P()));
    T('順位が変わったら反映を促す（発表は始めない）', ()=>/<small>反映前・ダブルペリア<\/small>/.test(P())&&/<div class="m3-act"><button class="btn primary" onclick="applyScores\(\)">結果を反映して発表の準備へ<\/button>/.test(P())&&!/<div class="m3-act"><button class="btn primary" onclick="startShow/.test(P()));
  }
  {
    const O=app.blank(); app.setDB(O); app.setPhase('award'); app.go('rank');
    T('スコアが無ければ案内だけ', ()=>/<div class="m3 no-print"><p class="hint">スコアを入れると、ここに順位が並びます。<\/p><\/div>/.test(P()));
  }
  app.sample(); global.flush(); app.setPhase('prep'); X('scView','one');
}

console.log('\n=== 仕上げ（段階9：使い方・印刷・参加者カード・照合） ===');
/* 2026-09-17。決めたこと：
   ・使い方は全面的に書き直す（ホーム → 準備 → 当日 → 発表の流れ、スマホ、操作パネル）
   ・スマホの参加者は1人1カード（押すと枠や参加のしかたを開く）
   ・全画面の照合で見つけた小さな差はこの段階で直し、構造の差は一覧にして相談する */
{
  const S9=app.S9();
  const P=()=>store['pane'].innerHTML;
  const X=(f,...a)=>{try{return S9[f]?S9[f](...a):undefined;}catch(e){console.log('  （'+f+' で例外：'+e.message+'）');}};
  const T=(l,f,x)=>{let v,e='';try{v=f();}catch(err){v=false;e=String(err&&err.message||err);}chk(l,!!v,e||(typeof x==='function'?(()=>{try{return x();}catch(_){return '';}})():x||''));};
  const i9=h.indexOf('/* ---- 段階9：スマホの参加者カード');
  const css9=i9>=0?h.slice(i9,h.indexOf('/* ---- 準備 → 当日 → 発表',i9)):'';
  const i9h=h.indexOf('/* ---- 段階9：使い方の段階の見出し');
  const cssH=i9h>=0?h.slice(i9h,h.indexOf('/* ---- 準備 → 当日 → 発表',i9h)):'';
  const i8=h.indexOf('/* ---- 段階8：スマホ（M1〜M3）と低い上部');
  const css8=i8>=0?h.slice(i8,h.indexOf('/* ---- 準備 → 当日 → 発表',i8)):'';

  console.log('  -- 使い方（全面的に書き直し） --');
  app.sample(); global.flush(); app.setPhase('day'); app.go('help');
  const H=P();
  T('節の並び', ()=>{const t=[...H.matchAll(/<h2>([^<]+)/g)].map(m=>m[1].trim());
    return t.join('/')==='このアプリでできること/作業の流れ/いまのルール設定/貼り付けで入力できるもの/スマホで使うとき/発表画面の操作/保存について/困ったときは';},
    ()=>[...H.matchAll(/<h2>([^<]+)/g)].map(m=>m[1].trim()).join('/'));
  T('3つの段階・やることの案内・画面の選び方・大会ハブ', ()=>/<b>3つの段階<\/b>/.test(H)&&/<b>やることの案内<\/b>/.test(H)&&/<b>画面の選び方<\/b>/.test(H)&&/<b>パソコン<\/b>：左の一覧/.test(H)&&/<b>スマホ<\/b>：下のタブと、大会ハブの「すべての画面」/.test(H));
  T('書き方の誤りで ${ が文字として出ない', ()=>!/\$\{/.test(H));
  T('作業の流れを段階ごとに（ホーム・準備・当日・発表・いつでも）', ()=>{const t=[...H.matchAll(/<tr class="hp-ph"><td colspan="3"><b>([^<]+)<\/b>/g)].map(m=>m[1]);return t.join('/')==='ホーム/準備/当日/発表/いつでも';});
  T('いまの段階に印', ()=>/<b>当日<\/b><small>いまの段階<\/small>/.test(H)&&!/<b>準備<\/b><small>いまの段階/.test(H));
  T('手順の番号は1から続けて振る', ()=>{const n=[...H.matchAll(/<td class="c" style="width:44px"><b style="color:var\(--brass\)">(\d+)<\/b>/g)].map(m=>+m[1]);return n.length>=14&&n.every((x,i)=>x===i+1);},
    ()=>[...H.matchAll(/<b style="color:var\(--brass\)">(\d+)<\/b>/g)].map(m=>m[1]).join(','));
  T('画面の名前は実際の名前（組み合わせ・順位・表彰など）', ()=>/<b>組み合わせ<\/b>/.test(H)&&/<b>順位・表彰<\/b>/.test(H)&&/<b>結果共有・出力<\/b>/.test(H)&&/<b>大会を選ぶ<\/b>/.test(H));
  T('前回からのコピーと作成画面の説明', ()=>/「前回の大会から設定をコピー」（ルール・賞・コースだけ引き継ぎ、第◯回を1つ進めます）/.test(H)&&/作成画面で基本 → 競技方法 → 追加ルールの順/.test(H));
  T('コースの収録数はマスタから数える', ()=>{const [f,c]=X('mstCount')||[0,0];return f===2254&&c===5122&&/全国47都道府県の<b>2,254施設・5,122コース<\/b>/.test(H)&&!/379施設/.test(H);});
  T('罰金の手動指定は「結果・発表」にある', ()=>/得票数が並んだときは、「結果・発表」の「手動指定」で決めてください/.test(H)&&!/賞金・収支タブの「手動指定」/.test(H));
  T('「会費」は「賞金の原資」と書く', ()=>/<b>賞金の原資<\/b>/.test(H)&&!/<b>会費<\/b>/.test(H)&&/対象は 16名/.test(H));
  T('貼り付けの場所を書く', ()=>/「参加者」の「貼り付けて取り込む」に貼ります/.test(H)&&/「紙の予想を貼り付け」から/.test(H)&&/「スコア入力」の右の「集計表を貼り付けて取り込む」/.test(H));
  T('スマホで使うとき（参加者・組み合わせ・集金・スコア・順位）', ()=>{const c=H.split('<h2>スマホで使うとき')[1].split('</div>')[0];
    return /1人1枚のカードです。押すと、組・枠・参加のしかた・原資などの欄が開きます/.test(c)&&/長押しして運ぶ/.test(c)&&/受け取り済みになります/.test(c)&&/画面の数字キーで入れます/.test(c)&&/ネット順とグロス順/.test(c);});
  T('発表の操作に操作パネルとスクリーンの表示', ()=>/<b>操作パネル<\/b>/.test(H)&&/<b>先にパネルを開いてから<\/b>/.test(H)&&/<b>スクリーンの表示<\/b>/.test(H)&&/受賞者名は出しません/.test(H)&&/「順位・表彰」の「発表をはじめる」、または「結果・発表」の「発表をはじめる」/.test(H));
  T('困ったとき：画面が見当たらない・予想が入れられない・操作パネルが開かない', ()=>/<b>画面が見当たらない<\/b>/.test(H)&&/<b>予想が入れられない<\/b>/.test(H)&&/<b>操作パネルが開かない<\/b>/.test(H));
  T('来年はコピーで引き継ぐと書く', ()=>/ホームの「前回の大会から設定をコピー」で、ルール・賞・コースを引き継げます/.test(H));
  T('やることの案内の見出しは「次にやること」と書かない（使い方には案内の帯を出さない決まり）', ()=>!/次にやること/.test(H)&&!/class="nx no-print/.test(H));
  app.DB().meta.use={score:true,near:false,nearAny:false,drako:false,keiba:false,gto:false,fine:false,prize:false,budget:false,team:false,lucky:false};
  app.go('help');
  T('使わない機能は流れにも困りごとにも出さない', ()=>!/予想入力/.test(P())&&!/予想が入れられない/.test(P())&&!/配当が/.test(P())&&!/<b>集金<\/b>/.test(P())&&!/<b>賞金・収支<\/b>/.test(P()));
  T('使わない機能を外しても番号は続く', ()=>{const n=[...P().matchAll(/<b style="color:var\(--brass\)">(\d+)<\/b>/g)].map(m=>+m[1]);return n.every((x,i)=>x===i+1);});
  app.DB().meta.use.score=false; app.go('help');
  T('スコアを使わなければスコアの説明も出さない', ()=>!/<b>スコア入力<\/b>/.test(P())&&!/集計表の取り込み/.test(P())&&!/<b>順位・表彰<\/b>/.test(P()));
  T('段階の見出しの見た目', ()=>/\.hp-ph td\{padding-top:14px;/.test(cssH));

  console.log('  -- 印刷 --');
  app.sample(); global.flush(); app.setPhase('day'); app.go('score');
  T('スコア入力の印刷は白紙にせず、案内を出す', ()=>/<p class="po-note">スコアの一覧は「順位・表彰」の画面から印刷できます。<\/p>/.test(P())&&/\.po-note\{display:none\}/.test(cssH)&&/@media print\{\.po-note\{display:block;/.test(cssH));
  T('印刷で要約や表の行をページの境目で分けない', ()=>/\.stat-row,tr,\.gcard,\.ngc\{break-inside:avoid\}\.card h2\{break-after:avoid\}/.test(cssH));
  T('印刷では強調の色も黒', ()=>/\.stat-row b\.hi,\.stat-row b\.warn\{color:#000\}/.test(cssH));
  /* 2026-09-17：集金・集計・結果共有・参加者を印刷すると、紙に大会名も日付も出ていなかった（ブラウザでの確認で発覚）。
     印刷のときだけ画面の見出しと大会名を出す */
  T('印刷では画面の見出しを出す（PCでは画面に出していない）', ()=>/@media print\{#work>\.wrap \.pghead\{display:flex!important\}\.pghead \.pg-m\{display:block!important\}\.pane\.is-hub>\.pghead\{display:flex!important\}/.test(h));
  T('見出しに大会名を添える（印刷だけ）', ()=>/<div class="pg-nm">\$\{esc\(DB\.meta\.name\|\|""\)\}<\/div>/.test(h)&&/\.pg-nm\{display:none\}/.test(h)&&/\.pg-nm\{display:block!important;flex-basis:100%;order:-1;/.test(h));

  console.log('  -- スマホの参加者カード --');
  app.sample(); global.flush(); app.setPhase('prep'); app.go('players');
  const D=app.DB();
  T('1人1枚（はじめは閉じている）', ()=>(P().match(/<div class="pc">/g)||[]).length===16&&!/<div class="pc open">/.test(P())&&S9.PEXP===-1);
  T('カードに番号・氏名・所属と生年月日・組と枠', ()=>new RegExp('<button class="pc-h" onclick="pExp\\(0\\)" aria-expanded="false"><span class="pc-no">1</span>\\s*<span class="pc-nm"><strong>'+D.players[0].n+'</strong><small>'+D.players[0].org+' ・ '+D.players[0].bd+'</small></span>\\s*<span class="pc-g">'+D.players[0].g+'組<i>'+D.players[0].f+'枠</i></span></button>').test(P()));
  T('閉じたカードには入力欄を出さない（表と二重にしない）', ()=>(P().match(/joinSet\(/g)||[]).length===16);
  X('pExp',2);
  const c2=()=>P().split('<div class="pc open">')[1]||'';
  T('押すと開く', ()=>S9.PEXP===2&&/aria-expanded="true"/.test(P())&&(P().match(/<div class="pc open">/g)||[]).length===1);
  T('開いたカードに氏名・所属・生年月日・組', ()=>/oninput="pEdit\(2,'n',this\.value\)"/.test(c2())&&/oninput="pEdit\(2,'org',this\.value\)"/.test(c2())&&/onchange="pEdit\(2,'bd',parseDate\(this\.value\)\|\|this\.value\)"/.test(c2())&&/onchange="pEdit\(2,'g',this\.value\)"/.test(c2()));
  T('枠・実力・参加のしかた・原資・個別額', ()=>/onchange="pEdit\(2,'f',this\.value\)"/.test(c2())&&/onchange="pEdit\(2,'skill',this\.value\)"/.test(c2())&&/onchange="joinSet\(2,this\.value\)"/.test(c2())&&/onchange="pEdit\(2,'fee',this\.checked\)"> 賞金の原資の対象/.test(c2())&&/onchange="pEdit\(2,'feeAmt',this\.value\)"/.test(c2()));
  T('上へ・下へ・削除', ()=>/onclick="pMove\(2,-1\)">▲ 上へ/.test(c2())&&/onclick="pMove\(2,1\)">▼ 下へ/.test(c2())&&/onclick="pDel\(2\)">削除/.test(c2()));
  X('pExp',2);
  T('もう一度押すと閉じる', ()=>S9.PEXP===-1&&!/<div class="pc open">/.test(P()));
  X('pExp',0);
  T('先頭の人は上へ動かせない', ()=>/onclick="pMove\(0,-1\)" disabled>/.test(P()));
  X('pMove',0,1);
  T('並べ替えても開いたカードは同じ人', ()=>S9.PEXP===1&&P().includes('<strong>'+D.players[1].n+'</strong>')&&/pExp\(1\)" aria-expanded="true"/.test(P()));
  X('pAdd');
  T('1名追加すると新しいカードが開く', ()=>S9.PEXP===16&&/pExp\(16\)" aria-expanded="true"><span class="pc-no">17<\/span>\s*<span class="pc-nm"><strong>（氏名なし）<\/strong><small>所属・生年月日なし<\/small>/.test(P()));
  X('pDel',16);
  T('削除すると閉じる', ()=>S9.PEXP===-1&&D.players.length===16);
  X('joinSet',15,'vote');
  T('予想のみの方に印', ()=>/<span class="pc-g">組なし<i>予想のみ<\/i><\/span>/.test(P()));
  X('pExp',15);
  T('原資の対象外なら個別額は出さない', ()=>!/pEdit\(15,'feeAmt'/.test(P())&&/pEdit\(15,'fee',this\.checked\)/.test(P()));
  X('cAdd','車代（1台あたり）','unit');
  T('車の項目があれば「車を出す」', ()=>/onchange="pEdit\(15,'cars',this\.checked\)"> 車を出す/.test(P()));
  T('枠を割り振るボタンもカードの下に', ()=>/<button class="btn ghost pc-pair" onclick="fPair2\(\)">枠を2人ずつ割り振る/.test(P()));
  D.meta.frameMode='group'; app.render();
  T('枠が組と同じなら枠と実力の欄は出さない', ()=>!/pEdit\(15,'f',/.test(P())&&!/class="btn ghost pc-pair"/.test(P()));
  D.meta.frameMode='manual'; X('pExp',15);
  T('スマホでは表・列の切替・説明を隠し、カードを出す', ()=>/\.pcards\{display:none\}/.test(css9)&&/\.pwrap \.ptab,\.p-seg,\.pwrap \.pv\{display:none!important\}/.test(css9)&&/\.pcards\{display:flex;/.test(css9));
  T('カードは押しやすい高さ', ()=>/\.pc-h\{display:grid;[^}]*min-height:60px;/.test(css9));
  app.setDB(app.blank()); app.go('players');
  T('空のときの案内', ()=>/<div class="pcards no-print"><p class="hint">まだ誰も登録されていません。下の「貼り付けて取り込む」で/.test(P()));

  console.log('  -- 照合で見つけた小さな差 --');
  app.sample(); global.flush(); X('setFILE',''); app.go('hub');
  T('サイドバー：ファイルが無ければ「いまの大会」', ()=>/<div class="sd-file"><small>いまの大会<\/small>/.test(store['side'].innerHTML));
  X('setFILE','第10回_親睦.json'); app.render();
  T('サイドバー：ファイルがあれば「ファイル」とファイル名', ()=>/<div class="sd-file"><small>ファイル<\/small><b>第10回 親睦ゴルフコンペ<\/b>[\s\S]*<code>第10回_親睦\.json<\/code>/.test(store['side'].innerHTML));
  X('setFILE','');
  T('スマホ：見出しの補足（開催日など）は上部にあるので隠す', ()=>/\.pghead \.pg-m\{display:none\}/.test(css8));
  T('スマホ：大会ハブは見出しを出さない（デザイン案M1）', ()=>/\.pane\.is-hub>\.pghead\{display:none\}/.test(css8)&&/pane\.classList\.toggle\("is-hub",TAB==="hub"\)/.test(h));
  app.setPhase('prep');
}

console.log('\n=== スコア入力の導線（2026-09-18：ハンディの直接入力・棄権ノーカード） ===');
/* 決めたこと：
   ・「スコアを入れる」はネットが出た人数で判定し、欠けている人を名前で出す
   ・隠しホールが分からない方は、その人だけハンディ（18ホール方式ではグロスも）を直接入れられる
   ・回らなかった方は「棄権・ノーカード」の印を付ける（空欄＝これから入れる、と区別する）
   きっかけ：隠しホール方式と集計表方式では、1人分のハンディが欠けていても「済み」と出て、
   その人が順位表から静かに消えていた（2026-09-18、実測で判明） */
{
  const SA=app.SA();
  const P=()=>store['pane'].innerHTML;
  const X=(f,...a)=>{try{return SA[f]?SA[f](...a):undefined;}catch(e){console.log('  （'+f+' で例外：'+e.message+'）');}};
  const T=(l,f,x)=>{let v,e='';try{v=f();}catch(err){v=false;e=String(err&&err.message||err);}chk(l,!!v,e||(typeof x==='function'?(()=>{try{return x();}catch(_){return '';}})():x||''));};
  const ia=h.indexOf('/* ---- スコア入力の導線（2026-09-18）');
  const css=ia>=0?h.slice(ia,h.indexOf('/* ---- 段階9：スマホの参加者カード',ia)):'';

  app.sample(); global.flush(); app.setPhase('day'); app.SCset('entry','hidden');
  const D=app.DB(), R=app.RUN(), hid=D.meta.sc.hidden.slice(0,12);
  console.log('  -- 入れ物（項目の追加だけ） --');
  T('ハンディの直接入力と棄権の印を持つ', ()=>{const s=X('scoreOf',R[0].n);return s.hcOver===''&&s.nc===false;});
  T('古いファイルにも補う', ()=>{const o=app.migrate(JSON.parse(JSON.stringify(D)));delete o.scores[R[0].n].hcOver;delete o.scores[R[0].n].nc;
    app.setDB(o);const s=X('scoreOf',R[0].n);const ok=s.hcOver===''&&s.nc===false;app.sample();global.flush();app.setPhase('day');app.SCset('entry','hidden');return ok;});

  console.log('  -- 欠けたときに気づける --');
  const E=app.DB(), RR=app.RUN(), s0=X('scoreOf',RR[0].n);
  const step=()=>app.flowSteps().find(x=>x.label==='スコアを入れる');
  T('全部そろえば済み', ()=>step().done===true&&(X('scoreState')||{}).wait.length===0);
  const keep=s0.h[hid[3]]; s0.h[hid[3]]='';
  T('隠しホールが1つ欠けるとハンディが出ない', ()=>X('hcOf',RR[0])===null&&app.standings().net.length===RR.length-1);
  T('「スコアを入れる」が未になり、名前と理由を出す', ()=>step().done===false&&step().rest==='残り1名'&&step().desc.includes(RR[0].n+'（ハンディが未確定）'), ()=>step().rest+' / '+step().desc.slice(0,40));
  app.go('score');
  T('画面にも名前と理由を出す', ()=>new RegExp('順位に入っていない方が 1名 います。\\s*'+RR[0].n+'（ハンディが未確定）').test(P()));
  T('直し方も添える', ()=>/HDCPの欄に直接<\/b> 入れられます。回らなかった方は <b>ノーカード<\/b> に印を付けてください/.test(P()));
  T('進みはネットが出た人数', ()=>new RegExp('<b>'+(RR.length-1)+' / '+RR.length+'</b> 入力済').test(P()));

  console.log('  -- ハンディを直接入れる --');
  T('HDCPの欄は直接入力（下敷きに計算値）', ()=>new RegExp('<input class="q" type="number" step="0.1" value="" placeholder="'+X('hcCalc',RR[1])+'"\\s*onchange="scSet\\(\''+RR[1].n+'\',\'hcOver\',this.value\\)"').test(P()));
  X('scSet',RR[0].n,'hcOver','12.3');
  T('入れた値が使われる', ()=>X('hcOf',RR[0])===12.3&&app.standings().net.length===RR.length);
  T('入れた欄は色を変える', ()=>/<input class="q ov" type="number" step="0\.1" value="12\.3"/.test(P())&&/\.s-tab input\.q\.ov\{border-color:var\(--brass\)/.test(css));
  T('済みに戻る', ()=>step().done===true);
  X('scSet',RR[0].n,'hcOver','35');
  T('上限を超えたら上限に丸める', ()=>X('hcOf',RR[0])===+app.DB().meta.sc.hcMax&&X('hcRaw',RR[0])===35, ()=>X('hcOf',RR[0])+' / '+X('hcRaw',RR[0]));
  app.go('rank');
  T('上限の知らせにも出る', ()=>new RegExp('ハンディが上限（30）に達した方[\\s\\S]*'+RR[0].n+'（本来 35').test(P()));
  X('scSet',RR[0].n,'hcOver',''); s0.h[hid[3]]=keep; app.go('score');
  T('空に戻せば計算値に戻る', ()=>X('hcOf',RR[0])===X('hcCalc',RR[0])&&step().done===true);
  app.SCset('entry','sheet');
  T('集計表方式ではHDCPの欄がそのまま直接入力（二重にしない）', ()=>!/hcOver/.test(P())&&/onchange="scSet\('[^']+','hc',this\.value\)"/.test(P()));
  app.SCset('entry','all');
  const sa=X('scoreOf',RR[0].n), k5=sa.h[5]; sa.h[5]='';
  T('18ホール方式：ホールが欠けてもグロスを直接入れられる', ()=>X('allSum',RR[0])===null&&X('grossOf',RR[0])===+sa.gross);
  T('グロスの欄は直接入力（下敷きに合計）', ()=>new RegExp('placeholder="'+X('allSum',RR[1])+'" onkeydown="scKey\\(event\\)"\\s*onchange="scSet\\(\''+RR[1].n+'\',\'gross\',this.value\\)"').test(P()));
  const kg=sa.gross; sa.gross='';
  T('どちらも無ければ順位に入らない', ()=>X('grossOf',RR[0])===null&&step().desc.includes(RR[0].n+'（グロスが未入力）'));
  sa.gross=kg; sa.h[5]=k5; app.SCset('entry','hidden');

  console.log('  -- 棄権・ノーカードの印 --');
  X('scSet',RR[2].n,'nc',true);
  T('印を付けると順位・下位3名・罰金から外れる', ()=>X('ncOf',RR[2])===true&&X('grossOf',RR[2])===null&&X('hcOf',RR[2])===null
    &&!app.standings().net.some(r=>r.n===RR[2].n)&&!app.standings().worst3.some(r=>r.n===RR[2].n));
  T('入力漏れとは数えない（済みのまま）', ()=>step().done===true&&(X('scoreState')||{}).nc.length===1);
  app.go('score');
  T('行を薄くして「ノーカード」と出す', ()=>/<tr class="zebra ncrow" id="sr-2">/.test(P())&&/<small class="s-nc">ノーカード<\/small>/.test(P())&&/tr\.ncrow td\{opacity:\.55\}/.test(css));
  T('ノーカードの人の欄は押せない', ()=>{const row=P().split('id="sr-2"')[1].split('</tr>')[0];return (row.match(/ disabled>/g)||[]).length>=2;});
  T('印はチェック欄で付け外しする', ()=>/<th class="c no-print" style="width:64px">ノー<br>カード<\/th>/.test(P())&&new RegExp('<input type="checkbox" checked onchange="scSet\\(\''+RR[2].n+'\',\'nc\',this.checked\\)"').test(P()));
  T('人数に添える', ()=>/ノーカード 1名 ・ /.test(P()));
  app.go('rank');
  T('順位の画面にも注記', ()=>new RegExp('棄権・ノーカード 1名（'+RR[2].n+'）は順位に入りません').test(P()));
  X('scSet',RR[2].n,'nc',false);
  T('外せば戻る', ()=>X('grossOf',RR[2])!==null&&(X('scoreState')||{}).nc.length===0);

  console.log('  -- スマホ（1人ずつ） --');
  app.go('score'); X('scView','one');
  const one=()=>(X('m2Html')||'');
  T('ハンディを直接入れる欄', ()=>/<label class="m2-hc">ハンディを直接\s*<input type="number" step="0\.1"/.test(one()));
  T('棄権・ノーカードのボタン', ()=>/<button class="m2-nc" onclick="scSet\('[^']+','nc',true\)" aria-pressed="false">棄権・ノーカードにする<\/button>/.test(one()));
  {
    const m=/onclick="scSet\('([^']+)','nc',true\)"/.exec(one())||[,app.RUN()[0].n]; X('scSet',m[1],'nc',true);
    T('押すと印が付き、数字キーが止まる', ()=>/<button class="m2-nc on" onclick="scSet\('[^']+','nc',false\)" aria-pressed="true">✓ 棄権・ノーカード<\/button>/.test(one())
      &&/<div class="m2-fields many off">/.test(one())&&(one().match(/ disabled aria-label/g)||[]).length>=10);
    T('ボタンは「次の人へ」になる', ()=>/<button class="m2-next" onclick="m2Next\(\)">次の人へ<\/button>/.test(one()));
    T('理由を書く', ()=>/棄権・ノーカードにしました。順位・GTOの下位3名・罰金のどれにも入りません/.test(one()));
    X('scSet',m[1],'nc',false);
  }
  T('集計表方式ではハンディの直接入力を出さない（HDCPの欄があるため）', ()=>{app.SCset('entry','sheet');const o=one();app.SCset('entry','hidden');return !/m2-hc/.test(o)&&/m2-nc/.test(o);});

  console.log('  -- 使い方 --');
  app.go('help');
  T('棄権・ノーカードの節', ()=>/<b>棄権・ノーカード<\/b>|棄権・ノーカード/.test(P())&&/「ノーカード」に印<\/b>を付けてください/.test(P()));
  T('ハンディが出せないときの節', ()=>/ハンディが出せないとき/.test(P())&&/HDCPの欄に直接<\/b>入れられます/.test(P())&&/<b>ネットが出た人数<\/b>で済みかどうかを判定します/.test(P()));
  app.setPhase('prep'); app.SCset('entry','hidden');
}

console.log('\n=== 集金のあとの差額（2026-09-18、v55：受け取った額・差額・繰越で埋める・キャンセル料） ===');
/* 決めたこと（推奨案どおり。3だけ「足りないぶんに限る」と絞った）：
   1. 受け取った額と内訳を残す。旧版の「受け取り済」は開いた時点の徴収額を受け取ったとみなす
   2. 差額が0の人だけ済み。差額のある人を名前・金額・理由で出す
   3. 1人ずつ精算が既定。追加でいただく差額だけ、ボタン1つで繰越金で埋められる（お返しは本人のお金なので埋めない）
   4. プレーしない方にキャンセル料の欄。本人の徴収額に足し、収支は預かり＝ゴルフ場への支払い
   きっかけ：受け取ったかどうかしか持っておらず、欠席で頭割りが変わっても「16/16 受け取り済」のままだった（実測） */
{
  const SD=app.SD();
  const X=(f,...a)=>{try{return SD[f]?SD[f](...a):undefined;}catch(e){console.log('  （'+f+' で例外：'+e.message+'）');}};
  const T=(l,f,x)=>{let v,e='';try{v=f();}catch(err){v=false;e=String(err&&err.message||err);}chk(l,!!v,e||(typeof x==='function'?(()=>{try{return x();}catch(_){return '';}})():x||''));};
  const P=()=>{app.render();return store['pane'].innerHTML;};
  const ia=h.indexOf('/* ---- 集金のあとの差額（2026-09-18、v55）');
  const css=ia>=0?h.slice(ia,h.indexOf('/* ---- 画面の骨格',ia)):'';
  const step=()=>app.flowSteps().find(x=>x.tab==='collect')||{};
  const ST=()=>app.settle(), by=n=>ST().find(x=>x.n===n)||{};

  app.sample(); global.flush(); app.setPhase('day');
  const D=app.DB();
  app.BG().collect.push({label:'ガソリン代',amt:37000,mode:'total'}); app.BG().roundUnit=500;
  const S0=ST(); const bill0={}; S0.forEach(x=>bill0[x.n]=x.bill);
  console.log('  -- 入れ物 --');
  app.payToggle(S0[0].n,true);
  T('受け取ると額と内訳が残る', ()=>{const r=D.paid[S0[0].n];return r&&typeof r==='object'&&r.y===S0[0].bill&&r.play===S0[0].play&&r.fee===S0[0].fee&&r.kq===S0[0].kq&&r.gq===S0[0].gq&&r.mem===15+1;},
    ()=>JSON.stringify(D.paid[S0[0].n]));
  app.payToggle(S0[0].n,false);
  T('外すと記録ごと消える', ()=>!(S0[0].n in D.paid));
  T('旧版の「受け取り済」は開いた時点の徴収額を受け取ったとみなす', ()=>{
    const o=app.migrate(JSON.parse(JSON.stringify(D))); o.paid={}; o.players.forEach(p=>o.paid[p.n]=true);
    app.setDB(o); const L=app.settle(); const ok=L.every(x=>x.got&&x.diff===0&&typeof o.paid[x.n]==='object'&&o.paid[x.n].y===x.bill);
    app.setDB(D); return ok;});

  console.log('  -- 欠席で頭割りが変わる --');
  S0.forEach(x=>app.payToggle(x.n,true));
  T('全員受け取れば済み', ()=>step().done===true&&X('sideCount0','collect')==='16/16');
  const i5=5, who=D.players[i5].n, g5=D.players[i5].g, f5=D.players[i5].f;
  app.pEdit(i5,'g',0);
  const dif=()=>ST().filter(x=>x.got&&x.diff);
  T('受け取ったあとで金額が変わると済みでなくなる', ()=>step().done===false&&dif().length===4, ()=>dif().length+'名');
  T('欠席者はお返し（受け取った額 − いまの額）', ()=>by(who).diff===by(who).bill-bill0[who]&&by(who).diff<0, ()=>by(who).diff);
  const others=()=>dif().filter(x=>x.n!==who);
  T('頭割りが変わった方は追加でいただく', ()=>others().length===3&&others().every(x=>x.diff===500));
  T('理由：プレーしないため', ()=>X('payWhy',by(who))==='プレーしないため、実費と賞金の原資がなくなりました', ()=>X('payWhy',by(who)));
  T('理由：頭割りの人数', ()=>others().length===3&&others().every(x=>X('payWhy',x)==='実費 +154円（頭割りの人数 16→15名）'), ()=>X('payWhy',others()[0]));
  T('大会ハブに差額の人数', ()=>step().rest==='差額4名', ()=>step().rest);
  T('大会ハブに名前と金額', ()=>step().desc.includes(who+'（お返し '+app.yen(-by(who).diff)+'円）')&&/（追加で 500円）/.test(step().desc), ()=>step().desc.slice(0,60));
  T('一覧の数も差額を数える', ()=>X('sideCount0','collect')==='12/16', ()=>X('sideCount0','collect'));

  console.log('  -- 集金の画面（PC） --');
  app.go('collect');
  const H=P();
  T('差額の知らせ（人数）', ()=>/<div class="msg warn pay-dif no-print" id="pay-dif"><b>受け取ったあとで金額が変わった方が 4名 います。<\/b>/.test(H));
  T('差額の知らせ（名前・金額・理由）', ()=>new RegExp('<li><b>'+who+'</b>　<span class="pay-dv out">お返し [\\d,]+円</span>\\s*<small>（プレーしないため').test(H));
  T('表に「受け取った額」「差額」の列', ()=>/<th class="n pay-dh"[^>]*>受け取った額<\/th><th class="c pay-dh"[^>]*>差額<\/th>/.test(H));
  const row=n=>{const t=H.slice(H.indexOf('<table class="hscroll pay-table">'));const i=t.indexOf('<td>'+n);return t.slice(t.lastIndexOf('<tr',i),t.indexOf('</tr>',i));};
  T('差額の行は△にし、チェックを外す操作にしない', ()=>/<span class="pay-dmk"[^>]*>△<\/span>/.test(row(who))&&!/type="checkbox"/.test(row(who)));
  T('差額のボタンで精算する', ()=>new RegExp('onclick="paySettle\\(\''+who+'\'\\)">−[\\d,]+<span class="pay-da"> お返しした</span></button>').test(row(who))&&/">\+500<span class="pay-da"> 受け取った<\/span><\/button>/.test(H));
  T('ボタンに理由を添える（title）', ()=>/<button type="button" class="pay-dbt out" title="プレーしないため/.test(row(who)));
  T('見出しの段が列の数とそろう', ()=>{const th=H.slice(H.indexOf('<table class="hscroll pay-table"><thead>'),H.indexOf('</thead>',H.indexOf('<table class="hscroll pay-table">')));
    const trs=th.split('</tr>'); const top=(trs[0].match(/<th(?:\s[^>]*)?>/g)||[]).reduce((a,t)=>a+(+(/colspan="(\d+)"/.exec(t)||[,1])[1]),0);
    const low=(trs[1].match(/<th(?:\s[^>]*)?>/g)||[]).length; return top===low&&low>10;}, 'thead');
  T('合計の行の済み数は差額を除く', ()=>/<tr><td class="c">12\/16<\/td><td><b>合計<\/b><\/td>/.test(H));
  T('差額が無い行は従来どおり', ()=>new RegExp('<input type="checkbox" checked\\s*onchange="payToggle\\(\''+S0[0].n+'\',this.checked\\)">').test(H));

  console.log('  -- スマホのカード --');
  const C=H.slice(H.indexOf('<div class="pay-cards">'),H.indexOf('<table class="hscroll pay-table">'));
  T('差額のカードは3つめの見た目（途中の状態）', ()=>new RegExp('<button type="button" class="pay-c got dif out" role="checkbox" aria-checked="mixed"\\s*onclick="paySettle\\(\''+who+'\'\\)">').test(C)&&(C.match(/class="pay-c got dif in"/g)||[]).length===3);
  T('受け取った額といまの額を並べる', ()=>new RegExp('受け取り済 '+app.yen(bill0[who])+'円</span> → <span class="nw">いま '+app.yen(by(who).bill)+'円').test(C));
  T('何をすれば済むかを書く', ()=>/<span class="pay-dt">お返ししたら押す<\/span>/.test(C)&&/<span class="pay-dt">受け取ったら押す<\/span>/.test(C));
  T('下の帯に差額の人数', ()=>/<b class="pay-rest">差額 4名<\/b>\s*<small>押して精算<\/small>/.test(C)&&/<b class="pay-n">12<span> \/ 16<\/span><\/b>/.test(C));
  app.payOnly(true);
  T('「未集金だけ」にも差額の方を残す', ()=>{const c=P();const cc=c.slice(c.indexOf('<div class="pay-cards">'),c.indexOf('<table class="hscroll pay-table">'));
    return (cc.match(/<button type="button" class="pay-c/g)||[]).length===4;});
  app.payOnly(false);

  console.log('  -- 追加の分を繰越金で埋める --');
  T('ボタンは追加の分だけを数える', ()=>/onclick="payCover\(\)">追加でいただく 3名・1,500円を繰越金で埋める<\/button>/.test(H));
  T('お返しは埋めないと書く', ()=>new RegExp('お返しする 1名・'+app.yen(-by(who).diff)+'円は本人のお金なので、繰越金には回しません').test(H));
  const bd0=X('budget');
  X('payCover');
  T('埋めると3名の差額が消える', ()=>others().length===0&&ST().filter(x=>x.cover===500).length===3);
  T('欠席者のお返しは残る', ()=>by(who).diff<0&&step().done===false&&step().rest==='差額1名', ()=>step().rest);
  const bd1=X('budget');
  T('収支の支出に「差額の穴埋め（繰越金から）」', ()=>bd1.exp.some(x=>x.l==='差額の穴埋め（繰越金から）'&&x.v===1500));
  T('収支の差し引きがその分だけ減る', ()=>bd0.diff-bd1.diff===1500, ()=>bd0.diff-bd1.diff);

  console.log('  -- お返しして済みに戻る --');
  X('paySettle',who);
  T('押すとお返し済みになり、済みに戻る', ()=>by(who).diff===0&&by(who).paidY===by(who).bill&&step().done===true&&X('sideCount0','collect')==='16/16');

  console.log('  -- キャンセル料 --');
  const cc=X('cancelCard')||'';
  T('プレーしない方にだけ欄を出す', ()=>new RegExp('<span class="cx-n">'+who+'</span>').test(cc)&&(cc.match(/class="cx-row"/g)||[]).length===D.players.filter(p=>p.fee===false).length);
  T('プレーする方にはかからない', ()=>{const p=D.players[0];p.cancel=5000;const v=X('cancelOf',p);delete p.cancel;return v===0;});
  const b5=by(who).bill;
  app.pEdit(i5,'cancel','13500');
  T('入れると本人の徴収額に加わる', ()=>by(who).bill===b5+13500&&by(who).diff===13500, ()=>by(who).bill+' / '+by(who).diff);
  T('差額の理由にキャンセル料', ()=>X('payWhy',by(who))==='キャンセル料 13,500円');
  const bd2=X('budget');
  T('収支：預かりとゴルフ場へのキャンセル料が同額', ()=>bd2.inc.some(x=>x.l==='キャンセル料の預かり（1名）'&&x.v===13500)&&bd2.exp.some(x=>x.l==='ゴルフ場へのキャンセル料'&&x.v===13500));
  T('表にキャンセル料の列', ()=>/<th class="n" style="min-width:6\.5em">キャンセル料<\/th>/.test(P()));
  T('入れた方がいれば欄を開いておく', ()=>/<details class="card no-print cx-card" id="sec-cancel" open>/.test(X('cancelCard')||''));
  X('paySettle',who);

  console.log('  -- 組に戻したとき --');
  app.pEdit(i5,'g',g5); app.pEdit(i5,'f',f5);
  T('埋めたぶんは消え、3名の差額は0に戻る', ()=>ST().filter(x=>x.cover).length===0&&ST().filter(x=>x.got&&x.diff).length===1);
  T('戻した方には追加でいただく額が出る', ()=>by(who).diff>0&&/実費 [\d,]+円が加わりました/.test(X('payWhy',by(who))||''), ()=>X('payWhy',by(who)));
  X('paySettle',who);
  T('押せば全員済み', ()=>step().done===true);

  console.log('  -- 済みの数え方をそろえる（スコア） --');
  app.SCset('entry','hidden');
  const R=app.RUN(), s0=X('scoreOf',R[0].n), hk=D.meta.sc.hidden[3], keep=s0&&s0.h[hk];
  if(s0) s0.h[hk]='';
  T('サイドバーの数もネットが出た人数', ()=>X('sideCount0','score')===(R.length-1)+'/'+R.length, ()=>X('sideCount0','score'));
  T('「順位を確かめる」の残りも同じ数え方', ()=>(app.flowSteps().find(x=>x.label==='順位を確かめる')||{}).rest==='未確定1名', ()=>(app.flowSteps().find(x=>x.label==='順位を確かめる')||{}).rest);
  if(s0) s0.h[hk]=keep;

  console.log('  -- 使い方・見た目 --');
  app.go('help');
  T('困ったときは：集金のあとで欠席が出た', ()=>/集金のあとで欠席が出た/.test(P())&&/<b>差額と理由<\/b>が出ます/.test(P())&&/<b>キャンセル料<\/b>に入れます/.test(P()));
  T('スマホの集金：△のカード', ()=>/<b>△ のカード<\/b>になり、押すと差額を受け取った（お返しした）ことになります/.test(P()));
  T('差額のカードは点線の枠', ()=>/\.pay-c\.dif\{background:rgba\(242,208,36,\.07\);border:2px dashed var\(--hit\)/.test(css));
  T('お返しは緑で分ける', ()=>/\.pay-c\.dif\.out\{border-color:#8fd3a8/.test(css));
  T('印刷では差額のボタンを黒の文字にし、「受け取った」の指示は出さない', ()=>/@media print\{\.pay-dbt,\.pay-dbt\.out\{border:none;padding:0;min-height:0;color:#000;font-size:inherit\}\.pay-da\{display:none\}/.test(css));
  /* v54以前から：集金表を印刷すると、横スクロールのまま紙に出て徴収額より右が切れていた（v55で紙に当てて発見） */
  T('印刷：集金表は表として組み、列の最小幅を外す', ()=>/@media print\{\.card table\.pay-table\{display:table;max-width:none;white-space:normal\}\s*\.card table\.pay-table th,\.card table\.pay-table td\{min-width:0!important;padding:3px 2px;font-size:9px/.test(css));
  T('印刷：金額の色は黒', ()=>/\.card table\.pay-table td,\.card table\.pay-table th\{color:#000!important\}/.test(css));
  T('印刷：集金表のカードはページをまたいでよい（1枚目が空かない）', ()=>/#sec-collect\{page-break-inside:auto;break-inside:auto\}/.test(css));
  app.setPhase('prep');
}

console.log('\n=== 背の低い画面のサイドバー（2026-09-18、v56：スクロールバーの色・足元の貼り付け） ===');
/* 実機の画面で指摘：準備の段階でサイドバーが画面の高さを超えると、ブラウザ標準の明るいスクロールバーが
   サイドバーと本文の間に白い枠のように出ていた。あわせて足元の「ホーム・データ・使い方」が画面の外へ押し出され、
   スクロールバーの幅だけ狭くなって項目が2行に折れていた。実際の見え方はブラウザの検査で確かめる */
{
  const ia=h.indexOf('/* ---- 背の低い画面のサイドバー（2026-09-18、v56）');
  const css=ia>=0?h.slice(ia,h.indexOf('</style>',ia)):'';
  const T=(l,f)=>{let v;try{v=f();}catch(e){v=false;}chk(l,!!v);};
  T('足元を画面の下に貼り付ける', ()=>/\.sd-foot\{position:sticky;bottom:-16px;z-index:1;padding-bottom:16px;background:#0a1d13/.test(css));
  T('サイドバーのスクロールバーは細く地の色', ()=>/\.side\{scrollbar-width:thin;scrollbar-color:var\(--rule\) transparent\}/.test(css));
  T('Safari でも同じ色（::-webkit-scrollbar）', ()=>/\.side::-webkit-scrollbar\{width:6px\}/.test(css)&&/\.side::-webkit-scrollbar-thumb\{background:var\(--rule\)/.test(css));
  T('背の低い画面では、マウスのときだけ行を詰める', ()=>/@media screen and \(min-width:1024px\) and \(max-height:820px\) and \(pointer:fine\)\{[^}]*\}[\s\S]*?\.sd-i\{min-height:32px/.test(css));
  T('本文と表のスクロールバーも地の色（受け継がれる scrollbar-color）', ()=>/@media screen\{\s*html\{scrollbar-color:var\(--rule\) var\(--board\)\}/.test(css));
  T('スクロールバーを隠している上のタブ列はそのまま', ()=>/\.tabs\{[^}]*scrollbar-width:none/.test(h)&&/\.tabs::-webkit-scrollbar\{display:none\}/.test(h));
  T('足元の3つ（ホーム・データ・使い方）は変えていない', ()=>{app.sample();global.flush();const x=app.sideHtml();return /class="sd-foot"/.test(x)&&/ホーム/.test(x)&&/データ/.test(x)&&/使い方/.test(x);});
}

console.log('\n=== 賞は名前で発表する ===');
/* 「その他の賞」と出しても、受け手には何の賞か分からない。
   見出しをその賞の名前にして1枚ずつ出す。
   賞が多いときだけ、後半をまとめて1枚にする（2026-09-08）。 */
app.sample(); global.flush(); app.buildSlides();
{
  const kick=s=>{try{return (s.html().match(/kicker">([^<]*)/)||['',''])[1].replace(/ /g,'');}catch(e){return "";}};
  const pz=app.slides.filter(s=>/^s-pz\d+$/.test(s.id));
  chk('賞ごとに1枚ずつ出る', pz.length===3, pz.length+'枚');
  chk('見出しが賞の名前', pz.map(kick).join('/')==='5位/10位/BB', pz.map(kick).join('/'));
  chk('受賞者の氏名が出る',
      pz.every(s=>/name-xl">[^<]{2,}/.test(s.html())),
      pz.map(s=>(s.html().match(/name-xl">([^<]*)/)||['',''])[1]).join('/'));
  chk('金額も出る', pz.every(s=>/\d,\d{3}円/.test(s.html())));
  chk('「その他の賞」は出ない', !app.slides.some(s=>s.id==='s-other'));
  chk('優勝・2位・3位・ベスグロは別に出る',
      ['s-1','s-2','s-3','s-best'].every(k=>app.slides.some(s=>s.id===k)));
  console.log('  -- 賞が多いときは後半をまとめる --');
  const rows=app.DB().meta.prizes.rank;
  [4,6,7,8,9,11,12].forEach(r=>rows.push({label:r+'位',n:r,amt:500}));
  app.applyScores(); app.buildSlides();
  const pz2=app.slides.filter(s=>/^s-pz\d+$/.test(s.id));
  const oth=app.slides.find(s=>s.id==='s-other');
  chk('1枚ずつは5枚まで', pz2.length===5, pz2.length+'枚');
  chk('残りは1枚にまとまる', !!oth);
  chk('まとめた画面の見出しにも賞名が並ぶ',
      oth&&/7位　・　8位　・　9位　・　11位　・　12位/.test(oth.html()),
      oth?(oth.html().match(/kicker">([^<]*)/)||['',''])[1]:'なし');
  chk('まとめた画面に賞名・氏名・金額が並ぶ',
      oth&&(oth.html().match(/class="winner"/g)||[]).length===5,
      oth?(oth.html().match(/class="winner"/g)||[]).length+'名':'—');
  chk('受賞者のいない賞は出さない',
      app.prizeRows().filter(r=>r.who).length>=pz2.length);
  console.log('  -- 全画面が描ける --');
  let e=[];
  app.slides.forEach(s=>{try{s.html();}catch(x){e.push(s.id);}});
  chk('全'+app.slides.length+'画面が例外なく描ける', e.length===0, e.join(','));
  chk('空白の画面が無い',
      !app.slides.some(s=>{try{return /該当なし|>—</.test(s.html());}catch(x){return true;}}));
}

console.log('\n合計 NG: ' + ng);
