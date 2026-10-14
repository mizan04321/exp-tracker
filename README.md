# ৳ Amar Khoroch - Personal Mobile Expense Tracker

**Amar Khoroch** is a lightweight, mobile-first personal expense tracker app designed specifically for Bangladeshi Taka (৳). It is completely private, requires no account or login, and works 100% offline once opened on your phone.

---

## ✨ Features

1. **⚡ Fast Expense Entry (< 5 seconds)**:
   - Tap the large green **+ Add New Expense** button.
   - Quick one-tap suggestion chips: **Food**, **Transport**, **Groceries**, **Shopping**, **Internet**, **Medicine**, **Bills**, etc.
   - Enter amount in ৳.
   - Date is automatically set to today (can be changed).
   - Tap **Save Expense**.

2. **📊 At-a-Glance Monthly Dashboard**:
   - **Large Monthly Total**: See exactly how much you spent this month in a big, easy-to-read card.
   - **Today's Spending**: Instant total of what you spent today.
   - **This Week's Spending**: Spending from Monday to Sunday of the current week.
   - **Previous Month**: Shows last month's spending for quick comparison.
   - **Month Switcher (`<` and `>`)**: Flip between months to look back at past records.

3. **📜 Expense History**:
   - Displays all expenses newest first.
   - Live search bar to find expenses by name or amount.
   - Easily **Edit** (pencil icon) or **Delete** (trash icon) any expense.

4. **📱 Mobile-First PWA (Progressive Web App)**:
   - Beautiful, clean interface designed specifically for mobile touchscreens.
   - Add it to your phone's home screen — it looks and behaves just like an app installed from the Play Store or App Store!
   - 100% Offline Capable: keeps working even when you don't have mobile data or Wi-Fi.

5. **🔒 Private & Secure Local Storage**:
   - All your data is saved securely in your phone's browser storage.
   - Nothing is uploaded to any server or third party.
   - Includes a **Backup & Restore** button (floppy disk icon in the top right) to download your data file or transfer it to a new phone.

---

## 🚀 How to Run It Right Now on Your Computer

1. Open the folder `d:\Vide Coding` in Windows File Explorer.
2. Double-click the file named **`start-app.bat`**.
3. Your browser will automatically open with the app running at `http://localhost:8080`!

---

## 🌐 How to Put It on Your Mobile Phone (Free & 1-Minute Setup)

Because this app is built with pure web technologies, you can host it for free in just 1 minute without writing a single line of code!

### The Easiest Free Method: Netlify Drop

1. On your computer, open your browser and visit: **[https://app.netlify.com/drop](https://app.netlify.com/drop)**
2. If prompted, sign up for a free account (takes 10 seconds with Google or email).
3. You will see a box that says: **"Drag and drop your site output folder here"**.
4. Drag and drop this entire `Vide Coding` folder into that box.
5. In 5 seconds, Netlify will give you a free, secure link (like `https://amar-khoroch-12345.netlify.app`).
6. You can now open that link on your phone!

---

## 📲 How to Add the App to Your Mobile Phone Home Screen

Once you open your link on your mobile phone:

### On Android (Google Chrome):
1. Open your link in **Google Chrome**.
2. Tap the **Three Dots (⋮)** in the top-right corner.
3. Tap **"Install app"** or **"Add to Home screen"**.
4. Tap **Install**.
5. The **Amar Khoroch (৳)** app icon will now appear on your phone's home screen alongside your normal apps!

### On iPhone (Safari):
1. Open your link in **Safari**.
2. Tap the **Share** button at the bottom of the screen (the square with an arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add** in the top-right corner.
5. The **Amar Khoroch (৳)** app will now be on your home screen!

---

## 📂 Project Files Overview

- **`index.html`**: The structure of the app (Home view, History view, Add/Edit forms, Modals).
- **`style.css`**: Mobile-optimized styles, colors, buttons, and animations.
- **`app.js`**: Core logic (calculations, Taka formatting, date handling, storage, search).
- **`manifest.json`**: Tells mobile devices how to install the app on the home screen.
- **`sw.js`**: Service Worker that caches the app so it works completely offline.
- **`icon-192.png` & `icon-512.png`**: High-resolution app icons with Bangladeshi Taka (৳) symbol.
- **`start-app.bat`**: Double-click shortcut to preview the app locally on your computer.
