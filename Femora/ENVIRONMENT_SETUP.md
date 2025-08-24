# 🚀 Environment Variables Setup Guide - Femora App

## 📋 **What We Just Added to Your .env File:**

✅ **MORA_BACKEND_URL** - Set to `http://localhost:5002` for development  
✅ **NODE_ENV** - Set to `development`  
❌ **GOOGLE_API_KEY** - **YOU NEED TO GET THIS**  

## 🔑 **Step 1: Get Your Google Generative AI API Key**

### **This is REQUIRED for the Mora chatbot to work!**

1. **Go to Google AI Studio:**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key:**
   - Click "Create API Key" button
   - Copy the generated key (it looks like: `AIzaSyC...`)

3. **Update Your .env File:**
   ```bash
   # Replace this line in your .env file:
   GOOGLE_API_KEY=your-google-generative-ai-api-key-here
   
   # With your actual key:
   GOOGLE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
   ```

## 🔧 **Step 2: Set Up Firebase Service Account**

### **You need this for the unified user system to work!**

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select your project

2. **Get Service Account Key:**
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

3. **Place the JSON file in your project:**
   ```bash
   # Create config directory if it doesn't exist
   mkdir -p config
   
   # Move the downloaded JSON file to config/
   mv ~/Downloads/your-project-firebase-adminsdk-*.json config/firebase-service-account.json
   ```

4. **Update your .env file:**
   ```bash
   # Replace this line:
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
   
   # With the actual path:
   GOOGLE_APPLICATION_CREDENTIALS=config/firebase-service-account.json
   ```

## 🐍 **Step 3: Set Up Python Environment for Mora**

### **Install Python dependencies for the chatbot backend:**

```bash
# Navigate to the mora directory
cd mora

# Install Python dependencies
pip install -r requirements.txt

# If you get permission errors, try:
pip3 install -r requirements.txt
# or
python -m pip install -r requirements.txt
```

## 🧪 **Step 4: Test the Setup**

### **Test the Mora backend:**

```bash
# Make sure you're in the mora directory
cd mora

# Test the integration
python test_integration.py

# If successful, you should see:
# 🎉 All tests passed! Mora chatbot is ready to use.
```

### **Start the Mora backend:**

```bash
# Start the backend server
python main.py

# You should see:
# 🚀 Starting Mora chatbot server...
# 📍 Server will run on: http://localhost:5002
```

## 📱 **Step 5: Test the React Native App**

### **In a new terminal, start your React Native app:**

```bash
# Go back to project root
cd ..

# Start the React Native app
npm start
# or
expo start
```

### **Test the integration:**
1. Open the app on your device/simulator
2. Navigate to "Ask Mora"
3. Try sending a message
4. Check console logs for connection status

## ⚠️ **Common Issues & Solutions:**

### **Issue: "GOOGLE_API_KEY not found"**
- **Solution:** Make sure you added your actual API key to `.env`
- **Check:** `cat .env | grep GOOGLE_API_KEY`

### **Issue: "Firebase credentials not found"**
- **Solution:** Verify the path in `GOOGLE_APPLICATION_CREDENTIALS`
- **Check:** `ls -la config/firebase-service-account.json`

### **Issue: "Cannot connect to Mora backend"**
- **Solution:** 
  - Ensure Mora backend is running on port 5002
  - Check `MORA_BACKEND_URL` in your `.env`
  - Verify no firewall blocking localhost:5002

### **Issue: "Python dependencies not found"**
- **Solution:** 
  - Make sure you're in the `mora/` directory
  - Run `pip install -r requirements.txt`
  - Check Python version: `python --version` (should be 3.8+)

## 🔍 **Verification Commands:**

```bash
# Check environment variables
cat .env

# Check Firebase service account
ls -la config/firebase-service-account.json

# Check Python dependencies
cd mora
pip list | grep -E "(flask|langchain|firebase)"

# Test Mora backend
python test_integration.py

# Check if port 5002 is available
lsof -i :5002
```

## 🎯 **What Should Happen:**

1. **Mora backend starts** on `http://localhost:5002`
2. **React Native app connects** to Mora successfully
3. **Chat messages work** with AI responses
4. **User data is saved** with proper UID linking
5. **All components display** real data instead of mock data

## 🚨 **If Something Goes Wrong:**

1. **Check the console logs** in both terminals
2. **Verify all environment variables** are set correctly
3. **Ensure Python dependencies** are installed
4. **Check Firebase project** is properly configured
5. **Verify network/firewall** allows localhost connections

## 📞 **Need Help?**

- Check the console logs for specific error messages
- Verify all environment variables are set
- Ensure both backend and frontend are running
- Test each component individually

## 🎉 **Success Indicators:**

✅ Mora backend runs without errors  
✅ React Native app connects to Mora  
✅ Chat messages get AI responses  
✅ User profile shows real data  
✅ Scan history displays actual scans  
✅ All data is properly linked by UID  

---

**Next Steps:** Once everything is working, you can:
- Customize the Mora chatbot responses
- Add more user profile fields
- Implement additional scan types
- Deploy to production with updated environment variables
