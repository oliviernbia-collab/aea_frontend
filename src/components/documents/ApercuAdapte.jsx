import { useLayoutEffect, useRef, useState } from 'react';

// Affiche un document de taille fixe (CV A4, carte de visite) reduit pour tenir dans la largeur
// disponible, sans toucher a sa mise en page interne (simple transformation CSS).
export default function ApercuAdapte({ largeur, hauteur, largeurMax = Infinity, filigrane = false, children, className = '' }) {
  const conteneur = useRef(null);
  const [echelle, setEchelle] = useState(0.5);

  useLayoutEffect(() => {
    const el = conteneur.current;
    if (!el) return undefined;
    const calculer = () => setEchelle(Math.min(el.clientWidth, largeurMax) / largeur);
    calculer();
    const obs = new ResizeObserver(calculer);
    obs.observe(el);
    return () => obs.disconnect();
  }, [largeur, largeurMax]);

  return (
    <div ref={conteneur} className={`w-full ${className}`}>
      <div className="relative mx-auto overflow-hidden shadow-lg" style={{ width: largeur * echelle, height: hauteur * echelle }}>
        <div style={{ width: largeur, height: hauteur, transform: `scale(${echelle})`, transformOrigin: 'top left' }}>{children}</div>
        {filigrane && <Filigrane />}
      </div>
    </div>
  );
}

// Filigrane "APERCU" pose par-dessus l'apercu avant paiement (jamais present dans le PDF achete).
function Filigrane() {
  return (
    <div className="pointer-events-none select-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -inset-1/2 flex flex-wrap content-center justify-center gap-x-10 gap-y-14 rotate-[-30deg]">
        {Array.from({ length: 60 }).map((_, i) => (
          <span key={i} className="text-slate-900/10 font-extrabold text-sm tracking-widest whitespace-nowrap">
            APERÇU
          </span>
        ))}
      </div>
    </div>
  );
}
