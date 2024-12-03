export function getMongooseUri() {
    if (process.env.PROD) {
        return `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@yummy.g9zlzc3.mongodb.net/?retryWrites=true&w=majority`;
    }

    return `mongodb://${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/${process.env.DB_COLLECTION}`;
}

export function getCorsOrigins(): string[] {
    const origins: string[] = [];

    if (process.env.FRONTEND_WEB) origins.push(process.env.FRONTEND_WEB);
    if (process.env.FRONTEND_MOBILE) origins.push(process.env.FRONTEND_MOBILE);
    if (process.env.FRONTEND_OTHERS) origins.push(...process.env.FRONTEND_OTHERS.split(','));

    return origins;
}

export async function getAllFulfilledResults<T>(promises: Promise<T>[]): Promise<PromiseSettledResult<Awaited<Promise<T>>>[]> {
    const results = await Promise.allSettled<T>(promises);

    return results.filter(result => result.status === 'fulfilled');
}