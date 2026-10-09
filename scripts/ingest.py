#!/usr/bin/env python3
"""Ingest Toronto RentSafeTO Apartment Building Evaluation + Registration data
for the Landlord Operator Index.

Sources (retrieved 2026-10-09, Toronto Open Data, Open Government Licence - Toronto):
  evals: CKAN datastore resource 244f7a02-da5c-425b-b55f-fbdd133dd732
         "Apartment Building Evaluations 2023 - current", refreshed 2026-10-08
  regs:  CKAN datastore resource 3ad76a8c-0518-4df2-b94e-8c747d62f8c1
         "Apartment Building Registration Data", refreshed 2026-07-05

Pipeline:
  1. Download both tables via the CKAN datastore API (data/raw/, cached).
  2. Dedup evaluations to the latest per RSN (by EVALUATION COMPLETED ON, then _id).
  3. Join to registrations on RSN; unmatched counts reported, not hidden.
  4. Normalize operator names (PROP_MANAGEMENT_COMPANY_NAME) into canonical
     entities; publish the full variant mapping table.
  5. Compute per-operator stats: red/yellow/green counts, avg score, total units.
  6. Write data/*.json (committed) + public/data/* (downloads + API serving).

HARD RULE: the source identifies the property MANAGEMENT company, not the legal
owner. Output is labeled operator-level everywhere.
"""

import csv
import json
import os
import re
import time
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from difflib import SequenceMatcher

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(HERE, "data", "raw")
DATA = os.path.join(HERE, "data")
PUB = os.path.join(HERE, "public", "data")
API = "https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search"

EVAL_RID = "244f7a02-da5c-425b-b55f-fbdd133dd732"
REG_RID = "3ad76a8c-0518-4df2-b94e-8c747d62f8c1"
RETRIEVED = "2026-10-09"
EVAL_VINTAGE = "2026-10-08"
REG_VINTAGE = "2026-07-05"

EVAL_FIELDS = ["_id", "RSN", "SITE ADDRESS", "YEAR EVALUATED",
               "EVALUATION COMPLETED ON", "CURRENT BUILDING EVAL SCORE",
               "PROACTIVE BUILDING SCORE", "CURRENT REACTIVE SCORE",
               "CONFIRMED UNITS", "WARD", "LATITUDE", "LONGITUDE",
               "YEAR BUILT", "PROPERTY TYPE"]
REG_FIELDS = ["RSN", "SITE_ADDRESS", "PROP_MANAGEMENT_COMPANY_NAME",
              "CONFIRMED_UNITS", "WARD", "YEAR_BUILT"]

LEGAL_SUFFIXES = {
    "LTD", "LIMITED", "INC", "INCORPORATED", "CORP", "CORPORATION",
    "CO", "COMPANY", "LLC", "LLP", "LP", "PLC", "ULC", "LTEE",
    "LIMITEE", "GESTION", "MANAGEMENT",
}


def fetch_all(rid, fields):
    os.makedirs(RAW, exist_ok=True)
    cache = os.path.join(RAW, f"{rid}.json")
    if os.path.exists(cache):
        with open(cache) as f:
            return json.load(f)
    recs = []
    offset = 0
    while True:
        qs = urllib.parse.urlencode(
            {"resource_id": rid, "limit": 1000, "offset": offset,
             "fields": ",".join(fields)})
        req = urllib.request.Request(
            API + "?" + qs, headers={"User-Agent": "Mozilla/5.0"})
        for attempt in range(6):
            try:
                with urllib.request.urlopen(req, timeout=60) as resp:
                    r = json.load(resp)
                break
            except Exception as e:
                print(f"  fetch {rid} offset {offset} attempt {attempt+1}: {e}")
                time.sleep(4 * (attempt + 1))
        else:
            raise RuntimeError(f"failed to fetch {rid} offset {offset}")
        page = r["result"]["records"]
        recs.extend(page)
        total = r["result"]["total"]
        offset += len(page)
        print(f"  {rid}: {len(recs)}/{total}")
        if offset >= total:
            break
    with open(cache, "w") as f:
        json.dump(recs, f)
    return recs


def parse_score(v):
    if v is None:
        return None
    s = str(v).strip().rstrip("%").strip()
    try:
        return float(s)
    except ValueError:
        return None


def door_sign(score):
    if score is None:
        return "unknown"
    if score >= 85:
        return "green"
    if score >= 70:
        return "yellow"
    return "red"


def normalize_name(name):
    n = (name or "").upper()
    n = n.replace("&", " AND ")
    n = re.sub(r"[^A-Z0-9 ]", " ", n)
    toks = [t for t in n.split() if t]
    toks = [t for t in toks if t not in LEGAL_SUFFIXES]
    return " ".join(toks)


