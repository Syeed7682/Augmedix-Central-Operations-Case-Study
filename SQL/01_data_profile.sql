-- Q1: Data Profile & Volume Check
-- Compare record counts across both source systems

SELECT 'DB Sessions'         AS metric, COUNT(*)                FROM db_sessions
UNION ALL
SELECT 'DB CPT Lines',                  COUNT(*)                FROM db_cpt
UNION ALL
SELECT 'EHR CPT Lines',                 COUNT(*)                FROM ehr_records
UNION ALL
SELECT 'Unique DB Patients',            COUNT(DISTINCT patient)  FROM db_sessions
UNION ALL
SELECT 'Unique EHR Patients',           COUNT(DISTINCT patient)  FROM ehr_records
UNION ALL
SELECT 'Unique Providers (DB)',         COUNT(DISTINCT provider) FROM db_sessions
UNION ALL
SELECT 'DB Date Range Start',           MIN(visit_date)          FROM db_sessions
UNION ALL
SELECT 'DB Date Range End',             MAX(visit_date)          FROM db_sessions;
