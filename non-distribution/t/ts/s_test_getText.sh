#!/bin/bash
# This is a student test

T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

cd "$(dirname "$0")/../..$R_FOLDER" || exit 1

DIFF=${DIFF:-diff}

# Setup
result=0
run_test() {
    local input_data="$1";
    local output_data="$2";
    local title="$3";

    processed_input=$(echo "$input_data" | c/getText.js | sort)
    processed_output=$(sort "$output_data")

    if $DIFF <(echo "$processed_input") <(echo "$processed_output") >&2;
    then
        echo "$title success"
        return 0
    else
        echo "$title failure"
        echo "Actual Output: "
        echo "$processed_input"
        echo "Expected Output: "
        echo "$processed_output"
        result=1
        return 1
    fi
}

# Empty case
input_data=""
output_data=""
run_test "$input_data" "$output_data" "Empty Case"; 

# Simple text
input_data=$'<!DOCTYPE html>
<html lang="en">'

exit $result