# CSS Grid and Flexbox

Modern CSS layout systems for creating responsive web designs.

## Flexbox
A one-dimensional layout system for arranging items in rows or columns.

### Common Properties
```css
.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
}

.item {
    flex: 1;
    order: 1;
    align-self: flex-start;
}
```

## CSS Grid
A two-dimensional layout system for complex layouts.

### Basic Grid
```css
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 20px;
    grid-template-areas:
        "header header header"
        "sidebar main main"
        "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

## When to Use What
- **Flexbox**: For one-dimensional layouts (row OR column)
- **Grid**: For two-dimensional layouts (rows AND columns)

## Best Practices
1. Use Grid for page layouts
2. Use Flexbox for component layouts
3. Combine both for complex UIs
4. Make layouts responsive

Last Updated: 2024-03-20 