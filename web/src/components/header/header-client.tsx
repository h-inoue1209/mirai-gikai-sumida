"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FALLBACK, Mark, ThemeDetails } from "@/components/layouts/site-band";
import { DifficultySelector } from "@/features/bill-difficulty/client/components/difficulty-selector";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { InterviewHeaderActions } from "@/features/interview-session/client/components/interview-header-actions";
import { sendDifficultyStateEvent } from "@/lib/analytics/preference-state-events";
import { useOnPageView } from "@/lib/analytics/use-on-page-view";
import { isInterviewPage, isMainPage } from "@/lib/page-layout-utils";
import { routes } from "@/lib/routes";
import { HamburgerMenu } from "./hamburger-menu";

/** ヘッダーの文字メニュー（他のサイトに合わせた。2026-11-21） */
export const HEADER_NAV: { label: string; href: string }[] = [
  { label: "議案", href: routes.billsList() },
  { label: "会議の予定", href: routes.schedule() },
  { label: "審議会", href: routes.councils() },
  { label: "入札・契約", href: routes.contracts() },
  { label: "このサイトについて", href: "/#about" },
];

interface HeaderClientProps {
  difficultyLevel: DifficultyLevelEnum;
}

export function HeaderClient({ difficultyLevel }: HeaderClientProps) {
  const pathname = usePathname();
  const showDifficultySelector = isMainPage(pathname);
  const showInterviewActions = isInterviewPage(pathname);

  // Headerは1ページに1つだけ常時マウントされるため、
  // ここで難易度設定をページ表示のたびにGAへ送る
  // (DifficultySelectorはmarkdown埋め込み等で複数箇所に
  //  同時マウントされ得るため、送信元には適さない)
  useOnPageView(() => sendDifficultyStateEvent(difficultyLevel));

  // 2026-11-21 本人「みらい議会のヘッダーを他のサイトに合わせて」「形もメニューも合わせる」：
  // 画面幅いっぱいの白いヘッダーに、線の絵のマーク（青緑）＋名前＋ひとこと、文字のメニュー。
  // 説明の詳しさ・インタビュー・他のテーマのサイト・ハンバーガー（ルビ、狭い画面ではメニューも）は右側
  const isCurrent = (href: string) =>
    href === "/#about"
      ? false
      : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <header className="fixed top-0 right-0 left-0 z-40 border-b border-[#d6e5f1] bg-white">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-3 px-4">
        <Link
          href={routes.home()}
          className="flex min-w-0 items-center gap-2 text-[#23364a]"
          aria-label="ホーム"
        >
          <Mark id="gikai" color="#2aa693" />
          <span className="grid min-w-0 leading-tight">
            <span className="truncate font-bold text-[17px] max-[520px]:overflow-visible max-[520px]:whitespace-normal max-[520px]:text-[14px]">
              みらい議会<span className="inline-block">＠墨田区</span>
            </span>
            <span className="truncate text-xs text-[#5d7186] max-[520px]:hidden">
              区議会の議案や議論を、わかりやすく
            </span>
          </span>
        </Link>
        <nav
          className="ml-auto hidden items-center gap-1 min-[900px]:flex"
          aria-label="メニュー"
        >
          {HEADER_NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href as Route}
              aria-current={isCurrent(n.href) ? "page" : undefined}
              className="whitespace-nowrap px-3 py-1.5 font-bold text-[#23364a] text-sm hover:rounded-full hover:bg-[#eaf4fc] aria-[current=page]:shadow-[inset_0_-3px_0_#2aa693]"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 min-[900px]:ml-0">
          {showDifficultySelector && (
            <DifficultySelector currentLevel={difficultyLevel} />
          )}
          {showInterviewActions && <InterviewHeaderActions />}
          {/* すみだポータルの「他のテーマのサイト」（黒い帯はやめ、どの幅でもここ。本人 11/21） */}
          <ThemeDetails sites={FALLBACK} variant="head" />
          <HamburgerMenu links={HEADER_NAV} />
        </div>
      </div>
    </header>
  );
}
