import type { LayoutExample } from './layout-examples';
import { library, text } from './library-example-parts';

// A one-person studio's fixed prices in the Tally library: night bands, big headings, three
// package cards standing level, plain lists and a page of questions. The look is the library's;
// this page holds only where things stand.

const composition = `<style>
.pricing-wrap { box-sizing:border-box; width:100%; max-width:calc(60 * var(--ds-unit)); margin-inline:auto; padding-inline:var(--ds-unit); min-width:0; }
.pricing-header { display:block; max-width:calc(60 * var(--ds-unit)); margin-inline:auto; }
.pricing-hero { padding-block:calc(3.5 * var(--ds-unit)) calc(5 * var(--ds-unit)); }
.pricing-hero .pricing-title { max-width:calc(30 * var(--ds-unit)); }
.pricing-hero .pricing-lead { max-width:calc(20 * var(--ds-unit)); margin-block-start:var(--ds-unit); }
.pricing-plans { padding-block-end:calc(5 * var(--ds-unit)); }
.pricing-cards { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--ds-unit); }
.pricing-cards > ds-card { min-width:0; }
.pricing-plan { display:flex; flex-direction:column; flex:1; min-height:100%; min-width:0; }
.pricing-plan > * + * { margin-block-start:calc(0.5 * var(--ds-unit)); }
.pricing-facts { display:flex; flex-wrap:wrap; gap:0 calc(0.5 * var(--ds-unit)); }
.pricing-plan > ul[data-list="dots"] { margin-block-start:var(--ds-unit); padding-block-start:calc(0.5 * var(--ds-unit)); border-block-start:1px solid var(--ds-border-color); }
.pricing-addon { padding-block-start:var(--ds-unit); margin-block-start:var(--ds-unit); border-block-start:1px solid var(--ds-border-color); }
.pricing-addon > * + * { margin-block-start:calc(0.5 * var(--ds-unit)); }
.pricing-addon-head { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:baseline; gap:0 calc(0.5 * var(--ds-unit)); }
.pricing-foot { display:grid; gap:var(--ds-unit); margin-block-start:auto; padding-block-start:var(--ds-unit); }
.pricing-foot ds-button { --ds-button-inline-size:100%; --ds-button-align:center; }
.pricing-foot a, .pricing-note a { color:inherit; font-weight:600; text-underline-offset:calc(3px * var(--ds-sf, 1)); }
.pricing-section { padding-block:calc(7 * var(--ds-unit)); }
.pricing-section > .pricing-wrap { display:grid; grid-template-columns:minmax(0,1fr); gap:calc(1.5 * var(--ds-unit)); }
.pricing-section[data-band] > .pricing-wrap { gap:var(--ds-unit); }
.pricing-needs { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 calc(2 * var(--ds-unit)); margin:0; border-block-start:1px solid var(--ds-text-color); }
.pricing-needs > div { padding-block:var(--ds-unit) calc(17px * var(--ds-sf, 1)); border-block-end:1px solid var(--ds-border-color); }
.pricing-needs dt, .pricing-needs dd { margin:0; }
.pricing-subs { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:var(--ds-unit); }
.pricing-sub { display:grid; gap:calc(0.5 * var(--ds-unit)); align-content:start; min-width:0; }
.pricing-sub > ul { margin-block-start:calc(0.5 * var(--ds-unit)); }
.pricing-terms { padding-block:calc(3.5 * var(--ds-unit)); border-block-end:1px solid var(--ds-fill); }
.pricing-terms > .pricing-wrap { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--ds-unit); }
.pricing-terms p { margin:0; }
.pricing-questions { border-block-start:1px solid var(--ds-text-color); }
.pricing-closing { padding-block:calc(5 * var(--ds-unit)); }
.pricing-closing > .pricing-wrap { display:grid; justify-items:start; gap:var(--ds-unit); }
.pricing-closing .pricing-title { max-width:calc(30 * var(--ds-unit)); }
.pricing-closing ds-button { --ds-button-inline-size:calc(17 * var(--ds-unit)); --ds-button-align:center; max-width:100%; }
@media(max-width:899px) {
 .pricing-cards, .pricing-subs { grid-template-columns:minmax(0,1fr); }
}
@media(max-width:600px) {
 .pricing-section { padding-block:calc(4 * var(--ds-unit)); }
 .pricing-hero { padding-block:var(--ds-unit) calc(2 * var(--ds-unit)); }
 .pricing-plans { padding-block-end:calc(4 * var(--ds-unit)); }
 .pricing-needs, .pricing-terms > .pricing-wrap { grid-template-columns:minmax(0,1fr); }
 .pricing-closing ds-button { --ds-button-inline-size:100%; }
 .pricing-closing { padding-block:calc(4 * var(--ds-unit)); }
}
</style>`;

