"""
Augmedix Data Operations Analyst Assessment
==========================================
Loads DB Data and EHR Data CSVs into SQLite,
runs all analytical queries, and exports results.

NOTE: SQLite does not support FULL OUTER JOIN.
      Reconciliation is done via LEFT JOIN + UNION ALL.
"""

import sqlite3
import csv
import os
import sys
import io
from datetime import datetime

# Force UTF-8 stdout on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# ─── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR = r"c:\Users\Syeed Asif\Desktop\assignment"
DB_CSV   = os.path.join(BASE_DIR, "Ops Case Study Dataset - Sample DB Data (3).csv")
EHR_CSV  = os.path.join(BASE_DIR, "Ops Case Study Dataset - Sample EHR Data (3).csv")
DB_FILE  = os.path.join(BASE_DIR, "SQL", "augmedix.db")
OUT_DIR  = os.path.join(BASE_DIR, "Analysis")
SQL_DIR  = os.path.join(BASE_DIR, "SQL")

os.makedirs(OUT_DIR, exist_ok=True)

CPT_DESCRIPTIONS = {
    "97010": "Hot/Cold Pack",
    "97014": "Electrical Stimulation (unattended)",
    "97035": "Ultrasound Therapy",
    "97110": "Therapeutic Exercises",
    "97112": "Neuromuscular Re-education",
    "97140": "Manual Therapy",
    "97150": "Therapeutic Procedure (group)",
    "97161": "PT Evaluation - Low Complexity",
    "97162": "PT Evaluation - Moderate Complexity",
    "97163": "PT Evaluation - High Complexity",
    "97530": "Therapeutic Activities",
    "G0283": "Electrical Stimulation (attended/Medicare)",
}

# ─── Helpers ─────────────────────────────────────────────────────────────────

def norm_date(val):
    """Normalize any date string to YYYY-MM-DD."""
    if not val or not val.strip():
        return None
    val = val.strip()
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%m-%d-%Y"):
        try:
            return datetime.strptime(val, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return None


def parse_cpt_array(raw):
    """Parse PostgreSQL array '{97110,97112}' into a deduplicated list."""
    if not raw or not raw.strip():
        return []
    cleaned = raw.strip().strip("{}")
    codes = [c.strip() for c in cleaned.split(",") if c.strip()]
    # Deduplicate while preserving order
    seen = set()
    unique = []
    for c in codes:
        if c not in seen:
            seen.add(c)
            unique.append(c)
    return codes, unique  # (original_list, deduplicated_list)


def save_csv(rows, headers, filename):
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(headers)
        w.writerows(rows)
    print(f"  [OK] {filename}  ({len(rows)} rows)")


def save_md(rows, headers, title, filename, notes=""):
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"# {title}\n\n")
        if notes:
            f.write(f"_{notes}_\n\n")
        f.write("| " + " | ".join(str(h) for h in headers) + " |\n")
        f.write("|" + "|".join(["---"] * len(headers)) + "|\n")
        for row in rows:
            f.write("| " + " | ".join(str(c) if c is not None else "" for c in row) + " |\n")
    print(f"  [OK] {filename}")


def qry(conn, sql, params=()):
    cur = conn.execute(sql, params)
    headers = [d[0] for d in cur.description] if cur.description else []
    return headers, cur.fetchall()


# ─── STEP 1: Build Database ──────────────────────────────────────────────────

