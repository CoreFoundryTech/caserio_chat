/**
 * Fetch utility for NUI callbacks
 * Sends POST requests to FiveM resource endpoints
 */
export async function fetchNui<T = any>(
    endpoint: string,
    data: any = {}
): Promise<T> {
    const resourceName = (window as any).GetParentResourceName
        ? (window as any).GetParentResourceName()
        : 'caserio_chat';

    const response = await fetch(`https://${resourceName}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return response.json();
}
