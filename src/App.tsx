import { useState, useEffect, useRef } from "react";

const STARS = Array.from({ length: 55 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5, delay: Math.random() * 3, dur: Math.random() * 2 + 2,
}));
const FLAKES = Array.from({ length: 18 }, (_, i) => ({
  id: i, x: Math.random() * 100, delay: Math.random() * 6, dur: Math.random() * 4 + 4, size: Math.random() * 10 + 8,
}));

// ─── Fallbacks ────────────────────────────────────────────────────────────────
const CHAT_FALLBACKS: Record<string, Record<string, string[]>> = {
  it: {
    young: [
      "Ciao! 🧙‍♀️ Sono la Befana! Dimmi la verità: hai fatto qualcosa di cui sei orgoglioso quest'anno? 🌟",
      "Brave le persone oneste! ❄️ Dimmi sinceramente: c'è qualcosa che avresti fatto diversamente? 🧹",
      "La Befana ama chi è onesto! 🧦 Hai mai detto una bugia? Puoi dirmelo, non ti giudico! 😊",
      "Sei speciale perché sei sincero! ✨ Cosa hai imparato di nuovo quest'anno?",
    ],
    older: [
      "Buonasera! 🧹✨ Sapevi che la Befana porta dolci ai bambini che danno risposte oneste? Pronti per una domanda?",
      "Eccomi! 🌟 Ho una domanda per te: secondo la leggenda, cosa porta la Befana ai bambini monelli?",
      "Bene! 😏 Altra domanda: in quale notte vola la Befana sui tetti d'Italia?",
      "Quasi finito! ✨ Ultima domanda: da dove entra la Befana nelle case?",
    ],
  },
  nl: {
    young: [
      "Hallo! 🧙‍♀️ Ik ben de Befana! Vertel me eerlijk: heb jij dit jaar iets gedaan waar je trots op bent? 🌟",
      "Eerlijke mensen zijn de liefste! ❄️ Vertel me oprecht: is er iets dat je anders had willen doen? 🧹",
      "De Befana houdt van eerlijkheid! 🧦 Heb je wel eens een leugentje verteld? Dat mag je zeggen, ik oordeel niet! 😊",
      "Jij bent bijzonder omdat je eerlijk bent! ✨ Wat heb je dit jaar nieuws geleerd?",
    ],
    older: [
      "Goedenavond! 🧹✨ Wist je dat de Befana snoep brengt aan kinderen die de goede antwoorden weten? Klaar voor een vraag?",
      "Daar ben ik! 🌟 Eerste vraag: wat brengt de Befana volgens de legende aan stoute kinderen?",
      "Goed! 😏 Volgende vraag: in welke nacht vliegt de Befana over de daken van Italië?",
      "Bijna klaar! ✨ Laatste vraag: hoe komt de Befana de huizen binnen?",
    ],
  },
};

// ─── Quiz answers (for older children) ───────────────────────────────────────
const QUIZ_ANSWERS: Record<string, string[][]> = {
  it: [
    ["carbone", "carbone nero", "il carbone", "coal"],
    ["5 gennaio", "notte del 5", "5 e 6 gennaio", "tra il 5 e il 6", "epifania"],
    ["camino", "dal camino", "per il camino", "caminetto"],
  ],
  nl: [
    ["kolen", "steenkool", "coal", "zwarte kolen"],
    ["5 januari", "nacht van 5", "5 op 6 januari", "driekoningen", "epifania"],
    ["schoorsteen", "door de schoorsteen", "via de schoorsteen"],
  ],
};

const SOCK_FALLBACK: Record<string, Record<string, string>> = {
  it: {
    young: "Che risposta onesta e coraggiosa! 🌟 La Befana ama chi dice la verità — il tuo calzino è pieno di dolci! 🍬✨",
    older: "Bravissimo/a! 🎉 Conosci bene la storia della Befana — il tuo calzino è pieno di dolci! 🍬🌟",
  },
  nl: {
    young: "Wat een eerlijk en dapper antwoord! 🌟 De Befana houdt van mensen die de waarheid spreken — jouw sok zit vol snoep! 🍬✨",
    older: "Heel goed! 🎉 Jij kent het verhaal van de Befana goed — jouw sok zit vol snoep! 🍬🌟",
  },
};

const SOCK_FALLBACK_COAL: Record<string, string> = {
  it: "Hmm, non proprio! 😄 Ma la Befana è di buon umore stasera — nel calzino ci sono solo dolci! La prossima volta studia la mia storia! 🍬",
  nl: "Hmm, niet helemaal goed! 😄 Maar de Befana is vanavond goedgehumeurd — in de sok zit toch snoep! Bestudeer mijn verhaal voor de volgende keer! 🍬",
};

