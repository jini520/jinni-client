-- V3: 날짜 문자열 컬럼("YY.MM." VARCHAR)을 DATE 타입으로 전환
-- 대상:
--   - careers.start_date / end_date (end_date는 nullable 유지)
--   - educations.start_date / end_date
--   - awards.date
--   - certifications.date
-- 변환: "24.06." → 2024-06-01 (일자는 1일로 채움, 모든 데이터는 20xx 가정)

-- ────────────────────────────────────────────────────────
-- 0. 변환 전 형식 검증: "YY.MM." 패턴이 아닌 행이 있으면 중단
-- ────────────────────────────────────────────────────────
DO $$
DECLARE
    bad_count INTEGER;
BEGIN
    SELECT (SELECT COUNT(*) FROM careers
            WHERE start_date !~ '^\d{2}\.\d{2}\.$'
               OR (end_date IS NOT NULL AND end_date !~ '^\d{2}\.\d{2}\.$'))
         + (SELECT COUNT(*) FROM educations
            WHERE start_date !~ '^\d{2}\.\d{2}\.$'
               OR end_date !~ '^\d{2}\.\d{2}\.$')
         + (SELECT COUNT(*) FROM awards
            WHERE date !~ '^\d{2}\.\d{2}\.$')
         + (SELECT COUNT(*) FROM certifications
            WHERE date !~ '^\d{2}\.\d{2}\.$')
    INTO bad_count;

    IF bad_count > 0 THEN
        RAISE EXCEPTION 'V3 중단: "YY.MM." 형식이 아닌 날짜 데이터 %건 존재', bad_count;
    END IF;
END $$;

-- ────────────────────────────────────────────────────────
-- 1. VARCHAR → DATE 변환 ('20' || '24.06.' || '01' = '2024.06.01')
-- ────────────────────────────────────────────────────────
ALTER TABLE careers
    ALTER COLUMN start_date TYPE DATE USING TO_DATE('20' || start_date || '01', 'YYYY.MM.DD'),
    ALTER COLUMN end_date   TYPE DATE USING TO_DATE('20' || end_date   || '01', 'YYYY.MM.DD');

ALTER TABLE educations
    ALTER COLUMN start_date TYPE DATE USING TO_DATE('20' || start_date || '01', 'YYYY.MM.DD'),
    ALTER COLUMN end_date   TYPE DATE USING TO_DATE('20' || end_date   || '01', 'YYYY.MM.DD');

ALTER TABLE awards
    ALTER COLUMN date TYPE DATE USING TO_DATE('20' || date || '01', 'YYYY.MM.DD');

ALTER TABLE certifications
    ALTER COLUMN date TYPE DATE USING TO_DATE('20' || date || '01', 'YYYY.MM.DD');
