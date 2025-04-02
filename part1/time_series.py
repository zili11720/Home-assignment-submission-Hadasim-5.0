import hashlib
from datetime import datetime
import math
    

#1. validation 2. Avrages calculation
#Both tasks are done with one scan of the file
def validate_and_calc_avg(file_path):
    #Define a dictionary for averages calculation
    hourly_sum = {}
    hourly_count={}
    hourly_avg ={}

    lines_hashes = set() # To check duplicates
    invalid_rows = []# for debugging

    with open(file_path, 'r') as f:
        header = f.readline()  # skip header
        for line_num, line in enumerate(f, start=2):  # start=2 because of header
            line = line.strip()
            if not line:
                continue

            # Hash calculation for easier comparision
            hash_val = hashlib.sha256(line.encode()).hexdigest()
            if hash_val in lines_hashes:
                invalid_rows.append((line_num, line, "Duplicate row"))
                continue
            lines_hashes.add(hash_val)

            # Check if the row contains the fields date,time and value as needed
            try:
                timestamp_str, value_str = line.split(',', 1)
            except ValueError:
                continue

            # Validate numeric value
            try:
                value = float(value_str)
                if math.isnan(value) or math.isinf(value):
                   raise ValueError("Value is NaN or Inf")
            except ValueError:
                continue

            # Date format validation
            for fmt in ("%Y-%m-%d %H:%M:%S", "%d/%m/%Y %H:%M"):
                try:
                    parsed_time = datetime.strptime(timestamp_str.strip(), fmt)
                except ValueError:
                    continue

            #If all parts are valid add the value to the average of the hour
            hour_start = parsed_time.replace(minute=0, second=0, microsecond=0).time()#get the round hour for dictioning
            if hour_start not in hourly_sum:
               hourly_sum[hour_start] = 0.0
               hourly_count[hour_start] = 0
            hourly_sum[hour_start]+=value
            hourly_count[hour_start]+=1

    for hour in hourly_sum:
       hourly_avg[hour] = 0.0
       hourly_avg[hour]=hourly_sum[hour]/hourly_count[hour]
       print(hour," ",round(hourly_avg[hour],4))
         

    
     
if __name__ == "__main__":
    validate_and_calc_avg("time_series.csv")
    
