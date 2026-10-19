import { Link } from 'react-router-dom';
import Logo from './Logo';

const LIENS_RAPIDES = [
  { to: '/', label: 'Accueil' },
  { to: '/#actualites', label: 'Actualités' },
  { to: '/inscription', label: 'Adhérer' },
  { to: '/connexion', label: 'Connexion' },
];

const RESEAUX = [
  { icon: 'fa-brands fa-facebook-f', label: 'Facebook', href: '#', couleur: '#1877F2' },
  { icon: 'fa-brands fa-instagram', label: 'Instagram', href: '#', couleur: '#E1306C' },
  { icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', href: '#', couleur: '#25D366' },
  { icon: 'fa-brands fa-x-twitter', label: 'X (Twitter)', href: '#', couleur: '#000000' },
];

export default function Footer() {
  const annee = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-5xl px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo size={40} />
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Association à but non lucratif réunissant les étudiants d'Assoumoukro autour de l'entraide, de la
            culture et de la réussite académique.
          </p>
          <h3 className="mt-6 text-sm font-semibold text-white uppercase tracking-wide">Suivez-nous</h3>
          <div className="mt-3 flex gap-3">
            {RESEAUX.map((r) => (
              <a
                key={r.label}
                href={r.href}
                target="_blank"
                rel="noreferrer"
                aria-label={r.label}
                title={r.label}
                style={{ '--couleur-reseau': r.couleur }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white shadow-sm transition hover:border-transparent hover:text-white hover:shadow-md hover:[background-color:var(--couleur-reseau)]"
              >
                <i className={r.icon} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Liens rapides</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {LIENS_RAPIDES.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-white transition">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-location-dot mt-0.5 text-blue-400" />
              <span>Assoumoukro, Côte d'Ivoire</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-envelope mt-0.5 text-blue-400" />
              <a href="mailto:contact-aea@gmail.com" className="hover:text-white transition">
                contact-aea@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-phone mt-0.5 text-blue-400" />
              <a href="tel:+2250554183378" className="hover:text-white transition">
                +225  05 54 18 33 78
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">À propos</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/inscription" className="hover:text-white transition">Devenir membre</Link></li>
            <li><a href="#" className="hover:text-white transition">Mentions légales</a></li>
            <li><a href="#" className="hover:text-white transition">Confidentialité des données</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© {annee} Association des Étudiants d'Assoumoukro (AEA). Tous droits réservés.</p>
          <p>Espace Membre AEA</p>
        </div>
      </div>
    </footer>
  );
}
