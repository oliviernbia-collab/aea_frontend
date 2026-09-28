import { Link } from 'react-router-dom';
import Logo from './Logo';

const LIENS_RAPIDES = [
  { to: '/', label: 'Accueil' },
  { to: '/#actualites', label: 'Actualites' },
  { to: '/inscription', label: 'Adherer' },
  { to: '/connexion', label: 'Connexion' },
];

const RESEAUX = [
  { icon: 'fa-brands fa-facebook-f', label: 'Facebook', href: '#' },
  { icon: 'fa-brands fa-instagram', label: 'Instagram', href: '#' },
  { icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', href: '#' },
  { icon: 'fa-brands fa-x-twitter', label: 'X (Twitter)', href: '#' },
];

export default function Footer() {
  const annee = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-5xl px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo size={40} />
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Association a but non lucratif reunissant les etudiants d'Assoumoukro autour de l'entraide, de la
            culture et de la reussite academique.
          </p>
          <div className="mt-4 flex gap-3">
            {RESEAUX.map((r) => (
              <a
                key={r.label}
                href={r.href}
                aria-label={r.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-blue-700 hover:text-white transition"
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
              <span>Assoumoukro, Cote d'Ivoire</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-envelope mt-0.5 text-blue-400" />
              <a href="mailto:contact@aea-assoumoukro.org" className="hover:text-white transition">
                contact@aea-assoumoukro.org
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
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">A propos</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/inscription" className="hover:text-white transition">Devenir membre</Link></li>
            <li><a href="#" className="hover:text-white transition">Mentions legales</a></li>
            <li><a href="#" className="hover:text-white transition">Confidentialite des donnees</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© {annee} Association des Etudiants d'Assoumoukro (AEA). Tous droits reserves.</p>
          <p>Espace Membre AEA</p>
        </div>
      </div>
    </footer>
  );
}
