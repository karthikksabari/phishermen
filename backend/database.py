import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

# Initialize Client
supabase: Client = None

try:
    if not url or not key:
        raise ValueError("Supabase credentials missing in .env file")
    
    supabase = create_client(url, key)
    # print("✅ Database Connection: Established") # Optional: Keep silent for production

except Exception as e:
    print(f"❌ Database Connection Error: {e}")

def insert_log(log_data: dict):
    """
    Inserts a single log entry into the Supabase 'logs' table.
    """
    try:
        if supabase:
            response = supabase.table("logs").insert(log_data).execute()
            return response
        else:
            print("⚠️ Database not initialized. Skipping insert.")
            return None
    except Exception as e:
        print(f"❌ Insert Error: {e}")
        return None
    