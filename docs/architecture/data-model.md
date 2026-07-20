# Modèle de données — Plateforme ITSM

> Chaque microservice a **sa propre base de données** (pattern Database per Service). Pas de foreign keys entre services : on utilise des IDs référencés (UUID) et, si besoin, des appels REST ou des événements pour récupérer les données d'un autre service.

## 1. Auth Service — DB: `auth_db`

### Table `users` (authentification uniquement)
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK, default gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| role | ENUM('USER','TECHNICIAN','ADMIN') | NOT NULL, default 'USER' |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now() |

### Table `refresh_tokens`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | NOT NULL |
| token | VARCHAR(500) | NOT NULL |
| expires_at | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | default now() |

---

## 2. User/Team Service — DB: `user_db`

### Table `profiles`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| auth_user_id | UUID | UNIQUE, NOT NULL (référence logique vers auth_db.users.id) |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(20) | nullable |
| avatar_url | VARCHAR(500) | nullable |
| team_id | UUID | nullable, FK -> teams.id |
| created_at | TIMESTAMP | default now() |

### Table `teams`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| description | TEXT | nullable |
| created_at | TIMESTAMP | default now() |

---

## 3. Ticket Service — DB: `ticket_db`

### Table `tickets`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NOT NULL |
| status | ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED') | default 'OPEN' |
| priority | ENUM('LOW','MEDIUM','HIGH','CRITICAL') | NOT NULL |
| category | VARCHAR(100) | NOT NULL |
| created_by | UUID | NOT NULL (référence user_id) |
| assigned_to | UUID | nullable (référence user_id du technicien) |
| sla_deadline | TIMESTAMP | nullable |
| resolution_time_minutes | INTEGER | nullable |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now() |

### Table `comments`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| ticket_id | UUID | NOT NULL, FK -> tickets.id |
| author_id | UUID | NOT NULL |
| content | TEXT | NOT NULL |
| created_at | TIMESTAMP | default now() |

### Table `attachments`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| ticket_id | UUID | NOT NULL, FK -> tickets.id |
| file_url | VARCHAR(500) | NOT NULL (URL MinIO, ajouté en v2) |
| file_name | VARCHAR(255) | NOT NULL |
| uploaded_by | UUID | NOT NULL |
| created_at | TIMESTAMP | default now() |

---

## 4. Notification Service — DB: `notification_db`

### Table `notifications`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | NOT NULL |
| type | VARCHAR(50) | NOT NULL (ex: TICKET_CREATED, TICKET_ASSIGNED) |
| message | TEXT | NOT NULL |
| is_read | BOOLEAN | default false |
| related_ticket_id | UUID | nullable |
| created_at | TIMESTAMP | default now() |

---

## 5. Schéma des événements RabbitMQ

Exchange: `itsm.events` (type: `topic`)

| Routing key | Publié par | Consommé par | Payload |
|---|---|---|---|
| `ticket.created` | ticket-service | notification-service | `{ ticketId, title, createdBy, priority }` |
| `ticket.assigned` | ticket-service | notification-service | `{ ticketId, assignedTo, assignedBy }` |
| `ticket.status_changed` | ticket-service | notification-service | `{ ticketId, oldStatus, newStatus, changedBy }` |
| `ticket.comment_added` | ticket-service | notification-service | `{ ticketId, commentId, authorId }` |
| `user.created` | user-service | notification-service | `{ userId, email }` |

Chaque événement suit ce format enveloppe :
```json
{
  "eventId": "uuid",
  "eventType": "ticket.created",
  "timestamp": "ISO8601",
  "data": { }
}
```
