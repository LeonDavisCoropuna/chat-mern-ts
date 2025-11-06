import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Get configuration values from Pulumi config
const config = new pulumi.Config();
const imageTag = config.get("imageTag") || "latest";
const dockerRegistry = config.get("dockerRegistry") || "ldavis007";
const gcpProject = config.get("gcp:project") || "chat-pulimi";
const gcpZone = config.get("gcp:zone") || "us-central1-c";

const name = "helloworld";

// Create a GKE cluster
const engineVersion = gcp.container.getEngineVersions({
  location: gcpZone,
}).then(v => v.latestMasterVersion);

const cluster = new gcp.container.Cluster(name, {
  location: gcpZone,
  deletionProtection: false,
  // When using removeDefaultNodePool, we still need initialNodeCount
  removeDefaultNodePool: true,
  initialNodeCount: 2,
  minMasterVersion: engineVersion,
  
  // Habilitar Cluster Autoscaling con límites de recursos
  clusterAutoscaling: {
    enabled: true,
    resourceLimits: [
      {
        resourceType: "cpu",
        minimum: 1,
        maximum: 20,
      },
      {
        resourceType: "memory", 
        minimum: 1,
        maximum: 80,
      },
    ],
  },
  
  // Configuración adicional para optimizar autoscaling
  addonsConfig: {
    horizontalPodAutoscaling: {
      disabled: false,
    },
    networkPolicyConfig: {
      disabled: true,
    }
  }
});

// Create a separate node pool with autoscaling
const primaryNodePool = new gcp.container.NodePool("primary", {
  name: "primary-pool",
  location: gcpZone,
  cluster: cluster.name,
  
  // Configuración de autoscaling del node pool
  autoscaling: {
    minNodeCount: 1,
    maxNodeCount: 4,
  },
  
  // Configuración inicial
  initialNodeCount: 2,
  
  nodeConfig: {
    preemptible: false, // Usar nodos no preemptibles para producción
    machineType: "n1-standard-1",
    diskSizeGb: 20,
    diskType: "pd-standard",
    
    // Labels para identificar el pool
    labels: {
      pool: "primary",
      environment: "production"
    },
    
    // Taints para casos específicos (opcional)
    // taints: [{
    //   key: "app",
    //   value: "production", 
    //   effect: "NO_SCHEDULE"
    // }],
    
    oauthScopes: [
      "https://www.googleapis.com/auth/compute",
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring"
    ],
  },
  
  // Configuración de gestión de nodos
  management: {
    autoRepair: true,
    autoUpgrade: true,
  },
}, {
  dependsOn: [cluster],
});

// Export the Cluster name
export const clusterName = cluster.name;
export const primaryNodePoolName = primaryNodePool.name;

// Manufacture a GKE-style kubeconfig
export const kubeconfig = pulumi.
  all([cluster.name, cluster.endpoint, cluster.masterAuth]).
  apply(([name, endpoint, masterAuth]) => {
    const context = `${gcpProject}_${gcpZone}_${name}`;
    return `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${masterAuth.clusterCaCertificate}
    server: https://${endpoint}
  name: ${context}
contexts:
- context:
    cluster: ${context}
    user: ${context}
  name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1beta1
      command: gke-gcloud-auth-plugin
      installHint: Install gke-gcloud-auth-plugin for use with kubectl by following
        https://cloud.google.com/blog/products/containers-kubernetes/kubectl-auth-changes-in-gke
      provideClusterInfo: true
      env:
      - name: USE_GKE_GCLOUD_AUTH_PLUGIN
        value: "True"
`;
  });

// Create a Kubernetes provider instance that uses our cluster from above.
const clusterProvider = new k8s.Provider(name, {
  kubeconfig: kubeconfig,
}, {
  dependsOn: [cluster],
});


// Create a Kubernetes Namespace
const ns = new k8s.core.v1.Namespace(name, {}, { provider: clusterProvider });

// Export the Namespace name
export const namespaceName = ns.metadata.apply(m => m.name);

// MongoDB StatefulSet
const mongoLabels = { appClass: "mongodb" };

