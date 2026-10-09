# 更新・公開・復旧

## 更新元

画面の正本は[意思決定記録](decisions/0001-confirmation-prototype.md)にあるFigmaです。2026-10-09に取得したFigmaローカルコピーから、フレームの寸法、文章、写真、ベクター素材、PC/SP別の写真位置を読み取りました。大きなFigma原本、編集履歴、関係ないフレームはリポジトリへ追加していません。

更新は `content.json`、`site.mjs`、`site.css` に反映します。PC/SPで文章の改行が異なる箇所は、それぞれの指定を保持します。フォントはNoto Sans CJK JPとSuraを同梱しています。新しい文字を追加する際はNotoのサブセットも更新してください。ライセンスは `public/fonts/` にあります。

## 公開

1. `npm ci`、`npm run format`、`npm run check` を実行する。
2. `npm run preview` で全8パスへ直接アクセスし、PC/SP、メニュー、検索、問い合わせ、スポンサーリンクを確認する。
3. `main` へcommit/pushする。
4. `.github/workflows/deploy.yml` のbuildとdeployが成功したことを確認する。
5. 通常の公開URLを再読み込みし、各パスのHTTP 200と画像・CSS・JSの読み込みを確認する。

リポジトリのPages SourceはGitHub Actionsです。ベースパスは `/npo-heroes-preview/` です。各ルートにHTMLを出力するため、詳細URLからの直接アクセスや再読み込みにも対応します。`docs/`、テスト、元データはビルド成果物へ含めません。

## 復旧

通常は問題のcommitをrevertし、同じワークフローで再公開します。以前の公開内容は `gh-pages` ブランチの `1a0f6fa29beae9b2d3de5dd83ebe483180f20680` に残しています。旧単一HTMLへ戻す場合は、PagesのSourceをDeploy from a branchへ変更し、`gh-pages` / rootを選びます。切り替え後は通常URLと大樹生命リンクを再確認してください。

## 確認用の動作

- モバイルメニュー: 開閉、Escape、ページ移動、PC幅へ戻したときの閉鎖。
- ニュース: カテゴリ・年月・キーワードのAND検索。同じカテゴリの再選択で解除。空欄で全件に戻る。
- 記事: トップの本編ダイジェストだけ内部詳細へ。他の記事・前後の記事は案内。
- 寄付・SNS・動画・資料取得: 確認用ダイアログ。Escapeまたは閉じるボタンで戻る。
- メール: `mailto:contact@npo-heroes.com`。
- スポンサー: 各公式サイトへ `noopener noreferrer` 付きの別タブリンク。

ニュースの「日付」などFigmaの仮置き文言も保持しています。内容の校正・本番CMS連携は今回の対象に含めません。

## 参考

- [GitHub Pagesのカスタムワークフロー](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [ViteのGitHub Pages配信](https://vite.dev/guide/static-deploy.html#github-pages)
