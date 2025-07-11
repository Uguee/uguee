import L from 'leaflet';
import accidenteIcon from '@/assets/icons/accidente.png';
import roboIcon from '@/assets/icons/robo.png';
import viaCerradaIcon from '@/assets/icons/via-cerrada.png';
import huecoIcon from '@/assets/icons/hueco.png';
import policiaIcon from '@/assets/icons/policia.png';
import emergenciaIcon from '@/assets/icons/emergencia.png';
import obstaculoIcon from '@/assets/icons/obstaculo.png';
import otroIcon from '@/assets/icons/otro.png';

export const iconosIncidente = {
  'accidente': L.icon({
    iconUrl: accidenteIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'robo': L.icon({
    iconUrl: roboIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'vía cerrada': L.icon({
    iconUrl: viaCerradaIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'hueco en la vía': L.icon({
    iconUrl: huecoIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'presencia policial': L.icon({
    iconUrl: policiaIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'emergencia': L.icon({
    iconUrl: emergenciaIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'obstáculo en la vía': L.icon({
    iconUrl: obstaculoIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'otro': L.icon({
    iconUrl: otroIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
} as const; 