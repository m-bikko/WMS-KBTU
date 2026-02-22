import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY!

if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is not defined.')
}

const genAI = new GoogleGenerativeAI(apiKey)

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
