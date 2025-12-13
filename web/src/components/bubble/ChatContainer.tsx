import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../stores/useChatStore';
import { ChannelTabs } from './ChannelTabs';
import { MessageFeed } from './MessageFeed';
import { InputIsland } from './InputIsland';
import { SettingsModal } from './SettingsModal';

// Mapa de alineación Flexbox para las posiciones
const ALIGNMENT_MAP: Record<string, { justify: string; align: string }> = {
    'top-left': { justify: 'flex-start', align: 'flex-start' },
    'top-center': { justify: 'center', align: 'flex-start' },
    'top-right': { justify: 'flex-end', align: 'flex-start' },
    'center-left': { justify: 'flex-start', align: 'center' },
    'center': { justify: 'center', align: 'center' },
    'center-right': { justify: 'flex-end', align: 'center' },
    'bottom-left': { justify: 'flex-start', align: 'flex-end' },
    'bottom-center': { justify: 'center', align: 'flex-end' },
    'bottom-right': { justify: 'flex-end', align: 'flex-end' },
};

export function ChatContainer() {
    const { isVisible, settings } = useChatStore();

    // Determinar alineación
    const pos = settings.position || 'top-left';
    const { justify, align } = ALIGNMENT_MAP[pos] || ALIGNMENT_MAP['top-left'];

    // Determinar desde dónde entra la animación
    const initialX = pos.includes('left') ? -50 : pos.includes('right') ? 50 : 0;
    const initialY = pos.includes('top') ? -20 : pos.includes('bottom') ? 20 : 0;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                justifyContent: justify,
                alignItems: align,
                padding: '20px',
                pointerEvents: 'none', // IMPORTANTE: El contenedor es passthrough
                zIndex: 50,
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        layout // ✅ MAGIC: Anima los cambios de layout (tamaño, posición) automáticamente
                        initial={{ opacity: 0, x: initialX, y: initialY, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: initialX, y: initialY, scale: 0.95 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                            mass: 0.8
                        }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            pointerEvents: 'auto', // Habilitar clicks en el chat
                            position: 'relative' // Para posicionar el Modal relativo a esto si se quisiera
                        }}
                    >
                        {/* 1. TABS */}
                        <ChannelTabs />

                        {/* 2. FEED + INPUT WRAPPER */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <MessageFeed />
                            <InputIsland />
                        </div>

                        {/* 3. SETTINGS MODAL (Portalled or Rendered here?) */}
                        {/* Rendered here to follow the container movement */}
                        <SettingsModal />

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
