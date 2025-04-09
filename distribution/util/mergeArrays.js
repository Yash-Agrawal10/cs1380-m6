function mergeSortedArrays(arr1, arr2, comparator) {
    const merged = [];
    let i = 0;
    let j = 0;

    // Compare elements from both arrays and push the smaller one to 'merged'
    while (i < arr1.length && j < arr2.length) {
        if (comparator(arr1[i], arr2[j]) <= 0) {
        merged.push(arr1[i]);
        i++;
        } else {
        merged.push(arr2[j]);
        j++;
        }
    }

    // Append any remaining elements (only one of these while loops will execute)
    while (i < arr1.length) {
        merged.push(arr1[i]);
        i++;
    }

    while (j < arr2.length) {
        merged.push(arr2[j]);
        j++;
    }

    return merged;
}

module.exports = { mergeSortedArrays };