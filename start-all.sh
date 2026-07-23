#!/bin/bash

SESSION="itsm"
BASE_DIR="$HOME/projects/itsm-platform"

# Si la session existe déjà, on s'y attache directement au lieu d'en recréer une
tmux has-session -t $SESSION 2>/dev/null
if [ $? -eq 0 ]; then
  echo "Session tmux '$SESSION' déjà active, attachement..."
  tmux attach -t $SESSION
  exit 0
fi

# Démarrer les 4 conteneurs PostgreSQL s'ils ne tournent pas déjà
echo "Démarrage des bases PostgreSQL..."
docker start auth-postgres ticket-postgres user-postgres notification-postgres

# Créer la session tmux avec le premier panneau : Auth Service
tmux new-session -d -s $SESSION -n services -c "$BASE_DIR/services/auth-service"
tmux send-keys -t $SESSION "npm run start:dev" C-m

# Split vertical -> Ticket Service
tmux split-window -h -t $SESSION -c "$BASE_DIR/services/ticket-service"
tmux send-keys -t $SESSION "npm run start:dev" C-m

# Split horizontal sur le panneau de gauche -> User Service
tmux select-pane -t $SESSION.0
tmux split-window -v -t $SESSION -c "$BASE_DIR/services/user-service"
tmux send-keys -t $SESSION "npm run start:dev" C-m

# Split horizontal sur le panneau de droite -> Notification Service
tmux select-pane -t $SESSION.2
tmux split-window -v -t $SESSION -c "$BASE_DIR/services/notification-service"
tmux send-keys -t $SESSION "npm run start:dev" C-m

# Nouvelle fenêtre pour le frontend
tmux new-window -t $SESSION -n frontend -c "$BASE_DIR/frontend"
tmux send-keys -t $SESSION:frontend "npm run dev" C-m

# Nouvelle fenêtre libre pour tes commandes (curl, git, etc.)
tmux new-window -t $SESSION -n terminal -c "$BASE_DIR"

# Revenir sur la fenêtre des services et s'attacher
tmux select-window -t $SESSION:services
tmux attach -t $SESSION
