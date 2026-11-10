/** The owner's documentation catalogue. Visibility changes listings, not example URLs. */
export const DOC_EXAMPLES = [
  ['issues', 'Issue tracker'],
  ['settings', 'General settings'], ['shop', 'Shop'], ['planner', 'Planning app'],
  ['finance', 'Finance app'], ['product', 'Product showcase'], ['booking', 'Booking site'],
  ['canvas', 'Design tool'], ['agency', 'Design studio'], ['pricing', 'Packages and prices'], ['pricing-ja', 'Packages and prices · Japanese'], ['nook', 'Private workspace'],
  ['birdie', 'Birdie'], ['birdie-discover', 'Birdie · Discover'], ['birdie-species', 'Birdie · Species'], ['birdie-place', 'Birdie · Place'],
  ['birdie-watcher', 'Birdie · Watcher'], ['birdie-notes', 'Birdie · Field notes'], ['birdie-story', 'Birdie · Story'],
  ['speaker', 'Speaker launch'], ['bike', 'Bike maker'],
  ['festival', 'Festival'], ['platform', 'Developer platform'], ['magazine', 'Travel magazine'],
  ['travel', 'Travel stays'], ['cafe', 'Café'], ['trails', 'Walking log'], ['console', 'Deploy console'],
  ['sidebar', 'Sidebar'], ['split', 'List and detail'], ['inspector', 'Inspector'],
  ['column', 'Column'], ['centered', 'Centred'], ['tiles', 'Tiles'],
  ['financial', 'Financial services'],
  ['html-article', 'HTML · Article'], ['html-form', 'HTML · Form'],
  ['html-report', 'HTML · Report'], ['html-reference', 'HTML · Reference'],
].map(([id, label]) => ({ id: id!, label: label!, defaultEnabled: id !== 'financial',
  href: id!.startsWith('html-') ? `/examples/files/${id!.slice(5)}.html` : `/examples/layouts/${id}/` }));
