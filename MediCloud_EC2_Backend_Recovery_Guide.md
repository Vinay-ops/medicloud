# MediCloud EC2 Backend Recovery Guide

This guide explains how to restore the MediCloud backend if the EC2 instance is restarted and the website shows `502 Bad Gateway` or API connection errors.

## Environment

- Backend folder: `~/medicloud-main/backend`
- PM2 process name: `medicloud-backend`
- Backend port: `5000`
- Health endpoint: `https://16.171.203.67/api/health`
- Frontend: <https://medicloud-sv.vercel.app>
- Nginx: reverse proxy on the EC2 instance

> **Important:** Start the EC2 instance in the AWS Console and wait until its status checks pass before running these commands. Connect to the instance using SSH. Run each command separately.

## 1. Standard recovery procedure

### Step 1 — Open the backend folder

```bash
cd ~/medicloud-main/backend
```

### Step 2 — Check PM2

```bash
pm2 status
```

If `medicloud-backend` is already `online`, skip to Step 5.

### Step 3 — Start the backend if the PM2 process is missing

```bash
pm2 start ssm-start.js --name medicloud-backend
```

If PM2 reports that the process already exists, restart it instead:

```bash
pm2 restart medicloud-backend
```

### Step 4 — Save the PM2 process list

```bash
pm2 save
```

This saves the current PM2 process list. It does **not**, by itself, configure PM2 to start automatically after an EC2 reboot.

### Step 5 — Test the backend locally

```bash
curl -i http://127.0.0.1:5000/api/health
```

Expected result: an HTTP `200 OK` response and JSON containing `"status":"ok"`.

### Step 6 — Test HTTPS through Nginx

```bash
curl -i https://16.171.203.67/api/health
```

Expected result: an HTTP `200 OK` response and the MediCloud API health JSON.

If both checks succeed, refresh the frontend:

<https://medicloud-sv.vercel.app>

## 2. Troubleshooting commands

### Backend is stopped or repeatedly crashing

```bash
pm2 logs medicloud-backend --lines 50
```

### Check Nginx configuration

```bash
sudo nginx -t
```

### Restart and inspect Nginx

```bash
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager
```

Only restart Nginx if it is stopped or you have a reason to restart it. The `nginx -t` command checks the configuration before a restart.

### HTTPS returns 502 even though the local health check works

```bash
sudo tail -n 40 /var/log/nginx/error.log
```

### PM2 says the process does not exist

First go to the backend folder:

```bash
cd ~/medicloud-main/backend
```

Then start the process:

```bash
pm2 start ssm-start.js --name medicloud-backend
pm2 save
```

If the start command fails, inspect the error before repeating it:

```bash
pm2 logs medicloud-backend --lines 50
```

## 3. Quick copy-and-run checklist

Run each command on a separate line, checking the output as you go:

```bash
cd ~/medicloud-main/backend
pm2 status
pm2 start ssm-start.js --name medicloud-backend
pm2 save
curl -i http://127.0.0.1:5000/api/health
curl -i https://16.171.203.67/api/health
```

**Note:** If PM2 already has the process registered, the `pm2 start` command may report that the process name is already in use. In that case, use `pm2 restart medicloud-backend` instead, then run the health checks. Do not blindly run both start and restart commands.

## 4. After stopping and starting EC2

- Start the EC2 instance in the AWS Console.
- Wait for the EC2 status checks to pass.
- Connect through SSH.
- Follow Section 1.
- Confirm the Elastic IP `16.171.203.67` is still associated with the instance.
- If the public endpoint/IP has changed, verify the Vercel environment variable `VITE_API_URL` matches the current backend HTTPS URL, then redeploy the frontend if needed.

## 5. Important reminders

- Stopping EC2 makes the backend unavailable while the instance is stopped.
- DynamoDB records, S3 objects, and Cognito users are stored in separate AWS services and are not normally deleted just because EC2 is stopped.
- Do not expose port `5000` publicly when Nginx is intended to proxy requests to it.
- `pm2 save` saves the process list but does not configure automatic startup. PM2 startup-on-reboot should be configured separately.
- If the local health endpoint works but the HTTPS endpoint fails, check Nginx logs before changing CORS settings.
- Do not paste access tokens, AWS secrets, private keys, or presigned URLs into logs or public chats.

## Success criteria

The recovery is successful when:

1. `pm2 status` shows `medicloud-backend` as `online`.
2. `curl -i http://127.0.0.1:5000/api/health` returns HTTP `200 OK`.
3. `curl -i https://16.171.203.67/api/health` returns HTTP `200 OK`.
4. The frontend can reach the API and the relevant feature works.
