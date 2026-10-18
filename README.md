# Poseidon: Cyber-Forensic Log Analysis and Threat Detection Engine

Poseidon is an automated cyber-forensic analysis engine designed to ingest, parse, and analyze massive server access logs in real-time. By combining efficient systems-level log processing with robust statistical and machine learning algorithms via `scikit-learn`, the system identifies behavioral anomalies, flags malicious access attempts, and automates threat classification.

---

## Table of Contents

* [Abstract and Problem Statement](#abstract-and-problem-statement)
* [Core Machine Learning Architecture (`scikit-learn`)](#core-machine-learning-architecture-scikit-learn)
* [System Architecture and Workflow](#system-architecture-and-workflow)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Installation and Local Setup](#installation-and-local-setup)
* [API Endpoints](#api-endpoints)

---

## Abstract and Problem Statement

Modern web applications generate gigabytes of unstructured access logs daily. Security analysts face significant bottlenecks in manually reviewing log files to detect unauthorized access, SQL injection payloads, path traversal attempts, and distributed denial-of-service anomalies.

Poseidon addresses this challenge by providing an automated pipeline that ingests large log files, extracts behavioral patterns using natural language processing feature extraction, and applies supervised and unsupervised machine learning models to classify and score security threats instantly.

---

## Core Machine Learning Architecture (`scikit-learn`)

The core intelligence of Poseidon relies on a robust `scikit-learn` machine learning pipeline designed for high-throughput anomaly detection and text-based log classification.

### 1. Feature Engineering and Text Vectorization

Raw web server logs (Apache/Nginx/Custom format) are unstructured strings containing timestamps, IP addresses, HTTP methods, endpoints, status codes, and user agents.

* **TF-IDF Vectorization (`TfidfVectorizer`):** Text payloads (such as requested URIs and query parameters) are transformed into numerical vectors using Term Frequency-Inverse Document Frequency. This highlights anomalous terms, special characters (e.g., `'`, `;`, `--`), and unusual path lengths indicative of injection attacks.
* **Numerical Feature Scaling:** IP request frequencies, payload sizes, and temporal attributes are normalized using `StandardScaler` to ensure balanced feature weighting during model training and inference.

### 2. Algorithmic Approach

Depending on the deployment configuration, the engine utilizes a dual-model strategy:

* **Anomaly Detection (Unsupervised - `Isolation Forest`):** Used for zero-day threat detection. It isolates anomalies by randomly selecting features and split values, scoring log lines based on how easy they are to isolate. Outliers (anomalous requests) require fewer splits than normal traffic patterns.
* **Threat Classification (Supervised - `Random Forest Classifier` / `Logistic Regression`):** Trained on labeled historical threat datasets to categorize requests into distinct severity tiers (`LOW`, `MEDIUM`, `CRITICAL`), isolating common attack signatures such as Cross-Site Scripting (XSS), SQL Injection (SQLi), and unauthorized administrative endpoint traversal.

---

## System Architecture and Workflow

1. **Ingestion Layer:** The client uploads raw log files via the frontend interface. To handle memory constraints efficiently with large-scale datasets, the backend implements optimized file-seeking and buffer chunking.
2. **Preprocessing Pipeline:** The parser extracts fields, strips whitespace, normalizes IP structures, and passes request strings through the `scikit-learn` preprocessing pipeline.
3. **Inference Engine:** The vectorized log matrices are evaluated by the machine learning model. Known high-risk signatures trigger immediate rule-based automated defense protocols, while ambiguous patterns are classified via probabilistic inference.
4. **Persistence Layer:** Results, threat scores, timestamps, and origin metadata are securely stored in a relational database (`PostgreSQL`/`Supabase`) for auditing and forensic reporting.

---

## Technology Stack

* **Backend Logic:** Python, FastAPI, Uvicorn
* **Machine Learning & Data Processing:** scikit-learn, NumPy, Pandas
* **Database Layer:** PostgreSQL (Supabase)
* **Frontend User Interface:** React, Vite, Tailwind CSS
* **Deployment & Hosting:** Vercel (Frontend), Render (Backend Infrastructure)

---
## Project Structure

\`\`\`text
phishermen/
├── backend/
│   ├── database.py
│   ├── main.py
│   ├── ml_engine.py
│   ├── parser.py
│   ├── requirements.txt
│   └── vercel.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
\`\`\`

---

## Installation and Local Setup

### Prerequisites

* Python 3.10 or higher
* Node.js and npm
* Git

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/karthikksabari/phishermen.git
cd phishermen
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
\`\`\`

Create a `.env` file inside the `backend` directory:

\`\`\`env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_api_key
\`\`\`

Run the FastAPI development server:

\`\`\`bash
uvicorn main:app --reload --port 8000
\`\`\`

### 3. Frontend Setup

Open a new terminal window:

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