// Create a dedicated namespace for MongoDB
const mongoNs = new k8s.core.v1.Namespace("mongodb", {
  metadata: {
    name: "library-mern",
    labels: mongoLabels,
  },
}, { provider: clusterProvider });

// MongoDB Headless Service (requerido para StatefulSet)
const mongoService = new k8s.core.v1.Service("mongo", {
  metadata: {
    namespace: mongoNs.metadata.name,
    labels: mongoLabels,
    name: "mongo",
  },
  spec: {
    ports: [{ port: 27017, name: "mongo" }],
    clusterIP: "None", // Headless service
    selector: mongoLabels,
  },
}, { provider: clusterProvider });

// MongoDB StatefulSet
const mongoStatefulSet = new k8s.apps.v1.StatefulSet("mongo", {
  metadata: {
    namespace: mongoNs.metadata.name,
    labels: mongoLabels,
  },
  spec: {
    serviceName: "mongo",
    replicas: 1,
    selector: {
      matchLabels: mongoLabels,
    },
    template: {
      metadata: {
        labels: mongoLabels,
      },
      spec: {
        containers: [{
          name: "mongo",
          image: "mongo:6.0",
          ports: [{ containerPort: 27017, name: "mongo" }],
          env: [
            {
              name: "MONGO_INITDB_ROOT_USERNAME",
              value: "admin",
            },
            {
              name: "MONGO_INITDB_ROOT_PASSWORD",
              valueFrom: {
                secretKeyRef: {
                  name: "mongo-secret",
                  key: "password",
                },
              },
            },
          ],
          volumeMounts: [{
            name: "mongo-data",
            mountPath: "/data/db",
          }],
          resources: {
            requests: {
              memory: "256Mi",
              cpu: "150m",
            },
            limits: {
              memory: "512Mi",
              cpu: "300m",
            },
          },
        }],
      },
    },
    volumeClaimTemplates: [{
      metadata: {
        name: "mongo-data",
      },
      spec: {
        accessModes: ["ReadWriteOnce"],
        resources: {
          requests: {
            storage: "1Gi",
          },
        },
        // Para GKE, puedes especificar storage class o usar la por defecto
        // storageClassName: "standard",
      },
    }],
  },
}, { provider: clusterProvider });

// Secret for MongoDB credentials
const mongoSecret = new k8s.core.v1.Secret("mongo-secret", {
  metadata: {
    namespace: mongoNs.metadata.name,
    name: "mongo-secret",
  },
  stringData: {
    username: "admin",
    password: "mongopassword123", // Cambia esto en producción!
  },
}, { provider: clusterProvider });

// Export MongoDB connection details
export const mongoNamespace = mongoNs.metadata.name;
export const mongoServiceName = mongoService.metadata.name;
export const mongoConnectionString = pulumi.interpolate`mongodb://admin:mongopassword123@mongo.mongodb.svc.cluster.local:27017/`;


// Backend Application with Horizontal Scaling
const backendLabels = { app: "backend" };

// Create namespace for the application
const appNamespace = new k8s.core.v1.Namespace("library-mern", {
  metadata: {
    name: "library-mern",
    labels: {
      name: "library-mern",
      environment: "development"
    },
  },
}, { provider: clusterProvider });

// Backend Secret with environment variables
const backendSecret = new k8s.core.v1.Secret("backend-env", {
  metadata: {
    name: "backend-env",
    namespace: appNamespace.metadata.name,
  },
  stringData: {
    MONGO_DB_URI: pulumi.interpolate`mongodb://admin:mongopassword123@mongo.library-mern.svc.cluster.local:27017/chat-app-db?authSource=admin`,
    JWT_SECRET: config.get("jwtSecret") || "supersecreto",
    PORT: "5000",
    FRONTEND_URL: config.get("frontendUrl") || "http://localhost:3000",
    NODE_ENV: config.get("nodeEnv") || "production"
  },
}, { provider: clusterProvider });

