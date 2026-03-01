import { WordData } from "../types";

// Local Word Database containing words, hints, categories, and difficulty levels
const WORD_DATABASE: WordData[] = [
  // Easy Words
{ word: "ORO", hint: "Human intelligence protocol powering AI with private data", category: "Web3", difficulty: "Easy" },
{ word: "AI", hint: "Technology that learns from data to make decisions", category: "Technology", difficulty: "Easy" },
{ word: "DATA", hint: "Raw information used to train AI models", category: "Technology", difficulty: "Easy" },
{ word: "TOKEN", hint: "Digital asset used for rewards and incentives", category: "Blockchain", difficulty: "Easy" },
{ word: "VAULT", hint: "Secure place where your private data stays protected", category: "Privacy", difficulty: "Easy" },
{ word: "QUEST", hint: "Fun challenge inside the ORO app to earn rewards", category: "App Feature", difficulty: "Easy" },
{ word: "REWARD", hint: "What you earn when your data contributes to AI", category: "Incentives", difficulty: "Easy" },
{ word: "MODEL", hint: "AI system trained using data", category: "AI", difficulty: "Easy" },

  // Medium Words
 { word: "PROTOCOL", hint: "Core blockchain system that powers ORO", category: "Blockchain", difficulty: "Medium" },
{ word: "LEDGER", hint: "Public record that tracks contributions and rewards", category: "Blockchain", difficulty: "Medium" },
{ word: "PRIVACY", hint: "Protection that keeps your raw data hidden", category: "Security", difficulty: "Medium" },
{ word: "ENCRYPTION", hint: "Technology used to secure private information", category: "Security", difficulty: "Medium" },
{ word: "CONTRIBUTION", hint: "When your data helps improve AI models", category: "AI Economy", difficulty: "Medium" },
{ word: "TRAINING", hint: "Process of teaching AI using data", category: "AI", difficulty: "Medium" },
{ word: "DECENTRALIZED", hint: "Not controlled by a single company or authority", category: "Web3", difficulty: "Medium" },
{ word: "INTELLIGENCE", hint: "The valuable output created from human data", category: "AI", difficulty: "Medium" },
  
// Hard Words
  { word: "CRYPTOGRAPHY", hint: "Advanced math used to protect private data", category: "Security", difficulty: "Hard" },
{ word: "ZKTLS", hint: "Privacy technology that allows secure data verification", category: "Privacy Tech", difficulty: "Hard" },
{ word: "COMPUTATION", hint: "Process of processing data securely for AI learning", category: "AI", difficulty: "Hard" },
{ word: "MODELWEIGHTS", hint: "Updated parameters that improve AI performance", category: "AI", difficulty: "Hard" },
{ word: "NETNEWDATA", hint: "Fresh data newly created by users for AI training", category: "AI Economy", difficulty: "Hard" },
{ word: "SECUREVAULT", hint: "Environment where data stays private while AI learns", category: "Privacy Tech", difficulty: "Hard" },
{ word: "FRONTIERAI", hint: "Cutting-edge artificial intelligence systems", category: "AI", difficulty: "Hard" },
{ word: "INCENTIVES", hint: "Mechanism that ensures contributors are fairly rewarded", category: "AI Economy", difficulty: "Hard" },
];

export const generateWord = async (difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'): Promise<WordData> => {
  // Simulate a brief "thinking" time for UI smoothness, though much faster than API
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const candidates = WORD_DATABASE.filter(w => w.difficulty === difficulty);
  
  // Fallback to all words if difficulty specific ones run out (shouldn't happen with full list)
  const pool = candidates.length > 0 ? candidates : WORD_DATABASE;
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  // Return a copy to avoid mutating the database accidentally if we were to modify it
  return { ...pool[randomIndex] };
};