<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/3fc85755-9ccd-418e-9b68-808aa658e498" />


## Quick start
 
### Requirements
 
- Node.js 18+
- npm
### Install
 
```bash
git clone https://github.com/krwg/Tiver.git
cd Tiver
npm install
```
 
### Run (frontend only)
 
```bash
npm run dev
```
 
Guest mode works without a backend — open `welc.html` or go straight to `guestfeed.html`.
 
### Run with server (auth enabled)
 
```bash
# Terminal 1 — backend
npm run server
 
# Terminal 2 — Vite
npm run dev
```
 
### Build
 
```bash
# Production build
npm run build
 
# Build archive version
npm run archive
 
# Sync archive from source
npm run sync-archive
 
# Preview production build locally
npm run preview
```
 