const type = (role: string, words: string, attrs = '') => text(words, `data-type="${role}" wrap ${attrs}`);
const heading = (role: string, words: string, level: number, extra = '') => type(role, words, `role="heading" aria-level="${level}" ${extra}`);
const dots = (items: string[]) => `<ul data-list="dots">${items.map(item => item.startsWith('*') ? `<li data-strong>${item.slice(1)}</li>` : `<li>${item}</li>`).join('')}</ul>`;
const rules = (items: string[]) => `<ul data-list="rules">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
const book = `<ds-button primary data-size="large" href="#book"><span>Book 15 minutes</span></ds-button>`;

const plan = (tone: string, name: string, price: string, audience: string, days: string, rounds: string, items: string[], demo: string) => `<ds-card data-plan="${tone}"><div class="pricing-plan">
  ${heading('name', name, 2)}
  ${type('price', price)}
  ${type('body', audience)}
  <div class="pricing-facts">${type('small', days, 'strong')}${type('small', rounds, 'tone="muted"')}</div>
  ${dots(items)}
  <div class="pricing-foot"><p class="pricing-note" style="margin:0">${type('small', demo, 'tone="muted"')}</p>${book}</div>
</div></ds-card>`;

const addon = (name: string, price: string, audience: string, items: string[], days: string) => `<div class="pricing-addon">
  <div class="pricing-addon-head">${heading('name', name, 3, 'data-heavy')}${type('name', price)}</div>
  ${type('body', audience)}
  ${dots(items)}
  ${type('small', days, 'strong')}
</div>`;

const need = (name: string, words: string) => `<div><dt>${type('subhead', name)}</dt><dd>${type('body', words, 'tone="muted"')}</dd></div>`;
const sub = (name: string, price: string, items: string[]) => `<ds-card data-plan="sheet"><div class="pricing-sub">${heading('title', name, 3)}${type('fee', price)}${rules(items)}</div></ds-card>`;
const term = (name: string, words: string) => `<div>${type('body', name, 'strong')}${type('body', words, 'tone="muted"')}</div>`;
const question = (words: string, answer: string) => `<ds-accordion icon="plus" data-size="large">${type('question', words, 'slot="summary"')}${type('body', answer, 'slot="details" tone="muted"')}</ds-accordion>`;

const QUESTIONS = [
  ['Do the prices include VAT?', 'No. Every price on this page excludes VAT, which is added to the invoice.'],
  ['Who owns the shop?', 'You do. The shop is built on your own account and is yours from the day it opens.'],
  ['Is the platform’s monthly fee included?', 'No. You pay your shop platform directly, and I help you choose the plan that fits.'],
  ['How do I pay?', 'Half when you order, and the rest before the shop opens.'],
  ['How fast will the shop be ready?', 'Start takes 7 working days and Grow takes 12, counted from the day your deposit is paid and I have everything.'],
  ['What if I want changes?', 'Start includes one round of changes and Grow includes two. Anything beyond that is priced before I begin.'],
  ['I already have a shop. Can you move it?', 'Yes. Moving is an add-on that brings across your products, your customer list and your old addresses.'],
  ['Can you improve the shop I already have?', 'Often, yes. Book 15 minutes and we will look at it together.'],
  ['Can my shop sell subscriptions?', 'Yes. Subscriptions are part of Grow, so customers can keep buying without coming back to order.'],
  ['What happens once the shop is open?', 'You can run it yourself, or choose Care, which keeps it updated and checked every month.'],
  ['What is the first-customer discount?', 'The first three customers get 20% off, in return for letting me show the shop as a case.'],
  ['Which package should I choose?', 'Choose Start for a few products, and Grow for a larger range or subscriptions. If you are unsure, ask me.'],
];

export const PRICING_EXAMPLE: LayoutExample = {
  name: 'Packages and prices',
  use: 'A fixed-price service page in the Tally library: night bands, three package cards, big headings over plain lists, and a page of questions.',
  height: 900,
  library: library('tally'),
  html: `${composition}<div data-band="night" id="top">
<ds-header class="pricing-header" data-links="end" label="Main"><a slot="brand" data-wordmark href="#top">plain<b>shop</b></a><a href="#packages">Packages</a><a href="#send">What you send</a><a href="#after">After launch</a><a href="#questions">Questions</a><ds-button slot="actions" href="#book"><span>Book 15 min.</span></ds-button></ds-header>
<section class="pricing-hero"><div class="pricing-wrap">
  ${heading('hero', 'Packages and prices.', 1, 'class="pricing-title"')}
  ${type('body', 'One fixed price for the whole shop. No hourly rates, no surprises. All prices exclude VAT.', 'tone="muted" class="pricing-lead"')}
