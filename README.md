# SuiTips (Move contract no-fee + React + TypeScript frontend)

This bundle contains:
- Move package (root)
- frontend/ - React + TypeScript (Vite) app

## Quick start

1. Edit `frontend/src/App.tsx` and replace PACKAGE_ID, USDC_TYPE with your deployed values.
2. Frontend:
   cd frontend
   npm install
   npm run dev

3. Move:
   sui move build
   sui client publish --gas-budget 200000000
