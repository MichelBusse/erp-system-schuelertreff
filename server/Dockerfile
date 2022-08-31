FROM node:16-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY patches ./patches
RUN npm clean-install

COPY . .

RUN npm run build


FROM node:16-alpine
#ENV NODE_ENV=production
ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium

WORKDIR /app

COPY package*.json ./
COPY patches ./patches
RUN npm clean-install --only=prod

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/main"]
