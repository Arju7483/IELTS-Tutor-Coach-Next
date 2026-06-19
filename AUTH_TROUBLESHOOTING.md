# Authentication Troubleshooting Guide

## ✅ Current Status: APIs Are Working!

I've tested both endpoints and they're working correctly:
- ✅ POST `/api/auth/register` - Returns 200 OK
- ✅ POST `/api/auth/login` - Returns 200 OK
- ✅ MongoDB connection is successful
- ✅ User creation and authentication work

## 🔍 If You're Still Seeing "Internal Server Error"

### Step 1: Check Browser Console

1. Open your browser Developer Tools (F12)
2. Go to the **Console** tab
3. Try to login/register
4. Look for any error messages

**Common errors:**

#### Error: "Failed to fetch" or "Network Error"
**Cause**: Server not running  
**Solution**: Ensure dev server is running with `npm run dev`

#### Error: "CORS policy" or "blocked by CORS"
**Cause**: CORS configuration issue  
**Solution**: This shouldn't happen with Next.js API routes, but verify you're accessing `http://localhost:3000`

#### Error: "Unexpected token" or JSON parse error
**Cause**: Server returned HTML instead of JSON  
**Solution**: Check that MongoDB is running

---

### Step 2: Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try to login/register
4. Click on the `login` or `register` request
5. Check the **Response** tab

**What to look for:**

#### Status: 200 OK, Response: `{ "token": "...", "user": {...} }`
✅ **Success!** The API is working. Check:
- Is the token being stored in localStorage?
- Is there a redirect happening?
- Check Console tab for JavaScript errors

#### Status: 500 Internal Server Error
❌ Check the **Response** body for error message:
- `"Database connection failed"` → MongoDB is not running
- `"Internal server error"` → Check server terminal for detailed logs

#### Status: 400 Bad Request
⚠️ Check request body:
- Ensure email and password are being sent
- Verify JSON format is correct

#### Status: 401 Unauthorized (Login only)
⚠️ Invalid credentials - this is normal if email/password are wrong

#### Status: 409 Conflict (Register only)
⚠️ Email already exists - this is normal, use different email

---

### Step 3: Verify Server is Running

Open terminal and check:

```bash
# Is the dev server running?
# You should see: "✓ Ready in XXXms"
npm run dev
```

**Expected output:**
```
▲ Next.js 16.2.7 (Turbopack)
- Local:         http://localhost:3000
✓ Ready in 349ms
```

---

### Step 4: Test API Directly

Test the endpoints directly without the browser:

#### Test Register:
```powershell
$body = @{ 
    email='newuser@test.com'
    password='test123'
    name='New User'
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri 'http://localhost:3000/api/auth/register' `
    -Method Post `
    -Body $body `
    -ContentType 'application/json'
```

**Expected result:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "email": "newuser@test.com",
    "name": "New User"
  }
}
```

#### Test Login:
```powershell
$body = @{ 
    email='newuser@test.com'
    password='test123'
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri 'http://localhost:3000/api/auth/login' `
    -Method Post `
    -Body $body `
    -ContentType 'application/json'
```

**Expected result:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "email": "newuser@test.com",
    "name": "New User"
  }
}
```

---

### Step 5: Check MongoDB Connection

Run the test script:

```bash
node test-mongodb-connection.js
```

**Expected output:**
```
🔍 Testing MongoDB connection...
✅ Successfully connected to MongoDB!
✅ Database 'ielts_coach' is accessible
✅ Found 7 collections
✅ Write operation successful
✅ Delete operation successful
🎉 All tests passed!
```

**If it fails:**
- See MONGODB_SETUP.md for setup instructions
- Check if MongoDB service is running: `net start MongoDB`
- Or use MongoDB Atlas (cloud-hosted)

---

### Step 6: Clear Browser Cache

Sometimes cached API responses cause issues:

1. Open Developer Tools (F12)
2. Right-click the Refresh button
3. Select "Empty Cache and Hard Reload"
4. Try login/register again

---

### Step 7: Check Server Logs

Look at the terminal where `npm run dev` is running:

**Successful request looks like:**
```
POST /api/auth/register 200 in 303ms
POST /api/auth/login 200 in 98ms
```

**Error looks like:**
```
Register error: MongoNetworkError: connect ECONNREFUSED
POST /api/auth/register 500 in 50ms
```

---

## 🐛 Common Issues & Solutions

### Issue: "Email already registered"
**Cause**: That email is already in the database  
**Solution**: Use a different email or login with existing credentials

### Issue: "Password must be at least 6 characters"
**Cause**: Password too short  
**Solution**: Use a longer password

### Issue: "Invalid email or password" (Login)
**Cause**: Wrong credentials  
**Solution**: Double-check email and password, or register a new account

### Issue: Redirect not working after successful login
**Cause**: JavaScript error preventing redirect  
**Solution**: 
1. Check browser console for errors
2. Verify localStorage is enabled
3. Try clearing localStorage: `localStorage.clear()`

### Issue: "Token expired" after logging in
**Cause**: System clock is wrong or JWT_SECRET changed  
**Solution**: 
1. Check system time is correct
2. Don't change JWT_SECRET in .env.local
3. Clear localStorage and login again

---

## 🧪 Manual Testing Checklist

- [ ] MongoDB is running (`node test-mongodb-connection.js`)
- [ ] Dev server is running (`npm run dev` on port 3000)
- [ ] Can access http://localhost:3000 in browser
- [ ] Registration page loads at http://localhost:3000/register
- [ ] Login page loads at http://localhost:3000/login
- [ ] No errors in browser console (F12)
- [ ] Network tab shows 200 responses
- [ ] Token appears in localStorage after login
- [ ] Redirects to /progress after successful login

---

## 📞 Still Having Issues?

### Collect Debug Information:

1. **Browser console errors** (F12 → Console tab)
2. **Network response** (F12 → Network tab → Click request → Response)
3. **Server terminal logs** (where `npm run dev` is running)
4. **MongoDB connection test** output

### Quick Test:

Run this in PowerShell to test everything at once:

```powershell
# Test MongoDB
node test-mongodb-connection.js

# Test Register API
$body = @{ email='debug@test.com'; password='test123'; name='Debug' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/register' -Method Post -Body $body -ContentType 'application/json'

# Test Login API
$body = @{ email='debug@test.com'; password='test123' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method Post -Body $body -ContentType 'application/json'
```

If all three succeed, the problem is in the browser/frontend.

---

## ✅ Verification

Your authentication is working if:
1. MongoDB test passes ✅
2. API tests return tokens ✅
3. Browser shows no console errors ✅
4. Network tab shows 200 responses ✅
5. You're redirected to /progress after login ✅

**Current status: All backend tests pass! APIs are functional.**

If you're still seeing errors in the browser, share:
- Browser console screenshot
- Network tab screenshot
- Server terminal logs

This will help identify the exact issue!
