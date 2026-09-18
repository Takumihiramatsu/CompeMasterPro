/* デザイン仕上げの検証 */
/* アプリの場所。テストと同じ場所の site/ を先に見て、無ければ ../docs/ を使う。
   リポジトリでは tests/ と docs/ が並ぶ構成なので、どちらでも動く */
const _P=require('path'),_F=require('fs');
const _DIR=[_P.join(__dirname,'site'),_P.join(__dirname,'..','docs')]
  .find(d=>_F.existsSync(_P.join(d,'pc.html')))||_P.join(__dirname,'site');
const APP={dir:_DIR+'/', get pc(){return this.dir+'pc.html'}, get scan(){return this.dir+'index.html'}};
const fs=require('fs');
const R=f=>fs.readFileSync(APP.dir+f,'utf8');
const ok=(l,c,x='')=>console.log((c?'  OK  ':'  NG  ')+l+(x?'  '+x:''));
let ng=0;const chk=(l,c,x)=>{if(!c)ng++;ok(l,c,x)};

console.log('=== 1. オフラインで完結するか ===');
['index.html','pc.html'].forEach(f=>{
  const h=R(f);
  chk(f+': 外部の読み込みなし', !/(?:href|src)="https?:\/\//.test(h),
      (h.match(/(?:href|src)="https?:\/\/[^"]+/)||[''])[0]);
  chk(f+': Cinzelを使っていない', !h.includes('Cinzel'));
});
chk('pc.html: 端末にある明朝を指定', R('pc.html').includes('--display:"Hiragino Mincho ProN"'));
/* 2026-09-17、v51の初版で操作パネルの中身を「文書まるごとの文字列」としてスクリプトに書いた。
   pc.html は html・head・body の札を省いた書き方なので、ファイルでただ1つの body の札がスクリプトの中にあり、
   Claude のプレビューがそこを本文の始まりと取り違えて、以降のスクリプトを文字として表示した。
   ブラウザでは動くが、道具によって壊れて見える。骨組みの札はファイルのどこにも書かない */
{
  const t=R('pc.html');
  const found=['<!doctype','<html','</html','<head','</head','<body','</body'].filter(k=>t.toLowerCase().includes(k));
  chk('pc.html: 文書の骨組みの札（doctype・html・head・body）をどこにも書かない', found.length===0, found.join(' ')||'なし');
}

console.log('\n=== 2. ブランドの一貫性 ===');
const pm=JSON.parse(R('pc.webmanifest'));
{
  const th=(R('pc.html').match(/name="theme-color" content="(#[0-9A-Fa-f]{6})"/)||[])[1];
  chk('pc.html: HTMLとマニフェストの色が一致', th===pm.theme_color, th+' / '+pm.theme_color);
  chk('pc.html: 背景色もそろう', pm.background_color===th);
  const ith=(R('index.html').match(/name="theme-color" content="(#[0-9A-Fa-f]{6})"/)||[])[1];
  chk('転送ページも同じ色', ith===pm.theme_color, ith);
}
chk('ワードマークと同じ書体を見出しにも', R('pc.html').includes('.kicker,.act-num,.rank-badge{font-family:var(--display)}'));

console.log('\n=== 3. 表の読みやすさ ===');
const css=R('pc.html');
chk('列の罫を細く、行の罫を保つ', css.includes('border-color:var(--rule-soft);border-bottom-color:var(--rule)'));
chk('見出しの下を太く（スコアカードの区切り）', css.includes('border-bottom:1.5px solid var(--rule-hard)'));
chk('合計欄の上を太く', css.includes('.stat-row{border-top:2px solid var(--rule-hard)'));
chk('数字は等幅で揃える', css.includes('td.n,th.n{font-variant-numeric:tabular-nums}'));
chk('行にカーソルを合わせるとわかる', css.includes('tbody tr:hover td'));

console.log('\n=== 4. 空の表は次の行動を示す ===');
chk('直書きの灰色指定を撤去', !/colspan="\d+" class="c" style="color:var\(--ink-dim\)/.test(css));
chk('空欄の共通スタイルがある', css.includes('tbody td[colspan]'));
/* 段階4で、参加者の貼り付けは PC では右の列に置いた */
const guides=['「貼り付けて取り込む」（PCでは右、スマホでは下）','「追加」を押してください','ここに得票数が並びます',
  'ネットの順位がここに並びます','「参加者」タブで組を割り当て','集金の一覧がここに出ます'];
guides.forEach(g=>chk('案内: '+g.slice(0,14), css.includes(g)));
chk('「まだ入力がありません」を残していない', !css.includes('まだ入力がありません'));

console.log('\n=== 5. 操作部品 ===');
chk('入力欄とボタンの高さをそろえる', css.includes('.f input,.f select,.btn{min-height:var(--ctl)}'));
chk('選択欄に矢印を描く', css.includes('appearance:none')&&css.includes('background-position:calc(100% - 14px)'));
chk('枠色の選択欄は矢印を出さない', css.includes('.f select.fsel,td select.fsel{background-image:none'));
chk('押した手ごたえ', css.includes('.btn:active{transform:translateY(1px)}'));
chk('知らせの種類を左帯で示す', css.includes('.msg{border-left-width:3px')&&css.includes('.msg.ng{border-left-color:#C25555}'));
chk('キーボードで追える', css.includes(':focus-visible{outline:2px solid var(--brass)'));

console.log('\n=== 6. 面の階層 ===');
chk('内枠は表のあるカードだけ', css.includes('.card::before{display:none}')&&css.includes('.card:has(table)::before'));
chk('タブが紙面とつながる', css.includes('.tab.on{box-shadow:inset 0 2px 0 var(--brass);border-bottom:1px solid var(--panel)'));

console.log('\n=== 7. スマホ ===');
const mq=css.slice(css.lastIndexOf('@media(max-width:760px)'));
chk('タップ目標を大きく', mq.includes('--ctl:42px'));
chk('装飾の内枠は外す', mq.includes('.card:has(table)::before{display:none}'));
chk('英字の副題は隠す', mq.includes('.brand-sub{display:none}'));
chk('転送ページは軽い（1画面で pc.html に移るだけ）',
    R('index.html').length<2500, R('index.html').length+'文字');

console.log('\n=== 8. 印刷 ===');
chk('装飾の内枠を消す', css.includes('.card::before{display:none!important}'));
chk('見出しを紙に合わせる', css.includes('th{background:#eee!important'));
console.log('\n合計 NG: '+ng);
