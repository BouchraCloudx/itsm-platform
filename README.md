# Plateforme ITSM Cloud-Native

Plateforme Help Desk / ITSM en architecture microservices, cloud-native, avec CI/CD GitOps.

## Services
- **auth-service** : Authentification, JWT, gestion des rôles
- **ticket-service** : CRUD incidents, statuts, priorité, SLA
- **user-service** : Gestion des utilisateurs et équipes
- **notification-service** : Notifications temps réel (WebSocket) et email

## Stack
Node.js/NestJS, PostgreSQL, RabbitMQ, Docker, Kubernetes (k3d), Helm, ArgoCD, Argo Rollouts, Prometheus/Grafana

## Documentation
Voir `/docs` pour les contrats API et schémas d'architecture.
