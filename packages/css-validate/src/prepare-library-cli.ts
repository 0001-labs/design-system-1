import { readFileSync } from "node:fs";
import { prepareLibrary } from "./library";

const [file] = process.argv.slice(2);
if (!file) {
  process.stderr.write("Usage: prepare-library <draft.css | -> (the prepared stylesheet goes to standard output)\n");
  process.exit(2);
}
process.stdout.write(prepareLibrary(readFileSync(file === "-" ? 0 : file, "utf8")).css);
