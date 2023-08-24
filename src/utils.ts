export function getMongooseUri() {
    if (process.env.PROD) {
        return `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@yummy.g9zlzc3.mongodb.net/?retryWrites=true&w=majority`;
    }

    return `mongodb://localhost:${process.env.DB_PORT}/${process.env.DB_COLLECTION}`;
}
