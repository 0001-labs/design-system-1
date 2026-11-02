import { configureI18n } from '../../../DS1/0-face/i18n';
import '../../../DS1/0-face/theme';
import { startScaling } from '../../../DS1/0-face/scaling';
configureI18n({ languages: ['en'], autoLoad: false, sharedWords: true });
startScaling();

// The Feedback loop and the contrast watch, after the page has loaded and gone idle; a stale part reloads at once.
import { startFeedback } from './feedback';
startFeedback();

import {installGlobalAsk} from './ask-runtime';
installGlobalAsk();

import {installAppCursor} from './app-cursor';
installAppCursor();
