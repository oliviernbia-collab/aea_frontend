import { useEffect, useState } from 'react';

// Bouton flottant "retour en haut", affiche uniquement une fois que l'utilisateur a
// suffisamment defile vers le bas (evite de polluer l'ecran des les premiers pixels).
export default function BoutonRetourHaut({ seuil = 400 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > seuil);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [seuil]);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Remonter en haut de la page"
      title="Remonter en haut"
      className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-blue-800 text-white shadow-lg hover:bg-blue-900 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <i className="fa-solid fa-arrow-up" />
    </button>
  );
}