def build_database():
    print("\n===========================================")
    print("  STEP 1 -- Building SQLite Database")
    print("===========================================")

    # Use fresh DB filename to avoid Windows file-lock issues
    ts = datetime.now().strftime("%H%M%S")
    db_path = os.path.join(SQL_DIR, f"augmedix_{ts}.db")
    print(f"  Creating DB: {db_path}")
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA cache_size=-64000;")  # 64 MB cache

    # ── db_sessions: one row per therapy visit ──────────────────────────────
    conn.execute("""
        CREATE TABLE db_sessions (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            patient    TEXT,
            provider   TEXT,
            visit_date TEXT,
            cpt_raw    TEXT,
            cpt_list   TEXT,
            cpt_count  INTEGER,
            had_dups   INTEGER DEFAULT 0
        );
    """)

    # ── db_cpt: exploded, one row per CPT code per visit ────────────────────
    conn.execute("""
        CREATE TABLE db_cpt (
            session_id INTEGER,
            patient    TEXT,
            provider   TEXT,
            visit_date TEXT,
            cpt_code   TEXT
        );
    """)

    # ── ehr_records: one row per CPT code (already normalized) ───────────────
    conn.execute("""
        CREATE TABLE ehr_records (
            patient    TEXT,
            provider   TEXT,
            visit_date TEXT,
            cpt_code   TEXT
        );
    """)

    # ── Load DB CSV ──────────────────────────────────────────────────────────
    session_rows = []
    cpt_rows     = []
    db_blanks    = 0
    db_dupes     = 0
    sid          = 0

    with open(DB_CSV, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            patient  = (row.get("Patient Name") or "").strip()
            provider = (row.get("Provider Name") or "").strip()
            raw_date = (row.get("from_date_range") or "").strip()
            raw_cpt  = (row.get("cpt_codes") or "").strip()

            if not patient and not provider:
                db_blanks += 1
                continue

            vdate = norm_date(raw_date)
            orig, unique = parse_cpt_array(raw_cpt)
            had_dup = 1 if len(orig) != len(unique) else 0
            if had_dup:
                db_dupes += 1

            sid += 1
            session_rows.append((sid, patient, provider, vdate,
                                  raw_cpt, ",".join(unique), len(unique), had_dup))
            for code in unique:
                cpt_rows.append((sid, patient, provider, vdate, code))

    conn.executemany(
        "INSERT INTO db_sessions VALUES (?,?,?,?,?,?,?,?);",
        session_rows
    )
    conn.executemany(
        "INSERT INTO db_cpt VALUES (?,?,?,?,?);",
        cpt_rows
    )

    print(f"  DB Sessions loaded    : {len(session_rows):,}")
    print(f"  DB CPT rows (exploded): {len(cpt_rows):,}")
    print(f"  DB Blank rows skipped : {db_blanks}")
    print(f"  DB Sessions w/dup CPT : {db_dupes}")

    # ── Load EHR CSV ─────────────────────────────────────────────────────────
    ehr_rows   = []
    ehr_blanks = 0

    with open(EHR_CSV, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            patient  = (row.get("Patient Name") or "").strip()
            provider = (row.get("Provider Name") or "").strip()
            raw_date = (row.get("Date of Service") or "").strip()
            cpt_code = (row.get("CPT Code") or "").strip()

            if not patient and not cpt_code:
                ehr_blanks += 1
                continue

            vdate = norm_date(raw_date)
            ehr_rows.append((patient, provider, vdate, cpt_code))

    conn.executemany(
        "INSERT INTO ehr_records VALUES (?,?,?,?);",
        ehr_rows
    )
    print(f"  EHR rows loaded       : {len(ehr_rows):,}")
    print(f"  EHR Blank rows skipped: {ehr_blanks}")

    # ── Add indexes BEFORE building reconciliation ────────────────────────────
    print("  Building indexes ...")
    conn.execute("CREATE INDEX idx_db_join  ON db_cpt(patient, provider, visit_date, cpt_code);")
    conn.execute("CREATE INDEX idx_ehr_join ON ehr_records(patient, provider, visit_date, cpt_code);")
    conn.commit()

    # ── Build reconciliation table (emulate FULL OUTER JOIN) ─────────────────
    # SQLite has no FULL OUTER JOIN; we use LEFT JOIN + UNION ALL anti-join.
    print("  Building reconciliation table (this may take ~60s for 32K rows) ...")
    conn.execute("""
        CREATE TABLE reconciliation AS

        -- Part 1: All DB rows, matched or unmatched in EHR
        SELECT
            d.patient    AS patient,
            d.provider   AS provider,
            d.visit_date AS visit_date,
            d.cpt_code   AS cpt_code,
            CASE WHEN e.cpt_code IS NOT NULL THEN 'Matched' ELSE 'DB_Only' END AS status
        FROM db_cpt d
        LEFT JOIN ehr_records e
            ON  d.patient    = e.patient
            AND d.provider   = e.provider
            AND d.visit_date = e.visit_date
            AND d.cpt_code   = e.cpt_code

        UNION ALL

        -- Part 2: EHR rows with NO corresponding DB entry
        SELECT
            e.patient,
            e.provider,
            e.visit_date,
            e.cpt_code,
            'EHR_Only' AS status
        FROM ehr_records e
        WHERE NOT EXISTS (
            SELECT 1 FROM db_cpt d
            WHERE d.patient    = e.patient
              AND d.provider   = e.provider
              AND d.visit_date = e.visit_date
              AND d.cpt_code   = e.cpt_code
        );
    """)
    conn.execute("CREATE INDEX idx_rc_status   ON reconciliation(status);")
    conn.execute("CREATE INDEX idx_rc_provider ON reconciliation(provider);")
    conn.execute("CREATE INDEX idx_rc_cpt      ON reconciliation(cpt_code);")
    conn.execute("CREATE INDEX idx_rc_month    ON reconciliation(substr(visit_date,1,7));")
    conn.commit()

    recon_count = conn.execute("SELECT COUNT(*) FROM reconciliation;").fetchone()[0]
    print(f"  Reconciliation rows   : {recon_count:,}")
    print(f"  [OK] Database ready: {DB_FILE}")

    return conn, {
        "db_sessions": len(session_rows),
        "db_cpt_rows": len(cpt_rows),
        "ehr_rows"   : len(ehr_rows),
        "db_blanks"  : db_blanks,
        "ehr_blanks" : ehr_blanks,
        "db_dupes"   : db_dupes,
    }


# ─── STEP 2: Run All Queries ─────────────────────────────────────────────────

def run_all_queries(conn, stats):
    print("\n===========================================")
    print("  STEP 2 -- Running SQL Analyses")
    print("===========================================")

    # Q1 ── Data Profile
    print("\n[Q1] Data Profile ...")
    h, r = qry(conn, """
        SELECT 'DB Sessions'         AS metric, COUNT(*) AS value FROM db_sessions
        UNION ALL SELECT 'DB CPT Lines',   COUNT(*) FROM db_cpt
        UNION ALL SELECT 'EHR CPT Lines',  COUNT(*) FROM ehr_records
        UNION ALL SELECT 'Reconciliation Rows', COUNT(*) FROM reconciliation
        UNION ALL SELECT 'Unique DB Patients',  COUNT(DISTINCT patient) FROM db_sessions
        UNION ALL SELECT 'Unique EHR Patients', COUNT(DISTINCT patient) FROM ehr_records
        UNION ALL SELECT 'Unique DB Providers', COUNT(DISTINCT provider) FROM db_sessions
        UNION ALL SELECT 'DB Date Start', MIN(visit_date) FROM db_sessions
        UNION ALL SELECT 'DB Date End',   MAX(visit_date) FROM db_sessions
        UNION ALL SELECT 'EHR Date Start',MIN(visit_date) FROM ehr_records
        UNION ALL SELECT 'EHR Date End',  MAX(visit_date) FROM ehr_records;
    """)
    save_csv(r, h, "Q1_data_profile.csv")
    save_md(r, h, "Q1 -- Data Profile & Volume Check", "Q1_data_profile.md",
            "Baseline counts for both source systems")

    # Q2 ── Reconciliation Summary
    print("\n[Q2] Reconciliation Summary ...")
    h, r = qry(conn, """
        SELECT
            status,
            COUNT(*) AS records,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reconciliation), 2) AS pct
        FROM reconciliation
        GROUP BY status
        ORDER BY records DESC;
    """)
    save_csv(r, h, "Q2_reconciliation_summary.csv")
    save_md(r, h, "Q2 -- Reconciliation Summary (DB vs EHR)", "Q2_reconciliation_summary.md",
            "Matched=in both | DB_Only=billed not documented | EHR_Only=documented not billed")

    # Q3 ── Provider Documentation Accuracy
    print("\n[Q3] Provider Accuracy ...")
    h, r = qry(conn, """
        WITH prov AS (
            SELECT
                provider,
                SUM(status='Matched')  AS matched,
                SUM(status='DB_Only')  AS db_only,
                SUM(status='EHR_Only') AS ehr_only,
                COUNT(*)               AS total
            FROM reconciliation GROUP BY provider
        )
        SELECT
            provider, total, matched, db_only, ehr_only,
            ROUND(matched  * 100.0 / total, 1) AS match_pct,
            ROUND(db_only  * 100.0 / total, 1) AS db_only_pct,
            ROUND(ehr_only * 100.0 / total, 1) AS ehr_only_pct,
            CASE
                WHEN ROUND(matched*100.0/total,1) >= 90 THEN 'GREEN'
                WHEN ROUND(matched*100.0/total,1) >= 75 THEN 'YELLOW'
                ELSE 'RED'
            END AS rag_status
        FROM prov
        ORDER BY match_pct DESC;
    """)
    save_csv(r, h, "Q3_provider_accuracy.csv")
    save_md(r, h, "Q3 -- Provider Documentation Accuracy", "Q3_provider_accuracy.md",
            "GREEN>=90% | YELLOW>=75% | RED<75%")

    # Q4 ── CPT Code Discrepancy
    print("\n[Q4] CPT Code Discrepancies ...")
    h, r = qry(conn, """
        WITH c AS (
            SELECT cpt_code,
                SUM(status='Matched')  AS matched,
                SUM(status='DB_Only')  AS db_only,
                SUM(status='EHR_Only') AS ehr_only,
                COUNT(*)               AS total
            FROM reconciliation GROUP BY cpt_code
        )
        SELECT
            cpt_code, total, matched, db_only, ehr_only,
            ROUND(matched  * 100.0 / total, 1) AS match_pct,
            ROUND(db_only  * 100.0 / total, 1) AS db_only_pct,
            ROUND(ehr_only * 100.0 / total, 1) AS ehr_only_pct
        FROM c ORDER BY db_only DESC;
    """)
    save_csv(r, h, "Q4_cpt_discrepancy.csv")
    save_md(r, h, "Q4 -- CPT Code Discrepancy Analysis", "Q4_cpt_discrepancy.md",
            "DB_Only = billed but missing from EHR documentation")

    # Q5 ── Monthly Trend
    print("\n[Q5] Monthly Trends ...")
    h, r = qry(conn, """
        SELECT
            SUBSTR(visit_date, 1, 7)                   AS month,
            COUNT(DISTINCT patient||'|'||visit_date)   AS unique_sessions,
            COUNT(*)                                    AS total_cpt_lines,
            SUM(status='Matched')                      AS matched,
            SUM(status='DB_Only')                      AS db_only,
            SUM(status='EHR_Only')                     AS ehr_only,
            ROUND(SUM(status='Matched')*100.0/COUNT(*),1) AS match_rate_pct
        FROM reconciliation
        WHERE visit_date IS NOT NULL
        GROUP BY month ORDER BY month;
    """)
    save_csv(r, h, "Q5_monthly_trend.csv")
    save_md(r, h, "Q5 -- Monthly Documentation Trend", "Q5_monthly_trend.md",
            "Tracks whether documentation accuracy improved or degraded month-over-month")

    # Q6 ── Patient Documentation Gaps
    print("\n[Q6] Patient Documentation Gaps ...")
    h, r = qry(conn, """
        WITH pat AS (
            SELECT patient,
                COUNT(*) AS total,
                SUM(status='Matched')  AS matched,
                SUM(status='DB_Only')  AS db_only,
                SUM(status='EHR_Only') AS ehr_only
            FROM reconciliation GROUP BY patient
        )
        SELECT patient, total, matched, db_only, ehr_only,
            ROUND(matched*100.0/total, 1) AS match_pct
        FROM pat
        WHERE db_only + ehr_only > 0
        ORDER BY db_only + ehr_only DESC LIMIT 30;
    """)
    save_csv(r, h, "Q6_patient_gaps.csv")
    save_md(r, h, "Q6 -- Top 30 Patients with Documentation Gaps", "Q6_patient_gaps.md",
            "Ranked by total unmatched CPT codes")

    # Q7 ── Provider Switching
    print("\n[Q7] Provider Assignment Mismatches ...")
    h, r = qry(conn, """
        SELECT
            d.patient,
            d.visit_date,
            d.provider   AS db_provider,
            e.provider   AS ehr_provider,
            COUNT(*)     AS cpt_count
        FROM db_cpt d
        JOIN ehr_records e
            ON  d.patient    = e.patient
            AND d.visit_date = e.visit_date
            AND d.cpt_code   = e.cpt_code
            AND d.provider  != e.provider
        GROUP BY d.patient, d.visit_date, d.provider, e.provider
        ORDER BY cpt_count DESC LIMIT 30;
    """)
    save_csv(r, h, "Q7_provider_switching.csv")
    save_md(r, h, "Q7 -- Provider Assignment Mismatches", "Q7_provider_switching.md",
            "Same patient+date+CPT but different provider in DB vs EHR")

    # Q8 ── Duplicate CPT Detection
    print("\n[Q8] Duplicate CPT Codes in DB Sessions ...")
    h, r = qry(conn, """
        SELECT
            patient, provider, visit_date,
            cpt_raw,
            cpt_count AS unique_cpt_count,
            (LENGTH(cpt_raw) - LENGTH(REPLACE(cpt_raw, ',', '')) + 1) AS raw_cpt_count,
            had_dups
        FROM db_sessions
        WHERE had_dups = 1
        ORDER BY (LENGTH(cpt_raw) - LENGTH(REPLACE(cpt_raw, ',', '')) + 1) - cpt_count DESC;
    """)
    save_csv(r, h, "Q8_duplicate_cpt.csv")
    save_md(r, h, "Q8 -- Sessions with Duplicate CPT Codes", "Q8_duplicate_cpt.md",
            "Sessions where same CPT appeared more than once - potential billing error")

    # Q9 ── CPT Volume Comparison
    print("\n[Q9] CPT Volume Comparison ...")
    h, r = qry(conn, """
        SELECT
            cpt_code,
            SUM(CASE WHEN src='DB'  THEN cnt ELSE 0 END) AS db_count,
            SUM(CASE WHEN src='EHR' THEN cnt ELSE 0 END) AS ehr_count,
            SUM(cnt) AS total
        FROM (
            SELECT cpt_code, COUNT(*) AS cnt, 'DB'  AS src FROM db_cpt       GROUP BY cpt_code
            UNION ALL
            SELECT cpt_code, COUNT(*) AS cnt, 'EHR' AS src FROM ehr_records  GROUP BY cpt_code
        )
        GROUP BY cpt_code ORDER BY total DESC;
    """)
    save_csv(r, h, "Q9_cpt_volume.csv")
    save_md(r, h, "Q9 -- CPT Volume Comparison (DB vs EHR)", "Q9_cpt_volume.md",
            "Side-by-side count of each CPT code in both systems")

    # Q10 ── Provider x CPT Heatmap
    print("\n[Q10] Provider x CPT Heatmap Data ...")
    h, r = qry(conn, """
        SELECT
            provider, cpt_code,
            SUM(status='Matched')  AS matched,
            SUM(status='DB_Only')  AS db_only,
            SUM(status='EHR_Only') AS ehr_only,
            COUNT(*)               AS total,
            ROUND(SUM(status='Matched')*100.0/COUNT(*), 1) AS match_pct
        FROM reconciliation
        GROUP BY provider, cpt_code
        ORDER BY provider, db_only DESC;
    """)
    save_csv(r, h, "Q10_provider_cpt_heatmap.csv")
    save_md(r, h, "Q10 -- Provider x CPT Match Rate Heatmap", "Q10_provider_cpt_heatmap.md",
            "Powers the heatmap visual in the dashboard")


# ─── STEP 3: Write Findings Summary ─────────────────────────────────────────

def write_findings_summary(conn, stats):
    print("\n===========================================")
    print("  STEP 3 -- Writing Findings Summary")
    print("===========================================")

    _, recon = qry(conn, "SELECT status, COUNT(*) FROM reconciliation GROUP BY status;")
    rd = dict(recon)
    matched  = rd.get("Matched",  0)
    db_only  = rd.get("DB_Only",  0)
    ehr_only = rd.get("EHR_Only", 0)
    total    = matched + db_only + ehr_only
    match_pct = round(matched / total * 100, 1) if total else 0

    _, best  = qry(conn, """
        SELECT provider, ROUND(SUM(status='Matched')*100.0/COUNT(*),1) AS p
        FROM reconciliation GROUP BY provider ORDER BY p DESC LIMIT 1;""")
    _, worst = qry(conn, """
        SELECT provider, ROUND(SUM(status='Matched')*100.0/COUNT(*),1) AS p
        FROM reconciliation GROUP BY provider ORDER BY p ASC LIMIT 1;""")
    _, top_db = qry(conn, """
        SELECT cpt_code, SUM(status='DB_Only') AS n
        FROM reconciliation GROUP BY cpt_code ORDER BY n DESC LIMIT 1;""")

    path = os.path.join(OUT_DIR, "findings_summary.md")
    with open(path, "w", encoding="utf-8") as f:
        f.write("# Augmedix Assessment -- Key Findings\n\n")
        f.write(f"_Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}_\n\n---\n\n")

        f.write("## 1. Dataset Overview\n\n")
        f.write("| Metric | Value |\n|---|---|\n")
        f.write(f"| DB Sessions (unique therapy visits) | {stats['db_sessions']:,} |\n")
        f.write(f"| DB CPT Lines (after exploding arrays) | {stats['db_cpt_rows']:,} |\n")
        f.write(f"| EHR CPT Lines (clinical documentation) | {stats['ehr_rows']:,} |\n")
        f.write(f"| Blank rows removed (DB) | {stats['db_blanks']:,} |\n")
        f.write(f"| Blank rows removed (EHR) | {stats['ehr_blanks']:,} |\n")
        f.write(f"| DB sessions with duplicate CPT codes | {stats['db_dupes']:,} |\n\n")

        f.write("---\n\n## 2. Reconciliation Results\n\n")
        f.write("| Status | Count | % |\n|---|---|---|\n")
        f.write(f"| Matched (in both DB & EHR) | {matched:,} | {match_pct}% |\n")
        f.write(f"| DB Only (billed, not documented) | {db_only:,} | {round(db_only/total*100,1) if total else 0}% |\n")
        f.write(f"| EHR Only (documented, not in DB) | {ehr_only:,} | {round(ehr_only/total*100,1) if total else 0}% |\n")
        f.write(f"| **Total** | **{total:,}** | **100%** |\n\n")

        f.write("### Business Interpretation\n")
        f.write(f"- **{match_pct}% overall documentation match rate** across both systems.\n")
        if db_only > 0:
            f.write(f"- **{db_only:,} CPT lines billed but not documented in EHR** -- compliance/audit risk.\n")
        if ehr_only > 0:
            f.write(f"- **{ehr_only:,} CPT lines documented in EHR but not billed** -- potential lost revenue.\n")

        f.write("\n---\n\n## 3. Provider Performance\n\n")
        if best:
            f.write(f"- **Best performer**: {best[0][0]} ({best[0][1]}% match rate)\n")
        if worst:
            f.write(f"- **Needs attention**: {worst[0][0]} ({worst[0][1]}% match rate)\n")

        f.write("\n---\n\n## 4. CPT Code Insights\n\n")
        if top_db:
            desc = CPT_DESCRIPTIONS.get(str(top_db[0][0]), "Unknown")
            f.write(f"- **Most underdocumented CPT**: `{top_db[0][0]}` ({desc}) -- {top_db[0][1]:,} DB-only occurrences\n")

        f.write("\n---\n\n## 5. Recommendations\n\n")
        f.write("### Immediate (0-7 days)\n")
        f.write("- Flag all DB-only CPT lines for manual review before next billing cycle\n")
        f.write("- Audit sessions with duplicate CPT codes for billing accuracy\n\n")
        f.write("### Short-Term (30 days)\n")
        f.write("- Implement real-time EHR<->DB reconciliation alerts for providers\n")
        f.write("- Set provider documentation SLA: >=90% match rate within 24h of session\n\n")
        f.write("### Long-Term (90 days)\n")
        f.write("- Deploy Augmedix ambient AI to auto-capture CPT codes from clinical notes\n")
        f.write("- Build a live ops dashboard for daily reconciliation monitoring\n")

    print("  [OK] findings_summary.md")


# ─── STEP 4: Save SQL Files ──────────────────────────────────────────────────

def save_sql_files():
    print("\n===========================================")
    print("  STEP 4 -- Saving .sql Query Files")
    print("===========================================")

    queries = {
        "01_data_profile.sql": """\
-- Q1: Data Profile & Volume Check
-- Compare record counts across both source systems

SELECT 'DB Sessions'           AS metric, COUNT(*) AS value FROM db_sessions
UNION ALL SELECT 'DB CPT Lines',   COUNT(*) FROM db_cpt
UNION ALL SELECT 'EHR CPT Lines',  COUNT(*) FROM ehr_records
UNION ALL SELECT 'Unique DB Patients',  COUNT(DISTINCT patient) FROM db_sessions
UNION ALL SELECT 'Unique EHR Patients', COUNT(DISTINCT patient) FROM ehr_records
UNION ALL SELECT 'Unique Providers (DB)', COUNT(DISTINCT provider) FROM db_sessions
UNION ALL SELECT 'DB Date Range Start', MIN(visit_date) FROM db_sessions
UNION ALL SELECT 'DB Date Range End',   MAX(visit_date) FROM db_sessions;
""",
        "02_reconciliation.sql": """\
-- Q2: Session-Level Reconciliation (DB vs EHR)
-- Identifies Matched, DB-Only, and EHR-Only CPT lines
-- Note: SQLite does not support FULL OUTER JOIN.
-- The reconciliation table was built using LEFT JOIN UNION ALL anti-join pattern.

SELECT
    status,
    COUNT(*) AS records,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reconciliation), 2) AS pct
FROM reconciliation
GROUP BY status
ORDER BY records DESC;
""",
        "03_provider_analysis.sql": """\
-- Q3: Provider Documentation Accuracy with RAG Status

WITH prov AS (
    SELECT
        provider,
        SUM(status = 'Matched')  AS matched,
        SUM(status = 'DB_Only')  AS db_only,
        SUM(status = 'EHR_Only') AS ehr_only,
        COUNT(*)                 AS total
    FROM reconciliation
    GROUP BY provider
)
SELECT
    provider, total, matched, db_only, ehr_only,
    ROUND(matched  * 100.0 / total, 1) AS match_rate_pct,
    ROUND(db_only  * 100.0 / total, 1) AS db_only_pct,
    ROUND(ehr_only * 100.0 / total, 1) AS ehr_only_pct,
    CASE
        WHEN ROUND(matched * 100.0 / total, 1) >= 90 THEN 'GREEN'
        WHEN ROUND(matched * 100.0 / total, 1) >= 75 THEN 'YELLOW'
        ELSE 'RED'
    END AS rag_status
FROM prov
ORDER BY match_rate_pct DESC;
""",
        "04_cpt_analysis.sql": """\
-- Q4: CPT Code Discrepancy & Volume Analysis

WITH cpt_stats AS (
    SELECT
        cpt_code,
        SUM(status = 'Matched')  AS matched,
        SUM(status = 'DB_Only')  AS db_only,
        SUM(status = 'EHR_Only') AS ehr_only,
        COUNT(*)                 AS total
    FROM reconciliation
    GROUP BY cpt_code
)
SELECT
    cpt_code, total, matched, db_only, ehr_only,
    ROUND(matched  * 100.0 / total, 1) AS match_pct,
    ROUND(db_only  * 100.0 / total, 1) AS db_only_pct
FROM cpt_stats
ORDER BY db_only DESC;
""",
        "05_time_trends.sql": """\
-- Q5: Monthly Documentation Trend

SELECT
    SUBSTR(visit_date, 1, 7)                          AS month,
    COUNT(DISTINCT patient || '|' || visit_date)      AS unique_sessions,
    COUNT(*)                                           AS total_cpt_lines,
    SUM(status = 'Matched')                           AS matched,
    SUM(status = 'DB_Only')                           AS db_only,
    SUM(status = 'EHR_Only')                          AS ehr_only,
    ROUND(SUM(status = 'Matched') * 100.0 / COUNT(*), 1) AS match_rate_pct
FROM reconciliation
WHERE visit_date IS NOT NULL
GROUP BY month
ORDER BY month;
""",
        "06_documentation_gaps.sql": """\
-- Q6: Top 30 Patients with Documentation Gaps

WITH pat AS (
    SELECT
        patient,
        COUNT(*)               AS total,
        SUM(status='Matched')  AS matched,
        SUM(status='DB_Only')  AS db_only,
        SUM(status='EHR_Only') AS ehr_only
    FROM reconciliation
    GROUP BY patient
)
SELECT
    patient, total, matched, db_only, ehr_only,
    ROUND(matched * 100.0 / total, 1) AS match_pct
FROM pat
WHERE db_only + ehr_only > 0
ORDER BY db_only + ehr_only DESC
LIMIT 30;
""",
        "07_provider_switching.sql": """\
-- Q7: Provider Assignment Mismatches
-- Same patient + date + CPT code, but different provider in DB vs EHR

SELECT
    d.patient,
    d.visit_date,
    d.provider AS db_provider,
    e.provider AS ehr_provider,
    COUNT(*)   AS cpt_count
FROM db_cpt d
JOIN ehr_records e
    ON  d.patient    = e.patient
    AND d.visit_date = e.visit_date
    AND d.cpt_code   = e.cpt_code
    AND d.provider  != e.provider
GROUP BY d.patient, d.visit_date, d.provider, e.provider
ORDER BY cpt_count DESC
LIMIT 30;
""",
        "08_duplicate_detection.sql": """\
-- Q8: Sessions with Duplicate CPT Codes (potential billing errors)

SELECT
    patient, provider, visit_date,
    cpt_raw,
    cpt_count AS unique_cpt_count,
    (LENGTH(cpt_raw) - LENGTH(REPLACE(cpt_raw, ',', '')) + 1) AS raw_cpt_count,
    (LENGTH(cpt_raw) - LENGTH(REPLACE(cpt_raw, ',', '')) + 1) - cpt_count AS duplicates_removed
FROM db_sessions
WHERE had_dups = 1
ORDER BY duplicates_removed DESC;
""",
    }

    for fname, sql in queries.items():
        path = os.path.join(SQL_DIR, fname)
        with open(path, "w", encoding="utf-8") as f:
            f.write(sql)
        print(f"  [OK] SQL/{fname}")


# ─── Main ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("===========================================")
    print("  Augmedix Assessment -- Data Pipeline    ")
    print("===========================================")

    conn, stats = build_database()
    run_all_queries(conn, stats)
    write_findings_summary(conn, stats)
    save_sql_files()
    conn.close()

    print("\n===========================================")
    print("  ALL DONE!")
    print("===========================================")
    print(f"  Database  : SQL/augmedix.db")
    print(f"  Outputs   : Analysis/*.csv + Analysis/*.md")
    print(f"  SQL Files : SQL/01_*.sql ... SQL/08_*.sql")
