-- Q3: Provider Documentation Accuracy with RAG Status

WITH prov AS (
    SELECT
        provider,
        SUM(CASE WHEN status='Matched'  THEN 1 ELSE 0 END) AS matched,
        SUM(CASE WHEN status='DB_Only'  THEN 1 ELSE 0 END) AS db_only,
        SUM(CASE WHEN status='EHR_Only' THEN 1 ELSE 0 END) AS ehr_only,
        COUNT(*) AS total
    FROM reconciliation
    GROUP BY provider
)
SELECT
    provider,
    total,
    matched,
    db_only,
    ehr_only,
    ROUND(matched  * 100.0 / total, 1) AS match_rate_pct,
    ROUND(db_only  * 100.0 / total, 1) AS db_only_pct,
    ROUND(ehr_only * 100.0 / total, 1) AS ehr_only_pct,
    CASE
        WHEN ROUND(matched*100.0/total,1) >= 90 THEN 'GREEN'
        WHEN ROUND(matched*100.0/total,1) >= 75 THEN 'YELLOW'
        ELSE 'RED'
    END AS rag_status
FROM prov
ORDER BY match_rate_pct DESC;
