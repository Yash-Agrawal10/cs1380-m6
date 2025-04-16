#!/bin/bash

cd "$(dirname "$0")/.." || exit 1

cat /dev/null > d/global-index.txt

URLS=${1:-0}
if ! [[ "$URLS" =~ ^-?[0-9]+$ ]]; then
  echo "Error: Argument is not a valid integer"
  exit 1
fi

if [[ $URLS -eq 0 ]]; then
  echo "Can't get index of zero URLS"
  exit 1
fi

./p/get-content.sh "$URLS"

INDEXED_URLS=0

while [[ $INDEXED_URLS -lt $URLS ]]; do
  url=$(cat "p/d/url_$INDEXED_URLS.txt")
  # echo "indexing $url"
  ./index.sh "p/d/content_$INDEXED_URLS.txt" "$url"
  ((INDEXED_URLS++))
done

while read -r line; do
  echo "${line%% |*}" >> "p/d/queries.txt"
done < "d/global-index.txt"

exit 0;