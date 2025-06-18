interface CompactUrlProps {
    apiUrl: string;
    endpointUrl: string;
    queryVars?: Record<string, string>;
}

export function getCompactUrl(props: CompactUrlProps): string {
    const { apiUrl, endpointUrl, queryVars } = props;
    const query = Object.entries(queryVars ?? {})
        .filter(([, value]) => !value || value.length === 0)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    return `${apiUrl}/${endpointUrl}?${query}`;
}