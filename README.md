# Schülertreff

## Development
See the respective README for client and server.

## Deployment
Create `.env` and fill in the required values:
```sh
cp .env.example .env
```

Build and deploy the stack:
```sh
docker compose up --build -d
```

The server and client should be run behind a reverse proxy with HTTPS support. See `nginx.conf.sample` for an example nginx config.
