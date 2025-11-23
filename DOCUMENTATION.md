# RecycLens Project Documentation

## Overview
RecycLens is a web application designed to help users identify and sort waste using AI, gamify the recycling process, and track their progress. This update introduces a multi-page structure, user onboarding, a points system, and a leaderboard.

## New Features

### 1. User Onboarding (Welcome Page)
- **Functionality**: Users are prompted to enter their name upon first visit.
- **Storage**: The username is stored in the browser's `localStorage`, so the user remains logged in across sessions.
- **File**: `views/WelcomeView.tsx`

### 2. Home Page
- **Functionality**: A central hub with navigation to the three main features.
- **Features**:
    - Displays the user's name.
    - Buttons for "Submit Proof", "Ask Gemini", and "Leaderboard".
    - Logout button to clear session.
- **File**: `views/HomeView.tsx`

### 3. Submit Proof
- **Functionality**: Allows users to take a photo of their recycling to earn points.
- **Process**:
    1. User opens the camera view.
    2. Captures a photo.
    3. Submits the photo.
    4. Earns 1 point (currently simulated).
- **Storage**: Points are accumulated and stored in `localStorage`.
- **File**: `views/SubmitProofView.tsx`

### 4. Ask Gemini (AI Assistant)
- **Functionality**: The core AI feature (Voice & Vision) that was previously the main page.
- **Update**: Added a "Home" button in the top-right corner to return to the main menu.
- **File**: `views/AskGeminiView.tsx`

### 5. Leaderboard
- **Functionality**: Displays a list of top recyclers.
- **Implementation**:
    - Shows a mocked list of top users.
    - Inserts the current user into the list with their actual points.
    - Sorts users by points (descending).
- **File**: `views/LeaderboardView.tsx`

## Project Structure

The project structure has been reorganized to support multiple views:

```
recyclens/
├── components/         # Reusable UI components (CameraView, Waveform)
├── services/           # Logic services (GeminiLiveService)
├── views/              # Page-level components
│   ├── AskGeminiView.tsx
│   ├── HomeView.tsx
│   ├── LeaderboardView.tsx
│   ├── SubmitProofView.tsx
│   └── WelcomeView.tsx
├── App.tsx             # Main application component (State & Navigation)
├── types.ts            # TypeScript definitions
└── ...
```

## How to Run

1.  **Install Dependencies** (if not already done):
    ```bash
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Future Improvements

-   **Backend Integration**: Currently, the leaderboard and user data are local. A backend (e.g., Firebase, Supabase) is needed for a global leaderboard and persistent user accounts.
-   **AI Verification**: The "Submit Proof" feature currently awards points automatically. Integrating Gemini Vision API to verify the photo contains actual recycling would make it functional.
-   **Routing**: For a more complex app, replacing the conditional rendering in `App.tsx` with `react-router-dom` would provide better URL management and browser history support.
