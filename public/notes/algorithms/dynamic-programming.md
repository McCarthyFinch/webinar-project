# Dynamic Programming

A method for solving complex problems by breaking them down into simpler subproblems.

## Key Concepts
1. **Optimal Substructure**: Problem can be solved using solutions to its subproblems
2. **Overlapping Subproblems**: Same subproblems are encountered multiple times

## Common Problems

### Fibonacci Sequence
```python
def fibonacci(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    
    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)
    return memo[n]
```

### Longest Common Subsequence
```python
def lcs(X, Y, m, n, dp):
    if m == 0 or n == 0:
        return 0
    if dp[m][n] != -1:
        return dp[m][n]
    
    if X[m-1] == Y[n-1]:
        dp[m][n] = 1 + lcs(X, Y, m-1, n-1, dp)
    else:
        dp[m][n] = max(lcs(X, Y, m-1, n, dp),
                       lcs(X, Y, m, n-1, dp))
    return dp[m][n]
```

## Steps to Solve
1. Identify if problem has optimal substructure
2. Define recursive relation
3. Identify base cases
4. Decide: Top-down or Bottom-up approach
5. Add memoization/tabulation

## Time Complexity
- Without DP: Often exponential O(2^n)
- With DP: Often polynomial O(n^2)

Last Updated: 2024-03-20 