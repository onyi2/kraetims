import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Maximize payload size to parse image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize Gemini server-side using name parameter config block
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Endpoint: Parse lists & prices from itemized sheet images
  app.post("/api/parse-items-image", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Missing image attachment." });
      }

      // Convert data URI format to base64 payload
      let base64Data = image;
      let mimeType = "image/png";

      if (image.includes(";base64,")) {
        const parts = image.split(";base64,");
        base64Data = parts[1];
        mimeType = parts[0].split(":")[1] || "image/png";
      }

      const promptString = `Extract all individual items, quantities, and their unit prices from this image.
The image represents a list or sheet of school uniforms, books, fees, or items that parents have to buy with prices.
Format into structured JSON.
If there's an equation or multiplication line like "700/= (x2) = 1,400", parse:
- description: "Dress"
- unitPrice: 700
- quantity: 2
Make sure fields are exact number values, not string symbols or currencies.
Categorize each item correctly based on its description into one of these strict categories: 'School Fees', 'Uniforms', 'Books', 'Transport', 'Boarding', 'Activity Fee', 'Examination', or 'Miscellaneous'.
Extensively scan the list and do not miss any item listed in the image.`;

      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      };

      const textPart = {
        text: promptString,
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [imagePart, textPart],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    description: { type: Type.STRING, description: "Normalized description of the item" },
                    unitPrice: { type: Type.NUMBER, description: "Single unit price" },
                    quantity: { type: Type.NUMBER, description: "Quantity of item" },
                    category: { 
                      type: Type.STRING, 
                      description: "Must be: 'School Fees', 'Uniforms', 'Books', 'Transport', 'Boarding', 'Activity Fee', 'Examination', 'Miscellaneous'" 
                    }
                  },
                  required: ["description", "unitPrice", "quantity", "category"]
                }
              }
            },
            required: ["items"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response or empty content received from Gemini.");
      }

      const parsed = JSON.parse(text.trim());
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini Scan Error:", err);
      res.status(500).json({ error: err.message || "Failed to process image using Gemini." });
    }
  });

  // Vite development vs production serving config
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
    console.log(`Server launched on port ${PORT}`);
  });
}

startServer();
