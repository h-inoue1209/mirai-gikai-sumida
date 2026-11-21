# みらい議会@墨田区 Vercel で本番公開する手順

作成日: 2026-10-23（リポジトリ h-inoue1209/mirai-gikai-sumida の sumida/main 60dcc1d 時点）

本番の Supabase は準備済み（`資料/みらい議会墨田区_本番Supabase手順.md`）。ここでは公開サーバー（Vercel）を用意する。
**キーやパスワードはチャットに貼らない。**

## 方針

- 公開するのは **web（閲覧サイト）だけ**。管理画面（admin）は使わない（議案は seed で入れる）
- **最初は Basic 認証（IDとパスワード）をかけた状態で公開する。** 最後の公開前チェックが終わったら外して一般公開する
- ドメインは後で決める。それまでは Vercel の仮URL（`https://〜.vercel.app`）

## 全体の流れ

| # | 作業 | 誰が |
|---|---|---|
| 1 | リポジトリ側の準備（自動公開を止めている設定を直す） | Claude（push は了解を得てから） |
| 2 | Vercel のアカウント・プランを決める | 本人 |
| 3 | Vercel でプロジェクトを作る（GitHub のフォークを読み込む） | 本人 |
| 4 | 環境変数を入れる | 本人 or Claude（下の選択） |
| 5 | 公開（デプロイ）して表示を確かめる | Claude |
| 6 | Supabase に本番URLを登録する | 本人 |
| 7 | AIインタビューが動くか確かめる | Claude |

---

## 1. リポジトリ側の準備（Claude）

`web/vercel.json` は本家の運用向けで、このままだと **墨田区版の `sumida/main` に push しても Vercel が公開を飛ばす**。

- 本家は main・develop を別の仕組み（GitHub Actions の Deploy Hook）で公開し、それ以外のブランチは「開いている PR があるときだけ」作る設定になっている
- 墨田区版は `sumida/main` なので「PR が無い」と判断されて飛ばされる

直し方：`web/vercel.json` から本家向けの2項目（`git.deploymentEnabled` と `ignoreCommand`）を外し、push で普通に公開されるようにする。コミットして push（**push の前に確認**）。
→ **2026-10-23 済み**（2981cf6 を push。push で GitHub Actions は動かなかった）

あわせて、フォークの **GitHub Actions を止める**のがおすすめ（本家の自動チェック・デプロイ用で、墨田区版では鍵が無く動かないため。止めるのは GitHub の Settings → Actions → 「Disable actions」）。

## 2. アカウントとプラン（本人）

- https://vercel.com で GitHub アカウント（h-inoue1209）でサインアップ／ログイン
- **プランは要確認**：無料の Hobby は「個人・非商用」向けの利用条件がある。政治活動のサイトが当てはまるかは、Vercel の利用規約（Fair Use Guidelines）で確かめる。迷う場合は有料の Pro
- AI Gateway（AIインタビューの送信先）の利用料は別にかかる。上限は環境変数で決める（手順4）

## 3. プロジェクトを作る（本人）

1. Vercel のダッシュボード →「Add New…」→「Project」
2. GitHub の `h-inoue1209/mirai-gikai-sumida` を「Import」（初回は GitHub 連携の許可を求められる。このリポジトリだけ許可でよい）
3. 設定画面で：

| 項目 | 値 |
|---|---|
| Project Name | `mirai-gikai-sumida` など（仮URLの名前になる） |
| Framework Preset | Next.js（自動で選ばれる） |
| **Root Directory** | **`web`**（「Edit」で選ぶ。ここが一番大事） |
| Build / Install Command | 変えない（pnpm のモノレポを自動で扱う） |

4. まだ「Deploy」は押さない（先に手順4の環境変数を入れる）。押してしまった場合は失敗するだけなので問題ない

## 4. 環境変数（Settings → Environment Variables。Production に入れる）

