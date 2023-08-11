declare namespace NodeJS {
    interface ProcessEnv {
        OPENAI_API_KEY: string;
        PINECONE_API_KEY: string;
        PINECONE_INDEX_NAME: string;
        CHROMA_COLLECTION_NAME: string;
        FOLLOW_UP_API_KEY: string;
        SPARK_API_KEY: string;
        MONGO_URL: string;
        BASE_URL: string;
    }
}
