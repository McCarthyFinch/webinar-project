# Common Sorting Algorithms

Understanding different sorting algorithms and their complexities is crucial for efficient programming.

## Quick Sort
- **Time Complexity**: O(n log n) average, O(n²) worst
- **Space Complexity**: O(log n)
- **In-place**: Yes
- **Stable**: No

```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
```

## Merge Sort
- **Time Complexity**: O(n log n)
- **Space Complexity**: O(n)
- **In-place**: No
- **Stable**: Yes

## Bubble Sort
- **Time Complexity**: O(n²)
- **Space Complexity**: O(1)
- **In-place**: Yes
- **Stable**: Yes

## When to Use What
1. Quick Sort: General purpose, in-memory sorting
2. Merge Sort: When stability is needed
3. Bubble Sort: Educational purposes or tiny arrays

Last Updated: 2024-03-20 