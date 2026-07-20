# Augmedix Assessment — Key Findings

_Generated: 2026-07-21 00:33_

---

## 1. Dataset Overview

| Metric | Value |
|---|---|
| DB Sessions (unique therapy visits) | 6,482 |
| DB CPT Lines (after exploding arrays) | 24,752 |
| EHR CPT Lines (clinical documentation) | 25,956 |
| Blank/empty rows removed (DB) | 0 |
| Blank/empty rows removed (EHR) | 0 |
| DB sessions with duplicate CPT codes | 15 |

---

## 2. Reconciliation Results

| Status | Count | % |
|---|---|---|
| ✅ Matched (in both DB & EHR) | 25,157 | 94.2% |
| ⚠️ DB Only (billed, not documented) | 202 | 0.8% |
| ℹ️ EHR Only (documented, not in DB) | 1,357 | 5.1% |
| **Total** | **26,716** | **100%** |

### Business Interpretation
- **94.2% overall documentation match rate** across both systems.
- **202 CPT lines** were billed in the DB but have NO corresponding EHR documentation — this is a **compliance and audit risk**.
- **1,357 CPT lines** exist in the EHR but were NOT captured in the billing DB — this represents **potential lost revenue** (underbilling).

---

## 3. Provider Performance

- **Best performer**: Julian Lee (96.4% match rate)
- **Needs attention**:  (0.0% match rate)

---

## 4. CPT Code Insights

- **Most underdocumented CPT code**: `97110` (Therapeutic Exercises) — 43 DB-only occurrences

---

## 5. Recommendations

### Immediate (0–7 days)
- Flag all DB-only CPT lines for manual review before next billing cycle
- Audit sessions with duplicate CPT codes for billing accuracy

### Short-Term (30 days)
- Implement real-time EHR↔DB reconciliation alerts
- Set provider documentation SLA: ≥90% match rate within 24h of session

### Long-Term (90 days)
- Deploy Augmedix ambient AI documentation to auto-capture CPT codes from session notes
- Build a live operations dashboard for daily reconciliation monitoring
