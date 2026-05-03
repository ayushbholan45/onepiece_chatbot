import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer"
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import "dotenv/config"

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, HUGGINGFACE_API_KEY } = process.env

const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: HUGGINGFACE_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2"
})

const onePieceData = [
    // Covers entire story, plot, overview
    'https://en.wikipedia.org/wiki/One_Piece',
    'https://en.wikipedia.org/wiki/List_of_One_Piece_characters',

    // Covers ALL straw hats in one page
    'https://onepiece.fandom.com/wiki/Straw_Hat_Pirates',

    // Covers ALL villains/emperors in one page
    'https://onepiece.fandom.com/wiki/Four_Emperors',
    'https://onepiece.fandom.com/wiki/Seven_Warlords_of_the_Sea',
    'https://onepiece.fandom.com/wiki/Worst_Generation',

    // Covers ALL devil fruits in one page
    'https://onepiece.fandom.com/wiki/Devil_Fruit',

    // Covers ALL haki types in one page
    'https://onepiece.fandom.com/wiki/Haki',

    // Covers marines/world government
    'https://onepiece.fandom.com/wiki/Marine',
    'https://onepiece.fandom.com/wiki/World_Government',

    // Latest lore
    'https://onepiece.fandom.com/wiki/Im',
    'https://onepiece.fandom.com/wiki/Egghead_Arc',
    'https://onepiece.fandom.com/wiki/Void_Century',
    'https://onepiece.fandom.com/wiki/Ancient_Weapons',
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { 
    keyspace: ASTRA_DB_NAMESPACE,
    timeoutDefaults: {
        requestTimeoutMs: 60000,  // increase from 15s to 60s
        generalMethodTimeoutMs: 120000
    }
})
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})

const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 384, // changed from 1536 (OpenAI) to 384 (HuggingFace MiniLM)
            metric: similarityMetric
        }
    })
    console.log(res)
}

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await (const url of onePieceData) {
        console.log(`Scraping: ${url}`)
        try {
            const content = await scrapePage(url)
            const chunks = await splitter.splitText(content)
            for await (const chunk of chunks) {
                try {
                    const vector = await embeddings.embedQuery(chunk)
                    const res = await collection.insertOne({
                        $vector: vector,
                        text: chunk,
                    })
                    console.log(res)
                } catch (err) {
                    console.log(`Skipping chunk due to error: ${err.message}`)
                    continue // skip this chunk and move on
                }
            }
        } catch (err) {
            console.log(`Skipping URL ${url} due to error: ${err.message}`)
            continue // skip this URL and move on
        }
    }
}

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, { // fixed: was missing "const loader ="
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerHTML)
            await browser.close()
            return result
        }
    })
    return (await loader.scrape())?.replace(/<[^>]*>?/gm, '')
}

createCollection().then(() => loadSampleData())