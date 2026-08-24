# Local KIND Deployment

This guide runs the complete platform locally using Docker Desktop and a three-node KIND cluster.

## Prerequisites

- Docker Desktop
- `kind`
- `kubectl`
- A Google OAuth client

Register this callback in Google Cloud Console:

```text
http://localhost:8080/authorize
```

Create `backend/.env`:

```dotenv
SECRET_KEY=replace-with-a-random-secret
GOOGLE_CLIENT_ID=replace-with-your-client-id
GOOGLE_CLIENT_SECRET=replace-with-your-client-secret
```

The file is excluded from Git and Docker images.

## 1. Build the images

From the repository root:

```powershell
docker build -t monte-carlo-frontend:latest ./frontend
docker build -t monte-carlo-backend:latest ./backend
```

## 2. Create the cluster

```powershell
kind create cluster --name monte-carlo --config kind-config.yaml
kind load docker-image monte-carlo-frontend:latest --name monte-carlo
kind load docker-image monte-carlo-backend:latest --name monte-carlo
```

## 3. Create configuration Secrets

```powershell
kubectl create namespace monte-carlo

kubectl create secret generic postgres-secret `
  --namespace monte-carlo `
  --from-literal=POSTGRES_DB=flask_oidc `
  --from-literal=POSTGRES_USER=postgres `
  --from-literal=POSTGRES_PASSWORD=change-me

kubectl create secret generic backend-secret `
  --namespace monte-carlo `
  --from-env-file=./backend/.env

kubectl create secret generic backend-db-secret `
  --namespace monte-carlo `
  --from-literal=DATABASE_URL=postgresql://postgres:change-me@postgres:5432/flask_oidc
```

Use a stronger password outside a local development cluster.

## 4. Deploy PostgreSQL and initialize the schema

```powershell
kubectl apply -f ./k8s/postgres.yaml
kubectl wait --for=condition=ready pod/postgres-0 -n monte-carlo --timeout=120s

kubectl apply -f ./k8s/init-db.yaml
kubectl wait --for=condition=complete job/init-db -n monte-carlo --timeout=120s
```

## 5. Deploy the application

```powershell
kubectl apply -f ./k8s/backend.yaml
kubectl apply -f ./k8s/compute.yaml
kubectl apply -f ./k8s/frontend.yaml
kubectl get pods -n monte-carlo
```

Expected topology:

```text
2 frontend pods
2 backend API pods
1 scheduler pod
5 worker pods
1 PostgreSQL pod
```

## 6. Open the dashboard

Keep the port-forward command running:

```powershell
kubectl port-forward service/frontend 8080:80 -n monte-carlo
```

Open [http://localhost:8080](http://localhost:8080).

## Operations

Check the workloads:

```powershell
kubectl get pods -n monte-carlo
```

Read scheduler and worker logs:

```powershell
kubectl logs deployment/scheduler -n monte-carlo
kubectl logs -l app=worker -n monte-carlo --prefix=true
```

Inspect task distribution:

```powershell
kubectl exec -n monte-carlo postgres-0 -- psql -U postgres -d flask_oidc -c "SELECT job_id, worker_id, status, points_processed, time_taken FROM job_task ORDER BY id;"
```

Scale the worker pool:

```powershell
kubectl scale deployment/worker --replicas=10 -n monte-carlo
```

After rebuilding an image, load it again and restart its Deployment:

```powershell
kind load docker-image monte-carlo-frontend:latest --name monte-carlo
kubectl rollout restart deployment/frontend -n monte-carlo
```

Delete the cluster:

```powershell
kind delete cluster --name monte-carlo
```
