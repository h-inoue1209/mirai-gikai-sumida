import { LinkButton } from "@/components/top/link-button";
import { EXTERNAL_LINKS } from "@/config/external-links";
import { routes } from "@/lib/routes";

/**
 * デスクトップメニュー: アクションボタン（サイドバー内）
 */
export function DesktopMenuActionButtons() {
  return (
    <div className="flex flex-col gap-3">
      <LinkButton
        href={`${routes.home()}#about`}
        target="_self"
        icon={{
          src: "/img/logo.svg",
          alt: "",
          width: 20,
          height: 18,
        }}
      >
        このサイトについて
      </LinkButton>

      <LinkButton
        href={EXTERNAL_LINKS.CONTACT_LINE}
        icon={{
          src: "/icons/sns/icon_line.png",
          alt: "LINE",
          width: 20,
          height: 20,
        }}
      >
        LINEで問い合わせる
      </LinkButton>
    </div>
  );
}
