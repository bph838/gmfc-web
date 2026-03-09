import os
import json
from datetime import datetime


def rename_files(directory):
    for filename in os.listdir(directory):
        if not filename.lower().endswith(".json"):
            continue

        filepath = os.path.join(directory, filename)

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)

            date_str = data["races"][0]["date"]

            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))

            # Windows safe filename
            new_name = f"Session {dt.strftime('%Y-%m-%d %H-%M-%S')}.json"

            new_path = os.path.join(directory, new_name)

            os.rename(filepath, new_path)
            print(f"Renamed: {filename} -> {new_name}")

        except Exception as e:
            print(f"Skipping {filename}: {e}")


if __name__ == "__main__":
    directory = input("Enter directory path: ").strip()
    rename_files(directory)
