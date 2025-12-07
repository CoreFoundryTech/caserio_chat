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
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
