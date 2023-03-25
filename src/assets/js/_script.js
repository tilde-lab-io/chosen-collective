// @prepros-prepend ./util.js

// @prepros-prepend ./flickity.js

// @prepros-prepend ./masonry.js

// @prepros-prepend ./images-loaded.js

// @prepros-prepend ./_home.js

// @prepros-prepend ./_about.js

// @prepros-prepend ./_reset-retreat.js

// @prepros-prepend ./_reservations.js


/* Start of custom JS */
var flkty = new Flickity('#client-testimonials', {
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