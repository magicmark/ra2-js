import { install as audit } from '../map-visual-audit/browser-capture.js';

export const install = () => audit({
  revision: 'ra2-js-6lv road repair',
  views: {
    training: [[23,30,'restored crossing'], [33,30,'dry lake causeway'], [23,22,'full northern road'], [23,38,'full southern road']],
    'ironwood-crossing': [[127,95,'full-width paved entrance'], [95,132,'southern apron without stub'], [95,95,'continuous crossing'], [139,95,'preserved east cap']],
    'slatewater-reach': [[95,135,'base entrance without strip'], [119,95,'connected inlet approach'], [95,57,'full coastal road'], [131,95,'paved approach to east cap']],
    'tidal-crown': [[95,136,'base entrance without strip'], [123,95,'deliberate paved tech entrance'], [95,95,'continuous crossing'], [137,95,'preserved east cap']],
  },
});
