/**
 * The YAML of an `aa-comments` block, read and written without a YAML library,
 * which would be the largest thing in the editor for a block few documents have.
 * It covers block mappings and sequences, plain, quoted, literal and folded
 * scalars, comments and one-line flow collections: all a person or the writer
 * below would put there, and all a full YAML writer ever did. What it does not
 * cover it refuses, as a document with anchors, aliases or tags always was, so
 * the block stays in the text untouched. It must agree with a real YAML parser
 * or refuse, never differ: `tests/comment-yaml.test.ts` holds it to that.
 */
/** Read the YAML in a block. Throws on anything it does not read exactly as YAML does. */
export declare function readYaml(text: string): unknown;
/** Write plain data as YAML, as a full writer sets it out: no aliases, no line folded. */
export declare function writeYaml(value: unknown): string;
