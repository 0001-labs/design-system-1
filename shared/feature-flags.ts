import type { FlagDefinitions } from './feature-flags-runtime/index';

export const FEATURE_FLAGS: FlagDefinitions = {
  'consistency-ask': {label:'Ask in Consistency',description:'Shared Ask throughout the app and test editor; owner-first questions and page drafts.',defaultEnabled:false},
  'consistency-email-flows': {label:'Email flows in Consistency',description:'The email flow designer in a site’s Emails place: flows, their timing and each email per language. Owner first; nothing is sent yet.',defaultEnabled:false},
  'base-live-editing': {
    label: 'Live base editing',
    description: 'The owner edits the base system on designsystem1.com; each save is live in products that link /ds1/base/latest.css.',
    defaultEnabled: false,
  },
  'consistency-component-routing': {
    label: 'Component routing',
    description: 'Use bounded decisions for existing components in the private editor. Other requests use the writing model.',
    defaultEnabled: false,
  },
};
