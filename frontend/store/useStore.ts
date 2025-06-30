import { create } from 'zustand';

interface RedditThread {
  title: string;
  comments: any[];
  url: string;
  author?: string;
  upvotes?: number;
}

interface ScriptLine {
  id: string;
  speaker: string;
  text: string;
  voiceId: string;
  emotion?: string;
}

interface SubtitleStyle {
  font: string;
  color: string;
  position: 'top' | 'bottom' | 'center';
  size: 'small' | 'medium' | 'large';
}

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface Project {
  id: string;
  title: string;
  thumbnail?: string;
  createdAt: string;
  status: 'draft' | 'rendering' | 'completed';
}

interface AppState {
  // Reddit & Script
  redditThread: RedditThread | null;
  script: ScriptLine[];
  selectedVoices: Record<string, string>;
  
  // Video & Style
  backgroundVideo: string | null;
  subtitleStyle: SubtitleStyle;
  
  // Render Status
  renderStatus: 'idle' | 'queued' | 'rendering' | 'completed' | 'error';
  currentRender: {
    id: string | null;
    progress: number;
    message: string;
    videoUrl: string | null;
  };
  
  // User & Projects
  user: User | null;
  projects: Project[];
  
  // UI State
  isCreating: boolean;
  showAuthModal: boolean;
  
  // Actions
  setRedditThread: (thread: RedditThread) => void;
  updateScript: (script: ScriptLine[]) => void;
  addScriptLine: (line: Omit<ScriptLine, 'id'>) => void;
  updateScriptLine: (id: string, updates: Partial<ScriptLine>) => void;
  removeScriptLine: (id: string) => void;
  setVoice: (speaker: string, voiceId: string) => void;
  setBackgroundVideo: (video: string) => void;
  setSubtitleStyle: (style: Partial<SubtitleStyle>) => void;
  setRenderStatus: (status: AppState['renderStatus']) => void;
  updateRenderProgress: (progress: number, message: string) => void;
  setRenderScriptId: (id: string) => void;
  setVideoUrl: (url: string) => void;
  setUser: (user: User | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setIsCreating: (creating: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
  resetCreation: () => void;
}

const defaultSubtitleStyle: SubtitleStyle = {
  font: 'Inter',
  color: '#ffffff',
  position: 'bottom',
  size: 'medium'
};

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  redditThread: null,
  script: [],
  selectedVoices: {},
  backgroundVideo: null,
  subtitleStyle: defaultSubtitleStyle,
  renderStatus: 'idle',
  currentRender: {
    id: null,
    progress: 0,
    message: '',
    videoUrl: null
  },
  user: null,
  projects: [],
  isCreating: false,
  showAuthModal: false,

  // Actions
  setRedditThread: (thread) => set({ redditThread: thread }),
  
  updateScript: (script) => set({ script }),
  
  addScriptLine: (line) => set((state) => ({
    script: [...state.script, { ...line, id: Date.now().toString() }]
  })),
  
  updateScriptLine: (id, updates) => set((state) => ({
    script: state.script.map(line => 
      line.id === id ? { ...line, ...updates } : line
    )
  })),
  
  removeScriptLine: (id) => set((state) => ({
    script: state.script.filter(line => line.id !== id)
  })),
  
  setVoice: (speaker, voiceId) => set((state) => ({
    selectedVoices: { ...state.selectedVoices, [speaker]: voiceId }
  })),
  
  setBackgroundVideo: (video) => set({ backgroundVideo: video }),
  
  setSubtitleStyle: (style) => set((state) => ({
    subtitleStyle: { ...state.subtitleStyle, ...style }
  })),
  
  setRenderStatus: (status) => set({ renderStatus: status }),
  
  updateRenderProgress: (progress, message) => set((state) => ({
    currentRender: { ...state.currentRender, progress, message }
  })),
  
  setRenderScriptId: (id: string) => set((state) => ({
    currentRender: { ...state.currentRender, id }
  })),
  
  setVideoUrl: (url) => set((state) => ({
    currentRender: { ...state.currentRender, videoUrl: url }
  })),
  
  setUser: (user) => set({ user }),
  
  addProject: (project) => set((state) => ({
    projects: [project, ...state.projects]
  })),
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === id ? { ...project, ...updates } : project
    )
  })),
  
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter(project => project.id !== id)
  })),
  
  setIsCreating: (creating) => set({ isCreating: creating }),
  
  setShowAuthModal: (show) => set({ showAuthModal: show }),
  
  resetCreation: () => set({
    redditThread: null,
    script: [],
    selectedVoices: {},
    backgroundVideo: null,
    subtitleStyle: defaultSubtitleStyle,
    renderStatus: 'idle',
    currentRender: { id: null, progress: 0, message: '', videoUrl: null },
    isCreating: false
  })
}));