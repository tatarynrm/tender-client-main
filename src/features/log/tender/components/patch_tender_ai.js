const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'TenderSaveForm.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add missing imports
if (!content.includes('import axios')) {
  content = content.replace('import { toast } from "sonner";', 'import { toast } from "sonner";\nimport axios from "axios";');
}

const lucideImports = 'LayoutDashboard, Sparkles, UploadCloud, Zap, BrainCircuit, ClipboardList, Search, ChevronDown, ChevronUp, Mic, Square, Play, Pause, Volume2, Trash2, Check, X as LucideX';
if (!content.includes('Sparkles')) {
  content = content.replace('LayoutDashboard,\n} from "lucide-react";', `${lucideImports}\n} from "lucide-react";`);
}

// 2. Rename custom X to CustomX to avoid conflict with LucideX
content = content.replace('const X = ({ className }', 'const CustomX = ({ className }');

// 3. Add VoiceVisualizer and TenderPreviewCard before export default function TenderSaveForm
const componentsToAdd = `
// ---------- VoiceVisualizer Component ----------
const VoiceVisualizer = ({ stream }: { stream: MediaStream | null }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      if (!ctx || !canvas) return;
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / (bufferLength / 2)) * 2;
      let barHeight;
      let x = 0;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#818cf8'); // indigo-400
      gradient.addColorStop(1, '#6366f1'); // indigo-500

      for (let i = 0; i < bufferLength / 2; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = gradient;
        const centerY = canvas.height / 2;
        const h = Math.max(2, barHeight);
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, centerY - h / 2, barWidth - 1, h, [2]);
        else ctx.rect(x, centerY - h / 2, barWidth - 1, h);
        ctx.fill();
        x += barWidth;
      }
    };
    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [stream]);

  return (
    <canvas ref={canvasRef} width={200} height={40} className="w-full h-10 opacity-80" />
  );
};

const getCompanyName = (data: any) => {
  if (!data) return "";
  return data.company_name || data.companyName || data.client?.company_name || data.client?.companyName || data.id_client_info?.company_name || data.id_client_info?.name || data.client?.name || "";
};

const TenderPreviewCard = ({ data, onApply, onSave, onDelete, onPin, isPinned, isSelected, onSelect, isDraft = false, isActive }: any) => {
  const origins = data.origins || [];
  const destinations = data.destinations || [];

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-[2rem] border-2 p-5 transition-all duration-300",
        isActive ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-lg" : isPinned ? "border-amber-200 bg-amber-50/30 shadow-amber-100/50 dark:border-amber-500/20 dark:bg-amber-500/5" : isSelected ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" : "border-slate-100 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md dark:border-white/5 dark:bg-slate-900/40 dark:hover:border-indigo-500/20"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-1.5">
          {data.cargoName && (
            <span className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">{data.cargoName}</span>
          )}
          {data.weight && (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">{data.weight} т</span>
          )}
          {data.volume && (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">{data.volume} м³</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onPin && (
            <button onClick={(e) => { e.stopPropagation(); onPin(); }} className={cn("rounded-xl p-2 transition-all", isPinned ? "bg-amber-100 text-amber-600" : "text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5")}>
              <Pin size={16} fill={isPinned ? "currentColor" : "none"} />
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="rounded-xl p-2 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"><Trash2 size={16} /></button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative pl-10 pr-2">
          <div className="absolute bottom-[14px] left-[20px] top-[14px] w-[2px] border-l-2 border-dashed border-slate-200 dark:border-white/10" />
          <div className="relative mb-6">
            <div className="absolute -left-[28px] top-1/2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-900"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /></div>
            <div className="flex flex-col"><span className="mb-0.5 text-[9px] font-black uppercase tracking-tighter text-slate-400">Звідки</span>
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  {origins.length > 0 ? origins.map((o: any, idx: number) => (
                    <div key={idx} className="mb-1 flex flex-col last:mb-0"><span className="text-[13px] font-bold text-slate-800 dark:text-white">{o.city || o.address}</span></div>
                  )) : <span className="text-[13px] font-bold text-slate-800 dark:text-white">—</span>}
                </div>
                {data.dateLoad && <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-500 dark:bg-indigo-500/10">{new Date(data.dateLoad).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-[28px] top-1/2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border-2 border-emerald-500 bg-white dark:bg-slate-900"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /></div>
            <div className="flex flex-col"><span className="mb-0.5 text-[9px] font-black uppercase tracking-tighter text-slate-400">Куди</span>
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  {destinations.length > 0 ? destinations.map((d: any, idx: number) => (
                    <div key={idx} className="mb-1 flex flex-col last:mb-0"><span className="text-[13px] font-bold text-slate-800 dark:text-white">{d.city || d.address}</span></div>
                  )) : <span className="text-[13px] font-bold text-slate-800 dark:text-white">—</span>}
                </div>
                {data.dateUnload && <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-500 dark:bg-emerald-500/10">{new Date(data.dateUnload).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-4 dark:border-white/5 sm:flex-row sm:items-center">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1"><span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">Ліміт:</span>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{data.price ? \`\${data.price} \${data.currency || "UAH"}\` : "Запит"}</span>
          </div>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          {onSave && (<button onClick={onSave} className="shrink-0 rounded-2xl bg-slate-50 p-3 text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-500 dark:bg-white/5 dark:hover:bg-indigo-500/10"><Save size={18} /></button>)}
          <AppButton onClick={onApply} size="sm" className={cn("!rounded-2xl px-6 text-[11px] font-black uppercase tracking-wider flex-1 sm:flex-none", isDraft ? "bg-slate-900 dark:bg-slate-800" : "bg-indigo-600 shadow-indigo-200")} rightIcon={<ChevronRight size={14} />}>{isDraft ? "Вставити" : "Вибрати"}</AppButton>
        </div>
      </div>

      {onSelect && (
        <div onClick={onSelect} className={cn("absolute left-4 top-4 z-20 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border-2 transition-all", isSelected ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-200 bg-white opacity-0 group-hover:opacity-100 dark:border-white/10 dark:bg-slate-800")}>
          {isSelected && <Check size={14} strokeWidth={4} />}
        </div>
      )}
    </div>
  );
};
`;

