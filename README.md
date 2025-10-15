# Waxly

A modern desktop application built with Electron, React, and TypeScript.

## Features

- ⚡ **Electron** - Build cross-platform desktop apps
- ⚛️ **React** - Modern UI library
- 📘 **TypeScript** - Type-safe development
- 🔄 **IPC Communication** - Seamless communication between main and renderer processes
- 🎨 **Modern UI** - Clean and responsive design

## Project Structure

```
Waxly/
├── src/
│   ├── main/           # Electron main process (Node.js backend)
│   │   └── main.ts     # Main process entry point
│   ├── renderer/       # React frontend
│   │   ├── App.tsx     # Main React component
│   │   └── App.css     # Component styles
│   ├── index.tsx       # React entry point
│   └── index.css       # Global styles
├── public/             # Static assets
│   └── index.html      # HTML template
├── dist/               # Compiled Electron code
├── build/              # Compiled React code
└── release/            # Packaged applications
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Run the application in development mode:

```bash
npm start
```

This will:
1. Start the React development server on `http://localhost:3000`
2. Launch the Electron application
3. Enable hot-reloading for both React and Electron

### Building

Build the application for production:

```bash
npm run build
```

This compiles both the React frontend and Electron main process.

### Packaging

Package the application for distribution:

```bash
# Package for all platforms
npm run package

# Package for specific platforms
npm run package:mac    # macOS
npm run package:win    # Windows
npm run package:linux  # Linux
```

The packaged applications will be available in the `release/` directory.

## Scripts

- `npm start` - Run the app in development mode
- `npm run build` - Build the app for production
- `npm run package` - Package the app for all platforms
- `npm run package:mac` - Package for macOS
- `npm run package:win` - Package for Windows
- `npm run package:linux` - Package for Linux
- `npm test` - Run tests

## IPC Communication

The app includes an example of IPC (Inter-Process Communication) between the main process and renderer process:

- **Renderer → Main**: Send messages using `ipcRenderer.send()`
- **Main → Renderer**: Respond using `event.reply()`

See `src/main/main.ts` and `src/renderer/App.tsx` for implementation details.

## Technologies Used

- **Electron** - Desktop application framework
- **React** - UI library
- **TypeScript** - Programming language
- **React Scripts** - Build tooling
- **Electron Builder** - Application packaging

## License

ISC
