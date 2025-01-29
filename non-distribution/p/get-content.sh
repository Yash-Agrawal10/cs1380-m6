#!/bin/bash

cd "$(dirname "$0")/.." || exit 1

cat /dev/null > d/visited.txt
cat "./p/d/crawl_urls.txt" > d/urls.txt

URLS=${1:-0}
if ! [[ "$URLS" =~ ^-?[0-9]+$ ]]; then
  echo "Error: Argument is not a valid integer"
  exit 1
fi
CRAWLED_URLS=0

while read -r url; do
  if [[ "$url" == "stop" ]]; then
    # stop the engine if it sees the string "stop" 
    break;
  fi

  if [[ $CRAWLED_URLS -ge $URLS ]]; then
    break;
  fi

  echo "[engine] crawling $url">/dev/stderr
  ./crawl.sh "$url" >"p/d/content_$CRAWLED_URLS.txt"
  echo "$url" >"p/d/url_$CRAWLED_URLS.txt"
  ((CRAWLED_URLS++))

  if  [[ "$(cat d/visited.txt | wc -l)" -ge "$(cat d/urls.txt | wc -l)" ]]; then
      # stop the engine if it has seen all available URLs
      break;
  fi

done < <(tail -f d/urls.txt)

exit 0;