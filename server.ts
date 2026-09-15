import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Gemini SDK lazily to prevent crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export const app = express();

// 1. Hide Server Fingerprint (Obscure framework stack from potential malicious scanners)
app.disable("x-powered-by");

// 2. Body parser with size limits to support base64 screenshot uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// 3. Mathematical Prototype Pollution & Exploit Guard
app.use((req, res, next) => {
  const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== "object") return obj;
    
    // Stop prototype pollution attacks cold
    if ("__proto__" in obj) delete obj["__proto__"];
    if ("constructor" in obj) delete obj["constructor"];
    if ("prototype" in obj) delete obj["prototype"];

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === "string") {
          // High-security XSS filter (Strip malicious script/HTML tags, preventing injection exploits)
          obj[key] = obj[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/on\w+="[^"]*"/gi, "")
            .replace(/on\w+='[^']*'/gi, "")
            .replace(/javascript:[^\s"']*/gi, "");
        } else if (typeof obj[key] === "object") {
          obj[key] = sanitizeObject(obj[key]);
        }
      }
    }
    return obj;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  next();
});

// 4. Military-Grade Security Headers (MIME-type Sniffing Guard and Referrer Shield)
app.use((req, res, next) => {
  // MIME-Type Sniffing Protection
  res.setHeader("X-Content-Type-Options", "nosniff");
  
  // Referrer Privacy Shield
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Legacy XSS Protection Header
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Hardware Isolation Permissions (Block unauthorized camera, location, and microphone API abuse)
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), midi=(), payment=()"
  );
  
  next();
});

// API Route: Check Gemini availability
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ status: "ok", geminiConfigured: hasKey });
});

// Dedicated SEO Search Engine Directives
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.sendFile(path.join(process.cwd(), "public", "robots.txt"));
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  res.sendFile(path.join(process.cwd(), "public", "sitemap.xml"));
});

