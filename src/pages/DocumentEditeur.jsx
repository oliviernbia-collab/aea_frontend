import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import ApercuAdapte from '../components/documents/ApercuAdapte';
import DocumentCV, { CV_LARGEUR, CV_HAUTEUR, MODELES_CV, CV_EXEMPLE } from '../components/documents/ModelesCV';
import { FaceCarte, CARTE_LARGEUR, CARTE_HAUTEUR, MODELES_CARTE, CARTE_EXEMPLE } from '../components/documents/ModelesCarteVisite';
import { MOYENS_PAIEMENT } from '../constants/moyensPaiement';
import { TARIFS_DOCUMENTS } from '../constants/documents';
import { enregistrerBrouillon, imageReduite, lireBrouillon, listerAchats, memoriserAchat } from '../utils/achatsDocuments';

const EXPERIENCE_VIDE = { periode: '', poste: '', entreprise: '', details: '' };
const FORMATION_VIDE = { periode: '', diplome: '', etablissement: '' };

const CV_VIDE = {
  prenom: '', nom: '', titre: '', photo: null, profil: '', telephone: '', email: '', adresse: '', site: '',
  experiences: [{ ...EXPERIENCE_VIDE }], formations: [{ ...FORMATION_VIDE }],
  competences: '', langues: '', qualites: '', interets: '',
};
const CARTE_VIDE = { genre: 'professionnelle', prenom: '', nom: '', fonction: '', organisation: '', slogan: '', telephone: '', email: '', site: '', adresse: '', photo: null };

const CONFIG = {
  cv: {
    titre: 'Créer mon CV',
    sousTitre: 'Choisissez un modèle, remplissez vos informations, payez puis téléchargez votre CV en PDF.',
    modeles: MODELES_CV,
    vide: CV_VIDE,
    exemple: CV_EXEMPLE,
    libellePhoto: 'Photo d’identité',
  },
  carte_visite: {
    titre: 'Créer ma carte de visite',
    sousTitre: 'Choisissez un modèle, remplissez vos informations, payez puis téléchargez votre carte (recto + verso) en PDF.',
    modeles: MODELES_CARTE,
    vide: CARTE_VIDE,
    exemple: CARTE_EXEMPLE,
    libellePhoto: 'Logo (facultatif — sinon vos initiales)',
  },
};

const champ = 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm';
const etiquette = 'block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1';

function Champ({ label, valeur, onChange, placeholder, multiligne, lignes = 3, aide }) {
  return (
    <div>
      <label className={etiquette}>{label}</label>
      {multiligne ? (
        <textarea rows={lignes} value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={champ} />
      ) : (
        <input value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={champ} />
      )}
      {aide && <p className="mt-0.5 text-[11px] text-slate-400">{aide}</p>}
    </div>
  );
}

function Bloc({ titre, icone, children }) {
  return (
    <section className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow space-y-3">
      <h2 className="font-semibold text-slate-800 dark:text-slate-100">
        <i className={`fa-solid ${icone} mr-2 text-blue-800 dark:text-blue-300`} />
        {titre}
      </h2>
      {children}
    </section>
  );
}

// Apercu d'un document (CV ou carte recto/verso) a l'echelle de son conteneur.
function Apercu({ type, modele, donnees, filigrane, largeurMax }) {
  if (type === 'cv') {
    return (
      <ApercuAdapte largeur={CV_LARGEUR} hauteur={CV_HAUTEUR} filigrane={filigrane} largeurMax={largeurMax}>
        <DocumentCV modele={modele} donnees={donnees} />
      </ApercuAdapte>
    );
  }
  return (
    <div className="space-y-3">
      {['recto', 'verso'].map((face) => (
        <ApercuAdapte key={face} largeur={CARTE_LARGEUR} hauteur={CARTE_HAUTEUR} filigrane={filigrane} largeurMax={largeurMax} className="[&>div]:rounded-xl">
          <FaceCarte modele={modele} donnees={donnees} face={face} />
        </ApercuAdapte>
      ))}
    </div>
  );
}

