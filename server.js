const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { lireTaches, ecrireTaches } = require('./lib/stockage');

const HOTE = '127.0.0.1';
const PORT = 4317;
const URL_APP = `http://${HOTE}:${PORT}`;
const FICHIER = path.join(__dirname, 'taches.json');
const DOSSIER_PUBLIC = path.join(__dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};
const TEXTE_MAX = 500;

class ErreurClient extends Error {
  constructor(message, statut = 400) {
    super(message);
    this.statut = statut;
  }
}

function envoyerJson(res, statut, corps) {
  const donnees = JSON.stringify(corps);
  res.writeHead(statut, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(donnees),
  });
  res.end(donnees);
}

function lireCorps(req) {
  return new Promise((resolve, reject) => {
    let brut = '';
    req.on('data', (morceau) => {
      brut += morceau;
      if (brut.length > 100000) {
        req.destroy();
        reject(new ErreurClient('Requête trop grosse.', 413));
      }
    });
    req.on('end', () => {
      if (!brut) return resolve({});
      try {
        resolve(JSON.parse(brut));
      } catch {
        reject(new ErreurClient('Corps de requête invalide.'));
      }
    });
    req.on('error', reject);
  });
}

function texteValide(valeur) {
  const texte = typeof valeur === 'string' ? valeur.trim() : '';
  if (!texte) throw new ErreurClient('Le texte est vide.');
  if (texte.length > TEXTE_MAX) throw new ErreurClient(`Le texte dépasse ${TEXTE_MAX} caractères.`);
  return texte;
}

function trouverTache(taches, id) {
  const tache = taches.find((t) => t.id === id);
  if (!tache) throw new ErreurClient('Tâche introuvable.', 404);
  return tache;
}

async function traiterApi(req, res, url) {
  const [, api, ressource, id, sous, noteId, ...reste] = url.pathname.split('/');
  const methode = req.method;

  if (api !== 'api' || ressource !== 'taches' || reste.length) {
    throw new ErreurClient('Route inconnue.', 404);
  }

  if (!id && methode === 'GET') {
    return envoyerJson(res, 200, lireTaches(FICHIER));
  }

  if (!id && methode === 'POST') {
    const { texte } = await lireCorps(req);
    const taches = lireTaches(FICHIER);
    const nouvelle = {
      id: crypto.randomUUID(),
      texte: texteValide(texte),
      creeLe: new Date().toISOString(),
      terminee: false,
      termineLe: null,
      archivee: false,
      notes: [],
    };
    taches.push(nouvelle);
    ecrireTaches(FICHIER, taches);
    return envoyerJson(res, 201, nouvelle);
  }

  if (id && !sous && methode === 'PATCH') {
    const corps = await lireCorps(req);
    const modifie = typeof corps.terminee === 'boolean' || typeof corps.archivee === 'boolean';
    if (!modifie) throw new ErreurClient('Rien à modifier.');
    const taches = lireTaches(FICHIER);
    const tache = trouverTache(taches, id);
    if (typeof corps.terminee === 'boolean') {
      tache.terminee = corps.terminee;
      tache.termineLe = corps.terminee ? new Date().toISOString() : null;
    }
    if (typeof corps.archivee === 'boolean') tache.archivee = corps.archivee;
    ecrireTaches(FICHIER, taches);
    return envoyerJson(res, 200, tache);
  }

  if (id && sous === 'notes' && !noteId && methode === 'POST') {
    const { texte } = await lireCorps(req);
    const taches = lireTaches(FICHIER);
    const tache = trouverTache(taches, id);
    const note = {
      id: crypto.randomUUID(),
      texte: texteValide(texte),
      creeLe: new Date().toISOString(),
    };
    tache.notes.push(note);
    ecrireTaches(FICHIER, taches);
    return envoyerJson(res, 201, note);
  }

  if (id && sous === 'notes' && noteId && methode === 'DELETE') {
    const taches = lireTaches(FICHIER);
    const tache = trouverTache(taches, id);
    const avant = tache.notes.length;
    tache.notes = tache.notes.filter((n) => n.id !== noteId);
    if (tache.notes.length === avant) throw new ErreurClient('Note introuvable.', 404);
    ecrireTaches(FICHIER, taches);
    return envoyerJson(res, 200, { ok: true });
  }

  throw new ErreurClient('Route ou méthode inconnue.', 404);
}

function servirStatique(url, res) {
  const cible = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const chemin = path.join(DOSSIER_PUBLIC, cible);
  if (!chemin.startsWith(DOSSIER_PUBLIC + path.sep)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(chemin, (erreur, contenu) => {
    if (erreur) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(chemin)] || 'application/octet-stream' });
    res.end(contenu);
  });
}

function ouvrirNavigateur() {
  spawn('cmd', ['/c', 'start', '', URL_APP], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
}

const serveur = http.createServer(async (req, res) => {
  const url = new URL(req.url, URL_APP);
  try {
    if (url.pathname.startsWith('/api/')) {
      await traiterApi(req, res, url);
    } else {
      servirStatique(url, res);
    }
  } catch (erreur) {
    const statut = erreur instanceof ErreurClient ? erreur.statut : 500;
    if (statut === 500) console.error(erreur);
    envoyerJson(res, statut, { erreur: erreur.message });
  }
});

serveur.on('error', (erreur) => {
  if (erreur.code === 'EADDRINUSE') {
    console.log(`L'application tourne déjà sur ${URL_APP}. J'ouvre le navigateur sur cette instance.`);
    ouvrirNavigateur();
    process.exit(0);
  }
  throw erreur;
});

if (!fs.existsSync(FICHIER)) ecrireTaches(FICHIER, []);

serveur.listen(PORT, HOTE, () => {
  console.log(`Gestionnaire de tâches : ${URL_APP}`);
  console.log('Pour arrêter, ferme cette fenêtre.');
  ouvrirNavigateur();
});
