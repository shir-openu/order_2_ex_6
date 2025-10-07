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

const prompt = `עוזר מתמטי למשוואות דיפרנציאליות.

השאלה: ${problemData.question}
הפתרון הנכון: ${problemData.correctSolution}

${conversationText}

תשובת הסטודנט: ${userInput}

הנחיות:
- זהה מה חסר או שגוי בתשובה
- תן רמז קצר וממוקד (1-2 משפטים)
- אל תפתור במקום הסטודנט
- השתמש ב-LaTeX: \\(...\\)
- היה נעים וחיובי אך ענייני ומדויק
- אל תפריז בשבחים - רק עודד בקצרה אם הכיוון נכון
- חשוב: השתמש בלשון רבים או גוף שלישי, לא בלשון זכר (למשל: "ניתן לשקול" או "כדאי לבדוק" במקום "שקול")`;
    
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
