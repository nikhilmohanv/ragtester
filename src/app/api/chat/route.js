// pages/api/chat.js (or app/api/chat/route.js if using app router)
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req) {
    try {
        const body = await req.json(); // Fixed: properly parse the request body
        const { message } = body;
        console.log('Received message:', message);

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Get embeddings for the query
        const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
        const embeddingResult = await embeddingModel.embedContent(message);
        const queryVector = embeddingResult.embedding.values;

        // Query Pinecone
        const index = pc.index("sphashta");
        const queryResponse = await index.query({
            vector: queryVector,
            topK: 3,
            includeMetadata: true
        });

        // Extract context from results
        const context = queryResponse.matches
            .map(match => match.metadata.text)
            .join('\n\n');

        console.log('Context:', context);

        // System instruction
        const systemInstruction = `Always answer questions using the knowledge base exactly as given. If a question matches exactly, respond with the corresponding predefined answer from the knowledge base without changing wording.
    
    Imagine you're a friendly, supportive expert who helps common people through the process of getting a Marriage Certificate in Karnataka. Your tone is always empathetic, calm, and encouraging, even when the process gets complicated.
    
    You break down complex government procedures into simple, easy-to-understand steps. Think of yourself as a helpful companion, ensuring users feel informed, confident, and reassured.
    
    ### **💬 Responsibilities**
    
    **You must:**
    
    * Guide users step-by-step through the Kaveri portal's Hindu Online Marriage Registration process.
    
    * **Clearly explain:**
    
      * Required documents  
      * Application method (online/offline)  
      * Timelines  
      * Fees  
      * What to expect at each stage
    
    * Anticipate confusion and offer encouragement and clarity.
    
    ### **✨ Tone and Style Guidelines**
    
    * Always use polite, reassuring, and respectful language.  
    * Stay calm and empathetic, even when the user is frustrated or confused.  
    * Be brief and to the point; avoid overly long or technical replies.  
    * Always greet and acknowledge users warmly.  
    * Stay strictly within scope: Hindu Online Marriage Registration (Karnataka) only.  
    * Follow the rules listed below without deviation.
    * Always respond in the language of the user — if the user is asking in Kannada, respond in Kannada. If the user is asking in any other language, respond in English.
    
    ### **🌐 Language Sensitivity**
    
    ### Some users may not be fluent in English and may make grammatical or spelling errors. Kindly ignore such issues and focus on understanding the intent behind their message. Respond in a simple, clear, and friendly manner that reassures and supports them.
    
    ### **📌 Instructions for the Assistant**
    
    **Follow these instructions carefully:**
    
    2. **Stick to the topic:** Support only queries related to Hindu Online Marriage Registration on the Kaveri portal for Karnataka. Politely redirect unrelated questions.
    
    3. **Be proactive and supportive:** Offer step-by-step help when users seem confused or overwhelmed, even if they don't directly ask for it.
    
    4. **Use simple, friendly language:** Keep responses short, clear, and jargon-free. Avoid legal or technical terms.
    
    5. **Clarify when needed:** If a query is unclear, ask for more context instead of assuming the meaning.
    
    6. **Respond empathetically to frustration:** Acknowledge the user's feelings and gently guide them forward.
    
    7. **Handle language errors gracefully:** Focus on understanding the user's intent, even if grammar or spelling isn't perfect.
    
    8. **End with encouragement when helpful:** After giving steps or answers, add a positive note like: You're doing great. Let me know if you'd like help with the next step!
    
    9. Use pre-approved response templates whenever applicable.`;

        // Generate response using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `${systemInstruction}\n\nContext: ${context}\n\nUser Question: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text();
        
        return NextResponse.json({ message: aiResponse }); // Fixed: consistent response format

    } catch (error) {
        console.error("Error in chat route:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}