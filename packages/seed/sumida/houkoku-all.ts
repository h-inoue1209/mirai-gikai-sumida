import { r7JuneReportBills, r7JuneReportContents } from "./houkoku-r7-06";
import { r7SeptReportBills, r7SeptReportContents } from "./houkoku-r7-09";
import { r7NovReportBills, r7NovReportContents } from "./houkoku-r7-11";
import { r7FebReportBills, r7FebReportContents } from "./houkoku-r7-02";
import { r6JuneReportBills, r6JuneReportContents } from "./houkoku-r6-06";
import { r6SeptReportBills, r6SeptReportContents } from "./houkoku-r6-09";
import { r6NovReportBills, r6NovReportContents } from "./houkoku-r6-11";
import { r6FebReportBills, r6FebReportContents } from "./houkoku-r6-02";
import { r5JuneReportBills, r5JuneReportContents } from "./houkoku-r5-06";
import { r5SeptReportBills, r5SeptReportContents } from "./houkoku-r5-09";
import { r5NovReportBills, r5NovReportContents } from "./houkoku-r5-11";
import { r5FebReportBills, r5FebReportContents } from "./houkoku-r5-02";
import { tokubetsuR5Bills, tokubetsuR5Contents } from "./tokubetsu-r5";
import { tokubetsuR6Bills, tokubetsuR6Contents } from "./tokubetsu-r6";
import { tokubetsuR7Bills, tokubetsuR7Contents } from "./tokubetsu-r7";

/*
 * 令和5〜7年度の委員会報告・特別委員会（採決なし）をまとめて data.ts に渡す。
 * 議会期間ごとのファイル（houkoku-r7-06.ts など）をここに足していく。
 */
export const pastReportBills = [...r7JuneReportBills, ...r7SeptReportBills, ...r7NovReportBills, ...r7FebReportBills, ...r6JuneReportBills, ...r6SeptReportBills, ...r6NovReportBills, ...r6FebReportBills, ...r5JuneReportBills, ...r5SeptReportBills, ...r5NovReportBills, ...r5FebReportBills, ...tokubetsuR5Bills, ...tokubetsuR6Bills, ...tokubetsuR7Bills];
export const pastReportContents = [...r7JuneReportContents, ...r7SeptReportContents, ...r7NovReportContents, ...r7FebReportContents, ...r6JuneReportContents, ...r6SeptReportContents, ...r6NovReportContents, ...r6FebReportContents, ...r5JuneReportContents, ...r5SeptReportContents, ...r5NovReportContents, ...r5FebReportContents, ...tokubetsuR5Contents, ...tokubetsuR6Contents, ...tokubetsuR7Contents];
