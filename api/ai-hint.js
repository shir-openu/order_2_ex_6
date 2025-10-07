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

const prompt = `עוזר מתמטי קצר וענייני.

השאלה: ${problemData.question}
הפתרון הנכון: ${problemData.correctSolution}
תשובת הסטודנט: ${userInput}

${conversationText}

חובה:
1. תשובה של 1-2 משפטים בלבד - לא יותר!
2. זהה מה חסר בתשובה
3. תן רמז ישיר וקצר
4. אל תפתור במקום הסטודנט
5. LaTeX: \\(...\\)
6. לשון נייטרלית בלבד: "ניתן לבדוק", "כדאי לשקול", "חסר החלק של..." - לעולם לא "נסה", "בדוק", "שקול"

דוגמה טובה: "חסר החלק הפרטי של המשוואה. ניתן להשתמש בשיטת וריאציית הפרמטרים."
דוגמה רעה: "נסה לבדוק... כדאי שתשתמש... אתה צריך..."`;
    
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
