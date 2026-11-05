import type { ManagedFlag } from './index';

/** An account a rule may name: the product's opaque id or, for Link, the signed-in email, with a name to show when it has one. */
export type KnownAccount = { id: string; label?: string };
/** What a product's manage call answers: the flags alone, or the flags with the accounts it knows. */
export type ManagedFlags = ManagedFlag[] | { flags: ManagedFlag[]; accounts?: KnownAccount[] };
/** Both answers as one shape. */
export function managedFlags(value: unknown): { flags: ManagedFlag[]; accounts: KnownAccount[] } {
  if (Array.isArray(value)) return { flags: value as ManagedFlag[], accounts: [] };
  const given = (value ?? {}) as { flags?: unknown; accounts?: unknown };
  return { flags: Array.isArray(given.flags) ? given.flags as ManagedFlag[] : [], accounts: Array.isArray(given.accounts) ? given.accounts as KnownAccount[] : [] };
}

// The flags matrix: flags across, audiences and accounts down, a check where
// the release rule includes the row and a cross where it leaves it out. System
// and every product's flags view draw the same matrix; matrix.css styles it.
// The rows read as a release: Off, Owner, the accounts, a growing share of the
// accounts, then Everyone last. The account rows are the accounts the product
// knows and the ones a rule already names: there is no typing an identity in,
// so a rule can only name an account that exists.

export type AudienceRow = { kind: 'off' | 'owner' | 'everyone' } | { kind: 'account'; id: string } | { kind: 'percentage'; value: number };

/** The shares of the accounts a flag can be released to, in the order they are offered; index.ts accepts any whole percent. */
export const ROLLOUT_PERCENTAGES = [5, 10, 25, 50, 75] as const;

/** More flags than this are drawn as two tables, one under the other, so the matrix fits without scrolling sideways. */
export const FLAGS_PER_TABLE = 12;

/** Whether the flag's rule includes the row. */
export function selected(flag: ManagedFlag, row: AudienceRow): boolean {
  if (row.kind === 'off') return !flag.enabled;
  if (!flag.enabled) return false;
  if (row.kind === 'account') return flag.audience === 'accounts' && !!flag.accountIds?.includes(row.id);
  if (row.kind === 'percentage') return flag.audience === 'percentage' && flag.percentage === row.value;
  return flag.audience === row.kind;
}

/** The rule after selecting the row's square: an account is added or removed, any other row replaces the rule. */
export function changeRule(flag: ManagedFlag, row: AudienceRow): ManagedFlag {
  if (row.kind === 'off' || selected(flag, row) && row.kind !== 'account') return { ...flag, enabled: false };
  if (row.kind === 'percentage') return { ...flag, enabled: true, audience: 'percentage', percentage: row.value };
  if (row.kind !== 'account') return { ...flag, enabled: true, audience: row.kind };
  const ids = new Set(flag.audience === 'accounts' ? flag.accountIds : []);
  if (flag.enabled && ids.has(row.id)) ids.delete(row.id); else ids.add(row.id);
  return { ...flag, enabled: ids.size > 0, audience: 'accounts', accountIds: [...ids] };
}

/** The rows of the matrix in release order: Off, Owner, the known accounts in the order given, any account a rule names that is not known, the shares, then Everyone. */
export function audienceRows(flags: ManagedFlag[], accounts: KnownAccount[] = []): [AudienceRow, string][] {
  const named: [AudienceRow, string][] = [];
  const seen = new Set<string>();
  for (const account of accounts) {
    if (!account.id || seen.has(account.id)) continue;
    seen.add(account.id);
    named.push([{ kind: 'account', id: account.id }, account.label || account.id]);
  }
  for (const id of flags.flatMap(flag => flag.accountIds ?? [])) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    named.push([{ kind: 'account', id }, id]);
  }
  return [
    [{ kind: 'off' }, 'Off'],
    [{ kind: 'owner' }, 'Owner'],
    ...named,
    ...ROLLOUT_PERCENTAGES.map(value => [{ kind: 'percentage', value }, `${value}%`] as [AudienceRow, string]),
    [{ kind: 'everyone' }, 'Everyone'],
  ];
}

/** The flags split into the tables that draw them: one, or two halves when there are many. */
export function tableGroups<T>(flags: T[]): T[][] {
  if (flags.length <= FLAGS_PER_TABLE) return [flags];
  const half = Math.ceil(flags.length / 2);
  return [flags.slice(0, half), flags.slice(half)];
}

