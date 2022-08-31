FROM node:16-alpine AS builder

RUN apk add --nocache udev ttf-freefont chromium git
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./
RUN npm clean-install

COPY . .

ARG VITE_API_URL
RUN npm run build


FROM nginx:1-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
