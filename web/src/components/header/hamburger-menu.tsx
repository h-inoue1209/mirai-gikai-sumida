"use client";

import { Menu } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RubyToggle } from "@/lib/rubyful";

// 狭い画面（900px未満）ではヘッダーの文字メニューもここに出す（2026-11-21）
export function HamburgerMenu({
  links = [],
}: {
  links?: { label: string; href: string }[];
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* 絵の下に「メニュー」（他のサイトと同じ形。本人 11/21「他のサイトにプラスして詳しく」） */}
        <button
          type="button"
          className="grid cursor-pointer justify-items-center gap-0.5 rounded-lg px-1.5 py-1 text-[#23364a] hover:bg-[#eaf4fc]"
          aria-label="メニューを開く"
        >
          <Menu className="h-[22px] w-[22px]" />
          <small className="whitespace-nowrap font-bold text-[10px] leading-tight">
            メニュー
          </small>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-50" align="end">
        {links.length > 0 && (
          <nav
            className="mb-2 grid gap-0.5 border-[#d6e5f1] border-b pb-2 min-[900px]:hidden"
            aria-label="メニュー"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href as Route}
                className="rounded-lg px-2 py-2 font-bold text-[#23364a] text-sm hover:bg-[#eaf4fc]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
        <RubyToggle />
      </PopoverContent>
    </Popover>
  );
}
