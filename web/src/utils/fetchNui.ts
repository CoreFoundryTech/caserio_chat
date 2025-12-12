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

    try {
        const response = await fetch(`https://${resourceName}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        // Log en desarrollo, silencioso en producción
        if (import.meta.env.DEV) {
            console.error(`[fetchNui] Error calling ${endpoint}:`, error);
        }

        // Retornar valor por defecto para evitar crashes
        return {} as T;
    }
}
