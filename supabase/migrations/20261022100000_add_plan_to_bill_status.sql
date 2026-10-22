-- 行政計画の見直し（AI意見募集 → 区のパブコメ → 策定）を議案と同じ一覧で扱うための状態
ALTER TYPE bill_status_enum ADD VALUE IF NOT EXISTS 'plan';
