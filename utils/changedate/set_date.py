import sys
from datetime import datetime
from PIL import Image
import piexif
import os
import time


def set_image_date(path, date_str):
    """
    date_str format: YYYY-MM-DD HH:MM:SS
    Example: 2024-07-21 14:30:00
    """

    dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
    exif_date = dt.strftime("%Y:%m:%d %H:%M:%S")

    img = Image.open(path)

    try:
        exif_dict = piexif.load(img.info.get("exif", b""))
    except Exception:
        exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "thumbnail": None}

    # Set all common EXIF date fields
    exif_dict["0th"][piexif.ImageIFD.DateTime] = exif_date
    exif_dict["Exif"][piexif.ExifIFD.DateTimeOriginal] = exif_date
    exif_dict["Exif"][piexif.ExifIFD.DateTimeDigitized] = exif_date

    exif_bytes = piexif.dump(exif_dict)

    img.save(path, exif=exif_bytes)

    # also update filesystem times
    ts = dt.timestamp()
    os.utime(path, (ts, ts))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python set_date.py image.jpg 'YYYY-MM-DD HH:MM:SS'")
        sys.exit(1)

    set_image_date(sys.argv[1], sys.argv[2])