// Backend Deployment with Horizontal Pod Autoscaler
const backendDeployment = new k8s.apps.v1.Deployment("backend", {
  metadata: {
    name: "backend",
    namespace: appNamespace.metadata.name,
    labels: backendLabels,
    annotations: {
      "pulumi.com/patchForce": "true",
      "verticalpodautoscaler-update-policy.autoscaling.k8s.io/enabled": "false",
    }
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: backendLabels,
    },
    template: {
      metadata: {
        labels: backendLabels,
        annotations: {
          "prometheus.io/scrape": "true",
          "prometheus.io/port": "5000",
          "prometheus.io/path": "/metrics"
        }
      },
      spec: {
        containers: [{
          name: "backend",
          image: `${dockerRegistry}/chat-mern-backend:${imageTag}`,
          ports: [{
            containerPort: 5000,
            name: "http",
          }],
          envFrom: [{
            secretRef: {
              name: backendSecret.metadata.name,
            },
          }],
          resources: {
            requests: {
              cpu: "100m",
              memory: "128Mi",
            },
            limits: {
              cpu: "150m",
              memory: "200Mi", // Aumenté ligeramente para margen
            },
          },
          livenessProbe: {
            httpGet: {
              path: "/health",
              port: "http",
            },
            initialDelaySeconds: 15,
            periodSeconds: 20,
            timeoutSeconds: 5,
            failureThreshold: 3,
          },
          readinessProbe: {
            httpGet: {
              path: "/health",
              port: "http",
            },
            initialDelaySeconds: 5,
            periodSeconds: 10,
            timeoutSeconds: 3,
            failureThreshold: 1,
          },
          // Mejora: Startup probe para aplicaciones que inician lento
          startupProbe: {
            httpGet: {
              path: "/health",
              port: "http",
            },
            initialDelaySeconds: 10,
            periodSeconds: 5,
            failureThreshold: 10, // Hasta 50 segundos para iniciar
          },
        }],
        // Mejora: Anti-affinity para distribuir pods en diferentes nodos
        affinity: {
          podAntiAffinity: {
            preferredDuringSchedulingIgnoredDuringExecution: [{
              weight: 100,
              podAffinityTerm: {
                labelSelector: {
                  matchExpressions: [{
                    key: "app",
                    operator: "In",
                    values: ["backend"]
                  }]
                },
                topologyKey: "kubernetes.io/hostname"
              }
            }]
          }
        }
      },
    },
    // Mejora: Strategy de actualización rolling
    strategy: {
      type: "RollingUpdate",
      rollingUpdate: {
        maxSurge: 1,
        maxUnavailable: 0,
      },
    },
  },
}, { provider: clusterProvider });

// Horizontal Pod Autoscaler para escalado automático (versión corregida)
const backendHPA = new k8s.autoscaling.v2.HorizontalPodAutoscaler("backend-hpa", {
  metadata: {
    name: "backend-hpa",
    namespace: appNamespace.metadata.name,
  },
  spec: {
    scaleTargetRef: {
      apiVersion: "apps/v1",
      kind: "Deployment",
      name: backendDeployment.metadata.name,
    },
    minReplicas: 1,
    maxReplicas: 8,
    metrics: [
      {
        type: "Resource",
        resource: {
          name: "cpu",
          target: {
            type: "Utilization",
            averageUtilization: 70,
          },
        },
      },
      {
        type: "Resource",
        resource: {
          name: "memory",
          target: {
            type: "Utilization",
            averageUtilization: 60,
          },
        },
      },
    ],
    behavior: {
      scaleUp: {
        policies: [
          {
            type: "Pods",
            value: 2,
            periodSeconds: 60,
          },
        ],
        stabilizationWindowSeconds: 0,
      },
      scaleDown: {
        policies: [
          {
            type: "Pods",
            value: 1,
            periodSeconds: 90,
          },
        ],
        stabilizationWindowSeconds: 300,
      },
    },
  },
}, { provider: clusterProvider });

// Backend Service
const backendService = new k8s.core.v1.Service("backend", {
  metadata: {
    name: "backend",
    namespace: appNamespace.metadata.name,
    labels: backendLabels,
  },
  spec: {
    selector: backendLabels,
    ports: [{
      port: 5000,
      targetPort: 5000,
      name: "http",
    }],
    type: "ClusterIP",
  },
}, { provider: clusterProvider });

