Vercel deployment notes

- This project exposes an Express app via Vercel Serverless Functions under /api/*
- The catch-all handler is `api/[...path].js` which forwards requests to `src/app.js` and initializes Sequelize on warm starts.

Local testing with Vercel CLI:

1. Install Vercel CLI
```powershell
npm i -g vercel
```

2. Run locally
```powershell
vercel dev
```

3. Environment variables
Set your environment variables in the Vercel dashboard (Project Settings -> Environment Variables) or locally in a `.env` file for `vercel dev`.

Notes:
- Rotate any secrets that were previously committed.
- This setup expects Node.js 18+ on Vercel.
