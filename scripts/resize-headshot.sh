#!/usr/bin/env bash
# One-off: resize an oversized guest headshot stored in DB as base64 data URL.
# Usage: GUEST_ID=guest_aosei ./resize-headshot.sh
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must be set}"
: "${GUEST_ID:?GUEST_ID must be set}"

WORK=$(mktemp -d)
trap "rm -rf $WORK" EXIT

echo "Extracting headshot for $GUEST_ID..."
psql "$DATABASE_URL" -tA -c "SELECT headshot FROM guests WHERE id = '$GUEST_ID';" > "$WORK/dataurl.txt"

MIME=$(head -c 200 "$WORK/dataurl.txt" | sed -E 's|^data:([^;]+);base64,.*|\1|')
echo "MIME: $MIME"

sed -E 's|^data:[^,]+,||' "$WORK/dataurl.txt" | base64 -D > "$WORK/orig.jpg"
ORIG_BYTES=$(wc -c < "$WORK/orig.jpg" | tr -d ' ')
echo "Original size: $ORIG_BYTES bytes"

BACKUP_DIR="$(dirname "$0")/backup-headshots"
mkdir -p "$BACKUP_DIR"
cp "$WORK/orig.jpg" "$BACKUP_DIR/$GUEST_ID-original.jpg"
echo "Backed up to $BACKUP_DIR/$GUEST_ID-original.jpg"

sips --resampleHeightWidthMax 384 -s format jpeg -s formatOptions 80 \
  "$WORK/orig.jpg" --out "$WORK/resized.jpg" >/dev/null
NEW_BYTES=$(wc -c < "$WORK/resized.jpg" | tr -d ' ')
echo "Resized size: $NEW_BYTES bytes ($(( NEW_BYTES * 100 / ORIG_BYTES ))% of original)"

# Build the data URL and write it to a file that psql can read via :'var'
{
  printf 'data:image/jpeg;base64,'
  base64 -i "$WORK/resized.jpg" | tr -d '\n'
} > "$WORK/dataurl-new.txt"

# Use a SQL file with \set ... `cat ...` so psql expands it at parse time.
cat > "$WORK/update.sql" <<SQL
\set dataurl \`cat $WORK/dataurl-new.txt\`
UPDATE guests SET headshot = :'dataurl' WHERE id = '$GUEST_ID';
SELECT id, name, octet_length(headshot) AS bytes FROM guests WHERE id = '$GUEST_ID';
SQL

psql "$DATABASE_URL" -f "$WORK/update.sql"

echo "Done."
