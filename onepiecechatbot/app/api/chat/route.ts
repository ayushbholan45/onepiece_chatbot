import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import Groq from "groq-sdk"
import { DataAPIClient } from "@datastax/astra-db-ts"

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, HUGGINGFACE_API_KEY, GROQ_API_KEY } = process.env

const groq = new Groq({ apiKey: GROQ_API_KEY })

const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: HUGGINGFACE_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2"
})

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { keyspace: ASTRA_DB_NAMESPACE })

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()
        const latestMessage = messages[messages?.length - 1]?.content

        let docContext = ""

        const vector = await embeddings.embedQuery(latestMessage)

        try {
            const collection = await db.collection(ASTRA_DB_COLLECTION)
            const cursor = collection.find(null, {
                sort: { $vector: vector },
                limit: 10
            })
            const documents = await cursor.toArray()
            const docsMap = documents?.map(doc => doc.text)
            docContext = JSON.stringify(docsMap)
        } catch (err) {
            console.log("Error querying db...")
            docContext = ""
        }

        const systemPrompt = `You are an AI assistant who knows everything about One Piece.
        Use the below context to augment what you know about One Piece.
        The context will provide you with the most recent page data from wikipedia,
        the official One Piece fandom wiki and others.
        If the context doesn't include the information you need answer based on your
        existing knowledge and don't mention the source of your information or
        what the context does or doesn't include.
        Format responses using markdown where applicable and don't return images.
        ----------------
        START CONTEXT
        ${docContext}
        END CONTEXT
        ----------------`

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            stream: true,
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ]
        })

        const encoder = new TextEncoder()
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of response) {
                    const text = chunk.choices[0]?.delta?.content || ""
                    if (text) {
                        // ai@3.4.33 data stream format
                        controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`))
                    }
                }
                controller.close()
            }
        })

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "x-vercel-ai-data-stream": "v1"
            }
        })

    } catch (err) {
        console.log(err)
        return new Response("Internal Server Error", { status: 500 })
    }
}