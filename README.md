# Aivenue - AI-Powered Developer Roadmaps

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="100" height="100" style="color: hsl(225 100% 58%);">
    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
    <path d="M2 17l10 5 10-5"></path>
    <path d="M2 12l10 5 10-5"></path>
  </svg>
  <h1 align="center">Aivenue</h1>
</div>

<p align="center">
  Your ultimate developer roadmap tool. Stop guessing, start building. Aivenue creates personalized, step-by-step learning paths to help you achieve your career goals faster.
</p>

## ✨ Key Features

- **🤖 AI Roadmap Generation**: Get a personalized learning path tailored to your specific career goals and skill level in seconds.
- **💬 AI Assistant**: Stuck on a concept? Get instant, context-aware answers to your technical questions, 24/7.
- **🌐 Community Hub**: Connect with fellow learners, ask questions, share your progress, and comment on posts.
- **📈 Progress Tracking**: Save your generated roadmaps, track completed milestones with interactive checklists, and stay motivated on your learning journey.
- **👤 Authentication & Profiles**: Secure user accounts with full profile and settings management.
- **🌓 Light & Dark Mode**: A sleek, modern UI that adapts to your system's theme preference.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) (for Google's Gemini models)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **State Management**: React Hooks & Context API

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or newer recommended)
- `npm` or `yarn` package manager

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/aivenue.git
cd aivenue
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  In your project, go to **Project settings** > **General**.
3.  Under "Your apps", click the **Web** icon (`</>`) to add a new web app.
4.  Register the app and copy the `firebaseConfig` object. You will need these values for your environment variables.
5.  Navigate to the **Authentication** section and enable the **Email/Password** and **Google** sign-in methods.
6.  Navigate to the **Firestore Database** section and create a new database in **Production mode**. You will need to set up security rules for the `users`, `roadmaps`, `posts`, and `comments` collections.

### 4. Set Up Environment Variables

Create a new file named `.env` in the root of your project. Copy the contents of the `firebaseConfig` object and the other required keys into it, like so:

```env
# Firebase Public Keys
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...

# Google AI (Genkit)
# Go to https://aistudio.google.com/app/apikey to get your key
# Ensure the "Generative Language API" is enabled in your Google Cloud project
GOOGLE_API_KEY=AIza...
```

### 5. Run the Development Servers

This project requires two development servers to run concurrently: one for the Next.js frontend and one for the Genkit AI flows.

- **Terminal 1: Run the Next.js app**
  ```bash
  npm run dev
  ```
  This will start the web application, typically on `http://localhost:9002`.

- **Terminal 2: Run the Genkit flows**
  ```bash
  npm run genkit:watch
  ```
  This starts the Genkit development server, which watches for changes in your AI flow files.

You should now be able to access the application in your browser and use all of its features.
