#!/usr/bin/env python3
"""Decode a base64 data-URL PNG captured via javascript_tool's saved JSON file."""
import sys, json, base64

src_path, out_path = sys.argv[1], sys.argv[2]
with open(src_path) as f:
    data = json.load(f)
text = data[0]["text"]
b64 = text.split(",", 1)[1].rstrip('"')
with open(out_path, "wb") as f:
    f.write(base64.b64decode(b64))
print(f"wrote {out_path}")
