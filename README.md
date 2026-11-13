# ACACIA-OpenSpecApp

Mes tâches du jour : liste personnelle de tâches de la journée, en local, sans connexion. Les données sont enregistrées dans `taches.json` à la racine du projet.

## Lancer

Double-clique sur `lancer.bat`. L'application s'ouvre dans le navigateur sur http://127.0.0.1:4317. Pour l'arrêter, ferme la fenêtre de la console.

Prérequis : Node.js 20 ou plus récent. Aucune dépendance npm à installer.

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
