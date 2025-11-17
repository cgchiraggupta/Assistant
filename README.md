# Assistant - AI Desktop Application

A lightweight cross-platform desktop application built with Tauri, Next.js, and React. This AI assistant uses OpenAI's Realtime API for real-time audio/voice interactions.

## 🚀 Features

- **Cross-platform**: Works on Windows, macOS, and Linux
- **Lightweight**: Final app size is only ~3-15MB (thanks to Tauri)
- **Real-time Audio**: Voice interaction using OpenAI's Realtime API
- **Modern UI**: Built with Next.js, React, and TailwindCSS
- **Fast**: Native desktop performance with Rust backend

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required for Development:

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Rust** (latest stable)
   - Install via rustup: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
   - Verify installation: `rustc --version`
   - After installation, restart your terminal or run: `source ~/.cargo/env`

3. **OpenAI API Key**
   - Get your API key from [platform.openai.com](https://platform.openai.com/api-keys)
   - You'll need access to the Realtime API

### Platform-Specific Requirements:

**macOS:**
- Xcode Command Line Tools: `xcode-select --install`

**Windows:**
- Microsoft Visual Studio C++ Build Tools
- WebView2 (usually pre-installed on Windows 10/11)

**Linux:**
- WebKit2GTK, libappindicator, and other dependencies
- Ubuntu/Debian: `sudo apt update && sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev`

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone git@github.com:cgchiraggupta/Assistant.git
cd Assistant
```

### 2. Set Up the Server

```bash
cd server
npm install

# Create .env file with your OpenAI API key
echo "KEY=your_openai_api_key_here" > .env
```

**Important:** Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 3. Set Up the Client

```bash
cd ../client
npm install
```

## 🖥️ Running the Desktop App

### Development Mode

To run the app in development mode with hot-reload:

```bash
cd client
npm run tauri:dev
```

This command will:
1. Start the Next.js development server
2. Launch the WebSocket server backend
3. Open the Tauri desktop application

**Note:** The first build may take 5-10 minutes as Rust compiles all dependencies.

### Production Build

To create a production build for your platform:

```bash
cd client
npm run tauri:build
```

The build process will:
1. Create an optimized production build of the frontend
2. Compile the Rust backend
3. Bundle everything into a native executable

Build outputs will be in:
- **macOS**: `client/src-tauri/target/release/bundle/dmg/`
- **Windows**: `client/src-tauri/target/release/bundle/msi/`
- **Linux**: `client/src-tauri/target/release/bundle/deb/` or `appimage/`

## 🌐 Running as Web Application (Optional)

If you prefer to run it as a traditional web app:

### Start the Server:
```bash
cd server
npm run dev
```

### Start the Client:
```bash
cd client
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Project Structure

```
Assistant/
├── client/                 # Frontend Next.js application
│   ├── src/               # Source files
│   │   ├── pages/         # Next.js pages
│   │   └── styles/        # CSS styles
│   ├── src-tauri/         # Tauri/Rust backend
│   │   ├── src/           # Rust source files
│   │   ├── icons/         # App icons
│   │   └── tauri.conf.json # Tauri configuration
│   ├── package.json       # Frontend dependencies
│   └── next.config.mjs    # Next.js configuration
├── server/                # WebSocket server
│   ├── index.js          # Server entry point
│   ├── utils/            # Helper functions
│   └── .env              # Environment variables (API keys)
└── README.md             # This file
```

## ⚙️ Configuration

### App Settings (`client/src-tauri/tauri.conf.json`)

You can customize:
- App name and identifier
- Window size and appearance
- Bundle settings
- Permissions and security settings

### Next.js Configuration (`client/next.config.mjs`)

The app is configured for static export (`output: 'export'`) which is required for Tauri.

## 🔧 Troubleshooting

### Build Fails with Rust Errors
- Ensure Rust is properly installed: `rustc --version`
- Update Rust: `rustup update`
- Clean and rebuild: `cd client/src-tauri && cargo clean`

### WebSocket Connection Fails
- Ensure the `.env` file exists in the `server/` directory
- Check that your OpenAI API key is valid
- Verify the server starts successfully (check logs)

### Next.js Build Errors
- Clear Next.js cache: `rm -rf client/.next client/out`
- Reinstall dependencies: `cd client && rm -rf node_modules && npm install`

### macOS: "App is damaged and can't be opened"
This happens because the app isn't signed. Run:
```bash
xattr -cr /path/to/Assistant.app
```

## 📝 Scripts Reference

### Client Scripts (run from `client/` directory):
- `npm run dev` - Start Next.js dev server
- `npm run build` - Build Next.js app for production
- `npm run tauri:dev` - Run desktop app in development mode
- `npm run tauri:build` - Build desktop app for production

### Server Scripts (run from `server/` directory):
- `npm run dev` - Start WebSocket server with nodemon

## 🚢 Distribution

After building, you can distribute:
- **macOS**: `.dmg` installer
- **Windows**: `.msi` installer
- **Linux**: `.deb` or `.AppImage` package

The final app size will be approximately 3-15MB depending on the platform.

## 🔐 Security Notes

- Never commit your `.env` file or API keys to version control
- The `.env` file is already in `.gitignore`
- For production, consider using environment-specific configurations
- The app runs with minimal permissions for security

## 📄 License

See repository for license information.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on the GitHub repository.

---

Built with ❤️ using [Tauri](https://tauri.app/), [Next.js](https://nextjs.org/), and [React](https://react.dev/)