export default function DocumentEditeur({ type }) {
  const config = CONFIG[type];
  const { showToast } = useToast();
  const brouillon = lireBrouillon(type);
  const [modele, setModele] = useState(brouillon?.modele || config.modeles[0].id);
  const [donnees, setDonnees] = useState(() => ({ ...config.vide, ...(brouillon?.donnees || {}) }));
  const [modePaiement, setModePaiement] = useState('wave');
  const [telephonePaiement, setTelephonePaiement] = useState(brouillon?.telephonePaiement || '');
  const [envoi, setEnvoi] = useState(false);
  const achats = listerAchats().filter((a) => a.type === type);
  const prix = TARIFS_DOCUMENTS[type];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  // Brouillon conserve dans le navigateur : rien n'est perdu en cas de retour arriere,
  // de rechargement ou d'echec du paiement.
  useEffect(() => {
    const t = setTimeout(() => enregistrerBrouillon(type, { modele, donnees, telephonePaiement }), 400);
    return () => clearTimeout(t);
  }, [type, modele, donnees, telephonePaiement]);

  const maj = (cle) => (valeur) => setDonnees((d) => ({ ...d, [cle]: valeur }));
  const majListe = (liste, index, cle) => (valeur) =>
    setDonnees((d) => ({ ...d, [liste]: d[liste].map((el, i) => (i === index ? { ...el, [cle]: valeur } : el)) }));
  const ajouter = (liste, vide) => setDonnees((d) => ({ ...d, [liste]: [...d[liste], { ...vide }] }));
  const retirer = (liste, index) => setDonnees((d) => ({ ...d, [liste]: d[liste].filter((_, i) => i !== index) }));

  const choisirPhoto = async (e) => {
    const fichier = e.target.files[0];
    e.target.value = '';
    if (!fichier) return;
    try {
      const photo = await imageReduite(fichier, type === 'cv' ? 700 : 500);
      setDonnees((d) => ({ ...d, photo }));
    } catch {
      showToast("Cette image n'a pas pu être lue.", 'erreur');
    }
  };

  const perso = type === 'carte_visite' && donnees.genre === 'personnelle';
  const exempleCarte = { ...CARTE_EXEMPLE, genre: donnees.genre || 'professionnelle' };

  const remplirExemple = () => {
    if (!window.confirm("Remplacer le contenu actuel par l'exemple ?")) return;
    setDonnees({ ...config.vide, ...config.exemple, photo: donnees.photo, ...(type === 'carte_visite' ? { genre: donnees.genre || 'professionnelle' } : {}) });
  };

  const toutEffacer = () => {
    if (!window.confirm('Effacer tout le contenu du formulaire ?')) return;
    setDonnees({ ...config.vide, ...(type === 'carte_visite' ? { genre: donnees.genre || 'professionnelle' } : {}) });
  };

  const payer = async (e) => {
    e.preventDefault();
    if (!donnees.nom.trim() && !donnees.prenom.trim()) {
      showToast('Renseignez au moins votre nom.', 'erreur');
      return;
    }
    setEnvoi(true);
    try {
      const { photo, ...contenu } = donnees;
      const { data } = await api.post('/documents/commandes', {
        type,
        modele,
        donnees: contenu,
        photo: photo || undefined,
        mode_paiement: modePaiement,
        payer_phone: telephonePaiement,
      });
      memoriserAchat({ reference: data.reference, token: data.token, type, statut: 'pending' });
      window.location.href = data.redirectUrl;
    } catch (err) {
      showToast(err.response?.data?.message || "Le paiement n'a pas pu être lancé. Réessayez.", 'erreur');
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="bg-blue-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <Logo />
          <Link to="/" className="rounded-lg border border-white/40 px-3 py-1.5 text-sm hover:bg-white/10">
            <i className="fa-solid fa-arrow-left mr-1" /> Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-24 lg:pb-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{config.titre}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{config.sousTitre}</p>
        </div>

        {achats.length > 0 && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 p-3 text-sm">
            <p className="font-medium text-emerald-800 dark:text-emerald-300 mb-1">
              <i className="fa-solid fa-clock-rotate-left mr-1" /> Vos achats sur cet appareil
            </p>
            <div className="flex flex-wrap gap-2">
              {achats.slice(0, 6).map((a) => (
                <Link
                  key={a.reference}
                  to={`/documents/commande/${a.reference}?token=${a.token}`}
                  className="rounded-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 px-3 py-1 text-xs hover:bg-emerald-100 dark:hover:bg-slate-700"
                >
                  {new Date(a.date).toLocaleDateString('fr-FR')} — retrouver / télécharger
                </Link>
              ))}
            </div>
          </div>
        )}

        {type === 'carte_visite' && (
          <section>
            <h2 className="font-semibold mb-2">Type de carte</h2>
            <div className="grid grid-cols-2 gap-3 max-w-xl">
              {[
                { value: 'professionnelle', titre: 'Carte professionnelle', detail: 'Avec le nom de votre entreprise ou organisation', icone: 'fa-briefcase' },
                { value: 'personnelle', titre: 'Carte personnelle', detail: 'À votre nom uniquement, sans entreprise', icone: 'fa-user' },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => maj('genre')(g.value)}
                  className={`rounded-xl border-2 p-3 text-left transition ${
                    (donnees.genre || 'professionnelle') === g.value ? 'border-blue-700 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                  }`}
                >
                  <p className="font-semibold text-sm"><i className={`fa-solid ${g.icone} mr-1.5 text-blue-800 dark:text-blue-300`} />{g.titre}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{g.detail}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-semibold mb-2">1. Choisissez un modèle</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
            {config.modeles.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModele(m.id)}
                className={`shrink-0 w-36 sm:w-44 lg:w-auto rounded-xl p-2 text-left transition border-2 ${
                  modele === m.id ? 'border-blue-700 bg-blue-50 dark:bg-blue-900/30' : 'border-transparent bg-white dark:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="pointer-events-none">
                  {type === 'cv' ? (
                    <ApercuAdapte largeur={CV_LARGEUR} hauteur={CV_HAUTEUR}>
                      <DocumentCV modele={m.id} donnees={CV_EXEMPLE} />
                    </ApercuAdapte>
                  ) : (
                    <ApercuAdapte largeur={CARTE_LARGEUR} hauteur={CARTE_HAUTEUR} className="[&>div]:rounded-md">
                      <FaceCarte modele={m.id} donnees={exempleCarte} face="recto" />
                    </ApercuAdapte>
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold">{m.nom}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{m.description}</p>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] items-start">
          <form onSubmit={payer} className="min-w-0 space-y-4 order-2 lg:order-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">2. Remplissez vos informations</h2>
              <div className="flex gap-2">
                <button type="button" onClick={remplirExemple} className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-700">
                  <i className="fa-solid fa-wand-magic-sparkles mr-1" /> Voir un exemple
                </button>
                <button type="button" onClick={toutEffacer} className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-700">
                  <i className="fa-solid fa-eraser mr-1" /> Tout effacer
                </button>
              </div>
            </div>

            <Bloc titre="Identité" icone="fa-user">
              <div className="grid gap-3 sm:grid-cols-2">
                <Champ label="Prénom(s)" valeur={donnees.prenom} onChange={maj('prenom')} />
                <Champ label="Nom" valeur={donnees.nom} onChange={maj('nom')} />
                {type === 'cv' ? (
                  <div className="sm:col-span-2">
                    <Champ label="Titre / poste recherché" valeur={donnees.titre} onChange={maj('titre')} placeholder="Ex. Assistante comptable" />
                  </div>
                ) : (
                  <>
                    <Champ label="Fonction" valeur={donnees.fonction} onChange={maj('fonction')} placeholder="Ex. Commercial" />
                    {!perso && (
                      <>
                        <Champ label="Entreprise / organisation" valeur={donnees.organisation} onChange={maj('organisation')} />
                        <div className="sm:col-span-2">
                          <Champ label="Slogan (facultatif)" valeur={donnees.slogan} onChange={maj('slogan')} />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              <div>
                <label className={etiquette}>{perso ? 'Photo ou logo personnel (facultatif — sinon vos initiales)' : config.libellePhoto}</label>
                <div className="flex items-center gap-3">
                  {donnees.photo && <img src={donnees.photo} alt="" className="h-14 w-14 rounded-full object-cover border" />}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choisirPhoto} className="text-sm flex-1 min-w-0" />
                  {donnees.photo && (
                    <button type="button" onClick={() => maj('photo')(null)} className="text-xs text-red-600 hover:underline">Retirer</button>
                  )}
                </div>
              </div>
            </Bloc>

            <Bloc titre="Coordonnées" icone="fa-address-book">
              <div className="grid gap-3 sm:grid-cols-2">
                <Champ label="Téléphone" valeur={donnees.telephone} onChange={maj('telephone')} />
                <Champ label="E-mail" valeur={donnees.email} onChange={maj('email')} />
                <Champ label="Adresse / ville" valeur={donnees.adresse} onChange={maj('adresse')} />
                <Champ label="Site web / LinkedIn (facultatif)" valeur={donnees.site} onChange={maj('site')} />
              </div>
            </Bloc>

            {type === 'cv' && (
              <>
                <Bloc titre="Profil" icone="fa-id-badge">
                  <Champ label="Quelques lignes pour vous présenter" valeur={donnees.profil} onChange={maj('profil')} multiligne lignes={4} />
                </Bloc>

                <Bloc titre="Expériences" icone="fa-briefcase">
                  {donnees.experiences.map((e, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Champ label="Période" valeur={e.periode} onChange={majListe('experiences', i, 'periode')} placeholder="2023 – 2024" />
                        <Champ label="Poste" valeur={e.poste} onChange={majListe('experiences', i, 'poste')} />
                        <Champ label="Entreprise" valeur={e.entreprise} onChange={majListe('experiences', i, 'entreprise')} />
                      </div>
                      <Champ label="Missions (une par ligne)" valeur={e.details} onChange={majListe('experiences', i, 'details')} multiligne />
                      <button type="button" onClick={() => retirer('experiences', i)} className="text-xs text-red-600 hover:underline">
                        <i className="fa-solid fa-trash mr-1" /> Retirer cette expérience
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => ajouter('experiences', EXPERIENCE_VIDE)} className="text-sm text-blue-800 dark:text-blue-300 hover:underline">
                    <i className="fa-solid fa-plus mr-1" /> Ajouter une expérience
                  </button>
                </Bloc>

                <Bloc titre="Formation" icone="fa-graduation-cap">
                  {donnees.formations.map((f, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Champ label="Période" valeur={f.periode} onChange={majListe('formations', i, 'periode')} placeholder="2021 – 2023" />
                        <Champ label="Diplôme" valeur={f.diplome} onChange={majListe('formations', i, 'diplome')} />
                        <Champ label="Établissement" valeur={f.etablissement} onChange={majListe('formations', i, 'etablissement')} />
                      </div>
                      <button type="button" onClick={() => retirer('formations', i)} className="text-xs text-red-600 hover:underline">
                        <i className="fa-solid fa-trash mr-1" /> Retirer cette formation
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => ajouter('formations', FORMATION_VIDE)} className="text-sm text-blue-800 dark:text-blue-300 hover:underline">
                    <i className="fa-solid fa-plus mr-1" /> Ajouter une formation
                  </button>
                </Bloc>

                <Bloc titre="Compétences et plus" icone="fa-list-check">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Champ label="Compétences (une par ligne)" valeur={donnees.competences} onChange={maj('competences')} multiligne lignes={4} />
                    <Champ label="Langues (une par ligne)" valeur={donnees.langues} onChange={maj('langues')} multiligne lignes={4} aide="Ex. « Anglais : Intermédiaire »" />
                    <Champ label="Qualités (une par ligne)" valeur={donnees.qualites} onChange={maj('qualites')} multiligne lignes={4} />
                    <Champ label="Centres d’intérêt (un par ligne)" valeur={donnees.interets} onChange={maj('interets')} multiligne lignes={4} />
                  </div>
                </Bloc>
              </>
            )}

            <section id="paiement" className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow space-y-3 border-2 border-amber-400 scroll-mt-4">
              <h2 className="font-semibold">3. Payez et téléchargez</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Prix : <strong className="text-lg text-slate-900 dark:text-white">{prix} FCFA</strong> — paiement Mobile Money. Après paiement, votre {type === 'cv' ? 'CV' : 'carte de visite'} est
                téléchargeable en PDF, sans filigrane.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MOYENS_PAIEMENT.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setModePaiement(m.value)}
                    className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 text-xs transition ${
                      modePaiement === m.value ? 'border-blue-700 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <img src={m.logo} alt="" className="h-8 w-auto object-contain" />
                    {m.label}
                  </button>
                ))}
              </div>
              <Champ
                label="Numéro Mobile Money qui paie"
                valeur={telephonePaiement}
                onChange={setTelephonePaiement}
                placeholder="07 XX XX XX XX"
                aide="Numéro ivoirien (01, 05 ou 07). Vous serez redirigé vers votre opérateur pour valider."
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <i className="fa-solid fa-circle-info mr-1" />
                Vérifiez bien l’aperçu avant de payer : le contenu payé ne peut plus être modifié.
              </p>
              <button type="submit" disabled={envoi} className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 disabled:opacity-60">
                {envoi ? <i className="fa-solid fa-circle-notch fa-spin" /> : <><i className="fa-solid fa-lock mr-1" /> Payer {prix} FCFA</>}
              </button>
            </section>
          </form>

          <aside id="apercu" className="min-w-0 order-1 lg:order-2 lg:sticky lg:top-4 space-y-2 scroll-mt-4">
            <h2 className="font-semibold">Aperçu</h2>
            <Apercu type={type} modele={modele} donnees={donnees} filigrane largeurMax={type === 'cv' ? 460 : 420} />
            <p className="text-xs text-slate-400 text-center">Le filigrane « APERÇU » disparaît sur le PDF acheté.</p>
          </aside>
        </div>
      </main>

      {/* Telephone/tablette : l'apercu est en haut de page et le paiement tout en bas d'un long
          formulaire ; cette barre permet d'y revenir a tout moment sans faire defiler. */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-2 flex gap-2" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        <button type="button" onClick={() => document.getElementById('apercu')?.scrollIntoView({ behavior: 'smooth' })} className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 py-2.5 text-sm font-medium">
          <i className="fa-solid fa-eye mr-1" /> Aperçu
        </button>
        <button type="button" onClick={() => document.getElementById('paiement')?.scrollIntoView({ behavior: 'smooth' })} className="flex-1 rounded-lg bg-amber-500 text-white py-2.5 text-sm font-semibold">
          <i className="fa-solid fa-lock mr-1" /> Payer {prix} FCFA
        </button>
      </div>
    </div>
  );
}

export { Apercu };
