import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for lazy loading Gemini SDK safely
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured in environment variables or AI Studio Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Health & Diagnostic API
app.get("/api/health", (req, res) => {
  const apiKeyPresent = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: apiKeyPresent,
    stadiumContextLoaded: true
  });
});

// Mock knowledge base for grounding stadium operations and fan assistance
const STADIUM_KNOWLEDGE_BASE = `
FIFA World Cup 2026 Stadium Standards & Operations Manual:
1. Transportation & Parking:
   - High occupancy shuttle routes run continuously from transit hubs (Metro station, Central parking) starting 4 hours pre-match to 3 hours post-match.
   - Rideshare drop-off/pick-up is restricted to Zone Blue (East Gate) and Zone Yellow (West Gate).
   - Park & Ride operates at Lot K with buses departing every 5 minutes.
   - Rail transit lines are optimized to run at maximum capacity (headway 3 mins) on match days.

2. Crowd Management & Safety:
   - Gate A & B are primary general public entry gates. Gate C is reserved for VIP, Media, and Accessibility seating.
   - Peak gate congestion typically occurs between T-90 minutes and T-30 minutes. Rerouting streams from Gate A to Gate B is recommended if flow exceeds 150 fans/minute.
   - Concession wait times above 15 minutes trigger dynamic board updates directing fans to under-utilized concession stalls in adjacent sectors.
   - In case of a major emergency, stadium evacuation follows the "Green Route" system directing fans to nearest open fields.

3. Accessibility:
   - Wheelchair accessible elevators are located at Sections 104, 118, 202, and 224.
   - Ramps are fully functional at Gates A and C. Tactile paths are available from the central transit station to Gate C.
   - Assistive listening devices (ALDs) and sensory rooms are available on Concourses Level 1 (near Section 110) and Level 3 (near Section 308).
   - Direct volunteer escort services can be requested at any information booth.

4. Sustainability:
   - Food waste and compost bins are color-coded Green. Recycle bins are Blue. Landfill bins are Black.
   - Reusable World Cup cups can be returned at any concession stand for a $2 deposit refund or donated to local youth football programs.
   - Water refilling stations are freely available near all major restrooms.
`;

// 2. Multilingual Fan & Staff Interactive Assistant
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, role, language } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      // Graceful fallback for demo purposes when key is not set
      console.warn("Gemini Client initialization failed:", err.message);
      res.json({
        text: `[DEMO MODE: API Key Missing] Thank you for your question: "${message}". To unlock the full power of real-time Generative AI, please add your GEMINI_API_KEY in the AI Studio Secrets panel. \n\n*Simulated Response based on role '${role}':*\nI'm ready to assist with World Cup 2026 operations! How can I help you today with stadium logistics, transit guides, or accessibility questions?`,
        demoMode: true
      });
      return;
    }

    // Compose system instruction based on role and language
    const systemInstruction = `
      You are the official FIFA World Cup 2026 AI Stadium Intelligence Assistant.
      You support two roles:
      1. 'fan': A friendly, welcoming, highly helpful tournament guide. You assist with stadium routes, food vendors, wheelchair accessibility, parking guides, transport options, and match day activities. Use an inviting tone.
      2. 'staff': A highly precise, professional, and rapid Stadium Operations dispatcher. You provide actionable instructions, emergency protocols, volunteer coordination strategies, and crowd-control procedures based on safety regulations. Use a clear, commanding, and practical tone.

      STADIUM CONTEXT & FACTS:
      ${STADIUM_KNOWLEDGE_BASE}

      CRITICAL DIRECTIONS:
      - You must converse fluently in the requested language: ${language || 'English'}.
      - Answer based strictly on the provided stadium context first. If the information isn't available, give a logical, helpful, and safe recommendation that prioritizes crowd safety, fan experience, and World Cup guidelines.
      - Never hallucinate non-existent emergency routes.
      - Keep responses concise, formatted with clear markdown lists or bold key sections for quick readability on screens.
    `;

    // Format chat history according to @google/genai SDK format (which uses roles: 'user' and 'model')
    const contents = history ? history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })) : [];

    // Append the new message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.3,
        topP: 0.9,
      }
    });

    res.json({
      text: response.text || "No response generated.",
      demoMode: false
    });

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "An error occurred during content generation." });
  }
});

// 3. Operational Incident Resolver & Action Plan Generator
app.post("/api/incident-resolve", async (req, res) => {
  try {
    const { title, location, severity, category, description, language } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: "Incident title and description are required." });
      return;
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      console.warn("Gemini Client initialization failed:", err.message);
      // Beautiful robust simulated response when key is missing to satisfy testing and preview
      res.json({
        responsePlan: `### 🚨 Immediate Response Plan (DEMO MODE)
1. **Initial Assessment**: Dispatch a rapid response team to **${location || 'reported site'}** to verify the severity.
2. **Staff Assignment**: Reallocate Zone Volunteers to manage perimeter flow.
3. **Crowd Direction**: Direct fans away from the affected area to adjacent corridors.
4. **Safety Check**: Verify wheelchair pathways remain clear.

*Configure GEMINI_API_KEY in the Secrets panel to enable real-time dynamic AI planning.*`,
        announcementScript: `📢 Attention Fans at ${location || 'the stadium'}: Please follow the instructions of our stewards. Assist those around you. Thank you for your cooperation.`,
        affectedSections: ["Section 101", "Section 102"],
        demoMode: true
      });
      return;
    }

    const prompt = `
      Analyze the following stadium incident reported during a FIFA World Cup 2026 match:
      - Title: ${title}
      - Location: ${location}
      - Severity: ${severity}
      - Category: ${category}
      - Description: ${description}

      Create a comprehensive, practical, and rapid operational action plan.
      Respond in JSON format with the following keys:
      1. "responsePlan": (String) A markdown formatted step-by-step immediate response protocol for stadium staff and volunteers. Include specific instructions on staff allocation, crowd diversion, and accessibility accommodations.
      2. "announcementScript": (String) A formal, calming PA announcement script in ${language || 'English'} to be read to spectators to maintain order.
      3. "affectedSections": (Array of Strings) An array of stadium sections or zones that should be alerted or rerouted.

      STADIUM MANUAL GUIDELINES:
      ${STADIUM_KNOWLEDGE_BASE}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    try {
      const resultJson = JSON.parse(response.text?.trim() || "{}");
      res.json({
        responsePlan: resultJson.responsePlan || "No plan generated.",
        announcementScript: resultJson.announcementScript || "No script generated.",
        affectedSections: resultJson.affectedSections || [],
        demoMode: false
      });
    } catch (jsonErr) {
      // Fallback if parsing fails
      res.json({
        responsePlan: response.text || "No structured plan generated.",
        announcementScript: "📢 Please stay calm and follow steward directions.",
        affectedSections: ["Adjacent Sections"],
        demoMode: false
      });
    }

  } catch (error: any) {
    console.error("Error in /api/incident-resolve:", error);
    res.status(500).json({ error: error.message || "An error occurred during incident resolution." });
  }
});

// Serve frontend static assets and setup Vite development server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`World Cup Arena Operations Server running on http://localhost:${PORT}`);
  });
}

startServer();
