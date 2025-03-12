# Supervised Learning

A type of machine learning where models learn from labeled training data to make predictions on new data.

## Types of Problems
1. **Classification**
   - Binary Classification
   - Multi-class Classification
   - Multi-label Classification

2. **Regression**
   - Linear Regression
   - Polynomial Regression
   - Multiple Regression

## Common Algorithms
- Linear Regression
- Logistic Regression
- Decision Trees
- Random Forests
- Support Vector Machines (SVM)
- Neural Networks

## Code Example (scikit-learn)
```python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# Prepare data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = LogisticRegression()
model.fit(X_train, y_train)

# Make predictions
predictions = model.predict(X_test)

# Evaluate
accuracy = accuracy_score(y_test, predictions)
```

## Model Evaluation
1. **Classification Metrics**
   - Accuracy
   - Precision
   - Recall
   - F1 Score
   - ROC-AUC

2. **Regression Metrics**
   - Mean Squared Error (MSE)
   - Root Mean Squared Error (RMSE)
   - Mean Absolute Error (MAE)
   - R-squared

## Best Practices
1. Split data properly (train/validation/test)
2. Handle class imbalance
3. Feature scaling/normalization
4. Cross-validation
5. Hyperparameter tuning

Last Updated: 2024-03-20 