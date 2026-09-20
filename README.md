# CompeMaster Pro

ゴルフコンペの総合運営システム。参加者の登録から組み合わせ、スコア集計、
予想ゲームの精算、表彰式の演出までを1つで行います。

**`docs/pc.html` の1ファイルがアプリの全体です。** インストールも通信も不要で、
USBに入れて持ち運べます。ゴルフ場は電波が弱いことがあるためです。

- 公開ページ … https://takumihiramatsu.github.io/CompeMasterPro/
- 検証スイート … 26本・2274項目（`tests/`）

---

## 別の環境で作業を再開するとき

**Claudeとの新しいチャットで続きをする場合**、次の1文を最初に送ってください。
ナレッジに何も入っていなくても、必要なものはすべてこのリポジトリから取れます。

> CompeMaster Pro（ゴルフコンペ総合運営システム）の開発の続きです。
> まず https://github.com/Takumihiramatsu/CompeMasterPro から
> `README.md` `HANDOVER.md` `CONTRIBUTING.md` を読んでください。
> アプリ本体は `docs/pc.html`、検証スイートは `tests/` にあります。
> そのうえで、◯◯をしたいです。

Claudeは `raw.githubusercontent.com` から直接読めます。

```
https://raw.githubusercontent.com/Takumihiramatsu/CompeMasterPro/main/HANDOVER.md
https://raw.githubusercontent.com/Takumihiramatsu/CompeMasterPro/main/CONTRIBUTING.md
https://raw.githubusercontent.com/Takumihiramatsu/CompeMasterPro/main/docs/pc.html
```

**`pc.html` は約250KBあります。**まるごと読ませると重いので、
「どのタブの話か」を先に伝えると作業が速くなります。

---

## どれを読めばよいか

| 文書 | 誰のためのものか |
|---|---|
| **[HANDOVER.md](HANDOVER.md)** | **作業を再開する人。まずこれ。** 何がどこにあり、なぜそうなっているか、次に何をすべきか |
| [CONTRIBUTING.md](CONTRIBUTING.md) | コードを変更する人。手順・変えてはいけない決めごと・過去の落とし穴 |
| [docs/README.md](docs/README.md) | アプリを配る人・使う人。置き場所と配布のしかた |

---

## すぐ動かす

```bash
git clone https://github.com/Takumihiramatsu/CompeMasterPro.git
cd CompeMasterPro/tests
for f in *.js; do echo "== $f"; node "$f"; done
```

`NG` が0で、`OK` の合計が2179であれば準備完了です。
アプリを触るときは `docs/pc.html` をブラウザで直接開いてください。サーバーは要りません。

---

## 個人情報について

このリポジトリに実在の氏名・生年月日、**大会と結び付いた会場名**は含まれていません。
（内蔵のゴルフ場マスタとテストの検索例には実在のゴルフ場名がありますが、大会とは無関係です）
検証スイートと記録の氏名は**架空のものに置き換えてあります**。
数字（スコア・HDCP・ネット・配当・罰金）は実物のままなので、
`tests/haiya.js` の再現テストとしての価値は変わりません。

**変更を公開する前に、必ず次を通してください。**

```bash
cd tests && node privacy.js
```

2026-09-04に、入力例へ実在の氏名4名と生年月日1件が入ったまま公開してしまった
ことがあります。このテストは同じ形の事故を防ぐためのものです。

---

社内利用のためのものです。外部への配布は想定していません。
