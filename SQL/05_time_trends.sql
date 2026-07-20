-- Q5: Monthly Documentation Trend

SELECT
    SUBSTR(visit_date, 1, 7)                                              AS month,
    COUNT(DISTINCT patient || '|' || visit_date)                          AS unique_sessions,
    COUNT(*)                                                               AS total_cpt_lines,
    SUM(CASE WHEN status='Matched'  THEN 1 ELSE 0 END)                   AS matched,
    SUM(CASE WHEN status='DB_Only'  THEN 1 ELSE 0 END)                   AS db_only,
    SUM(CASE WHEN status='EHR_Only' THEN 1 ELSE 0 END)                   AS ehr_only,
    ROUND(SUM(CASE WHEN status='Matched' THEN 1 ELSE 0 END)*100.0/COUNT(*),1) AS match_rate_pct
FROM reconciliation
WHERE visit_date IS NOT NULL
GROUP BY month
ORDER BY month;
