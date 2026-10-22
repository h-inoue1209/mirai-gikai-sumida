import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layouts/container";
import {
  LegalList,
  LegalPageLayout,
  LegalParagraph,
  LegalSectionTitle,
} from "@/components/layouts/legal-page-layout";
import { EXTERNAL_LINKS } from "@/config/external-links";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "プライバシーポリシー | みらい議会@墨田区",
  description: "みらい議会@墨田区のプライバシーポリシー",
};

const GA_OPT_OUT_URL = "https://tools.google.com/dlpage/gaoptout?hl=ja";

/** 外部サービスへの送信先。送信先を変えたらここを直す。 */
const EXTERNAL_SERVICES = [
  {
    name: "Vercel（AI Gateway）を経由して、OpenAI・Anthropic・Google",
    data: "対話・インタビューの内容",
    purpose: "AIの応答・要約をつくるため、不適切な入力を判定するため",
  },
  {
    name: "Supabase",
    data: "識別子、対話・回答の内容",
    purpose: "データの保存",
  },
  {
    name: "Google アナリティクス",
    data: "閲覧したページ、Cookieの識別子",
    purpose: "アクセスの集計",
  },
  {
    name: "ルビ表示サービス（Rubyful）",
    data: "閲覧しているページの文章",
    purpose: "ふりがなを表示するため（ルビ機能を使ったときのみ）",
  },
];

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      className="bg-transparent pt-24 md:pt-12"
      title="プライバシーポリシー"
      enLabel="Privacy Policy"
      description="墨田区議会議員の井上ひろき（以下「運営者」といいます。）は、「みらい議会@墨田区」（以下「本サービス」といいます。）で取り扱う情報について、以下のとおり定めます。"
    >
      <Container className="space-y-8">
        <p className="text-sm text-mirai-text-muted">制定日：2026年10月22日</p>

        <section className="space-y-4">
          <LegalSectionTitle>1. 取得する情報</LegalSectionTitle>
          <LegalParagraph>
            本サービスでは、氏名・住所・電話番号・メールアドレスなど、個人を特定する情報の入力を求めません。取得するのは次の情報です。
          </LegalParagraph>
          <LegalList
            items={[
              "利用者を区別するための識別子：ログインなしで使えるよう、ブラウザごとに自動で割り当てるID",
              "AIとの対話の内容：AIアシスタントへの質問と応答",
              "AIインタビューの回答：議案や行政計画などについてのAIインタビューでの回答と、その要約",
              "利用状況：閲覧したページ、操作の記録、不正対策のためのアクセス元の情報（IPアドレスなど）",
            ]}
          />
          <LegalParagraph>
            対話や回答の中に、利用する方が自ら個人情報を書き込んだ場合は、その情報も取得することになります。個人情報は書き込まないでください。
          </LegalParagraph>
        </section>

        <section className="space-y-4">
          <LegalSectionTitle>2. 利用目的</LegalSectionTitle>
          <LegalList
            items={[
              "本サービスの提供・運営と、お問い合わせへの対応",
              "不正な利用の防止",
              "本サービスの改善",
              "運営者が区議会での質問や政策提案を考える際の参考（AIインタビューの回答）",
              "回答した方が同意した回答の、本サービス上での公開と、オープンデータとしての提供",
              "個人がわからない形に集計した結果の、区議会での発言や活動報告での紹介",
            ]}
          />
          <LegalParagraph>
            選挙運動や、運営者の後援会・政党の勧誘には使いません。
          </LegalParagraph>
        </section>

        <section className="space-y-4">
          <LegalSectionTitle>3. 外部のサービスへの送信</LegalSectionTitle>
          <LegalParagraph>
            本サービスは、次の外部サービスを使っています。対話やインタビューの内容は、応答をつくるためにAIの提供会社に送られます。
          </LegalParagraph>
          <LegalList
            items={EXTERNAL_SERVICES.map((s) => ({
              id: s.name,
              content: (
                <>
                  <span className="font-bold">{s.name}</span>：{s.data}（
                  {s.purpose}）
                </>
              ),
            }))}
          />
        </section>

        <section className="space-y-4">
          <LegalSectionTitle>4. 第三者への提供</LegalSectionTitle>
          <LegalParagraph>
            次の場合を除き、取得した情報を第三者に提供しません。
          </LegalParagraph>
          <LegalList
            items={[
              {
                id: "consent",
                content: (
                  <>
                    本人の同意がある場合。AIインタビューの回答のうち公開に同意したものは、本サービス上で公開し、「
                    <Link
                      href={routes.interviewDataTerms()}
                      className="text-primary-accent underline"
                    >
                      みらい議会@墨田区AIインタビューデータ利用規約
                    </Link>
                    」に基づき、誰でもダウンロードできるオープンデータとして提供します。
                  </>
                ),
              },
              "個人がわからない形に集計した情報として提供する場合",
              "法令に基づく開示の請求があった場合",
              "人の生命・身体・財産を守るために必要で、本人の同意を得ることが難しい場合",
            ]}
          />
        </section>

        <section className="space-y-4">
          <LegalSectionTitle>5. 安全管理</LegalSectionTitle>
          <LegalParagraph>
            取得した情報は、アクセスできる人を運営者に限り、通信の暗号化などの対策をとって管理します。
          </LegalParagraph>
        </section>

        <section className="space-y-4">
          <LegalSectionTitle>6. Cookie（クッキー）</LegalSectionTitle>
          <LegalParagraph>
            本サービスは、利便性の向上とアクセスの集計（Googleアナリティクス）のためにCookieを使います。Cookieは、ブラウザの設定で無効にできます。Googleアナリティクスによる計測は、Googleが提供する
            <a
              href={GA_OPT_OUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-accent underline"
            >
              Google アナリティクス オプトアウト アドオン
            </a>
            でも止められます。
          </LegalParagraph>
        </section>

        <section className="space-y-4">
          <LegalSectionTitle>7. 保管期間と削除</LegalSectionTitle>
          <LegalParagraph>
            対話ログとAIインタビューの回答は、取得から4年間、または本サービスを終了するまでのいずれか短い期間保管し、その後削除します。公開した回答も、この期間を過ぎたら公開をやめて削除します。なお、オープンデータとして既に第三者が取得したデータは、運営者が管理していないため削除できません。
          </LegalParagraph>
        </section>

        <section className="space-y-4">
          <LegalSectionTitle>8. 開示・訂正・削除のご相談</LegalSectionTitle>
          <LegalParagraph>
            ご自身の対話や回答の削除、回答の公開の停止などのご相談は、下記までご連絡ください。ログインのない仕組みのため、ご本人のものと確認できない場合は対応できないことがあります。
          </LegalParagraph>
          <LegalParagraph>
            LINE公式アカウント：
            <a
              href={EXTERNAL_LINKS.CONTACT_LINE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-accent underline"
            >
              {EXTERNAL_LINKS.CONTACT_LINE}
            </a>
          </LegalParagraph>
        </section>

        <section className="space-y-4">
          <LegalSectionTitle>9. 改訂</LegalSectionTitle>
          <LegalParagraph>
            本ポリシーは必要に応じて改訂します。改訂した内容は、本サービスに掲載した時点から効力を持ちます。
          </LegalParagraph>
        </section>
      </Container>
    </LegalPageLayout>
  );
}
