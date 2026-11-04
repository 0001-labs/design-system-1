import type { LayoutExample } from './layout-examples';
import { library, text } from './library-example-parts';

// A one-person studio's fixed prices in the Tally library: night bands, big headings, three
// package cards standing level, plain lists and a page of questions. The look is the library's;
// this page holds only where things stand.

const composition = `<style>
/* The page stands centred, so the grid starts where the page does: a percentage here counts the
   area less one tile, hence the half square back. Below sixty squares the page fills and the
   grid keeps the left edge. */
:root { --ds-grid-origin-x:max(0px, calc(50% + 0.5 * var(--ds-unit) - 30 * var(--ds-unit))); }
.pricing-wrap { box-sizing:border-box; width:100%; max-width:calc(60 * var(--ds-unit)); margin-inline:auto; padding-inline:var(--ds-unit); min-width:0; }
.pricing-header { display:block; max-width:calc(60 * var(--ds-unit)); margin-inline:auto; }
.pricing-hero { padding-block:calc(3.5 * var(--ds-unit)) calc(5 * var(--ds-unit)); }
.pricing-hero .pricing-title { max-width:calc(30 * var(--ds-unit)); }
.pricing-hero [lang='ja'] .pricing-title, [lang='ja'] .pricing-hero .pricing-title { max-width:none; }
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
const need = (name: string, words: string) => `<div><dt>${type('subhead', name)}</dt><dd>${type('body', words, 'tone="muted"')}</dd></div>`;
const sub = (name: string, price: string, items: string[]) => `<ds-card data-plan="sheet"><div class="pricing-sub">${heading('title', name, 3)}${type('fee', price)}${rules(items)}</div></ds-card>`;
const term = (name: string, words: string) => `<div>${type('body', name, 'strong')}${type('body', words, 'tone="muted"')}</div>`;
const question = (words: string, answer: string) => `<ds-accordion icon="plus" data-size="large">${type('question', words, 'slot="summary"')}${type('body', answer, 'slot="details" tone="muted"')}</ds-accordion>`;

interface Plan { name: string; price: string; amount: number; audience: string; days: string; rounds: string; items: string[]; demo: string }
interface Addon { name: string; price: string; audience: string; items: string[]; days: string }
/** Every word of one page: the language changes, where things stand does not. */
interface PricingCopy {
  lang?: string; currency: string; name: string; use: string; book: string; bookShort: string;
  nav: [string, string, string, string]; title: string; lead: string;
  plans: [Plan, Plan]; addonsName: string; addonsLead: string; addons: [Addon, Addon];
  send: string; needs: [string, string][]; sendNote: string;
  after: string; subs: [string, string, string[]][]; afterNote: string;
  terms: [string, string][]; questionsTitle: string; questions: [string, string][]; closing: string;
  tagline: string; site: string; policies: string; legal: string;
}

const page = (copy: PricingCopy) => {
  const book = `<ds-button primary data-size="large" href="#book"><span>${copy.book}</span></ds-button>`;
  const plan = (tone: string, { name, price, audience, days, rounds, items, demo }: Plan) => `<ds-card data-plan="${tone}"><div class="pricing-plan">
  ${heading('name', name, 2)}
  ${type('price', price)}
  ${type('body', audience)}
  <div class="pricing-facts">${type('small', days, 'strong')}${type('small', rounds, 'tone="muted"')}</div>
  ${dots(items)}
  <div class="pricing-foot"><p class="pricing-note" style="margin:0">${type('small', demo, 'tone="muted"')}</p>${book}</div>
</div></ds-card>`;
  const addon = ({ name, price, audience, items, days }: Addon) => `<div class="pricing-addon">
  <div class="pricing-addon-head">${heading('name', name, 3, 'data-heavy')}${type('name', price)}</div>
  ${type('body', audience)}
  ${dots(items)}
  ${type('small', days, 'strong')}
</div>`;
  const [packages, send, after, questions] = copy.nav;
  const content = `<div data-band="night" id="top">
<ds-header class="pricing-header" data-links="end" label="Main"><a slot="brand" data-wordmark href="#top">plain<b>shop</b></a><a href="#packages">${packages}</a><a href="#send">${send}</a><a href="#after">${after}</a><a href="#questions">${questions}</a><ds-button slot="actions" href="#book"><span>${copy.bookShort}</span></ds-button></ds-header>
<section class="pricing-hero"><div class="pricing-wrap">
  ${heading('hero', copy.title, 1, 'class="pricing-title"')}
  ${type('body', copy.lead, 'tone="muted" class="pricing-lead"')}
</div></section>
<section class="pricing-plans" id="packages"><div class="pricing-wrap"><div class="pricing-cards">
  ${plan('night', copy.plans[0])}
  ${plan('paper', copy.plans[1])}
  <ds-card data-plan="accent"><div class="pricing-plan">
    ${heading('name', copy.addonsName, 2)}
    ${type('body', copy.addonsLead)}
    ${copy.addons.map(addon).join('\n    ')}
    <div class="pricing-foot">${book}</div>
  </div></ds-card>
