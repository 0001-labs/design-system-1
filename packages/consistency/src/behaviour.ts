import type { NativeSection } from '../../../shared/consistency-native-page';
import type { MemberDefinition, SlotDefinition } from '../../../shared/consistency-vocabulary';
import { kindDefinition, placeholderWords } from './native-page-model';

export interface BehaviourTarget {
  read(): NativeSection | undefined;
  commit(update: (section: NativeSection) => NativeSection): void;
  images(): readonly string[];
}
export const PANEL_EVENT = 'consistency-panel';

export function behaviourMembers(kind: string): Array<[string, MemberDefinition]> {
  const definition = kindDefinition(kind); if (!definition) return [];
  return [...Object.entries(definition.fields), ...Object.entries(definition.slots)].filter(([, member]) => member.group === 'behaviour');
}
export const hasBehaviour = (kind: string) => behaviourMembers(kind).length > 0;

type Turn = Record<string, unknown>;
export const turnsOf = (section: NativeSection, slot: string): Turn[] => { const value = (section as unknown as Record<string, unknown>)[slot]; return Array.isArray(value) ? value as Turn[] : []; };
function withTurns(section: NativeSection, slot: string, turns: Turn[]): NativeSection {
  const next = { ...section } as unknown as Record<string, unknown>;
  if (turns.length) next[slot] = turns; else delete next[slot];
  return next as unknown as NativeSection;
}
export function writeTurn(section: NativeSection, slot: string, index: number, name: string, value: unknown, required = false): NativeSection {
  return withTurns(section, slot, turnsOf(section, slot).map((turn, at) => {
    if (at !== index) return turn;
    const next = { ...turn };
    if (!required && (value === undefined || value === '')) delete next[name]; else next[name] = value;
    return next;
  }));
}
export function addTurn(section: NativeSection, slot: string, definition: SlotDefinition): NativeSection {
  const turn: Turn = {}, others = turnsOf(section, slot);
  for (const [name, member] of Object.entries(definition.item ?? {})) {
    if (member.required && (member.type === 'text' || member.type === 'words')) turn[name] = placeholderWords(name);
    if (member.required && member.type === 'identifier') { let n = others.length + 1; while (others.some(other => other[name] === `${slot === 'inputs' ? 'field' : name}${n}`)) n++; turn[name] = `${slot === 'inputs' ? 'field' : name}${n}`; }
  }
  return withTurns(section, slot, [...turnsOf(section, slot), turn]);
}
export const removeTurn = (section: NativeSection, slot: string, index: number): NativeSection => withTurns(section, slot, turnsOf(section, slot).filter((_, at) => at !== index));
export function moveTurn(section: NativeSection, slot: string, from: number, to: number): NativeSection {
  const turns = [...turnsOf(section, slot)]; if (to < 0 || to >= turns.length || from === to) return section;
  turns.splice(to, 0, ...turns.splice(from, 1));
  return withTurns(section, slot, turns);
}
