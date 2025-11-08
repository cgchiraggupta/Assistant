# macOS Permissions Setup (CRITICAL!)

For computer control to work on macOS, you **MUST** grant these permissions:

## 🔐 Required Permissions

### 1. Screen Recording Permission
Allows the app to capture screenshots to "see" your screen.

**How to enable:**
1. Open **System Settings** (or System Preferences on older macOS)
2. Go to **Privacy & Security**
3. Click **Screen Recording** in the left sidebar
4. Look for **Terminal** or **iTerm** or **node** in the list
5. Toggle it **ON** (checkmark)
6. If not in list, click the **+** button and add your terminal app
7. **Restart your terminal** after enabling

### 2. Accessibility Permission
Allows the app to control mouse and keyboard.

**How to enable:**
1. Open **System Settings** (or System Preferences)
2. Go to **Privacy & Security**
3. Click **Accessibility** in the left sidebar
4. Look for **Terminal** or **iTerm** or **node** in the list
5. Toggle it **ON** (checkmark)
6. If not in list, click the **+** button and add your terminal app
7. You may need to authenticate with your password
8. **Restart your terminal** after enabling

## 🔍 Quick Check

After granting permissions, try this test:

1. In your browser (localhost:3000), click "Start Recording"
2. Say: **"Take a screenshot"**
3. Click "Stop Recording"
4. Check the Action Log for results

If you see errors in the Action Log, the permissions aren't set correctly.

## 🚨 Common Issues

### "Operation not permitted" errors
- Permissions not granted or terminal not restarted

### "Screen capture failed"
- Screen Recording permission not enabled

### "Failed to execute action"
- Accessibility permission not enabled

## 📝 After Setting Permissions

You MUST:
1. ✅ Close your terminal completely
2. ✅ Reopen terminal
3. ✅ Restart the server: `cd /Users/apple/parvass/Assistant/server && npm run dev`
4. ✅ Refresh browser page
5. ✅ Try again!

## 🎯 Why This Is Needed

macOS security requires **explicit user consent** for apps to:
- Capture screen content (privacy protection)
- Control input devices (security protection)

Without these permissions, the computer control features simply cannot work!

