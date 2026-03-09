import sys
from pathlib import Path
from PIL import Image


def resize_image(path: Path, max_dim: int):
    with Image.open(path) as img:
        width, height = img.size

        # Determine scale factor
        if width >= height:
            scale = max_dim / width
        else:
            scale = max_dim / height

        new_size = (int(width * scale), int(height * scale))

        resized = img.resize(new_size, Image.LANCZOS)
        resized.save(path)

        print(f"Resized {path.name} -> {new_size[0]}x{new_size[1]}")


def main():
    # if len(sys.argv) != 3:
    # print("Usage: python resize.py <directory> <max_dimension>")
    # sys.exit(1)

    # directory = Path(sys.argv[1])
    # max_dim = int(sys.argv[2])

    directory = Path("D:\\Gordano Model Flying Club\\gmfc-web\\src\\images\\news")
    max_dim = 640
    print(f"Processing images directory: {directory}")

    if not directory.is_dir():
        print("Error: directory does not exist")
        sys.exit(1)

    supported_exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

    for file in directory.iterdir():
        if file.suffix.lower() in supported_exts:
            resize_image(file, max_dim)


if __name__ == "__main__":
    main()
