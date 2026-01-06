# Quick Start Guide

## Backend Setup & Run

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies (first time only):**
   ```bash
   npm install
   ```

3. **Set up your .env file:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add:
   - Your Neon DB connection string
   - JWT_SECRET (32+ character random string)
   - JWT_REFRESH_SECRET (32+ character random string)
   - ENCRYPTION_KEY (exactly 32 characters)

4. **Run database migrations:**
   ```bash
   npm run migrate
   ```

5. **Seed the database (optional, adds sample data):**
   ```bash
   npm run seed
   ```

6. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:3000`
   You should see: "Server running on port 3000" and "Database connection established"

## Frontend Setup & Run

1. **Open the project in Xcode:**
   ```bash
   cd frontend
   open MusicApp.xcodeproj
   ```

2. **Select a simulator or device:**
   - In Xcode, click the device selector at the top
   - Choose an iPhone simulator (e.g., "iPhone 15 Pro")

3. **Update API URL (if needed):**
   - The default is already set to `http://localhost:3000/api` in `APIService.swift`
   - If your backend runs on a different port, update it there

4. **Build and run:**
   - Press `Cmd + R` or click the Play button
   - The app will build and launch in the simulator

## Testing the App

1. **Backend is running** - You should see the server logs
2. **Frontend launches** - You'll see the splash screen
3. **Create an account** - Use the signup screen
4. **Login** - Use your credentials to login
5. **Explore** - Browse the music feed, submit ratings, etc.

## Troubleshooting

**Backend won't start:**
- Check that `.env` file exists and has all required variables
- Make sure DATABASE_URL is correct
- Check if port 3000 is already in use

**Frontend can't connect:**
- Make sure backend is running first
- Check that API_BASE_URL matches your backend URL
- For iOS simulator, `localhost` works fine
- For physical device, use your computer's IP address instead of `localhost`

**Database connection fails:**
- Verify your Neon DB connection string is correct
- Check that your Neon database is active
- Ensure SSL mode is set correctly

