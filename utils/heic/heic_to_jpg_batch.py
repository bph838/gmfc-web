import os
from pathlib import Path
from tkinter import Tk, filedialog
from PIL import Image
import pillow_heif

pillow_heif.register_heif_opener()


def convert_file(src: Path):
    dst = src.with_suffix(".jpg")

    stat = src.stat()
    atime = stat.st_atime
    mtime = stat.st_mtime

    try:
        img = Image.open(src)
        exif = img.info.get("exif")

        img.convert("RGB").save(dst, "JPEG", quality=95, exif=exif)

        # restore timestamps
        os.utime(dst, (atime, mtime))

        print(f"✓ {src.name}")

    except Exception as e:
        print(f"✗ {src.name} -> {e}")


def main():
    # folder picker
    root = Tk()
    root.withdraw()
    folder = filedialog.askdirectory(title="Select folder containing HEIC files")

    if not folder:
        return

    folder = Path(folder)

    files = list(folder.rglob("*.heic")) + list(folder.rglob("*.HEIC"))

    if not files:
        print("No HEIC files found")
        return

    print(f"Found {len(files)} files...\n")

    for f in files:
        convert_file(f)

    print("\nDone!")


if __name__ == "__main__":
    main()
