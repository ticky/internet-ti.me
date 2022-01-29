#!/usr/bin/env python3

import cgi
import cgitb
cgitb.enable()

import codecs, sys
import math
from datetime import date, datetime, time, timedelta, timezone
from decimal import *
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from pytz import timezone as tz

# ---
# Gatekeeper.py
# CGI wrapper allowing buffering output and setting headers and content independently

class Gatekeeper:
    def __init__(self):
        self.Headers = {}
        self.Body    = []
        self.Headers["X-Powered-By"] = "Python, Gatekeeper.py"
        self.Headers["Content-Type"] = "text/html"

    def addHeader(self, name, value):
        self.Headers[name] = value

    def addBody(self, value):
        self.Body.append(value)

    def flush(self):
        for name in self.Headers:
            sys.stdout.buffer.write("{}: {}".format(name, self.Headers[name]))

        sys.stdout.buffer.write()

        sys.stdout.flush()

        for value in self.Body:
            sys.stdout.buffer.write(value)

    def __del__(self):
        self.flush()
# ---

biel_mean_time = timezone(timedelta(hours = 1), name = "BMT")

# TODO: Use babel (https://babel.pocoo.org/en/latest/dates.html) for this, so we can get nice descriptive labels
timezones = [tz("US/Pacific"), tz("US/Eastern"), tz("Europe/London"), biel_mean_time, tz("Asia/Tokyo"), tz("Pacific/Auckland")]

# gatekeeper = Gatekeeper()

form = cgi.FieldStorage()

requested_beats = form.getvalue("beats", None)

beats = int(requested_beats)
today = date.today()

midnight = datetime.combine(today, time(), biel_mean_time)

now = midnight + timedelta(seconds = float(beats * Decimal(86.4)))

new_image = Image.new("RGBA", (1024, 512), "#FFFFFF")
drawing_context = ImageDraw.Draw(new_image)

background_font = ImageFont.truetype("/home/protected/.fonts/Inter-Bold.ttf", 400)
drawing_context.text((1024, 13), "@%0.3d" % beats, fill="#E5E5E5", font=background_font, anchor="ra")

caption_font = ImageFont.truetype("/home/protected/.fonts/Inter-Black.ttf", 128)
drawing_context.text((70, 23), "@%0.3d" % beats, fill="#000000", font=caption_font)

link_font = ImageFont.truetype("/home/protected/.fonts/Inter-Bold.ttf", 32)
drawing_context.text((954, 47), "internet-ti.me/@%0.3d" % beats, fill="#893ff4", font=link_font, anchor="ra")

image_dir = Path(__file__).parent.resolve() / "../images"

with Image.open(image_dir / "1f30e.png", 'r') as image:
    americas_emoji = image.resize((80, 80))
new_image.alpha_composite(americas_emoji, (70, 200))

with Image.open(image_dir / "1f30d.png", 'r') as image:
    europe_africa_emoji = image.resize((80, 80))
new_image.alpha_composite(europe_africa_emoji, (70, 290))

with Image.open(image_dir / "1f30f.png", 'r') as image:
    asia_oceania_emoji = image.resize((80, 80))
new_image.alpha_composite(asia_oceania_emoji, (70, 380))

time_font = ImageFont.truetype("/home/protected/.fonts/Inter-SemiBold.ttf", 54)
for index, zone in enumerate(timezones):
    adjusted_datetime = now.astimezone(zone)
    drawing_context.text(
        (200 + index % 2 * 360, 205 + math.floor(index / 2) * 90),
        adjusted_datetime.strftime("%H:%M %Z"),
        fill="#000000", font=time_font, features=["tnum"])

encoded_image = BytesIO()

new_image.save(encoded_image, "PNG")

# gatekeeper.addHeader("Content-Type", "image/png")
# gatekeeper.addBody(encoded_image.read())

print("Content-Type: image/png\n")
sys.stdout.flush()
encoded_image.seek(0)
sys.stdout.buffer.write(encoded_image.read())
