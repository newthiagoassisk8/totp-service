# TOTP Service

Standalone TOTP API extracted from the Nuxt server.

## Endpoints

- `GET /api/totp` - list all items
- `GET /api/totp?uid=item1` - get a single item
- `PATCH /api/totp` or `PUT /api/totp` - update label/digits

## Running

```bash
npm install
npm run dev
```

The server defaults to port 3001. Set `PORT` to override.
