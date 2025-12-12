export default {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'Inter',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'Helvetica Neue',
                    'Arial',
                    'sans-serif',
                    'Apple Color Emoji',
                    'Segoe UI Emoji',
                    'Segoe UI Symbol'
                ],
            },
            colors: {
                miami: {
                    pink: '#ec4899', // pink-500 equivalent
                    purple: '#a855f7', // purple-500
                    cyan: '#06b6d4', // cyan-500
                    glass: 'rgba(0, 0, 0, 0.2)',
                    hover: 'rgba(255, 255, 255, 0.05)',
                }
            },
            boxShadow: {
                neon: '0 0 15px rgba(236, 72, 153, 0.3)',
            },
            backdropBlur: {
                md: '12px',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                // ✅ NUEVA ANIMACIÓN PARA MENCIONES
                'mention-pulse': 'mentionPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                // ✅ KEYFRAMES PARA MENCIONES
                mentionPulse: {
                    '0%, 100%': {
                        opacity: '1',
                        boxShadow: '0 0 15px rgba(234, 179, 8, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    },
                    '50%': {
                        opacity: '.95',
                        boxShadow: '0 0 25px rgba(234, 179, 8, 0.6), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    },
                }
            }
        },
    },
    plugins: [],
}
