import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini (using the same API key as your chat endpoint)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Use flash model for multimodal speed and cost-efficiency
const multimodalModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Buffer the file correctly for Gemini
        const buffer = await file.arrayBuffer()
        const base64Data = Buffer.from(buffer).toString('base64')

        // Create the image part object
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: file.type // e.g., 'image/jpeg', 'image/png', 'application/pdf'
            },
        }

        // Define the prompt instructing Gemini on what to extract
        const prompt = `
            You an expert data entry clerk. Analyze this document (it is likely a packing slip, invoice, or waybill).
            Extract the line items purchased or shipped. Ignore subtotals, taxes, and irrelevant text.

            Your task is to return ONLY a JSON array of objects representing the items. Do not use markdown wrappers like \`\`\`json.
            Each object MUST have these precise keys:
            - "sku": (string) The product code, part number, or SKU. If missing, generate a short 6-char alphabetical identifier based on the name.
            - "name": (string) The description or name of the product.
            - "quantity": (number) The quantity shipped or billed. If missing, assume 1.
            - "unit_cost": (number) The price per unit. If missing or not applicable, assume 0.
            - "confidence": (number) A score between 0.0 and 1.0 indicating how confident you are that this row was extracted correctly.

            Example Output format:
            [
                {
                    "sku": "ABC-123",
                    "name": "Widget Pack",
                    "quantity": 10,
                    "unit_cost": 2.50,
                    "confidence": 0.95
                }
            ]
        `

        console.log(`Sending ${file.type} file to Gemini for analysis...`)
        const result = await multimodalModel.generateContent([prompt, imagePart])
        const text = result.response.text()

        console.log('Gemini raw response length:', text.length)

        // Clean up response if it accidentally includes markdown wrappers
        let cleanText = text.trim()
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim()
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/```/g, '').trim()
        }

        let parsedData = []
        try {
            parsedData = JSON.parse(cleanText)
        } catch (e) {
            console.error('Failed to parse JSON from Gemini:', cleanText)
            throw new Error('AI returned a response that could not be parsed as data items.')
        }

        return NextResponse.json({ items: parsedData })

    } catch (error: any) {
        console.error('Error processing document:', error)
        return NextResponse.json({ error: error.message || 'Failed to process document' }, { status: 500 })
    }
}
