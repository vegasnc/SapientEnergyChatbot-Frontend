import 'dotenv/config';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '../utils/pinecone-client.js';
import { CustomPDFLoader } from '../utils/customPDFLoader.js';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { isWithinTokenLimit, encode, decode } from 'gpt-tokenizer/esm/model/text-embedding-ada-002';
import openai from 'openai';
import fs from 'fs';
import path from 'path';

/* Name of directory to retrieve your files from */
const filePath = 'docs';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const configuration = new openai.Configuration({
    apiKey: OPENAI_API_KEY,
    organization: null,
});

const engine = new openai.OpenAIApi(configuration);
const model = 'text-embedding-ada-002';

export const run = async () => {
    try {
        /*load raw docs from the all files in the directory */
        const directoryLoader = new DirectoryLoader(filePath, {
            '.pdf': (path) => new CustomPDFLoader(path),
            '.json': (path) => new JSONLoader(path),
        });

        // const loader = new PDFLoader(filePath);
        const rawDocs = await directoryLoader.load();

        console.log('-------------------------------raw docs---------------------------------');
        console.log(rawDocs);

        /* Split text into chunks */
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const docs = await textSplitter.splitDocuments(rawDocs);

        // console.log("-------------------------------docs---------------------------------");
        // console.log(docs);

        console.log('creating vector store...');
        /*create and store the embeddings in the vectorStore*/
        const embeddings = new OpenAIEmbeddings();
        const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

        //embed the PDF documents
        await PineconeStore.fromDocuments(docs, embeddings, {
            pineconeIndex: index,
            namespace: 'test',
            textKey: 'text',
        });
    } catch (error) {
        console.log('error', error);
        throw new Error('Failed to ingest your data');
    }
};

async function main() {
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    // const files = fs.readdirSync(filePath).map((file) => path.join(filePath, file));
    // const fileContents = files.map((file) => fs.readFileSync(file, 'utf8'));

    const file = fs.readFileSync('data/data.json', 'utf8');
    const json = JSON.parse(file);

    const vectors = json.map(async (data) => {
        const embeddings = await engine.createEmbedding({ model, input: data.readable });

        return {
            id: data.id,
            values: embeddings.data.data[0].embedding,
        };
    });

    await index.upsert({
        upsertRequest: {
            namespace: 'test_002',
            vectors: await Promise.all(vectors),
        },
    });
}

(async () => {
    await main();
    console.log('ingestion complete');
})();
