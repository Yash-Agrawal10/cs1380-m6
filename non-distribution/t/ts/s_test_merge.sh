#!/bin/bash
# This is a student test

T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

cd "$(dirname "$0")/../..$R_FOLDER" || exit 1

DIFF=${DIFF:-diff}
DIFF_PERCENT=${DIFF_PERCENT:-0}

# Setup
global_index=""
merge() {
    local input_data="$1"
    # Simulate file input/output using process substitution
    global_index=$(echo "$input_data" | c/merge.js <(echo "$global_index"))
}

result=0
run_test() {
    local local_index="$1";
    local global_index_prev="$2";
    local global_index_post="$3"
    local title="$4";

    global_index="$global_index_prev"
    merge "$local_index"

    if $DIFF <(echo "$global_index") <(echo "$global_index_post") > /dev/null;
    then
        echo "$title success"
        return 0
    else
        echo "$title failure"
        echo "Actual Output: "
        echo "$global_index"
        echo "Expected Output: "
        echo "$global_index_post"
        result=1
        return 1
    fi
}

# Empty case
local_index=""
global_index_prev=""
global_index_post=""
run_test "$local_index" "$global_index_prev" "$global_index_post" "Empty Case"; 

# Merge into empty global
local_index="test | 5 | url1"
global_index_prev=""
global_index_post="test | url1 5"
run_test "$local_index" "$global_index_prev" "$global_index_post" "Empty Global"; 

# Sort
local_index="test | 5 | url1"
global_index_prev="test | url2 8"
global_index_post="test | url2 8 url1 5"
run_test "$local_index" "$global_index_prev" "$global_index_post" "Sort 1"; 

local_index="test | 10 | url1"
global_index_prev="test | url2 8"
global_index_post="test | url1 10 url2 8"
run_test "$local_index" "$global_index_prev" "$global_index_post" "Sort 2"; 

# New
local_index="test | 5 | url1"
global_index_prev="test2 | url2 8"
global_index_post='test2 | url2 8 test | url1 5'
run_test "$local_index" "$global_index_prev" "$global_index_post" "New"; 

exit $result