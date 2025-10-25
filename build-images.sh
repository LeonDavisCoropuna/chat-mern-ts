#!/bin/bash
set -e # Termina el script si cualquier comando falla

# --- 1. CONFIGURACIÓN ---
# Tu ID de proyecto de GCP
PROJECT_ID="chat-pulimi"

# Nombres de las imágenes en Google Container Registry (GCR)
BACKEND_IMG="gcr.io/$PROJECT_ID/chat-backend:v1"
FRONTEND_IMG="gcr.io/$PROJECT_ID/chat-frontend:v1"
NGINX_IMG="gcr.io/$PROJECT_ID/chat-nginx:v1"

echo "-----------------------------------------------------"
echo "Autenticando Docker con GCR para el proyecto: $PROJECT_ID"
echo "-----------------------------------------------------"
gcloud auth configure-docker
echo "✓ Docker autenticado."
echo ""

# --- 2. CONSTRUCCIÓN (BUILD) ---
# Navegamos a la raíz del proyecto (donde está este script y las carpetas backend, frontend, nginx)
# cd "$(dirname "$0")"

echo "-----------------------------------------------------"
echo "Construyendo imágenes..."
echo "-----------------------------------------------------"

echo "Construyendo Backend: $BACKEND_IMG"
# (Asume que 'context: ./backend' significa que el Dockerfile está en ./backend/Dockerfile)
docker build -t $BACKEND_IMG ./backend
echo "✓ Backend construido."
echo ""

echo "Construyendo Frontend: $FRONTEND_IMG"
# (Asume que 'context: ./frontend' significa que el Dockerfile está en ./frontend/Dockerfile)
docker build -t $FRONTEND_IMG ./frontend
echo "✓ Frontend construido."
echo ""

echo "Construyendo Nginx: $NGINX_IMG"
# (Asume que 'context: ./nginx' significa que el Dockerfile está en ./nginx/Dockerfile)
docker build -t $NGINX_IMG ./nginx
echo "✓ Nginx construido."
echo ""


# --- 3. SUBIDA (PUSH) ---
echo "-----------------------------------------------------"
echo "Subiendo imágenes a GCR..."
echo "-----------------------------------------------------"

echo "Subiendo Backend..."
docker push $BACKEND_IMG
echo "✓ Backend subido."
echo ""

echo "Subiendo Frontend..."
docker push $FRONTEND_IMG
echo "✓ Frontend subido."
echo ""

echo "Subiendo Nginx..."
docker push $NGINX_IMG
echo "✓ Nginx subido."
echo ""

echo "-----------------------------------------------------"
echo "¡ÉXITO! Todas las imágenes están en GCR."
echo "Puedes verlas en: https://console.cloud.google.com/gcr/images/$PROJECT_ID"
echo "-----------------------------------------------------"
