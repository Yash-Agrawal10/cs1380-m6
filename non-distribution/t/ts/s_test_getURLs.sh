#!/bin/bash
# This is a student test

T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

cd "$(dirname "$0")/../..$R_FOLDER" || exit 1

DIFF=${DIFF:-diff}

# Setup
url="https://test"

result=0
run_test() {
    local input_data="$1";
    local output_data="$2";
    local title="$3";

    processed_input=$(echo "$input_data" | c/getURLs.js $url | sort)
    processed_output=$(echo "$output_data" | sort)

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
input_data='<!DOCTYPE html>
<html lang="en">
<head>
    <title>Should Not Appear</title>
</head>
<body>
    <p>Should Not Appear</p>
</body>
</html>
'
output_data=''
run_test "$input_data" "$output_data" "Simple text"; 

# Relative URL
input_data='<!DOCTYPE html>
<html lang="en">
<head>
    <title>Should Not Appear</title>
</head>
<body>
    <a href='test'>Testing Link</a>
</body>
</html>
'
output_data="$url/test"
run_test "$input_data" "$output_data" "Relative URL"; 

# Absolute URL
input_data='<!DOCTYPE html>
<html lang="en">
<head>
    <title>Should Not Appear</title>
</head>
<body>
    <a href='https://different'>Testing Link</a>
</body>
</html>
'
output_data="https://different/"
run_test "$input_data" "$output_data" "Absolute URL"; 

exit $result