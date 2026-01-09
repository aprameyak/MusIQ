# Quick Start Guide

## Step 1: Start the Backend

Open a terminal and run:

```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 3000
Database connection established
```

**Keep this terminal open!** The backend needs to keep running.

## Step 2: Test Backend (Optional)

In a new terminal, test if the backend is working:

```bash
curl http://localhost:3000/health
```

You should get: `{"status":"ok","timestamp":"..."}`

## Step 3: Run the iOS App

### Option A: Using Xcode (Recommended)

1. Open Xcode:
   ```bash
   open frontend/MusicApp.xcodeproj
   ```

2. Select a simulator (e.g., iPhone 15 Pro) from the device menu

3. Press `Cmd + R` or click the Run button (▶️)

### Option B: Using Command Line

```bash
cd frontend
xcodebuild -project MusicApp.xcodeproj -scheme MusicApp -destination 'platform=iOS Simulator,name=iPhone 15 Pro' build run
```

## Step 4: Test Login

1. In the iOS app, try to sign up with:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `Test123!`

2. If signup works, try logging in with the same credentials

## Troubleshooting Login Issues

### Issue: "Cannot connect to server"

**Solution:**
1. Make sure the backend is running (Step 1)
2. Check backend terminal for errors
3. Try using your Mac's IP address instead of localhost:
   - Find your IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - In Xcode: Product > Scheme > Edit Scheme > Run > Arguments > Environment Variables
   - Add: `API_BASE_URL` = `http://YOUR_IP:3000/api`

### Issue: "Server error 500"

**Solution:**
1. Check backend terminal logs
2. Make sure database migrations ran: `cd backend && npm run migrate`
3. Verify `.env` file has all required variables (see SETUP.md)

### Issue: "CORS error"

**Solution:**
1. In `backend/.env`, set: `CORS_ORIGIN=*`
2. Restart the backend server

## Your Mac's IP Address

Your current IP: **192.168.86.99**

If `127.0.0.1` doesn't work, use this IP in the iOS app's API URL.

## Need More Help?

See `SETUP.md` for detailed setup instructions.
