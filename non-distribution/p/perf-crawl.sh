#!/bin/bash

cd "$(dirname "$0")/.." || exit 1

cat /dev/null > d/visited.txt
echo "https://cs.brown.edu/courses/csci1380/sandbox/3/" > d/urls.txt

MAX_URLS=${1:-0}
if ! [[ "$MAX_URLS" =~ ^-?[0-9]+$ ]]; then
  echo "Error: Argument is not a valid integer"
  exit 1
fi
CRAWLED_URLS=0
START_TIME=$(date +%s)

while read -r url; do
  if [[ "$url" == "stop" ]]; then
    # stop the engine if it sees the string "stop" 
    break;
  fi

  if [[ $CRAWLED_URLS -ge $MAX_URLS ]]; then
    break;
  fi

  if  [[ "$(cat d/visited.txt | wc -l)" -ge "$(cat d/urls.txt | wc -l)" ]]; then
      # stop the engine if it has seen all available URLs
      break;
  fi

  # echo "crawling $url">/dev/stderr
  ./crawl.sh "$url" >d/content.txt
  ((CRAWLED_URLS++))

done < <(tail -f d/urls.txt)

END_TIME=$(date +%s)
SECONDS_ELAPSED=$(( END_TIME - START_TIME ))

URLS_PER_SEC=$(awk -v a="$CRAWLED_URLS" -v b="$SECONDS_ELAPSED" 'BEGIN { print a / b }')
SECS_PER_URL=$(awk -v a="$SECONDS_ELAPSED" -v b="$CRAWLED_URLS" 'BEGIN { print a / b }')

echo "Throughput: $URLS_PER_SEC urls/sec"
echo "Latency: $SECS_PER_URL secs/url"

exit 0;