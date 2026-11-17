export type Tree = (path: string, filter?: { only?: RegExp; skip?: RegExp }) => Map<string, Buffer>;
export interface PackageContext { read: (path: string) => Buffer; tree: Tree; fonts?: string[]; sources?: boolean }
export declare const androidFonts: Record<string, string>;
export declare const androidFontsAlways: string[];
export declare const fontResource: (file: string) => string;
export declare const iconResource: (name: string) => string;
export declare function iconNames(tree: Tree): string[];
export declare function androidPackage(context: PackageContext): Map<string, Buffer | string>;
export declare function vectorDrawable(svgText: string): string;
