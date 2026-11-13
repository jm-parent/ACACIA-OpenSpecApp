const listeEl = document.querySelector('#liste');
const videEl = document.querySelector('#vide');
const erreurEl = document.querySelector('#erreur');
const formulaireAjout = document.querySelector('#formulaire-ajout');
const champAjout = document.querySelector('#champ-ajout');
const ongletJour = document.querySelector('#onglet-jour');
const ongletArchives = document.querySelector('#onglet-archives');

const etat = { taches: [], vue: 'jour', erreur: null };

function el(balise, props = {}, ...enfants) {
  const noeud = document.createElement(balise);
  for (const [cle, valeur] of Object.entries(props)) {
    if (cle === 'class') noeud.className = valeur;
    else if (cle.startsWith('on')) noeud.addEventListener(cle.slice(2), valeur);
    else if (cle in noeud) noeud[cle] = valeur;
    else noeud.setAttribute(cle, valeur);
  }
  for (const enfant of enfants) {
    if (enfant != null) noeud.append(enfant);
  }
  return noeud;
}

function formaterDate(iso) {
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

async function appeler(methode, chemin, corps) {
  const reponse = await fetch(chemin, {
    method: methode,
    headers: { 'Content-Type': 'application/json' },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  const donnees = await reponse.json().catch(() => ({}));
  if (!reponse.ok) throw new Error(donnees.erreur || `Erreur ${reponse.status}`);
  return donnees;
}

async function charger() {
  try {
    etat.taches = await appeler('GET', '/api/taches');
  } catch (erreur) {
    etat.erreur = erreur.message;
  }
  rendre();
}

async function action(fonction) {
  etat.erreur = null;
  try {
    await fonction();
  } catch (erreur) {
    etat.erreur = erreur.message;
  }
  await charger();
}

function carteTache(tache, maintenant, archives) {
  const age = Regles.ageJours(tache, maintenant);
  const ancienne = Regles.estAncienne(tache, maintenant);
  const classes = ['tache'];
  if (tache.terminee) classes.push('terminee');
  if (ancienne) classes.push(`niveau-${Regles.niveauVieillesse(age)}`);

  const modifier = (corps) => action(() => appeler('PATCH', `/api/taches/${tache.id}`, corps));

  const entete = archives
    ? [
        el('span', { class: 'texte' }, tache.texte),
        el('time', {}, formaterDate(tache.creeLe)),
        el('button', { type: 'button', class: 'secondaire', onclick: () => modifier({ archivee: false }) }, 'Restaurer'),
      ]
    : [
        el('input', {
          type: 'checkbox',
          checked: tache.terminee,
          title: 'Marquer comme terminée',
          onchange: () => modifier({ terminee: !tache.terminee }),
        }),
        el('span', { class: 'texte' }, tache.texte),
        ancienne ? el('span', { class: 'badge' }, `Ancienne · ${age} j`) : null,
        el('time', {}, formaterDate(tache.creeLe)),
        el('button', { type: 'button', class: 'secondaire', onclick: () => modifier({ archivee: true }) }, 'Archiver'),
      ];

  const notes = tache.notes.length
    ? el(
        'ul',
        { class: 'notes' },
        ...tache.notes.map((note) =>
          el(
            'li',
            {},
            el('span', {}, note.texte),
            el('time', {}, formaterDate(note.creeLe)),
            archives
              ? null
              : el('button', {
                  type: 'button',
                  class: 'lien',
                  title: 'Supprimer la note',
                  onclick: () => {
                    if (confirm('Supprimer cette note ?')) {
                      action(() => appeler('DELETE', `/api/taches/${tache.id}/notes/${note.id}`));
                    }
                  },
                }, '×'),
          ),
        ),
      )
    : null;

  const formulaireNote = archives
    ? null
    : el(
        'form',
        {
          class: 'note-form',
          onsubmit: (evenement) => {
            evenement.preventDefault();
            const texte = evenement.target.elements.texte.value.trim();
            if (texte) action(() => appeler('POST', `/api/taches/${tache.id}/notes`, { texte }));
          },
        },
        el('input', { type: 'text', name: 'texte', placeholder: 'Ajouter une note…', maxlength: 500, autocomplete: 'off' }),
        el('button', { type: 'submit' }, 'Noter'),
      );

  return el('li', { class: classes.join(' ') }, el('div', { class: 'ligne' }, ...entete), notes, formulaireNote);
}

function rendre() {
  const maintenant = new Date();
  const archives = etat.vue === 'archives';

  erreurEl.hidden = !etat.erreur;
  erreurEl.textContent = etat.erreur || '';

  ongletJour.classList.toggle('actif', !archives);
  ongletArchives.classList.toggle('actif', archives);
  formulaireAjout.hidden = archives;

  const taches = archives
    ? etat.taches.filter((t) => t.archivee)
    : Regles.ordonnerListeActive(etat.taches, maintenant);

  listeEl.replaceChildren(...taches.map((t) => carteTache(t, maintenant, archives)));

  videEl.hidden = taches.length > 0 || etat.erreur !== null;
  videEl.textContent = archives ? 'Aucune tâche archivée.' : 'Rien à faire. Ajoute une tâche ci-dessus.';
}

formulaireAjout.addEventListener('submit', async (evenement) => {
  evenement.preventDefault();
  const texte = champAjout.value.trim();
  if (!texte) return;
  await action(() => appeler('POST', '/api/taches', { texte }));
  if (!etat.erreur) champAjout.value = '';
  champAjout.focus();
});

ongletJour.addEventListener('click', () => {
  etat.vue = 'jour';
  rendre();
});

ongletArchives.addEventListener('click', () => {
  etat.vue = 'archives';
  rendre();
});

window.addEventListener('focus', charger);

charger();
