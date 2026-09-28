#!/usr/bin/env bash
# Snapshot a case study before editing it, so edits make a new version instead of overwriting.
#
#   scripts/version-study.sh <project> ["note"]
#
# Copies src/content/work/<project>/*.md into _versions/v<N>-<YYYY-MM-DD>/ (N = next number),
# writes VERSION.md with the note, and bumps `version:` + `updated:` in index.md.
# _versions/ is outside the content-collection globs (they match one level deep), so snapshots
# never render; they are committed with the site as the study's history.
set -euo pipefail

project="${1:-}"; note="${2:-}"
[ -n "$project" ] || { echo "usage: $0 <project> [note]" >&2; exit 1; }
dir="src/content/work/$project"
[ -f "$dir/index.md" ] || { echo "no study at $dir" >&2; exit 1; }

today="$(date +%F)"
# The snapshot's number is the working copy's current version: `version:` in index.md if set,
# otherwise one past the highest existing snapshot, otherwise 1.
current="$(sed -nE 's/^version: *([0-9]+).*/\1/p' "$dir/index.md" | head -1)"
last="$( { ls -d "$dir"/_versions/v*/ 2>/dev/null || true; } | sed -E 's#.*/v([0-9]+)-.*#\1#' | sort -n | tail -1)"
if [ -n "$current" ]; then n=$current; elif [ -n "$last" ]; then n=$(( last + 1 )); else n=1; fi
snap="$dir/_versions/v${n}-${today}"
[ ! -e "$snap" ] || { echo "$snap already exists" >&2; exit 1; }

mkdir -p "$snap"
cp "$dir"/*.md "$snap/"
printf '# %s — v%s\n\nSnapshot taken: %s\nNote: %s\n\nFiles:\n' "$project" "$n" "$today" "${note:-—}" > "$snap/VERSION.md"
( cd "$snap" && wc -w *.md | grep -v VERSION.md | sed 's/^/  /' ) >> "$snap/VERSION.md"

next=$(( n + 1 ))
if grep -qE '^version:' "$dir/index.md"; then
  sed -i.bak -E "s/^version: *[0-9]+.*/version: $next/; s/^updated: *.*/updated: $today/" "$dir/index.md" && rm -f "$dir/index.md.bak"
else
  # insert after the `order:` line so the frontmatter stays readable
  sed -i.bak -E "s/^(order: .*)$/\1\nversion: $next\nupdated: $today/" "$dir/index.md" && rm -f "$dir/index.md.bak"
fi
echo "snapshot: $snap  (v$n)"
echo "editing:  $dir  is now v$next — edit freely"
