# prj-mgl843
# Introduction
Ce projet est proposé par l'équipe 3 composée de Arol Gbeto-Fia, Massiwen Akrour, Axel Zombré et Audrey Chapda.
Dans le cadre du cours de Sujets avancés en Conception Logicielle (MGL843, École de Technologie Supérieure), il nous est demandé de concevoir et développer un outil d'analyse empirique de projets écrits en langage TypeScript.
Nous identifions principalement trois (03) fonctionnalités à savoir :
- Le parcours des fichiers source d'un projet TypeScript
- La génération d'un modèle haut niveau FAMIX (fichier au format MSE)
- La vérification du code FAMIX généré et sa validation dans l'Environnement de développement de Pharo

# Point d'étape
- A ce jour, notre outil est capable de parcourir les fichiers source d'un projet fourni en entrée (dans le répertoire /entities)
- Nous sommes en mesure de modéliser les classes et leurs composantes (propriétés, méthodes)
- Nous avons réussi à modélier les héritages entre les classes
- Nous avons réussi à représenter les FileAnchor pour les éléments parcourus
- Les types, les accès, les paramètres des méthodes sont également représentés
- Nous pouvons générer un fichier MSE valide et exploitable dans Moose, à partir des représentations qui proviennent de l'analyse

# Procédure d'utilisation
Remarque : Il est possible de cloner ou télécharger ce dépôt et d'ouvrir ensuite le projet dans l'IDE Visual Studio Code. Cependant, on peut juste utiliser une invite de commande pour la compilation et l'exécution du code. Il faut aussi au préalabre avoir installé Node.js sur le poste de travail qu'on souhaite utiliser et installer le compilateur TypeScript à l'aide de la commande "npm install -g typescript" (dans un terminal).
1. Copier le code source du projet TypeScript à analyser dans le répertoire "entities".
2. Ouvrir une invite de commande et se placer à la racine du répertoire du projet.
3. Exécuter la commande "ts-node ts2famix.ts". Si elle ne fonctionne pas ou donne des erreurs, exécuter les commandes "tsc ts2famix.ts" et "node  ts2famix.js". La première commande permet de compiler le code TypeScript et de générer du code JavaScript (fichier à extension "js"). La deuxième permet d'exécuter le code JavaScript se trouvant dans le fichier en paramètre. Le coeur de notre outil se trouve dans le fichier "ts2famix.ts".
4. Un fichier "FAMIXModel.mse" sera généré à la racine du répertoire du projet. Il contient le métamodèle correspondant au projet TypeScript fourni en entrée.

# Améliorations futures
Nous avons en projet d'améliorer cette version de notre outil, en étendant l'analyse aux fonctions se trouvant en dehors des classes et en représentant davantage d'entités dans notre modèle.

