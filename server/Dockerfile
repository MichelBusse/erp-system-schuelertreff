FROM node:16-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm clean-install

COPY . .

RUN npm run build


FROM node:16-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm clean-install --only=prod

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
