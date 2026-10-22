-- status_order に reported を加える（生成列の式は変えられないので作り直す）
DROP INDEX IF EXISTS idx_bills_status_order;
ALTER TABLE bills DROP COLUMN status_order;
ALTER TABLE bills ADD COLUMN status_order INT GENERATED ALWAYS AS (
  CASE status
    WHEN 'enacted'              THEN 0
    WHEN 'rejected'             THEN 1
    WHEN 'in_receiving_house'   THEN 2
    WHEN 'in_originating_house' THEN 3
    WHEN 'introduced'           THEN 4
    WHEN 'preparing'            THEN 5
    WHEN 'reported'             THEN 6
  END
) STORED;

CREATE INDEX idx_bills_status_order ON bills(status_order);