// API Route: Request critique from BrutalAI
app.post("/api/critique", async (req, res): Promise<any> => {
  try {
    const { victimType, content, brutality, image } = req.body;

    if (!victimType || (!content && !image)) {
      return res.status(400).json({ error: "Victim type and content or image are required" });
    }

    const ai = getGeminiClient();

    // Customize system instructions based on brutality and type to give highly contextual, rich evaluations
    let brutalityDescription = "";
    if (brutality === "sarcastic") {
      brutalityDescription = "Deliver razor-sharp sarcasm, witty cultural criticism, intellectual snark, and playful teasing. Think elite critic at a high-brow magazine.";
    } else if (brutality === "doctor") {
      brutalityDescription = "Adopt the persona of a brilliant master strategist and tough-love Brand Doctor. Provide critical diagnostics followed by highly actionable, multi-million-dollar structural remedies.";
    } else {
      brutalityDescription = "Absolute roast. Maximum intellectual shredding, extremely funny, delightfully sarcastic, withering but tasteful critiques. Do not hold back, but remain safe, ethical, and non-discriminatory.";
    }

    const systemInstruction = `You are BrutalAI, an elite, hyper-witty cultural critic, master strategist, and brand doctor.
Your job is to analyze the user's provided input (which might include text, code, or an uploaded screenshot/image) and deliver an ultra-engaging, highly shareable evaluation.

Tone & Style Guidelines:
- Razor-sharp, humorous, and delightfully sarcastic, but NEVER genuinely hateful, toxic, or discriminatory. Avoid slurs, personal insults, or harassment.
- You have an unmatched, sharp intellect, an impeccable grasp of modern design, copy, tech, and strategic concepts, and zero tolerance for generic AI slop, corporate buzzwords, bloated code, or standard developer over-engineering.
- Your evaluation MUST follow a strict structure consisting of two parts:
  1. THE ROAST: A witty, funny, deeply perceptive teardown of what they sent. Include cultural analogies, sharp comparisons, and technical/strategic snark.
  2. THE REMEDY: An incredibly smart, practical, and highly strategic set of concrete, actionable recommendations on how to level up, rewrite, redesign, or pivot.
- You must tailor your roast specifically to the context type:
  - "brand": Teardown startup pitches, marketing pages, design landing pages, business ideas, or names. Focus on value propositions, marketing fluff, and feasibility.
  - "code": Roast technical implementation, variable names, architectures, patterns, and complex over-engineering. Point out code smell.
  - "resume": Critique corporate speak, resume padding, empty buzzwords, and redundant bullet points.
  - "profile": Teardown social or dating bios, self-descriptions, and cliché presentation.
  - "custom": Custom text or ideas.

Brutality Instruction:
${brutalityDescription}

Return a structured JSON output conforming EXACTLY to the following schema:
- verdict: A hilarious 2-5 word rating/summary (e.g. "Buzzword Bingo Champion", "Over-engineered Spaghett", "Derivative Vaporware", "Delusional but Charming").
- killerQuote: A single, ultra-shareable, punchy, laugh-out-loud quote encapsulating your feedback. Ideal for social media sharing.
- roastPoints: An array of 3 objects containing:
    - title: A snappy, witty, metaphorical heading for the critique point (e.g., "The Infinite Scroll of Despair", "The 'Let's Add AI' Hail Mary").
    - description: A detailed, witty, sarcastic explanation of the issue.
- remedyPoints: An array of 3 objects containing:
    - title: A direct, strategic remedy action.
    - description: A highly valuable, clever, and practical strategic advice on how to fix this issue or pivot.
- strategicScore: An integer between 0 and 100 representing how strategic, mature, or well-executed their current submission is. (Lower scores are funnier, but make it realistic!).`;

    const promptParts: any[] = [];

    // Add uploaded screenshot/image if present
    if (image && image.data && image.mimeType) {
      promptParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data.split(",")[1] || image.data, // Clean base64 header if present
        },
      });
    }

    // Contextual prompt message
    let promptText = `Please evaluate the following "${victimType}" submission with brutality level "${brutality}":\n\n`;
    if (content) {
      promptText += `=== SUBMISSION CONTENT ===\n${content}\n==========================\n\n`;
    }
    if (image) {
      promptText += `[Image/Screenshot attached above]`;
    }
    promptText += `\nProvide your analysis according to the schema instructions. Ensure your strategic remedy is genuinely top-tier advice.`;

    promptParts.push({ text: promptText });

    // Robust fallback array to handle temporary outages or high demand (503s) on primary models
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const modelsToTry = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let response = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      let attempts = 3;
      let baseDelay = 1000; // 1 second base delay
      
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          console.log(`Attempting content generation using model: ${modelName} (Attempt ${attempt}/${attempts})`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: promptParts,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  verdict: {
                    type: Type.STRING,
                    description: "A hilarious 2-5 word verdict rating.",
                  },
                  killerQuote: {
                    type: Type.STRING,
                    description: "A single highly punchy and shareable line.",
                  },
                  roastPoints: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ["title", "description"],
                    },
                  },
                  remedyPoints: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ["title", "description"],
                    },
                  },
                  strategicScore: {
                    type: Type.INTEGER,
                    description: "A score from 0 to 100.",
                  },
                },
                required: ["verdict", "killerQuote", "roastPoints", "remedyPoints", "strategicScore"],
              },
            },
          });
          
          if (response) {
            console.log(`Successfully generated critique using model: ${modelName}`);
            break;
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = err.message || JSON.stringify(err);
          console.warn(`Attempt ${attempt} for model ${modelName} failed:`, errMsg);
          
          // Check if error is transient (503, 429, UNAVAILABLE, overload)
          const isTransient = errMsg.includes("503") || 
                              errMsg.includes("429") || 
                              errMsg.includes("UNAVAILABLE") || 
                              errMsg.includes("limit") || 
                              errMsg.includes("demand") || 
                              errMsg.includes("overloaded");
          
          if (isTransient) {
            // If model is overloaded or unavailable, switch to the next alternative model immediately to minimize user wait time
            const isOverloadedOrDemand = errMsg.includes("503") || 
                                         errMsg.includes("demand") || 
                                         errMsg.includes("overloaded") || 
                                         errMsg.includes("UNAVAILABLE");
            if (isOverloadedOrDemand) {
              console.log(`Model ${modelName} is experiencing high demand/overload. Switching to alternative model immediately...`);
              break; // exit attempts loop for this model and move to the next model in modelsToTry
            }

            if (attempt < attempts) {
              const waitTime = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 300;
              console.log(`Transient rate limit error detected. Retrying ${modelName} in ${Math.round(waitTime)}ms...`);
              await delay(waitTime);
            } else {
              break;
            }
          } else {
            break; // exit attempts loop for this model
          }
        }
      }
      
      if (response) {
        break; // Exit modelsToTry loop
      }
    }

    if (!response) {
      throw lastError || new Error("All configured Gemini models are currently overloaded. Please try again in a few seconds.");
    }

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini API");
    }

    const result = JSON.parse(responseText);
    res.json(result);
  } catch (error: any) {
    console.error("Critique Generation Error:", error);
    res.status(500).json({
      error: error.message || "BrutalAI's circuits fried trying to analyze this level of cringe.",
    });
  }
});

// Local Development & Docker Startup (Ignored by Netlify Functions)
if (process.env.NODE_ENV !== "test" && process.env.NETLIFY !== "true") {
  async function startServer() {
    const PORT = 3000;
    
    // Vite Integration for Hot Reload / Production Static Files
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`BrutalAI Server running on http://localhost:${PORT}`);
    });
  }
  
  startServer().catch(console.error);
}
