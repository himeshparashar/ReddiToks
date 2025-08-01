# 🎬 Reddit to Video Generator

This project is a Next.js-based web application that automates the process of creating videos from Reddit threads. It allows users to input a Reddit URL, customize the script, select a background video, and generate a video. The application manages state using Zustand, interacts with a backend API for video generation, and provides a user-friendly interface for customizing the video creation process.

## 🚀 Key Features

- **Reddit Thread Input:** Accepts Reddit URLs and fetches thread data.
- **Script Editor:** Allows users to view, edit, and customize the video script.
- **Background Video Selection:** Provides a selection of background videos to choose from.
- **Automated Script Generation:** Automatically generates a script from the Reddit thread.
- **Voice Selection:** Allows users to select voices for each speaker in the script.
- **Real-time Progress Updates:** Displays the video generation progress.
- **Customizable Subtitles:** Allows users to customize the style of the subtitles.
- **Static Export:** Configured for static export, making it easy to deploy on static hosting platforms.
- **API Integration:** Interacts with a backend API to handle video generation and progress updates.
- **State Management:** Uses Zustand for efficient state management across components.
- **UI Components:** Uses custom UI components for a consistent look and feel.

## 🛠️ Tech Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/): React framework for building the user interface.
    *   [React](https://reactjs.org/): JavaScript library for building user interfaces.
    *   [TypeScript](https://www.typescriptlang.org/): Superset of JavaScript that adds static typing.
    *   [Zustand](https://github.com/pmndrs/zustand): State management library.
    *   [Framer Motion](https://www.framer.com/motion/): Animation library.
    *   [Lucide React](https://lucide.dev/): Icon library.
    *   [Tailwind CSS](https://tailwindcss.com/): CSS framework for styling.
    *   [clsx](https://github.com/lukeed/clsx): Utility for constructing className strings conditionally.
    *   [tailwind-merge](https://github.com/dcastil/tailwind-merge): Utility for merging Tailwind CSS classes.
    *   [Sonner](https://sonner.emilkowalski.com/): Toast notification library.
    *   [next/font](https://nextjs.org/docs/basic-features/font-optimization): Font optimization for Next.js.
    *   [next/link](https://nextjs.org/docs/api-reference/next/link): Navigation between pages.
*   **Build Tools:**
    *   [ESLint](https://eslint.org/): JavaScript linter.

## 📦 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  Install dependencies:

    ```bash
    npm install # or yarn install
    ```

3.  Set up environment variables:

    Create a `.env.local` file in the root directory and add the following:

    ```
    NEXT_PUBLIC_API_URL=http://localhost:3001 # Replace with your backend API URL
    ```

### Running Locally

1.  Start the development server:

    ```bash
    npm run dev # or yarn dev
    ```

2.  Open your browser and navigate to `http://localhost:3000`.

## 💻 Usage

1.  Enter a Reddit URL in the input field.
2.  Customize the script in the script editor.
3.  Select a background video.
4.  Click the "Generate Video" button.
5.  Monitor the progress of the video generation.
6.  Download the generated video.

## 📂 Project Structure

```
frontend/
├── app/
│   └── layout.tsx           # Root layout for the application
├── components/
│   ├── create/
│   │   ├── GenerateButton.tsx   # Button to trigger video generation
│   │   ├── RedditInputCard.tsx  # Input for Reddit URL
│   │   ├── ScriptEditor.tsx     # Editor for customizing the script
│   │   └── VideoSelector.tsx    # Selector for background videos
│   ├── home/
│   │   ├── HeroSection.tsx      # Hero section of the homepage
│   │   └── HowItWorks.tsx       # Section explaining the workflow
│   └── ui/                   # Custom UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
├── lib/
│   ├── api.ts               # API client for interacting with the backend
│   ├── utils.ts             # Utility functions
│   └── videoUtils.ts        # Utility functions for video handling
├── public/
│   └── ...                  # Static assets
├── store/
│   └── useStore.ts          # Zustand store for managing application state
├── next.config.js           # Next.js configuration file
└── tsconfig.json            # TypeScript configuration file
```

## 📸 Screenshots

(Add screenshots of the application here)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Push your changes to your fork.
5.  Submit a pull request.

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 📬 Contact

If you have any questions or suggestions, feel free to contact me at [your-email@example.com](mailto:your-email@example.com).

## 💖 Thanks

Thanks for checking out this project! I hope it's helpful.

This README file is generated by [readme.ai](https://readme-generator-phi.vercel.app/).
