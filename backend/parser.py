import re
import os

"""
LOG PARSER MODULE
-----------------
Optimized for high-throughput log ingestion. 
Implements 'Smart Tailing' to process only the most recent log data 
when file sizes exceed memory safety limits (20MB buffer).
"""

# Common Log Format (CLF) Regex Pattern
LOG_PATTERN = re.compile(
    r'(?P<ip>\d+\.\d+\.\d+\.\d+) - - \[(?P<timestamp>.*?)\] "(?P<request>.*?)" (?P<status>\d+) (?P<size>\d+)'
)

# Configuration: Maximum read buffer size (20MB) to prevent memory overflow
# on massive log dumps.
READ_BUFFER_SIZE = 20 * 1024 * 1024 

def parse_log_file(file_path: str) -> list:
    """
    Parses a server log file and returns a list of dictionaries.
    
    Strategy:
    - If file < 20MB: Read entire file.
    - If file > 20MB: Seek to the end and read only the last 20MB (Smart Tailing).
    
    Returns:
        list: A list of parsed log entries ordered from NEWEST to OLDEST.
    """
    parsed_logs = []
    
    try:
        file_size = os.path.getsize(file_path)
        
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            # Efficiency Check: If file is too large, jump to the end
            if file_size > READ_BUFFER_SIZE:
                print(f"[INFO] File size ({file_size/1024/1024:.2f} MB) exceeds buffer. Initiating tail read...")
                f.seek(file_size - READ_BUFFER_SIZE)
                # Discard the first partial line after seek to ensure data integrity
                f.readline()
            
            # Process lines
            for line in f:
                match = LOG_PATTERN.match(line)
                if match:
                    log_entry = match.groupdict()
                    # Type conversion for numerical analysis
                    log_entry['status'] = int(log_entry['status'])
                    log_entry['size'] = int(log_entry['size'])
                    parsed_logs.append(log_entry)
                    
    except Exception as e:
        print(f"[ERROR] Log Parsing Failed: {str(e)}")
        return []
    
    # Return reversed list so the most recent events (at bottom of file) appear first
    return parsed_logs[::-1]