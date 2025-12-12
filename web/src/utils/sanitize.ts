/**
 * Sanitize and convert FiveM color codes to safe HTML
 * Prevents XSS attacks while preserving color formatting
 * Uses DOMPurify for robust security
 */

import DOMPurify from 'dompurify';

const FIVEM_COLORS: Record<string, string> = {
    '^0': '#000000', // Black
    '^1': '#EF4444', // Red (Tailwind colors se ven mejor)
    '^2': '#22C55E', // Green
    '^3': '#EAB308', // Yellow
    '^4': '#3B82F6', // Blue
    '^5': '#06B6D4', // Cyan
    '^6': '#A855F7', // Purple
    '^7': '#FFFFFF', // White
    '^8': '#F97316', // Orange
    '^9': '#6B7280', // Grey
};

/**
 * Convert FiveM color codes to safe HTML spans
 * Sanitizes input to prevent XSS attacks using DOMPurify
 */
export function sanitizeAndColorize(text: string): string {
    if (!text) return '';

    // 1. Sanitizar el texto crudo con DOMPurify primero para quitar scripts
    let safeText = DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [], // No permitir NINGUNA etiqueta HTML del usuario
        ALLOWED_ATTR: []
    });

    // 2. Reemplazar códigos de color
    const colorPattern = /(\^[0-9])/g;
    const parts = safeText.split(colorPattern);

    let result = '';
    let currentColor = FIVEM_COLORS['^7']; // Default white

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (FIVEM_COLORS[part]) {
            currentColor = FIVEM_COLORS[part];
        } else if (part) {
            // Ya está sanitizado, es seguro ponerlo en el span
            result += `<span style="color: ${currentColor}">${part}</span>`;
        }
    }

    return result;
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
