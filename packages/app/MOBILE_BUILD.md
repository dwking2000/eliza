# ElizaOS Mobile Build Guide

This guide explains how to build the ElizaOS app for mobile platforms (iOS and Android) using Tauri.

## Overview

The ElizaOS Tauri app is now configured for cross-platform deployment including:
- **Desktop**: Linux, macOS, Windows
- **Mobile**: iOS (13.0+), Android (API 24+)

## Architecture

### Desktop Mode
- Automatically starts local ElizaOS server (`elizaos start`)
- Connects to `http://localhost:3000`
- Manages server lifecycle (starts on launch, stops on exit)

### Mobile Mode
- No local server (shell commands not available on mobile)
- Prompts user to configure remote server URL
- Connects to remote ElizaOS server instance
- Requires manual server setup on accessible host

## Prerequisites

### All Platforms
- **Bun**: Package manager (already installed)
- **Rust**: 1.70+ (install from https://rustup.rs)
- **Node.js**: 18+ (for Tauri CLI)

### Android Development
- **Android Studio**: Latest stable version
- **Android SDK**: API Level 24 or higher
- **Android NDK**: Latest LTS version
- **Java JDK**: 17 or higher

#### Android Environment Setup

1. Install Android Studio from https://developer.android.com/studio

2. Install required SDK components via Android Studio:
   - Android SDK Platform 24 or higher
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android SDK Platform-Tools
   - Android NDK (from SDK Manager)

3. Set environment variables:
   ```bash
   # Add to ~/.bashrc, ~/.zshrc, or ~/.profile
   export ANDROID_HOME=$HOME/Android/Sdk
   export NDK_HOME=$ANDROID_HOME/ndk/$(ls -1 $ANDROID_HOME/ndk)
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   ```

4. Accept Android SDK licenses:
   ```bash
   $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
   ```

### iOS Development (macOS only)
- **Xcode**: 14.0 or higher
- **Xcode Command Line Tools**
- **CocoaPods**: For dependency management

#### iOS Environment Setup

1. Install Xcode from the Mac App Store

2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```

3. Install CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

4. Accept Xcode license:
   ```bash
   sudo xcodebuild -license accept
   ```

## Initial Mobile Setup

### 1. Install Dependencies

From the `packages/app` directory:

```bash
bun install
```

### 2. Initialize Mobile Platforms

#### Android
```bash
bun run android:init
```

This will:
- Create `src-tauri/gen/android/` directory
- Generate Android project structure
- Configure AndroidManifest.xml
- Set up Gradle build files

#### iOS (macOS only)
```bash
bun run ios:init
```

This will:
- Create `src-tauri/gen/apple/` directory
- Generate Xcode project
- Configure Info.plist
- Set up iOS-specific resources

#### Both Platforms
```bash
bun run mobile:init
```

## Building for Mobile

### Android

#### Development Build (Debug)
```bash
bun run android:dev
```

This will:
- Build the app in debug mode
- Install on connected device/emulator
- Open Android Studio for development

#### Production Build (APK)
```bash
bun run android:build:apk
```

Output: `src-tauri/gen/android/app/build/outputs/apk/release/`

#### Production Build (AAB for Google Play)
```bash
bun run android:build:aab
```

Output: `src-tauri/gen/android/app/build/outputs/bundle/release/`

### iOS (macOS only)

#### Development Build
```bash
bun run ios:dev
```

This will:
- Build the app in debug mode
- Open Xcode for development
- Can deploy to simulator or device

#### Production Build
```bash
bun run ios:build
```

This generates an Xcode archive ready for App Store submission.

## Desktop Development

### Development Mode
```bash
bun run tauri:dev
```

Starts both Vite dev server and Tauri window with hot reload.

### Production Build
```bash
bun run tauri:build
```

Creates platform-specific installers:
- **Linux**: `.deb`, `.AppImage`
- **macOS**: `.dmg`, `.app`
- **Windows**: `.msi`, `.exe`

## Configuration

### Server URL Configuration

#### Desktop
- Default: `http://localhost:3000`
- Automatically starts local server
- Can be reconfigured via UI if local server fails

#### Mobile
- Prompts for server URL on first launch
- User must provide accessible server URL (e.g., `https://eliza.example.com`)
- Can be reconfigured via "Configure Server" button

### Tauri Configuration

Main configuration: `src-tauri/tauri.conf.json`

```json
{
  "identifier": "ai.elizaos.app",
  "bundle": {
    "iOS": {
      "minimumSystemVersion": "13.0"
    },
    "android": {
      "minSdkVersion": 24
    }
  }
}
```

### Permissions and Capabilities

Capabilities are defined in `src-tauri/capabilities/`:
- `default.json`: Desktop permissions
- `mobile.json`: Mobile-specific permissions

## Platform-Specific Code

The app uses Rust `cfg` attributes to handle platform differences:

```rust
#[cfg(desktop)]
{
    // Desktop-only code (start server, etc.)
}

#[cfg(mobile)]
{
    // Mobile-only code
}

#[cfg(target_os = "android")]
{
    // Android-specific code
}

#[cfg(target_os = "ios")]
{
    // iOS-specific code
}
```

## Troubleshooting

### Android

**Issue**: `ANDROID_HOME not set`
- **Solution**: Set environment variables as described in prerequisites

**Issue**: `Android SDK not found`
- **Solution**: Install Android Studio and SDK components

**Issue**: Build fails with NDK error
- **Solution**: Ensure NDK is installed and `NDK_HOME` is set

**Issue**: Gradle build fails
- **Solution**: Clear Gradle cache: `./gradlew clean` in `src-tauri/gen/android/`

### iOS

**Issue**: `xcode-select: error: tool 'xcodebuild' requires Xcode`
- **Solution**: Install Xcode and Command Line Tools

**Issue**: CocoaPods dependency resolution fails
- **Solution**: Update CocoaPods: `sudo gem update cocoapods`

**Issue**: Code signing issues
- **Solution**: Configure signing in Xcode project settings

### General

**Issue**: TypeScript compilation errors
- **Solution**: `bun install` to ensure all dependencies are installed

**Issue**: Vite build fails
- **Solution**: Clear node_modules and dist: `rm -rf node_modules dist && bun install`

**Issue**: Rust compilation errors
- **Solution**: Update Rust: `rustup update`

## Testing

### Desktop
```bash
# Development mode with auto-reload
bun run tauri:dev

# Production build test
bun run tauri:build
```

### Android
```bash
# Connect Android device or start emulator
adb devices

# Run in development mode
bun run android:dev
```

### iOS
```bash
# Open iOS simulator
open -a Simulator

# Run in development mode
bun run ios:dev
```

## Deployment

### Android (Google Play)

1. Build AAB:
   ```bash
   bun run android:build:aab
   ```

2. Sign the AAB (if not already signed)

3. Upload to Google Play Console

4. Follow Play Store submission guidelines

### iOS (App Store)

1. Build for release:
   ```bash
   bun run ios:build
   ```

2. Open Xcode and archive the app

3. Use Xcode's Organizer to submit to App Store

4. Follow App Store submission guidelines

### Desktop

Build installers for each platform:
```bash
bun run tauri:build
```

Distribute via:
- GitHub Releases
- Direct download from website
- Platform-specific package managers

## Server Requirements for Mobile

Since mobile apps cannot run the ElizaOS server locally, you need to deploy a server instance that's accessible over the internet:

### Option 1: Cloud Deployment
- Deploy ElizaOS server to cloud provider (AWS, GCP, Azure, DigitalOcean, etc.)
- Ensure HTTPS is configured (required for mobile)
- Configure CORS to allow mobile app domain
- Set appropriate security (API keys, rate limiting)

### Option 2: Development Server
- Run `elizaos start` on your local machine
- Use tunneling service (ngrok, localtunnel, cloudflared) to expose local server
- Use the tunnel URL in mobile app

### Server Configuration Checklist
- ✅ Accessible via HTTPS
- ✅ CORS configured for Tauri app
- ✅ WebSocket support enabled
- ✅ API authentication configured
- ✅ Firewall allows ports 80/443

## Additional Resources

- [Tauri Mobile Documentation](https://tauri.app/develop/mobile/)
- [Tauri Prerequisites](https://tauri.app/start/prerequisites/)
- [Android Developer Guide](https://developer.android.com/guide)
- [iOS Developer Guide](https://developer.apple.com/develop/)
- [ElizaOS Documentation](https://elizaos.ai/docs)

## Support

For issues or questions:
- GitHub Issues: https://github.com/elizaos/eliza/issues
- Discord: https://discord.gg/elizaos
- Documentation: https://elizaos.ai

---

**Note**: Mobile builds are in active development. Some features available on desktop may not yet be fully implemented on mobile. Please report any issues you encounter.
