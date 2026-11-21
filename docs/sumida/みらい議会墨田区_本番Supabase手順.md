# みらい議会@墨田区 本番用 Supabase の作り方

作成日: 2026-10-23（リポジトリ h-inoue1209/mirai-gikai-sumida の sumida/main 60dcc1d 時点）

試作で使っている Supabase（以下「試作用」）とは別に、本番用のプロジェクトを新しく作る。
**キーやパスワードはチャットに貼らない。** 手順2のファイルに本人が書き込む。

## 全体の流れ

| # | 作業 | 誰が |
|---|---|---|
| 1 | Supabase で本番用プロジェクトを作る | 本人 |
| 2 | 接続情報を `.env.production` に書く | 本人 |
| 3 | 表を作る（マイグレーション119本） | Claude |
| 4 | 議案・会議予定のデータを入れる | Claude |
| 5 | 認証まわりの設定（匿名ログイン・URL） | 本人（画面の場所は Claude が案内） |
| 6 | 動作確認 | Claude |

管理画面（admin）の Google ログインは、**公開に必須ではない**ので後回しにする（議案データは seed で入れるため）。

### 進み具合

- 2026-10-23：手順1〜4 済み。本番の件数は試作用と一致（会期4・議案624・解説1,248・タグ8・インタビュー設定1・質問5・会議予定553＝令和5〜8年度）
- 2026-10-23：手順5（匿名ログイン ON）・手順6 済み。開発サーバー `sumida-gikai-web-prod`（Claude_job/.claude/launch.json、ポート3002。`.env.production` を優先し、足りない値は `.env` から読む）で、主な11ページが表示され、匿名ログインが通ることを確認。確認の際に匿名ユーザーが1件できている（害はない）

### admin の Google ログインを有効にする前に直すこと

- 本家のマイグレーション `20260427100000_auto_admin_role_for_google_workspace_users.sql` は、**`@team-mir.ai` のメールで Google ログインした人に自動で管理者権限を付ける**トリガーを作る。本番 DB にも入っている
- 今は Google ログインが無効なので働かないが、有効にする前に、このトリガーを外すマイグレーションを足す（墨田区版の管理者は本人のアカウントだけにする）

---

## 1. 本番用プロジェクトを作る（本人）

1. https://supabase.com/dashboard を開き、試作用と同じアカウントでログイン
2. 「New project」
   - **Name**：`mirai-gikai-sumida-prod` など、試作用と見分けがつく名前
   - **Database Password**：「Generate a password」で作り、**パスワード管理アプリに控える**（手順2で使う）
   - **Region**：`Northeast Asia (Tokyo)`
   - **Plan**：下の「料金プラン」を見て決める
3. 作成が終わるまで数分待つ

### 料金プラン（**要確認**：Supabase の料金ページで現行の条件を確かめる）

- **Free**：一定期間アクセスが無いとプロジェクトが一時停止する仕組みがある。公開サイトで止まると表示できなくなる
- **Pro**：月額の有料プラン。一時停止が無く、バックアップがある
- 公開後しばらくアクセスが少ない時期もありうるので、**本番は Pro が安全**。費用の扱い（政治活動費か等）は本人判断

## 2. 接続情報をファイルに書く（本人）

`~/ClaudeCode/sumida-gikai/.env.production` を作り、次の5行を書く。
このファイルは `.gitignore` で Git に入らない（確認済み）。

```env
SUPABASE_URL=https://<プロジェクトID>.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://<プロジェクトID>.supabase.co
SUPABASE_SECRET_KEY=<Secret key>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Publishable key>
SUPABASE_DB_URL=postgresql://postgres.<プロジェクトID>:<DBパスワード>@<ホスト>:5432/postgres
```

値のある場所（Supabase の画面）：

| 値 | 場所 |
|---|---|
| プロジェクトID・URL | Project Settings → General（Project ID）。URL は `https://<ID>.supabase.co` |
| Publishable key・Secret key | Project Settings → API Keys |
| SUPABASE_DB_URL | 画面上部の「Connect」→ **Session pooler** の接続文字列。`[YOUR-PASSWORD]` を手順1のパスワードに置き換える |

書けたら Claude に「書いた」とだけ伝える（**値は送らない**）。

## 3. 表を作る（Claude）

```bash
npx supabase db push --db-url "$SUPABASE_DB_URL" --include-all
```

- `.env.production` を読み込んで実行する。`supabase/migrations/` の119本（本家のもの＋墨田区版の追加）が入る
- `supabase/seed.sql` は流さない（本番に固定のアカウントを作らないため）
- `supabase config push` は使わない。`config.toml` はローカル開発用の値（`127.0.0.1` など）なので、認証の設定は手順5で画面から行う

## 4. データを入れる（Claude）

```bash
dotenv -e .env.production -- pnpm --filter @mirai-gikai/seed seed:sumida
dotenv -e .env.production -- pnpm --filter @mirai-gikai/seed import:meetings
dotenv -e .env.production -- pnpm --filter @mirai-gikai/seed import:past-meetings ~/ClaudeCode/Claude_job/reference/区議会会議録/_index.json 5 8
```

（`import:past-meetings` の年度の範囲は、試作用に入れたときと同じ令和5〜8年度を想定。実行前に試作用の会議予定の件数と突き合わせる）

- 議案624件・解説1,248件と、会議予定（今年度＋過去年度）が入る
- **注意：`seed:sumida` は全件を消して入れ直す。** 公開後に流すと、AIインタビューの回答も消える。公開後の議案追加は、消さずに足す方法を別に用意する（課題）

## 5. 認証の設定（本人。画面は Claude が案内）

Authentication の画面で：

| 設定 | 値 | 理由 |
|---|---|---|
| Sign In / Providers → **Allow anonymous sign-ins** | ON | AIインタビュー・AIチャットは匿名ログインで動く（試作用で無効のためエラーが出ていた） |
| URL Configuration → **Site URL** | 本番サイトのURL（ドメイン決定後） | ログイン後の戻り先 |
| URL Configuration → **Redirect URLs** | 本番サイトのURL、（admin を使うなら）`https://<adminのドメイン>/api/auth/callback` | — |
| Attack Protection（任意） | CAPTCHA は当面なし | 匿名ログインの回数制限は既定値を使う |

ドメインが決まっていない間は、Site URL は Vercel の仮URL（`https://〜.vercel.app`）でよい。

## 6. 動作確認（Claude）

- 手元の開発サーバーを `.env.production` で起動し、トップ・議案ページ・行政計画ページが出ることを確認
- 匿名ログインのエラーが消えていることを確認（AIの回答そのものは Vercel AI Gateway のキーを入れてから）

---

## このあと（別の手順）

- Vercel：web（と必要なら admin）のプロジェクトを作り、環境変数を入れる
- Vercel AI Gateway のキー、Googleアナリティクスの測定ID
- ドメイン
- 公開前チェック（最後に行う）
