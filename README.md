# Portfolio de Laora Aimi

Site statique (HTML, CSS, JavaScript) en français, avec une version anglaise via le bouton FR/EN.

## Structure

```
index.html                    accueil : présentation, liste des projets, parcours, compétences, contact
projet-*.html                 une page par projet (10 pages)
style.css                     mise en forme, commune à toutes les pages
script.js                     filtres de projets et bascule FR/EN
assets/photo.jpg              ta photo (portrait, ratio 4:5 conseillé)
assets/CV_Laora_Aimi.pdf      ton CV en PDF
assets/tbm/                   captures du projet TBM'ouv (extraites des diapositives)
assets/slides/                diapositives du projet TBM'ouv (FR et EN, PDF)
```

## Mettre en ligne avec GitHub Pages

1. Crée un dépôt public nommé `Laoraa.github.io` (ton nom d'utilisateur suivi de `.github.io`).
2. Envoie-y tous les fichiers à la racine du dépôt (`index.html`, `style.css`, `script.js`, dossier `assets`).
3. Dans le dépôt : **Settings > Pages**, puis **Deploy from a branch**, branche `main`, dossier `/ (root)`.
4. Après une à deux minutes, le site est disponible sur `https://laoraa.github.io`.

## Ajouter un projet

1. Duplique une page `projet-*.html` (par exemple `projet-inria.html`) et modifie le texte français ainsi que
   l'attribut `data-en` de chaque élément, qui contient la version anglaise.
2. Dans `index.html`, copie une ligne `<a class="proj" ...>` dans la liste des projets, change son `href`,
   son texte, et `data-cat` (`motorsport`, `pro` ou `academic`, ce qui décide de la couleur et du filtre).

## Avant de publier

Les diapositives PDF du projet TBM'ouv contiennent, sur la première page, les noms et les photos des
quatre autres membres de l'équipe. Vérifie leur accord, ou retire les liens vers les PDF dans `tbmouv.html`
(boutons « Diapositives »), avant de mettre le site en ligne.
