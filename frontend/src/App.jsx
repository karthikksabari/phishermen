import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, Upload, FileSearch, ShieldAlert, Activity, Lock, AlertTriangle, 
  Menu, X, Globe, Copy, Eye, Shield, Cpu, Zap, CheckCircle, Skull, Server, MapPin,
  Palette, Download, RefreshCw, ChevronUp, ChevronDown, Power, FileText, Move, ArrowLeft, Loader2,
  Filter, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function App() {
  // State for the flow
  const [hasUploaded, setHasUploaded] = useState(false); // Controls Initial vs Main View
  const [activeTab, setActiveTab] = useState('log'); // Changed default to 'log'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  
  // File Upload & Data State
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState([]);

  // Simulation State - Defaults to Green Theme
  const [isSystemCritical, setIsSystemCritical] = useState(false);

  // Map Calibration Constants
  const defaultMapCalibration = {
    xOffset: 11,
    yOffset: 23,
    xScale: 0.71,
    yScale: 0.77
  };
  const [mapCalibration, setMapCalibration] = useState(defaultMapCalibration);

  // --- THEME CONFIGURATIONS ---
  const tealTheme = {
    bgMain: '#021c19',
    bgSecondary: '#183a35',
    bgTopBar: '#08211e',
    borderColor: '#2ba69e',
    panelBg: '#0e2522',
    panelBorder: '#05d6c8',
    accent: '#2c9b94',
    accentDim: '#083635',
    textPrimary: '#e0fffd',
    critical: '#EF4444',
    safe: '#10B981',
    warning: '#F97316'
  };

  const redTheme = {
    bgMain: '#1a0505',
    bgSecondary: '#2d0a0a',
    bgTopBar: '#200707',
    borderColor: '#e63946',
    panelBg: '#1e0808',
    panelBorder: '#f94144',
    accent: '#ff4d4d',
    accentDim: '#4a1010',
    textPrimary: '#ffe3e3',
    critical: '#EF4444',
    safe: '#10B981',
    warning: '#F97316'
  };

  // Dynamic theme selection based on system status
  const theme = isSystemCritical ? redTheme : tealTheme;

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const validateFile = (file) => {
    const validTypes = ['.log', '.txt'];
    const fileName = file.name.toLowerCase();
    const isValid = validTypes.some(type => fileName.endsWith(type));
    
    if (!isValid) {
      showToast("Error: Only .log and .txt files are allowed.", "error");
      return false;
    }
    return true;
  };

  const handleUploadComplete = async (file) => {
    setIsAnalyzing(true);
    const fileName = file?.name || "Log File";
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Connect to the FastAPI Backend (Port 8000)
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      
      if (result.data) {
          setAnalysisData(result.data); // Store the real data
          setHasUploaded(true);
          setActiveTab('log'); // Switch to log view
          showToast(`Analysis Complete: ${fileName}`);
          
          // Determine critical state based on real data
          const hasCritical = result.data.some(item => 
            item.threat_level && (
              item.threat_level.toUpperCase().includes('CRITICAL') || 
              item.threat_level.toUpperCase().includes('HIGH')
            )
          );
          setIsSystemCritical(hasCritical);
      } else {
         throw new Error("Invalid response format");
      }

    } catch (error) {
      console.error(error);
      // Fallback for demo if backend is offline
      showToast("Backend Offline. Loading Demo Data.", "error");
      setTimeout(() => {
        setHasUploaded(true);
        setActiveTab('log');
        setAnalysisData([]); // Clear data to trigger fallback mocks
      }, 1000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBackToUpload = () => {
    setHasUploaded(false);
    setActiveTab('log');
    setAnalysisData([]);
    setIsSystemCritical(false); // Reset to green theme on back
  };

  // Drag & Drop Handlers
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        handleUploadComplete(file);
      }
    }
  };

  const onFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        handleUploadComplete(file);
      }
    }
  };

  return (
    <div 
      className="flex flex-col h-screen font-sans overflow-hidden relative transition-colors duration-700"
      style={{
        '--bg-main': theme.bgMain,
        '--bg-secondary': theme.bgSecondary,
        '--bg-topbar': theme.bgTopBar,
        '--border-color': theme.borderColor,
        '--panel-bg': theme.panelBg,
        '--panel-border': theme.panelBorder,
        '--accent': theme.accent,
        '--accent-dim': theme.accentDim,
        '--text-primary': theme.textPrimary,
        '--color-critical': theme.critical,
        '--color-safe': theme.safe,
        '--color-warning': theme.warning,
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)'
      }}
    >
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        @keyframes slide-down { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        .animate-slide-down { animation: slide-down 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--accent-dim); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--accent); }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }

        .theme-transition {
          transition: background-color 0.7s ease, border-color 0.7s ease, color 0.7s ease, box-shadow 0.7s ease;
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-10 z-[100]">
          <div 
            className="bg-[var(--bg-secondary)] border text-[var(--text-primary)] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-down theme-transition"
            style={{ borderColor: toast.type === 'error' ? 'var(--color-critical)' : 'var(--border-color)' }}
          >
            {toast.type === 'error' ? (
              <AlertTriangle size={20} className="text-[var(--color-critical)]" />
            ) : (
              <CheckCircle size={20} className="text-[var(--accent)]" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* --- SCENE 1: INITIAL UPLOAD --- */}
      {!hasUploaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-main)] theme-transition">
           <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[var(--accent-dim)] rounded-full blur-[150px] animate-pulse"></div>
           </div>
           
           <input 
             type="file" 
             ref={fileInputRef}
             onChange={onFileInputChange}
             className="hidden"
             accept=".log,.txt"
           />

           <div 
             onDragOver={onDragOver}
             onDragLeave={onDragLeave}
             onDrop={onDrop}
             onClick={() => !isAnalyzing && fileInputRef.current?.click()}
             className={`w-80 h-80 relative group cursor-pointer animate-float transition-transform duration-300 ${isDragging ? 'scale-105' : ''}`}
           >
             <div 
                className={`absolute inset-0 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-6 backdrop-blur-sm transition-all duration-500 group-hover:scale-105 group-hover:bg-[var(--accent)]/5 ${isDragging ? 'bg-[var(--accent)]/10 border-[var(--accent)]' : ''}`}
                style={{ borderColor: isDragging ? theme.accent : theme.panelBorder }}
             >
                {isAnalyzing ? (
                   <div className="flex flex-col items-center gap-4">
                     <Loader2 size={60} className="text-[var(--accent)] animate-spin" />
                     <span className="text-[var(--text-primary)] font-bold tracking-widest animate-pulse">ANALYZING THREATS...</span>
                   </div>
                ) : (
                   <>
                    <div className="w-20 h-20 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center shadow-[0_0_30px_var(--accent-dim)] group-hover:shadow-[0_0_50px_var(--accent)] transition-all duration-500">
                      <Upload size={40} className="text-[var(--accent)] group-hover:text-[var(--text-primary)] transition-colors" />
                    </div>
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-widest uppercase">Ingest Logs</h1>
                      <p className="text-[var(--accent)] text-xs font-mono uppercase">Drag & Drop .LOG or .TXT</p>
                    </div>
                   </>
                )}
             </div>
             
             <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--accent)] rounded-tl-lg"></div>
             <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--accent)] rounded-tr-lg"></div>
             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--accent)] rounded-bl-lg"></div>
             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--accent)] rounded-br-lg"></div>
           </div>
        </div>
      )}

      {/* --- SCENE 2: THE DASHBOARD --- */}
      {hasUploaded && (
        <>
          <header 
            className="relative z-50 h-20 backdrop-blur-md border-b-2 flex items-center justify-between px-6 md:px-10 shrink-0 shadow-2xl animate-slide-down theme-transition"
            style={{ 
              backgroundColor: `${theme.bgTopBar}E6`,
              borderColor: `${theme.borderColor}66`
            }} 
          >
            {/* Left: Logo & Back Button */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBackToUpload}
                className="p-2 rounded-lg hover:bg-[var(--accent)]/10 text-[var(--text-primary)] transition-colors mr-1"
                title="Back to Upload"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-[var(--text-primary)]/10 theme-transition" style={{ backgroundColor: theme.accentDim }}>
                <ShieldAlert size={22} className="text-[var(--text-primary)]" />
              </div>
              <span className="font-bold text-xl tracking-wider text-[var(--text-primary)]">Poseidon</span>
            </div>

            {/* Center: Navigation + Medium Threat Orb */}
            <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('log')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 font-medium border ${
                    activeTab === 'log'
                      ? 'bg-[var(--accent-dim)]/60 text-[var(--text-primary)] shadow-[0_0_15px_rgba(255,77,77,0.2)]' 
                      : 'text-[var(--text-primary)]/70 hover:bg-[var(--accent-dim)]/40 hover:text-[var(--text-primary)] border-transparent'
                  }`}
                  style={{
                    borderColor: activeTab === 'log' ? 'var(--border-color)' : 'transparent'
                  }}
                >
                  <FileSearch size={18} />
                  <span>Log</span>
                </button>
              </nav>

              <div className="relative flex items-center justify-center group mx-2 translate-y-[35%]">
                  <div 
                    className="absolute inset-0 rounded-full blur-md opacity-60 transition-colors duration-500"
                    style={{ backgroundColor: isSystemCritical ? 'var(--color-critical)' : 'var(--color-safe)' }}
                  ></div>
                  
                  <div 
                    className="w-32 h-32 rounded-full border-2 flex items-center justify-center relative transition-all duration-500 z-10 theme-transition"
                    style={{ 
                      borderColor: theme.borderColor,
                      backgroundColor: theme.bgTopBar,
                      boxShadow: `0 0 25px ${isSystemCritical ? 'var(--color-critical)' : 'var(--color-safe)'}30`
                    }}
                  >
                      <div 
                        className="w-24 h-24 rounded-full flex items-center justify-center relative overflow-hidden theme-transition"
                        style={{ 
                           background: isSystemCritical 
                            ? `radial-gradient(circle at center, #481414 0%, ${theme.bgTopBar} 100%)` 
                            : `radial-gradient(circle at center, #054f31 0%, ${theme.bgTopBar} 100%)`,
                           boxShadow: `inset 0 0 15px ${isSystemCritical ? 'var(--color-critical)' : 'var(--color-safe)'}`
                        }}
                      >
                          <div 
                            className="absolute inset-0 border-2 rounded-full animate-pulse-ring opacity-50 theme-transition"
                            style={{ borderColor: isSystemCritical ? 'var(--color-critical)' : 'var(--color-safe)' }}
                          ></div>

                          {isSystemCritical ? (
                             <ShieldAlert size={40} className="drop-shadow-md animate-pulse relative z-10" style={{ color: 'var(--color-critical)' }} />
                          ) : (
                             <Shield size={40} className="drop-shadow-md relative z-10" style={{ color: 'var(--color-safe)' }} />
                          )}
                      </div>
                  </div>
              </div>

              <nav className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('worldview')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 font-medium border ${
                    activeTab === 'worldview'
                      ? 'bg-[var(--accent-dim)]/60 text-[var(--text-primary)] shadow-[0_0_15px_rgba(255,77,77,0.2)]' 
                      : 'text-[var(--text-primary)]/70 hover:bg-[var(--accent-dim)]/40 hover:text-[var(--text-primary)] border-transparent'
                  }`}
                  style={{
                    borderColor: activeTab === 'worldview' ? 'var(--border-color)' : 'transparent'
                  }}
                >
                  <Globe size={18} />
                  <span>World View</span>
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div 
                onClick={() => setIsSystemCritical(!isSystemCritical)}
                className="hidden md:flex bg-[var(--bg-secondary)] px-5 py-2 rounded-full border items-center gap-3 shadow-inner cursor-pointer hover:bg-[var(--accent)]/10 transition-colors theme-transition" 
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSystemCritical ? 'bg-[var(--color-critical)]' : 'bg-[var(--color-safe)]'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSystemCritical ? 'bg-[var(--color-critical)]' : 'bg-[var(--color-safe)]'}`}></span>
                </span>
                <span className={`text-xs font-bold tracking-widest ${isSystemCritical ? 'text-[var(--color-critical)]' : 'text-[var(--color-safe)]'}`}>
                  {isSystemCritical ? 'THREAT DETECTED' : 'SYSTEM SECURE'}
                </span>
              </div>

              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-[var(--accent)]">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto relative z-10 p-6 custom-scrollbar">
            {activeTab === 'log' && (
              <div className="h-full">
                <LogView 
                  theme={theme} 
                  showToast={showToast} 
                  isSystemCritical={isSystemCritical}
                  data={analysisData}
                />
              </div>
            )}
            {activeTab === 'worldview' && (
              <div className="h-full">
                <WorldView 
                  theme={theme} 
                  calibration={mapCalibration}
                  data={analysisData}
                />
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}

// --- TAB 1: LOG VIEW ---
function LogView({ theme, showToast, isSystemCritical, data }) {
  const [expandedRow, setExpandedRow] = useState(null); 

  const hasRealData = data && data.length > 0;
  
  const mockData = [
    { id: 1, timestamp: '14:32:01', ip: '192.168.1.105', request: '/admin-login', status: 403, origin_country: 'Russia', ai_analysis: 'Brute Force Detected. Persistent attempts at accessing administrative portals detected through rapid retry cycles.', mitre_id: 'T1110', threat_level: 'CRITICAL (Honeypot)', action_command: 'iptables -A INPUT -s 192.168.1.105 -j DROP' },
    { id: 3, timestamp: '14:30:12', ip: '45.22.19.12', request: '/?q=SELECT *', status: 500, origin_country: 'China', ai_analysis: 'SQL Injection. The request contains suspicious SQL keywords that aim to extract unauthorized database schema information.', mitre_id: 'T1190', threat_level: 'High', action_command: 'iptables -A INPUT -s 45.22.19.12 -j DROP' },
    { id: 2, timestamp: '14:31:45', ip: '10.0.0.45', request: '/api/v1/users', status: 200, origin_country: 'USA', ai_analysis: 'Normal Traffic. Standard API request validated by session tokens.', mitre_id: 'N/A', threat_level: 'Low', action_command: 'MONITOR' },
  ];
  const secureLogs = [
    { id: 1, timestamp: '14:35:10', ip: '10.0.0.12', request: '/home', status: 200, origin_country: 'USA', ai_analysis: 'Authorized Access', threat_level: 'Low', action_command: 'MONITOR' },
  ];

  let initialData = hasRealData ? data : (isSystemCritical ? mockData : secureLogs);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const handleCopyAction = (cmd) => {
    navigator.clipboard.writeText(cmd);
    showToast("Firewall Rule Copied to Clipboard");
  };

  // Default sorting logic remains (Critical first)
  const processedData = useMemo(() => {
    let items = [...initialData];
    const severityScore = (lvl) => {
        const s = (lvl || '').toUpperCase();
        if (s.includes('CRITICAL')) return 4;
        if (s.includes('HIGH')) return 3;
        if (s.includes('MEDIUM')) return 2;
        return 1;
    };
    return items.sort((a, b) => severityScore(b.threat_level) - severityScore(a.threat_level));
  }, [initialData]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalThreatsCount = initialData.filter(t => 
    t.is_anomaly || 
    (t.threat_level && !t.threat_level.toUpperCase().includes('LOW'))
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Log Analysis</h2>
          <p className="text-[var(--accent)] opacity-70">
            {hasRealData ? 'Live AI Analysis' : 'System Demo Mode'} ({processedData.length} records)
          </p>
        </div>
        
        <div className="flex gap-4">
           {totalThreatsCount > 0 ? (
             <div className="bg-[var(--color-critical)]/10 border border-[var(--color-critical)]/30 px-4 py-2 rounded-lg flex items-center gap-2 theme-transition">
               <Skull size={18} className="text-[var(--color-critical)]" />
               <span className="text-[var(--color-critical)] font-bold">{totalThreatsCount} THREATS DETECTED</span>
             </div>
           ) : (
             <div className="bg-[var(--color-safe)]/10 border border-[var(--color-safe)]/30 px-4 py-2 rounded-lg flex items-center gap-2 theme-transition">
               <CheckCircle size={18} className="text-[var(--color-safe)]" />
               <span className="text-[var(--color-safe)] font-bold">SYSTEM SECURE</span>
             </div>
           )}
        </div>
      </div>

      <div 
        className="flex-1 backdrop-blur rounded-[2rem] p-8 shadow-2xl overflow-hidden border flex flex-col theme-transition"
        style={{ 
          backgroundColor: `${theme.panelBg}E6`, 
          borderColor: `${theme.panelBorder}4D` 
        }}
      >
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[var(--panel-bg)] z-10 theme-transition">
              <tr className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider border-b border-[var(--accent)]/20">
                <th className="px-4 py-4">Timestamp</th>
                <th className="px-4 py-4">Origin</th>
                <th className="px-4 py-4">Request</th>
                <th className="px-4 py-4">Severity</th>
                <th className="px-4 py-4">AI Analysis</th>
                <th className="px-4 py-4 text-right">Active Defense</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {currentItems.length > 0 ? (
                  currentItems.map((row, idx) => {
                    const level = row.threat_level ? row.threat_level.toUpperCase() : "LOW";
                    const isCriticalLevel = level.includes('CRITICAL');
                    const isAnomaly = level.includes('CRITICAL') || level.includes('HIGH') || level.includes('MEDIUM') || row.is_anomaly;
                    const isHoneypot = level.includes('HONEYPOT');
                    const isExpanded = expandedRow === idx;
                    
                    // Determine IP Color based on severity
                    let ipColorClass = "text-[var(--text-primary)]";
                    if (isCriticalLevel || level.includes('HIGH') || level.includes('MEDIUM')) {
                        ipColorClass = "text-[var(--color-critical)]";
                    } else if (level.includes('LOW')) {
                        ipColorClass = "text-[var(--color-safe)]";
                    }

                    return (
                      <tr 
                        key={idx} 
                        className={`border-b border-[var(--accent)]/10 transition-colors ${
                          isAnomaly ? 'bg-[var(--color-critical)]/5 hover:bg-[var(--color-critical)]/10' : 'hover:bg-[var(--accent)]/5 opacity-60'
                        }`}
                      >
                        <td className="px-4 py-4 font-mono text-[var(--accent)]">{row.timestamp || row.time || 'N/A'}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${ipColorClass}`}>{row.ip}</span>
                            {isHoneypot && (
                              <span className="animate-pulse text-[var(--color-critical)] bg-[var(--color-critical)]/20 px-1.5 py-0.5 rounded text-[10px] border border-[var(--color-critical)]/20">
                                 TRAP
                              </span>
                            )}
                            <span className="text-xs text-[var(--accent)]/60 px-2 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--accent)]/10 theme-transition">{row.origin_country || row.country || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-[var(--text-primary)] truncate max-w-[200px]" title={row.request}>{row.request}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold border transition-all ${
                            isCriticalLevel ? 'text-[var(--color-critical)] bg-[var(--color-critical)]/20 border-[var(--color-critical)]/40' :
                            row.mitre_id && row.mitre_id !== 'N/A' ? 'text-[var(--color-warning)] bg-[var(--color-warning)]/10 border-transparent' : 
                            'text-[var(--color-safe)] bg-[var(--color-safe)]/10 border-transparent'
                          }`}>
                            {level.replace(' TRIGGERED', '')}
                          </span>
                        </td>
                        <td className="px-4 py-4 max-w-xs">
                          <div 
                            className={`cursor-pointer transition-all ${isExpanded ? '' : 'line-clamp-3'}`}
                            onClick={() => setExpandedRow(isExpanded ? null : idx)}
                          >
                             <span className={`flex items-start gap-2 ${isCriticalLevel ? 'text-[var(--color-critical)] font-bold' : isAnomaly ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--accent)]'}`}>
                                {(isCriticalLevel || level.includes('HIGH')) && <AlertTriangle size={14} className="text-[var(--color-warning)] shrink-0 mt-0.5" />}
                                {row.ai_analysis}
                             </span>
                             {!isExpanded && row.ai_analysis.length > 80 && (
                                <span className={`${isCriticalLevel ? 'text-[var(--color-critical)]' : 'text-[var(--accent)]'} text-[10px] uppercase font-bold mt-1 block opacity-50`}>Expand Details</span>
                             )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {isAnomaly && (
                            <button 
                              onClick={() => handleCopyAction(row.action_command)}
                              className="inline-flex items-center gap-2 bg-[var(--color-critical)]/10 hover:bg-[var(--color-critical)]/30 text-red-200 border border-[var(--color-critical)]/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all group theme-transition"
                            >
                              <Shield size={14} /> BLOCK
                              <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
              ) : (
                  <tr>
                      <td colSpan="6" className="text-center py-20 text-[var(--accent)] opacity-40 italic">
                          No insights available.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--accent)]/20 theme-transition">
                <span className="text-xs text-[var(--accent)]">
                    Showing {Math.min(processedData.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(processedData.length, currentPage * itemsPerPage)} of {processedData.length} entries
                </span>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg border border-[var(--accent)]/20 transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[var(--accent)]/10 text-[var(--text-primary)]'}`}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs text-[var(--text-primary)] font-mono px-2">
                        {currentPage} / {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg border border-[var(--accent)]/20 transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[var(--accent)]/20 text-[var(--text-primary)]'}`}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

// --- TAB 2: WORLD VIEW ---
function WorldView({ theme, calibration, data }) {
  const COUNTRY_COORDINATES = {
    "Russia": { lat: 61.5240, lng: 105.3188 },
    "Russian Federation": { lat: 61.5240, lng: 105.3188 },
    "China": { lat: 35.8617, lng: 104.1954 },
    "USA": { lat: 37.0902, lng: -95.7129 },
    "United States": { lat: 37.0902, lng: -95.7129 },
    "Canada": { lat: 56.1304, lng: -106.3468 },
    "Brazil": { lat: -14.2350, lng: -51.9253 },
    "Germany": { lat: 51.1657, lng: 10.4515 },
    "India": { lat: 20.5937, lng: 78.9629 },
    "North Korea": { lat: 40.3399, lng: 127.5101 },
    "South Korea": { lat: 35.9078, lng: 127.7669 },
    "Japan": { lat: 36.2048, lng: 138.2529 },
    "UK": { lat: 55.3781, lng: -3.4360 },
    "United Kingdom": { lat: 55.3781, lng: -3.4360 },
    "France": { lat: 46.2276, lng: 2.2137 },
    "Italy": { lat: 41.8719, lng: 12.5674 },
    "Spain": { lat: 40.4637, lng: -3.7492 },
    "Australia": { lat: -25.2744, lng: 133.7751 },
    "Netherlands": { lat: 52.1326, lng: 5.2913 },
    "Ukraine": { lat: 48.3794, lng: 31.1656 },
    "Poland": { lat: 51.9194, lng: 19.1451 },
    "Romania": { lat: 45.9432, lng: 24.9668 },
    "Indonesia": { lat: -0.7893, lng: 113.9213 },
    "Vietnam": { lat: 14.0583, lng: 108.2772 },
    "Thailand": { lat: 15.8700, lng: 100.9925 },
    "Iran": { lat: 32.4279, lng: 53.6880 },
    "Israel": { lat: 31.0461, lng: 34.8516 },
    "Egypt": { lat: 26.8206, lng: 30.8025 },
    "South Africa": { lat: -30.5595, lng: 22.9375 },
    "Nigeria": { lat: 9.0820, lng: 8.6753 },
    "Mexico": { lat: 23.6345, lng: -102.5528 },
    "Argentina": { lat: -38.4161, lng: -63.6167 },
    "Chile": { lat: -35.6751, lng: -71.5430 },
    "Colombia": { lat: 4.5709, lng: -74.2973 },
    "Saudi Arabia": { lat: 23.8859, lng: 45.0792 },
    "Turkey": { lat: 38.9637, lng: 35.2433 }
  };

  const mockLocations = [
    { id: 1, lat: 55.7558, lng: 37.6173, color: theme.critical, label: "MOSCOW (Critical)", ip: "192.168.1.105" },
    { id: 2, lat: 39.9042, lng: 116.4074, color: theme.warning, label: "BEIJING (High)", ip: "45.22.19.12" },
    { id: 3, lat: 40.7128, lng: -74.0060, color: theme.safe, label: "NEW YORK (Normal)", ip: "10.0.0.45" },
  ];

  let threatLocations = []; 
  
  const hasRealData = data && data.length > 0;
  
  if (hasRealData) {
    const processedLocations = [];
    const displaySlice = data.slice(0, 50);
    
    displaySlice.forEach((entry, idx) => {
      if (!entry.origin_country || entry.origin_country === 'Unknown' || entry.origin_country === '-') return;
      
      const parts = entry.origin_country.split(',');
      const countryName = parts[parts.length - 1].trim(); 
      const coords = COUNTRY_COORDINATES[countryName];
      
      if (coords) {
        let color = theme.safe;
        let labelSuffix = "(Normal)";
        const level = entry.threat_level ? entry.threat_level.toUpperCase() : "";
        let shouldShow = false;

        if (level.includes("CRITICAL")) {
          color = theme.critical;
          labelSuffix = "(Critical)";
          shouldShow = true;
        } else if (level.includes("HIGH") || level.includes("MEDIUM")) {
          color = theme.warning;
          labelSuffix = "(Suspicious)";
          shouldShow = true;
        }

        if (shouldShow) {
            const jitterLat = coords.lat + (Math.random() * 2 - 1);
            const jitterLng = coords.lng + (Math.random() * 2 - 1);
            
            processedLocations.push({
              id: idx,
              lat: jitterLat,
              lng: jitterLng,
              color: color,
              label: `${countryName.toUpperCase()} ${labelSuffix}`,
              ip: entry.ip
            });
        }
      }
    });

    threatLocations = processedLocations;
  } else {
     if (!data) threatLocations = mockLocations;
  }

  const getMapPosition = (lat, lng) => {
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    const finalX = (x * calibration.xScale) + calibration.xOffset;
    const finalY = (y * calibration.yScale) + calibration.yOffset;
    return { left: `${finalX}%`, top: `${finalY}%` };
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="relative w-full h-full max-w-6xl flex items-center justify-center">
        <img
          src="/world_map.png" 
          alt="World Threat Map"
          className="w-full h-full object-contain drop-shadow-2xl opacity-80 theme-transition"
          style={{ filter: `drop-shadow(0 0 20px ${theme.accentDim})` }}
        />
        
        <div className="absolute inset-0 pointer-events-none">
           {threatLocations.map((loc, idx) => {
             const pos = getMapPosition(loc.lat, loc.lng);
             return (
               <MapMarker 
                 key={loc.id}
                 top={pos.top} 
                 left={pos.left} 
                 color={loc.color} 
                 label={loc.label} 
                 ip={loc.ip}
                 pulse={loc.color === theme.critical || loc.color === theme.warning}
                 delay={`${idx * 0.5}s`}
               />
             );
           })}
        </div>
        
        <div className="absolute top-8 left-8 bg-[var(--bg-main)]/80 backdrop-blur border border-[var(--accent)]/30 p-4 rounded-xl shadow-lg theme-transition">
          <h3 className="text-[var(--text-primary)] font-bold mb-2 uppercase tracking-tight text-xs">Active Threat Intelligence</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-critical)]"></span>
              <span className="text-[10px] text-[var(--accent)] uppercase font-bold tracking-wider">Critical Incursion</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-warning)]"></span>
              <span className="text-[10px] text-[var(--accent)] uppercase font-bold tracking-wider">Suspicious Activity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapMarker({ top, left, color, label, ip, pulse, delay }) {
  return (
    <div 
      className="absolute group cursor-pointer pointer-events-auto"
      style={{ top, left }}
    >
      <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
        <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-main)]/90 backdrop-blur border border-[var(--accent)]/50 p-2 rounded-lg shadow-xl absolute bottom-full flex flex-col items-center z-50 pointer-events-none min-w-[100px] theme-transition">
          <span className="text-[var(--text-primary)] text-xs font-bold mb-0.5">{label}</span>
          <span className="text-[var(--accent)] font-mono text-[10px] tracking-wider">{ip}</span>
        </div>
        
        <MapPin 
          size={24} 
          fill={color} 
          className="text-[var(--bg-main)] drop-shadow-xl relative z-10 hover:scale-110 transition-transform theme-transition" 
        />
        
        {pulse && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center">
             <span 
               className="h-8 w-8 rounded-full opacity-75 animate-ping absolute" 
               style={{ backgroundColor: color, animationDelay: delay }}
             ></span>
          </div>
        )}
      </div>
    </div>
  );
}