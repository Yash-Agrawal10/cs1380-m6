#!/bin/bash
# This is a student test

T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

cd "$(dirname "$0")/../..$R_FOLDER" || exit 1

DIFF=${DIFF:-diff}

# Setup
cat "$T_FOLDER"/d/d7.txt > d/global-index.txt

result=0
run_test() {
    local input_data="$1";
    local output_data="$2";
    local title="$3";

    processed_input=$(./query.js "$input_data")
    processed_output="$output_data"

    if $DIFF <(echo "$processed_input") <(echo "$processed_output") > /dev/null;
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

# One word
input_data="link"
output_data='link | https://cs.brown.edu/courses/csci1380/sandbox/1/level_1a/index.html 1
link check | https://cs.brown.edu/courses/csci1380/sandbox/1/level_1a/index.html 1
link check stuff | https://cs.brown.edu/courses/csci1380/sandbox/1/level_1a/index.html 1
simpl link | https://cs.brown.edu/courses/csci1380/sandbox/1/level_1a/index.html 1
simpl link check | https://cs.brown.edu/courses/csci1380/sandbox/1/level_1a/index.html 1'
run_test "$input_data" "$output_data" "One Word"; 

# Two word
input_data="simpl link"
output_data='simpl link | https://cs.brown.edu/courses/csci1380/sandbox/1/level_1a/index.html 1
simpl link check | https://cs.brown.edu/courses/csci1380/sandbox/1/level_1a/index.html 1'
run_test "$input_data" "$output_data" "Two Word"; 

exit $result