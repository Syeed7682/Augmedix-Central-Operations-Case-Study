-- Q7: Provider Assignment Mismatches (same patient/date/CPT, different provider)

SELECT
    d.patient,
    d.visit_date,
    d.provider     AS db_provider,
    e.provider     AS ehr_provider,
    COUNT(*)       AS cpt_count
FROM db_cpt d
JOIN ehr_records e
    ON  LOWER(TRIM(d.patient))   = LOWER(TRIM(e.patient))
    AND d.visit_date             = e.visit_date
    AND d.cpt_code               = e.cpt_code
    AND LOWER(TRIM(d.provider)) != LOWER(TRIM(e.provider))
GROUP BY d.patient, d.visit_date, d.provider, e.provider
ORDER BY cpt_count DESC
LIMIT 30;
