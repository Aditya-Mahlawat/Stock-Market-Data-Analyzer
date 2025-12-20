import sys
import os

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.data_service import DataService

print("Testing DataService...")
try:
    data = DataService.fetch_history("AAPL")
    if data:
        print(f"SUCCESS: Fetched {len(data)} records for AAPL")
        print(f"First record: {data[0]}")
    else:
        print("FAILURE: Returned empty list for AAPL")
except Exception as e:
    print(f"EXCEPTION: {e}")