const STORIES: Record<string, Record<string, { emoji: string; text: string }[]>> = {
  it: {
    young: [
      { emoji: "⭐", text: "Tanti tanti anni fa, tre Re Magi viaggiavano verso una stella luminosa." },
      { emoji: "🏠", text: "Lungo la strada videro una vecchietta con la scopa. Era la Befana!" },
      { emoji: "🧹", text: '"Vieni con noi!" dissero i Re Magi. "Andiamo a trovare un bambino speciale!"' },
      { emoji: "😔", text: '"Devo prima finire di spazzare!" disse la Befana. E i Re Magi partirono senza di lei.' },
      { emoji: "🌙", text: "Quella notte la Befana partì da sola, con la scopa volante e un sacchetto pieno di dolci." },
      { emoji: "🎁", text: "Non trovò mai il bambino speciale. Così da allora porta doni a tutti i bambini del mondo!" },
    ],
    older: [
      { emoji: "🌟", text: "Nell'antichità, il 6 gennaio i popoli italiani festeggiavano il solstizio d'inverno con fuochi e doni." },
      { emoji: "👑", text: "Secondo la leggenda, i tre Re Magi — Gaspare, Melchiorre e Baldassarre — si fermarono da una vecchia." },
      { emoji: "🧹", text: "La invitarono a Betlemme, ma lei era troppo impegnata con le sue faccende domestiche." },
      { emoji: "💔", text: "Rimpianta, preparò un cesto di doni e partì nella notte fredda. Ma si perse e non trovò mai il bambino." },
      { emoji: "✨", text: "Da allora, ogni anno nella notte tra il 5 e il 6 gennaio, vola sui tetti d'Italia sulla sua scopa magica." },
      { emoji: "🎁", text: "Entra dai camini e riempie le calze: dolci per i bravi... e carbone per i monelli! Epifania — tutte le feste porta via!" },
    ],
  },
  nl: {
    young: [
      { emoji: "⭐", text: "Lang lang geleden reisden drie Koningen naar een heldere ster." },
      { emoji: "🏠", text: "Onderweg zagen ze een oud vrouwtje met een bezem. Dat was de Befana!" },
      { emoji: "🧹", text: '"Ga mee!" zeiden de Koningen. "We gaan een bijzonder kindje bezoeken!"' },
      { emoji: "😔", text: '"Ik moet eerst vegen!" zei de Befana. En de Koningen vertrokken zonder haar.' },
      { emoji: "🌙", text: "Die nacht vloog de Befana alsnog weg, op haar bezem met een zak vol snoep." },
      { emoji: "🎁", text: "Ze vond het bijzondere kindje nooit. Daarom brengt ze sindsdien cadeautjes aan alle kinderen!" },
    ],
    older: [
      { emoji: "🌟", text: "In de oude Italiaanse traditie werd op 6 januari de winterzonnewende gevierd met vuren en geschenken." },
      { emoji: "👑", text: "Volgens de legende vroegen de drie Koningen — Caspar, Melchior en Balthasar — de weg aan een oude vrouw." },
      { emoji: "🧹", text: "Ze nodigden haar uit mee te gaan naar Bethlehem, maar ze was te druk met haar bezigheid." },
      { emoji: "💔", text: "Al snel had ze spijt. Ze pakte een mand met cadeautjes en vloog in de koude nacht. Maar ze verdwaalde." },
      { emoji: "✨", text: "Sindsdien vliegt ze elk jaar in de nacht van 5 op 6 januari over de daken van Italië op haar magische bezem." },
      { emoji: "🎁", text: "Ze klimt door schoorstenen en vult de sokken: snoep voor lieve kinderen... en kolen voor stoute! Epifania — het einde van alle feesten!" },
    ],
  },
};

