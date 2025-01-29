#!/bin/bash

cd "$(dirname "$0")/.." || exit 1

MAX_URLS=${1:-0}
if ! [[ "$MAX_URLS" =~ ^-?[0-9]+$ ]]; then
  echo "Error: Argument is not a valid integer"
  exit 1
fi
./p/get-content.sh $MAX_URLS

INDEXED_URLS=0
START_TIME=$(date +%s)

while [[ $INDEXED_URLS -lt $MAX_URLS ]]; do
  url=$(cat "p/d/url_$INDEXED_URLS.txt")
  # echo "indexing $url"
  ./index.sh "p/d/content_$INDEXED_URLS.txt" "$url"
  ((INDEXED_URLS++))
done

END_TIME=$(date +%s)
SECONDS_ELAPSED=$(( END_TIME - START_TIME ))

URLS_PER_SEC=$(awk -v a="$INDEXED_URLS" -v b="$SECONDS_ELAPSED" 'BEGIN { print a / b }')
SECS_PER_URL=$(awk -v a="$SECONDS_ELAPSED" -v b="$INDEXED_URLS" 'BEGIN { print a / b }')

echo "Throughput: $URLS_PER_SEC urls/sec"
echo "Latency: $SECS_PER_URL secs/url"

./p/delete.sh

exit 0;