# Society Care Android App

This folder contains a lightweight Android WebView wrapper for the local Society Complaint Management System.

## What it does

- Bundles the website inside the app under `app/src/main/assets/web/`
- Opens `index.html` directly inside Android WebView
- Lets users navigate complaint registration, track status, and admin login inside the app

## Default admin login inside the app

- Admin ID: `admin`
- Password: `admin123`

## How to build APK

1. Open `android-app` in Android Studio.
2. Let Android Studio download Gradle and Android SDK components.
3. Wait for project sync to complete.
4. Click `Build > Build APK(s)` or `Build > Generate Signed Bundle / APK`.

## Notes

- This workspace does not currently include Gradle wrapper binaries or Android SDK, so APK generation was not completed here.
- The web assets are copied into `app/src/main/assets/web/`. If you change the main website files later, copy the updated files into that folder again before rebuilding the APK.
