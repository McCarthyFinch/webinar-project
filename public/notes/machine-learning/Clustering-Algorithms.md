# Clustering Algorithms

Unsupervised learning methods that group similar data points together.

## Popular Algorithms

### K-Means
```python
from sklearn.cluster import KMeans

# Create and fit model
kmeans = KMeans(n_clusters=3, random_state=42)
clusters = kmeans.fit_predict(data)

# Get cluster centers
centers = kmeans.cluster_centers_
```

### DBSCAN
```python
from sklearn.cluster import DBSCAN

# Create and fit model
dbscan = DBSCAN(eps=0.5, min_samples=5)
clusters = dbscan.fit_predict(data)
```

### Hierarchical Clustering
```python
from sklearn.cluster import AgglomerativeClustering

# Create and fit model
hierarchical = AgglomerativeClustering(n_clusters=3)
clusters = hierarchical.fit_predict(data)
```

## Evaluation Metrics
1. Silhouette Score
2. Davies-Bouldin Index
3. Calinski-Harabasz Index
4. Inertia (Within-cluster sum of squares)

## Applications
- Customer Segmentation
- Document Clustering
- Image Segmentation
- Anomaly Detection
- Pattern Recognition

## Best Practices
1. Scale features appropriately
2. Handle outliers
3. Choose appropriate number of clusters
4. Visualize results when possible
5. Compare multiple algorithms

Last Updated: 2024-03-20 