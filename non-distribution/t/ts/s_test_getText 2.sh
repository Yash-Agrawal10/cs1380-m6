#!/bin/bash
# This is a student test

T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

cd "$(dirname "$0")/../..$R_FOLDER" || exit 1

DIFF=${DIFF:-diff}

# Setup
result=0
run_test() {
    local input_data="$1"
    local output_data="$2"
    local title="$3"

    processed_input=$(echo "$input_data" | c/getText.js | sort)
    processed_output=$(echo "$output_data" | sort)

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

# Empty case
input_data=""
output_data=""
run_test "$input_data" "$output_data" "Empty Case"

# Simple text
input_data=$(cat <<"EOF"
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Should Not Appear</title>
</head>
<body>
    <p>Should Appear</p>
</body>
</html>
EOF
)
output_data='Should Appear'
run_test "$input_data" "$output_data" "Simple text"

# Caps
input_data=$(cat <<"EOF"
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Should Not Appear</title>
</head>
<body>
    <h1>Should Appear</h1>
</body>
</html>
EOF
)
output_data='SHOULD APPEAR'
run_test "$input_data" "$output_data" "Caps"

# Link
input_data=$(cat <<"EOF"
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Should Not Appear</title>
</head>
<body>
    <a href='test'>Testing Link</a>
</body>
</html>
EOF
)
output_data='Testing Link [test]'
run_test "$input_data" "$output_data" "Link"

exit $result