/* rules.js */
/**
 * 27 Fuzzy Rules list
 * Mapping input combinations (Beban Akademik, Durasi Tidur, Aktivitas Non Akademik)
 * to output Burnout Category (rendah, sedang, tinggi).
 */
export const fuzzyRules = [
  { beban: 'rendah', tidur: 'rendah', aktivitas: 'rendah', output: 'sedang' }, // 1
  { beban: 'rendah', tidur: 'rendah', aktivitas: 'sedang', output: 'sedang' }, // 2
  { beban: 'rendah', tidur: 'rendah', aktivitas: 'tinggi', output: 'tinggi' }, // 3
  { beban: 'rendah', tidur: 'sedang', aktivitas: 'rendah', output: 'rendah' }, // 4
  { beban: 'rendah', tidur: 'sedang', aktivitas: 'sedang', output: 'rendah' }, // 5
  { beban: 'rendah', tidur: 'sedang', aktivitas: 'tinggi', output: 'sedang' }, // 6
  { beban: 'rendah', tidur: 'tinggi', aktivitas: 'rendah', output: 'rendah' }, // 7
  { beban: 'rendah', tidur: 'tinggi', aktivitas: 'sedang', output: 'rendah' }, // 8
  { beban: 'rendah', tidur: 'tinggi', aktivitas: 'tinggi', output: 'sedang' }, // 9
  { beban: 'sedang', tidur: 'rendah', aktivitas: 'rendah', output: 'tinggi' }, // 10
  { beban: 'sedang', tidur: 'rendah', aktivitas: 'sedang', output: 'sedang' }, // 11
  { beban: 'sedang', tidur: 'rendah', aktivitas: 'tinggi', output: 'tinggi' }, // 12
  { beban: 'sedang', tidur: 'sedang', aktivitas: 'rendah', output: 'sedang' }, // 13
  { beban: 'sedang', tidur: 'sedang', aktivitas: 'sedang', output: 'rendah' }, // 14
  { beban: 'sedang', tidur: 'sedang', aktivitas: 'tinggi', output: 'sedang' }, // 15
  { beban: 'sedang', tidur: 'tinggi', aktivitas: 'rendah', output: 'sedang' }, // 16
  { beban: 'sedang', tidur: 'tinggi', aktivitas: 'sedang', output: 'rendah' }, // 17
  { beban: 'sedang', tidur: 'tinggi', aktivitas: 'tinggi', output: 'sedang' }, // 18
  { beban: 'tinggi', tidur: 'rendah', aktivitas: 'rendah', output: 'tinggi' }, // 19
  { beban: 'tinggi', tidur: 'rendah', aktivitas: 'sedang', output: 'tinggi' }, // 20
  { beban: 'tinggi', tidur: 'rendah', aktivitas: 'tinggi', output: 'tinggi' }, // 21
  { beban: 'tinggi', tidur: 'sedang', aktivitas: 'rendah', output: 'tinggi' }, // 22
  { beban: 'tinggi', tidur: 'sedang', aktivitas: 'sedang', output: 'sedang' }, // 23
  { beban: 'tinggi', tidur: 'sedang', aktivitas: 'tinggi', output: 'tinggi' }, // 24
  { beban: 'tinggi', tidur: 'tinggi', aktivitas: 'rendah', output: 'tinggi' }, // 25
  { beban: 'tinggi', tidur: 'tinggi', aktivitas: 'sedang', output: 'sedang' }, // 26
  { beban: 'tinggi', tidur: 'tinggi', aktivitas: 'tinggi', output: 'tinggi' }  // 27
];