| 名前 | 値 | 必須 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.production` と同じ | 必須 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.production` と同じ | 必須 |
| `SUPABASE_URL` | `.env.production` と同じ | 必須 |
| `SUPABASE_SECRET_KEY` | `.env.production` と同じ（**Sensitive にする**） | 必須 |
| `REVALIDATE_SECRET` | ランダムな長い文字列（新しく作る） | 必須 |
| `NEXT_PUBLIC_WEB_URL` | 仮URL（例 `https://mirai-gikai-sumida.vercel.app`）。ドメインが決まったら差し替え | 必須 |
| `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` | 公開前の閲覧用ID・パスワード（一般公開のときに消す） | 当面 |
| `CHAT_DAILY_USER_COST_LIMIT_USD` | 1人あたり1日のAI利用額の上限（既定 0.5ドル） | 任意 |
| `CHAT_DAILY_TOTAL_COST_LIMIT_USD` | サイト全体の1日の上限（既定 50ドル） | **要検討** |
| `CHAT_MONTHLY_TOTAL_COST_LIMIT_USD` | サイト全体の1か月の上限（既定 1,000ドル） | **要検討** |
| `NEXT_PUBLIC_GA_TRACKING_ID` | Googleアナリティクスの測定ID（`G-` で始まる） | 一般公開まで |

入れないもの：
- `LANGFUSE_*`（規約で「使わない」としている）
- `ARTICLE_REPORT_SLACK_WEBHOOK_URL`（誤りの報告は LINE 公式で受ける）
- `ADMIN_URL`（admin を使わない）
- `AI_GATEWAY_API_KEY`：Vercel 上で動かすときは、Vercel が自動で発行する認証（OIDC）で AI Gateway につながる仕組みがあるため、まず入れずに試す（**要確認**：手順7で動かなければ AI Gateway の画面でキーを作って入れる）

**入れ方は2通り**（どちらかを選ぶ）：
- **本人が画面で入れる**：上の表を見ながら、値は `.env.production` からコピー
- **Claude が入れる**：Vercel CLI を入れ、本人が `vercel login` でログイン → Claude が `.env.production` から読み込んで登録（値は画面にもチャットにも出さない）。Basic 認証のパスワードと費用の上限だけ本人が決める

### 進み具合（2026-10-23）

- 画面の Import は「Deploy」を押すまでプロジェクトができないため、Claude が API でプロジェクトを作成（チーム hiroki20・Hobby、名前 `mirai-gikai-sumida`、Root Directory `web`、本番ブランチ `sumida/main`、URL `https://mirai-gikai-sumida.vercel.app`）
- 環境変数11個を Production に登録済み（Supabase 4・REVALIDATE_SECRET・Basic 認証2・NEXT_PUBLIC_WEB_URL・AI 上限3）
- AI の上限は「1人1日0.5ドル・全体1日5ドル・1か月50ドル」（本人指示「取り急ぎ利用額最小で」）
- Basic 認証の ID・パスワードと REVALIDATE_SECRET は `sumida-gikai/.env.production` の末尾に控えた（Git 対象外）。**このため `sumida-gikai-web-prod` で手元を起動すると、手元でも Basic 認証がかかる**
- GA の測定ID・AI Gateway のキーは未登録

## 5. デプロイと確認（Claude）

- 「Deploy」（または `sumida/main` への push）で公開。ビルドのログにエラーが無いか確認
- 仮URLで、Basic 認証が出ること、トップ・議案・行政計画・会議予定・規約のページが出ることを確認

→ **2026-10-23 済み**：sumida/main（2981cf6）を API から本番デプロイ（ビルド約3分・成功）。警告は使っていない計測ライブラリ（OpenTelemetry）の10件のみ。仮URLで主な12ページ・画像が 200
- Basic 認証は**ブラウザのページ表示（Accept: text/html）にだけ**かかる作り（本家どおり）。ID・パスワードなし→401、ありで→200 を確認
- そのため、オープンデータの API（`/api/open-data/…`）や画像は認証なしで取得できる。載せているのは会議録など公開資料の整理なので、公開前でも大きな問題はないが、気になるなら一般公開まで API を止める

## 6. Supabase に本番URLを登録（本人）

本番 Supabase の Authentication → URL Configuration：
- **Site URL**：仮URL（ドメイン決定後に差し替え）
- **Redirect URLs**：同じURLを追加

→ **2026-10-23 済み**（Site URL・Redirect URLs に仮URL）

## 7. AIインタビューの確認（Claude）

