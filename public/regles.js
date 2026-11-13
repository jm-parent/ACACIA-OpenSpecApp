const Regles = (() => {
  const MS_PAR_JOUR = 86400000;

  function debutDuJour(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  function ageJours(tache, maintenant = new Date()) {
    const creation = debutDuJour(new Date(tache.creeLe));
    return Math.round((debutDuJour(maintenant) - creation) / MS_PAR_JOUR);
  }

  function estAncienne(tache, maintenant = new Date()) {
    return !tache.archivee && !tache.terminee && ageJours(tache, maintenant) > 0;
  }

  function niveauVieillesse(age) {
    return Math.min(age, 3);
  }

  function ordonnerListeActive(taches, maintenant = new Date()) {
    const rang = (t) => {
      if (t.terminee) return 2;
      return estAncienne(t, maintenant) ? 0 : 1;
    };
    return taches
      .filter((t) => !t.archivee)
      .sort((a, b) => rang(a) - rang(b) || new Date(a.creeLe) - new Date(b.creeLe));
  }

  return { ageJours, estAncienne, niveauVieillesse, ordonnerListeActive };
})();

if (typeof module !== 'undefined') module.exports = Regles;
