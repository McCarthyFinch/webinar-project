# Control Flow in Programming

Control flow determines the order in which individual statements, instructions, or function calls are executed.

## Conditional Statements
```javascript
if (condition) {
    // code block
} else if (another_condition) {
    // code block
} else {
    // code block
}

// Switch statement
switch (value) {
    case 1:
        // code
        break;
    default:
        // code
}
```

## Loops
1. **For Loop**
   ```javascript
   for (let i = 0; i < 5; i++) {
       console.log(i);
   }
   ```

2. **While Loop**
   ```javascript
   while (condition) {
       // code block
   }
   ```

3. **Do-While Loop**
   ```javascript
   do {
       // code block
   } while (condition);
   ```

## Error Handling
```javascript
try {
    // code that might throw an error
} catch (error) {
    // handle the error
} finally {
    // always executed
}
```

## Best Practices
1. Keep conditions simple
2. Avoid deep nesting
3. Use early returns
4. Handle all possible cases

Last Updated: 2024-03-20 