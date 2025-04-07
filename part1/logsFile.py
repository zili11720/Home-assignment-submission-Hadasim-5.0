#Main idea
import os
from multiprocessing import Pool, cpu_count
from collections import Counter
import heapq

# 2. Count error frequencies in a given chunk of the file
def process_chunk(args):
    file_path, start, end = args
    counter = Counter()
    
    with open(file_path, 'r', encoding='latin-1') as f:
        f.seek(start)
        if start != 0:
            f.readline()  # Skip partial line if not at the beginning

        while f.tell() < end:
            line = f.readline()
            if not line:
                break
            try:
                code = line.strip().split("Error: ")[-1]
                counter[code] += 1
            except IndexError:
                continue  # Skip lines that don't match expected format

    return counter

# 3. Merge all counters from the different chunks
def merge_counters(counters):
    total = Counter()
    for c in counters:
        total.update(c)
    return total

# 4. Get the top N most frequent error codes using a max-heap
def get_top_n(counter, n):
    return heapq.nlargest(n, counter.items(), key=lambda x: x[1])

def process_large_log(file_path, n=10):
    file_size = os.path.getsize(file_path)
    num_cores = cpu_count()  # Get the number of available CPU cores
    chunk_size = file_size // num_cores

    # 1. Define byte ranges for each chunk based on file size
    chunks = [(file_path, i * chunk_size, (i + 1) * chunk_size if i != num_cores - 1 else file_size)
              for i in range(num_cores)]

    print(f"[*] Processing with {num_cores} processes...")

    with Pool(num_cores) as pool:
        results = pool.map(process_chunk, chunks)

    # 3. Merge the counters from all chunks
    total_counter = merge_counters(results)

    top_n = get_top_n(total_counter, n)

    print(f"\nTop {n} error codes:")
    for code, count in top_n:
        print(f"{code}: {count}")

if __name__ == "__main__":
    process_large_log("logs.txt", n=5)


#output:
#Top 5 error codes:
#WARN_101": 200098
#ERR_404": 200094
#ERR_400": 200069
#INFO_200": 199931
#ERR_500": 199808



#סעיף ה בקובץ וורד 