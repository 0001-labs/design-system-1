export type IssueCode =
  | "foundation_constraint"
  | "empty"
  | "too_large"
  | "control_characters"
  | "parse_error"
  | "unknown_at_rule"
  | "charset_position"
  | "too_many_imports"
  | "disallowed_import_host"
  | "disallowed_url_host"
  | "unresolvable_url"
  | "data_url_too_large"
  | "data_url_type"
  | "disallowed_construct";

export type Severity = "error" | "warning";

export interface Issue {
  code: IssueCode;
  message: string;
  severity: Severity;
  line?: number;
  column?: number;
  offset?: number;
  detail?: string;
}

export interface ValidateOptions {
  maxBytes?: number;
  allowedHosts?: readonly string[];
  allowDataUrls?: boolean;
  maxDataUrlBytes?: number;
  maxImports?: number;
  warnBytes?: number;
}

export interface ValidateResult {
  ok: boolean;
  issues: Issue[];
  byteSize: number;
  truncated: boolean;
}

export const MAX_ISSUES = 50;
