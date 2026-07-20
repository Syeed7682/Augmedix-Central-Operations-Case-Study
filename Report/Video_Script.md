# Augmedix Data Operations Analyst Video Script

### Duration: ~5 Minutes

---

## 1. Introduction (45–60 seconds)

Hello everyone.

My name is **Kha. Mo. Syeed Asif**.

Thank you for giving me the opportunity to present my case study for the **Data Operations Analyst** position.

I am currently a final-year Computer Science and Engineering student at East West University, and my major is Data Science.

I enjoy working with data to solve real business problems. My experience includes SQL, Python, Power BI, Excel, and dashboard development. I have worked on several data analysis and machine learning projects where I analyzed data, built dashboards, and presented insights to help decision making.

I am interested in joining Augmedix because I like the company's mission of improving healthcare through technology and AI. I believe data plays an important role in improving healthcare operations, reducing errors, and increasing revenue, and I would love to contribute to that mission.

Today, I will briefly explain my approach to solving the four problems in this assessment.

---

## 2. Problem 1 – Workers Compensation Claims (1 minute)

The first problem is about Workers Compensation claims.

Currently, around 500 claims should be processed every day, but only around 50 are completed because the internal tool fails most of the time.

My first step would be to identify the root cause before making any changes.

I would first check whether the problem comes from the software or from the workflow.

If the problem is the software, I would review application logs, identify common errors, check whether PDF generation is failing, and verify if required patient information is missing before the claim is submitted.

If the problem is the workflow, I would observe how operators are using the system. Sometimes users perform unnecessary manual steps or do not follow the same process, which increases processing time.

If the issue is caused by the offshore team, I would prepare a Standard Operating Procedure, provide training, and introduce batch processing instead of processing one claim at a time.

There could also be other reasons, such as vendor downtime, database connection issues, incorrect patient addresses, missing insurance information, or system permissions.

After implementing improvements, I would monitor several KPIs, including:

* Success Rate
* Number of Failed Claims
* Average Processing Time
* Claims Processed per Operator
* Daily Completion Rate

Tracking these metrics daily would help identify new issues quickly.

---

## Problem 2 – Technical Analysis (1 minute 30 seconds)

Now I'd like to explain **Problem 2**, which was the main technical part of this assessment.

Instead of comparing the two CSV files manually in Excel, I built an automated data analysis process using **Python and SQL**.

First, I wrote a Python script to load both datasets and clean the data. During this step, I normalized the records and converted the exported data into a format that was easier to analyze. For the CPT codes, I separated multiple codes so that each CPT code became its own row. This made the comparison much more accurate.

After cleaning the data, I loaded both datasets into a local SQLite database.

The next challenge was comparing the two datasets. Since SQLite doesn't support a Full Outer Join directly, I created my own reconciliation query by combining a **LEFT JOIN** with an **anti-join using UNION ALL**.

The first query compared all records from the imported database with the EHR records using a unique key made from the **Patient Name, Date of Service, Rendering Provider, and CPT Code**. This allowed me to identify records that matched and records that existed only in the database.

Then I ran another query in the opposite direction to find records that existed in the EHR but were missing from the imported database.

Finally, I combined both results using **UNION ALL**, which gave me one complete reconciliation table.

After creating this table, I ran several SQL queries to analyze missing encounters, provider performance, CPT code distribution, and overall import quality.

---

## Problem 2 – Findings and Business Impact (1 minute)

After completing the SQL analysis, I found that more than **26,000 CPT records** were analyzed, and about **94 percent** matched successfully between the two datasets.

However, there were two important findings.

First, there were **1,357 CPT records** that existed in the client's EHR but were missing from the imported database. This means these services may never have been billed, which could result in significant revenue loss.

Second, there were **202 CPT records** that existed in the database but had no matching clinical documentation in the EHR. This creates a compliance risk because claims should always be supported by clinical documentation.

To solve these issues, I would divide the work between the available teams.

The **three Mountain View operators** would review the 202 undocumented records because these are high-risk and require careful investigation.

The **twenty India team operators** would focus on recovering the 1,357 missing encounters by identifying why they failed to import and correcting the issues.

For a long-term solution, I would recommend improving the integration between the Electronic Health Record system and the billing system so that once a clinical note is completed, the billing information is transferred automatically. This would reduce manual work, improve accuracy, and prevent similar problems in the future.

---

## 4. Problem 3 – Claims Not Found (50 seconds)

The third problem focuses on more than ten thousand claims marked as "Claim Not Found."

Since reviewing every claim individually would take too much time, I would first prioritize the claims.

I would group them based on:

* Claim value
* Claim age
* Insurance company
* Submission date

High-value claims and older claims should receive the highest priority because they have the greatest financial impact.

Next, I would investigate why the claims could not be found.

Possible reasons include:

* Wrong insurance company
* Incorrect member ID
* Claim never reached the payer
* Clearinghouse rejection
* Incorrect patient information
* Duplicate submissions

Depending on the reason, the next action could include resubmitting the claim, correcting patient information, contacting the insurance company, or escalating the issue.

---

## 5. Problem 4 – Revenue Debugging (1 minute)

The final problem required understanding Medicare payment rules and CPT codes.

For Part A, I researched why Medicare pays different amounts for the same CPT code in different locations.

I found that Medicare calculates payments using Relative Value Units, Geographic Practice Cost Index, and the yearly Conversion Factor.

Because different geographic locations have different operating costs, physician payments are different.

For Part B, I analyzed why CPT code 97140 received different payments in two different claims.

This happens because when multiple therapy procedures are billed together, Medicare and many insurance companies apply the Multiple Procedure Payment Reduction rule.

As a result, secondary procedures receive reduced reimbursement.

For Part C, I applied the Medicare 8-Minute Rule.

Based on the total treatment minutes, I calculated the correct number of billable units and suggested a better unit distribution to maximize reimbursement while following Medicare guidelines.

---

## 6. Dashboard Demonstration (45 seconds)

To present my analysis clearly, I built an interactive dashboard.

The dashboard includes important business KPIs such as:

* Total Encounters
* Imported Encounters
* Missing Encounters
* Import Rate
* Claims Status
* Revenue Summary

I also created visualizations showing:

* Missing encounters by provider
* Monthly trends
* Revenue analysis
* Claims distribution
* Operational performance

The dashboard allows managers to quickly understand the current situation and identify areas that require immediate attention.

---

## 7. Closing (30 seconds)

In this assessment, my objective was not only to analyze the data but also to understand the business process, identify the root causes, measure the business impact, and recommend practical solutions.

I believe combining SQL, data analysis, visualization, and business understanding can significantly improve Revenue Cycle Management and reduce revenue loss.

Thank you very much for your time and consideration.

I appreciate this opportunity, and I look forward to discussing my work further.
