/**
 * A block's behaviour as the editor reads and writes it, apart from the panel that draws it (`behaviour-panel.ts`):
 * which members of a kind are behaviour, and a list of turns changed one record at a time. Nothing here touches the DOM.
 */
import type { NativeSection } from '../../../shared/consistency-native-page';
import type { MemberDefinition, SlotDefinition } from '../../../shared/consistency-vocabulary';
import { kindDefinition, placeholderWords } from './native-page-model';

/** The block whose behaviour is open: read as it stands now, changed through the page's history. */
export interface BehaviourTarget {
  /** The section as it stands, or nothing once it has gone from the page. */
  read(): NativeSection | undefined;
  commit(update: (section: NativeSection) => NativeSection): void;
  /** The site's pictures a turn may name. */
  images(): readonly string[];
}
/** Opened or closed, for the app around the editor: its sidebar gives way while a panel is open. */
export const PANEL_EVENT = 'consistency-panel';

/** A kind's behaviour members by name, fields first, as the vocabulary marks them. */
export function behaviourMembers(kind: string): Array<[string, MemberDefinition]> {
  const definition = kindDefinition(kind); if (!definition) return [];
  return [...Object.entries(definition.fields), ...Object.entries(definition.slots)].filter(([, member]) => member.group === 'behaviour');
}
export const hasBehaviour = (kind: string) => behaviourMembers(kind).length > 0;

type Turn = Record<string, unknown>;
export const turnsOf = (section: NativeSection, slot: string): Turn[] => { const value = (section as unknown as Record<string, unknown>)[slot]; return Array.isArray(value) ? value as Turn[] : []; };
/** The section with its turns replaced; a slot left with none is left out, as a block without the behaviour is written. */
function withTurns(section: NativeSection, slot: string, turns: Turn[]): NativeSection {
  const next = { ...section } as unknown as Record<string, unknown>;
  if (turns.length) next[slot] = turns; else delete next[slot];
  return next as unknown as NativeSection;
}
/** One member of one turn written; an optional member emptied is left out. */
export function writeTurn(section: NativeSection, slot: string, index: number, name: string, value: unknown, required = false): NativeSection {
  return withTurns(section, slot, turnsOf(section, slot).map((turn, at) => {
    if (at !== index) return turn;
    const next = { ...turn };
    if (!required && (value === undefined || value === '')) delete next[name]; else next[name] = value;
    return next;
  }));
}
/** A new turn after the others, its required words filled with their names so the page never shows an empty line. */
export function addTurn(section: NativeSection, slot: string, definition: SlotDefinition): NativeSection {
  const turn: Turn = {};
  for (const [name, member] of Object.entries(definition.item ?? {})) if (member.required && (member.type === 'text' || member.type === 'words')) turn[name] = placeholderWords(name);
  return withTurns(section, slot, [...turnsOf(section, slot), turn]);
}
export const removeTurn = (section: NativeSection, slot: string, index: number): NativeSection => withTurns(section, slot, turnsOf(section, slot).filter((_, at) => at !== index));
export function moveTurn(section: NativeSection, slot: string, from: number, to: number): NativeSection {
  const turns = [...turnsOf(section, slot)]; if (to < 0 || to >= turns.length || from === to) return section;
  turns.splice(to, 0, ...turns.splice(from, 1));
  return withTurns(section, slot, turns);
}