### 2026-10-23 の試験結果
- 同意画面→チャット画面までは動く。最初の質問が出ない
- Vercel のログ：`AI Gateway requires a valid credit card on file`（403）。**Vercel の自動認証（OIDC）では AI Gateway まで届いている**ので、キーは不要。**本人が Vercel の AI Gateway 画面でクレジットカードを登録すれば動く見込み**（登録で無料枠が使えるようになる旨の表示）
- 失敗しても画面には何も出ず、「開始します」のまま止まる（利用者に分かりにくい。本家の作り）
- 試験で本番 DB にインタビューの記録（セッション）が1件できている。一般公開前に消す（2026-11-01 の新ドメインでの試験で、もう1件増えた）
- カード登録後は「Free tier users do not have access to this model」（403）。無料枠では Claude 全般・Gemini 全般・gpt-5.4-mini-fast・gpt-5.6 が使えず、gpt-4o/4.1 系・gpt-5/5-mini/5-nano・gpt-5.2・gemma-4 は使える（全27モデルを1回ずつ呼んで確認）
- 本人指示で AIインタビュー・AIチャットとも `openai/gpt-4.1-mini` に変更（f4771c1。インタビューは本番・試作用 DB の設定行も更新）。**インタビュー設定は Vercel 側で10分キャッシュされ、デプロイをまたいで残る**ので、DB を直したら `/api/revalidate`（REVALIDATE_SECRET）でキャッシュを消す
- 変更後：AIインタビューは質問を返し、利用額も記録された（1往復 約0.0027ドル）。AIチャットも回答が出た
- 同意画面などに本家の文言が残っている（「回答データは**党内**での政策検討に利用します」「のちに**みらい議会**に全文が掲載」など、`interview-consent-modal.tsx`・`interview-disclosure-page.tsx`・`make-public-modal.tsx` ほか）。運営は個人なので直す必要がある

- 自転車計画のページで AIインタビューを1回だけ試し、回答が返ること・費用が記録されることを確認
- 確認で作ったインタビューの記録は、公開前に消す

---

## このあと

- ドメインは **https://mirai-gikai-sumida.gorisan.info**（2026-11-01。本人がエックスサーバードメインで gorisan.info を取得。ネームサーバーを XServer Domain（ns1〜3.xdomain.ne.jp）にし、DNSレコード設定で CNAME `mirai-gikai-sumida` → `2a0939973489cf51.vercel-dns-017.com`。約10分で反映）。Vercel にドメインを追加、`NEXT_PUBLIC_WEB_URL` を差し替えて再デプロイ済み。仮URL（vercel.app）も引き続き使える。gorisan.tech はロリポップDNSで外部に向けられないため使わない
- Googleアナリティクス：2026-11-01 済み。既存アカウント（a205496663）に新しいプロパティ「みらい議会@墨田区」（日本時間・日本円）とウェブストリームを作成、測定ID `G-B7M0QFNYRD`（数字のゼロ）を Vercel の `NEXT_PUBLIC_GA_TRACKING_ID` に登録して再デプロイ。ページに計測タグが入ることを確認。Chrome からの送信は 503 が返った（Mac から直接送ると 204）。リアルタイムに表示されるかは本人が GA で確認
- 公開前チェック（最後）→ Basic 認証を外して一般公開

## 公開前チェック（途中・2026-10-23 中断）

- 本家の文言の洗い出しを開始。web/src の画面の文字列を「党・チームみらい・国会・法案・有識者・みらい議会（@なし）」などで検索した結果（dev ページ除く80行）を `資料/_work/みらい議会墨田区_本家文言_検索結果.txt` に保存（作り直せる中間ファイル）
- 2026-10-23 再開：分類を終えた（直す案はチャットで提示。本人の「修正して」待ち）
  - **直す（画面に出る）**：同意画面・公開許可の画面2つ（「党内での政策検討」「みらい議会に掲載」）、AIインタビューの説明ページ（「党内における政策検討」「Anthropic社等」→今は OpenAI）、共有文「みらい議会AIインタビュー」、オープンデータAPIページの題名、オープンデータAPIのエラー文、AIチャットの指示文（「みらい議会」「法案」）
  - **出ないので直さなくてよい**：チームみらい紹介（team-mirai.tsx はどこからも使われていない）、チームみらいの賛否カード（議案に賛否データが無い）、有識者登録（SHOW_EXPERT_REGISTRATION=false）、コメント行
  - **意図して残す**：規約・フッター・開発者ページの「みらい議会（AGPL-3.0）を元に」の表記（ライセンス上必要）
  - AIインタビューの指示文（build-interview-system-prompt.ts）と議案の設定（seed）には本家の文言なし
  - 2026-10-23「修正して」で8ファイルを直した（9b223bf を push、本番デプロイ済み・同日 18:45）。「党内」→「運営者（井上ひろき）の議会活動・政策検討」、「みらい議会」→「みらい議会@墨田区」、AIチャット指示文の「法案」→「議案・計画」、説明ページ「Anthropic社等」→「OpenAI社等」
  - **要確認**：説明ページの「入力データがAIモデルの学習に再利用されない」は、OpenAI と Vercel AI Gateway の現行規約で確かめる
  - テストの失敗は修正前と同じ60件（17ファイル。ふりがな・議案の状態・チャット画面など）。今回の修正で増減なし。公開前チェックで扱う

