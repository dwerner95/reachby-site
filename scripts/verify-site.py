#!/usr/bin/env python3
"""Verify the dependency-free ReachBy public website."""

from __future__ import annotations

import hashlib
import re
import struct
from html.parser import HTMLParser
from pathlib import Path
from typing import NoReturn


ROOT = Path(__file__).resolve().parents[1]
LANDING = ROOT
EXPECTED_FILES = frozenset(
    {
        "AGENTS.md",
        "CNAME",
        "README.md",
        "assets/maya-traveller-story.webp",
        "assets/reachby-logo-primary.png",
        "index.html",
        "public/og.png",
        "scripts/verify-site.py",
        "styles.css",
    }
)
ASSET_HASHES = {
    "assets/maya-traveller-story.webp": (
        "750f99f85520ae230b797d4d8b9374aeae8e73b2f30ea054794d85b8917f36e8"
    ),
    "assets/reachby-logo-primary.png": (
        "294c9b643014d13b3f110bc724fcc7036653ac0d0e293d7564a3293886c02485"
    ),
}
IGNORED_DIRECTORIES = frozenset({".git"})
FORBIDDEN_PUBLIC_COPY = (
    "send your journey",
    "journey-request",
    "human proof",
    "prepared individually",
    "we will send it back",
    "prototype",
)


class LandingParser(HTMLParser):
    """Collect executable, navigational, and asset surfaces from the page."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.forms = 0
        self.inputs = 0
        self.scripts = 0
        self.ids: set[str] = set()
        self.hrefs: list[str] = []
        self.sources: list[str] = []
        self.csp: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "form":
            self.forms += 1
        if tag in {"input", "textarea", "select", "button"}:
            self.inputs += 1
        if tag == "script":
            self.scripts += 1
        identifier = values.get("id")
        if identifier:
            self.ids.add(identifier)
        href = values.get("href")
        if href:
            self.hrefs.append(href)
        source = values.get("src")
        if source:
            self.sources.append(source)
        if tag == "meta" and values.get("http-equiv", "").casefold() == "content-security-policy":
            content = values.get("content")
            if content:
                self.csp.append(content)


def reject(message: str) -> NoReturn:
    """Terminate with one stable landing-gate diagnostic."""

    raise SystemExit(f"site verification failed: {message}")


def bounded_text(path: Path, maximum: int = 512 * 1024) -> str:
    """Read one regular bounded UTF-8 source file."""

    if path.is_symlink() or not path.is_file() or path.stat().st_size > maximum:
        reject(f"unsafe or oversized file: {path.relative_to(ROOT)}")
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as error:
        reject(f"cannot read UTF-8 file {path.relative_to(ROOT)}: {error}")


def verify_inventory() -> None:
    """Keep the deployable directory closed over reviewed regular files."""

    actual = {
        path.relative_to(LANDING).as_posix()
        for path in LANDING.rglob("*")
        if path.is_file() or path.is_symlink()
        if not any(
            part in IGNORED_DIRECTORIES
            for part in path.relative_to(LANDING).parts
        )
    }
    if actual != EXPECTED_FILES:
        reject(f"file inventory changed: expected {sorted(EXPECTED_FILES)}, got {sorted(actual)}")
    if bounded_text(LANDING / "CNAME", 128).strip() != "reachby.app":
        reject("CNAME must contain only reachby.app")
    for relative, expected in ASSET_HASHES.items():
        path = LANDING / relative
        if path.is_symlink() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            reject(f"reviewed asset hash changed: {relative}")
    og = LANDING / "public/og.png"
    payload = og.read_bytes()
    if og.is_symlink() or len(payload) > 5 * 1024 * 1024 or payload[:8] != b"\x89PNG\r\n\x1a\n":
        reject("social image is missing, unsafe, oversized, or not PNG")
    if struct.unpack(">II", payload[16:24]) != (1731, 909):
        reject("social image dimensions differ from the reviewed metadata")


def verify_page(index: str, styles: str, readme: str) -> None:
    """Verify messaging, links, assets, and the zero-execution boundary."""

    parser = LandingParser()
    parser.feed(index)
    parser.close()
    if parser.forms or parser.inputs or parser.scripts:
        reject("the informational page must contain no form control or script")
    if len(parser.csp) != 1:
        reject("the page needs exactly one CSP meta policy")
    required_csp = (
        "default-src 'self'",
        "connect-src 'none'",
        "form-action 'none'",
        "script-src 'none'",
        "object-src 'none'",
        "base-uri 'none'",
    )
    if any(directive not in parser.csp[0] for directive in required_csp):
        reject("the landing CSP does not preserve its closed browser boundary")
    required_ids = {"main-content", "top", "why", "journey", "approach"}
    if not required_ids.issubset(parser.ids):
        reject("the landing navigation targets are incomplete")
    for href in parser.hrefs:
        if href.startswith("#"):
            if href[1:] and href[1:] not in parser.ids:
                reject(f"fragment target does not exist: {href}")
        elif href in {"assets/reachby-logo-primary.png", "styles.css"} or href.startswith("mailto:dominik@reachby.app"):
            continue
        else:
            reject(f"undeclared link target: {href}")
    if set(parser.sources) != {
        "assets/maya-traveller-story.webp",
        "assets/reachby-logo-primary.png",
    }:
        reject("image sources changed outside the reviewed local asset set")
    normalized = re.sub(r"\s+", " ", index).casefold()
    required_copy = (
        "where do you need to be",
        "the whole journey, sorted",
        "true cost",
        "total time",
        "real connection risk",
        "illustrative experience",
        "public journey search is coming later",
        "does not currently sell tickets or take transport payments",
    )
    for phrase in required_copy:
        if phrase not in normalized:
            reject(f"required product or boundary copy is missing: {phrase}")
    for phrase in FORBIDDEN_PUBLIC_COPY:
        if phrase in normalized:
            reject(f"retired or misleading public copy remains: {phrase}")
    if "not a live result or recommendation" not in readme.casefold():
        reject("implementation boundary is missing from the landing README")
    if re.search(r"(?:https?:)?//|@import|url\s*\(", styles, re.IGNORECASE):
        reject("landing CSS must not load a remote or dynamic resource")
    for token in ("#11182d", "#4c5cff", "#c9f23b", "#f4f6fa", "#ff6d5f", "#596176"):
        if token not in styles.casefold():
            reject(f"approved brand token is missing: {token}")
    if "<script" in index.casefold() or "javascript:" in index.casefold():
        reject("landing markup contains an executable script surface")
    canonical_social_image = "https" + "://reachby.app/public/og.png"
    if canonical_social_image not in index:
        reject("social image metadata does not use the canonical domain")


def main() -> int:
    """Run the complete offline GitHub Pages verification."""

    verify_inventory()
    verify_page(
        bounded_text(LANDING / "index.html"),
        bounded_text(LANDING / "styles.css"),
        bounded_text(LANDING / "README.md"),
    )
    print("ReachBy public website verification passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
