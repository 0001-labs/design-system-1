import { describe, expect, test } from 'vite-plus/test';
import { blockers, firstWordsLanguage, flowOf, inOrder, replaceFlow, statsName, whenName, withEmail, wordsOf, type FlowKind } from './email-flows-view';

const welcome: FlowKind = { kind: 'welcome', name: 'Welcome', trigger: 'Someone signs up', events: [{ id: 'signup', name: 'signing up' }], fields: ['name'], steps: [
  { event: 'signup', delay: { amount: 0, unit: 'days' }, subject: 'Welcome', text: 'Hi {{name}}' },
  { event: 'signup', delay: { amount: 2, unit: 'days' }, subject: 'Loved', text: 'These' },
] };

describe('email flow designer', () => {
  test('says when an email goes', () => {
    expect(whenName({ event: 'signup', delay: { amount: 0, unit: 'days' } }, welcome)).toBe('At signing up');
    expect(whenName({ event: 'signup', delay: { amount: 1, unit: 'hours' } }, welcome)).toBe('1 hour after signing up');
    expect(whenName({ event: 'signup', delay: { amount: 2, unit: 'days' } }, welcome)).toBe('2 days after signing up');
    expect(whenName({ event: 'gone', delay: { amount: 3, unit: 'minutes' } }, undefined)).toBe('3 minutes after gone');
  });
  test('starts a flow from its kind in the site’s first words language', () => {
    expect(firstWordsLanguage([{ code: 'da' }, { code: 'en' }])).toBe('en');
    expect(firstWordsLanguage([{ code: 'ja' }])).toBe('ja');
    const flow = flowOf(welcome, 'en');
    expect(flow.steps.map(step => step.emails.en?.subject)).toEqual(['Welcome', 'Loved']);
    flow.steps[0]!.delay.amount = 9;
    expect(welcome.steps[0]!.delay.amount).toBe(0);
  });
  test('adds an email a day after the last, up to ten', () => {
    let flow = flowOf(welcome, 'en');
    flow = withEmail(flow);
    expect(flow.steps.at(-1)).toEqual({ event: 'signup', delay: { amount: 3, unit: 'days' }, emails: {} });
    for (let i = 0; i < 20; i++) flow = withEmail(flow);
    expect(flow.steps).toHaveLength(10);
  });
  test('finds an email’s words, or the language they come from', () => {
    const step = flowOf(welcome, 'en').steps[0]!;
    const languages = [{ code: 'da' }, { code: 'en' }];
    expect(wordsOf(step, 'en', languages)).toEqual({ words: { subject: 'Welcome', text: 'Hi {{name}}' }, from: 'en' });
    expect(wordsOf(step, 'da', languages).from).toBe('en');
    expect(wordsOf({ ...step, emails: {} }, 'da', languages)).toEqual({ words: { subject: '', text: '' }, from: null });
  });
  test('keeps emails in the order they go, and follows the one moved', () => {
    const flow = flowOf(welcome, 'en');
    flow.steps[0]!.delay = { amount: 3, unit: 'days' };
    const sorted = inOrder(flow, welcome, 0);
    expect(sorted.flow.steps.map(step => step.delay.amount)).toEqual([2, 3]);
    expect(sorted.index).toBe(1);
    flow.steps[0]!.delay = { amount: 47, unit: 'hours' };
    expect(inOrder(flow, welcome, 0).index).toBe(0);
  });
  test('says what sending did and what keeps an email from going', () => {
    expect(statsName(undefined)).toBe('Nothing sent yet');
    expect(statsName({ waiting: 2, sent: 5, failed: 0, cancelled: 3 })).toBe('2 waiting · 5 sent');
    const live: FlowKind = { ...welcome, events: [{ id: 'signup', name: 'signing up', live: true, values: ['name', 'offer'] }] };
    expect(blockers({ subject: 'Hi {{name}}', text: '{{offer}}' }, { event: 'signup' }, live, true)).toEqual({ live: true, missing: [] });
    expect(blockers({ subject: 'Hi {{name}}', text: '{{offer}} {{tracking}}' }, { event: 'signup' }, live, false)).toEqual({ live: true, missing: ['offer', 'tracking'] });
    expect(blockers({ subject: 'Hi', text: 'Hi' }, { event: 'signup' }, welcome, true).live).toBe(false);
  });
  test('replaces and takes away a flow', () => {
    const document = { flows: [flowOf(welcome, 'en')] };
    expect(replaceFlow(document, 'welcome', null).flows).toEqual([]);
    expect(replaceFlow(document, 'welcome', { kind: 'welcome', steps: [] }).flows[0]!.steps).toEqual([]);
  });
});
