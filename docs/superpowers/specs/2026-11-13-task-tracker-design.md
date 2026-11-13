# Gestionnaire de tâches quotidiennes : document de conception

Date : 2026-11-13
Statut : en attente de validation par le porteur du projet

## Intention

Une liste personnelle des choses à faire **dans la journée**, utilisable sur un PC Windows, sans connexion Internet. L'objectif est d'ajouter une tâche ou une note très vite, de marquer une tâche comme terminée, et de faire disparaître une tâche de la liste par archivage.

## Objectifs

- Ajouter une tâche en une saisie, avec la touche Entrée.
- Chaque tâche affiche sa **date de création** (automatique, pas de saisie).
- Ajouter des **notes attachées à une tâche**, avec leur date de création.
- Marquer une tâche comme **terminée**. Une tâche terminée reste visible, barrée, jusqu'à son archivage. Il n'existe pas de statut distinct pour « abandonnée » : une tâche abandonnée se marque terminée, puis s'archive.
- **Archiver** une tâche, ce qui la retire de la liste active sans la supprimer.
- Marquer une tâche non terminée comme **« ancienne »** dès qu'elle a été créée un autre jour que le jour en cours. Les tâches anciennes remontent en haut de la liste, et plus elles sont vieilles, plus elles ressortent.
- Conserver toutes les données entre deux lancements, dans un fichier local.

## Non-objectifs (version 1)

- Pas de comptes, pas de multi-utilisateur, pas de synchronisation cloud.
- Pas de rappels ni de notifications.
- Pas de date d'échéance.
- Pas de niveau d'urgence. Le besoin a été évoqué comme possible, mais il est exclu de cette version pour garder la saisie rapide. Il pourra être ajouté ensuite.
- Pas d'édition du texte d'une tâche ou d'une note, et pas de suppression définitive. Une tâche se ferme (terminée) puis s'archive. *(Choix de conception, à valider.)*
- Pas de recherche ni de catégories.

## Anti-objectifs

- Aucune perte silencieuse de données : si l'enregistrement échoue, l'utilisateur doit le voir.
- Aucune dépendance à une connexion Internet, ni à un service externe.
- Pas d'installation lourde : pas de base de données serveur, pas de framework à installer.

## Contraintes

- Système : Windows 10 ou 11, utilisation hors connexion.
- Environnement déjà présent sur la machine : Node.js 24 et Python 3.12. Le projet utilise uniquement les modules intégrés de Node.js, **sans dépendance npm**.
- Interface en français, utilisée dans un navigateur web moderne.

## Approches considérées

1. **Page web seule avec `localStorage`.** Un fichier HTML ouvert par double-clic, sans installation. Les données restent dans le navigateur, et elles disparaissent si ses données sont effacées. Il faudrait une fonction d'export pour les sauvegarder.
2. **Petit serveur local sans dépendance, page web, et fichier JSON.** *(Choisie.)* Un serveur Node.js minimal tourne sur `127.0.0.1`. Les tâches sont enregistrées dans `taches.json` à la racine du projet. Les données sont lisibles, sauvegardables, et indépendantes du navigateur. Le lancement se fait avec un fichier `.bat`.
3. **Application de bureau Electron.** Fenêtre dédiée et données dans un fichier, mais installation de plus de 100 Mo et outillage npm lourd pour une simple liste.

**Choix retenu : approche 2.** La première est trop fragile pour des données quotidiennes, et la troisième est disproportionnée pour cet usage.

## Modèle de données

Fichier `taches.json`, un tableau de tâches :

- `id` : identifiant unique.
- `texte` : texte de la tâche.
- `creeLe` : date et heure de création (ISO 8601).
- `terminee` : booléen.
- `termineLe` : date et heure de fin, ou vide.
- `archivee` : booléen.
- `notes` : liste de notes, chacune avec `id`, `texte`, `creeLe`.

## Règles de comportement

- **Tâche ancienne** : tâche non terminée et non archivée, dont la date de création est antérieure au jour en cours. Ce calcul se fait à l'affichage, avec la date locale du PC.
- **Ordre de la liste active** : les tâches anciennes d'abord, les plus vieilles en premier, puis les tâches du jour dans l'ordre de création. Les tâches terminées sont regroupées en bas de la liste active, barrées. *(Choix de conception, à valider.)*
- Une tâche terminée n'est jamais marquée « ancienne », même si elle a été créée plusieurs jours avant.
- Une tâche terminée peut être décochée pour revenir à l'état non terminé. *(Choix de conception, à valider.)*
- **Archivage** : la tâche disparaît de la liste active. Une vue « Archives » permet de les consulter. *(Choix de conception, à valider.)*
- **Notes** : ajoutées depuis une tâche, affichées sous celle-ci, et supprimables. Elles ne sont pas éditables en version 1.

## Persistance et stockage

- Chaque modification est enregistrée immédiatement dans `taches.json`.
- L'écriture se fait dans un fichier temporaire, puis par renommage, pour éviter un fichier corrompu si le PC s'éteint pendant l'écriture.
- Si le fichier n'existe pas, il est créé vide. S'il est illisible, l'application affiche une erreur explicite et ne l'écrase pas. Il n'y a pas de bouton de réinitialisation : le fichier se corrige à la main. *(Choix de conception, à valider.)*

## Lancement

- Un fichier `lancer.bat` démarre le serveur et ouvre l'application dans le navigateur par défaut, sur `http://localhost:<port>`.
- Le serveur écoute uniquement sur `127.0.0.1`, pour ne pas être accessible depuis le réseau.
- Le port est fixe. Si l'application tourne déjà, `lancer.bat` ouvre simplement le navigateur sur l'instance existante, sans démarrer un second serveur. *(Choix de conception, à valider.)*
- Pour arrêter l'application, on ferme la fenêtre de la console.

## Décisions prises pour la version 1

Réponses retenues aux trois points restés ouverts, en attendant ta validation :

- **Suppression d'une note** : définitive, après confirmation.
- **Archives** : une tâche archivée peut être restaurée depuis l'onglet Archives.
- **Notes sur une tâche terminée ou archivée** : autorisées dans la liste active. Les notes d'une tâche archivée sont en lecture seule dans les archives.

## Ce qui est laissé au constructeur

- Le découpage du code, les noms des fichiers, et le choix du port exact.
- La forme de l'API entre la page et le serveur.
- Le style visuel, dans une mise en page simple et lisible.
- Quelques tests ciblés sur les règles : calcul de « ancienne », ordre de la liste, et écriture du fichier.
- Un court `README` pour lancer l'application.
