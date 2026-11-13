# ACACIA-OpenSpecApp

Mes tâches du jour : liste personnelle de tâches de la journée, en local, sans connexion. Les données sont enregistrées dans `taches.json` à la racine du projet.

Ce dépôt sert aussi à découvrir [OpenSpec](https://openspec.dev), une méthode de développement pilotée par les specs. Les étapes ci-dessous te guident pour la préparer avec GitHub Copilot.

## Découvrir OpenSpec avec GitHub Copilot

### 1. Vérifier les prérequis

- **GitHub Copilot app** (application de bureau) : installée et connectée à ton compte GitHub. Il faut un forfait Copilot, ou un fournisseur de modèles configuré dans l'app. Téléchargement et premiers pas : [Getting started with the GitHub Copilot app](https://docs.github.com/en/copilot/get-started/quickstart-copilot-app).
- **Node.js 22.12 ou plus récent** (requis par OpenSpec). Vérifie avec `node --version`.
- **Git**, pour cloner ce dépôt.

### 2. Installer la CLI OpenSpec

Dans PowerShell :

```powershell
npm install -g @fission-ai/openspec@latest
openspec --version
```

Sans Node.js, tu peux aussi utiliser l'installeur officiel : `irm https://openspec.dev/cli/install.ps1 | iex`.

### 3. Initialiser OpenSpec dans le projet

Depuis le dossier du projet :

```powershell
cd chemin\vers\ACACIA-OpenSpecApp
openspec init --tools github-copilot
```

`openspec init` crée le dossier `openspec/` et installe les skills dans `.agents/skills/`. Commite ces fichiers avec ton code.

### 4. Commencer dans la GitHub Copilot app

Dans l'app, ouvre le projet : à côté de **Sessions**, clique sur **+**, puis **Open local folder** et choisis le dossier `ACACIA-OpenSpecApp`. Ensuite, lance une session en mode **Interactive** et essaie, dans cet ordre :

1. **Explorer** avant de décider : `/openspec-explore` puis ta question, par exemple « Aide-moi à explorer comment trier les tâches archivées ». Cette étape n'écrit aucun code.
2. **Proposer** un changement : `/openspec-propose ajouter-une-priorite`. Relis ensuite `proposal.md`, `specs/` et `tasks.md` dans `openspec/changes/`, et corrige-les si besoin.
3. **Appliquer** dans une **nouvelle** conversation : `/openspec-apply-change`. L'agent coche les tâches une à une.
4. **Archiver** une fois toutes les tâches cochées : `/openspec-archive-change`. Les specs principales sont mises à jour.

Si `/openspec-explore` n'apparaît pas dans le sélecteur `/`, écris simplement la demande en langage naturel, par exemple « Explore avec moi comment trier les tâches archivées ».

### Commandes utiles

```powershell
openspec update                              # après une mise à jour de la CLI, rafraîchit les skills
openspec config set telemetry.enabled false  # désactive les statistiques d'usage anonymes
```

## Lancer

Double-clique sur `lancer.bat`. L'application s'ouvre dans le navigateur sur http://127.0.0.1:4317. Pour l'arrêter, ferme la fenêtre de la console.

Prérequis : Node.js 22.12 ou plus récent. Aucune dépendance npm à installer.

## Utiliser

- Tape une tâche dans le champ du haut, puis Entrée.
- Coche une tâche quand elle est terminée. Elle reste visible, barrée.
- Archive une tâche pour la retirer de la liste. Elle reste consultable dans l'onglet **Archives**, où tu peux la restaurer.
- Ajoute une note sous une tâche avec le champ « Ajouter une note… ». Une note se supprime avec le bouton `×`.
- Une tâche non terminée créée un autre jour est marquée **Ancienne**. Plus elle est vieille, plus elle ressort.

## Tests

```
npm test
```

## Sauvegarde

Copie `taches.json` pour sauvegarder tes données. Si ce fichier est corrompu, l'application affiche une erreur et ne le modifie pas : répare-le à la main.