## 公開前チェックの結果（2026-11-01）

確認できたこと：
- 解説の数字の抜き取り6件は一次資料と一致（自転車計画の目標値＝概要版、契約議案3件・補正予算・税制改正の減収見込み＝会議録）
- 新ドメインでインタビューを最後まで実施：質問→終了→レポート案→公開設定の画面（直した文言）→非公開で提出→完了ページ。終了時の判定（gpt-5.2）も無料枠で動いた
- AIの送信先は実際には OpenAI だけ（会話・要約＝gpt-4.1-mini、終了時の判定＝gpt-5.2）
- 「AIの学習に再利用されない」：Vercel の ZDR 資料の表で、AI Gateway 経由の OpenAI は「No prompt training ✓」（https://vercel.com/docs/ai-gateway/security-and-compliance/zdr 、2026-09-22 更新）。表示は裏付けあり
- テスト60件の失敗はサイトの不具合ではない（墨田区版で変えた文言を本家の文言で期待している13ファイル＋テスト環境の localStorage 4ファイル）

本人の判断待ち：
- 試験の記録を消す（インタビュー3件・チャット利用記録・匿名ユーザー）
- プライバシーポリシーの送信先「OpenAI・Anthropic・Google」を「OpenAI」だけにするか
- 自転車計画の本文に読者向けの「**要確認**です」が1か所（data-plans.ts 144行）。「決まっていません」等に言い換えるか
- 「（試作版）」の表記を残すか
- レポートの立場欄にAIが「一般区民」「一般の区民として参加」と書く（要約の指示文由来）。直すか
- 完了ページの「いただいた声は政策検討に最大限活用します」（本家の文）を「井上ひろきが区議会での質問などの参考にします」に揃えるか
- プラン：Vercel Hobby（非商用の条件）・Supabase Free（休止あり）のままでよいか（**要確認**）
- テストを墨田区版の文言に合わせて直す（公開には影響しない）

### 判断の結果（2026-11-01 本人）
- ① 試験の記録：**今すぐ消す** → 済み（interview_report 1・interview_messages 9・interview_sessions 2・chat_usage_events 6・api_rate_limits 2・匿名ユーザー3 を削除。すべて 10/23 と 11/1 の試験分）
- ② プライバシーポリシーの送信先：**今のまま残す**（将来 Claude・Gemini に戻す余地）
- ③ 自転車計画の「要確認です」：「現時点で区は示していません」に言い換える
- ④ レポートの立場欄：要約の指示（packages/shared/src/interview-prompts/summary.ts の role_title・role_description、schema.ts の説明）に「本人が言っていない限り『区民』と書かない」を足す
- ⑤ 完了ページ：「いただいた声は、井上ひろきが区議会での質問などの参考にします」に揃える（report-complete-page.tsx）
- ⑥ 「試作版」：**外す**。画面（layout のサイト名・説明、規約、議案の注意書き、確認中バナー、運営者欄、about、フッター、AIチャット指示文）と、解説本文の末尾（seed 10ファイル。本番DBは bill_contents の該当行を書き換え。seed:sumida は流さない）
- ⑦ 料金プラン：規約を調べてから決める
  - Vercel Hobby：「非商用の個人利用のみ」。商用＝制作に関わる誰かの金銭的利益のためのデプロイ（支払い受付・商品やサービスの販売の宣伝・制作の報酬・アフィリエイト・広告）。**寄付の募集は商用に当たらない**（Fair Use Guidelines、2026-09-14 更新）。政治活動サイトの扱いは明記なし（**要確認**：迷う場合は Vercel サポートに問い合わせ可）
  - Supabase Free：7日間データベースへのアクセスが無いと一時停止（公式ページで未確認、第三者の解説で一致。**要確認**）。停止中もデータは残りダッシュボードから再開できる。有料プランは停止なし。無料は有効なプロジェクト2つまで（billing FAQ）
