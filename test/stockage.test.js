const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { lireTaches, ecrireTaches } = require('../lib/stockage');

function fichierTemporaire() {
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), 'taches-'));
  return path.join(dossier, 'taches.json');
}

test('une écriture puis une lecture restituent les mêmes tâches', () => {
  const chemin = fichierTemporaire();
  const taches = [{ id: '1', texte: 'Appeler le client', notes: [] }];
  ecrireTaches(chemin, taches);
  assert.deepEqual(lireTaches(chemin), taches);
  assert.equal(fs.existsSync(`${chemin}.tmp`), false);
});

test('un fichier illisible déclenche une erreur sans être modifié', () => {
  const chemin = fichierTemporaire();
  fs.writeFileSync(chemin, '{ pas du json', 'utf8');
  assert.throws(() => lireTaches(chemin), /Le fichier n'a pas été modifié/);
  assert.equal(fs.readFileSync(chemin, 'utf8'), '{ pas du json');
});
