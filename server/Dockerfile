FROM node:16-alpine AS builder

RUN apk add udev ttf-freefont chromium git
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./
COPY patches ./patches
RUN npm clean-install

COPY . .

RUN npm run build


FROM node:16-alpine
#ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
COPY patches ./patches
RUN npm clean-install --only=prod

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/main"]
