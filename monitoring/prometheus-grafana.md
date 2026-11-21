# 📊 Prometheus & Grafana Monitoring Guide

This guide explains how to monitor the **Cloud URL Shortener** application in Kubernetes using **Prometheus** and **Grafana**, and how to visualize Horizontal Pod Autoscaling (HPA) events in real time.

---

## 🏗 Monitoring Architecture

1. **Node.js Application**: Exposes standard runtime and custom business metrics at `/metrics` using `prom-client`.
2. **Prometheus**: Periodically scrapes the `/metrics` endpoint from all active pod endpoints discovered via Kubernetes service discovery.
3. **Metrics Server**: Collects resource metrics (CPU and Memory) used by Kubernetes HPA to make scaling decisions.
4. **Grafana**: Queries Prometheus and provides dashboards visualizing traffic, latency, CPU utilization, and replica count.

---

## 🚀 Setting Up Monitoring in Kubernetes

### Option A: Using Helm (kube-prometheus-stack) - Recommended for Production / EKS

```bash
# 1. Add Prometheus Community Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 2. Install the Prometheus & Grafana stack
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# 3. Port-forward Grafana to access the dashboard
kubectl port-forward -n monitoring svc/monitoring-grafana 3001:80
```
- Default Grafana credentials:
  - **Username**: `admin`
  - **Password**: `prom-operator` (or retrieve via `kubectl get secret -n monitoring monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 --decode`)

---

### Option B: Using Minikube Addons

If developing locally on Minikube:
```bash
# Enable metrics-server (required for HPA)
minikube addons enable metrics-server

# Verify metrics-server is active
kubectl top pods
```

---

## 📈 Exposing App Metrics to Prometheus

The application includes `prom-client` exposing:
- **Default Node.js Metrics**: Event loop lag, memory consumption, active handles, GC duration.
- **`http_requests_total`**: Counter partitioned by method, route, and HTTP status code.
- **`url_shorten_total`**: Total number of shortened URLs.
- **`url_redirect_total`**: Total number of short link redirections.

### Testing Scrape Endpoint Locally:
```bash
curl http://localhost:3000/metrics
```

---

## 🔍 Useful PromQL Queries for Grafana

Add these queries to your Grafana Dashboard panels:

### 1. Pod CPU Utilization (%)
```promql
sum(rate(container_cpu_usage_seconds_total{container="app"}[1m])) by (pod) * 100
```

### 2. Active Pod Replicas
```promql
kube_deployment_status_replicas{deployment="autoscale-app"}
```

### 3. Total Request Rate (RPS)
```promql
sum(rate(http_requests_total{route="/load"}[1m]))
```

### 4. URL Shortener Operations Rate
```promql
sum(rate(url_shorten_total[1m]))
```

---

## ⚡ Real-Time Autoscaling Demo with Grafana

1. Open Grafana and view the **CPU Usage** and **Pod Replicas** panels side-by-side.
2. Generate continuous CPU load:
   ```bash
   # Send high load concurrently
   while true; do curl -s http://<SERVICE_IP>/load > /dev/null; done
   ```
3. Observe:
   - Pod CPU spikes above the 60% HPA threshold.
   - Kubernetes HPA triggers a scale-out event (`1 pod -> 2 pods -> ...`).
   - Requests are load-balanced across the newly created pods.
   - Once load stops, HPA automatically scales pods back down to `minReplicas: 1` after the stabilization window.
