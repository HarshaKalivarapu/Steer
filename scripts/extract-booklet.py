"""
Extract the booklet's text layer into docs/booklet.md.

The Ohio driver manual PDF carries a real text layer, so this costs nothing and is exact —
no OCR, and no chance of a misread digit turning into a wrong answer on a practice test.

    npm run extract

If you ever swap in a booklet that is a *scan* (no text layer), this script will say so and
you want `npm run extract:ocr` instead, which pays a model to read the pages.

Requires: pip install pypdf cryptography
"""

from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    sys.exit("pypdf is not installed. Run: pip install pypdf cryptography")

DOCS = Path("docs")
OUT = DOCS / "booklet.md"

# Which PDF to read. The other files in docs/ are kept for reference but unused.
SOURCE_HINT = "oh.car.en"

# Glyphs from symbol fonts that pdf extraction leaves in the private-use range.
PRIVATE_USE_BULLETS = {"", "", "", ""}

# Some captions are set in a display font whose codepoints sit 29 below ASCII, so
# "52$':$<" is really "ROADWAY". Only runs containing \x03 are affected; ordinary text
# that merely looks similar (dollar amounts, "$150", BAC figures like ".08%") is not.
SHIFT = 29


def decode_shifted(match: re.Match[str]) -> str:
    run = match.group(0)
    if "\x03" not in run:
        return run
    out = []
    for ch in run:
        code = ord(ch)
        if code == 3:
            out.append(" ")
        elif 33 <= code <= 62:
            out.append(chr(code + SHIFT))
        else:
            out.append(ch)
    return "".join(out)


def clean(text: str) -> str:
    # Display-font captions back into readable words.
    text = re.sub(r"[\x21-\x3e\x03]{3,}(?:\s+[\x21-\x3e\x03]{2,})*", decode_shifted, text)

    for glyph in PRIVATE_USE_BULLETS:
        text = text.replace(glyph, "•")

    # Kerning artefacts where the extractor split a word after its first letter.
    text = re.sub(r"\bY (ou|our)\b", r"Y\1", text)

    # Any remaining control or private-use characters carry no meaning.
    text = "".join(
        ch for ch in text if ch in "\n\t" or unicodedata.category(ch) not in {"Cc", "Co"}
    )

    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def main() -> None:
    pdfs = sorted(DOCS.glob("*.pdf"))
    if not pdfs:
        sys.exit("No PDF in docs/.")

    chosen = next((p for p in pdfs if SOURCE_HINT in p.name), None)
    if chosen is None:
        sys.exit(
            f"No PDF matching {SOURCE_HINT!r} in docs/. Found: "
            + ", ".join(p.name for p in pdfs)
            + "\nEdit SOURCE_HINT in this script to pick a different one."
        )

    reader = PdfReader(chosen)
    pages = []
    empty = 0
    for i, page in enumerate(reader.pages, start=1):
        body = clean(page.extract_text() or "")
        if not body:
            empty += 1
        pages.append(f"<!-- page {i} -->\n\n{body}")

    if empty > len(reader.pages) / 2:
        sys.exit(
            f"{empty} of {len(reader.pages)} pages had no text layer. This looks like a "
            "scan — use `npm run extract:ocr` instead."
        )

    doc = f"# {chosen.stem}\n\n" + "\n\n".join(pages) + "\n"
    OUT.write_text(doc, encoding="utf-8")

    words = len(doc.split())
    print(f"source : {chosen.name}")
    print(f"pages  : {len(reader.pages)} ({empty} without text)")
    print(f"words  : {words:,}  (~{round(words * 1.35 / 1000)}k tokens)")
    print(f"wrote  : {OUT}")
    print("cost   : $0.00 — read straight from the text layer")


if __name__ == "__main__":
    main()
