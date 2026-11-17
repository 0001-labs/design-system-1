import { describe, expect, it } from 'vite-plus/test';
import type { NativeHero, NativeSection } from '../../../shared/consistency-native-page';
import { validateNativePage } from '../../../shared/consistency-native-page';
import { addTurn, behaviourMembers, hasBehaviour, moveTurn, removeTurn, writeTurn } from './behaviour';
import { kindDefinition } from './native-page-model';

const hero = (): NativeHero => ({ id: 'top', kind: 'hero', picture: { src: '/one.webp', alt: 'One' }, kicker: '0001', title: 'Thinking with code' });
const turns = kindDefinition('hero')!.slots.turns!;
const accepted = (section: NativeSection) => validateNativePage({ schema: 1, kind: 'native-page', layout: { padding: 0, gap: 40 }, blocks: [section] }, { images: ['/one.webp', '/two.webp'], collections: [], runtimes: {}, bindings: [] }).blocks[0];

describe('a block\'s behaviour', () => {
  it('is what the vocabulary marks as behaviour: rows of the panel, never of the menu', () => {
    expect(behaviourMembers('hero').map(([name]) => name)).toEqual(['turnEvery', 'turnOrder', 'turns']);
    expect(hasBehaviour('hero')).toBe(true);
    expect(hasBehaviour('statement')).toBe(false);
    expect(behaviourMembers('form').map(([name]) => name)).toEqual(['action', 'button', 'inputs']);
    expect(hasBehaviour('nothing')).toBe(false);
  });

  it('adds a turn the page accepts, its required words filled', () => {
    const next = addTurn(hero(), 'turns', turns) as NativeHero;
    expect(next.turns).toEqual([{ title: 'Title' }]);
    expect(accepted(next)).toEqual(next);
  });

  it('writes one member of one turn, and leaves an emptied optional member out', () => {
    let next = addTurn(addTurn(hero(), 'turns', turns), 'turns', turns);
    next = writeTurn(next, 'turns', 1, 'title', 'Two', true);
    next = writeTurn(next, 'turns', 1, 'kicker', '0002');
    next = writeTurn(next, 'turns', 1, 'picture', { src: '/two.webp', alt: 'Two' });
    expect((next as NativeHero).turns).toEqual([{ title: 'Title' }, { title: 'Two', kicker: '0002', picture: { src: '/two.webp', alt: 'Two' } }]);
    expect(accepted(next)).toEqual(next);
    next = writeTurn(writeTurn(next, 'turns', 1, 'kicker', ''), 'turns', 1, 'picture', undefined);
    expect((next as NativeHero).turns![1]).toEqual({ title: 'Two' });
  });

  it('moves and removes turns; a block left with none is written without the behaviour', () => {
    let next = writeTurn(addTurn(addTurn(hero(), 'turns', turns), 'turns', turns), 'turns', 1, 'title', 'Two', true);
    expect((moveTurn(next, 'turns', 1, 0) as NativeHero).turns!.map(turn => turn.title)).toEqual(['Two', 'Title']);
    expect(moveTurn(next, 'turns', 0, -1)).toBe(next);
    expect(moveTurn(next, 'turns', 1, 2)).toBe(next);
    next = removeTurn(next, 'turns', 0);
    expect((next as NativeHero).turns).toEqual([{ title: 'Two' }]);
    next = removeTurn(next, 'turns', 0);
    expect('turns' in next).toBe(false);
    expect(next).toEqual(hero());
  });

  it('adds a form field with a name of its own, which the page accepts', () => {
    const inputs = kindDefinition('form')!.slots.inputs!;
    const form = { id: 'write', kind: 'form', action: '/api/contact', inputs: [{ name: 'email', label: 'Email', type: 'email' }, { name: 'field2', label: 'Two' }] } as unknown as NativeSection;
    const next = addTurn(form, 'inputs', inputs) as unknown as { inputs: { name: string; label: string }[] };
    expect(next.inputs.at(-1)).toEqual({ name: 'field3', label: 'Label' });
    expect(accepted(next as unknown as NativeSection)).toEqual(next);
  });
});
