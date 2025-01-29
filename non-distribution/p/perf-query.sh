#!/bin/bash

cd "$(dirname "$0")/.." || exit 1

MAX_URLS=5
./p/get-queries.sh $MAX_URLS

MAX_QUERIES=${1:-0}
if ! [[ "$MAX_QUERIES" =~ ^-?[0-9]+$ ]]; then
  echo "Error: Argument is not a valid integer"
  exit 1
fi
COMPLETED_QUERIES=0
START_TIME=$(date +%s)

while read -r term; do
  if [[ $COMPLETED_QUERIES -ge $MAX_QUERIES ]]; then
    break;
  fi
  # echo "querying for $term"
  ./query.js "$term" > "./p/d/responses.txt"
  ((COMPLETED_QUERIES++))
done < "p/d/queries.txt"

END_TIME=$(date +%s)
SECONDS_ELAPSED=$(( END_TIME - START_TIME ))

QUERIES_PER_SEC=$(awk -v a="$COMPLETED_QUERIES" -v b="$SECONDS_ELAPSED" 'BEGIN { print a / b }')
SECS_PER_QUERY=$(awk -v a="$SECONDS_ELAPSED" -v b="$COMPLETED_QUERIES" 'BEGIN { print a / b }')

echo "Throughput: $QUERIES_PER_SEC queries/sec"
echo "Latency: $SECS_PER_QUERY secs/query"

./p/delete.sh

exit 0;