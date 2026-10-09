#!/usr/bin/env python3
"""Screenshot recipe per AGENTS.md: Playwright + page.set_content() with the
Next CSS bundle inlined as <style>. HTML fetched from the local Next server
via requests (no loopback Chromium navigation needed)."""
import glob
import io
import os
import re
import sys

import requests
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "docs", "screenshots")
BASE = "http://127.0.0.1:3000"

os.makedirs(OUT, exist_ok=True)


def render(path="/"):
    html = requests.get(BASE + path, timeout=30).text
    css_files = glob.glob(os.path.join(ROOT, ".next", "static", "**", "*.css"), recursive=True)
    css = "\n".join(open(f).read() for f in css_files)
    # inline the css, strip external font css links (fonts still load via https in real browsers)
    html = html.replace("</head>", f"<style>{css}</style></head>")
    # remove preload/script tags that would fail under set_content
    html = re.sub(r'<script[^>]*src="[^"]*"[^>]*></script>', "", html)
    html = re.sub(r'<script[^>]*>.*?</script>', "", html, flags=re.S)
    return html


def shots():
    html_en = render("/")
    with sync_playwright() as p:
        b = p.chromium.launch()
        # Desktop
        pg = b.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.set_content(html_en, wait_until="load")
        pg.wait_for_timeout(1200)
        full = pg.screenshot(full_page=True)
        img = Image.open(io.BytesIO(full))
        print("desktop full page:", img.size)
        img.crop((0, 0, 1440, 1100)).save(f"{OUT}/desktop-hero.png")
        # find ranking section: crop a band lower down
        img.crop((0, 1500, 1440, 2600)).save(f"{OUT}/desktop-ranking.png")
        img.crop((0, 2900, 1440, 4000)).save(f"{OUT}/desktop-map.png")
        print("console errors (desktop):", errors)
        # Mobile
        m = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        merrs = []
        m.on("console", lambda msg: merrs.append(msg.text) if msg.type == "error" else None)
        m.on("pageerror", lambda e: merrs.append(str(e)))
        m.set_content(html_en, wait_until="load")
        m.wait_for_timeout(1200)
        mfull = m.screenshot(full_page=True)
        mimg = Image.open(io.BytesIO(mfull))
        print("mobile full page:", mimg.size)
        mimg.crop((0, 0, 780, 2400)).save(f"{OUT}/mobile-hero.png")
        print("console errors (mobile):", merrs)
        b.close()


if __name__ == "__main__":
    shots()
