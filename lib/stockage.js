const fs = require('node:fs');

class ErreurStockage extends Error {}

function lireTaches(chemin) {
  if (!fs.existsSync(chemin)) return [];
  const brut = fs.readFileSync(chemin, 'utf8').replace(/^\uFEFF/, '');
  let taches;
  try {
    taches = JSON.parse(brut);
  } catch {
    throw new ErreurStockage(`Impossible de lire ${chemin} : ce n'est pas du JSON valide. Le fichier n'a pas été modifié, corrige-le à la main.`);
  }
  if (!Array.isArray(taches)) {
    throw new ErreurStockage(`${chemin} doit contenir une liste. Le fichier n'a pas été modifié, corrige-le à la main.`);
  }
  return taches;
}

function ecrireTaches(chemin, taches) {
  const temporaire = `${chemin}.tmp`;
  fs.writeFileSync(temporaire, JSON.stringify(taches, null, 2), 'utf8');
  fs.renameSync(temporaire, chemin);
}

module.exports = { lireTaches, ecrireTaches, ErreurStockage };
