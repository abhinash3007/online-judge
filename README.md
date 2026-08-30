# Online Judge

A full-stack online judge platform for practicing competitive-programming problems — browse problems, write and run code in the browser, submit against hidden test cases, and get an AI-generated code review powered by Groq's LLM API.

The system is split into three independently deployable services:

| Service | Folder | Description | Default Port |
|---|---|---|---|
| **API** | [`api/`](api/) | Main backend — auth, questions, test cases, submissions, AI review. Talks to MongoDB and to the execution service. | `5000` |
| **Execution Service** | [`execution-service/`](execution-service/) | Sandboxed code runner. Compiles/executes C++, Java, and Python submissions and returns verdicts. | `8000` (`8080` in Docker) |
| **Frontend** | [`frontend/frontendJudge/`](frontend/frontendJudge/) | React + Vite single-page app that consumes the API. | `5173` |

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Execution Service setup](#2-execution-service-setup)
  - [3. API setup](#3-api-setup)
  - [4. Frontend setup](#4-frontend-setup)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [API Reference](#api-reference)
- [Code Execution Flow](#code-execution-flow)
- [Data Models](#data-models)
- [Deployment](#deployment)
- [Known Limitations / TODO](#known-limitations--todo)

## Architecture

```
                        ┌────────────────────┐
                        │      Frontend       │
                        │  React + Vite (SPA)  │
                        │   (frontendJudge)     │
                        └─────────┬────────────┘
                                  │ REST (axios) + cookies/JWT
                                  ▼
                        ┌────────────────────┐
                        │        API          │
                        │ Express + Mongoose   │
                        │      (api/)           │
                        │  auth · questions ·   │
                        │  testcases · code ·   │
                        │  AI review (Groq)     │
                        └─────────┬────────────┘
                                  │ REST (axios)
                                  ▼
                        ┌────────────────────┐
                        │  Execution Service   │
                        │ Express (sandboxed)   │
                        │ (execution-service/)  │
                        │ g++ · python3 · javac │
                        └─────────┬────────────┘
                                  │
                                  ▼
                        ┌────────────────────┐
                        │      MongoDB         │
                        │ (users, questions,    │
                        │  testcases, submiss.) │
                        └────────────────────┘
```

- The **frontend** never talks to the execution service directly — every request goes through the API, which owns auth, persistence, and business rules.
- The **API** is stateless code-wise; it delegates all compiling/running to the **execution service** over HTTP and simply stores the resulting verdict.
- The **execution service** is a disposable sandbox: it writes the submitted code and stdin to temp files, spawns a compiler/interpreter process with a timeout, captures stdout/stderr, and cleans up the generated files afterwards.

## Tech Stack

**Backend (`api/`)**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`) + `bcrypt` for auth
- `cookie-parser`, `cors`
- `groq-sdk` (Llama 3.3 70B) for AI code review — `@anthropic-ai/sdk` is also installed as a dependency
- `axios` to call the execution service
- `nodemon` for local dev

**Execution Service (`execution-service/`)**
- Node.js + Express 5
- Spawns native `g++`, `python3`, and `javac`/`java` processes
- `uuid` for unique file/session naming
- Dockerized with all three toolchains preinstalled

**Frontend (`frontend/frontendJudge/`)**
- React 19 + Vite 8
- React Router 7
- Redux Toolkit + `redux-persist` for auth/session state
- `@monaco-editor/react` — in-browser code editor (VS Code's editor)
- Tailwind CSS 4
- `axios` for API calls

## Repository Structure

```
ONLINE_JUDGE/
├── api/                          # Main backend API
│   ├── controllers/
│   │   ├── authController.js      # login / register
│   │   ├── codeController.js      # run / submit / AI review
│   │   ├── questionsController.js # CRUD for problems
│   │   ├── submissionController.js
│   │   └── testCasesController.js # CRUD for test cases
│   ├── middleware/
│   │   └── verifyUser.js          # JWT auth guard
│   ├── models/
│   │   ├── user.js
│   │   ├── question.js
│   │   ├── testCase.js
│   │   ├── submission.js
│   │   └── aiReviewUsage.js       # daily AI-review rate limit tracking
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth
│   │   ├── questionRoutes.js      # /api/questions
│   │   ├── testCasesRoutes.js     # /api/testcases
│   │   └── codeExeRouter.js       # /api/code
│   ├── index.js                   # app entrypoint
│   └── package.json
│
├── execution-service/            # Sandboxed compile/run service
│   ├── controllers/
│   │   └── codeController.js      # execute / submit (multi test case)
│   ├── executors/
│   │   ├── executeCPP.js
│   │   ├── executePython.js
│   │   ├── executeJava.js
│   │   └── cpp/
│   │       ├── compileCpp.js      # compile once, reuse for all test cases
│   │       └── runCpp.js
│   ├── utils/
│   │   ├── generateFilePath.js    # writes submitted code to codes/
│   │   ├── generateInputPath.js   # writes stdin to inputs/
│   │   ├── runProcess.js          # spawn + timeout + stdout/stderr capture
│   │   └── cleanupFilePath.js     # deletes generated files/artifacts
│   ├── codes/                     # generated at runtime (gitignored)
│   ├── inputs/                    # generated at runtime (gitignored)
│   ├── routes/
│   │   └── codeRoutes.js          # /code
│   ├── Dockerfile                 # node:20 + g++, python3, openjdk-17
│   ├── index.js
│   └── package.json
│
└── frontend/
    └── frontendJudge/             # React + Vite SPA
        ├── src/
        │   ├── pages/
        │   │   ├── Home.jsx
        │   │   ├── Login.jsx
        │   │   ├── Register.jsx
        │   │   ├── Questions.jsx
        │   │   └── CreateQuestion.jsx
        │   ├── compenents/
        │   │   ├── Header.jsx
        │   │   ├── Problems.jsx        # problem detail + editor + run/submit
        │   │   └── ProtectedRoute.jsx  # route guard for authed pages
        │   ├── utils/
        │   │   ├── appStore.js         # Redux store (persisted)
        │   │   └── authSlice.js
        │   ├── App.jsx
        │   └── main.jsx
        ├── vite.config.js
        └── package.json
```

## Features

- **Auth** — register/login with hashed passwords (`bcrypt`) and JWT stored in an HTTP cookie (`access_token`) and/or `Authorization` header.
- **Problem management** — authenticated users can create, update, and delete problems (title, description, difficulty, input/output format, constraints, topics); anyone can browse and view problems.
- **Test cases** — problem owners can attach visible/hidden test cases used to judge submissions.
- **In-browser code editor** — Monaco editor with support for C++, Java, and Python.
- **Run** — execute code against ad-hoc/custom input and see raw output.
- **Submit** — run code against every test case for a problem and get a verdict: `AC` (Accepted), `WA` (Wrong Answer), `TLE` (Time Limit Exceeded), `RE` (Runtime Error), or `CE` (Compilation Error).
- **Submission history** — each submission is persisted with the user, problem, code, language, status, and error output.
- **AI code review** — once per user, per problem, per day, a user can request an LLM-generated review (correctness, complexity, bugs, optimization tips, and hint-only guidance) via Groq's `llama-3.3-70b-versatile` model, scoped to the specific problem statement.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (the execution service Docker image uses Node 20)
- [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- Compilers/interpreters on the machine running the **execution service** (skip this if you run it via Docker):
  - `g++` (C++)
  - `python3` (Python)
  - JDK 17 (`javac` / `java`) (Java)
- A [Groq API key](https://console.groq.com/) for the AI review feature

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd ONLINE_JUDGE
```

Each service has its own `package.json` and must be installed/run independently.

### 2. Execution Service setup

```bash
cd execution-service
npm install
npm run start   # or: node index.js
```

Runs on `http://localhost:8000` by default (override with `PORT`). It exposes:

- `POST /code/execute`
- `POST /code/submit`

> This service shells out to `g++`, `python3`, and `java`/`javac`, so those must be installed and on your `PATH`. Alternatively, run it via Docker (see [Running with Docker](#running-with-docker)).

### 3. API setup

```bash
cd api
npm install
cp .env.example .env   # then fill in the values, see below
npm run start           # nodemon-based dev script, or: node index.js
```

Runs on `http://localhost:5000`. It requires **MongoDB** and the **execution service** to be reachable.

### 4. Frontend setup

```bash
cd frontend/frontendJudge
npm install
cp .env.example .env   # set VITE_API_URL, see below
npm run dev
```

Runs on `http://localhost:5173` by default and talks to the API via `VITE_API_URL`.

## Environment Variables

None of the `.env` files are committed (they're gitignored) — create them yourself in each service's root folder.

### `api/.env`

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign/verify JWTs |
| `GROQ_API_KEY` | API key for Groq (used by the AI code review endpoint) |
| `EXECUTION_SERVICE_URL` | Base URL of the execution service, e.g. `http://localhost:8000` |
| `MAIN_URL` | (Optional) public URL of this API, used for reference/deployment |

### `execution-service/.env` (optional)

| Variable | Description |
|---|---|
| `PORT` | Port to listen on (defaults to `8000`) |

### `frontend/frontendJudge/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the API service, e.g. `http://localhost:5000` |

> ⚠️ **Security note:** rotate any credentials (Mongo URI, JWT secret, API keys) that may have ever been committed or shared in plaintext, and never commit real `.env` values — keep only `.env.example` files with placeholder values in version control.

## Running with Docker

Only the **execution service** currently ships a `Dockerfile` (it needs g++, Python, and a JDK preinstalled):

```bash
cd execution-service
docker build -t online-judge-executor .
docker run -p 8080:8080 --env-file .env online-judge-executor
```

The container installs `g++`, `python3`, and `openjdk-17-jdk` on top of `node:20`, then runs `node index.js`. Point the API's `EXECUTION_SERVICE_URL` at wherever this container is exposed (`http://localhost:8080` locally).

The `api` and `frontend` services don't have Dockerfiles yet — run them with Node/Vite directly, or add your own containerization as needed (see [Known Limitations / TODO](#known-limitations--todo)).

## API Reference

Base URL: `http://localhost:5000/api`

### Auth — `/auth`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/auth/register` | — | `{ name, email, password }` | Create a new user |
| POST | `/auth/login` | — | `{ email, password }` | Log in, sets `access_token` cookie and returns a JWT |

### Questions — `/questions`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/questions/create` | ✅ | Create a problem |
| GET | `/questions/all` | — | List all problems |
| GET | `/questions/:id` | — | Get a single problem |
| PUT | `/questions/update/:id` | ✅ (owner only) | Update a problem |
| DELETE | `/questions/delete/:id` | ✅ (owner only) | Delete a problem |

### Test Cases — `/testcases`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/testcases/addTestcases/:problemId` | ✅ (owner only) | Add one or more test cases (`{ testCases: [{ input, output, isHidden }] }`) |
| GET | `/testcases/getTestCases/:problemId` | — | Paginated list of test cases (`?page=&limit=`) |
| DELETE | `/testcases/deleteTestCase/:testCaseId` | ✅ (owner only) | Delete a test case |

### Code Execution — `/code`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/code/run` | ✅ | `{ code, language, input }` | Run code against a single custom input and return raw output |
| POST | `/code/submit` | ✅ | `{ code, language, questionId }` | Run code against all of a problem's test cases, persist a `Submission`, return the verdict |
| POST | `/code/review` | ✅ | `{ code, language, questionId, query? }` | Get an AI-generated review of the submitted code (max once per user/problem/day) |

`language` is one of `cpp`, `java`, `python` (submission storage also allows `javascript`, though the execution service doesn't currently support it — see [Known Limitations](#known-limitations--todo)).

### Execution Service — internal, called by the API

Base URL: `EXECUTION_SERVICE_URL` (default `http://localhost:8000`)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/code/execute` | `{ code, language, input, expectedOutput? }` | Compile/run once against a single input; compares to `expectedOutput` if provided |
| POST | `/code/submit` | `{ code, language, input: [{ input, output }, ...] }` | Compile once (for C++), run against every test case, stop at the first failure, return a verdict |

## Code Execution Flow

1. **Frontend** sends code + language (+ input or `questionId`) to the **API** (`/api/code/run` or `/api/code/submit`), authenticated via JWT cookie/header.
2. **API**:
   - For `run`, forwards the request as-is to the execution service.
   - For `submit`, fetches the problem's test cases from MongoDB, normalizes JSON-style test case input/output into plain stdin/stdout text, and forwards the code + normalized test cases to the execution service.
3. **Execution Service**:
   - Writes the code to a uniquely named file under `codes/` and any stdin to `inputs/` (via `uuid`-based naming).
   - For C++, compiles once with `g++` and reuses the binary across all test cases (`compileCpp` / `runCpp`); Python and Java are interpreted/compiled per run.
   - Runs the process with a timeout, capturing stdout/stderr, and maps the outcome to a verdict: `AC`, `WA`, `TLE`, `RE`, or `CE`.
   - Deletes the generated code/input/artifact files once done (`cleanup`).
4. **API** persists a `Submission` document (user, question, code, language, status, error) and returns the verdict to the frontend.
5. **AI Review** (separate path): the API loads the problem statement, builds a mentor-style prompt embedding the student's code and (optionally) their question, sends it to Groq's `llama-3.3-70b-versatile`, and returns structured Markdown feedback (Correctness / Complexity / Issues / Optimization / Hints). Usage is capped to one review per user per problem per calendar day via the `AIReviewUsage` collection.

## Data Models

**User**
`name`, `email` (unique), `password` (bcrypt-hashed)

**Question**
`user` (owner ref), `title`, `description`, `difficulty` (`easy`/`medium`/`hard`), `inputFormat`, `outputFormat`, `constraints[]`, `topic[]`, `slug` (unique, derived from title), timestamps

**TestCase**
`input`, `output`, `problemId` (ref), `isHidden`, timestamps

**Submission**
`user` (ref), `question` (ref), `code`, `language` (`cpp`/`java`/`python`/`javascript`), `status` (`Pending`/`Accepted`/`Wrong Answer`/`Runtime Error`/`Time Limit Exceeded`/`Compilation Error`), `error`, timestamps

**AIReviewUsage**
`user` (ref), `question` (ref), `date` (`YYYY-MM-DD`) — unique compound index on `(user, question, date)` to enforce the daily rate limit

## Deployment

The `.env` files reference a deployed setup as an example:
- API + execution service on Render
- Frontend on Vercel

The API's CORS config (`api/index.js`) currently allows `https://online-judge-six-zeta.vercel.app` and `http://localhost:5173` — update this list (and the frontend's `VITE_API_URL`) to match your own deployment domains.

## Known Limitations / TODO

- `submissionController.js` exists but is currently unused by any route.
- `Submission.language` allows `javascript`, but the execution service has no JavaScript executor yet.
- `execution-service`'s single-shot `executeCode` for `run` doesn't reuse the compiled C++ binary the way `submitCode` does (no `compileCpp`/`runCpp` split), and `filePath`/`inputFilePath` are referenced in its `finally` block outside their `try` scope — worth double-checking if you hit an execution error there.
- `testCasesController.deleteTestCase` authorizes the request but never actually deletes the test case or returns a response.
- No automated tests are configured yet (`npm test` is a placeholder in both `api` and `execution-service`).
- No Dockerfile for the `api` or `frontend` services yet.
- The execution service has no persistent sandboxing/resource isolation beyond a process timeout — don't expose it directly to untrusted public traffic without hardening (e.g., containerized per-submission execution, stricter resource/time/memory limits, and disabling networking for the executed code).
