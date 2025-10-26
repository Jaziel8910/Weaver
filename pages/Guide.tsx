

import React, { useState } from 'react';
import { useTranslation } from '../App';
import { ChevronDown, Feather, HelpCircle, Rocket, Wand2, Sparkles, Coins, ShieldCheck, ShieldAlert } from 'lucide-react';
import { detailedContentRatings } from '../constants';

interface AccordionItemProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 px-2"
            >
                <div className="flex items-center">
                    <span className="text-primary-500 mr-4">{icon}</span>
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                </div>
                <ChevronDown
                    size={24}
                    className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`grid transition-all duration-500 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden">
                     <div className="prose prose-invert max-w-none p-4 pl-14 text-gray-300 leading-relaxed">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};


const Guide: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="p-8 h-full max-w-4xl mx-auto">
            <header className="mb-8 text-center">
                <Feather className="text-primary-500 mx-auto" size={48} />
                <h1 className="text-4xl font-bold text-white mt-4">{t('guideTitle')}</h1>
                <p className="text-gray-400 mt-2">{t('guideSubtitle')}</p>
            </header>

            <div className="space-y-4">
                <AccordionItem title={t('faq')} icon={<HelpCircle size={24}/>}>
                    <h4>¿Qué es Weaver?</h4>
                    <p>Weaver es una plataforma de narración creativa donde puedes colaborar con la inteligencia artificial de Gemini para escribir, diseñar y compartir historias cautivadoras. Es tu lienzo y tu musa, todo en un solo lugar.</p>
                    <h4>¿Necesito saber escribir para usar Weaver?</h4>
                    <p>¡Para nada! Weaver está diseñado tanto para autores experimentados como para principiantes. Puedes proporcionar ideas simples y dejar que Gemini te ayude a desarrollarlas, o puedes tener un control total sobre cada palabra. ¡Es tu historia!</p>
                    <h4>¿Son mis historias privadas?</h4>
                    <p>Sí, por defecto, todas las historias que creas en "Mis Historias" son privadas y solo tú puedes verlas. Las funciones para compartir historias con la comunidad se implementarán en el futuro.</p>
                </AccordionItem>

                <AccordionItem title={t('gettingStarted')} icon={<Rocket size={24}/>}>
                    <h4>1. Crea tu Cuenta</h4>
                    <p>El primer paso es registrarte. Esto te da acceso a tu propia biblioteca, moneda del juego y seguimiento de tu progreso.</p>
                    <h4>2. Tu Primera Historia</h4>
                    <p>Ve a "Crear Nueva Historia". El asistente te guiará a través de 5 sencillos pasos para darle a Gemini toda la información que necesita para entender tu visión. ¡Sé tan detallado como quieras!</p>
                    <h4>3. Explora el Hub</h4>
                    <p>El Hub es tu punto de partida. Aquí encontrarás historias destacadas, desafíos de escritura y noticias de la comunidad. Es un gran lugar para encontrar inspiración.</p>
                </AccordionItem>
                
                <AccordionItem title={t('coreFeatures')} icon={<Wand2 size={24}/>}>
                    <h4>El Asistente de Creación</h4>
                    <p>El corazón de Weaver. Este proceso de 5 pasos (Concepto, Mundo, Personajes, Trama y Estilo) es crucial. Cuanta más información de calidad le des a Gemini aquí, mejores serán los resultados iniciales de tu historia.</p>
                    <h4>Página de Detalles de la Historia</h4>
                    <p>Antes de leer, cada historia tiene su propia página de presentación. Aquí puedes ver la sinopsis, las etiquetas, la lista de capítulos y, lo más importante, la Clasificación de Contenido generada por la IA para que sepas qué esperar.</p>
                    <h4>El Visor de Historias</h4>
                    <p>Un entorno de lectura inmersivo y personalizable. Cambia el tamaño de la fuente, el tema (oscuro, sepia, claro) y la alineación del texto para una comodidad máxima. Aquí es donde la historia cobra vida.</p>
                </AccordionItem>
                
                <AccordionItem title={t('advancedFeatures')} icon={<Sparkles size={24}/>}>
                    <h4>Modo Diálogo (Plan Pro)</h4>
                    <p>Transforma el texto de un capítulo en un guion. Cada línea de diálogo se extrae y se atribuye a un personaje. ¡Incluso puedes hacer clic para escuchar el audio de cada línea con la voz designada para ese personaje!</p>
                    <h4>Audiolibro (Plan Pro)</h4>
                    <p>Convierte cualquier capítulo en una experiencia de audiolibro con un solo clic. Gemini reescribe sutilmente el texto para que fluya mejor en formato de audio y luego genera una narración completa.</p>
                    <h4>Escenarios "¿Qué pasaría si...?" (Plan Ultra)</h4>
                    <p>Esta es una de las herramientas más poderosas. En cualquier capítulo, puedes proponer un escenario alternativo. Gemini escribirá un nuevo capítulo de bifurcación, creando una línea de tiempo alternativa que puedes explorar.</p>
                    <blockquote>
                        <p><strong>Ejemplo de uso:</strong></p>
                        <p>Tu historia dice: <em>"Kael entregó el paquete sin hacer preguntas."</em></p>
                        <p>Tu prompt de "¿Qué pasaría si...?": <em>"¿Y si la curiosidad de Kael la vence y abre el paquete?"</em></p>
                        <p>Resultado: Un nuevo capítulo donde Kael descubre el secreto del paquete, llevando la historia por un camino completamente diferente.</p>
                    </blockquote>
                    <h4>Asistente de Historia</h4>
                    <p>Tu compañero de lectura y escritura. En el modo "Analizar Historia", puedes hacerle preguntas sobre la trama. En el modo "Chat de Personaje", puedes hablar directamente con los personajes de la historia, y ellos te responderán según su personalidad.</p>
                </AccordionItem>

                <AccordionItem title={t('contentRatingSystem')} icon={<ShieldAlert size={24}/>}>
                    <h4>Nuestra Filosofía</h4>
                    <p>Creemos en dar a los lectores el poder de tomar decisiones informadas sobre el contenido que consumen. Nuestro sistema de clasificación, generado por IA, está diseñado para proporcionar una guía clara y visual sobre los temas que se encuentran en una historia, permitiéndote elegir las aventuras que mejor se adapten a ti.</p>
                    
                    <h4>¿Cómo Funciona?</h4>
                    <p>Cuando se genera una historia, Gemini realiza un segundo análisis de todo el texto. Compara el contenido con una lista completa de descriptores y temas sensibles. Basado en este análisis, asigna las advertencias de contenido pertinentes. El sistema luego muestra la clasificación de edad más alta de manera prominente y desglosa los descriptores específicos con iconos para una fácil comprensión.</p>
                    <p><em><strong>Importante:</strong> Como este sistema es impulsado por IA, es una herramienta de guía y puede que no sea 100% precisa. Siempre está aprendiendo y mejorando.</em></p>
                    
                    <h4>Niveles de Clasificación Explicados</h4>
                    <p>Aquí tienes un desglose de lo que generalmente significa cada nivel de clasificación:</p>
                     <div className="space-y-4 not-prose mt-4">
                        {detailedContentRatings.map((ratingInfo) => {
                            const key = ratingInfo.rating === 'E' ? 'E / 3+' : ratingInfo.rating === '18+ NSFW' ? '18+ NSFW (Explícito)' : ratingInfo.rating;
                            return (
                                <div key={key} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                    <h5 className="font-bold text-lg text-primary-400">{key}</h5>
                                    <p className="text-sm text-gray-300 mt-1">{ratingInfo.description}</p>
                                    <p className="text-xs text-gray-400 mt-3 font-mono"><strong>Ejemplos:</strong> {ratingInfo.tags.slice(0, 4).join(', ')}...</p>
                                </div>
                            );
                        })}
                    </div>
                </AccordionItem>

                 <AccordionItem title={t('economy')} icon={<Coins size={24}/>}>
                    <h4>WeBucks (WB)</h4>
                    <p>Esta es la moneda principal de la plataforma, similar a las gemas en otras aplicaciones. Ganas WeBucks completando misiones (como escribir tu primera historia). Los WeBucks se utilizan para comprar planes de suscripción en la Tienda.</p>
                    <h4>WeTokens (WT)</h4>
                    <p>Estos son tus "créditos de IA". Cada acción que requiere un uso intensivo de Gemini (generar una historia, autocompletar, crear un audiolibro, etc.) consume una pequeña cantidad de WeTokens. Todos los usuarios reciben una asignación diaria de WeTokens, pero los suscriptores de planes superiores reciben muchos más. Esto asegura un uso justo de los recursos de la IA.</p>
                </AccordionItem>

                 <AccordionItem title={t('plansAndTiers')} icon={<ShieldCheck size={24}/>}>
                    <h4>Plan Free</h4>
                    <p>Perfecto para empezar. Te permite crear un número limitado de historias al mes y te da una asignación diaria de WeTokens para probar las funciones básicas.</p>
                    <h4>Plan Pro</h4>
                    <p>Para el escritor ávido. Desbloquea la creación ilimitada de historias, acceso a funciones como el Modo Diálogo y Audiolibro, y una mayor asignación de WeTokens.</p>
                    <h4>Plan Ultra</h4>
                    <p>Para el verdadero "world-builder". Incluye todos los beneficios del Pro, además de acceso a funciones experimentales y de vanguardia como los escenarios "¿Qué pasaría si...?", personalizaciones de perfil exclusivas y la mayor cantidad de WeTokens.</p>
                </AccordionItem>
            </div>
        </div>
    );
};

export default Guide;