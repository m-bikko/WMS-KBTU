import { NextRequest, NextResponse } from 'next/server'
import { geminiModel } from '@/lib/ai/gemini'
import { databaseSchema } from '@/lib/ai/schemaContext'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json()

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        // 1. Determine Intent & Generate Content
        const prompt = `
      You are WarehouseIQ, an intelligent warehouse assistant.
      
      Database Schema:
      ${databaseSchema}
      
      User Input: "${message}"
      
      Your Goal:
      - If the user asks a question about data (inventory, orders, etc.), generate a SQL query.
      - If the user starts a conversation (hi, who are you, help), reply directly.
      - If the request is unclear or impossible, explain why.

      Output Format (JSON only):
      {
        "type": "sql" | "chat",
        "content": "THE_SQL_QUERY" or "THE_NATURAL_LANGUAGE_RESPONSE"
      }
      
      Rules for SQL:
      - Postgres dialect.
      - SELECT only.
      - Limit to 10 rows by default.
      - Today is ${new Date().toISOString()}.
    `

        const result = await geminiModel.generateContent(prompt)
        const responseText = result.response.text().replace(/```json|```/g, '').trim()

        let parsedResult;
        try {
            parsedResult = JSON.parse(responseText)
        } catch (e) {
            // Fallback if JSON parsing fails
            console.error("Failed to parse AI response:", responseText)
            return NextResponse.json({ text: "I'm having trouble understanding that right now. Could you rephrase?" })
        }

        if (parsedResult.type === 'chat') {
            return NextResponse.json({ text: parsedResult.content })
        }

        // 2. Execute SQL (if type is sql)
        const sqlQuery = parsedResult.content.replace(/;$/, '')
        console.log('Executing SQL:', sqlQuery)

        let queryData = []
        try {
            const { data, error } = await supabase.rpc('exec_sql', { query: sqlQuery })
            if (error) {
                console.error("SQL Execution Error:", error)
                return NextResponse.json({ text: `I tried to fetch that data but ran into an issue: ${error.message}` })
            }
            queryData = data
        } catch (e: any) {
            return NextResponse.json({ text: "Database connection error." })
        }

        // 3. Generate Answer from Data
        const answerPrompt = `
      User Question: "${message}"
      SQL Query Used: ${sqlQuery}
      Data Returned: ${JSON.stringify(queryData).slice(0, 3000)}
      
      Provide a concise, helpful answer summarizing the data. 
      If no data was found, say so clearly.
    `

        const answerResult = await geminiModel.generateContent(answerPrompt)
        return NextResponse.json({
            text: answerResult.response.text(),
            data: queryData
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
