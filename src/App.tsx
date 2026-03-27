import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  ChevronRight, 
  Search,
  X,
  Upload,
  Settings,
  HardDrive,
  Cpu,
  BookOpen,
  Send,
  Loader2,
  ArrowLeft,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Layout,
  Map,
  FileCode,
  PenTool,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  Info,
  HelpCircle,
  Heart,
  Youtube,
  Facebook,
  Phone,
  Mail,
  ExternalLink,
  Bell,
  Trash2,
  User,
  Shield,
  Palette,
  Globe,
  BrainCircuit,
  Play,
  Sun,
  Moon,
  Calculator,
  Camera,
  Activity,
  Box,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie
} from 'recharts';
import { Project, ProjectFile, CheckResult, Regulation, PROJECT_TYPES, FILE_CATEGORIES, DESIGN_MODULES, BOQItem, ProgressUpdate, BIMComponent } from './types';
import { analyzeDesign, chatWithBIMEngineer, generateArchitecturalImage, performQTO, analyzeProgress, analyzeBIMContent } from './services/aiService';
import { localDb } from './services/localDbService';
import { translations, Language } from './translations';
import Markdown from 'react-markdown';
import { FireSafetyChecker } from './components/FireSafetyChecker';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, theme }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
        : theme === 'dark'
          ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
    }`}
  >
    <Icon size={18} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon: Icon, trend, theme }: any) => (
  <div className={`border p-6 rounded-2xl shadow-sm transition-colors duration-300 ${
    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
  }`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg text-emerald-600 ${
        theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'
      }`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${trend > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">{label}</p>
    <h4 className={`text-2xl font-bold transition-colors duration-300 ${
      theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
    }`}>{value}</h4>
  </div>
);

