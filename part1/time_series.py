import hashlib
from datetime import datetime
import math
from pathlib import Path
import os
from multiprocessing import Pool, cpu_count
import csv
import pandas as pd
import math
    
chunks_folder="daily_chunks"#folder for partial files


#1. validation and Avrages calculation
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
            hour_start = parsed_time.replace(minute=0, second=0, microsecond=0)#get the round hour for dictioning
            if hour_start not in hourly_sum:
               hourly_sum[hour_start] = 0.0
               hourly_count[hour_start] = 0
            hourly_sum[hour_start]+=value
            hourly_count[hour_start]+=1
            

    
    for hour in hourly_sum:
       hourly_avg[hour] = 0.0
       hourly_avg[hour]=hourly_sum[hour]/hourly_count[hour]
       #print(hour," ",round(hourly_avg[hour],4))

    return hourly_avg

#2. process each sub file and combine the results
def process_all_days():
    # get all sub files
    day_files = [os.path.join(chunks_folder, f) for f in os.listdir(chunks_folder)]

    #use multiprocessing for better efficiency
    with Pool(processes=cpu_count()) as pool:
        results = pool.map(validate_and_calc_avg, day_files)

    #combine the results
    combined_results = {}
    for day_result in results:
        for hour, avg in day_result.items():
            combined_results[hour] = avg
    #write the results into an output file in csv format
    with open("time_series_output.csv", 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Timestamp", "Average"])
        for hour in sorted(combined_results):
            writer.writerow([hour.strftime("%Y-%m-%d %H:%M:%S"), combined_results[hour]])


#2. file devision approach+ nultiprocessing for efficency
def split_by_day(inputfile):
    Path(chunks_folder).mkdir(exist_ok=True)
    with open(inputfile, 'r') as f:
        header = f.readline()
        for line in f:
            parts = line.strip().split(',', 1)
            if len(parts) != 2:
                continue
            ts = parts[0].strip()
            date_str = ts.split(' ')[0].replace('/', '-')
            day_file_path = os.path.join(chunks_folder, f"{date_str}.csv")
            with open(day_file_path, 'a') as day_file:
                day_file.write(line)
        

#4. parquet format
# הפורמט שומר את המידע לפי עמודות ולא שורות 
# וממאפשר קריאה מהירה בהרבה בצורה מקבילית על ידי קוד קצר יחסית
def validate_and_calc_avg_parquet(parquet_file):
    df = pd.read_parquet(parquet_file)

    if 'value' not in df.columns or 'timestamp' not in df.columns:
        raise ValueError("Parquet file must contain 'timestamp' and 'value' columns")

    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    df = df[~df["value"].isna()]
    df = df[~df["value"].isin([float("inf"), float("-inf")])]

    df["Timestamp"] = pd.to_datetime(df["Timestamp"], errors="coerce")
    df = df[~df["Timestamp"].isna()]

    df["hour"] = df["Timestamp"].dt.floor("H")

    df = df.drop_duplicates()

    grouped = df.groupby("hour")["value"].mean().reset_index()
    grouped.columns = ["Timestamp", "Average"]
    grouped.to_csv("time_series_output.csv", index=False)

    return grouped


if __name__ == "__main__":
    # for exercises 1 alone run:
    validate_and_calc_avg("time_series.csv")

    #for exercise 3 with file splitting run:
    #split_by_day("time_series.csv")
    #process_all_days()

    #for exercise 4
    #validate_and_calc_avg_parquet("time_series.parquet") 

#An answer for exercise 4 in the docks file 