</div></div></section>
</div>
<main>
<section class="pricing-section" id="send"><div class="pricing-wrap">
  ${heading('display', copy.send, 2)}
  <dl class="pricing-needs">
    ${copy.needs.map(([name, words]) => need(name, words)).join('\n    ')}
  </dl>
  ${type('body', copy.sendNote, 'tone="muted"')}
</div></section>
<section class="pricing-section" data-band="quiet" id="after"><div class="pricing-wrap">
  ${heading('display', copy.after, 2)}
  <div class="pricing-subs">
    ${copy.subs.map(([name, price, items]) => sub(name, price, items)).join('\n    ')}
  </div>
  ${type('body', copy.afterNote, 'tone="muted"')}
</div></section>
<section class="pricing-terms"><div class="pricing-wrap">
  ${copy.terms.map(([name, words]) => term(name, words)).join('\n  ')}
</div></section>
<section class="pricing-section" id="questions"><div class="pricing-wrap">
  ${heading('display', copy.questionsTitle, 2)}
  <div class="pricing-questions">${copy.questions.map(([words, answer]) => question(words, answer)).join('')}</div>
</div></section>
</main>
<div data-band="night">
<section class="pricing-closing" id="book"><div class="pricing-wrap">
  ${heading('closing', copy.closing, 2, 'class="pricing-title"')}
  ${book}
