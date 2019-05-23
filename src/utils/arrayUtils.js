export function strToArray(str) {
   return str.split(/(\s+)/u).filter(e => e.trim().length > 0);
}