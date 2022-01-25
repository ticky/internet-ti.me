#!/usr/bin/env python3

import cgi
import cgitb
cgitb.enable()

from datetime import datetime, timedelta, timezone
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

env = Environment(
    loader=FileSystemLoader(Path(__file__).parent.resolve() / "../templates"),
    autoescape=select_autoescape()
)

template = env.get_template("index.html")

biel_mean_time = timezone(timedelta(hours = 1), name = "BMT")

now = datetime.now(biel_mean_time)

beats = ((now.hour * 3600) + (now.minute * 60) + (now.second)) / 86.4

gatekeeper = Gatekeeper()

form = cgi.FieldStorage()

gatekeeper.addHeader("Content-Type", "text/html")
gatekeeper.addBody(template.render(beats=beats, datetime=now, timezones=[tz("US/Pacific"), tz("US/Eastern"), tz("Europe/London"), tz("Asia/Tokyo")]))
gatekeeper.addBody("<pre><code>{}</code></pre>".format(form.getvalue("beats", None)))
