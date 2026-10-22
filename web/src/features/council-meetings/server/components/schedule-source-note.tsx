/** 出典と「予定は変わる」注意書き。区サイトの文言に合わせる。 */
export function ScheduleSourceNote({ sourceUrl }: { sourceUrl: string }) {
  return (
    <p className="text-right text-xs leading-5 text-mirai-text-secondary">
      出典：
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        墨田区議会「会議日程」
      </a>
      <br />
      日程は予定であり、変更になる場合があります。最新の情報は区議会のページでご確認ください。
    </p>
  );
}
