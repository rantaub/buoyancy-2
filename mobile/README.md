# FossilLens Mobile

## Run on your iPhone (no Mac needed)

1. Install **Expo Go** from the App Store on your iPhone
2. On your computer, open a terminal in this folder
3. Run: `npm install`
4. Run: `npx expo start`
5. Scan the QR code with your iPhone camera (iOS 16+) or in Expo Go
6. The app opens on your phone!

## Add your Anthropic API key (optional)

Create a `.env.local` file:
```
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Without it, the app uses demo ammonite data so you can test the full UI.
