#!/bin/bash

cd "$(dirname "$0")/.." || exit 1

MAX_URLS=100
./p/get-content.sh $MAX_URLS

INDEXED_URLS=0
START_TIME=$(date +%s)

while read -r url; do
  if [[ $INDEXED_URLS -ge $MAX_URLS ]]; then
    break;
  fi

  echo "[engine] indexing $url">/dev/stderr
  url=$(cat p/d/url_$INDEXED_URLS.txt)
  ./index.sh p/d/content_$INDEXED_URLS.txt "$url"
  ((INDEXED_URLS++))

  if  [[ "$(cat d/visited.txt | wc -l)" -ge "$(cat d/urls.txt | wc -l)" ]]; then
      # stop the engine if it has seen all available URLs
      break;
  fi

done < <(tail -f d/urls.txt)

END_TIME=$(date +%s)
SECONDS_ELAPSED=$(( END_TIME - START_TIME ))

URLS_PER_SEC=$(awk -v a="$INDEXED_URLS" -v b="$SECONDS_ELAPSED" 'BEGIN { print a / b }')
SECS_PER_URL=$(awk -v a="$SECONDS_ELAPSED" -v b="$INDEXED_URLS" 'BEGIN { print a / b }')

echo "Throughput: $URLS_PER_SEC urls/sec"
echo "Latency: $SECS_PER_URL secs/url"

./p/delete-content.sh

exit 0;