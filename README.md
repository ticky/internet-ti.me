# Internet-Ti.me

[![Deploy](https://github.com/ticky/internet-ti.me/actions/workflows/main.yml/badge.svg)](https://github.com/ticky/internet-ti.me/actions/workflows/main.yml)

[Internet Time](https://en.wikipedia.org/wiki/Swatch_Internet_Time) reference and (eventually) converter site, for planning things with your internet friends who aren't (yet) obsessed with Internet Time 😉

Link to any Internet Time by putting it after `https://internet-ti.me/` to embed a quick text and/or image reference of times around the world - like `https://internet-ti.me/@000` or `https://internet-ti.me/@420`. You can also omit the `@`, as some social networks get aggressive about username autocompletion with it.

## Why

As someone with friends across the world, and who's travelled across the date line plenty, I've long been a fan of Internet Time. I've even built [@Watch](https://at-watch.jessicastokes.net), which can put the current Internet Time on your Apple Watch face.

Not everyone thinks in Internet Time though, so they need some help!

Once I realised that `internet-ti.me` was available to buy I knew what I had to do - make a site which uses a combination of [Open Graph](https://ogp.me) and [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards) metadata to make Internet Time *embeddable* in various social and chat platforms.

## How

It's built in Flask, in part because Python has some reasonable image composition tools built-in, and because it was simple to iterate on.

Page HTML templates are processed using [Jinja2](https://jinja2docs.readthedocs.io), and preview images are generated using [Pillow](https://pillow.readthedocs.io/en/stable/).

## Development

A basic development server script is included at `bin/dev-server`. It runs on `localhost:5000`.

The project is intended to work with no dependencies other than those available out of the box on my web host, but a `requirements.txt` is provided which contains dependencies for development.
