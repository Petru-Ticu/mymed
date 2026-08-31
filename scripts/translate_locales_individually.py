#!/usr/bin/env python3
import html
import json
import random
import re
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "i18n"
LOCALES = ROOT / "locales"
CODES = (
    "zh-CN zh-TW ar ja ko hi tr id th vi nl sv no da fi pl uk hu cs sk sl el fa ur"
).split()
RESULT_RE = re.compile(r'<div class="result-container">(.*?)</div>', re.S)
TAG_RE = re.compile(r"<[^>]+>")
PLACEHOLDER_RE = re.compile(r"\{[^{}]+\}")
FIXED_TERMS = ("myMed", "mcg/µg", "IU", "mg", "ml", "INR", "mEq", "mmol")
NODE_CATALOG_SCRIPT = r"""
const fs = require("fs");
const source = fs.readFileSync("src/i18n/en.js", "utf8");
const catalog = new Function(source.replace("export default", "return"))();
const result = {};
function flatten(value, prefix = "") {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object") flatten(child, path);
    else result[path] = child;
  }
}
flatten(catalog);
process.stdout.write(JSON.stringify(result));
"""


def flatten(value, prefix=""):
    result = {}
    for key, child in value.items():
        path = f"{prefix}.{key}" if prefix else key
        if isinstance(child, dict):
            result.update(flatten(child, path))
        else:
            result[path] = child
    return result


def unflatten(values):
    result = {}
    for path, value in values.items():
        current = result
        parts = path.split(".")
        for part in parts[:-1]:
            current = current.setdefault(part, {})
        current[parts[-1]] = value
    return result


def source_for_translation(key, value):
    if key == "nav.analytics":
        return "My analytics"
    if key == "nav.meds":
        return "My medicines"
    if value == "OK":
        return "Confirm"
    return value


def valid_translation(source, translated):
    if sorted(PLACEHOLDER_RE.findall(source)) != sorted(PLACEHOLDER_RE.findall(translated)):
        return False
    if source.count("\n") != translated.count("\n"):
        return False
    for term in FIXED_TERMS:
        if source.count(term) != translated.count(term):
            return False
    return True


def request_translation(language, source):
    query = urllib.parse.urlencode({"sl": "en", "tl": language, "q": source})
    request = urllib.request.Request(
        f"https://translate.google.com/m?{query}",
        headers={"User-Agent": "Mozilla/5.0"},
    )
    for attempt in range(9):
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                page = response.read().decode("utf-8")
            match = RESULT_RE.search(page)
            if not match:
                raise RuntimeError("missing result")
            value = match.group(1)
            value = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
            value = html.unescape(TAG_RE.sub("", value)).strip(" \t\r")
            if not valid_translation(source, value):
                raise RuntimeError("tokens or line breaks changed")
            return value
        except (urllib.error.URLError, TimeoutError, RuntimeError) as error:
            if attempt == 8:
                raise RuntimeError(f"{language}: {source!r}: {error}") from error
            time.sleep(min(30, (1.7 ** attempt) + random.random()))


def main():
    source = json.loads(
        subprocess.check_output(
            ["node", "-e", NODE_CATALOG_SCRIPT],
            cwd=ROOT.parents[1],
            text=True,
        )
    )
    jobs = {}
    translated = {code: {} for code in CODES}
    with ThreadPoolExecutor(max_workers=12) as executor:
        for code in CODES:
            for key, value in source.items():
                text = source_for_translation(key, value)
                future = executor.submit(request_translation, code, text)
                jobs[future] = (code, key)

        done = 0
        for future in as_completed(jobs):
            code, key = jobs[future]
            translated[code][key] = future.result()
            done += 1
            if done % 225 == 0:
                print(f"translated {done}/{len(jobs)}", flush=True)

    for code in CODES:
        ordered = {key: translated[code][key] for key in source}
        path = LOCALES / f"{code}.json"
        path.write_text(
            json.dumps(unflatten(ordered), ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"wrote {path.name}", flush=True)
    print(f"complete: {len(CODES)} files, {len(source)} leaf keys each")


if __name__ == "__main__":
    main()
