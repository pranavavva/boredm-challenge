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

The application will then be available on `http://0.0.0.0:80` (alternatively `http://127.0.0.1:80`).

## Reflection

I spent around 9-10 hours on this challenge, spread out over the course of a few days. Most of the time was in setting up the toolchain as opposed to actually implementing features. The file structure is representative of a larger-scale project, with isolated frontend and backend directories. I also implemented a dockerized deployment that should easily be able to be deployed to a cloud provider like Railway. Because the frontend and backend are separate, they can be scaled independently. The deployment structure isn't particularly "production-ready" but it should be a good starting point for a more robust deployment.

There are few places where I would add more features or change the way I did things:

- Frontend
  - Almost all of the UI and state management code is in a single `App.tsx` file. This would not be ideal in a larger-scale application, where we'd want to have a separation of UI, application logic, and business logic. This would improve maintainability, but for the sake of this challenge, I found it acceptable.
  - Due to the challenge requirements (and the very small scale of the application), I didn't use any third-party WebSocket library. I also handled all the state management and validation manually. In a larger application, I would use (or at least consider) third-party libraries for these tasks. In particular, I would use Redux to handle state management and RTK query for data fetching.
  - The UI itself is very bland and could be improved with a more focused design
- Backend
  - The backend is pretty straightforward and uses Quart due to its async capabilities. I quite like the way Quart handles websockets; even though this was my first time using websockets in a web application, I found it quite easy to use.
  - I use global variables to mock the database. In practice, we'd use something like Redis or Google Cloud Realtime Database to store the data. This allows for more robust data storage and enables the storage layer to scale independently of the application layer.
