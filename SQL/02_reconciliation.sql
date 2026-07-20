-- Q2: Session-Level Reconciliation (DB vs EHR)
-- Identifies Matched, DB-Only, and EHR-Only CPT lines

SELECT
    status,
    COUNT(*) AS records,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS pct
FROM reconciliation
GROUP BY status
ORDER BY records DESC;
