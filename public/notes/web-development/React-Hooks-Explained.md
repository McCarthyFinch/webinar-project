# React Hooks Explained

Hooks are functions that allow you to "hook into" React state and lifecycle features from function components.

## Common Hooks
1. **useState**: Manage state in functional components
2. **useEffect**: Handle side effects
3. **useContext**: Subscribe to React context
4. **useRef**: Persist values between renders

## useState Example
```javascript
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## useEffect Example
```javascript
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]); // Only re-run when count changes
```

## Best Practices
1. Don't call Hooks inside loops or conditions
2. Only call Hooks from React function components
3. Use multiple effects to separate concerns

Last Updated: 2024-03-20 