const ModuleIcon = ({ id, size = 20 }: { id: string, size?: number }) => {
  switch (id) {
    case 'concept': return <Layout size={size} />;
    case 'site': return <Map size={size} />;
    case 'basic': return <FileCode size={size} />;
    case 'technical': return <Settings size={size} />;
    case 'shop': return <PenTool size={size} />;
    case 'clash': return <Zap size={size} />;
    case 'dwg': return <FileCode size={size} />;
    case 'pccc': return <Shield size={size} />;
    case 'qto': return <Calculator size={size} />;
    case 'progress': return <Camera size={size} />;
    case 'iot': return <Activity size={size} />;
    default: return <FileText size={size} />;
  }
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-500 hover:text-emerald-400"
      title="Copy to clipboard"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

function ProjectCard({ project, onClick, theme }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`border p-5 rounded-2xl transition-all cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-md ${
        theme === 'dark' 
          ? 'bg-zinc-900 border-zinc-800 hover:border-emerald-500/50' 
          : 'bg-white border-zinc-200 hover:border-emerald-500/50'
      }`}
    >
      <div className="absolute top-0 right-0 p-4">
        <div className={`w-2 h-2 rounded-full ${project.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_8px_rgba(245,158,11,0.3)]`} />
      </div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl text-emerald-600 ${
          theme === 'dark' ? 'bg-zinc-800' : 'bg-emerald-500/10'
        }`}>
          <HardDrive size={22} />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">
          {project.id}
        </span>
      </div>
      <h3 className={`text-lg font-bold group-hover:text-emerald-600 transition-colors mb-1 truncate ${
        theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
      }`}>
        {project.name}
      </h3>
      <p className="text-xs text-zinc-500 mb-4 line-clamp-1">{project.location}</p>
      
      <div className="space-y-3">
        <div className="flex justify-between text-[10px] text-zinc-500 font-mono uppercase">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className={`w-full h-1 rounded-full overflow-hidden ${
          theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'
        }`}>
          <div 
            className="h-full bg-emerald-500 transition-all duration-500" 
            style={{ width: `${project.progress}%` }} 
          />
        </div>
      </div>
    </motion.div>
  );
}

// --- Main App ---

export default function App() {
  const [lang, setLang] = useState<Language>('vi');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [view, setView] = useState<'dashboard' | 'project-detail' | 'chat' | 'regulations' | 'info' | 'settings' | 'fire-safety'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectData, setProjectData] = useState<{ 
    files: ProjectFile[], 
    results: CheckResult[], 
    boq: BOQItem[], 
    progress_updates: ProgressUpdate[],
    bim_components: BIMComponent[]
  } | null>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<'audit' | '3d' | 'analytics' | 'visualizer' | 'boq' | 'progress' | 'bim'>('audit');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [selectedReg, setSelectedReg] = useState<Regulation | null>(null);
  const [regCategory, setRegCategory] = useState<string>('All');
  const [inputMessage, setInputMessage] = useState('');
  const [regSearch, setRegSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [visualizerPrompt, setVisualizerPrompt] = useState('');
  const [visualizerImage, setVisualizerImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiModel, setAiModel] = useState('gemini-3.1-pro-preview');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const statsData = [
    { name: 'Concept', issues: 12 },
    { name: 'Site', issues: 8 },
    { name: 'Basic', issues: 24 },
    { name: 'Technical', issues: 15 },
    { name: 'Shop', issues: 5 },
  ];

  const pieData = [
    { name: 'OK', value: 75, color: '#10b981' },
    { name: 'NO', value: 25, color: '#ef4444' },
  ];

  const t = (key: keyof typeof translations['vi']) => translations[lang][key];

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    fetchProjects();
    fetchRegulations();
    loadLocalData();
  }, []);

  const loadLocalData = async () => {
    try {
      const cachedProjects = await localDb.getProjects();
      if (cachedProjects.length > 0 && projects.length === 0) {
        setProjects(cachedProjects);
      }
      const cachedChat = await localDb.getChatHistory();
      if (cachedChat.length > 0) {
        setChatMessages(cachedChat);
      }
    } catch (err) {
      console.error("Failed to load local cache", err);
    }
  };

  useEffect(() => {
    scrollToBottom();
    if (chatMessages.length > 0) {
      localDb.clearChat().then(() => {
        chatMessages.forEach(msg => localDb.saveChatMessage(msg));
      });
    }
  }, [chatMessages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data);
    localDb.saveProjects(data); // Sync to IndexedDB
  };

  const fetchRegulations = async () => {
    const res = await fetch('/api/regulations');
    const data = await res.json();
    setRegulations(data);
  };

  const fetchChatMessages = async () => {
    const res = await fetch('/api/chat-messages');
    const data = await res.json();
    setChatMessages(data);
  };

  const fetchProjectDetail = async (id: string) => {
    setIsLoading(true);
    const res = await fetch(`/api/projects/${id}`);
    const data = await res.json();
    setSelectedProject(data);
    setProjectData({ 
      files: data.files, 
      results: data.results, 
      boq: data.boq || [],
      progress_updates: (data.progress_updates || []).map((p: any) => ({
        ...p,
        deviations: typeof p.deviations === 'string' ? JSON.parse(p.deviations) : p.deviations
      })),
      bim_components: (data.bim_components || []).map((c: any) => ({
        ...c,
        properties: typeof c.properties === 'string' ? JSON.parse(c.properties) : c.properties
      }))
    });
    setIsLoading(false);
    setView('project-detail');
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProject = {
      id: `PRJ-${Math.floor(Math.random() * 10000)}`,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      location: formData.get('location') as string,
      investor: formData.get('investor') as string,
      designer: formData.get('designer') as string,
    };

    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject),
    });

    fetchProjects();
    (e.target as HTMLFormElement).reset();
  };

  const handleGenerateVisual = async () => {
    if (!visualizerPrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateArchitecturalImage(visualizerPrompt);
      setVisualizerImage(imageUrl);
    } catch (error) {
      console.error("Error generating visual:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };
  const handleRunAICheck = async (moduleName: string, checklist: string[]) => {
    if (!selectedProject) return;
    setIsChecking(true);
    try {
      const filesInfo = projectData?.files || [];
      const analysisFiles = [];
      
      // Fetch PDF, IFC, and DWG contents for analysis
      for (const file of filesInfo) {
        const format = file.format.toLowerCase();
        if (format === 'pdf' || format === 'ifc' || format === 'dwg') {
          try {
            const res = await fetch(`/api/files/${file.id}/content`);
            if (res.ok) {
              const { base64, mimeType } = await res.json();
              analysisFiles.push({ data: base64, mimeType });
            }
          } catch (err) {
            console.error(`Failed to fetch content for file ${file.id}`, err);
          }
        }
      }

      if (moduleName === 'qto') {
        const boqResults = await performQTO(selectedProject, filesInfo, analysisFiles);
        await fetch(`/api/projects/${selectedProject.id}/boq`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(boqResults),
        });
      } else {
        const results = await analyzeDesign(selectedProject, moduleName, checklist, filesInfo, analysisFiles, customPrompt);
        
        setCustomPrompt(''); // Clear prompt after check
        
        for (const res of results) {
          const resultData = {
            id: `RES-${Math.random().toString(36).substr(2, 9)}`,
            project_id: selectedProject.id,
            module: moduleName,
            ...res
          };
          await fetch('/api/check-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultData),
          });
        }
      }
      
      // Trigger compliance calculation
      await fetch(`/api/projects/${selectedProject.id}/analyze`, { method: 'POST' });
      
      fetchProjectDetail(selectedProject.id);
      fetchProjects(); // Refresh project list for scores
    } catch (error) {
      console.error(error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleProgressAnalysis = async (file: File) => {
    if (!selectedProject) return;
    setIsChecking(true);
    try {
      // 1. Upload the photo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', selectedProject.id);
      formData.append('category', 'site_photo');
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      const photoUrl = uploadData.url;

      // 2. Convert photo to base64 for AI analysis
      const reader = new FileReader();
      const photoBase64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });
      const photoBase64 = await photoBase64Promise;

      // 3. Analyze progress with AI
      const analysis = await analyzeProgress(selectedProject, photoBase64, file.type);

      // 4. Save progress update to DB
      await fetch(`/api/projects/${selectedProject.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo_url: photoUrl,
          ...analysis
        }),
      });

      // 5. Refresh project detail
      fetchProjectDetail(selectedProject.id);
      fetchProjects();
    } catch (error) {
      console.error("Progress analysis failed:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleBIMAnalysis = async () => {
    if (!selectedProject || !projectData) return;
    setIsChecking(true);
    try {
      // Find IFC file
      const ifcFile = projectData.files.find(f => f.format.toLowerCase() === 'ifc');
      if (!ifcFile) {
        alert("No IFC file found for analysis. Please upload an IFC file first.");
        return;
      }

      // Fetch IFC content
      const res = await fetch(`/api/files/${ifcFile.id}/content`);
      if (!res.ok) throw new Error("Failed to fetch IFC content");
      const { base64, mimeType } = await res.json();

      // Analyze with AI
      const components = await analyzeBIMContent(selectedProject, base64, mimeType);

      // Save to DB
      await fetch(`/api/projects/${selectedProject.id}/bim-components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(components),
      });

      // Refresh
      fetchProjectDetail(selectedProject.id);
    } catch (error) {
      console.error("BIM analysis failed:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const generateReport = () => {
    if (!selectedProject || !projectData) return;
    const reportText = `PROJECT COMPLIANCE REPORT\n\n` +
      `Project: ${selectedProject.name}\n` +
      `Compliance Score: ${selectedProject.compliance_score || 0}%\n` +
      `Risk Level: ${selectedProject.risk_level || 'Low'}\n\n` +
      `Issues Found:\n` +
      projectData.results.filter(r => r.status === 'NO').map(r => `- [${r.module}] ${r.check_item}: ${r.issue_description}`).join('\n');
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProject.name}_Audit_Report.txt`;
    a.click();
  };

  const handleSendMessage = async (msgOverride?: string) => {
    const textToSend = msgOverride || inputMessage;
    if (!textToSend.trim()) return;
    
    const userMsg = { role: 'user' as const, text: textToSend };
    
    // Save user message to DB
    await fetch('/api/chat-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userMsg),
    });
    
    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);
    
    try {
      const context = selectedProject ? {
        projectName: selectedProject.name,
        type: selectedProject.type,
        status: selectedProject.status,
        progress: selectedProject.progress,
        results: projectData?.results
      } : null;

      const response = await chatWithBIMEngineer(chatMessages, textToSend, context);
      const modelMsg = { role: 'model' as const, text: response || 'No response' };
      
      // Save model message to DB
      await fetch('/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelMsg),
      });
      
      setChatMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      await fetch('/api/chat-messages/clear', { method: 'POST' });
      setChatMessages([]);
    }
  };

  const handleClearCache = async () => {
    if (confirm(t('clearCache') + '?')) {
      try {
        await localDb.clearChat();
        // We could also clear projects but let's keep them for now
        alert(t('cacheCleared'));
        setChatMessages([]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddMockFile = async () => {
    if (!selectedProject) return;
    const mockFile = {
      id: `FILE-${Math.floor(Math.random() * 10000)}`,
      project_id: selectedProject.id,
      name: `Drawing_${Math.floor(Math.random() * 100)}.dwg`,
      category: FILE_CATEGORIES[Math.floor(Math.random() * FILE_CATEGORIES.length)],
      format: 'dwg',
      url: '#'
    };

    await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockFile),
    });

    fetchProjectDetail(selectedProject.id);
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedProject) return;
    
    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', selectedProject.id);
        const isPdf = file.name.toLowerCase().endsWith('.pdf');
        formData.append('category', isPdf ? 'Document' : 'Drawing');
        
        await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
      }
      fetchProjectDetail(selectedProject.id);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-zinc-950 text-zinc-100 dark' : 'bg-white text-zinc-900'
    }`}>
      {/* Sidebar */}
      <aside className={`w-64 border-r flex flex-col p-4 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
      }`}>
        <div className="mb-8 px-2 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Cpu size={24} />
              <h1 className="font-bold tracking-tighter text-xl">AI BIM DESIGN</h1>
            </div>
            <p className={`text-[10px] font-mono uppercase tracking-widest ${
              theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
            }`}>Checker v2.0</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`p-1.5 border rounded transition-all ${
                theme === 'dark' 
                  ? 'bg-zinc-800 border-zinc-700 text-yellow-400 hover:border-yellow-400/50' 
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-primary/50'
              }`}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <button 
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className={`p-1.5 border rounded text-[10px] font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-primary/50'
                  : 'bg-white border-zinc-200 text-zinc-900 hover:border-primary/50'
              }`}
            >
              {lang === 'vi' ? 'EN' : 'VI'}
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label={t('dashboard')} 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
            theme={theme}
          />
          <SidebarItem 
            icon={MessageSquare} 
            label={t('aiAssistant')} 
            active={view === 'chat'} 
            onClick={() => setView('chat')} 
            theme={theme}
          />
          <SidebarItem 
            icon={BookOpen} 
            label={t('regulations')} 
            active={view === 'regulations'} 
            onClick={() => setView('regulations')} 
            theme={theme}
          />
          <SidebarItem 
            icon={Shield} 
            label={t('fireSafetyChecker')} 
            active={view === 'fire-safety'} 
            onClick={() => setView('fire-safety')} 
            theme={theme}
          />
          <SidebarItem 
            icon={Info} 
            label="Info & Support" 
            active={view === 'info'} 
            onClick={() => setView('info')} 
            theme={theme}
          />
          <SidebarItem 
            icon={Settings} 
            label={t('settings')} 
            active={view === 'settings'}
            onClick={() => setView('settings')} 
            theme={theme}
          />
        </nav>

        <div className={`mt-auto p-4 rounded-xl border shadow-sm transition-colors duration-300 ${
          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
          <p className="text-[10px] text-zinc-500 uppercase font-mono mb-1">{t('developer')}</p>
          <p className={`text-xs font-medium transition-colors duration-300 ${
            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'
          }`}>Đồng Minh Phú</p>
          <p className="text-[10px] text-zinc-500">DMP AI Dev</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 max-w-7xl mx-auto"
            >
              <header className="flex justify-between items-end mb-12">
                <div>
                  <h2 className={`text-4xl font-light tracking-tight mb-2 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                  }`}>{t('projectOverview').split(' ')[0]} <span className="font-semibold">{t('projectOverview').split(' ')[1]}</span></h2>
                  <p className="text-zinc-500">{t('manageAnalyze')}</p>
                </div>
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      type="text" 
                      placeholder={t('searchProjects')} 
                      className={`border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 w-72 transition-all shadow-sm ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
                      }`}
                    />
                  </div>
                </div>
              </header>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard label="Total Projects" value={projects.length} icon={HardDrive} trend={12} theme={theme} />
                <StatCard label="Total Issues" value={142} icon={AlertCircle} trend={-5} theme={theme} />
                <StatCard label="Resolved" value={98} icon={CheckCircle2} trend={8} theme={theme} />
                <StatCard label="AI Analysis" value="2.4k" icon={Cpu} trend={24} theme={theme} />
              </div>

              {/* Advanced Features Showcase */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-px flex-1 bg-zinc-200" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 whitespace-nowrap">10 Advanced AI BIM Features</h3>
                  <div className="h-px flex-1 bg-zinc-200" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { title: "AI Design Audit", desc: "Automated compliance check", icon: Shield, color: "text-emerald-500" },
                    { title: "Fire Safety AI", desc: "QCVN 06:2022 validation", icon: Zap, color: "text-red-500" },
                    { title: "BIM AR View", desc: "Field visualization", icon: Layout, color: "text-blue-500" },
                    { title: "Smart Clash", desc: "Automated detection", icon: AlertCircle, color: "text-amber-500" },
                    { title: "AI Doc Manager", desc: "Smart categorization", icon: FileText, color: "text-purple-500" },
                    { title: "Risk Predictor", desc: "Technical delay analysis", icon: BarChart3, color: "text-rose-500" },
                    { title: "Auto QTO", desc: "Quantity takeoff AI", icon: Calculator, color: "text-indigo-500" },
                    { title: "Computer Vision", desc: "Site progress tracking", icon: Camera, color: "text-cyan-500" },
                    { title: "BIM Chatbot", desc: "Regulation assistant", icon: MessageSquare, color: "text-teal-500" },
                    { title: "Digital Twin", desc: "IoT data sync", icon: Activity, color: "text-orange-500" }
                  ].map((feature, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -5 }}
                      className={`p-4 border rounded-2xl transition-all shadow-sm ${
                        theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}
                    >
                      <feature.icon size={24} className={`${feature.color} mb-3`} />
                      <h4 className={`text-xs font-bold mb-1 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>{feature.title}</h4>
                      <p className="text-[10px] text-zinc-500 leading-tight">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                }`}>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className={`text-lg font-bold flex items-center gap-2 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>
                      <BarChart3 size={20} className="text-emerald-600" />
                      {t('statistics')}
                    </h3>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#27272a' : '#f4f4f5'} vertical={false} />
                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', 
                            border: theme === 'dark' ? '1px solid #27272a' : '1px solid #e5e7eb', 
                            borderRadius: '12px', 
                            color: theme === 'dark' ? '#f4f4f5' : '#111827' 
                          }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Bar dataKey="issues" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                }`}>
                  <h3 className={`text-lg font-bold flex items-center gap-2 mb-8 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                  }`}>
                    <PieChartIcon size={20} className="text-emerald-600" />
                    Issue Status
                  </h3>
                  <div className="h-[240px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', 
                            border: theme === 'dark' ? '1px solid #27272a' : '1px solid #e5e7eb', 
                            borderRadius: '12px', 
                            color: theme === 'dark' ? '#f4f4f5' : '#111827' 
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <p className={`text-2xl font-bold transition-colors duration-300 ${
                        theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                      }`}>75%</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-mono">OK Rate</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-zinc-500">{d.name}</span>
                        </div>
                        <span className={`font-bold transition-colors duration-300 ${
                          theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                        }`}>{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {projects.map(p => (
                  <ProjectCard key={p.id} project={p} onClick={() => fetchProjectDetail(p.id)} theme={theme} />
                ))}
                
                {/* Create Project Card */}
                <div className={`border border-dashed p-5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group ${
                  theme === 'dark'
                    ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/50'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-emerald-600 hover:border-emerald-500/50'
                }`}>
                  <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{t('newProject')}</span>
                </div>
              </div>

              <section className={`border rounded-2xl p-8 shadow-sm transition-colors duration-300 ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
              }`}>
                <h3 className={`text-xl font-semibold mb-6 transition-colors duration-300 ${
                  theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                }`}>{t('quickCreate')}</h3>
                <form onSubmit={handleCreateProject} className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-zinc-500 font-mono">{t('projectName')}</label>
                    <input name="name" required className={`w-full border rounded-lg px-4 py-2 outline-none transition-all ${
                      theme === 'dark' 
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-500/50' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-emerald-500/50'
                    }`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-zinc-500 font-mono">{t('projectType')}</label>
                    <select name="type" className={`w-full border rounded-lg px-4 py-2 outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-500/50'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-emerald-500/50'
                    }`}>
                      {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-zinc-500 font-mono">{t('location')}</label>
                    <input name="location" className={`w-full border rounded-lg px-4 py-2 outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-500/50'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-emerald-500/50'
                    }`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-zinc-500 font-mono">{t('investor')}</label>
                    <input name="investor" className={`w-full border rounded-lg px-4 py-2 outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-500/50'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-emerald-500/50'
                    }`} />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-md">
                      {t('createProject')}
                    </button>
                  </div>
                </form>
              </section>
            </motion.div>
          )}

          {view === 'project-detail' && selectedProject && (
            <motion.div
              key="project-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 max-w-7xl mx-auto"
            >
              <button 
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 transition-colors"
              >
                <ArrowLeft size={20} />
                {t('backToDashboard')}
              </button>

              <header className="flex justify-between items-start mb-12">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-500/20 uppercase tracking-widest">
                      {selectedProject.type}
                    </span>
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-widest ${
                      selectedProject.risk_level === 'High' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                      selectedProject.risk_level === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    }`}>
                      Risk: {selectedProject.risk_level || 'Low'}
                    </span>
                  </div>
                  <h2 className={`text-5xl font-bold tracking-tight mb-2 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                  }`}>{selectedProject.name}</h2>
                  <p className="text-zinc-500 flex items-center gap-2">
                    <Map size={14} /> {selectedProject.location} • {selectedProject.investor}
                  </p>
                </div>
                    <div className="flex flex-col items-end gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Compliance Score</p>
                        <div className="flex items-center gap-3">
                          <div className="text-4xl font-mono font-bold text-emerald-600">{selectedProject.compliance_score || 0}%</div>
                          <div className={`w-32 h-2 rounded-full overflow-hidden ${
                            theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'
                          }`}>
                            <div 
                              className="h-full bg-emerald-600 transition-all duration-1000" 
                              style={{ width: `${selectedProject.compliance_score || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={generateReport}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium border shadow-sm ${
                            theme === 'dark' 
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700' 
                              : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50'
                          }`}
                        >
                          <Download size={18} />
                          {t('exportReport')}
                        </button>
                        <label className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all text-sm font-bold shadow-md cursor-pointer">
                          {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                          {isUploading ? t('uploading') : 'Upload Files'}
                          <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept=".pdf,.dwg,.dxf,.rvt,.ifc" multiple />
                        </label>
                      </div>
                    </div>
              </header>

              {/* Tabs */}
              <div className={`flex gap-8 border-b mb-8 transition-colors duration-300 ${
                theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
              }`}>
                {[
                  { id: 'audit', label: t('aiDesignCheck'), icon: CheckCircle2 },
                  { id: 'boq', label: t('qtoTitle'), icon: Calculator },
                  { id: 'progress', label: 'Progress Tracking', icon: Camera },
                  { id: 'bim', label: 'BIM Components', icon: Box },
                  { id: '3d', label: '3D BIM View', icon: Layout },
                  { id: 'visualizer', label: t('aiBimVisualizer'), icon: ImageIcon },
                  { id: 'analytics', label: t('statistics'), icon: BarChart3 }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveProjectTab(tab.id as any)}
                    className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all relative ${
                      activeProjectTab === tab.id ? 'text-emerald-600' : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    {activeProjectTab === tab.id && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Content */}
                <div className="lg:col-span-2 space-y-12">
                  {activeProjectTab === 'audit' && (
                    <div className="space-y-12">
                      <section className={`border rounded-3xl p-8 transition-colors duration-300 ${
                        theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
                      }`}>
                        <div className="flex justify-between items-center mb-8">
                          <div>
                            <h3 className={`text-xl font-bold flex items-center gap-2 transition-colors duration-300 ${
                              theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                            }`}>
                              <Cpu size={24} className="text-emerald-600" />
                              {t('aiDesignCheck')}
                            </h3>
                            <p className="text-sm text-zinc-500 mt-1">Select a module to run AI-powered analysis</p>
                          </div>
                          {isChecking && (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-mono">
                              <Loader2 className="animate-spin" size={18} />
                              ANALYZING...
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {DESIGN_MODULES.map((m) => (
                            <div key={m.id} className={`p-5 border rounded-2xl flex flex-col justify-between group hover:border-emerald-500/30 transition-all ${
                              theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                            }`}>
                              <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-xl transition-colors ${
                                  theme === 'dark' ? 'bg-zinc-800 text-zinc-400 group-hover:text-emerald-400' : 'bg-white border border-zinc-200 text-zinc-400 group-hover:text-emerald-600 shadow-sm'
                                }`}>
                                  <ModuleIcon id={m.id} />
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">{m.checklist.length} items</span>
                                  <span className="text-[9px] text-emerald-500/60 font-mono uppercase">AI-Ready</span>
                                </div>
                              </div>
                              <div>
                                <h4 className={`font-bold mb-1 transition-colors duration-300 ${
                                  theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                                }`}>{m.module}</h4>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">Module ID: {m.id}</p>
                                
                                <div className="mb-4">
                                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 block font-bold">Custom AI Instructions (Optional)</label>
                                  <textarea 
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="e.g. Focus on fire safety distances or density calculations..."
                                    className={`w-full border rounded-lg p-2 text-xs focus:border-emerald-500/50 outline-none min-h-[60px] resize-none transition-all ${
                                      theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
                                    }`}
                                  />
                                </div>

                                {projectData?.files && projectData.files.length > 0 ? (
                                  <div className="mb-4 p-2 bg-emerald-500/5 rounded border border-emerald-500/10">
                                    <p className="text-[9px] text-emerald-600 font-bold uppercase mb-1 flex items-center gap-1">
                                      <FileText size={10} /> {projectData.files.length} Files detected
                                    </p>
                                    <p className="text-[8px] text-zinc-500 truncate">Analyzing: {projectData.files.map(f => f.name).join(', ')}</p>
                                  </div>
                                ) : (
                                  <div className="mb-4 p-2 bg-amber-500/5 rounded border border-amber-500/10">
                                    <p className="text-[9px] text-amber-600 font-bold uppercase flex items-center gap-1">
                                      <AlertCircle size={10} /> No files uploaded
                                    </p>
                                  </div>
                                )}

                                <button 
                                  disabled={isChecking || !projectData?.files?.length}
                                  onClick={() => handleRunAICheck(m.module, m.checklist)}
                                  className={`w-full py-2 text-xs font-bold rounded-lg border transition-all disabled:opacity-30 shadow-sm ${
                                    theme === 'dark'
                                      ? 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                                      : 'bg-white border-zinc-200 text-zinc-800 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                                  }`}
                                >
                                  {isChecking ? t('analyzing') : t('runAnalysis')}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className={`border rounded-2xl p-6 shadow-sm transition-colors duration-300 ${
                        theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}>
                        <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                        }`}>
                          <CheckCircle2 size={20} className="text-emerald-600" />
                          {t('analysisResults')}
                        </h3>
                        <div className="space-y-4">
                          {projectData?.results.length === 0 ? (
                            <div className="text-center py-12 text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
                              {t('noResults')}
                            </div>
                          ) : (
                            projectData?.results.map((r) => (
                              <div key={r.id} className={`p-4 border rounded-xl transition-colors duration-300 ${
                                theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                              }`}>
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{r.module}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'OK' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-red-500/20 text-red-600'}`}>
                                    {r.status}
                                  </span>
                                </div>
                                <h4 className={`font-medium mb-1 transition-colors duration-300 ${
                                  theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                                }`}>{r.check_item.replace(/_/g, ' ')}</h4>
                                {r.status === 'NO' && (
                                  <div className="mt-3 space-y-2">
                                    <div className="text-sm text-red-600 bg-red-500/5 p-3 rounded border border-red-500/10 flex justify-between items-start gap-4">
                                      <p>
                                        <span className="font-bold">{t('issue')}:</span> {r.issue_description}
                                      </p>
                                      <CopyButton text={r.issue_description} />
                                    </div>
                                    <div className="text-sm text-emerald-600 bg-emerald-500/5 p-3 rounded border border-emerald-500/10 flex justify-between items-start gap-4">
                                      <p>
                                        <span className="font-bold">{t('fix')}:</span> {r.suggested_fix}
                                      </p>
                                      <CopyButton text={r.suggested_fix} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </section>
                    </div>
                  )}

                  {activeProjectTab === 'boq' && (
                    <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                    }`}>
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                          }`}>
                            <Calculator size={24} className="text-emerald-600" />
                            {t('qtoTitle')}
                          </h3>
                          <p className="text-sm text-zinc-500 mt-1">{t('qtoDesc')}</p>
                        </div>
                        <button 
                          onClick={() => handleRunAICheck('qto', [])}
                          disabled={isChecking || !projectData?.files?.length}
                          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
                        >
                          {isChecking ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                          {isChecking ? t('processingQto') : t('runQto')}
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className={`border-b text-[10px] uppercase tracking-widest text-zinc-500 transition-colors duration-300 ${
                              theme === 'dark' ? 'border-zinc-800' : 'border-zinc-100'
                            }`}>
                              <th className="pb-4 font-bold">{t('category')}</th>
                              <th className="pb-4 font-bold">{t('itemName')}</th>
                              <th className="pb-4 font-bold">{t('description')}</th>
                              <th className="pb-4 font-bold">{t('unit')}</th>
                              <th className="pb-4 font-bold text-right">{t('quantity')}</th>
                              <th className="pb-4 font-bold text-right">{t('rate')}</th>
                              <th className="pb-4 font-bold text-right">{t('amount')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100/10">
                            {projectData?.boq.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-12 text-center text-zinc-400 italic">
                                  {t('noBoqData')}
                                </td>
                              </tr>
                            ) : (
                              projectData?.boq.map((item) => (
                                <tr key={item.id} className={`group hover:bg-emerald-500/5 transition-colors duration-300 ${
                                  theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                                }`}>
                                  <td className="py-4">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                      theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                                    }`}>
                                      {item.category}
                                    </span>
                                  </td>
                                  <td className={`py-4 text-sm font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>{item.item_name}</td>
                                  <td className="py-4 text-xs text-zinc-500 max-w-xs truncate">{item.description}</td>
                                  <td className="py-4 text-xs font-mono">{item.unit}</td>
                                  <td className="py-4 text-sm font-bold text-right font-mono">{item.quantity.toLocaleString()}</td>
                                  <td className="py-4 text-sm text-right font-mono text-zinc-500">${item.rate?.toLocaleString() || '0'}</td>
                                  <td className="py-4 text-sm font-bold text-right font-mono text-emerald-600">${item.amount?.toLocaleString() || '0'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                          {projectData?.boq.length > 0 && (
                            <tfoot>
                              <tr className={`border-t font-bold transition-colors duration-300 ${
                                theme === 'dark' ? 'border-zinc-800 text-zinc-100' : 'border-zinc-200 text-zinc-900'
                              }`}>
                                <td colSpan={6} className="py-6 text-right uppercase tracking-widest text-xs text-zinc-500">{t('totalEstimatedAmount')}</td>
                                <td className="py-6 text-right text-lg text-emerald-600 font-mono">
                                  ${projectData.boq.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </section>
                  )}

                  {activeProjectTab === 'progress' && (
                    <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                    }`}>
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                          }`}>
                            <Camera size={24} className="text-emerald-600" />
                            AI Site Progress Tracking
                          </h3>
                          <p className="text-sm text-zinc-500 mt-1">Overlay site photos onto BIM model to track actual progress</p>
                        </div>
                        <label className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-md cursor-pointer">
                          {isChecking ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                          {isChecking ? 'Analyzing Site Photo...' : 'Upload Site Photo / Drone Feed'}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleProgressAnalysis(file);
                            }}
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Progress Chart */}
                        <div className={`p-6 border rounded-2xl ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
                          <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Progress History</h4>
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={projectData?.progress_updates?.slice().reverse() || []}>
                                <defs>
                                  <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis 
                                  dataKey="created_at" 
                                  tickFormatter={(str) => new Date(str).toLocaleDateString()}
                                  stroke="#71717a"
                                  fontSize={10}
                                />
                                <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
                                    borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                  }}
                                />
                                <Area type="monotone" dataKey="completion_percentage" stroke="#10b981" fillOpacity={1} fill="url(#colorProg)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Current Status Card */}
                        <div className={`p-6 border rounded-2xl ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
                          <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Latest Analysis Summary</h4>
                          {projectData?.progress_updates?.[0] ? (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-500">Completion Status</span>
                                <span className="text-3xl font-mono font-bold text-emerald-600">{projectData.progress_updates[0].completion_percentage}%</span>
                              </div>
                              <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                <p className="text-sm text-zinc-600 italic">"{projectData.progress_updates[0].analysis_summary}"</p>
                              </div>
                              <div className="space-y-3">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Detected Deviations</p>
                                {projectData.progress_updates[0].deviations.map((dev, idx) => (
                                  <div key={idx} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                                    <AlertCircle size={14} className="text-red-500 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-bold text-red-600">{dev.item}</p>
                                      <p className="text-[10px] text-zinc-500">{dev.description}</p>
                                    </div>
                                    <span className={`ml-auto px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                      dev.severity === 'High' ? 'bg-red-500 text-white' :
                                      dev.severity === 'Medium' ? 'bg-amber-500 text-white' :
                                      'bg-blue-500 text-white'
                                    }`}>
                                      {dev.severity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                              <Camera size={48} className="mb-4 opacity-20" />
                              <p className="text-sm italic">No progress analysis yet. Upload a site photo to start.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Photo Timeline */}
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Site Photo Timeline</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {projectData?.progress_updates?.map((update) => (
                            <div key={update.id} className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
                              <img src={update.photo_url} alt="Site" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[10px] text-white font-bold">{new Date(update.created_at).toLocaleDateString()}</p>
                                <p className="text-[14px] text-emerald-400 font-mono font-bold">{update.completion_percentage}% Complete</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {activeProjectTab === 'bim' && (
                    <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                    }`}>
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                          }`}>
                            <Box size={24} className="text-emerald-600" />
                            BIM Component Extraction
                          </h3>
                          <p className="text-sm text-zinc-500 mt-1">AI-powered extraction of structural, MEP, and architectural elements from IFC files</p>
                        </div>
                        <button
                          onClick={handleBIMAnalysis}
                          disabled={isChecking}
                          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
                        >
                          {isChecking ? <Loader2 className="animate-spin" size={18} /> : <Cpu size={18} />}
                          {isChecking ? 'Analyzing IFC...' : 'Run BIM Extraction'}
                        </button>
                      </div>

                      <div className="space-y-8">
                        {['Structural', 'MEP', 'Architectural'].map(category => (
                          <div key={category}>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                              {category === 'Structural' && <Layers size={14} />}
                              {category === 'MEP' && <Zap size={14} />}
                              {category === 'Architectural' && <Layout size={14} />}
                              {category} Components
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {projectData?.bim_components.filter(c => c.category === category).length === 0 ? (
                                <div className="col-span-full py-8 text-center text-zinc-400 italic border border-dashed rounded-xl">
                                  No {category.toLowerCase()} components extracted yet.
                                </div>
                              ) : (
                                projectData?.bim_components.filter(c => c.category === category).map(component => (
                                  <div key={component.id} className={`p-4 border rounded-xl transition-all hover:shadow-md ${
                                    theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                                  }`}>
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{component.type}</span>
                                    </div>
                                    <h5 className={`font-bold text-sm mb-3 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>{component.name}</h5>
                                    <div className="space-y-1">
                                      {Object.entries(component.properties).map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-[10px]">
                                          <span className="text-zinc-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                          <span className={theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}>{String(value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {activeProjectTab === 'visualizer' && (
                    <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                    }`}>
                      <div className="max-w-2xl mx-auto text-center">
                        <div className="mb-8">
                          <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                          }`}>Imagen 4 Architectural Visualizer</h3>
                          <p className="text-zinc-500 text-sm">Generate high-fidelity architectural renders from text descriptions using Imagen 4 technology.</p>
                        </div>
                        
                        <div className="relative mb-8">
                          <textarea
                            value={visualizerPrompt}
                            onChange={(e) => setVisualizerPrompt(e.target.value)}
                            placeholder="Describe your architectural vision (e.g., 'Modern minimalist villa with glass facade at sunset, lush landscape')..."
                            className={`w-full border rounded-2xl p-6 focus:border-emerald-500/50 outline-none min-h-[120px] resize-none transition-all ${
                              theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                            }`}
                          />
                          <button
                            onClick={handleGenerateVisual}
                            disabled={isGeneratingImage || !visualizerPrompt.trim()}
                            className="absolute bottom-4 right-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
                          >
                            {isGeneratingImage ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                            {isGeneratingImage ? 'Generating...' : 'Generate Render'}
                          </button>
                        </div>

                        {visualizerImage ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`relative rounded-2xl overflow-hidden border group shadow-lg ${
                              theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
                            }`}
                          >
                            <img src={visualizerImage} alt="Generated Render" className="w-full aspect-video object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                              <button 
                                onClick={() => {
                                  const a = document.createElement('a');
                                  a.href = visualizerImage;
                                  a.download = `render-${Date.now()}.png`;
                                  a.click();
                                }}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                              >
                                <Download size={24} />
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <div className={`aspect-video border border-dashed rounded-2xl flex flex-col items-center justify-center text-zinc-400 ${
                            theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                          }`}>
                            <ImageIcon size={48} className="mb-4 opacity-20" />
                            <p className="text-sm">Your generated render will appear here</p>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {activeProjectTab === '3d' && (
                    <section className={`h-[600px] border rounded-3xl overflow-hidden relative group shadow-inner transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                    }`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                        <div className="relative mb-8">
                          <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full animate-pulse" />
                          <Cpu size={80} className="text-emerald-500/30 relative z-10" />
                        </div>
                        <h4 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'
                        }`}>Interactive 3D BIM Viewer</h4>
                        <p className="text-sm text-zinc-500 max-w-sm text-center">
                          Visualizing IFC model for <span className="text-emerald-600">{selectedProject.name}</span>. 
                          Clash detection results are mapped to 3D coordinates.
                        </p>
                        <div className="mt-12 flex gap-4">
                          <div className={`px-4 py-2 border rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-500 shadow-sm ${
                            theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'
                          }`}>
                            Orbit Mode
                          </div>
                          <div className={`px-4 py-2 border rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-500 shadow-sm ${
                            theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'
                          }`}>
                            X-Ray View
                          </div>
                        </div>
                      </div>
                      
                      {/* Mock 3D UI Overlay */}
                      <div className="absolute top-6 right-6 space-y-2">
                        {['Architecture', 'Structure', 'MEP'].map(layer => (
                          <div key={layer} className={`px-3 py-2 backdrop-blur-md border rounded-lg flex items-center gap-3 shadow-sm ${
                            theme === 'dark' ? 'bg-zinc-800/80 border-zinc-700' : 'bg-white/80 border-zinc-200'
                          }`}>
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className={`text-[10px] font-bold uppercase ${
                              theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                            }`}>{layer}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {activeProjectTab === 'analytics' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`md:col-span-2 border rounded-3xl p-8 relative overflow-hidden group shadow-sm transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BarChart3 size={120} />
                          </div>
                          <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                          }`}>
                            <Zap size={20} className="text-emerald-600" />
                            {t('drawingHealth')}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { label: t('layerStandards'), value: '92%', color: 'text-emerald-600' },
                              { label: t('blockIntegrity'), value: '88%', color: 'text-blue-600' },
                              { label: t('dimAccuracy'), value: '95%', color: 'text-purple-600' },
                              { label: t('annotationCheck'), value: '76%', color: 'text-amber-600' },
                            ].map((stat, i) => (
                              <div key={i} className={`p-4 border rounded-2xl transition-colors duration-300 ${
                                theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                              }`}>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-8 h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[
                                { name: 'Concept', issues: 12 },
                                { name: 'Site', issues: 8 },
                                { name: 'Basic', issues: 24 },
                                { name: 'Technical', issues: 15 },
                                { name: 'Shop', issues: 5 },
                                { name: 'DWG', issues: 3 },
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#27272a' : '#e5e7eb'} vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', 
                                    border: `1px solid ${theme === 'dark' ? '#27272a' : '#e5e7eb'}`, 
                                    borderRadius: '12px',
                                    color: theme === 'dark' ? '#f4f4f5' : '#111827'
                                  }}
                                  itemStyle={{ color: '#059669' }}
                                />
                                <Bar dataKey="issues" fill="#10b981" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className={`border rounded-3xl p-8 flex flex-col shadow-sm transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                          <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                          }`}>
                            <BrainCircuit size={20} className="text-emerald-600" />
                            {t('aiInsights')}
                          </h3>
                          <div className="flex-1 space-y-4">
                            <div className={`p-4 border rounded-2xl ${
                              theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'
                            }`}>
                              <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-2">Recommendation</p>
                              <p className={`text-sm leading-relaxed italic transition-colors duration-300 ${
                                theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                              }`}>
                                {lang === 'vi' 
                                  ? '"Bản vẽ DWG hiện tại có độ chính xác cao về kích thước, tuy nhiên hệ thống layer chưa đồng nhất theo TCVN 9257. Cần chuẩn hóa lại layer \'A-WALL\' và \'A-DOOR\' để tối ưu hóa quy trình BIM."'
                                  : '"The current DWG drawings have high dimensional accuracy, but the layer system is inconsistent with TCVN 9257 standards. Recommend re-standardizing \'A-WALL\' and \'A-DOOR\' layers to optimize BIM workflow."'}
                              </p>
                            </div>
                            <div className={`p-4 border rounded-2xl transition-colors duration-300 ${
                              theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                            }`}>
                              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2">Risk Factor</p>
                              <div className="flex items-center gap-2">
                                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                                  theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200'
                                }`}>
                                  <div className="h-full bg-amber-500 w-[35%]" />
                                </div>
                                <span className="text-xs font-bold text-amber-600">Low Risk</span>
                              </div>
                            </div>
                          </div>
                          <button className="mt-6 w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-md">
                            {t('generateFullReport')}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className={`border rounded-3xl p-6 flex items-center gap-4 shadow-sm transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 ${
                            theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-50'
                          }`}>
                            <FileCode size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">DWG Files</p>
                            <p className={`text-lg font-bold transition-colors duration-300 ${
                              theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                            }`}>12 Drawings</p>
                          </div>
                        </div>
                        <div className={`border rounded-3xl p-6 flex items-center gap-4 shadow-sm transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 ${
                            theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'
                          }`}>
                            <Layout size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Total Layers</p>
                            <p className={`text-lg font-bold transition-colors duration-300 ${
                              theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                            }`}>145 Layers</p>
                          </div>
                        </div>
                        <div className={`border rounded-3xl p-6 flex items-center gap-4 shadow-sm transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-purple-600 ${
                            theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'
                          }`}>
                            <Zap size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{t('autoFixed')}</p>
                            <p className={`text-lg font-bold transition-colors duration-300 ${
                              theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                            }`}>24 Issues</p>
                          </div>
                        </div>
                        <div className={`border rounded-3xl p-6 flex items-center gap-4 shadow-sm transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-red-600 ${
                            theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'
                          }`}>
                            <AlertCircle size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{t('criticalErrors')}</p>
                            <p className={`text-lg font-bold transition-colors duration-300 ${
                              theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                            }`}>2 Errors</p>
                          </div>
                        </div>
                      </div>

                      {/* Cool Idea: Blueprint Scanner Visualization */}
                      <div className={`border rounded-3xl p-8 overflow-hidden relative h-[400px] shadow-sm transition-colors duration-300 ${
                        theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}>
                        <div className="absolute inset-0 opacity-5">
                          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10b981" strokeWidth="0.5"/>
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                          </svg>
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-8">
                            <div>
                              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                                theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                              }`}>AI Blueprint Scanner</h3>
                              <p className="text-sm text-zinc-500">Real-time analysis of geometric patterns and CAD standards</p>
                            </div>
                            <div className={`px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse ${
                              theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            }`}>
                              Scanning...
                            </div>
                          </div>
                          
                          <div className="flex-1 flex items-center justify-center relative">
                            {/* Stylized Drawing */}
                            <div className={`w-full max-w-2xl h-48 border rounded-lg relative overflow-hidden transition-colors duration-300 ${
                              theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-emerald-100'
                            }`}>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg width="80%" height="80%" viewBox="0 0 400 200" className="text-emerald-600/20">
                                  <rect x="50" y="50" width="300" height="100" fill="none" stroke="currentColor" strokeWidth="2" />
                                  <line x1="150" y1="50" x2="150" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="4" />
                                  <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
                                  <circle cx="300" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
                                  <path d="M 50 150 L 350 150" stroke="currentColor" strokeWidth="1" />
                                </svg>
                              </div>
                              {/* Scanning Line */}
                              <motion.div 
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] z-20"
                              />
                              {/* Detection Markers */}
                              <div className="absolute top-1/4 left-1/3 w-4 h-4 border border-red-500 rounded-full animate-ping" />
                              <div className="absolute bottom-1/3 right-1/4 w-4 h-4 border border-amber-500 rounded-full animate-ping" />
                            </div>
                          </div>
                          
                          <div className="mt-auto grid grid-cols-3 gap-4">
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                              <p className="text-[9px] text-zinc-500 uppercase mb-1">Current Layer</p>
                              <p className="text-xs font-mono text-emerald-600">A-WALL-EXTR</p>
                            </div>
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                              <p className="text-[9px] text-zinc-500 uppercase mb-1">Entities Scanned</p>
                              <p className="text-xs font-mono text-emerald-600">12,458</p>
                            </div>
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                              <p className="text-[9px] text-zinc-500 uppercase mb-1">Compliance</p>
                              <p className="text-xs font-mono text-emerald-600">TCVN 9257:2012</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Files & Info */}
                <div className="space-y-8">
                  <section className={`border rounded-2xl p-6 shadow-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>
                      <FileText size={20} className="text-emerald-600" />
                      {t('projectFiles')}
                    </h3>
                    <div className="space-y-3">
                      {projectData?.files.length === 0 ? (
                        <p className="text-sm text-zinc-400 italic">{t('noFiles')}</p>
                      ) : (
                        projectData?.files.map(f => (
                          <div key={f.id} className={`flex items-center gap-3 p-3 border rounded-lg transition-colors duration-300 ${
                            theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                          }`}>
                            <div className={`p-2 border rounded transition-colors duration-300 ${
                              theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-400'
                            }`}>
                              <FileText size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate transition-colors duration-300 ${
                                theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                              }`}>{f.name}</p>
                              <p className="text-[10px] text-zinc-500 uppercase">{f.category}</p>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">{f.format}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className={`border rounded-2xl p-6 shadow-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>{t('projectDetails')}</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">{t('designer')}</p>
                        <p className="text-sm text-zinc-700">{selectedProject.designer || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">{t('createdDate')}</p>
                        <p className="text-sm text-zinc-700">{new Date(selectedProject.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col p-8 max-w-5xl mx-auto"
            >
              <header className="mb-8 flex justify-between items-center">
                <div>
                  <h2 className={`text-3xl font-bold tracking-tight mb-2 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                  }`}>
                    {t('aiBimEngineer').split(' ')[0]} {t('aiBimEngineer').split(' ')[1]} <span className="text-emerald-600">{t('aiBimEngineer').split(' ')[2]}</span>
                  </h2>
                  <p className="text-zinc-500">{t('askAnything')}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={clearChat}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 shadow-sm ${
                      theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700' : 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50'
                    }`}
                  >
                    Clear History
                  </button>
                  <div className={`px-3 py-2 text-[10px] font-bold rounded-xl border uppercase tracking-widest flex items-center ${
                    theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  }`}>
                    Gemini 3.1 Pro
                  </div>
                </div>
              </header>

              <div className={`flex-1 border rounded-3xl overflow-hidden flex flex-col mb-4 shadow-xl relative transition-colors duration-300 ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
              }`}>
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {chatMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-8">
                      <div className={`p-8 rounded-full ${
                        theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'
                      }`}>
                        <MessageSquare size={64} className="text-emerald-500/20" />
                      </div>
                      <div className="text-center max-w-md">
                        <p className={`text-xl font-medium transition-colors duration-300 ${
                          theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'
                        }`}>{t('startConversation')}</p>
                        <p className="text-sm text-zinc-500 mt-2">I can help you with design codes, clash detection, BIM standards, and project optimization.</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                        {[
                          "What are the density limits in QCVN 01:2021?",
                          "How to handle pipe-beam collisions in Revit?",
                          "Explain fire safety requirements for high-rise buildings.",
                          "Analyze my current project for potential issues."
                        ].map((prompt, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleSendMessage(prompt)}
                            className={`p-4 border rounded-2xl text-left text-xs transition-all group shadow-sm ${
                              theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-emerald-500/30 hover:bg-emerald-500/5' : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-emerald-500/30 hover:bg-emerald-50'
                            }`}
                          >
                            <span className="group-hover:text-emerald-600 transition-colors">{prompt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-6 rounded-2xl shadow-md ${
                        m.role === 'user' 
                          ? 'bg-emerald-600 text-white rounded-tr-none' 
                          : theme === 'dark' ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-tl-none' : 'bg-zinc-50 text-zinc-800 border border-zinc-200 rounded-tl-none'
                      }`}>
                        <div className={`flex items-center gap-2 mb-2 opacity-50 text-[10px] font-bold uppercase tracking-widest ${m.role === 'user' ? 'text-white' : 'text-zinc-500'}`}>
                          {m.role === 'user' ? 'You' : 'AI BIM Engineer'}
                        </div>
                        <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert' : theme === 'dark' ? 'prose-invert' : 'prose-zinc'}`}>
                          <Markdown>{m.text}</Markdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className={`p-6 rounded-2xl rounded-tl-none flex items-center gap-3 shadow-sm border ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                      }`}>
                        <Loader2 className="animate-spin text-emerald-600" size={18} />
                        <span className="text-sm text-zinc-500 italic">AI is thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className={`p-6 border-t transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                }`}>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={t('askAnything')} 
                      className={`flex-1 border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      }`}
                    />
                    <button 
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || isTyping}
                      className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'regulations' && (
            <motion.div
              key="regulations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 max-w-7xl mx-auto"
            >
              <header className="flex justify-between items-end mb-12">
                <div>
                  <h2 className={`text-4xl font-bold tracking-tight mb-2 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                  }`}>
                    {t('regulationsDatabase').split(' ')[0]} <span className="text-emerald-600">{t('regulationsDatabase').split(' ')[1]}</span>
                  </h2>
                  <p className="text-zinc-500">Access and search construction standards and regulations</p>
                </div>
                <div className="flex gap-4">
                  <select 
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value)}
                    className={`border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-sm ${
                      theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-700'
                    }`}
                  >
                    <option value="All">All Categories</option>
                    <option value="Planning">Planning</option>
                    <option value="Fire Safety">Fire Safety</option>
                    <option value="Structure">Structure</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Legal">Legal</option>
                  </select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      type="text" 
                      value={regSearch}
                      onChange={(e) => setRegSearch(e.target.value)}
                      placeholder={t('regulationSearch')} 
                      className={`border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 w-80 transition-all shadow-sm ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
                      }`}
                    />
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regulations
                  .filter(r => (regCategory === 'All' || r.category === regCategory))
                  .filter(r => r.code.toLowerCase().includes(regSearch.toLowerCase()) || r.title.toLowerCase().includes(regSearch.toLowerCase()))
                  .map((reg) => (
                  <div 
                    key={reg.id} 
                    onClick={() => setSelectedReg(reg)}
                    className={`border p-6 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full shadow-sm ${
                      theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <BookOpen size={80} />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl text-emerald-600 ${
                        theme === 'dark' ? 'bg-zinc-800' : 'bg-emerald-50'
                      }`}>
                        <BookOpen size={24} />
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                        theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {reg.category}
                      </span>
                    </div>
                    <h3 className={`font-bold text-lg group-hover:text-emerald-600 transition-colors line-clamp-1 ${
                      theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>{reg.code}</h3>
                    <p className={`text-xs font-medium mt-1 line-clamp-2 min-h-[2.5rem] transition-colors ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-zinc-800'
                    }`}>{reg.title}</p>
                    <p className="text-xs text-zinc-500 mt-3 leading-relaxed line-clamp-3 mb-6">{reg.description}</p>
                    
                    <div className={`mt-auto pt-4 border-t flex items-center justify-between ${
                      theme === 'dark' ? 'border-zinc-800' : 'border-zinc-100'
                    }`}>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <span>Details</span>
                        <ChevronRight size={12} />
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">{reg.effective_date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Regulation Detail Modal */}
              <AnimatePresence>
                {selectedReg && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedReg(null)}
                      className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className={`relative border rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ${
                        theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}
                    >
                      <div className={`p-8 border-b flex justify-between items-start ${
                        theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
                      }`}>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest border ${
                              theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            }`}>
                              {selectedReg.category}
                            </span>
                            <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest border ${
                              theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                            }`}>
                              {selectedReg.status}
                            </span>
                          </div>
                          <h2 className={`text-3xl font-bold transition-colors ${
                            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                          }`}>{selectedReg.code}</h2>
                          <p className="text-zinc-500 mt-1">{selectedReg.title}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedReg(null)}
                          className={`p-2 rounded-full transition-colors ${
                            theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-500' : 'hover:bg-zinc-100 text-zinc-400'
                          }`}
                        >
                          <X size={24} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="md:col-span-2 space-y-8">
                            <section>
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FileText size={14} /> Overview
                              </h4>
                              <div className={`p-6 rounded-2xl border transition-colors duration-300 ${
                                theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                              }`}>
                                <p className={`leading-relaxed transition-colors duration-300 ${
                                  theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                                }`}>{selectedReg.full_text}</p>
                              </div>
                            </section>

                            <section>
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Zap size={14} /> AI Analysis & Summary
                              </h4>
                              <div className={`p-6 rounded-2xl border transition-colors duration-300 ${
                                theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'
                              }`}>
                                <p className={`text-sm leading-relaxed italic transition-colors duration-300 ${
                                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
                                }`}>
                                  "This regulation is a cornerstone of Vietnamese construction law. It establishes the mandatory technical limits for urban planning, including density and land-use coefficients. Architects must ensure that all preliminary designs strictly adhere to the setback and height restrictions defined in Chapter 2."
                                </p>
                                <button className={`mt-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:underline transition-colors duration-300 ${
                                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                                }`}>
                                  Generate Full AI Report <ChevronRight size={12} />
                                </button>
                              </div>
                            </section>
                          </div>

                          <div className="space-y-6">
                            <div className={`p-6 rounded-2xl border transition-colors duration-300 ${
                              theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                            }`}>
                              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Metadata</h4>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-[10px] text-zinc-500 uppercase">Effective Date</p>
                                  <p className={`text-sm font-mono transition-colors duration-300 ${
                                    theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                                  }`}>{selectedReg.effective_date}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-zinc-500 uppercase">Authority</p>
                                  <p className={`text-sm transition-colors duration-300 ${
                                    theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                                  }`}>Bộ Xây dựng (BXD)</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-zinc-500 uppercase">Language</p>
                                  <p className={`text-sm transition-colors duration-300 ${
                                    theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                                  }`}>Tiếng Việt</p>
                                </div>
                              </div>
                            </div>

                            <button className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-md">
                              <Download size={18} /> Download PDF
                            </button>
                            
                            <button 
                              onClick={() => {
                                setView('chat');
                                setInputMessage(`Tell me more about ${selectedReg.code}: ${selectedReg.title}`);
                                setSelectedReg(null);
                              }}
                              className="w-full py-4 bg-white text-zinc-800 font-bold rounded-2xl border border-zinc-200 flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all shadow-sm"
                            >
                              <MessageSquare size={18} /> Ask AI BIM Engineer
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {view === 'fire-safety' && (
            <motion.div
              key="fire-safety"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 max-w-7xl mx-auto"
            >
              <header className="mb-8">
                <h2 className={`text-4xl font-bold tracking-tight mb-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                }`}>{t('fireSafetyChecker')}</h2>
                <p className="text-zinc-500">QCVN 06:2022/BXD - National Technical Regulation on Fire Safety for Buildings and Structures</p>
              </header>
              
              <FireSafetyChecker language={lang} theme={theme} />
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 max-w-4xl mx-auto"
            >
              <header className="mb-12">
                <h2 className={`text-4xl font-bold tracking-tight mb-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                }`}>{t('settings')}</h2>
                <p className="text-zinc-500">Configure your workspace and AI preferences</p>
              </header>

              <div className="space-y-6">
                {/* Profile Section */}
                <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                }`}>
                  <div className="flex items-center gap-6 mb-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-emerald-600 border transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-emerald-50 border-emerald-100'
                    }`}>
                      <User size={40} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold transition-colors duration-300 ${
                        theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                      }`}>DMP User</h3>
                      <p className="text-zinc-500 text-sm">Professional Plan • Active</p>
                    </div>
                    <button className={`ml-auto px-4 py-2 border rounded-xl text-sm font-bold transition-all shadow-sm ${
                      theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300' : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800'
                    }`}>
                      Edit Profile
                    </button>
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General Settings */}
                  <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                  }`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 mb-6 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>
                      <Globe size={20} className="text-emerald-600" />
                      {t('generalSettings')}
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">{t('language')}</label>
                        <div className="flex gap-2">
                          {(['vi', 'en'] as Language[]).map(l => (
                            <button
                              key={l}
                              onClick={() => setLang(l)}
                              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                lang === l 
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                                  : theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800'
                              }`}
                            >
                              {l === 'vi' ? 'Tiếng Việt' : 'English'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-bold transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'
                          }`}>{t('notifications')}</p>
                          <p className="text-xs text-zinc-500">Enable desktop alerts</p>
                        </div>
                        <button 
                          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                          className={`w-12 h-6 rounded-full transition-all relative ${notificationsEnabled ? 'bg-emerald-500' : theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${notificationsEnabled ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* AI Settings */}
                  <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                  }`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 mb-6 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>
                      <BrainCircuit size={20} className="text-emerald-600" />
                      {t('aiSettings')}
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">{t('modelSelection')}</label>
                        <select 
                          value={aiModel}
                          onChange={(e) => setAiModel(e.target.value)}
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none shadow-sm transition-colors duration-300 ${
                            theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                          }`}
                        >
                          <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Recommended)</option>
                          <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast)</option>
                          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        </select>
                      </div>
                      <div className={`p-4 border rounded-2xl transition-colors duration-300 ${
                        theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'
                      }`}>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">AI Status</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <p className={`text-xs transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                          }`}>Connected to Google AI Services</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* UI Settings */}
                  <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                  }`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 mb-6 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>
                      <Palette size={20} className="text-emerald-600" />
                      {t('uiSettings')}
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">{t('accentColor')}</label>
                        <div className="flex gap-3">
                          {['#10b981', '#6366f1', '#f43f5e', '#f59e0b'].map(color => (
                            <button
                              key={color}
                              onClick={() => setAccentColor(color)}
                              style={{ backgroundColor: color }}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === color ? (theme === 'dark' ? 'border-zinc-100 scale-110' : 'border-zinc-900 scale-110') : 'border-transparent opacity-50 hover:opacity-100'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Storage Settings */}
                  <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                  }`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 mb-6 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>
                      <HardDrive size={20} className="text-emerald-600" />
                      {t('storageSettings')}
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-bold transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'
                          }`}>Local Cache</p>
                          <p className="text-xs text-zinc-500">IndexedDB v11 usage: 1.2MB</p>
                        </div>
                        <button 
                          onClick={handleClearCache}
                          className={`p-2.5 rounded-xl transition-all border shadow-sm ${
                            theme === 'dark' ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-500' : 'bg-red-50 hover:bg-red-100 border-red-100 text-red-600'
                          }`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-bold transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'
                          }`}>Cloud Sync</p>
                          <p className="text-xs text-zinc-500">Last synced: 2 mins ago</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                  </section>
                </div>

                <div className="flex justify-end pt-8">
                  <button className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/10 transition-all">
                    {t('saveSettings')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 max-w-5xl mx-auto"
            >
              <header className="mb-12">
                <h2 className={`text-4xl font-bold tracking-tight mb-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                }`}>Info & <span className="text-emerald-600">Support</span></h2>
                <p className="text-zinc-500">Learn more about BIM AI Checker and support the developer</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: App Info & Guide */}
                <div className="space-y-8">
                  <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                  }`}>
                    <h3 className={`text-xl font-bold flex items-center gap-2 mb-6 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>
                      <ImageIcon size={24} className="text-emerald-600" />
                      Giới thiệu & Tính năng
                    </h3>
                    <div className={`space-y-4 text-sm leading-relaxed transition-colors duration-300 ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                      <p><strong>BIM AI Checker</strong> là nền tảng tiên tiến hỗ trợ kiến trúc sư và kỹ sư trong việc quản lý, kiểm tra hồ sơ thiết kế xây dựng dựa trên công nghệ AI (Gemini 3.1 Pro).</p>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Phân tích hồ sơ thiết kế (PDF, DWG, IFC) tự động.</li>
                        <li>Kiểm tra sự tuân thủ quy chuẩn xây dựng (QCVN, TCVN).</li>
                        <li>Trợ lý ảo AI BIM Engineer hỗ trợ giải đáp kỹ thuật 24/7.</li>
                        <li>AI Visualizer (Imagen 4) tạo phối cảnh kiến trúc từ văn bản.</li>
                        <li>Lưu trữ dữ liệu an toàn với IndexedDB v11 và Cloud Database.</li>
                      </ul>
                    </div>
                  </section>

                  <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                  }`}>
                    <h3 className={`text-xl font-bold flex items-center gap-2 mb-6 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>
                      <HelpCircle size={24} className="text-emerald-600" />
                      Hướng dẫn sử dụng
                    </h3>
                    <div className={`space-y-4 text-sm transition-colors duration-300 ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                      <div className="flex gap-4">
                        <div className={`w-8 h-8 rounded-full text-emerald-600 flex items-center justify-center font-bold shrink-0 border transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-emerald-50 border-emerald-100'
                        }`}>1</div>
                        <p>Tạo dự án mới tại Dashboard và điền thông tin cơ bản.</p>
                      </div>
                      <div className="flex gap-4">
                        <div className={`w-8 h-8 rounded-full text-emerald-600 flex items-center justify-center font-bold shrink-0 border transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-emerald-50 border-emerald-100'
                        }`}>2</div>
                        <p>Tải lên các tệp thiết kế (PDF, DWG, IFC) vào mục Upload Files.</p>
                      </div>
                      <div className="flex gap-4">
                        <div className={`w-8 h-8 rounded-full text-emerald-600 flex items-center justify-center font-bold shrink-0 border transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-emerald-50 border-emerald-100'
                        }`}>3</div>
                        <p>Sử dụng tính năng "AI Audit" để hệ thống tự động kiểm tra lỗi thiết kế.</p>
                      </div>
                      <div className="flex gap-4">
                        <div className={`w-8 h-8 rounded-full text-emerald-600 flex items-center justify-center font-bold shrink-0 border transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-emerald-50 border-emerald-100'
                        }`}>4</div>
                        <p>Trao đổi với AI BIM Engineer tại mục Chat để nhận tư vấn chuyên sâu.</p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column: Support & Dev Info */}
                <div className="space-y-8">
                  <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-emerald-50 border-emerald-100'
                  }`}>
                    <h3 className={`text-xl font-bold flex items-center gap-2 mb-6 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-emerald-500' : 'text-emerald-600'
                    }`}>
                      <Heart size={24} />
                      Donate nhà phát triển
                    </h3>
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-white p-4 rounded-2xl mb-6 shadow-md">
                        <img 
                          src="https://img.vietqr.io/image/techcombank-554646686868-compact.png?amount=0&addInfo=Donate%20BIM%20AI&accountName=DONG%20MINH%20PHU" 
                          alt="QR Donate" 
                          className="w-48 h-48"
                        />
                      </div>
                      <div className={`space-y-2 text-sm transition-colors duration-300 ${
                        theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                      }`}>
                        <p className="font-bold">Ngân hàng: Techcombank</p>
                        <p>STK: <span className="font-mono text-emerald-600">554646686868</span></p>
                        <p className="uppercase">CTK: DONG MINH PHU</p>
                      </div>
                    </div>
                  </section>

                  <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                  }`}>
                    <h3 className={`text-xl font-bold flex items-center gap-2 mb-6 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>
                      <Cpu size={24} className="text-emerald-600" />
                      Thông tin nhà phát triển
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 border transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-100'
                        }`}>
                          <Settings size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Developer</p>
                          <p className={`font-bold transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                          }`}>DMP AI Dev</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 border transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-100'
                        }`}>
                          <Mail size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Email</p>
                          <p className={`transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                          }`}>dmpaidev@gmail.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 border transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-100'
                        }`}>
                          <Phone size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Tel</p>
                          <p className={`transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                          }`}>+84 766771509</p>
                        </div>
                      </div>
                      <a 
                        href="https://zalo.me/g/kodwgn037" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all mt-4 shadow-md"
                      >
                        <MessageSquare size={18} /> Zalo hỗ trợ
                      </a>
                    </div>
                  </section>

                  <section className={`border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                  }`}>
                    <h3 className={`text-xl font-bold mb-6 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>Mạng xã hội</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <a href="https://www.youtube.com/@ai.studio-dongminhphu" target="_blank" rel="noreferrer" className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all group border ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' : 'bg-zinc-50 border-zinc-100 hover:bg-red-50'
                      }`}>
                        <Youtube className="text-zinc-400 group-hover:text-red-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">YouTube</span>
                      </a>
                      <a href="https://www.facebook.com/profile.php?id=61585771779201" target="_blank" rel="noreferrer" className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all group border ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' : 'bg-zinc-50 border-zinc-100 hover:bg-blue-50'
                      }`}>
                        <Facebook className="text-zinc-400 group-hover:text-blue-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Facebook</span>
                      </a>
                      <a href="https://www.tiktok.com/@qhomestaygardenvilla" target="_blank" rel="noreferrer" className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all group border ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'
                      }`}>
                        <Play className={`text-zinc-400 ${theme === 'dark' ? 'group-hover:text-zinc-100' : 'group-hover:text-zinc-900'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">TikTok</span>
                      </a>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
