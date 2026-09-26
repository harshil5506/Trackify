# Trackify Android Spend Detection Module (Notification-Access)

This module provides automatic spend detection for personal finance tracking by reading incoming notification alerts from bank and UPI apps (GPay, PhonePe, Paytm, HDFC, SBI, ICICI) on **Android**.

---

## 🔒 Privacy & Architecture Guarantees

1. **Strictly On-Device Parsing & Storage**:
   - All regex parsing and Room SQLite database storage occur locally on-device.
   - Raw notification text is **never** transmitted off-device or logged to remote services.
2. **Event-Driven Listener**:
   - Extends Android's native `NotificationListenerService` (`TrackifyNotificationListenerService`).
   - Runs event-driven on incoming notifications without background polling loops (saving battery).
3. **Allow-List Filtering & Deduplication**:
   - Filters notifications by package name (`com.google.android.apps.nbu.paisa.user`, `com.phonepe.app`, `net.one97.paytm`, etc.).
   - Uses notification ID + package key to deduplicate state updates (e.g. "Sending..." -> "Sent").

---

## 🚀 How to Test End-to-End Without Real Bank Apps

You can thoroughly test the parser, deduplication, Room DB, and UI feed on an Android Emulator using two convenient methods:

### Method 1: In-App Developer Test Panel (Recommended)

1. Build and launch the app on an Android Emulator or physical device.
2. Grant Notification Access permission when prompted (Settings -> Notification Access -> Enable **Trackify Spend Detection**).
3. Tap the **Debug** tab at the bottom navigation bar.
4. Tap any of the synthetic notification buttons:
   - **Post GPay Spend Alert (₹500)**: `₹500 paid to Ramesh Kumar via UPI`
   - **Post PhonePe Income Alert (₹1,200)**: `You received ₹1,200 from Priya Sharma`
   - **Post HDFC Card Alert (₹749.00)**: `Spent ₹749.00 on your HDFC Bank Card at AMAZON`
5. Switch to the **Feed** tab to see the parsed transaction immediately added to your local Room database list.

---

### Method 2: Synthetic Testing via ADB Shell (Terminal Command)

You can trigger synthetic notifications directly from your command line terminal on a running Android Emulator:

#### 1. Post a GPay Spend Alert (₹500 to Ramesh Kumar):
```bash
adb shell cmd notification post -S bigtext -t "Google Pay" "TagGPay" "₹500 paid to Ramesh Kumar via UPI"
```

#### 2. Post a PhonePe Credit Alert (₹1,200 from Priya Sharma):
```bash
adb shell cmd notification post -S bigtext -t "PhonePe" "TagPhonePe" "You received ₹1,200 from Priya Sharma"
```

#### 3. Post an HDFC Card Spend Alert (₹749.00 at AMAZON):
```bash
adb shell cmd notification post -S bigtext -t "HDFC Bank Alert" "TagHDFC" "Spent ₹749.00 on your HDFC Bank Card at AMAZON"
```

---

## 🧪 Unit Tests

The parser engine is decoupled as a pure function (`NotificationParser.parse(text, sourceApp, timestamp)`).

Run the unit test suite via Gradle:
```bash
cd android
./gradlew test
```
Or run `NotificationParserTest.kt` inside Android Studio.
