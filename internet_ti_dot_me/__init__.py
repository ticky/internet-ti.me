from flask import Flask, abort, redirect, render_template, send_file, url_for

import math
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from pytz import timezone as tz

BIEL_MEAN_TIME = timezone(timedelta(hours=1), name='BMT')
BEAT_LENGTH = Decimal('86.4')

TIMEZONES = [tz('US/Pacific'), tz('US/Eastern'),
             tz('Etc/UTC'), BIEL_MEAN_TIME,
             tz('Asia/Tokyo'), tz('Pacific/Auckland')]

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    @app.route('/', methods=['GET'])
    def index():
        now = datetime.now(BIEL_MEAN_TIME)

        beats = ((now.hour * 3600) + (now.minute * 60) + (now.second)) / BEAT_LENGTH

        return render_template('index.html', beats=beats, datetime=now, timezones=TIMEZONES)

    @app.route('/@<int:beats>', methods=['GET'])
    def beats(beats):
        if beats > 999:
            return abort(404)

        today = date.today()

        midnight = datetime.combine(today, time(), BIEL_MEAN_TIME)

        now = midnight + timedelta(seconds=float(beats * BEAT_LENGTH))

        return render_template('reference.html', beats=beats, datetime=now, timezones=TIMEZONES)

    @app.route('/@<int:beats>.png', methods=['GET'])
    def beats_image(beats):
        if beats > 999:
            return abort(404)

        static_path = Path(app.static_folder)

        today = date.today()

        midnight = datetime.combine(today, time(), BIEL_MEAN_TIME)

        now = midnight + timedelta(seconds=float(beats * BEAT_LENGTH))

        with Image.new('RGBA', (1024, 512), '#FFFFFF') as new_image:
            drawing_context = ImageDraw.Draw(new_image)

            background_font = ImageFont.truetype(str(static_path / 'fonts/inter-v7-latin-700.ttf'), 400)
            drawing_context.text((1024, 13), "@%0.3d" % beats, fill='#E5E5E5', font=background_font, anchor='ra')

            caption_font = ImageFont.truetype(str(static_path / 'fonts/inter-v7-latin-900.ttf'), 128)
            drawing_context.text((70, 23), "@%0.3d" % beats, fill='#000000', font=caption_font)

            link_font = ImageFont.truetype(str(static_path / 'fonts/inter-v7-latin-700.ttf'), 32)
            drawing_context.text((954, 47), "internet-ti.me/@%0.3d" % beats, fill='#893ff4', font=link_font, anchor='ra')

            with Image.open(static_path / 'images/1f30e.png', 'r') as image:
                americas_emoji = image.resize((80, 80))
            new_image.alpha_composite(americas_emoji, (70, 200))

            with Image.open(static_path / 'images/1f30d.png', 'r') as image:
                europe_africa_emoji = image.resize((80, 80))
            new_image.alpha_composite(europe_africa_emoji, (70, 290))

            with Image.open(static_path / 'images/1f30f.png', 'r') as image:
                asia_oceania_emoji = image.resize((80, 80))
            new_image.alpha_composite(asia_oceania_emoji, (70, 380))

            time_font = ImageFont.truetype(str(static_path / 'fonts/inter-v7-latin-600.ttf'), 54)
            for index, zone in enumerate(TIMEZONES):
                drawing_context.text(
                    (200 + index % 2 * 360, 205 + math.floor(index / 2) * 90),
                    now.astimezone(zone).strftime('%H:%M %Z'),
                    fill='#000000', font=time_font, features=['tnum'])

            encoded_image = BytesIO()

            new_image.convert(mode='RGB').quantize().save(encoded_image, 'PNG', optimize=True)

        encoded_image.seek(0)

        return send_file(encoded_image, mimetype='image/png')

    @app.route('/<int:beats>', methods=['GET'])
    def beats_redirect(**params):
        return redirect(url_for('beats', **params))

    @app.route('/<int:beats>.png', methods=['GET'])
    def beats_image_redirect(**params):
        return redirect(url_for('beats_image', **params))

    return app

if __name__ == '__main__':
    create_app().run()

