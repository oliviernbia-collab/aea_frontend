import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

export default function Messagerie() {
  const { user, isBureau } = useAuth();
  const [onglet, setOnglet] = useState('bureau');
  const [conversations, setConversations] = useState([]);
  const [membres, setMembres] = useState([]);
  const [contactActif, setContactActif] = useState(null);
  const [messagesPrives, setMessagesPrives] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [texte, setTexte] = useState('');
  const finListe = useRef(null);

  const chargerConversations = async () => {
    const { data } = await api.get('/messages/conversations');
    setConversations(data);
  };
  const chargerBroadcasts = async () => {
    const { data } = await api.get('/messages/broadcast');
    setBroadcasts(data);
  };
  const chargerMembres = async () => {
    const { data } = await api.get('/membres', { params: { statut: 'actif' } });
    setMembres(data.filter((m) => m.id !== user.id));
  };

  useEffect(() => {
    chargerConversations();
    chargerBroadcasts();
    chargerMembres();

    const socket = getSocket();
    const onPrive = (msg) => {
      setContactActif((c) => {
        if (c && (msg.expediteur_id === c.id || msg.destinataire_id === c.id)) {
          setMessagesPrives((prev) => [...prev, msg]);
        }
        return c;
      });
      chargerConversations();
    };
    const onBroadcast = () => chargerBroadcasts();
    socket?.on('message:prive', onPrive);
    socket?.on('message:broadcast', onBroadcast);
    return () => {
      socket?.off('message:prive', onPrive);
      socket?.off('message:broadcast', onBroadcast);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    finListe.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesPrives, broadcasts]);

  const ouvrirConversation = async (contact) => {
    setContactActif(contact);
    setOnglet('prive');
    const { data } = await api.get(`/messages/prive/${contact.id}`);
    setMessagesPrives(data);
  };

  const envoyerPrive = async (e) => {
    e.preventDefault();
    if (!texte.trim() || !contactActif) return;
    const { data } = await api.post('/messages/prive', { destinataire_id: contactActif.id, contenu: texte });
    setMessagesPrives((prev) => [...prev, data]);
    setTexte('');
    chargerConversations();
  };

  const envoyerBroadcast = async (e) => {
    e.preventDefault();
    if (!texte.trim()) return;
    await api.post('/messages/broadcast', { contenu: texte });
    setTexte('');
    chargerBroadcasts();
  };

  const contacts = [...new Map([...conversations, ...membres].map((c) => [c.id, c])).values()];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
      <div className="rounded-xl bg-white dark:bg-slate-800 shadow flex flex-col overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-700">
          <button onClick={() => setOnglet('bureau')} className={`flex-1 py-2 text-sm font-medium ${onglet === 'bureau' ? 'text-blue-800 dark:text-blue-300 border-b-2 border-blue-800' : 'text-slate-400'}`}>
            Bureau
          </button>
          <button onClick={() => setOnglet('prive')} className={`flex-1 py-2 text-sm font-medium ${onglet === 'prive' ? 'text-blue-800 dark:text-blue-300 border-b-2 border-blue-800' : 'text-slate-400'}`}>
            Privés
          </button>
        </div>
        {onglet === 'prive' && (
          <div className="flex-1 overflow-y-auto">
            {contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => ouvrirConversation(c)}
                className={`w-full flex items-center gap-2 px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-50 dark:border-slate-700/50 ${
                  contactActif?.id === c.id ? 'bg-blue-50 dark:bg-slate-700' : ''
                }`}
              >
                <i className="fa-solid fa-circle-user text-xl text-slate-400" />
                <span>{c.prenom} {c.nom}</span>
              </button>
            ))}
            {contacts.length === 0 && <p className="p-4 text-sm text-slate-400">Aucun contact.</p>}
          </div>
        )}
      </div>

      <div className="md:col-span-2 rounded-xl bg-white dark:bg-slate-800 shadow flex flex-col overflow-hidden">
        {onglet === 'bureau' ? (
          <>
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 font-semibold">Messages du bureau</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {broadcasts.map((b) => (
                <div key={b.id} className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3">
                  <p className="text-xs text-slate-400">{b.auteur_prenom} {b.auteur_nom} - {new Date(b.created_at).toLocaleString('fr-FR')}</p>
                  <p className="text-sm mt-1">{b.contenu}</p>
                </div>
              ))}
              {broadcasts.length === 0 && <p className="text-sm text-slate-400">Aucun message du bureau.</p>}
              <div ref={finListe} />
            </div>
            {isBureau && (
              <form onSubmit={envoyerBroadcast} className="flex gap-2 p-3 border-t border-slate-100 dark:border-slate-700">
                <input value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Message à tous les membres..." className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-sm" />
                <button type="submit" className="rounded-lg bg-blue-800 text-white px-4"><i className="fa-solid fa-paper-plane" /></button>
              </form>
            )}
          </>
        ) : contactActif ? (
          <>
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 font-semibold">{contactActif.prenom} {contactActif.nom}</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messagesPrives.map((m) => (
                <div key={m.id} className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.expediteur_id === user.id ? 'ml-auto bg-blue-800 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  {m.contenu}
                </div>
              ))}
              <div ref={finListe} />
            </div>
            <form onSubmit={envoyerPrive} className="flex gap-2 p-3 border-t border-slate-100 dark:border-slate-700">
              <input value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Écrire un message..." className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-sm" />
              <button type="submit" className="rounded-lg bg-blue-800 text-white px-4"><i className="fa-solid fa-paper-plane" /></button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Sélectionnez un contact.</div>
        )}
      </div>
    </div>
  );
}