</div></section>
<section class="pricing-plans" id="packages"><div class="pricing-wrap"><div class="pricing-cards">
  ${plan('night', 'Start', '€2,900', 'For a single product or a small range, up to five.', '7 working days', '1 round of changes', ['Theme in your brand', 'Home page and one strong product page', 'Card and mobile payments', 'Shipping', 'Legal pages', 'Checked on phones', '30-minute handover'], 'See the demo: <a href="#fern">Fern</a>')}
  ${plan('paper', 'Grow', '€5,900', 'For up to 50 products, or for selling subscriptions.', '12 working days', '2 rounds of changes', ['*Everything in Start', 'Collections', 'Filters', 'Free-shipping bar', 'Upsells', 'One build-your-own feature', 'Subscriptions, so customers buy again', 'Discount codes', 'Newsletter'], 'See the demos: <a href="#harbour">Harbour</a> and <a href="#mill">Mill</a>')}
  <ds-card data-plan="accent"><div class="pricing-plan">
    ${heading('name', 'Add-ons', 2)}
    ${type('body', 'Add to either package.')}
    ${addon('Ads ready', '+€2,900', 'For running ads from day one.', ['Ad pixels and server events', 'Analytics set up', 'Tested events, so you can see what the ads sell', 'Product copy written for ads, up to five products', 'Three ad texts and one video script', 'An ad plan for the first 30 days'], '+3 working days')}
    ${addon('Moving', '+€1,500', 'For a shop that already lives somewhere else.', ['Products, variants and images, up to 100 products', 'Your customer list', 'Old addresses forwarded, so search engines and customers find the new shop'], '+3 working days')}
    <div class="pricing-foot">${book}</div>
  </div></ds-card>
</div></div></section>
</div>
<main>
<section class="pricing-section" id="send"><div class="pricing-wrap">
  ${heading('display', 'What you send.', 2)}
  <dl class="pricing-needs">
    ${need('Logo', 'PNG or SVG if you can. No logo yet? I will set your name in a typeface that suits you.')}
    ${need('Photos', 'At least three of each product, sharp and in daylight. A new phone takes fine pictures.')}
    ${need('Products', 'Name, price, variants such as size and colour, weight and stock. For Grow, in one spreadsheet.')}
    ${need('Words', 'For Start, a few lines about each product and I will finish them. For Grow, finished product texts, and I will write the home page and the collections.')}
    ${need('About you', 'Three to five lines on who you are and why you sell what you sell.')}
    ${need('Shipping and rules', 'Which carriers and prices you want, your returns policy and your company details for the legal pages.')}
    ${need('Access', 'I set up the shop myself. If you have a domain or an old shop, I will need access to them.')}
  </dl>
  ${type('body', 'Delivery time starts the day your deposit is paid and I have everything.', 'tone="muted"')}
</div></section>
<section class="pricing-section" data-band="quiet" id="after"><div class="pricing-wrap">
  ${heading('display', 'After launch.', 2)}
  <div class="pricing-subs">
    ${sub('Care', '€190/month', ['Theme and app updates', 'Small changes to words, pictures and prices, up to one hour a month', 'Basket, payment and shipping checked every month', 'An answer within one working day'])}
    ${sub('Care + Growth', '€390/month', ['Everything in Care', 'A look at your sales every month: where do customers drop off?', 'One improvement a month, such as the product page, the basket or an offer, up to three hours in all'])}
  </div>
  ${type('body', 'No lock-in. You can also run the shop yourself.', 'tone="muted"')}
</div></section>
<section class="pricing-terms"><div class="pricing-wrap">
  ${term('Payment', 'Half when you order. The rest before the shop opens.')}
  ${term('Ownership', 'The shop is handed over before it opens, so it is entirely yours.')}
  ${term('First customers', 'The first three get 20% off, in return for letting me show the shop as a case.')}
</div></section>
<section class="pricing-section" id="questions"><div class="pricing-wrap">
  ${heading('display', 'Questions.', 2)}
  <div class="pricing-questions">${QUESTIONS.map(([words, answer]) => question(words!, answer!)).join('')}</div>
</div></section>
</main>
<div data-band="night">
<section class="pricing-closing" id="book"><div class="pricing-wrap">
  ${heading('closing', 'Not sure which package fits?', 2, 'class="pricing-title"')}
  ${book}
</div></section>
<ds-footer brand="plainshop" tagline="Online shops at a fixed price" literal year="2026" columns='[{"heading":"Site","links":[{"label":"Packages","href":"#packages"},{"label":"What you send","href":"#send"},{"label":"After launch","href":"#after"},{"label":"Questions","href":"#questions"}]}]' policies='[{"label":"Terms","href":"#terms"},{"label":"Privacy","href":"#privacy"}]'><span slot="legal">VAT 12 34 56 78</span></ds-footer>
</div>`,
};
