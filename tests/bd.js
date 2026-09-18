/* アプリの場所。テストと同じ場所の site/ を先に見て、無ければ ../docs/ を使う。
   リポジトリでは tests/ と docs/ が並ぶ構成なので、どちらでも動く */
const _P=require('path'),_F=require('fs');
const _DIR=[_P.join(__dirname,'site'),_P.join(__dirname,'..','docs')]
  .find(d=>_F.existsSync(_P.join(d,'pc.html')))||_P.join(__dirname,'site');
const APP={dir:_DIR+'/', get pc(){return this.dir+'pc.html'}, get scan(){return this.dir+'index.html'}};
const fs=require('fs');
const h=fs.readFileSync(APP.pc,'utf8');
const src=h.slice(h.indexOf('<script>')+8,h.lastIndexOf('</script>'));
const store={};const mk=id=>({id,value:'',textContent:'',className:'',checked:false,style:{},files:[],
  _html:'',get innerHTML(){return this._html},set innerHTML(v){this._html=v},
  classList:{add(){},remove(){},toggle(){},contains:()=>false},
  addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML(){},click(){},focus(){}});
const doc={documentElement:{style:{},requestFullscreen(){}},body:{className:'',classList:{add(){},remove(){},contains:()=>false}},
  getElementById:id=>store[id]||(store[id]=mk(id)),querySelectorAll:()=>[],addEventListener(){},createElement:()=>mk('a')};
global.document=doc;global.window={AudioContext:function(){throw 0},addEventListener(){}};
const _t=[];global.setTimeout=f=>{_t.push(f);return 1};global.flush=()=>_t.splice(0).forEach(f=>{try{f()}catch(e){}});
global.setInterval=()=>1;global.clearInterval=()=>{};global.clearTimeout=()=>{};
global.performance={now:()=>0};global.requestAnimationFrame=()=>{};
let A=[];global.alert=m=>A.push(m);global.confirm=()=>true;
global.URL={createObjectURL:()=>'',revokeObjectURL(){}};global.Blob=class{};
global.localStorage={setItem(){},getItem(){return null},removeItem(){}};
['show','hud','dots','tabs','saveState','hdTitle','pane','sndBtn','bulk','bpv'].forEach(id=>{global[id]=doc.getElementById(id)});
const app=new Function(src+`;return {DB:()=>DB,blank,go,parseDate,parsePlayers,bulkPreview,bulkApply,
  standings,SCset,ageRank,sample};`)();
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

console.log('=== 1. 生年月日の解釈 ===');
[['1970/1/1','1970-01-01'],['1970-01-01','1970-01-01'],['1970.1.1','1970-01-01'],
 ['1970年1月1日','1970-01-01'],['S45.6.14','1970-06-14'],['昭和45年6月14日','1970-06-14'],
 ['H2.3.19','1990-03-19'],['平成2年3月19日','1990-03-19'],['R1.5.1','2019-05-01'],
 ['25569','1970-01-01'],['ただの文字',''],['','']]
 .forEach(([inp,exp])=>chk('「'+inp+'」→ '+(exp||'（無し）'), app.parseDate(inp)===exp, app.parseDate(inp)));

console.log('\n=== 2. 行の読み取り ===');
const lines=[
 ['タブ区切り', '山田　太郎\t営業部\t1970/1/1', {n:'山田　太郎',o:'営業部',b:'1970-01-01'}],
 ['カンマ区切り', '鈴木　一郎,技術部,S45.6.14', {n:'鈴木　一郎',o:'技術部',b:'1970-06-14'}],
 ['2つ以上のスペース', '佐々木　花子  1975-04-16', {n:'佐々木　花子',o:'',b:'1975-04-16'}],
 ['日付が先頭', '1964年5月5日\t木南　健\t総務', {n:'木南　健',o:'総務',b:'1964-05-05'}],
 ['日付なし', '田中　実\t品質保証', {n:'田中　実',o:'品質保証',b:''}],
 ['氏名だけ', '伊藤　修', {n:'伊藤　修',o:'',b:''}],
 ['Excelシリアル', '渡辺　浩\t購買\t29200', {n:'渡辺　浩',o:'購買',b:'1979-12-11'}],
 ['単一スペース＋日付', '中村　実 1971-12-12', {n:'中村　実',o:'',b:'1971-12-12'}],
 ['全角読点', '小林　徹、経理、1968年8月8日', {n:'小林　徹',o:'経理',b:'1968-08-08'}],
];
lines.forEach(([label,line,e])=>{
  const r=app.parsePlayers(line)[0];
  chk(label, r.name===e.n&&r.org===e.o&&r.bd===e.b, `氏名「${r.name}」所属「${r.org}」生年月日「${r.bd}」`);
});

console.log('\n=== 3. 取り込み（新規と更新）===');
const D=app.DB();
D.players=[{n:'山田　太郎',org:'',bd:'',g:0,f:0,vote:true}];
store['bulk'].value='山田　太郎\t営業部\t1970/1/1\n鈴木　一郎\t技術部\tS45.6.14\n佐々木　花子\t\t1975-04-16';
app.bulkPreview();
/* 段階4で、取り込みの確認は右の列に収まる1行ずつの並びにした（表は幅が足りない） */
chk('プレビュー3行', (store['bpv'].innerHTML.match(/<li><span class="bpv-k/g)||[]).length===3);
chk('1件は更新扱い', store['bpv'].innerHTML.includes('更新'));
A=[]; app.bulkApply();
chk('新規2名・更新1名', A[0]==='新規 2名、更新 1名を取り込みました。', A[0]);
chk('合計3名', app.DB().players.length===3);
const y=app.DB().players.find(p=>p.n==='山田　太郎');
chk('既存の人に所属と生年月日が入る', y.org==='営業部'&&y.bd==='1970-01-01', y.org+' / '+y.bd);
chk('新規の和暦も変換', app.DB().players.find(p=>p.n==='鈴木　一郎').bd==='1970-06-14');

console.log('\n=== 4. 更新で既存データを消さない ===');
store['bulk'].value='山田　太郎';
app.bulkPreview(); A=[]; app.bulkApply();
chk('空欄では上書きしない', y.org==='営業部'&&y.bd==='1970-01-01', y.org+' / '+y.bd);
chk('重複して増えない', app.DB().players.length===3);

console.log('\n=== 5. 同スコアの決着に効く ===');
app.sample(); global.flush();
const P=app.DB().players;
P.forEach((p,i)=>p.bd='');
P[0].bd='1955-01-01'; P[1].bd='1990-01-01';
app.SCset('entry','sheet');
const s0=app.DB().scores; 
[P[0],P[1]].forEach(p=>{app.DB().scores[p.n]={h:{},gross:90,hc:10};});
P.slice(2).forEach(p=>{app.DB().scores[p.n]={h:{},gross:120,hc:10};});
app.SCset('tiebreak','older');
let st=app.standings();
chk('年長者が上位', st.net[0].n===P[0].n, st.net.slice(0,2).map(r=>r.n+'('+r.p.bd+')').join(' / '));
app.SCset('tiebreak','younger');
st=app.standings();
chk('年少者を上位に切替', st.net[0].n===P[1].n, st.net.slice(0,2).map(r=>r.n).join(' / '));

console.log('\n=== 6. 手入力欄でも変換 ===');
app.go('players');
chk('生年月日欄はparseDateを通す', store['pane'].innerHTML.includes("parseDate(this.value)"));
console.log('\n合計 NG: '+ng);
