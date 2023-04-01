//@prepros-prepend ./components/_util.js

//@prepros-prepend ./components/_home.js

//@prepros-prepend ./components/_about.js

//@prepros-prepend ./components/_services.js

//@prepros-prepend ./components/_reset-retreat.js

//@prepros-prepend ./components/_reservations.js

//@prepros-prepend ./tools/flickity.js

//@prepros-prepend ./tools/isotope.js

//@prepros-prepend ./tools/images-loaded.js

//@prepros-prepend ./tools/aos.js



/* Initializers */

AOS.init({
    offset: 200,
    duration: 600,
    easing: 'ease-in-sine',
    delay: 100,
    once: true,
    mirror: false,
    disable: function () {
        let maxWidth = 1024;
        return window.innerWidth < maxWidth;
    },
});

let carousel = document.querySelector('.client-testimonials');
let flkty;

flkty = new Flickity(carousel, {
    // options
    cellSelector: '.testimonial-slide',
    initialIndex: 0,
    setGallerySize: true,
    wrapAround: true,
    accessibility: true,
    cellAlign: 'left',
    draggable: true,
    adaptiveHeight: false,
    selectedAttraction: 0.2,
    friction: 0.8,
    autoPlay: 6000,
    fade: true,
});


var elem = document.querySelector('.masonry-grid');
var iso;
iso = new Isotope(elem, {
    //options
    itemSelector: '.masonry-grid-item',
    masonry: {
        fitWith: true,
        columnWidth: 414.66,
        gutter: 15,
        stagger: 30,
        transitionDuration: '0.2s',
    }
});