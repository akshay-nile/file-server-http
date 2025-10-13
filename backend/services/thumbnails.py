import os
from io import BytesIO
from urllib.parse import quote

from PIL import Image

from mutagen.id3 import ID3
from mutagen.flac import FLAC
from mutagen.id3._frames import APIC

from services.explorer import joiner


def get_cached_thumbnails(folderpath: str, base_url: str) -> list[dict]:
    # Get all the sub file paths inside the recieved folder path
    filepaths = filter(os.path.isfile, map(lambda item: joiner(folderpath, item), os.listdir(folderpath)))

    # Make sure that the thumbnails folder exists
    os.makedirs('./public/thumbnails', exist_ok=True)
    thumbnails = []

    for filepath in filepaths:
        # Make thumbnail path to find-in-cache
        filename = filepath.split('/')[-1]
        thumbpath = './public/thumbnails/' + filename + '.png'

        # Make url ecoded thumbnail url from base_url and filename
        thumburl = base_url + '/' + quote(filename, safe='') + '.png'

        # Check if thumbnail is already generated and exists in cache
        if os.path.isfile(thumbpath):
            thumbnails.append({'filepath': filepath, 'thumbnailURL': thumburl})
            continue

    return thumbnails


def get_generated_thumbnail(filepath: str, base_url: str) -> dict:
    # Make thumbnail path to find-in-cache
    filename = filepath.split('/')[-1]
    thumbpath = './public/thumbnails/' + filename + '.png'

    # Make url ecoded thumbnail url from base_url and filename
    thumburl = base_url + '/' + quote(filename, safe='') + '.png'
    thumbnail = {'filepath': filepath, 'thumbnailURL': thumburl}

    # Extract the file extention
    extention = filename.split('.')[-1].lower()

    # Supported image extentions
    if extention in ('jpg', 'jpeg', 'png', 'ico', 'bmp', 'gif', 'webp'):
        if generate_image_thumbnail(filepath, thumbpath):
            return thumbnail

    # Supported audio extentions
    if extention in ('mp3', 'flac', 'wav'):
        if generate_audio_thumbnail(filepath, thumbpath, extention):
            return thumbnail

    # Fallback to the default thumbnail available in frontend
    thumbnail['thumbnailURL'] = '/public/icons/file.jpg'
    return thumbnail


def generate_image_thumbnail(filepath: str | BytesIO, thumbpath: str) -> bool:
    try:
        with Image.open(filepath) as img:  # Open the file as image
            img = img.convert('RGB')  # Convert to RGB to avoid issues with color modes
            img.thumbnail((64, 64))  # Create thumbnail of 64x64 pixel
            img.save(thumbpath, format='PNG')  # Save in thumbnails folder
            img.close()
        return True
    except Exception:
        return False


def generate_audio_thumbnail(filepath: str, thumbpath: str, extention: str) -> bool:
    try:
        alburm_art = None

        if extention in ('mp3', 'wav'):  # For MP3/WAV files
            tags = ID3(filepath)
            for tag in tags.values():
                if isinstance(tag, APIC):
                    alburm_art = getattr(tag, 'data', None)
                    break
        elif extention == 'flac':  # For FLAC files
            flac = FLAC(filepath)
            if flac.pictures:
                alburm_art = flac.pictures[0].data

        if not alburm_art:  # If no album-art data found then abort
            return False

        # Convert album-art to image bytes and generate thumbnail using PIL
        return generate_image_thumbnail(BytesIO(alburm_art), thumbpath)
    except Exception:
        return False