// Export Backend details
export const backendNamespace = appNamespace.metadata.name;
export const backendServiceName = backendService.metadata.name;
export const backendDeploymentName = backendDeployment.metadata.name;

// Frontend Application
const frontendLabels = { app: "frontend" };

// Frontend ConfigMap with environment variables
const frontendConfigMap = new k8s.core.v1.ConfigMap("frontend-env", {
  metadata: {
    name: "frontend-env",
    namespace: appNamespace.metadata.name,
  },
  data: {
    // Usar rutas relativas para el proxy
    REACT_APP_API_URL: config.get("apiUrl") || "/api",
    VITE_API_URL: config.get("apiUrl") || "/api",
    NODE_ENV: config.get("nodeEnv") || "production"
  },
}, { provider: clusterProvider });

// Frontend Deployment
const frontendDeployment = new k8s.apps.v1.Deployment("frontend", {
  metadata: {
    name: "frontend",
    namespace: appNamespace.metadata.name,
    labels: frontendLabels,
    annotations: {
      "pulumi.com/patchForce": "true",
      "verticalpodautoscaler-update-policy.autoscaling.k8s.io/enabled": "false",
    }
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: frontendLabels,
    },
    template: {
      metadata: {
        labels: frontendLabels,
        annotations: {
          "prometheus.io/scrape": "true",
          "prometheus.io/port": "3000",
          "prometheus.io/path": "/"
        }
      },
      spec: {
        containers: [{
          name: "frontend",
          image: `${dockerRegistry}/chat-mern-frontend:${imageTag}`,
          ports: [{
            containerPort: 3000,
            name: "http",
          }],
          envFrom: [{
            configMapRef: {
              name: frontendConfigMap.metadata.name,
            },
          }],
          resources: {
            requests: {
              cpu: "30m",
              memory: "32Mi",
            },
            limits: {
              cpu: "50m",
              memory: "64Mi",
            },
          },
          livenessProbe: {
            httpGet: {
              path: "/",
              port: "http",
            },
            initialDelaySeconds: 15,
            periodSeconds: 20,
            timeoutSeconds: 5,
            failureThreshold: 3,
          },
          readinessProbe: {
            httpGet: {
              path: "/",
              port: "http",
            },
            initialDelaySeconds: 5,
            periodSeconds: 10,
            timeoutSeconds: 3,
            failureThreshold: 1,
          },
          // Para aplicaciones React que pueden tomar tiempo en construir
          startupProbe: {
            httpGet: {
              path: "/",
              port: "http",
            },
            initialDelaySeconds: 10,
            periodSeconds: 5,
            failureThreshold: 15, // Hasta 75 segundos para iniciar
          },
        }],
        // Anti-affinity para distribuir pods
        affinity: {
          podAntiAffinity: {
            preferredDuringSchedulingIgnoredDuringExecution: [{
              weight: 100,
              podAffinityTerm: {
                labelSelector: {
                  matchExpressions: [{
                    key: "app",
                    operator: "In",
                    values: ["frontend"]
                  }]
                },
                topologyKey: "kubernetes.io/hostname"
              }
            }]
          }
        }
      },
    },
    strategy: {
      type: "RollingUpdate",
      rollingUpdate: {
        maxSurge: 1,
        maxUnavailable: 1,
      },
    },
  },
}, { provider: clusterProvider });

// Horizontal Pod Autoscaler para Frontend
const frontendHPA = new k8s.autoscaling.v2.HorizontalPodAutoscaler("frontend-hpa", {
  metadata: {
    name: "frontend-hpa",
    namespace: appNamespace.metadata.name,
  },
  spec: {
    scaleTargetRef: {
      apiVersion: "apps/v1",
      kind: "Deployment",
      name: frontendDeployment.metadata.name,
    },
    minReplicas: 1,
    maxReplicas: 4,
    metrics: [{
      type: "Resource",
      resource: {
        name: "cpu",
        target: {
          type: "Utilization",
          averageUtilization: 60,
        },
      },
    }],
    behavior: {
      scaleUp: {
        policies: [{
          type: "Pods",
          value: 2,
          periodSeconds: 60,
        }],
        stabilizationWindowSeconds: 0,
      },
      scaleDown: {
        policies: [{
          type: "Pods",
          value: 1,
          periodSeconds: 120, // Más lento para scale down en frontend
        }],
        stabilizationWindowSeconds: 300,
      },
    },
  },
}, { provider: clusterProvider });