if (!content.includes('const VoiceVisualizer')) {
  // Add before export default function...
  content = content.replace('export default function TenderSaveForm', componentsToAdd + '\nexport default function TenderSaveForm');
}

// 4. Add AI states inside TenderSaveForm
const aiStates = `
  // --- AI & Drafts States ---
  const [aiText, setAiText] = useState("");
  const [aiFiles, setAiFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]); 
  const [drafts, setDrafts] = useState<any[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [draftSearch, setDraftSearch] = useState("");

  const [isAiExpanded, setIsAiExpanded] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("tender_ai_expanded") === "true";
    return false;
  });
  const [isDraftsExpanded, setIsDraftsExpanded] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("tender_drafts_expanded") === "true";
    return false;
  });

  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [isAiDragging, setIsAiDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void; confirmText?: string; variant?: "danger" | "primary"; }>({ open: false, title: "", description: "", onConfirm: () => {} });
  const [showAiWarning, setShowAiWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<"submit" | "reset" | null>(null);
  const [pendingSubmitValues, setPendingSubmitValues] = useState<TenderFormValues | null>(null);

  useEffect(() => { localStorage.setItem("tender_ai_expanded", String(isAiExpanded)); }, [isAiExpanded]);
  useEffect(() => { localStorage.setItem("tender_drafts_expanded", String(isDraftsExpanded)); }, [isDraftsExpanded]);

  const filteredDrafts = React.useMemo(() => {
    let result = [...drafts];
    if (draftSearch.trim()) {
      const search = draftSearch.toLowerCase();
      result = result.filter((d) => d.title?.toLowerCase().includes(search));
    }
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [drafts, draftSearch]);

  // Load drafts on mount
  useEffect(() => {
    const saved = localStorage.getItem("tender_cargo_drafts");
    if (saved) {
      try { setDrafts(JSON.parse(saved)); } catch (e) { console.error("Error loading drafts", e); }
    }
  }, []);

  useEffect(() => {
    if (drafts.length > 0) localStorage.setItem("tender_cargo_drafts", JSON.stringify(drafts));
    else localStorage.removeItem("tender_cargo_drafts");
  }, [drafts]);

  // Audio helpers
  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setIsPlaying(false); }
  }, [audioBlob]);

  useEffect(() => {
    let interval: any;
    if (isRecording) interval = setInterval(() => setRecordingDuration((p) => p + 1), 1000);
    else setRecordingDuration(0);
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        setAudioBlob(new Blob(chunks, { type: "audio/webm" }));
        setAudioStream(null);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioBlob(null);
    } catch (err) { toast.error("Не вдалося отримати доступ до мікрофона"); }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
    }
  };

  const handleDictation = () => {
    if (isDictating) return setIsDictating(false);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error("Ваш браузер не підтримує розпізнавання мови");
    const recognition = new SpeechRecognition();
    recognition.lang = "uk-UA";
    recognition.onstart = () => { setIsDictating(true); toast.info("Слухаю вас..."); };
    recognition.onresult = (e: any) => { setAiText((p) => (p ? \`\${p} \${e.results[0][0].transcript}\` : e.results[0][0].transcript)); setIsDictating(false); };
    recognition.onerror = () => setIsDictating(false);
    recognition.onend = () => setIsDictating(false);
    recognition.start();
  };

  const handleAiAnalyze = async () => {
    if (!aiText.trim() && aiFiles.length === 0 && !audioBlob) return toast.error("Введіть текст, додайте фото або запишіть голос для аналізу");
    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("text", aiText);
      aiFiles.forEach((f) => formData.append("images", f));
      if (audioBlob) formData.append("audio", audioBlob, "voice_command.webm");
      const { data } = await api.post("/ai/logistics/parse-cargo", formData);
      if (data?.loads?.length > 0) {
        setAiResults(data.loads);
        toast.success(\`Знайдено тендерів: \${data.loads.length}\`);
      } else toast.error("AI не зміг знайти дані у вашому запиті");
    } catch (err) { toast.error("Помилка під час AI аналізу"); } finally { setIsAnalyzing(false); }
  };

  const isValidDate = (ds: any) => { if (!ds || typeof ds !== "string") return false; const d = new Date(ds); return d instanceof Date && !isNaN(d.getTime()); };

  const applyAiResult = (result: any, draftId?: string) => {
    if (!result) return;
    setValue("notes", "");
    setValue("price_start", undefined);
    setValue("id_owner_company", null);
    setCompanyLabel("");
    setValue("tender_trailer", []);
    setValue("car_count", 1);
    setValue("ids_valut", "UAH");

    if (result.origins?.length > 0) {
      setValue("tender_route", result.origins.map((loc: any, idx: number) => ({ ...loc, ids_point: "LOAD_FROM", order_num: idx + 1, customs: false, address: loc.city || loc.address })));
    } else setValue("tender_route", [{ address: "", ids_point: "LOAD_FROM", order_num: 1, customs: false }]);

    if (result.destinations?.length > 0) {
      const existing = form.getValues("tender_route");
      const offset = existing.length;
      result.destinations.forEach((loc: any, idx: number) => {
        existing.push({ ...loc, ids_point: "LOAD_TO", order_num: offset + idx + 1, customs: false, address: loc.city || loc.address });
      });
      setValue("tender_route", existing);
    }

    if (result.price) { setValue("price_start", result.price); }
    if (result.id_client) setCompanyLabel(getCompanyName(result));
    if (result.currency) {
      const cur = result.currency.toUpperCase();
      if (valut.map(v => v.value).includes(cur)) setValue("ids_valut", cur);
    }
    if (result.truckCount) setValue("car_count", result.truckCount);
    if (isValidDate(result.dateLoad)) setValue("date_load", new Date(result.dateLoad));
    if (isValidDate(result.dateUnload)) setValue("date_unload", new Date(result.dateUnload));

    let mappedTrailers: any[] = [];
    if (result.truckTypes?.length > 0) {
      mappedTrailers = result.truckTypes.map((name: string) => {
        const found = truckList.find((t) => t.label.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(t.label.toLowerCase()));
        return found ? { ids_trailer_type: found.value } : null;
      }).filter(Boolean);
    }
    if (mappedTrailers.length > 0) setValue("tender_trailer", mappedTrailers);

    if (result.cargoName) setValue("cargo", result.cargoName);
    if (result.weight) setValue("weight", result.weight);
    if (result.volume) setValue("volume", result.volume);

    if (draftId) setActiveDraftId(draftId);
    else setActiveDraftId(null);
    setAiResults((prev) => prev.filter((r) => r !== result));
    if (aiResults.length <= 1) { setAiText(""); setAiFiles([]); }
    toast.success("Дані завантажено у форму!");
  };

  const saveToDrafts = (result: any) => {
    const newDraft = {
      id: Math.random().toString(36).substr(2, 9),
      title: [...(result.origins || []), ...(result.destinations || [])].map(loc => loc.city || loc.address).join(", "),
      data: result,
      createdAt: new Date().toISOString(),
      isPinned: false,
    };
    setDrafts((prev) => [newDraft, ...prev].slice(0, 20));
    setAiResults((prev) => prev.filter((r) => r !== result));
    toast.success("Збережено в чернетки");
  };

  const handleBulkSaveAiToDrafts = () => {
    const newDrafts = aiResults.map((res) => ({
      id: Math.random().toString(36).substring(2, 9),
      title: [...(res.origins || []), ...(res.destinations || [])].map((loc) => loc.city || loc.address).join(", "),
      data: res,
      createdAt: new Date().toISOString(),
    }));
    setDrafts((prev) => [...newDrafts, ...prev].slice(0, 20));
    setAiResults([]);
    setShowAiWarning(false);
    if (pendingAction === "submit" && pendingSubmitValues) onSubmit(pendingSubmitValues);
    setPendingAction(null);
  };

  const handleDiscardAiResults = () => {
    setAiResults([]);
    setShowAiWarning(false);
    if (pendingAction === "submit" && pendingSubmitValues) onSubmit(pendingSubmitValues);
    setPendingAction(null);
  };

  const togglePinDraft = (id: string) => setDrafts(prev => prev.map(d => d.id === id ? { ...d, isPinned: !d.isPinned } : d));
  const toggleSelectDraft = (id: string) => setSelectedDraftIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const handleDeleteDraft = (id: string) => { /* simplified */ setDrafts(prev => prev.filter(d => d.id !== id)); };
  const handleDeleteSelectedDrafts = () => { /* simplified */ setDrafts(prev => prev.filter(d => !selectedDraftIds.includes(d.id))); setSelectedDraftIds([]); };
  const handleDeleteAllDrafts = () => { /* simplified */ setDrafts([]); setSelectedDraftIds([]); };

`;

