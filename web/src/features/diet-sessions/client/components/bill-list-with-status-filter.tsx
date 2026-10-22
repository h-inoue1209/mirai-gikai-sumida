"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CompactBillCard } from "@/features/bills/client/components/bill-list/compact-bill-card";
import type { BillWithContent } from "@/features/bills/shared/types";
import type { CouncilPeriod } from "@/features/council-meetings/shared/types";
import {
  periodLabelFor,
  toJstDateKey,
} from "@/features/council-meetings/shared/utils/council-period";
import { routes } from "@/lib/routes";

type FilterType = "all" | "enacted" | "rejected" | "other";

type Props = {
  bills: BillWithContent[];
  /** 渡すと、議案を提出日の議会期間（6月議会など）ごとに見出しを付けて並べる。 */
  periods?: CouncilPeriod[];
};

/** 議会期間ごとに束ねる。議会期間は始まった順、議案は渡された順のまま。 */
function groupByPeriod(bills: BillWithContent[], periods: CouncilPeriod[]) {
  const groups = new Map<string, { start: string; bills: BillWithContent[] }>();
  for (const bill of bills) {
    const date = bill.submitted_date ? toJstDateKey(bill.submitted_date) : "";
    const label = periodLabelFor(date, periods);
    const group = groups.get(label) ?? {
      start: periods.find((p) => p.name === label)?.start_date ?? "9999",
      bills: [],
    };
    group.bills.push(bill);
    groups.set(label, group);
  }
  return [...groups.entries()]
    .sort(([, a], [, b]) => a.start.localeCompare(b.start))
    .map(([label, g]) => ({ label, bills: g.bills }));
}

function BillCards({ bills }: { bills: BillWithContent[] }) {
  return (
    <div className="flex flex-col gap-3">
      {bills.map((bill) => (
        <Link key={bill.id} href={routes.billDetail(bill.id) as Route}>
          <CompactBillCard bill={bill} />
        </Link>
      ))}
    </div>
  );
}

function getFilterCounts(bills: BillWithContent[]) {
  const enacted = bills.filter((b) => b.status === "enacted").length;
  const rejected = bills.filter((b) => b.status === "rejected").length;
  const other = bills.length - enacted - rejected;

  return { all: bills.length, enacted, rejected, other };
}

function filterBills(
  bills: BillWithContent[],
  filter: FilterType
): BillWithContent[] {
  switch (filter) {
    case "enacted":
      return bills.filter((b) => b.status === "enacted");
    case "rejected":
      return bills.filter((b) => b.status === "rejected");
    case "other":
      return bills.filter(
        (b) => b.status !== "enacted" && b.status !== "rejected"
      );
    default:
      return bills;
  }
}

export function BillListWithStatusFilter({ bills, periods }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const counts = getFilterCounts(bills);
  const filteredBills = filterBills(bills, activeFilter);

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "ALL", count: counts.all },
    { key: "enacted", label: "可決", count: counts.enacted },
    { key: "rejected", label: "否決", count: counts.rejected },
    { key: "other", label: "報告・調査など", count: counts.other },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* フィルターボタン */}
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <Button
            key={filter.key}
            variant="ghost"
            onClick={() => setActiveFilter(filter.key)}
            className={`h-[29px] px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
              activeFilter === filter.key
                ? "bg-mirai-gradient text-black hover:bg-mirai-gradient"
                : "bg-mirai-surface-grouped text-mirai-text-muted hover:bg-mirai-surface-muted"
            }`}
          >
            {filter.label} {filter.count}
          </Button>
        ))}
      </div>

      {/* 法案リスト */}
      {filteredBills.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          該当する議案がありません
        </p>
      ) : periods ? (
        <div className="flex flex-col gap-8">
          {groupByPeriod(filteredBills, periods).map((group) => (
            <section key={group.label} className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-mirai-brand-teal-deep">
                {group.label}
                <span className="ml-2 text-sm text-mirai-text-secondary">
                  {group.bills.length}件
                </span>
              </h3>
              <BillCards bills={group.bills} />
            </section>
          ))}
        </div>
      ) : (
        <BillCards bills={filteredBills} />
      )}
    </div>
  );
}
