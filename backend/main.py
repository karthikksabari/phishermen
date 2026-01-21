from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from parser import parse_log_file
from ml_engine import detect_anomalies
from database import insert_log 

app = FastAPI()

# 1. CORS POLICY (Allows Ajay's Frontend to talk to us)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def home():
    return {"message": "Phishermen Backend is Active 🟢"}

@app.post("/analyze")
async def analyze_logs(file: UploadFile = File(...)):
    # --- SECURITY CHECK: EXTENSION VALIDATION ---
    filename = file.filename.lower()
    if not filename.endswith(('.log', '.txt')):
        raise HTTPException(
            status_code=400, 
            detail="❌ INVALID FILE TYPE. Only .log and .txt files are allowed."
        )
    
    # Save the file temporarily
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"📂 Processing File: {file.filename}")
        
        # 1. PARSE (Smart Tailing happens here)
        parsed_data = parse_log_file(file_path)
        
        if not parsed_data:
            return {"message": "File parsed but found no valid logs.", "data": []}

        # 2. ANALYZE (Forensic Math + AI)
        analyzed_data = detect_anomalies(parsed_data)
        
        # 3. STORE (Forensic Record in Supabase)
        # We store them so the Dashboard can show historical reports
        # --- DEMO OPTIMIZATION: BYPASS DATABASE TO PREVENT TIMEOUTS ---
        # for entry in analyzed_data:
        #     # Only save "Interesting" logs to save DB space/speed (Optional, but smart)
        #     if entry.get('is_anomaly'): 
        #         insert_log(entry)
            
        return {
            "status": "success", 
            "message": f"Analyzed {len(parsed_data)} lines. Found {len(analyzed_data)} insights.",
            "data": analyzed_data
        }

    except Exception as e:
        print(f"🔥 CRITICAL ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # CLEANUP: Delete the file after analysis to save space
        if os.path.exists(file_path):
            os.remove(file_path)