const UI: Record<string, any> = {
  it: {
    subtitle: "La Magia dell'Epifania",
    menuStory: "📖 La storia della Befana",
    menuFly: "🧹 La Befana vola!",
    menuMirror: "🪞 Parla con la Befana",
    ageTitle: "Quanti anni hai?",
    age1: "4 – 6 anni 🌟", age2: "7 – 10 anni ✨",
    storyTitle: "La storia della Befana",
    nextBtn: "Avanti →", homeBtn: "🏠 Home",
    flyTitle: "La Befana sta arrivando!",
    flySub: "Sulla sua scopa magica, attraverso le stelle...",
    flyWait: "La Befana sta volando...",
    mirrorTitle: "Lo Specchio Magico",
    mirrorSubYoung: "Rispondi con il cuore... 💛",
    mirrorSubOlder: "Quante domande sai rispondere? 🧠",
    mirrorBtn: "Parla con la Befana 🪞",
    sendBtn: "Invia", placeholder: "Scrivi qui...",
    typing: "La Befana sta pensando... ✨",
    sockBtn: "🧦 Apri il calzino!",
    sockTitle: "Il tuo calzino...",
    sockSub: "La Befana ha deciso!",
    sockWait: "La Befana sta guardando nel calzino...",
    apiLabel: "🔑 Chiave API Gemini",
    apiHelp: "Ottieni la tua chiave gratuita su",
    apiStep: '→ "Get API key" → "Create API key"',
    apiSave: "Salva ✨", apiPrivacy: "🔒 Salvata solo nel browser",
    apiLink: "Per i genitori: chiave API",
    sockHintYoung: "Rispondi ancora un po'... la Befana ti sta ascoltando! 💛",
    sockHintOlder: "Ancora qualche domanda prima di aprire il calzino! 🧠",
  },
  nl: {
    subtitle: "De Magie van Driekoningen",
    menuStory: "📖 Het verhaal van Befana",
    menuFly: "🧹 Befana vliegt langs!",
    menuMirror: "🪞 Praat met de Befana",
    ageTitle: "Hoe oud ben jij?",
    age1: "4 – 6 jaar 🌟", age2: "7 – 10 jaar ✨",
    storyTitle: "Het verhaal van Befana",
    nextBtn: "Verder →", homeBtn: "🏠 Home",
    flyTitle: "De Befana komt eraan!",
    flySub: "Op haar magische bezem, door de sterren...",
    flyWait: "De Befana vliegt...",
    mirrorTitle: "De Magische Spiegel",
    mirrorSubYoung: "Antwoord met je hart... 💛",
    mirrorSubOlder: "Hoeveel vragen kun jij beantwoorden? 🧠",
    mirrorBtn: "Praat met de Befana 🪞",
    sendBtn: "Stuur", placeholder: "Typ hier...",
    typing: "De Befana denkt na... ✨",
    sockBtn: "🧦 Open de sok!",
    sockTitle: "Jouw sok...",
    sockSub: "De Befana heeft besloten!",
    sockWait: "De Befana kijkt in de sok...",
    apiLabel: "🔑 Gemini API-sleutel",
    apiHelp: "Haal je gratis sleutel op via",
    apiStep: '→ "Get API key" → "Create API key"',
    apiSave: "Opslaan ✨", apiPrivacy: "🔒 Alleen lokaal opgeslagen",
    apiLink: "Voor ouders: API-sleutel",
    sockHintYoung: "Vertel nog wat meer... de Befana luistert! 💛",
    sockHintOlder: "Nog een paar vragen voor de sok opengaat! 🧠",
  },
};

// ─── Gemini ───────────────────────────────────────────────────────────────────
const GEMINI_MODEL = "gemini-2.0-flash";
type GTurn = { role: string; parts: { text: string }[] };

const callGemini = async (apiKey: string, text: string, history: GTurn[] = []): Promise<string> => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [...history, { role: "user", parts: [{ text }] }] }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const out: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!out.trim()) throw new Error("empty");
  return out;
};

// ─── System prompts ───────────────────────────────────────────────────────────

const buildSysYoung = (lang: string) =>
  `You are the Befana — a warm, kind old witch. You talk to children aged 4-6.
Respond ONLY in ${lang === "it" ? "Italian" : "Dutch"}.
Your approach: you reward HONESTY, not good behaviour. Ask the child simple heartfelt questions (did they help someone, did they ever make a mistake, what are they proud of). 
When they answer honestly — even if they admit something naughty — always respond warmly and say the Befana loves honest children above all. Never judge. Always end with encouragement.
Keep responses very short: max 2-3 sentences, simple words, warm emojis. Never break character.`;

const buildSysOlder = (lang: string) =>
  `You are the Befana — a mysterious, playful old witch. You talk to children aged 7-10.
Respond ONLY in ${lang === "it" ? "Italian" : "Dutch"}.
Your approach: ask the child fun quiz questions about the Befana legend (what she brings to naughty children, which night she flies, how she enters houses, where the tradition comes from).
For each answer: react playfully. If correct → celebrate warmly. If wrong → tease gently and give a hint, never make them feel bad.
Keep responses short: max 3 sentences, playful tone, emojis. Never break character.`;

// ─── Sock evaluation ──────────────────────────────────────────────────────────

const buildSockPromptYoung = (lang: string, convo: string) =>
  `You are evaluating a conversation between the Befana and a young child (4-6 years old).
The Befana rewards HONESTY, not good behaviour. If the child answered at all — even admitting something naughty — that counts as honest and deserves sweets.
Conversation:\n${convo}
Return ONLY valid JSON:
{"result":"dolci","message":"very warm, simple closing message in ${lang === "it" ? "Italian" : "Dutch"} from Befana praising the child's honesty, max 2 sentences, emojis, simple words"}`;

const buildSockPromptOlder = (lang: string, convo: string) =>
  `You are evaluating a quiz conversation between the Befana and a child (7-10 years old) about Befana trivia.
Count how many answers were roughly correct. If more than half correct → dolci. If mostly wrong → carbone (but keep it playful and funny, not mean — even coal comes with a laugh).
Conversation:\n${convo}
Return ONLY valid JSON:
{"result":"dolci or carbone","message":"playful closing message in ${lang === "it" ? "Italian" : "Dutch"} from Befana, max 2 sentences, emojis. If carbone: make it funny not sad, say she'll bring sweets next year if they study her story"}`;

// ─── Local quiz checker (fallback for older, no API) ─────────────────────────
const checkQuizAnswer = (lang: string, questionIdx: number, answer: string): boolean => {
  if (questionIdx < 0 || questionIdx >= QUIZ_ANSWERS[lang].length) return true;
  const ans = answer.toLowerCase().trim();
  return QUIZ_ANSWERS[lang][questionIdx].some(correct => ans.includes(correct));
};

