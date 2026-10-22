-- 墨田区版：委員会での理事者報告（採決のない報告事項）を載せるためのステータス
ALTER TYPE bill_status_enum ADD VALUE IF NOT EXISTS 'reported';
