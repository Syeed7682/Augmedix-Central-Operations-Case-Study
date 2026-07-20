-- Q6: Patients with Documentation Gaps

WITH pat AS (
    SELECT
        patient,
        COUNT(*) AS total,
        SUM(CASE WHEN status='Matched'  THEN 1 ELSE 0 END) AS matched,
        SUM(CASE WHEN status='DB_Only'  THEN 1 ELSE 0 END) AS db_only,
        SUM(CASE WHEN status='EHR_Only' THEN 1 ELSE 0 END) AS ehr_only
    FROM reconciliation
    GROUP BY patient
)
SELECT
    patient,
    total,
    matched,
    db_only,
    ehr_only,
    ROUND(matched * 100.0 / total, 1) AS match_pct
FROM pat
WHERE db_only + ehr_only > 0
ORDER BY db_only + ehr_only DESC
LIMIT 30;
