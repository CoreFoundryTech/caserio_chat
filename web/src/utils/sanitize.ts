/**
 * Sanitize and convert FiveM color codes to safe HTML
 * Prevents XSS attacks while preserving color formatting
 */

const FIVEM_COLORS: Record<string, string> = {
    '^0': '#000000', // Black
    '^1': '#FF0000', // Red
    '^2': '#00FF00', // Green
    '^3': '#FFFF00', // Yellow
    '^4': '#0000FF', // Blue
    '^5': '#00FFFF', // Cyan
    '^6': '#FF00FF', // Magenta
    '^7': '#FFFFFF', // White
    '^8': '#FF8800', // Orange
    '^9': '#808080', // Grey
};

/**
 * Sanitize text by escaping HTML entities
 */
function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Convert FiveM color codes to safe HTML spans
 * Sanitizes input to prevent XSS attacks
 */
export function sanitizeAndColorize(text: string): string {
    if (!text) return '';

    // First, escape all HTML to prevent XSS
    let sanitized = escapeHtml(text);

    // Then convert FiveM color codes to safe HTML
    // Pattern: ^0-9 followed by text
    const colorPattern = /(\^[0-9])/g;
    const parts = sanitized.split(colorPattern);

    let result = '';
    let currentColor = FIVEM_COLORS['^7']; // Default white

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (FIVEM_COLORS[part]) {
            // This is a color code
            currentColor = FIVEM_COLORS[part];
        } else if (part) {
            // This is text content
            result += `<span style="color: ${currentColor}">${part}</span>`;
        }
    }

    return result || sanitized;
}

/**
 * Strip all FiveM color codes from text
 */
export function stripColorCodes(text: string): string {
    if (!text) return '';
    return text.replace(/\^[0-9]/g, '');
}

/**
 * Check if text contains potential XSS attempts
 */
export function containsXSS(text: string): boolean {
    const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // onclick, onerror, etc.
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(text));
}
