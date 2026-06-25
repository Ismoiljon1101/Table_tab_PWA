FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
ENV VITE_API_URL=https://tabletap.ismaildev.uz/v1
ENV VITE_WS_URL=https://tabletap.ismaildev.uz
ENV VITE_APP_URL=https://ttb.ismaildev.uz
ENV NODE_ENV=production
RUN pnpm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
