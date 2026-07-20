-- Q8: Sessions with Duplicate CPT Codes (billing errors)

SELECT
    patient,
    provider,
    visit_date,
    cpt_raw,
    cpt_count             AS unique_codes,
    (LENGTH(cpt_raw) - LENGTH(REPLACE(cpt_raw, ',', '')) + 1) AS raw_code_count,
    (LENGTH(cpt_raw) - LENGTH(REPLACE(cpt_raw, ',', '')) + 1)
    - cpt_count           AS duplicates_removed
FROM db_sessions
WHERE
    (LENGTH(cpt_raw) - LENGTH(REPLACE(cpt_raw, ',', '')) + 1) > cpt_count
ORDER BY duplicates_removed DESC;
