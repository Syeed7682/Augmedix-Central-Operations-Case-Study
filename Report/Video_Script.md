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

## 3. Problem 2 – Closed Encounter Analysis (1 minute 30 seconds)

Problem two is the main data analysis task.

We received two different datasets.

The first dataset contains all closed encounters from the client's Electronic Health Record.

The second dataset contains encounters that were successfully imported into Normandy.

The goal is to identify which encounters are missing and understand why they were not imported.

Instead of comparing thousands of records manually, I created an automated analysis process.

First, I loaded both CSV files.

Then I created a unique encounter identifier using:

* Patient Name
* Date of Service
* Rendering Provider

After creating the unique identifier, I compared both datasets using SQL.

I identified all encounters that existed in the EHR but were missing from the imported database.

After finding the missing encounters, I analyzed them further to identify patterns.

For example, I checked:

* Which providers had the highest number of missing encounters.
* Whether missing encounters happened during a specific date range.
* Whether certain CPT codes appeared more frequently.
* Whether there were missing values or duplicate records.

Based on these findings, I suggested possible causes such as data validation failures, incorrect provider information, duplicate records, import filtering rules, or system errors.

Finally, I presented all findings in an interactive dashboard so that managers can quickly identify missing encounters and investigate them.

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
