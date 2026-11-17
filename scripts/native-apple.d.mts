import type { PackageContext, Tree } from './native-android.mjs';
export declare const appleFonts: Record<string, string>;
export declare const appleFontsAlways: string[];
export declare function iconNames(tree: Tree): string[];
export declare function applePackage(context: PackageContext): Map<string, Buffer | string>;