// Frontend Service (ClusterIP - interno)
const frontendService = new k8s.core.v1.Service("frontend", {
  metadata: {
    name: "frontend",
    namespace: appNamespace.metadata.name,
    labels: frontendLabels,
  },
  spec: {
    selector: frontendLabels,
    ports: [{
      port: 3000,
      targetPort: 3000,
      name: "http",
    }],
    type: "ClusterIP",
  },
}, { provider: clusterProvider });

// Export Frontend details
export const frontendConfigMapName = frontendConfigMap.metadata.name;
export const frontendDeploymentName = frontendDeployment.metadata.name;
export const frontendServiceName = frontendService.metadata.name;


// NGINX as Reverse Proxy for Frontend
const nginxLabels = { app: "nginx" };

// NGINX Deployment usando TU imagen personalizada
const nginxDeployment = new k8s.apps.v1.Deployment("nginx", {
  metadata: {
    name: "nginx",
    namespace: appNamespace.metadata.name,
    labels: nginxLabels,
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: nginxLabels,
    },
    template: {
      metadata: {
        labels: nginxLabels,
      },
      spec: {
        containers: [{
          name: "nginx",
          image: `${dockerRegistry}/chat-mern-nginx:${imageTag}`,
          ports: [{
            containerPort: 80,
            name: "http",
          }],
          resources: {
            requests: {
              cpu: "30m",
              memory: "32Mi",
            },
            limits: {
              cpu: "50m", 
              memory: "64Mi",
            },
          },
          livenessProbe: {
            httpGet: {
              path: "/",
              port: "http",  // Probando en la raíz en lugar de /health
            },
            initialDelaySeconds: 15,
            periodSeconds: 20,
            timeoutSeconds: 5,
            failureThreshold: 3,
          },
          readinessProbe: {
            httpGet: {
              path: "/",
              port: "http",  // Probando en la raíz
            },
            initialDelaySeconds: 5,
            periodSeconds: 10,
            timeoutSeconds: 3,
            failureThreshold: 1,
          },
        }],
      },
    },
  },
}, { provider: clusterProvider });

// NGINX Service (mantenemos igual)
const nginxService = new k8s.core.v1.Service("nginx", {
  metadata: {
    name: "nginx",
    namespace: appNamespace.metadata.name,
    labels: nginxLabels,
  },
  spec: {
    selector: nginxLabels,
    ports: [{
      port: 80,
      targetPort: 80,
      name: "http",
    }],
    type: "LoadBalancer",
  },
}, { provider: clusterProvider });

// Export NGINX details
export const nginxServiceIP = nginxService.status.apply(s => s.loadBalancer.ingress[0].ip);
export const nginxServiceName = nginxService.metadata.name;

// Export configuration values used by CI/CD
export const deployedImageTag = imageTag;
export const deployedRegistry = dockerRegistry;
export const deployedProject = gcpProject;
export const deployedZone = gcpZone;

// Export application URL
export const applicationUrl = nginxService.status.apply(s => {
  const ingress = s.loadBalancer.ingress;
  if (ingress && ingress.length > 0 && ingress[0].ip) {
    return `http://${ingress[0].ip}`;
  }
  return "Pending...";
});

// Export autoscaling configuration details
export const autoscalingConfig = {
  clusterAutoscaling: {
    enabled: true,
    maxCpu: 6,
    maxMemory: 15,
    nodeAutoProvisioning: true
  },
  nodePoolAutoscaling: {
    primaryPool: {
      minNodes: 1,
      maxNodes: 4,
      autoRepair: true,
      autoUpgrade: true
    }
  },
  podAutoscaling: {
    backend: {
      minReplicas: 1,
      maxReplicas: 8,
      targetCpuUtilization: 70,
      targetMemoryUtilization: 60
    },
    frontend: {
      minReplicas: 1, 
      maxReplicas: 6,
      targetCpuUtilization: 60
    }
  }
};