def to_int(v):
    try:
        return int(float(v)) if v not in (None, "") else None
    except (TypeError, ValueError):
        return None


def main():
    print("fetching evaluations...")
    evals = fetch_all(EVAL_RID, EVAL_FIELDS)
    print("fetching registrations...")
    regs = fetch_all(REG_RID, REG_FIELDS)
    print(f"raw rows: evals={len(evals)} regs={len(regs)}")

    # Dedup evals: latest per RSN
    latest = {}
    for e in evals:
        rsn = e.get("RSN")
        if rsn is None:
            continue
        rsn = int(rsn)
        key = (str(e.get("EVALUATION COMPLETED ON") or ""),
               int(e.get("_id") or 0))
        if rsn not in latest or key > latest[rsn][0]:
            latest[rsn] = (key, e)
    print(f"unique buildings evaluated: {len(latest)}")

    # Registration lookup by RSN
    reg_by_rsn = {}
    for r in regs:
        rsn = r.get("RSN")
        if rsn is not None:
            reg_by_rsn[int(rsn)] = r

    buildings = []
    matched_rsn = 0
    for rsn, (_, e) in sorted(latest.items()):
        score = parse_score(e.get("CURRENT BUILDING EVAL SCORE"))
        reg = reg_by_rsn.get(rsn)
        raw_op = (reg or {}).get("PROP_MANAGEMENT_COMPANY_NAME")
        raw_op = raw_op.strip() if raw_op and str(raw_op).strip() else None
        if reg is not None:
            matched_rsn += 1
        buildings.append({
            "rsn": rsn,
            "address": (e.get("SITE ADDRESS") or "").strip(),
            "ward": (e.get("WARD") or "").strip(),
            "year_built": to_int(e.get("YEAR BUILT")),
            "units": to_int(e.get("CONFIRMED UNITS")),
            "year_evaluated": to_int(e.get("YEAR EVALUATED")),
            "evaluated_on": e.get("EVALUATION COMPLETED ON"),
            "score": score,
            "proactive_score": parse_score(e.get("PROACTIVE BUILDING SCORE")),
            "reactive_score": parse_score(e.get("CURRENT REACTIVE SCORE")),
            "sign": door_sign(score),
            "lat": e.get("LATITUDE"), "lon": e.get("LONGITUDE"),
            "operator_raw": raw_op,
        })

    scored = [b for b in buildings if b["score"] is not None]
    print(f"joined on RSN: {matched_rsn}/{len(buildings)}; scored: {len(scored)}")

    # Operator name normalization
    raw_names = [b["operator_raw"] for b in buildings if b["operator_raw"]]
    keys = {}
    for n in set(raw_names):
        keys[n] = normalize_name(n)

    # Union-find merge: fuzzy >= 0.93 and same first token
    uniq_keys = list(set(keys.values()) - {""})
    parent = {k: k for k in uniq_keys}

    def find(k):
        while parent[k] != k:
            parent[k] = parent[parent[k]]
            k = parent[k]
        return k

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    merges = []
    for i, a in enumerate(uniq_keys):
        ta = a.split()[0] if a.split() else ""
        for b in uniq_keys[i + 1:]:
            if not ta or ta != (b.split()[0] if b.split() else ""):
                continue
            if SequenceMatcher(None, a, b).ratio() >= 0.93:
                union(a, b)
                merges.append((a, b))

    clusters = defaultdict(list)
    for raw, k in keys.items():
        if not k:
            continue
        clusters[find(k)].append(raw)

    # Canonical name = most frequent raw variant; id by building count desc
    freq = Counter(raw_names)
    canon = {}
    for cl, variants in clusters.items():
        canon[cl] = max(variants, key=lambda v: (freq[v], len(v)))

    op_buildings = defaultdict(list)
    blank_count = 0
    for b in buildings:
        raw = b["operator_raw"]
        if not raw:
            blank_count += 1
            b["operator_id"] = "unattributed"
            b["operator_name"] = None
        else:
            cl = find(keys[raw])
            b["operator_id"] = "op" + str(abs(hash(cl)) % 10**8).zfill(8)[:8]
            b["operator_name"] = canon[cl]
        op_buildings[b["operator_id"]].append(b)

    # stable deterministic ids; "unattributed" is a counted bucket, not a company
    ids = sorted((oid for oid in op_buildings.keys() if oid != "unattributed"),
                 key=lambda oid: (
        -sum(1 for b in op_buildings[oid] if b["sign"] == "red"),
        -len(op_buildings[oid])))
    idmap = {old: f"OP{i+1:04d}" for i, old in enumerate(ids)}
    for b in buildings:
        if b["operator_id"] != "unattributed":
            b["operator_id"] = idmap[b["operator_id"]]

    operators = []
    for old in ids:
        new = idmap[old]
        bs = op_buildings[old]
        name = bs[0]["operator_name"]
        scores = [b["score"] for b in bs if b["score"] is not None]
        units = [b["units"] for b in bs if b["units"]]
        red = sum(1 for b in bs if b["sign"] == "red")
        yellow = sum(1 for b in bs if b["sign"] == "yellow")
        green = sum(1 for b in bs if b["sign"] == "green")
        n = len(bs)
        operators.append({
            "id": new,
            "name": name,
            "buildings": n,
            "red": red, "yellow": yellow, "green": green,
            "avg_score": round(sum(scores) / len(scores), 1) if scores else None,
            "scored_buildings": len(scores),
            "total_units": sum(units) if units else None,
            "share_red": round(red / n, 3) if n else 0,
            "share_red_yellow": round((red + yellow) / n, 3) if n else 0,
        })
    operators.sort(key=lambda o: (-o["red"], -o["buildings"]))

    os.makedirs(DATA, exist_ok=True)
    os.makedirs(PUB, exist_ok=True)
    with open(f"{DATA}/operators.json", "w") as f:
        json.dump(operators, f, indent=2)
    with open(f"{DATA}/buildings.json", "w") as f:
        json.dump(buildings, f, indent=2)
    with open(f"{DATA}/operator_name_map.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["raw_variant", "operator_id", "canonical_name"])
        for raw in sorted(set(raw_names)):
            cl = find(keys[raw])
            w.writerow([raw, idmap.get("op" + str(abs(hash(cl)) % 10**8).zfill(8)[:8], ""), canon[cl]])
    summary = {
        "retrieved": RETRIEVED,
        "eval_vintage": EVAL_VINTAGE,
        "registration_vintage": REG_VINTAGE,
        "eval_raw_rows": len(evals),
        "unique_buildings_evaluated": len(latest),
        "joined_on_rsn": matched_rsn,
        "buildings_in_index": len(buildings),
        "scored_buildings": len(scored),
        "operators": len(operators),
        "blank_operator_name_rows": blank_count,
        "fuzzy_merges_logged": len(merges),
        "sources": [
            {"name": "Apartment Building Evaluation",
             "url": "https://open.toronto.ca/dataset/apartment-building-evaluation/"},
            {"name": "Apartment Building Registration",
             "url": "https://open.toronto.ca/dataset/apartment-building-registration/"},
        ],
        "notes": [
            "Operator = property management company from the registration file, "
            "not the legal owner.",
            "Evaluations deduped to latest per RSN (building registration number).",
            "Door-sign bands: green 85-100%, yellow 70-84%, red 0-69%.",
            "Blank management-company names are kept as 'unattributed', counted here, "
            "and shown separately; they are not dropped.",
        ],
    }
    with open(f"{DATA}/summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    with open(f"{DATA}/operator_merges.json", "w") as f:
        json.dump([{"a": a, "b": b} for a, b in merges], f, indent=2)

    # public copies
    for fn in ["operators.json", "buildings.json", "summary.json",
               "operator_name_map.csv"]:
        with open(f"{DATA}/{fn}") as f:
            content = f.read()
        with open(f"{PUB}/{fn}", "w") as f:
            f.write(content)
    # CSV downloads
    with open(f"{PUB}/operators.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["operator_id", "name", "buildings", "red", "yellow",
                    "green", "avg_score", "total_units", "share_red",
                    "share_red_yellow"])
        for o in operators:
            w.writerow([o["id"], o["name"], o["buildings"], o["red"],
                        o["yellow"], o["green"], o["avg_score"],
                        o["total_units"], o["share_red"],
                        o["share_red_yellow"]])
    with open(f"{PUB}/buildings.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["rsn", "address", "ward", "year_built", "units",
                    "year_evaluated", "evaluated_on", "score", "door_sign",
                    "operator_id", "operator_name"])
        for b in buildings:
            w.writerow([b["rsn"], b["address"], b["ward"], b["year_built"],
                        b["units"], b["year_evaluated"], b["evaluated_on"],
                        b["score"], b["sign"], b["operator_id"],
                        b["operator_name"]])

    print(json.dumps({k: v for k, v in summary.items()
                      if k != "sources" and k != "notes"}, indent=2))
    print("top 10 operators by red count:")
    for o in operators[:10]:
        print(f"  {o['name']}: {o['red']} red / {o['buildings']} bldgs, "
              f"avg {o['avg_score']}, {o['total_units']} units")


if __name__ == "__main__":
    main()
