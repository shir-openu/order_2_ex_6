// api/ai-hint.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://shir-openu.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput, problemData, conversationHistory } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // בניית ההיסטוריה
    let conversationText = '';
    conversationHistory.forEach(turn => {
      conversationText += `תשובת סטודנט: ${turn.user}\nתגובת מורה: ${turn.ai}\n\n`;
    });

    const prompt = `מורה סבלני למשוואות דיפרנציאליות.

השאלה: ${problemData.question}

הפתרון הנכון המלא: ${problemData.correctSolution}

שלבי הפתרון:
${problemData.steps}

${conversationText}

תשובת הסטודנט הנוכחית: ${userInput}

תפקיד:
1. ניתוח התשובה שהסטודנט נתן וזיהוי היכן הטעות או המקום שבו נתקע
2. מתן רמז מכוון שעוזר להתקדם - לא לפתור בשבילו!
3. שימוש בשאלות הנחייה: "האם בדקתם...?", "מה קורה כאשר...?", "שימו לב ל..."
4. עידוד ושמירה על מוטיבציה
5. שימוש ב-LaTeX לנוסחאות מתמטיות (עטיפה ב-\\(...\\) לנוסחאות בשורה)

חשוב:
- התחלה מרמזים כלליים והתקדמות לספציפיים רק אם הסטודנט תקוע
- אין לתת את הפתרון המלא אלא אם הסטודנט מבקש במפורש "תנו לי את הפתרון"
- אם התשובה קרובה מאוד, יש לציין זאת ולעזור בדיוק הטעות הקטנה
- שימוש בעברית תקנית ומקצועית`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const hint = response.text();

    return res.status(200).json({ hint });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'שגיאה בעיבוד הבקשה'
    });
  }
}
