-- Q4: CPT Code Discrepancy & Volume Analysis

WITH cpt_stats AS (
    SELECT
        cpt_code,
        SUM(CASE WHEN status='Matched'  THEN 1 ELSE 0 END) AS matched,
        SUM(CASE WHEN status='DB_Only'  THEN 1 ELSE 0 END) AS db_only,
        SUM(CASE WHEN status='EHR_Only' THEN 1 ELSE 0 END) AS ehr_only,
        COUNT(*) AS total
    FROM reconciliation
    GROUP BY cpt_code
)
SELECT
    cpt_code,
    total,
    matched,
    db_only,
    ehr_only,
    ROUND(matched  * 100.0 / total, 1) AS match_pct,
    ROUND(db_only  * 100.0 / total, 1) AS db_only_pct
FROM cpt_stats
ORDER BY db_only DESC;