if (!content.includes('const [aiText, setAiText]')) {
  content = content.replace('const [isLoadedDraft, setIsLoadedDraft] = useState(false);', 'const [isLoadedDraft, setIsLoadedDraft] = useState(false);\n' + aiStates);
}

// 5. Wrap the form inside the 12-col grid
// Find `<div className="gap-2 w-full overflow-x-hidden pb-40 scrollbar-thin">` -> then `<Form {...form}>`

// We inject the AI HTML block before the form. 
// However, the original structure:
// <div className="gap-2 w-full overflow-x-hidden pb-40 scrollbar-thin">
//   <Form {...form}>
// We will replace it with:
// <div className="gap-2 w-full overflow-x-hidden pb-40 scrollbar-thin">
//   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
//     {!defaultValues && ( <AI_BLOCK /> )}
//     <div className={cn("space-y-6 order-3 lg:order-2", !defaultValues ? "lg:col-span-8" : "lg:col-span-12")}>
//       <Form {...form}> ... </Form>
//     </div>
//   </div>
// </div>

const aiHtml = `
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    {/* LEFT COLUMN: AI ASSISTANT (4 cols) */}
    {!defaultValues && (
      <div className="lg:col-span-4 space-y-4 order-1">
        <button type="button" onClick={() => setIsAiExpanded(!isAiExpanded)} className="lg:hidden w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-xl"><Sparkles className="text-white w-4 h-4" /></div>
            <div className="text-left"><h3 className="text-sm font-bold text-slate-800 dark:text-white">AI Помічник</h3><p className="text-[10px] text-slate-500">{aiFiles.length > 0 || aiText ? "Данні додано" : "Вставити текст або фото"}</p></div>
          </div>
          {isAiExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>

        <div className={cn("space-y-4 lg:block animate-in fade-in duration-300", isAiExpanded ? "block" : "hidden")}>
          <div className={cn("bg-gradient-to-br from-indigo-50/50 to-fuchsia-50/50 dark:from-indigo-950/10 dark:to-fuchsia-950/10 backdrop-blur-md border border-indigo-200/50 dark:border-indigo-500/20 p-6 rounded-[2rem] shadow-sm relative overflow-hidden transition-all duration-300", isAiDragging && "ring-4 ring-indigo-500 ring-inset scale-[1.02]")}
            onDragOver={(e) => { e.preventDefault(); setIsAiDragging(true); }}
            onDragLeave={() => setIsAiDragging(false)}
            onDrop={(e) => {
              e.preventDefault(); setIsAiDragging(false);
              const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
              if (files.length > 0) { setAiFiles(p => [...p, ...files]); setAiText(""); toast.success(\`Додано \${files.length} фото!\`); }
            }}
          >
            {isAiDragging && (
              <div className="absolute inset-0 bg-indigo-500/20 backdrop-blur-[2px] z-[50] flex flex-col items-center justify-center animate-in fade-in duration-200 pointer-events-none">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-full shadow-2xl animate-bounce"><UploadCloud className="text-indigo-500 w-10 h-10" /></div>
                <span className="mt-4 text-indigo-700 dark:text-indigo-300 font-black uppercase tracking-widest text-sm">Перетягніть фото сюди</span>
              </div>
            )}
            <div className="flex items-center gap-3 mb-5 lg:flex hidden"><Sparkles className="text-indigo-500 w-5 h-5" /><h3 className="font-bold text-slate-800 dark:text-white">AI Помічник</h3></div>

            <div className="space-y-4" onPaste={(e) => {
              const items = e.clipboardData.items;
              for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                  const file = items[i].getAsFile();
                  if (file) { setAiFiles(p => [...p, file]); setAiText(""); toast.success("Зображення додано з буфера обміну!"); }
                }
              }
            }}>
              <div className="relative h-48 group/container">
                {aiFiles.length > 0 ? (
                  <div className="w-full h-full p-3 rounded-[1.5rem] bg-white/50 dark:bg-slate-900/50 border border-indigo-100 dark:border-indigo-500/20 flex flex-wrap gap-2 items-start overflow-y-auto custom-scrollbar relative">
                    <button type="button" onClick={() => setAiFiles([])} className="absolute top-2 right-2 z-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-1.5 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase backdrop-blur-sm border border-red-500/20"><Trash2 size={12} /> Очистити</button>
                    {aiFiles.map((file, idx) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <div key={idx} className="relative w-20 aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group/img animate-in zoom-in-95">
                          <img src={url} alt="preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setAiFiles(p => p.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500/80 p-1 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity"><LucideX size={10} className="text-white" /></button>
                        </div>
                      );
                    })}
                    <label className="w-20 aspect-square rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/20 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-colors">
                      <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => { if (e.target.files) { setAiFiles(p => [...p, ...Array.from(e.target.files!)]); setAiText(""); } }} />
                      <Plus className="text-indigo-400 w-5 h-5" />
                    </label>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <textarea className="w-full h-full p-4 pr-12 rounded-[1.5rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-sm" placeholder="Вставте текст заявки,або фото" value={aiText} onChange={(e) => setAiText(e.target.value)} />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {aiText && <button type="button" onClick={() => setAiText("")} className="text-slate-300 hover:text-red-500 transition-colors"><LucideX size={18} /></button>}
                      <button type="button" onClick={handleDictation} className={cn("transition-all", isDictating ? "text-red-500 animate-pulse" : "text-slate-300 hover:text-indigo-500")} title="Надиктувати текст"><Mic size={18} /></button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition-all p-3">
                  <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => { if (e.target.files) setAiFiles(p => [...p, ...Array.from(e.target.files!)]); }} />
                  <UploadCloud className="text-slate-400 w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Фото</span>
                </label>
                <button type="button" onClick={isRecording ? stopRecording : startRecording} className={cn("flex-1 flex flex-col items-center justify-center border-2 rounded-2xl transition-all p-3 relative overflow-hidden", isRecording ? "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-500" : audioBlob ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "border-dashed border-slate-200 dark:border-white/10 text-slate-400 hover:border-indigo-500 hover:bg-indigo-50/30")}>
                  {isRecording ? (
                    <div className="flex flex-col items-center justify-center w-full">
                      <VoiceVisualizer stream={audioStream} />
                      <div className="flex items-center gap-2 mt-1"><Square size={14} className="animate-pulse" /><span className="text-[10px] font-bold uppercase">{Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}</span></div>
                    </div>
                  ) : audioBlob ? (
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <button type="button" onClick={(e) => { e.stopPropagation(); if(isPlaying) { audioRef.current?.pause(); setIsPlaying(false); } else { if(!audioRef.current) { audioRef.current = new Audio(URL.createObjectURL(audioBlob)); audioRef.current.onended = () => setIsPlaying(false); } audioRef.current.play(); setIsPlaying(true); } }} className="p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">{isPlaying ? <Pause size={12} /> : <Play size={12} />}</button>
                        <Volume2 size={12} className="text-slate-400" /><span className="text-[10px] font-bold uppercase truncate max-w-[60px]">Аудіо</span>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setAudioBlob(null); if(audioRef.current) { audioRef.current.pause(); audioRef.current = null; } setIsPlaying(false); }} className="text-[9px] font-bold text-red-500 uppercase hover:underline">Видалити</button>
                    </div>
                  ) : (<><Mic size={20} className="mb-1" /><span className="text-[10px] font-bold uppercase">Голос</span></>)}
                </button>
                <AppButton type="button" onClick={handleAiAnalyze} isLoading={isAnalyzing} disabled={isAnalyzing || (!aiText.trim() && aiFiles.length === 0 && !audioBlob)} className="flex-[2] bg-indigo-600 shadow-indigo-600/20 shadow-lg !rounded-2xl" leftIcon={<Zap size={16} />}>Аналізувати</AppButton>
              </div>
            </div>
          </div>

          {aiResults.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-500">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2"><BrainCircuit className="text-indigo-500 w-4 h-4" /><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Знайдені ({aiResults.length})</h4></div>
                {aiResults.length > 1 && <button type="button" onClick={handleBulkSaveAiToDrafts} className="text-[9px] font-black text-indigo-500 uppercase hover:underline">Зберегти всі</button>}
              </div>
              <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                {aiResults.map((res, i) => (
                  <TenderPreviewCard key={i} data={res} onApply={() => applyAiResult(res)} onSave={() => saveToDrafts(res)} onDelete={() => setAiResults(p => p.filter(r => r !== res))} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <button type="button" onClick={() => setIsDraftsExpanded(!isDraftsExpanded)} className="lg:hidden w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm mt-4">
            <div className="flex items-center gap-3"><div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><ClipboardList className="text-slate-500 w-4 h-4" /></div><h3 className="text-sm font-bold text-slate-800 dark:text-white">Чернетки ({drafts.length})</h3></div>
            {isDraftsExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </button>
          <div className={cn("space-y-4 lg:block animate-in fade-in duration-300", isDraftsExpanded ? "block" : "hidden")}>
            <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 p-5 rounded-[2rem] shadow-sm">
              <div className="flex items-center justify-between mb-4"><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ваші чернетки</h4><div className="flex gap-2">{selectedDraftIds.length > 0 && (<button type="button" onClick={handleDeleteSelectedDrafts} className="text-[9px] text-red-500 font-bold uppercase hover:underline">Видалити обрані</button>)}{drafts.length > 0 && (<button type="button" onClick={handleDeleteAllDrafts} className="text-[9px] text-zinc-400 font-bold uppercase hover:text-red-500">Очистити</button>)}</div></div>
              <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" /><input type="text" placeholder="Пошук..." className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500" value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)} /></div>
              <div className="space-y-3 h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredDrafts.length > 0 ? filteredDrafts.map((draft) => (
                  <TenderPreviewCard key={draft.id} data={draft.data} isDraft isActive={activeDraftId === draft.id} isPinned={draft.isPinned} isSelected={selectedDraftIds.includes(draft.id)} onApply={() => applyAiResult(draft.data, draft.id)} onDelete={() => handleDeleteDraft(draft.id)} onPin={() => togglePinDraft(draft.id)} onSelect={() => toggleSelectDraft(draft.id)} />
                )) : (<div className="py-10 text-center opacity-40"><ClipboardList className="mx-auto mb-2 h-8 w-8" /><p className="text-xs font-bold">Чернеток немає</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* MIDDLE COLUMN: MAIN FORM */}
    <div className={cn("space-y-6 order-3 lg:order-2", !defaultValues ? "lg:col-span-8" : "lg:col-span-12")}>
      <Form {...form}>
`;

if (!content.includes('LEFT COLUMN: AI ASSISTANT')) {
  // Replace the opening form tag up to `<Form {...form}>` with the customized Grid HTML
  const originalOpen = '<Form {...form}>';
  content = content.replace(originalOpen, aiHtml);
  
  // Notice that we opened 2 generic divs (grid and col-span). We need to close them.
  // Look at the bottom of TenderSaveForm.tsx: "</div>\n  );\n}"
  content = content.replace('</Form>\n\n      <style jsx global>', '</Form>\n    </div>\n  </div>\n\n      <style jsx global>');
}

fs.writeFileSync(file, content);
console.log('Patched correctly');
