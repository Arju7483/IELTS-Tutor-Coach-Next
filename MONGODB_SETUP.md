# MongoDB Setup Guide

## Problem: "Internal Server Error" on Login/Signup

This error occurs because MongoDB is not running or not accessible.

## Solution Options

### Option 1: Use MongoDB Atlas (Recommended - Free & Easy)

MongoDB Atlas is a free cloud-hosted MongoDB service.

#### Steps:

1. **Create a free account** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)

2. **Create a free cluster**:
   - Click "Build a Database"
   - Choose "M0 Free" tier
   - Select your preferred region
   - Click "Create"

3. **Set up database access**:
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter username and password (save these!)
   - Set permissions to "Read and write to any database"
   - Click "Add User"

4. **Set up network access**:
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get connection string**:
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Update `.env.local`**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ielts_coach?retryWrites=true&w=majority
   ```
   
   **Important**: 
   - Replace `username` and `password` with your database user credentials
   - Add `/ielts_coach` after `.net` to specify the database name

7. **Restart your dev server**:
   ```bash
   npm run dev
   ```

---

### Option 2: Install MongoDB Locally (Windows)

If you prefer to run MongoDB on your local machine:

#### Steps:

1. **Download MongoDB Community Server**:
   - Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Select Windows
   - Download the MSI installer

2. **Install MongoDB**:
   - Run the installer
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service (recommended)
   - Install MongoDB Compass (GUI tool) when prompted

3. **Verify installation**:
   ```bash
   mongod --version
   ```

4. **Start MongoDB** (if not running as service):
   ```bash
   net start MongoDB
   ```

5. **Your `.env.local` should have**:
   ```env
   MONGODB_URI=mongodb://localhost:27017
   ```

6. **Restart your dev server**:
   ```bash
   npm run dev
   ```

---

## Verify MongoDB Connection

After setting up MongoDB, test the connection:

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Try to register a new account at `http://localhost:3000/register`

3. If successful, you should see:
   - No errors in browser console
   - Successful redirect to dashboard
   - JWT token stored in localStorage

4. Check MongoDB data:
   - **Atlas**: View collections in Atlas dashboard
   - **Local**: Open MongoDB Compass and connect to `mongodb://localhost:27017`
   - You should see `ielts_coach` database with `users` collection

---

## Common Issues

### Issue: "MongoServerError: Authentication failed"

**Solution**: Double-check your username and password in the connection string.

### Issue: "MongoNetworkError: connection refused"

**Solutions**:
- **Atlas**: Check if your IP is whitelisted in Network Access
- **Local**: Ensure MongoDB service is running (`net start MongoDB`)

### Issue: "Current IP address not added to access list"

**Solution**: In Atlas, go to Network Access and add your current IP or allow all IPs.

### Issue: "Cannot connect to localhost:27017"

**Solution**: MongoDB is not running locally. Either start it or switch to MongoDB Atlas.

---

## Quick Test Connection

Create a test script `test-mongo.js`:

```javascript
const { MongoClient } = require('mongodb');

const uri = 'YOUR_MONGODB_URI_HERE';

async function test() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected successfully to MongoDB!');
    await client.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

test();
```

Run it:
```bash
node test-mongo.js
```

---

## Current Configuration

Your `.env.local` currently has:
```env
MONGODB_URI=mongodb://localhost:27017
```

This tries to connect to a local MongoDB instance, which is **not running** on your machine.

**Recommendation**: Switch to MongoDB Atlas (Option 1) for easiest setup.

---

## After Setup

Once MongoDB is connected:
1. ✅ Login/Signup will work
2. ✅ All features will be functional
3. ✅ Data will persist across sessions
4. ✅ Voice chat sessions will be saved

---

Need help? Check the [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/).
