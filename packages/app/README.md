# ElizaOS - Cross-Platform Desktop & Mobile App

ElizaOS Tauri application for managing and interacting with AI agents across desktop and mobile platforms.

## Features

- **Cross-Platform**: Runs on Linux, macOS, Windows, iOS, and Android
- **Desktop Mode**: Automatically manages local ElizaOS server
- **Mobile Mode**: Connects to remote ElizaOS server instances
- **Configurable**: Server URL configuration for flexible deployment
- **Native Performance**: Built with Tauri for optimal performance
- **Modern UI**: React + TypeScript + Vite

## Platform Support

### Desktop
- ✅ Linux (AppImage, .deb)
- ✅ macOS (.dmg, .app)
- ✅ Windows (.msi, .exe)

### Mobile
- ✅ iOS 13.0+ (via App Store or TestFlight)
- ✅ Android 7.0+ (API 24+) (via Google Play or APK)

## Quick Start

### Development

```bash
# Install dependencies
bun install

# Desktop development mode
bun run tauri:dev

# Android development
bun run android:dev

# iOS development (macOS only)
bun run ios:dev
```

### Building

```bash
# Desktop build
bun run tauri:build

# Android APK
bun run android:build:apk

# Android AAB (Google Play)
bun run android:build:aab

# iOS build (macOS only)
bun run ios:build
```

## Mobile Setup

For detailed mobile build instructions, see [MOBILE_BUILD.md](./MOBILE_BUILD.md).

### Prerequisites
- **Android**: Android Studio + Android SDK + NDK
- **iOS**: Xcode 14+ (macOS only)

### First-Time Setup
```bash
# Initialize mobile platforms
bun run mobile:init

# Or individually
bun run android:init  # Android only
bun run ios:init      # iOS only (macOS)
```

## Architecture

### Desktop
- Runs local ElizaOS server (`elizaos start`)
- Connects to `http://localhost:3000`
- Manages server lifecycle automatically

### Mobile
- Connects to remote ElizaOS server
- User configures server URL on first launch
- Requires deployed ElizaOS server instance (HTTPS recommended)

## Configuration

The app adapts to the platform automatically:

- **Desktop**: Uses local server by default
- **Mobile**: Prompts for server URL configuration

Server URL can be reconfigured anytime via the "Configure Server" button.

## Development

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Rust + Tauri 2.0
- **UI Components**: Custom styled components
- **API**: Tauri commands for platform detection and configuration

### Project Structure
```
packages/app/
├── src/                  # React frontend
│   └── main.tsx         # Main app component
├── src-tauri/           # Rust backend
│   ├── src/
│   │   └── lib.rs       # Tauri commands and setup
│   ├── capabilities/    # Platform permissions
│   ├── tauri.conf.json  # Tauri configuration
│   └── Cargo.toml       # Rust dependencies
├── dist/                # Build output
└── MOBILE_BUILD.md      # Mobile setup guide
```

## Commands Reference

### Development
- `bun run dev` - Vite dev server only
- `bun run tauri:dev` - Desktop app with hot reload
- `bun run android:dev` - Android app development
- `bun run ios:dev` - iOS app development

### Building
- `bun run build` - Build frontend only
- `bun run tauri:build` - Build desktop app
- `bun run android:build` - Build Android app
- `bun run android:build:apk` - Build Android APK
- `bun run android:build:aab` - Build Android App Bundle
- `bun run ios:build` - Build iOS app

### Setup
- `bun run android:init` - Initialize Android platform
- `bun run ios:init` - Initialize iOS platform
- `bun run mobile:init` - Initialize both mobile platforms

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + Extensions:
  - [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Troubleshooting

See [MOBILE_BUILD.md](./MOBILE_BUILD.md#troubleshooting) for platform-specific issues.

## Contributing

This package is part of the ElizaOS monorepo. Follow the main project guidelines:
- Use `bun` for package management (never `npm` or `pnpm`)
- Run `bun run lint` before committing
- Test on all target platforms when possible

## License

MIT

## Resources

- [ElizaOS Documentation](https://elizaos.ai/docs)
- [Tauri Documentation](https://tauri.app)
- [React Documentation](https://react.dev)
- [GitHub Repository](https://github.com/elizaos/eliza)
