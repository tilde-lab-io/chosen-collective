// @prepros-prepend ./components/_util.js

// @prepros-prepend ./components/_home.js

// @prepros-prepend ./components/_about.js

// @prepros-prepend ./components/_reset-retreat.js

// @prepros-prepend ./components/_reservations.js

// @prepros-prepend ./tools/flickity.js

// @prepros-prepend ./tools/masonry.js

// @prepros-prepend ./tools/images-loaded.js



/* Initializers */
var flkty = new Flickity('.client-testimonials', {
    // options
    initialIndex: 0,
    setGallerySize: false,
    wrapAround: true,
    accessibility: true,
    cellAlign: 'left',
    draggable: true,
    adaptiveHeight: false,
    selectedAttraction: 0.2,
    friction: 0.8,
    autoPlay: 7000,
});

var msnry = new Masonry( '.masonry-grid', {
    // options
    itemSelector: '.masonry-grid-item',
    fitWith: true,
    columnWidth: 414.66,
    gutter: 15,
    transitionDuration: '0.2s',
    stagger: 30
});