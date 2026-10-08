import logoWave from '../assets/pay-wave.png';
import logoMtnMomo from '../assets/pay-mtn-momo.svg';
import logoOrangeMoney from '../assets/pay-orange-money.svg';
import logoMoovMoney from '../assets/pay-moov-money.png';

// Catalogue unique des operateurs Mobile Money geres par la plateforme : utilise a la fois
// par la fiche de cotisation du membre (choix de l'operateur + numero de reception) et par
// la page Administration (saisie des numeros de reception de l'association).
// `value` reprend les codes operateur de l'agregateur Jeko (wave/orange/mtn/moov), utilises
// tels quels par /api/cotisations/paiement-en-ligne.
export const MOYENS_PAIEMENT = [
  { value: 'wave', label: 'Wave', logo: logoWave, configKey: 'numero_wave' },
  { value: 'mtn', label: 'MTN MoMo', logo: logoMtnMomo, configKey: 'numero_mtn_momo' },
  { value: 'orange', label: 'Orange Money', logo: logoOrangeMoney, configKey: 'numero_orange_money' },
  { value: 'moov', label: 'Moov Money', logo: logoMoovMoney, configKey: 'numero_moov_money' },
];
