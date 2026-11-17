export type ComponentLayer =
  | 'block'
  | 'runtime'
  | 'place'
  | 'service';

export type Realisation =
  | { as: 'editor-block'; kind: string }
  | { as: 'native-block'; kind: string }
  | { as: 'atom'; tag: string }
  | { as: 'insertion'; kind: string }
  | { as: 'place'; id: string }
  | { as: 'runtime'; name: string }
  | { as: 'engine'; part: string };

export type C9yComponent = {
  id: string;
  label: string;
  layer: ComponentLayer;
  summary: string;
  presents: string[];
  adds: string[];
  systems: string[];
  realisedAs: Realisation[];
  source: string[];
  uses?: string[];
};

export type C9ySite = {
  id: string;
  label: string;
  code?: string;
  codeStatus?: 'agreed' | 'proposed';
  siteCode: string;
  addresses: string[];
  folder: string;
  systemNode?: string;
  summary: string;
};

export type RelationKind =
  | 'shared'
  | 'local'
  | 'opportunity'
  | 'unverified';

export type C9yRelation = {
  id: string;
  source: string;
  target: string;
  kind: RelationKind;
  note: string;
  evidence: string[];
  reviewed: string;
};

export type C9ySystem = {
  version: 1;
  reviewed: string;
  components: C9yComponent[];
  sites: C9ySite[];
  relations: C9yRelation[];
};

export const REPOSITORIES: Record<string, string> = {
  'Peer':'/Users/joachim/0001/Other projects/Peer',
  'Consistency landing':'/Users/joachim/0001/Consistency/site',
  'Design system 1': '/Users/joachim/0001/Open source/Design system 1',
  'Consistency': '/Users/joachim/0001/Consistency',
  'Site engine': '/Users/joachim/0001/System/parts/site-engine',
  'Flavo': '/Users/joachim/0001/Consistency/platform/sites/flavo',
  'CPH Raft': '/Users/joachim/0001/Consistency/platform/sites/cph-raft',
  'Søndergården': '/Users/joachim/0001/Consistency/platform/sites/soendergaarden',
};