- ⑧ テスト：公開後に直す
- 2026-11-01 ③〜⑥を反映（d58ddf6 を push・本番デプロイ済み）。本番DBは bill_contents 1,248行の末尾注記と自転車計画の1文を書き換え（seed:sumida は使わず）、`/api/revalidate` でキャッシュを消した。トップ・規約・自転車計画のページで「試作」「要確認」が0件を確認
- 2026-11-01 本人決定：Vercel は Hobby（無料）のまま。Supabase は **Free のまま、止まったら管理画面から再開**する（7日間アクセスが無いと一時停止。止まっている間はサイトが表示されない）
- GA のリアルタイム確認は本人が後で行う

## OGP・検索向け設定の点検（2026-11-01）
- OGP：タイトル・説明・画像（墨田区版の ogp.jpg、1200×630）・X 用カードは出ている。トップに og:url・canonical・og:locale・og:type が無い
- **サイトマップの URL がデプロイごとの仮URL（mirai-gikai-sumida-xxxx-hiroki20.vercel.app）になっている**（app/sitemap.ts が VERCEL_URL を使う）。本番URLに直す必要あり
- robots.txt が無い（404）
- mirai-gikai-sumida.vercel.app でも同じ内容が見え、検索で重複する。gorisan.info へ転送するのがよい
- keywords に本家の「日本」が残る（検索順位にはほぼ影響しない）
- 運営者名（井上ひろき）は本文・規約にあるが、meta（description・author）と構造化データには無い
- 公開後：Google Search Console への登録（本人。所有確認は DNS の TXT か GA で）
- 2026-11-01 反映（e0ada18・ed17afd）：サイトマップを本番URLに、robots.txt 追加（/preview・/dev・/api は除外、/api/og/ は許可）、説明文に「運営：墨田区議会議員 井上ひろき」、author・creator・og:locale・og:type、WebSite の構造化データ（運営者は個人）、キーワード入れ替え、トップに canonical
- **mirai-gikai-sumida.vercel.app は gorisan.info への 308 転送にした**（Vercel のドメイン設定。パスとクエリはそのまま引き継ぐ）。デプロイごとの URL（〜-hiroki20.vercel.app）は Vercel のログインで保護済み（ssoProtection: all_except_custom_domains）。Supabase の Redirect URLs に残っている vercel.app は消してもよい

## 一般公開（2026-11-01）
- 本人指示で Vercel の `BASIC_AUTH_USER`・`BASIC_AUTH_PASSWORD` を削除して再デプロイ。**https://mirai-gikai-sumida.gorisan.info を一般公開**。認証なしで主なページ・画像・サイトマップ・robots.txt が 200、vercel.app は 308 で転送されることを確認
- `sumida-gikai/.env.production` の末尾には Basic 認証の値が残っている（手元の `sumida-gikai-web-prod` で起動すると手元だけ認証がかかる）
- **公開後は `seed:sumida` を流さない**（インタビューの回答が消える）。解説の修正は bill_contents を直接書き換える
- 公開後の残り：Google Search Console 登録（本人）、GA のリアルタイム確認（本人）、Supabase の Redirect URLs から vercel.app を消す（任意）、テスト60件の修正、admin の Google ログインを使う前に `@team-mir.ai` 自動 admin トリガーを外す
- 2026-11-01 Google Search Console：URLプレフィックス `https://mirai-gikai-sumida.gorisan.info/` を登録。GA での確認は計測タグが head に無いため不可、**HTMLタグ（google-site-verification、layout.tsx の metadata.verification）で所有確認済み（be3d8c9）。このタグは消さない**。sitemap.xml を送信（送信直後の表示は「取得できませんでした」。Googlebot で取得すると 200 を確認済み。数日後に見直す）
- 2026-11-01 テスト60件を墨田区版の文言に合わせて修正（fda2420）。1,306件すべて成功。原因の半分は Node 25 以降のグローバル localStorage（vitest に --no-experimental-webstorage）

## 公開後の運用（2026-11-01 整備、af7f2ce）

### 議案を足す・直す（sync:sumida）
1. `packages/seed/sumida/data-*.ts` に議案・解説を足す／直す（新しい議会年度は data.ts の会期 `[5, 6, 7, 8]` に年度を足す）
2. 確認だけ（書き込まない）：
   `cd ~/ClaudeCode/sumida-gikai && npx dotenv -e .env.production -- pnpm --filter @mirai-gikai/seed sync:sumida`
