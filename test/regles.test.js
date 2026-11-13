const { test } = require('node:test');
const assert = require('node:assert/strict');
const Regles = require('../public/regles.js');

const maintenant = new Date(2026, 10, 13, 10, 0);
const il = (jours, heure = 9) => new Date(2026, 10, 13 - jours, heure).toISOString();

test('une tâche non terminée créée un autre jour est ancienne, pas celle du jour', () => {
  const hier = { creeLe: il(1), terminee: false, archivee: false };
  const aujourdhui = { creeLe: il(0), terminee: false, archivee: false };
  assert.equal(Regles.estAncienne(hier, maintenant), true);
  assert.equal(Regles.ageJours(hier, maintenant), 1);
  assert.equal(Regles.estAncienne(aujourdhui, maintenant), false);
});

test('une tâche terminée ou archivée n\'est jamais ancienne', () => {
  const terminee = { creeLe: il(3), terminee: true, archivee: false };
  const archivee = { creeLe: il(3), terminee: false, archivee: true };
  assert.equal(Regles.estAncienne(terminee, maintenant), false);
  assert.equal(Regles.estAncienne(archivee, maintenant), false);
});

test('la liste active met les anciennes en haut, puis le jour, puis les terminées, sans les archivées', () => {
  const taches = [
    { id: 'terminee', creeLe: il(5), terminee: true, archivee: false },
    { id: 'jour', creeLe: il(0, 8), terminee: false, archivee: false },
    { id: 'archivee', creeLe: il(9), terminee: false, archivee: true },
    { id: 'vieille', creeLe: il(4), terminee: false, archivee: false },
    { id: 'hier', creeLe: il(1), terminee: false, archivee: false },
  ];
  const ids = Regles.ordonnerListeActive(taches, maintenant).map((t) => t.id);
  assert.deepEqual(ids, ['vieille', 'hier', 'jour', 'terminee']);
});

test('le niveau de vieillesse plafonne à 3', () => {
  assert.equal(Regles.niveauVieillesse(1), 1);
  assert.equal(Regles.niveauVieillesse(7), 3);
});