</div></section>
<ds-footer brand="plainshop" tagline="${copy.tagline}" literal year="2026" columns='${JSON.stringify([{ heading: copy.site, links: copy.nav.map((label, index) => ({ label, href: ['#packages', '#send', '#after', '#questions'][index] })) }])}' policies='${copy.policies}'><span slot="legal">${copy.legal}</span></ds-footer>
</div>`;
  return `${composition}${copy.lang ? `<div lang="${copy.lang}">${content}</div>` : content}`;
};

const ENGLISH: PricingCopy = {
  currency: 'EUR', name: 'Packages and prices', book: 'Book 15 minutes', bookShort: 'Book 15 min.',
  use: 'A fixed-price service page in the Tally library: night bands, three package cards, big headings over plain lists, and a page of questions.',
  nav: ['Packages', 'What you send', 'After launch', 'Questions'],
  title: 'Packages and prices.', lead: 'One fixed price for the whole shop. No hourly rates, no surprises. All prices exclude VAT.',
  plans: [
    { name: 'Start', price: '€2,900', amount: 2900, audience: 'For a single product or a small range, up to five.', days: '7 working days', rounds: '1 round of changes', items: ['Theme in your brand', 'Home page and one strong product page', 'Card and mobile payments', 'Shipping', 'Legal pages', 'Checked on phones', '30-minute handover'], demo: 'See the demo: <a href="#fern">Fern</a>' },
    { name: 'Grow', price: '€5,900', amount: 5900, audience: 'For up to 50 products, or for selling subscriptions.', days: '12 working days', rounds: '2 rounds of changes', items: ['*Everything in Start', 'Collections', 'Filters', 'Free-shipping bar', 'Upsells', 'One build-your-own feature', 'Subscriptions, so customers buy again', 'Discount codes', 'Newsletter'], demo: 'See the demos: <a href="#harbour">Harbour</a> and <a href="#mill">Mill</a>' },
  ],
  addonsName: 'Add-ons', addonsLead: 'Add to either package.',
  addons: [
    { name: 'Ads ready', price: '+€2,900', audience: 'For running ads from day one.', items: ['Ad pixels and server events', 'Analytics set up', 'Tested events, so you can see what the ads sell', 'Product copy written for ads, up to five products', 'Three ad texts and one video script', 'An ad plan for the first 30 days'], days: '+3 working days' },
    { name: 'Moving', price: '+€1,500', audience: 'For a shop that already lives somewhere else.', items: ['Products, variants and images, up to 100 products', 'Your customer list', 'Old addresses forwarded, so search engines and customers find the new shop'], days: '+3 working days' },
  ],
  send: 'What you send.',
  needs: [
    ['Logo', 'PNG or SVG if you can. No logo yet? I will set your name in a typeface that suits you.'],
    ['Photos', 'At least three of each product, sharp and in daylight. A new phone takes fine pictures.'],
    ['Products', 'Name, price, variants such as size and colour, weight and stock. For Grow, in one spreadsheet.'],
    ['Words', 'For Start, a few lines about each product and I will finish them. For Grow, finished product texts, and I will write the home page and the collections.'],
    ['About you', 'Three to five lines on who you are and why you sell what you sell.'],
    ['Shipping and rules', 'Which carriers and prices you want, your returns policy and your company details for the legal pages.'],
    ['Access', 'I set up the shop myself. If you have a domain or an old shop, I will need access to them.'],
  ],
  sendNote: 'Delivery time starts the day your deposit is paid and I have everything.',
  after: 'After launch.',
  subs: [
    ['Care', '€190/month', ['Theme and app updates', 'Small changes to words, pictures and prices, up to one hour a month', 'Basket, payment and shipping checked every month', 'An answer within one working day']],
    ['Care + Growth', '€390/month', ['Everything in Care', 'A look at your sales every month: where do customers drop off?', 'One improvement a month, such as the product page, the basket or an offer, up to three hours in all']],
  ],
  afterNote: 'No lock-in. You can also run the shop yourself.',
  terms: [['Payment', 'Half when you order. The rest before the shop opens.'], ['Ownership', 'The shop is handed over before it opens, so it is entirely yours.'], ['First customers', 'The first three get 20% off, in return for letting me show the shop as a case.']],
  questionsTitle: 'Questions.',
  questions: [
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
  ],
  closing: 'Not sure which package fits?',
  tagline: 'Online shops at a fixed price', site: 'Site', policies: '[{"label":"Terms","href":"#terms"},{"label":"Privacy","href":"#privacy"}]', legal: 'VAT 12 34 56 78',
};

// Prices stand tax included, as Japan asks of a price shown to consumers, and the keywords people
// search with (ネットショップ制作, ECサイト制作, 費用, 料金, 納期) stand in the headings and questions.
const JAPANESE: PricingCopy = {
  lang: 'ja', currency: 'JPY', name: 'ネットショップ制作の料金', book: '15分の相談を予約', bookShort: '15分相談',
  use: '固定料金のサービスページを日本語で。Tallyライブラリで、夜色の帯、3枚の料金カード、大きな見出し、よくある質問を組みました。',
  nav: ['料金プラン', 'ご用意いただくもの', '公開後のサポート', 'よくある質問'],
  title: 'ネットショップ制作の料金。', lead: 'ショップ一式を固定料金で。時間課金も、追加請求もありません。表示価格はすべて税込です。',
  plans: [
    { name: 'スタート', price: '298,000円', amount: 298000, audience: '商品数が少ないお店に。5商品まで対応します。', days: '7営業日で公開', rounds: '修正1回', items: ['ブランドに合わせたテーマ設定', 'トップページと商品ページ', 'クレジットカードとPayPay決済', '送料の設定', '特定商取引法などの法定ページ', 'スマホ表示の確認', '30分の引き渡し説明'], demo: 'デモを見る:<a href="#fern">Fern</a>' },
    { name: 'グロース', price: '598,000円', amount: 598000, audience: '50商品まで。定期購入を始めたいお店にも。', days: '12営業日で公開', rounds: '修正2回', items: ['*スタートの内容すべて', 'コレクションページ', '絞り込み検索', '送料無料バー', 'おすすめ商品の表示', 'オリジナル機能1つ', '定期購入でリピートを促進', 'クーポン', 'メルマガとLINEの連携'], demo: 'デモを見る:<a href="#harbour">Harbour</a>、<a href="#mill">Mill</a>' },
  ],
  addonsName: 'オプション', addonsLead: 'どちらのプランにも追加できます。',
  addons: [
    { name: '広告スタート', price: '+198,000円', audience: '公開初日から広告を出したい方に。', items: ['MetaピクセルとコンバージョンAPI', 'GA4とGoogle広告のタグ設定', '計測テスト済みで、広告の成果が見える', '広告向けの商品説明文、5商品まで', '広告文3本と動画台本1本', '最初の30日間の広告プラン'], days: '+3営業日' },
    { name: 'ショップ移転', price: '+148,000円', audience: 'BASEやSTORES、WooCommerceなどからの移転に。', items: ['商品、バリエーション、画像、100商品まで', '顧客リスト', '旧URLの転送設定で、検索順位の評価を引き継ぎ'], days: '+3営業日' },
  ],
  send: 'ご用意いただくもの。',
  needs: [
    ['ロゴ', 'PNGかSVGが理想です。ロゴがなければ、お店に合う書体で店名をお作りします。'],
    ['商品写真', '1商品につき3枚以上。明るい場所で撮影したものをお願いします。最近のスマホで十分です。'],
    ['商品情報', '商品名、価格、サイズや色などのバリエーション、重さ、在庫数。グロースは1つの表にまとめてください。'],
    ['文章', 'スタートは各商品の説明を数行いただければ仕上げます。グロースは商品説明をご用意いただき、トップページとコレクションはこちらで書きます。'],
    ['お店の紹介', 'どんな方が、なぜその商品を販売しているのかを3〜5行で。'],
    ['配送とルール', '配送会社と送料、返品条件、特定商取引法の表記に載せる事業者情報。'],
    ['アカウント', 'ショップはこちらで開設します。ドメインや既存のショップがあれば、ログイン情報をご共有ください。'],
  ],
  sendNote: '納期は、着手金のお支払いとご用意いただくものがそろった日から数えます。',
  after: '公開後のサポート。',
  subs: [
    ['保守', '19,800円/月', ['テーマとアプリの更新', '文章、画像、価格の小さな修正、月1時間まで', 'カート、決済、配送の動作確認を毎月', '1営業日以内にお返事']],
    ['保守+改善', '39,800円/月', ['保守の内容すべて', '毎月の売上分析:お客様はどこで離脱しているか', '商品ページ、カート、キャンペーンなどの改善を月1回、合計3時間まで']],
  ],
  afterNote: '契約期間の縛りはありません。ご自身での運営も可能です。',
  terms: [['お支払い', '着手金として50%、残りはショップ公開前に。'], ['所有権', 'ショップは公開前にお引き渡しするので、すべてお客様のものです。'], ['先着特典', '先着3名様は20%オフ。その代わり、制作事例として掲載させてください。']],
  questionsTitle: 'よくある質問。',
  questions: [
    ['ネットショップ制作の費用相場はいくらですか?', '基本機能のみの小規模なショップで30万〜100万円が一般的な目安です。こちらはプランごとの固定料金で、スタートは税込298,000円からです。'],
    ['料金は税込ですか?', 'はい。このページの価格はすべて税込です。'],
    ['制作費のほかに毎月かかる費用はありますか?', 'ショッププラットフォームの月額料金と決済手数料はお客様のご負担です。保守は任意で、必要な場合のみご契約いただけます。'],
    ['ECサイトの制作期間はどれくらいですか?', 'スタートは7営業日、グロースは12営業日です。着手金のお支払いと、ご用意いただくものがそろった日から数えます。'],
    ['どのプラットフォームで作りますか?', '主にShopifyで構築します。ご希望があれば、最初の相談でお聞かせください。'],
    ['ショップの所有権は誰にありますか?', 'お客様です。お客様のアカウントで構築し、公開時点からすべてお客様のものになります。'],
    ['支払い方法を教えてください。', 'ご注文時に50%、残りをショップ公開前にお支払いいただきます。'],
    ['修正は何回までできますか?', 'スタートは1回、グロースは2回です。それを超える場合は、作業前にお見積もりをお伝えします。'],
    ['BASEやSTORESから移転できますか?', 'はい。ショップ移転のオプションで、商品、顧客リスト、旧URLの転送まで対応します。'],
    ['定期購入のショップは作れますか?', 'はい。定期購入はグロースに含まれています。'],
    ['公開後の運営はどうなりますか?', 'ご自身で運営できるようお引き渡しします。更新や毎月の確認を任せたい場合は、保守プランをお選びください。'],
    ['どのプランを選べばよいですか?', '商品数が少なければスタート、商品が多い場合や定期購入を始める場合はグロースが合います。迷ったらお気軽にご相談ください。'],
  ],
  closing: 'どのプランが合うか、迷ったら。',
  tagline: '固定料金のネットショップ制作', site: 'サイト', policies: '[{"label":"利用規約","href":"#terms"},{"label":"プライバシーポリシー","href":"#privacy"},{"label":"特定商取引法に基づく表記","href":"#tokushoho"}]', legal: '© 2026 plainshop',
};

export const PRICING_EXAMPLE: LayoutExample = { name: ENGLISH.name, use: ENGLISH.use, height: 900, library: library('tally'), html: page(ENGLISH) };

/** What a search result and a shared link say, and the data search engines read: the prices and the questions as they stand on the page. */
const seo = (copy: PricingCopy, title: string, description: string) => ({
  lang: copy.lang!, title, description,
  structuredData: [
    { '@context': 'https://schema.org', '@type': 'Service', name: title, serviceType: 'ネットショップ制作', description, areaServed: 'JP', inLanguage: copy.lang, provider: { '@type': 'Organization', name: 'plainshop' },
      offers: copy.plans.map(plan => ({ '@type': 'Offer', name: plan.name, description: plan.audience, price: plan.amount, priceCurrency: copy.currency })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: copy.lang, mainEntity: copy.questions.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) },
  ],
});

export const PRICING_JAPANESE_EXAMPLE: LayoutExample = {
  name: JAPANESE.name, use: JAPANESE.use, height: 900, library: library('tally'), html: page(JAPANESE),
  seo: seo(JAPANESE, 'ネットショップ制作の料金プラン|固定料金で税込298,000円から|plainshop', 'ネットショップ制作を固定料金で。5商品までのスタートは税込298,000円、7営業日で公開します。時間課金も追加請求もありません。ECサイト制作の費用、納期、公開後の保守までご案内します。'),
};
