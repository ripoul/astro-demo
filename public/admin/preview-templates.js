// Prévisualisations personnalisées pour l'éditeur Decap CMS (/admin).
// Par défaut, Decap affiche un rendu générique qui ne ressemble pas du tout
// au site (pas de police, pas de couleurs, pas de mise en page). Ces
// composants reproduisent la mise en page réelle (voir preview.css) pour que
// l'aperçu corresponde à ce qui sera publié.
//
// Pas d'étape de build ici : `createClass` et `h` (= React.createElement)
// sont exposés globalement par decap-cms.js, chargé juste avant ce script.
/* global CMS, createClass, h */

var CATEGORY_LABELS = {
  resultats: 'Résultats',
  stage: 'Stage',
  actualite: 'Actualité',
};

function formatDateFr(value) {
  if (!value) return '';
  var date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

var BlogPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var title = entry.getIn(['data', 'title']) || '';
    var category = entry.getIn(['data', 'category']);
    var date = entry.getIn(['data', 'date']);
    var cover = entry.getIn(['data', 'cover']);
    var coverAlt = entry.getIn(['data', 'coverAlt']) || '';
    var coverSrc = cover ? this.props.getAsset(cover).toString() : null;

    return h(
      'article',
      { className: 'preview-post' },
      h(
        'div',
        { className: 'preview-post__meta' },
        category &&
          h(
            'span',
            { className: 'preview-badge preview-badge--' + category },
            CATEGORY_LABELS[category] || category,
          ),
        h('time', {}, formatDateFr(date)),
      ),
      h('h1', { className: 'preview-post__title' }, title),
      coverSrc &&
        h('img', {
          className: 'preview-post__cover',
          src: coverSrc,
          alt: coverAlt,
        }),
      h(
        'div',
        { className: 'preview-post__content' },
        this.props.widgetFor('body'),
      ),
    );
  },
});

var GalleryPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var alt = entry.getIn(['data', 'alt']) || '';
    var description = entry.getIn(['data', 'description']) || '';
    var date = entry.getIn(['data', 'date']);
    var image = entry.getIn(['data', 'image']);
    var src = image ? this.props.getAsset(image).toString() : null;

    return h(
      'div',
      {},
      h(
        'p',
        { className: 'preview-note' },
        "Aperçu approximatif : sur le site, cette photo apparaît d'abord en " +
          'vignette dans la mosaïque de la galerie, puis en grand avec sa ' +
          "légende lorsqu'on clique dessus — ce que montre ce bloc.",
      ),
      h(
        'figure',
        { className: 'preview-gallery__card' },
        src &&
          h('img', { className: 'preview-gallery__image', src: src, alt: alt }),
        h(
          'figcaption',
          {},
          description &&
            h('p', { className: 'preview-gallery__description' }, description),
          h('time', { className: 'preview-gallery__date' }, formatDateFr(date)),
        ),
      ),
    );
  },
});

CMS.registerPreviewStyle('/admin/preview.css');
CMS.registerPreviewTemplate('blog', BlogPreview);
CMS.registerPreviewTemplate('gallery', GalleryPreview);
