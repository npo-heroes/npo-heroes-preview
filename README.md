# NPO HEROES 確認用サイト

FigmaのPC・スマートフォン版をもとに、スポンサーを含む関係者がレイアウト・ロゴサイズ・画面遷移を確認するための8ページの静的モックです。

[公開サイト](https://npo-heroes.github.io/npo-heroes-preview/) / [スポンサー欄](https://npo-heroes.github.io/npo-heroes-preview/#supporters) / [設計・意思決定](docs/README.md)

## 開発

Node.js 24とnpmを使用します。

```sh
npm ci
npm run dev
```

表示先は `http://127.0.0.1:5173/npo-heroes-preview/` です。本文・テンプレート変更後は開発サーバーを再起動するか、別のターミナルで `node scripts/generate.mjs` を実行してください。CSSとTypeScriptは自動更新されます。

```sh
npm run format
npm run check
npm run preview
```

`check` は型チェック、ユニットテスト、全ページのビルド、整形確認を実行します。プレビューはビルド済みの `dist/` を `http://127.0.0.1:4173/npo-heroes-preview/` で確認できます。

## 構成

- `src/templates/site.mjs`: 各ページ・共通ヘッダー・フッターを生成するテンプレート
- `src/data/content.json`: Figmaから取得した文章と画像の対応
- `src/data/routes.mjs`: URLとページ名
- `src/styles/site.css`: PC/SPのレイアウトと中間幅への対応
- `src/main.ts`、`src/search.ts`: メニュー、確認用案内、ニュース絞り込み
- `public/`: 画像、SVG、必要な文字に絞ったフォントとライセンス
- `scripts/generate.mjs`: 各パスの `index.html` を生成
- `tests/`: 内部リンク、画像、スポンサーリンク、確認用機能のテスト
- `docs/`: 設計・意思決定・公開・検証記録。配信対象には含めません。

各 `index.html` は生成物です。直接編集せず、テンプレートやデータを修正して生成してください。`main` へのpushでGitHub Actionsが検証し、`dist/` だけをGitHub Pagesへ公開します。

## 確認対象

PCの基準幅は1440px、スマートフォンは375pxです。画面全体を縮小せず、文章を折り返して表示します。ニュースはFigmaの固定内容で、詳細は提供された1記事のみです。実際の寄付、決済、SNS登録、動画再生、会計報告の取得は行わず、確認用の案内を表示します。お問い合わせはメールアドレスのリンクです。

大樹生命を含む5社のロゴは実際の公式サイトを別タブで開きます。

| スポンサー     | PCの画像枠 | SPの画像枠 |
| -------------- | ---------- | ---------- |
| 大樹生命       | 275 × 90px | 135 × 44px |
| SMBC           | 250 × 90px | 105 × 38px |
| 三菱地所       | 303 × 90px | 148 × 44px |
| 大和ハウス     | 433 × 90px | 212 × 44px |
| ヒガシグループ | 299 × 90px | 146 × 44px |

このリポジトリとサイトは公開されています。全ページに `noindex,nofollow` を付けていますが、閲覧制限はありません。本番WordPressから独立しており、本番のファイルやDBは変更しません。
