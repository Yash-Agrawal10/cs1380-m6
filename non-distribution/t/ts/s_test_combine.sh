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

    processed_input=$(echo "$input_data" | c/combine.sh | sed 's/\t*$//' | sed 's/\s/ /g' | sort | uniq)
    processed_output=$(echo "$output_data" | sed 's/\t*$//' | sed 's/\s/ /g' | sort | uniq)

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

# One word
input_data="test"
output_data="test"
run_test "$input_data" "$output_data" "One Word"; 

# Two words
input_data=$'test1\ntest2'
output_data=$'test1\ntest2\ntest1 test2'
run_test "$input_data" "$output_data" "Two Words"; 

# Repeat word
input_data=$'test\ntest'
output_data=$'test\ntest\ntest test'
run_test "$input_data" "$output_data" "Repeat Word"; 

exit $result