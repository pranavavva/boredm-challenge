# boredm-challenge

My submission for the BoreDM Full Stack Developer Challenge [here](https://boredmlogs.notion.site/BoreDM-Full-Stack-Developer-Final-Coding-Challenge-5d8cd0917aa148bb8d54f2dc11ad349c).

## Installation

Toolchain versions:
- Node.js: 21.7.1
- Pnpm: 8.15.5
- Python: 3.12.2

The backend and frontend are self-contained in their own subdirectories. The backend is a Python Quart app and the frontend is a React app built using the Vite framework.

### Docker

The easiest way to run the app is to use Docker. The `compose.yml` in the root of the repository will build and run the app.

```bash
docker compose up --build
```

The application will then be available on `http://localhost:80`.