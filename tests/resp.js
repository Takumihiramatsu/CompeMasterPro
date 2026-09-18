/* アプリの場所。テストと同じ場所の site/ を先に見て、無ければ ../docs/ を使う。
   リポジトリでは tests/ と docs/ が並ぶ構成なので、どちらでも動く */
const _P=require('path'),_F=require('fs');
const _DIR=[_P.join(__dirname,'site'),_P.join(__dirname,'..','docs')]
  .find(d=>_F.existsSync(_P.join(d,'pc.html')))||_P.join(__dirname,'site');
const APP={dir:_DIR+'/', get pc(){return this.dir+'pc.html'}, get scan(){return this.dir+'index.html'}};
const fs=require('fs');
const h=fs.readFileSync(APP.pc,'utf8');
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};
const css=h.slice(h.indexOf('<style>'),h.indexOf('</style>'));

console.log('=== 1. viewport とメタ ===');
chk('viewportメタがある', h.includes('name="viewport"')&&h.includes('width=device-width'));
chk('文字サイズの自動調整を止めている', css.includes('-webkit-text-size-adjust'));

console.log('\n=== 2. 断点 ===');
[['1100px（タブレット）',/@media\(max-width:1100px\)/],
 ['760px（スマホ横〜縦）',/@media\(max-width:760px\)/],
 ['520px（小さめのスマホ）',/@media\(max-width:520px\)/],
 ['880px（2段組の解除）',/@media\(max-width:880px\)/]].forEach(([l,re])=>chk(l,re.test(css)));

