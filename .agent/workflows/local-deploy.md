---
description: how to deploy the application locally for testing
---

To deploy the application locally and verify the production build, follow these steps:

1. **Build the application**
   Run the production build command from the project root (`d:\angular app\auth-app`):
   ```bash
   npm run build
   ```

2. **Option A: Serve using the SSR server (Recommended)**
   This uses the built-in Node.js server and handles routing automatically.
   ```bash
   npm run serve:ssr:auth-app
   ```
   - **Access URL**: [http://localhost:4000](http://localhost:4000)

3. **Option B: Serve using http-server (SPA Routing)**
   If you want to test ONLY the static files (no SSR), use the `-P` flag to prevent 404s on refresh:
   ```bash
   cd dist/auth-app/browser
   http-server -p 8080 -P http://localhost:8080?
   ```
   - **Access URL**: [http://localhost:8080](http://localhost:8080)

4. **Ensure Backend is Running**
   Your `json-server` must be running in a separate terminal:
   ```bash
   json-server --watch db.json --port 3001
   ```