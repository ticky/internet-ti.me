#!/usr/bin/env python3

import cgi
import cgitb
cgitb.enable()
import os

from datetime import date, datetime, time, timedelta, timezone
from decimal import *
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path
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
            print("{}: {}".format(name, self.Headers[name]))

        print()

        for value in self.Body:
            print(value)

    def __del__(self):
        self.flush()
# ---

server_name = os.environ.get("SERVER_NAME")

env = Environment(
    loader=FileSystemLoader(Path(__file__).parent.resolve() / "../templates"),
    autoescape=select_autoescape()
)

biel_mean_time = timezone(timedelta(hours = 1), name = "BMT")

# TODO: Use babel (https://babel.pocoo.org/en/latest/dates.html) for this, so we can get nice descriptive labels
# TODO: JavaScript can do it too // new Intl.DateTimeFormat('en', {timeZone: 'Etc/UTC', timeZoneName: 'long'}).formatToParts(new Date())
timezones = [tz("US/Pacific"), tz("US/Eastern"), tz("Etc/UTC"), biel_mean_time, tz("Asia/Tokyo"), tz("Pacific/Auckland")]

gatekeeper = Gatekeeper()

form = cgi.FieldStorage()

requested_beats = form.getvalue("beats", None)

if requested_beats == None:
    now = datetime.now(biel_mean_time)

    beats = ((now.hour * 3600) + (now.minute * 60) + (now.second)) / Decimal('86.4')

    template = env.get_template("index.html")
    gatekeeper.addHeader("Content-Type", "text/html")
    gatekeeper.addBody(template.render(server_name=server_name, beats=beats, datetime=now, timezones=timezones))
else:
    beats = int(requested_beats)
    today = date.today()

    midnight = datetime.combine(today, time(), biel_mean_time)

    now = midnight + timedelta(seconds = float(beats * Decimal('86.4')))

    template = env.get_template("reference.html")
    gatekeeper.addHeader("Content-Type", "text/html")
    gatekeeper.addBody(template.render(server_name=server_name, beats=beats, datetime=now, timezones=timezones))
