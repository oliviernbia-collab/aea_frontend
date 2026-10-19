import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import useLiveRefresh from '../hooks/useLiveRefresh';
import CarteRectoVerso, { anneeAcademiqueParDefaut, declencherTelechargement } from '../components/CarteRectoVerso';
import { ROLE_LABELS } from '../constants/roles';

const CARD_W_MM = 85.6;
const CARD_H_MM = 54;

function attendreRendu() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

export default function Cartes() {
  const { showToast } = useToast();
  const [membres, setMembres] = useState([]);
  const [q, setQ] = useState('');
  const [statut, setStatut] = useState('');
  const [chargement, setChargement] = useState(true);
  const [captureUser, setCaptureUser] = useState(null);
  const [export_, setExport_] = useState(null); // { type: 'image'|'pdf', current, total }
  const rectoRef = useRef(null);
  const versoRef = useRef(null);
  const anneeAcademique = anneeAcademiqueParDefaut();

  const charger = async () => {
    setChargement(true);
    try {
      const { data } = await api.get('/membres', { params: statut ? { statut } : {} });
      setMembres(data);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statut]);

  useLiveRefresh('membres:update', charger);

  const filtres = membres.filter((m) => {
    if (!q) return true;
    const cible = `${m.prenom} ${m.nom} ${m.numero_membre}`.toLowerCase();
    return cible.includes(q.toLowerCase());
  });

  // Capture le recto+verso d'un membre en montant temporairement sa carte dans
  // le conteneur hors-ecran, en attendant le rendu (logo + photo) avant la capture.
  const capturer = async (membre) => {
    setCaptureUser(membre);
    await attendreRendu();
    await new Promise((r) => setTimeout(r, 200));
    const rectoUrl = await toPng(rectoRef.current, { pixelRatio: 3, cacheBust: true });
    const versoUrl = await toPng(versoRef.current, { pixelRatio: 3, cacheBust: true });
    return { rectoUrl, versoUrl };
  };

  const telechargerUnMembre = async (membre) => {
    try {
      const { rectoUrl, versoUrl } = await capturer(membre);
      declencherTelechargement(rectoUrl, `badge-aea-${membre.numero_membre}-recto.png`);
      await new Promise((r) => setTimeout(r, 300));
      declencherTelechargement(versoUrl, `badge-aea-${membre.numero_membre}-verso.png`);
    } catch {
      showToast(`Erreur lors de la génération de la carte de ${membre.prenom} ${membre.nom}.`, 'erreur');
    } finally {
      setCaptureUser(null);
    }
  };

  const telechargerToutEnImages = async () => {
    if (!filtres.length) return;
    if (!window.confirm(`Télécharger ${filtres.length * 2} images (recto + verso de ${filtres.length} membres) ?`)) return;
    setExport_({ type: 'image', current: 0, total: filtres.length });
    try {
      for (let i = 0; i < filtres.length; i++) {
        const m = filtres[i];
        setExport_({ type: 'image', current: i + 1, total: filtres.length });
        const { rectoUrl, versoUrl } = await capturer(m);
        declencherTelechargement(rectoUrl, `badge-aea-${m.numero_membre}-recto.png`);
        await new Promise((r) => setTimeout(r, 300));
        declencherTelechargement(versoUrl, `badge-aea-${m.numero_membre}-verso.png`);
        await new Promise((r) => setTimeout(r, 300));
      }
      showToast('Toutes les cartes ont été téléchargées en images.', 'succes');
    } catch {
      showToast("Erreur lors de l'export des images.", 'erreur');
    } finally {
      setCaptureUser(null);
      setExport_(null);
    }
  };

  const telechargerToutEnPdf = async () => {
    if (!filtres.length) return;
    setExport_({ type: 'pdf', current: 0, total: filtres.length });
    try {
      const pdf = new jsPDF({ unit: 'mm', format: [CARD_W_MM, CARD_H_MM] });
      for (let i = 0; i < filtres.length; i++) {
        const m = filtres[i];
        setExport_({ type: 'pdf', current: i + 1, total: filtres.length });
        const { rectoUrl, versoUrl } = await capturer(m);
        if (i > 0) pdf.addPage([CARD_W_MM, CARD_H_MM]);
        pdf.addImage(rectoUrl, 'PNG', 0, 0, CARD_W_MM, CARD_H_MM);
        pdf.addPage([CARD_W_MM, CARD_H_MM]);
        pdf.addImage(versoUrl, 'PNG', 0, 0, CARD_W_MM, CARD_H_MM);
      }
      pdf.save(`cartes-aea-${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast('PDF généré.', 'succes');
    } catch {
      showToast('Erreur lors de la génération du PDF.', 'erreur');
    } finally {
      setCaptureUser(null);
      setExport_(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cartes des membres</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aperçu de la carte (recto/verso) de chaque membre, téléchargeable en image ou regroupée en PDF.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={telechargerToutEnImages}
            disabled={!!export_ || !filtres.length}
            className="rounded-lg bg-slate-700 text-white px-4 py-2 text-sm disabled:opacity-60"
          >
            <i className="fa-solid fa-images mr-1" />
            {export_?.type === 'image' ? `Export ${export_.current}/${export_.total}...` : 'Tout en images'}
          </button>
          <button
            onClick={telechargerToutEnPdf}
            disabled={!!export_ || !filtres.length}
            className="rounded-lg bg-blue-800 text-white px-4 py-2 text-sm disabled:opacity-60"
          >
            <i className="fa-solid fa-file-pdf mr-1" />
            {export_?.type === 'pdf' ? `Export ${export_.current}/${export_.total}...` : 'Tout en PDF'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un membre..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
        >
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="suspendu">Suspendu</option>
          <option value="honoraire">Honoraire</option>
          <option value="en_attente">En attente</option>
        </select>
      </div>

      {chargement ? (
        <p className="text-sm text-slate-400">Chargement...</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtres.map((m) => (
            <div key={m.id} className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow flex items-center gap-3">
              {m.photo ? (
                <img src={m.photo} alt={m.prenom} className="w-12 h-12 rounded-full object-cover shrink-0" />
              ) : (
                <i className="fa-solid fa-circle-user text-4xl text-slate-300 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{m.prenom} {m.nom}</p>
                <p className="text-xs text-slate-400">{m.numero_membre}</p>
                <p className="text-xs text-slate-400 truncate">{ROLE_LABELS[m.role] || m.role}</p>
              </div>
              <button
                onClick={() => telechargerUnMembre(m)}
                disabled={!!export_ || (captureUser && captureUser.id === m.id)}
                title="Télécharger la carte (recto + verso)"
                className="shrink-0 rounded-lg border border-slate-300 dark:border-slate-600 w-9 h-9 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-60"
              >
                {captureUser && captureUser.id === m.id ? (
                  <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                ) : (
                  <i className="fa-solid fa-download text-xs" />
                )}
              </button>
            </div>
          ))}
          {filtres.length === 0 && <p className="text-sm text-slate-400">Aucun membre trouvé.</p>}
        </div>
      )}

      {/* Zone de capture hors-ecran : une seule carte montee a la fois pour generer
          les images/PDF sans alourdir le DOM avec une centaine de cartes rendues. */}
      {captureUser && (
        <div style={{ position: 'fixed', top: 0, left: -10000, pointerEvents: 'none' }}>
          <CarteRectoVerso
            user={captureUser}
            nom={captureUser.nom}
            prenom={captureUser.prenom}
            anneeAcademique={anneeAcademique}
            photoSrc={captureUser.photo || null}
            rectoRef={rectoRef}
            versoRef={versoRef}
          />
        </div>
      )}
    </div>
  );
}
