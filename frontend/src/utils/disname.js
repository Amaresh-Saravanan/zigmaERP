// ponytail: formats snake_case into title-cased display names
export default function disname(str) {
  if (!str) return '';
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
