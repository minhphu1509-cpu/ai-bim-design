import { GoogleGenAI, Type } from "@google/genai";
import { Project } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const getGeminiAI = () => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export async function analyzeDesign(projectInfo: any, moduleName: string, checklist: string[], filesInfo: any[] = [], analysisFiles: { data: string, mimeType: string }[] = [], customPrompt?: string) {
  const ai = getGeminiAI();
  
  const prompt = `
    You are a Senior BIM Expert and Design Auditor specializing in Vietnamese construction regulations (QCVN, TCVN).
    Analyze the following project for the module: ${moduleName}.
    
    Project Context:
    ${JSON.stringify(projectInfo, null, 2)}
    
    Uploaded Documents/Drawings for Analysis:
    ${JSON.stringify(filesInfo.map(f => ({ name: f.name, category: f.category, format: f.format })), null, 2)}
    
    Checklist items to evaluate based on the documents above:
    ${checklist.join(", ")}

    ${customPrompt ? `Additional User Instructions/Focus:\n${customPrompt}` : ''}
    
    For each item in the checklist (and considering the user's additional instructions), provide:
    1. Status: 'OK' (compliant) or 'NO' (non-compliant/issue found).
    2. Issue Description: If 'NO', explain the specific technical violation or design flaw using professional terminology.
    3. Suggested Fix: Provide a professional engineering solution to resolve the issue based on QCVN/TCVN.
    Return the results as a JSON array of objects with keys: check_item, status, issue_description, suggested_fix.
    Be extremely critical, technical, and precise.
  `;

  const parts: any[] = [{ text: prompt }];
  
  // Add analysis files if available
  analysisFiles.forEach(file => {
    parts.push({
      inlineData: {
        data: file.data,
        mimeType: file.mimeType
      }
    });
  });

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            check_item: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["OK", "NO"] },
            issue_description: { type: Type.STRING },
            suggested_fix: { type: Type.STRING }
          },
          required: ["check_item", "status", "issue_description", "suggested_fix"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
}

export async function generateArchitecturalImage(prompt: string) {
  const ai = getGeminiAI();
  
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: `Architectural visualization, high-end design, realistic BIM render: ${prompt}`,
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const base64 = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64}`;
  }
  throw new Error("Failed to generate image");
}

export async function chatWithBIMEngineer(history: { role: 'user' | 'model', text: string }[], message: string, context?: any) {
  const ai = getGeminiAI();
  
  const systemInstruction = `You are "AI BIM Engineer", a professional assistant developed by DMP AI Dev. 
    You help architects and engineers manage and check construction design documents.
    You are expert in QCVN, TCVN, and BIM workflows (IFC, Revit, CAD).
    Always be professional, precise, and helpful. Answer in Vietnamese by default unless asked otherwise.
    ${context ? `\n\nCurrent Project Context:\n${JSON.stringify(context, null, 2)}` : ''}`;

  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction
    },
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}

export async function performQTO(project: Project, filesInfo: any[], analysisFiles: { data: string, mimeType: string }[]) {
  const ai = getGeminiAI();
  
  const prompt = `
    You are a professional Quantity Surveyor. 
    Perform a Quantity Take-Off (QTO) for the project: ${project.name} (${project.type}).
    Analyze the provided design files (IFC/DWG/PDF) and extract quantities for:
    1. Concrete (m3)
    2. Steel (kg or tons)
    3. Finishes (m2)
    4. Masonry (m2 or m3)
    
    Return the results as a JSON array of objects with the following structure:
    {
      "item_name": "string",
      "description": "string",
      "unit": "string",
      "quantity": number,
      "category": "string"
    }
    
    Be as accurate as possible based on the file contents. If specific quantities are not clear, provide reasonable estimates based on project type and size.
  `;

  const parts: any[] = [{ text: prompt }];
  
  analysisFiles.forEach(file => {
    parts.push({
      inlineData: {
        data: file.data,
        mimeType: file.mimeType
      }
    });
  });

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            item_name: { type: Type.STRING },
            description: { type: Type.STRING },
            unit: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            category: { type: Type.STRING }
          },
          required: ["item_name", "description", "unit", "quantity", "category"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
}

export async function analyzeProgress(project: Project, photoData: string, mimeType: string) {
  const ai = getGeminiAI();
  
  const prompt = `
    You are a Senior Construction Manager and Progress Auditor.
    Analyze the provided site photo (or drone feed frame) and compare it with the project design and schedule.
    
    Project Context:
    Name: ${project.name}
    Type: ${project.type}
    Current Status: ${project.status}
    
    Tasks to perform:
    1. Estimate the overall completion percentage of the visible construction.
    2. Identify any deviations from the standard design or safety issues.
    3. Provide a technical summary of the current state.
    
    Return the results as a JSON object with keys:
    - completion_percentage: number (0-100)
    - deviations: array of objects { item: string, description: string, severity: 'Low' | 'Medium' | 'High' }
    - analysis_summary: string
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: photoData,
              mimeType: mimeType
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          completion_percentage: { type: Type.NUMBER },
          deviations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                description: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
              },
              required: ["item", "description", "severity"]
            }
          },
          analysis_summary: { type: Type.STRING }
        },
        required: ["completion_percentage", "deviations", "analysis_summary"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeBIMContent(project: Project, ifcData: string, mimeType: string) {
  const ai = getGeminiAI();
  
  const prompt = `
    You are a BIM Specialist and Data Analyst.
    Analyze the provided IFC file content and extract key BIM components.
    Categorize them into: Structural, MEP, and Architectural.
    
    For each component, provide:
    - category: 'Structural' | 'MEP' | 'Architectural'
    - type: string (e.g., 'IfcColumn', 'IfcPipeSegment', 'IfcWall')
    - name: string
    - properties: object (key-value pairs of important attributes like dimensions, material, etc.)
    
    Return the results as a JSON array of objects.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: ifcData,
              mimeType: mimeType
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ['Structural', 'MEP', 'Architectural'] },
            type: { type: Type.STRING },
            name: { type: Type.STRING },
            properties: { type: Type.OBJECT }
          },
          required: ["category", "type", "name", "properties"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
}
