# TaskSystemFront beta deployment

This setup deploys the `develop` branch to a separate beta frontend directory. The existing `main` deployment stays untouched.

## Expected layout

- Production frontend: current `main` workflow and production `WORK_DIR`
- Beta frontend: `/opt/tasksystemfrontbeta/version/latest`
- Beta backend: Taskstorm on the beta server, usually `127.0.0.1:6901`

## GitHub secrets

Create these repository secrets:

- `BETA_VITE_API_BASE_URL`
- `BETA_SSH_PRIVATE_KEY`
- `BETA_SSH_HOST`
- `BETA_SSH_USER`
- `BETA_WORK_DIR`

Recommended values:

```text
BETA_VITE_API_BASE_URL=https://beta.example.com
BETA_WORK_DIR=/opt/tasksystemfrontbeta/version/latest
```

Use `https://beta.example.com` when nginx proxies `/api` and `/notificationHub` to Taskstorm. If the beta backend is exposed directly, use the backend URL instead, for example `http://beta.example.com:6901`.

## Server setup

Create the frontend directory:

```bash
sudo mkdir -p /opt/tasksystemfrontbeta/version/latest
sudo groupadd tasksystemfrontbeta-admin
sudo usermod -aG tasksystemfrontbeta-admin piotr
sudo chown -R piotr:tasksystemfrontbeta-admin /opt/tasksystemfrontbeta
sudo chmod -R 2775 /opt/tasksystemfrontbeta
```

Install the nginx site from a clone of this repository on the server:

```bash
sudo cp deploy/nginx/tasksystemfront-beta.conf /etc/nginx/sites-available/tasksystemfront-beta
sudo ln -s /etc/nginx/sites-available/tasksystemfront-beta /etc/nginx/sites-enabled/tasksystemfront-beta
sudo nginx -t
sudo systemctl reload nginx
```

Before installing, replace `beta.example.com` in the nginx config with the real beta DNS name.

If the beta backend runs on a different port than `6901`, update both `proxy_pass` lines in `deploy/nginx/tasksystemfront-beta.conf`.

## Deploy flow

Every push to `develop` runs `.github/workflows/deploy-beta.yml`:

1. Install dependencies with `npm ci`.
2. Build the app with `BETA_VITE_API_BASE_URL`.
3. Rsync `dist/` to `BETA_WORK_DIR`.
4. Reload nginx.

The workflow can also be run manually from GitHub Actions with `workflow_dispatch`.

## Quick verification

After deployment:

```bash
curl -I http://beta.example.com
curl http://beta.example.com/api/v1/issue/search?projectId=1\&status=NEW
```

The second request should return the Taskstorm beta response.