type Screen = "lang" | "age" | "home" | "story" | "fly" | "mirror" | "sock";
type Msg = { from: "befana" | "child"; text: string };

export default function App() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("befana_gemini_key") || "");
  const [apiInput, setApiInput] = useState("");
  const [showApi, setShowApi] = useState(false);
  const [lang, setLang] = useState("");
  const [age, setAge] = useState("");
  const [screen, setScreen] = useState<Screen>("lang");
  const [storyIdx, setStoryIdx] = useState(0);
  const [befanaX, setBefanaX] = useState(-15);
  const [flyDone, setFlyDone] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [history, setHistory] = useState<GTurn[]>([]);
  const [fbIdx, setFbIdx] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [childMsgCount, setChildMsgCount] = useState(0);
  // For older quiz: track correct answers locally
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [sockResult, setSockResult] = useState<{ result: string; message: string } | null>(null);
  const [sockLoading, setSockLoading] = useState(false);

  const chatEnd = useRef<HTMLDivElement>(null);
  const T = lang ? UI[lang] : UI["nl"];

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  useEffect(() => {
    if (screen !== "fly") return;
    setBefanaX(-15);
    setFlyDone(false);
    const t0 = Date.now();
    let raf: number;
    const tick = () => {
      const p = Math.min((Date.now() - t0) / 4000, 1);
      setBefanaX(-15 + p * 130);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setFlyDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [screen]);

  const saveApi = () => {
    const k = apiInput.trim();
    if (!k) return;
    sessionStorage.setItem("befana_gemini_key", k);
    setApiKey(k);
    setShowApi(false);
    setApiInput("");
  };

  const goHome = () => setScreen("home");

  const getFallback = () => {
    const pool = CHAT_FALLBACKS[lang][age];
    const msg = pool[fbIdx % pool.length];
    setFbIdx(f => f + 1);
    return msg;
  };

  const startMirror = async () => {
    setScreen("mirror");
    setMsgs([]);
    setHistory([]);
    setFbIdx(0);
    setChildMsgCount(0);
    setQuizCorrect(0);
    setQuizTotal(0);
    setLoading(true);

    const sys = age === "young" ? buildSysYoung(lang) : buildSysOlder(lang);
    const opener = lang === "it" ? "Ciao Befana! Sono pronto!" : "Hallo Befana! Ik ben er klaar voor!";
    const prompt = `${sys}\n\nKind zegt: ${opener}`;

    let reply = "";
    try { if (apiKey) reply = await callGemini(apiKey, prompt); } catch { reply = ""; }
    if (!reply) reply = getFallback();

    const h: GTurn[] = [
      { role: "user", parts: [{ text: prompt }] },
      { role: "model", parts: [{ text: reply }] },
    ];
    setHistory(h);
    setMsgs([{ from: "befana", text: reply }]);
    setLoading(false);
  };

  const sendMsg = async () => {
    if (!chatInput.trim() || loading) return;
    const txt = chatInput.trim();
    setChatInput("");
    const newMsgs: Msg[] = [...msgs, { from: "child", text: txt }];
    setMsgs(newMsgs);
    const newCount = childMsgCount + 1;
    setChildMsgCount(newCount);
    setLoading(true);

    // For older: track quiz answers locally as fallback
    if (age === "older") {
      const qIdx = childMsgCount; // which question this is answering
      const correct = checkQuizAnswer(lang, qIdx, txt);
      if (correct) setQuizCorrect(c => c + 1);
      setQuizTotal(t => t + 1);
    }

    let reply = "";
    try { if (apiKey) reply = await callGemini(apiKey, txt, history); } catch { reply = ""; }
    if (!reply) reply = getFallback();

    const newH: GTurn[] = [
      ...history,
      { role: "user", parts: [{ text: txt }] },
      { role: "model", parts: [{ text: reply }] },
    ];
    setHistory(newH);
    setMsgs([...newMsgs, { from: "befana", text: reply }]);
    setLoading(false);
  };

  const revealSock = async () => {
    setSockResult(null);
    setSockLoading(true);
    setScreen("sock");
    const convo = msgs.map(m => `${m.from === "befana" ? "Befana" : "Kind"}: ${m.text}`).join("\n");

    let result: { result: string; message: string } | null = null;
    try {
      if (apiKey) {
        const prompt = age === "young"
          ? buildSockPromptYoung(lang, convo)
          : buildSockPromptOlder(lang, convo);
        const raw = await callGemini(apiKey, prompt, []);
        result = JSON.parse(raw.replace(/```json|```/g, "").trim());
      }
    } catch { result = null; }

    if (!result) {
      // Fallback logic
      if (age === "young") {
        // Always dolci for young — honesty always rewarded
        result = { result: "dolci", message: SOCK_FALLBACK[lang].young };
      } else {
        // Older: check local quiz score
        const majority = quizTotal > 0 && quizCorrect >= Math.ceil(quizTotal / 2);
        result = majority
          ? { result: "dolci", message: SOCK_FALLBACK[lang].older }
          : { result: "carbone", message: SOCK_FALLBACK_COAL[lang] };
      }
    }

    // Safety net: young children ALWAYS get dolci
    if (age === "young") result.result = "dolci";

    setSockResult(result);
    setSockLoading(false);
  };

  const resetMirror = () => {
    setMsgs([]);
    setHistory([]);
    setChildMsgCount(0);
    setQuizCorrect(0);
    setQuizTotal(0);
    setSockResult(null);
    setFbIdx(0);
    setChatInput("");
  };

  // ─── CSS ──────────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    .star{position:fixed;border-radius:50%;background:#fff;animation:tw var(--d) var(--dl) infinite alternate;pointer-events:none}
    @keyframes tw{0%{opacity:.15;transform:scale(1)}100%{opacity:1;transform:scale(1.5)}}
    .flake{position:fixed;top:-20px;animation:sn var(--d) var(--dl) infinite linear;pointer-events:none;opacity:.5;z-index:0}
    @keyframes sn{0%{transform:translateY(-20px) rotate(0)}100%{transform:translateY(105vh) rotate(360deg);opacity:0}}
    .bfly{position:fixed;top:16%;font-size:2.8rem;pointer-events:none;z-index:3;filter:drop-shadow(0 0 12px #ffa040)}
    .card{background:rgba(255,255,255,.055);border:1px solid rgba(200,150,255,.28);border-radius:20px;backdrop-filter:blur(12px);box-shadow:0 0 40px rgba(150,80,255,.18),inset 0 0 28px rgba(255,255,255,.03)}
    .btn{cursor:pointer;border:none;border-radius:50px;font-family:'Lora',serif;transition:all .25s;font-size:1rem;padding:13px 28px}
    .btnP{background:linear-gradient(135deg,#8b2fc9,#4a0080);color:#ffe9ff;box-shadow:0 0 18px rgba(139,47,201,.5)}
    .btnP:hover{transform:scale(1.05);box-shadow:0 0 28px rgba(200,100,255,.7)}
    .btnA{background:linear-gradient(135deg,#c25000,#8b2fc9);color:#fff;font-size:1.15rem;padding:17px 36px}
    .btnA:hover{transform:scale(1.06);box-shadow:0 0 30px rgba(200,80,80,.55)}
    .btnHome{background:rgba(255,255,255,.08);border:1px solid rgba(200,150,255,.25);color:rgba(220,180,255,.8);font-family:'Lora',serif;font-size:.85rem;padding:8px 18px;border-radius:30px;cursor:pointer;transition:all .2s}
    .btnHome:hover{background:rgba(255,255,255,.14);color:#fff}
    .glow{text-shadow:0 0 18px rgba(220,150,255,.85),0 0 38px rgba(150,80,255,.4)}
    .bwitch{background:linear-gradient(135deg,rgba(100,20,150,.82),rgba(60,0,100,.92));border:1px solid rgba(200,150,255,.4);border-radius:18px 18px 18px 4px;padding:12px 15px;max-width:84%;animation:fi .35s ease}
    .bchild{background:linear-gradient(135deg,rgba(0,80,120,.82),rgba(0,40,80,.92));border:1px solid rgba(100,200,255,.3);border-radius:18px 18px 4px 18px;padding:12px 15px;max-width:84%;margin-left:auto;animation:fi .35s ease}
    @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .ifield{background:rgba(255,255,255,.08);border:1px solid rgba(200,150,255,.3);border-radius:25px;color:#fff;font-family:'Lora',serif;font-size:1rem;padding:12px 20px;width:100%;outline:none}
    .ifield:focus{border-color:rgba(200,150,255,.75);box-shadow:0 0 14px rgba(150,80,255,.3)}
    .ifield::placeholder{color:rgba(200,150,255,.38)}
    .dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin:0 3px;transition:all .28s}
    .semoji{font-size:2.8rem;animation:ep .45s ease-out}
    @keyframes ep{0%{transform:scale(0)}70%{transform:scale(1.22)}100%{transform:scale(1)}}
    .sockrev{animation:sd .9s ease-out forwards}
    @keyframes sd{0%{transform:translateY(-40px) rotate(-10deg);opacity:0}100%{transform:translateY(0) rotate(0);opacity:1}}
    .cfall{animation:cf .75s ease-out forwards}
    @keyframes cf{0%{transform:scale(0) rotate(-20deg);opacity:0}70%{transform:scale(1.2) rotate(4deg)}100%{transform:scale(1) rotate(0);opacity:1}}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px)}
    .menuitem{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.06);border:1px solid rgba(200,150,255,.2);border-radius:16px;padding:18px 22px;cursor:pointer;transition:all .25s;font-family:'Lora',serif;font-size:1.05rem;color:#f0e6ff;text-align:left}
    .menuitem:hover{background:rgba(200,150,255,.14);border-color:rgba(200,150,255,.45);transform:translateX(4px)}
    a{color:#c080ff;text-decoration:underline}
  `;

  const bg = "radial-gradient(ellipse at top,#0a0020 0%,#1a0040 40%,#0d001a 100%)";
  const wrap = { minHeight:"100vh", background:bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative" as const, overflow:"hidden" as const, color:"#f0e6ff" };

  const Bg = () => (
    <>
      {STARS.map(s => (
        <div key={s.id} className="star" style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size, "--d":`${s.dur}s`, "--dl":`${s.delay}s` } as React.CSSProperties} />
      ))}
      {FLAKES.map(s => (
        <div key={s.id} className="flake" style={{ left:`${s.x}%`, fontSize:s.size, "--d":`${s.dur}s`, "--dl":`${s.delay}s` } as React.CSSProperties}>❄</div>
      ))}
      <div style={{ position:"fixed", top:16, right:36, fontSize:"3.2rem", opacity:.65, zIndex:0, pointerEvents:"none" }}>🌙</div>
    </>
  );

  const HomeBtn = () => (
    <button className="btnHome" onClick={goHome} style={{ position:"fixed", top:16, left:16, zIndex:50 }}>
      {T.homeBtn}
    </button>
  );

  const ApiOverlay = () => (
    <div className="overlay" onClick={() => setShowApi(false)}>
      <div className="card" style={{ maxWidth:430, width:"100%", padding:30 }} onClick={e => e.stopPropagation()}>
        <p style={{ fontSize:"1rem", color:"rgba(220,190,255,.9)", marginBottom:10 }}>{T.apiLabel}</p>
        <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(200,150,255,.14)", borderRadius:11, padding:"11px 15px", marginBottom:14, fontSize:".82rem", lineHeight:1.75, color:"rgba(200,170,255,.85)" }}>
          {T.apiHelp}{" "}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">aistudio.google.com</a>
          <br />{T.apiStep}
        </div>
        <input className="ifield" type="password" placeholder="AIza..." value={apiInput}
          onChange={e => setApiInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && saveApi()}
          style={{ marginBottom:7 }} />
        <p style={{ fontSize:".73rem", color:"rgba(180,150,255,.45)", marginBottom:14, paddingLeft:8 }}>{T.apiPrivacy}</p>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btnP" onClick={saveApi} style={{ flex:1 }}>{T.apiSave}</button>
          <button className="btn" onClick={() => setShowApi(false)} style={{ background:"rgba(255,255,255,.07)", color:"rgba(200,150,255,.7)", padding:"13px 18px" }}>✕</button>
        </div>
      </div>
    </div>
  );

  // ── LANG ──
  if (screen === "lang") return (
    <div style={wrap}>
      <style>{css}</style><Bg />
      <div style={{ textAlign:"center", maxWidth:460, width:"100%", position:"relative", zIndex:1 }}>
        <div style={{ fontSize:"5.5rem", marginBottom:10, filter:"drop-shadow(0 0 24px rgba(255,180,50,.9))" }}>🧙‍♀️</div>
        <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"2.3rem", marginBottom:6, lineHeight:1.2 }} className="glow">BEFANA</h1>
        <p style={{ fontStyle:"italic", color:"rgba(220,180,255,.7)", marginBottom:34, fontSize:".9rem" }}>
          La Magia dell'Epifania · De Magie van Driekoningen
        </p>
        <div className="card" style={{ padding:34 }}>
          <p style={{ fontSize:"1.05rem", marginBottom:22, color:"rgba(220,190,255,.9)" }}>Kies je taal · Scegli la lingua</p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", marginBottom:26 }}>
            <button className="btn btnA" onClick={() => { setLang("it"); setScreen("age"); }}>🇮🇹 Italiano</button>
            <button className="btn btnA" onClick={() => { setLang("nl"); setScreen("age"); }}>🇳🇱 Nederlands</button>
          </div>
          <p style={{ fontSize:".7rem", color:"rgba(180,140,255,.35)" }}>
            <span style={{ cursor:"pointer", textDecoration:"underline", color:"rgba(180,140,255,.5)" }} onClick={() => setShowApi(true)}>
              Voor ouders / Per i genitori: API-sleutel
            </span>{apiKey ? " ✓" : ""}
          </p>
        </div>
      </div>
      {showApi && <ApiOverlay />}
    </div>
  );

  // ── AGE ──
  if (screen === "age") return (
    <div style={wrap}>
      <style>{css}</style><Bg /><HomeBtn />
      <div style={{ textAlign:"center", maxWidth:440, width:"100%", position:"relative", zIndex:1 }}>
        <div style={{ fontSize:"3.5rem", marginBottom:14 }}>🧹</div>
        <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.55rem", marginBottom:28 }} className="glow">{T.ageTitle}</h2>
        <div className="card" style={{ padding:32 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <button className="btn btnA" onClick={() => { setAge("young"); setScreen("home"); }}>{T.age1}</button>
            <button className="btn btnA" onClick={() => { setAge("older"); setScreen("home"); }}>{T.age2}</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── HOME ──
  if (screen === "home") {
    const menuItems = [
      { key:"story",  label: T.menuStory,  desc: lang==="it" ? "Scopri come è nata la Befana"               : "Ontdek hoe de Befana is ontstaan" },
      { key:"fly",    label: T.menuFly,    desc: lang==="it" ? "Guardala volare nel cielo stellato!"         : "Zie haar vliegen door de sterrenhemel!" },
      { key:"mirror", label: T.menuMirror, desc: lang==="it"
          ? (age==="young" ? "Rispondi con il cuore e vinci i dolci! 💛" : "Rispondi alle domande sulla Befana! 🧠")
          : (age==="young" ? "Antwoord eerlijk en win snoep! 💛"          : "Beantwoord vragen over de Befana! 🧠") },
    ];
    return (
      <div style={wrap}>
        <style>{css}</style><Bg />
        <div style={{ maxWidth:460, width:"100%", position:"relative", zIndex:1 }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:"4rem", marginBottom:8, filter:"drop-shadow(0 0 18px rgba(255,180,50,.8))" }}>🧙‍♀️</div>
            <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.9rem", lineHeight:1.2 }} className="glow">BEFANA</h1>
            <p style={{ fontStyle:"italic", color:"rgba(220,180,255,.65)", fontSize:".85rem", marginTop:4 }}>{T.subtitle}</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
            {menuItems.map(item => (
              <div key={item.key} className="menuitem" onClick={() => {
                if (item.key === "mirror") { resetMirror(); startMirror(); }
                else setScreen(item.key as Screen);
              }}>
                <div>
                  <div style={{ fontWeight:600, marginBottom:2 }}>{item.label}</div>
                  <div style={{ fontSize:".8rem", color:"rgba(200,170,255,.6)" }}>{item.desc}</div>
                </div>
                <div style={{ marginLeft:"auto", color:"rgba(200,150,255,.5)", fontSize:"1.2rem" }}>›</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center" }}>
            <p style={{ fontSize:".7rem", color:"rgba(180,140,255,.35)" }}>
              <span style={{ cursor:"pointer", textDecoration:"underline", color:"rgba(180,140,255,.5)" }} onClick={() => setShowApi(true)}>
                {T.apiLink}
              </span>{apiKey ? " ✓" : ""}
            </p>
          </div>
        </div>
        {showApi && <ApiOverlay />}
      </div>
    );
  }

  // ── STORY ──
  if (screen === "story") {
    const slides = STORIES[lang][age];
    return (
      <div style={wrap}>
        <style>{css}</style><Bg /><HomeBtn />
        <div style={{ textAlign:"center", maxWidth:510, width:"100%", position:"relative", zIndex:1 }}>
          <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.3rem", marginBottom:20 }} className="glow">{T.storyTitle}</h2>
          <div className="card" style={{ padding:34, minHeight:210 }}>
            <div className="semoji" key={storyIdx}>{slides[storyIdx].emoji}</div>
            <p key={`t${storyIdx}`} style={{ fontFamily:"'Lora',serif", fontSize:age==="young" ? "1.18rem" : "1.04rem", lineHeight:1.72, marginTop:18, marginBottom:26, color:"#f0e6ff" }}>
              {slides[storyIdx].text}
            </p>
            <div style={{ marginBottom:22 }}>
              {slides.map((_, i) => (
                <span key={i} className="dot" style={{ background:i===storyIdx ? "#c060ff" : "rgba(200,150,255,.22)", transform:i===storyIdx ? "scale(1.4)" : "scale(1)" }} />
              ))}
            </div>
            {storyIdx < slides.length - 1
              ? <button className="btn btnP" onClick={() => setStoryIdx(i => i + 1)}>{T.nextBtn}</button>
              : <button className="btn btnA" onClick={() => { setStoryIdx(0); goHome(); }}>{T.homeBtn}</button>
            }
          </div>
        </div>
      </div>
    );
  }

  // ── FLY ──
  if (screen === "fly") return (
    <div style={wrap}>
      <style>{css}</style><Bg /><HomeBtn />
      <div className="bfly" style={{ left:`${befanaX}%` }}>🧙‍♀️</div>
      <div style={{ textAlign:"center", maxWidth:500, width:"100%", position:"relative", zIndex:1, marginTop:60 }}>
        <div style={{ fontSize:"3.5rem", marginBottom:16 }}>🌟</div>
        <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.55rem", marginBottom:12 }} className="glow">{T.flyTitle}</h2>
        <p style={{ fontStyle:"italic", color:"rgba(200,170,255,.7)", marginBottom:34, fontSize:".9rem" }}>{T.flySub}</p>
        <div className="card" style={{ padding:26 }}>
          {flyDone ? (
            <>
              <p style={{ fontSize:"1.05rem", marginBottom:20 }}>
                {lang === "it" ? "È arrivata! Vuoi parlarle? 🧹✨" : "Ze is er! Wil je met haar praten? 🧹✨"}
              </p>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                <button className="btn btnP" onClick={() => { resetMirror(); startMirror(); }}>{T.mirrorBtn}</button>
                <button className="btn btnHome" onClick={goHome}>{T.homeBtn}</button>
              </div>
            </>
          ) : (
            <p style={{ color:"rgba(200,150,255,.6)", fontStyle:"italic" }}>{T.flyWait}</p>
          )}
        </div>
      </div>
    </div>
  );

  // ── MIRROR ──
  if (screen === "mirror") return (
    <div style={wrap}>
      <style>{css}</style><Bg /><HomeBtn />
      <div style={{ maxWidth:510, width:"100%", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ width:90, height:110, background:"radial-gradient(ellipse,rgba(100,20,150,.82),rgba(40,0,80,.96))", borderRadius:"50%", margin:"0 auto 10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"3.2rem", boxShadow:"0 0 28px rgba(150,80,255,.5),0 0 55px rgba(80,20,150,.3)", border:"4px solid rgba(200,150,255,.3)" }}>🧙‍♀️</div>
          <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.25rem" }} className="glow">{T.mirrorTitle}</h2>
          <p style={{ fontStyle:"italic", color:"rgba(200,170,255,.55)", fontSize:".82rem" }}>
            {age === "young" ? T.mirrorSubYoung : T.mirrorSubOlder}
          </p>
        </div>
        <div className="card" style={{ padding:18, maxHeight:"40vh", overflowY:"auto", marginBottom:14 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ marginBottom:10 }}>
              {m.from === "befana" ? (
                <div>
                  <div style={{ fontSize:".72rem", color:"rgba(200,150,255,.48)", marginBottom:3 }}>🧙‍♀️ Befana</div>
                  <div className="bwitch"><p style={{ fontFamily:"'Lora',serif", lineHeight:1.6, fontSize:age==="young" ? "1.08rem" : "1rem" }}>{m.text}</p></div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize:".72rem", color:"rgba(100,200,255,.48)", marginBottom:3, textAlign:"right" }}>{lang === "it" ? "Tu 👦" : "Jij 👦"}</div>
                  <div className="bchild"><p style={{ fontFamily:"'Lora',serif", lineHeight:1.6 }}>{m.text}</p></div>
                </div>
              )}
            </div>
          ))}
          {loading && <p style={{ color:"rgba(200,150,255,.6)", fontStyle:"italic", fontSize:".88rem", padding:"6px 0" }}>{T.typing}</p>}
          <div ref={chatEnd} />
        </div>
        <div style={{ display:"flex", gap:9, marginBottom:12 }}>
          <input className="ifield" value={chatInput} placeholder={T.placeholder} disabled={loading}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && sendMsg()} />
          <button className="btn btnP" onClick={sendMsg} disabled={loading} style={{ whiteSpace:"nowrap", padding:"12px 18px" }}>{T.sendBtn}</button>
        </div>
        {childMsgCount >= 3 ? (
          <div style={{ textAlign:"center" }}>
            <button className="btn btnA" onClick={revealSock}>{T.sockBtn}</button>
          </div>
        ) : (
          childMsgCount > 0 && (
            <p style={{ textAlign:"center", fontSize:".78rem", color:"rgba(200,150,255,.45)", fontStyle:"italic" }}>
              {age === "young" ? T.sockHintYoung : T.sockHintOlder}
            </p>
          )
        )}
      </div>
    </div>
  );

  // ── SOCK ──
  if (screen === "sock") return (
    <div style={wrap}>
      <style>{css}</style><Bg /><HomeBtn />
      <div style={{ textAlign:"center", maxWidth:460, width:"100%", position:"relative", zIndex:1 }}>
        <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.35rem", marginBottom:7 }} className="glow">{T.sockTitle}</h2>
        <p style={{ fontStyle:"italic", color:"rgba(200,170,255,.6)", marginBottom:28, fontSize:".88rem" }}>{T.sockSub}</p>
        {sockLoading ? (
          <div className="card" style={{ padding:44 }}>
            <div style={{ fontSize:"3.8rem", marginBottom:14 }}>🧦</div>
            <p style={{ fontStyle:"italic", color:"rgba(200,150,255,.65)" }}>{T.sockWait}</p>
          </div>
        ) : sockResult && (
          <div className="card" style={{ padding:36 }}>
            <div className="sockrev" style={{ fontSize:"4.8rem", marginBottom:14 }}>🧦</div>
            <div className="cfall" style={{ fontSize:sockResult.result==="dolci" ? "2.8rem" : "2.4rem", marginBottom:18 }}>
              {sockResult.result === "dolci" ? "🍬🍭🍫🎁✨" : "⬛🪨😄"}
            </div>
            <div style={{ background:sockResult.result==="dolci" ? "rgba(100,200,100,.1)" : "rgba(120,120,120,.14)", borderRadius:12, padding:18, marginBottom:24, border:`1px solid ${sockResult.result==="dolci" ? "rgba(100,255,100,.2)" : "rgba(160,160,160,.2)"}` }}>
              <p style={{ fontFamily:"'Lora',serif", fontSize:"1.1rem", lineHeight:1.72, fontStyle:"italic" }}>{sockResult.message}</p>
            </div>
            <div style={{ fontSize:"1.9rem", marginBottom:22 }}>
              {sockResult.result === "dolci" ? "🌟🎉🌟" : "😄⬛😄"}
            </div>
            <button className="btn btnP" onClick={() => { resetMirror(); goHome(); }}>{T.homeBtn}</button>
          </div>
        )}
      </div>
    </div>
  );

  return null;
}