3. 追加・更新の一覧を見て問題なければ書き込む：同じコマンドに ` --apply`
4. 画面に反映されないときは `/api/revalidate`（REVALIDATE_SECRET）でキャッシュを消す
- 突き合わせ：会期＝slug、タグ＝label、議案＝name、解説＝（議案, 難易度）。**何も消さない**。議案の掲載日（published_at）は既存の議案では上書きしない
- 2026-11-01 時点で本番とデータは一致（追加0・更新0）。書き込み（--apply）は試作用 DB が一時停止中のため未試験。初回は確認→少数で試す
- `seed:sumida` はインタビューの記録が1件でもあると止まる（`--force` のときだけ実行。公開後は使わない）

### 会議予定の更新（import:meetings）
- `cd ~/ClaudeCode/sumida-gikai && npx dotenv -e .env.production -- pnpm --filter @mirai-gikai/seed import:meetings`
- 今の議会年度（5月〜翌4月）の区サイトのページを自動で選ぶ（令和8年度＝r8nittei.html）。新しい行を入れてから古い行を消す。読めた件数が前回の半分未満なら止まる
- 2026-11-01 本番で実行（118件・前回118件）
- 毎週の自動実行：既存の予定タスク「sumida-kaigiroku-update-check」（毎週金曜17時）の手順6に組み込み済み（2026-11-01 本人指示。会議録の新着の有無にかかわらず毎回実行、件数が変わったときと失敗したときだけ報告）

### そのほか
- 本家の `@team-mir.ai` 自動 admin トリガー・関数は削除済み（マイグレーション 20261101100000、本番適用済み）。admin ロールは手で付ける
- フォークの GitHub Actions は無効化済み
- レポートの立場欄：江東区在住・墨田区へ通勤の試験回答で「暮らしに影響・通勤利用者」となり「区民」と書かれないことを確認（試験の記録は削除済み）。なお要約には本人が言っていない「今後も声を集めてほしい」が入った（本家の要約の傾向。要観察）
- 試作用の Supabase は無料プランの一時停止中（DNS も引けない）。使うときは管理画面から再開

## AIはLINE公式の友だちだけ（2026-11-13 本人指示）

- AIチャット・AIインタビューは「井上ひろきLINE公式」の友だち（会員）だけが使える。閲覧はこれまでどおり誰でも
- **会員の情報・記録は、すみだ子ども・子育てポータルがまとめて持つ**。みらい議会は何も保存しない（詳細は `~/ClaudeCode/sumida-kodomo/README.md`「3サイト共通の会員」）
- 画面：`web/src/lib/member/client.ts`（ポータルの `/api/me` に聞く・記録を `/api/track` に送る）、`components/member/login-required.tsx`（案内）。チャットは送る前に確かめ（`chat-button.tsx`）、インタビューは始める／再開するボタンの前（`interview-action-buttons.tsx`）とチャット画面（`bills/[id]/interview/chat/page.tsx`）で確かめる
- サーバー：`web/src/lib/member/server.ts` がクッキー `gorisan_member` の署名と期限（3日）を確かめ、`/api/chat`・`/api/interview/chat`・`/api/interview/complete` は会員でなければ 401（`member_required`）
- **Vercel の環境変数 `MEMBER_SESSION_SECRET`（Production）に、子育てポータルと同じ値を入れる**（チャットに貼らない）。入れないと誰もAIを使えなくなる。手元は `sumida-gikai/.env` に入れ済み（11/13）
- 記録するのは chat_used（その画面で初めて送ったとき）・interview_start・interview_complete だけ。会話の中身は送らない
- LINE公式からの入口：`https://mirai-gikai-sumida.gorisan.info/line`（`web/src/app/line/route.ts`。`?next=/bills/…` も可）
- プライバシーポリシーにLINEログインと送り先を追記（改定日 2026-11-13）
- 2026-11-13 本番公開（9c6cdcd を sumida/main に push → Vercel が自動で本番に）。本番の `MEMBER_SESSION_SECRET` は子育てポータル本番と同じ値（控えは `~/ClaudeCode/sumida-kodomo/.env.member-secret`。Sensitive なので `vercel env pull` では本物が取れない。11/13 に仮の値を入れてしまい、ログイン後のAIチャットが401になった→同日入れ直し、`vercel redeploy` で公開し直した）。**この Vercel プロジェクトは `vercel deploy` だと Root Directory の設定でエラーになる。公開は push で**
