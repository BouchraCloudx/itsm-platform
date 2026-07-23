FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Ces valeurs sont injectées au moment du build (Vite les "fige" dans le JS final)
ARG VITE_AUTH_URL
ARG VITE_TICKET_URL
ARG VITE_USER_URL
ARG VITE_NOTIFICATION_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL
ENV VITE_TICKET_URL=$VITE_TICKET_URL
ENV VITE_USER_URL=$VITE_USER_URL
ENV VITE_NOTIFICATION_URL=$VITE_NOTIFICATION_URL

RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