console.log('\n=== 3. スマホでの主な調整 ===');
const m=css.slice(css.indexOf('@media(max-width:760px)'));
chk('表を横スクロールにする', m.includes('.card table{display:block;overflow-x:auto'));
chk('入力欄を16pxにしてiOSの自動ズームを防ぐ', m.includes('input,select,textarea{font-size:16px}'));
chk('入力欄の最小幅を解除', m.includes('.f input,.f select{min-width:0;width:100%}'));
chk('textareaも画面幅に合わせる', m.includes('.f textarea{min-width:0!important;width:100%}'));
chk('2段組を1段に', m.includes('.grid2{grid-template-columns:1fr'));
chk('組カードを1列に', m.includes('.gcards{grid-template-columns:1fr}'));
chk('削除・並べ替えボタンを大きく', m.includes('.del,.mv{padding:7px 9px;font-size:16px'));
chk('チェックボックスを拡大', m.includes('input[type=checkbox]{transform:scale(1.3)}'));
chk('タブを横スクロールの1行に', m.includes('.tabs{padding:8px 10px 0;flex-wrap:nowrap}'));
chk('発表の枠一覧を2列に', /\.frames\{grid-template-columns:repeat\(2,1fr\)!important/.test(m));

console.log('\n=== 4. タッチ操作の代替 ===');
/* 段階4（2026-09-17）で、組ごとの選択欄を「押して行き先の組を選ぶ」と「長押しで運ぶ」に置き換えた */
chk('組み合わせで名前を押すと組を選べる', h.includes('onclick="gPickI(${i})" title="押すと行き先の組を選べます"')&&h.includes('onclick="gMoveI(${GPICK},${g.no})"'));
chk('長押しで運べる', h.includes('ontouchstart="lpStart(event,${i})"')&&h.includes('document.addEventListener("touchmove",lpMove,{passive:false})'));
chk('gMove関数がある', h.includes('function gMove(n,no){'));
chk('並べ替えの▲▼が残っている', h.includes('pMove(${i},-1)'));
chk('発表を横スワイプでめくれる', h.includes('touchend')&&h.includes("dx<0?advance():step(-1)"));
chk('HUDに全画面ボタン', h.includes('fullToggle()'));
chk('HUDに戻るボタン', h.includes('onclick="step(-1)"'));
chk('説明文にスマホの案内', h.includes('スマホ・タブレットでは名前を押して行き先の組を選ぶか、長押しして運べます'));

console.log('\n=== 5. ノッチ・ホームバー対応 ===');
chk('作業画面の下余白', css.includes('padding-bottom:calc(90px + env(safe-area-inset-bottom))'));
chk('HUDの下余白', css.includes('padding-bottom:calc(14px + env(safe-area-inset-bottom))'));

console.log('\n=== 6. 崩れやすい固定幅が残っていないか ===');
const wide=[...h.matchAll(/min-width:(\d{3,})px/g)].map(x=>+x[1]).filter(v=>v>320);
chk('320pxを超える固定最小幅はスマホで解除される', m.includes('min-width:0'), '検出値: '+[...new Set(wide)].join(','));
const tw=[...h.matchAll(/style="min-width:(\d+)px/g)].map(x=>+x[1]);
chk('インラインの最小幅も上書き対象', tw.every(v=>v<=340), '最大 '+Math.max(0,...tw)+'px');
console.log('\n=== 表の列が潰れないこと ===');
/* 2026-09-04、iPhoneで参加者タブの氏名欄が1文字ぶんまで潰れ、
   ニアピンタブの受賞者が「佐々木」→「佐々オ」に切れた。
   原因は、氏名の列にだけ幅の指定が無く、他の列がすべて固定幅だったこと。
   表は横スクロールできるので、文字が入る列には下限幅を与えてよい。 */
const HTML=require('fs').readFileSync(APP.pc,'utf8');
const heads=[...HTML.matchAll(/<th([^>]*)>([^<]{1,10})<\/th>/g)]
  .map(m=>({attr:m[1],label:m[2].trim()}));
/* 文字が入る列。数字や記号だけの列は狭くてよい。
   2026-09-08、`width:` は表が幅100%に押し込まれると縮むことが分かった。
   「賞の名前」「決め方」が1文字まで潰れ、氏名の選択肢も切れていた。
   縮まないのは `min-width:` のほうなので、文字の列はこちらで指定する。 */
const TEXTCOL=['氏名','受賞者','投票者','指名','所属','所属・部署','生年月日','買い目','元の行',
  '理由','賞の名前','決め方','記録（任意）','手動指定','賞','場所','種別','買い目・指名','枠','組'];
const noWidth=heads.filter(h=>TEXTCOL.includes(h.label)&&!/width/.test(h.attr));
chk('文字の列に幅の指定がある', noWidth.length===0,
    noWidth.map(h=>h.label).join('、')||'すべて指定あり');
/* ここが要点。width だけの指定は縮むので不可 */
const shrinky=heads.filter(h=>TEXTCOL.includes(h.label)&&/width:/.test(h.attr)&&!/min-width:/.test(h.attr));
chk('文字の列が縮まない指定（min-width）になっている', shrinky.length===0,
    [...new Set(shrinky.map(h=>h.label))].join('、')||'すべて min-width');
/* 氏名を選ぶ欄は、矢印のぶんも要る。「佐々木　花子」で6文字＋矢印＋余白 */
const nameSel=heads.filter(h=>['氏名','受賞者','投票者','手動指定'].includes(h.label));
const narrow=nameSel.filter(h=>{
  const m=h.attr.match(/min-width:([0-9.]+)em/);
  return !m||parseFloat(m[1])<10;
});
chk('氏名を選ぶ欄が10em以上ある', narrow.length===0,
    narrow.map(h=>h.label+'('+(h.attr.match(/min-width:[^;"]*/)||['指定なし'])[0]+')').join('、')||'');
['氏名','受賞者','投票者'].forEach(k=>{
  const hs=heads.filter(h=>h.label===k);
  chk(k+'の列すべてに下限幅（'+hs.length+'箇所）',
      hs.length>0&&hs.every(h=>/min-width/.test(h.attr)),
      hs.filter(h=>!/min-width/.test(h.attr)).length+'箇所が未指定');
});
const mq2=HTML.slice(HTML.indexOf('@media(max-width:760px)'));
chk('表の中の入力欄が列いっぱいに広がる',
    /td>input:not\(\[type\]\),td>select:not\(\.fsel\)\{width:100%/.test(mq2.replace(/\n\s*/g,'')));
chk('数字用の狭い入力欄は例外にしてある', /td>input\.q\{width:56px\}/.test(mq2.replace(/\n\s*/g,'')));
chk('表は横スクロールできる（下限幅を与えても切れない）',
    /\.card table\{display:block;overflow-x:auto/.test(mq2.replace(/\n\s*/g,'')));

console.log('\n=== 列数の多い表がカードからはみ出さない ===');
/* 18ホール分のスコア入力は列が多く、幅の狭い画面だけでなく
   .wrap の最大幅（1200px）より表が広いときにもカードの外へはみ出す。
   横スクロールを対象の表にだけ常時かけてある（別の作業で加わった修正を
   2026-09-08に取り込んだ） */
chk('hscroll の指定がある', /\.card table\.hscroll\{[^}]*overflow-x:auto/.test(HTML.replace(/\n\s*/g,'')));
chk('横スクロールが常時（画面幅の条件に入っていない）',
    HTML.indexOf('.card table.hscroll')<HTML.indexOf('@media(max-width:760px)'),
    '土台のCSSにある');
/* 段階5で表の最初に「組」の列を足した */
chk('スコア入力表に付いている', /<table class="hscroll s-tab\$\{[^}]*\}"><thead><tr><th[^>]*>組<\/th><th[^>]*>氏名/.test(HTML));
chk('指でなぞれる指定がある', /-webkit-overflow-scrolling:touch/.test(HTML));
chk('使い方にも案内がある', /表が画面からはみ出す/.test(HTML));

console.log('\n=== 選択欄が切れないこと ===');
/* 2026-09-08、「参加のしかた」の選択が「プレー＋」で切れていた。
   列幅を 9em にしていたが、`td select` は width:100% で、
   右に矢印ぶんの padding-right:26px が入る。
   全角6文字なら 6em + 矢印26px + 余白26px ＝ 約9.5em 必要で、9emでは足りない。
   選択肢の長さから必要幅を出し、列幅がそれ以上かを確かめる。 */
const EMPX=15;                      /* 1em を15pxとみて見積もる */
const needEm=chars=>Math.round((chars+(26+26)/EMPX)*10)/10;
/* [見出し, いちばん長い選択肢] 。選択肢を増やしたらここも足す */
const SELCOL=[
  ['参加のしかた','プレー＋予想'],['枠','出走なし'],['組','未定'],
  ['決め方','グロス下位'],['受賞者','佐々木　花子'],['手動指定','佐々木　花子'],
  ['数え方','総額を頭割り']];
SELCOL.forEach(([lab,longest])=>{
  const th=heads.find(x=>x.label===lab);
  if(!th){ chk(lab+'の列がある', false, '見つからない'); return; }
  const m=th.attr.match(/min-width:([0-9.]+)em/);
  const cur=m?parseFloat(m[1]):0;
  const need=needEm(longest.length);
  chk(`${lab}が「${longest}」を切らずに出せる`, cur>=need,
      `${cur}em / 必要 ${need}em`);
});
chk('選択欄には矢印ぶんの余白がある', /td select\{[^}]*padding-right:26px/.test(HTML.replace(/\n\s*/g,'')));
chk('選択欄は列いっぱいに広がる', /td input,td select\{[^}]*width:100%/.test(HTML.replace(/\n\s*/g,'')));

console.log('\n=== 同じ内容を二度出さない ===');
/* 2026-09-08、賞金・収支に「実費の表」と「内訳の一律」が同じ内容で並んでいた。
   入力する画面と、結果を見る画面で役割を分ける。
     大会設定 … 実費を入力する表。内訳の一律は小計だけ（すぐ上に明細があるため）
     賞金・収支 … 内訳だけ。入力表は出さない */
{
  const src2=HTML;
  chk('collectCard の呼び出しは大会設定と収支の2箇所だけ',
      (src2.match(/collectCard\(/g)||[]).length===3,   /* 定義1 + 呼び出し2 */
      (src2.match(/collectCard\(/g)||[]).length+'箇所');
  chk('実費の入力表は編集のときだけ出す',
      /\$\{edit\?`<table[^`]*実費（預かり）/.test(src2.replace(/\n\s*/g,'')));
  chk('編集中は一律の明細を畳む', /上の表で決めた実費/.test(src2));
}

console.log('\n合計 NG: '+ng);
