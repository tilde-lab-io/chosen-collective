
// Utility function
function Util () {}

/* class manipulation functions */
Util.hasClass = function(el, className) {
    return el.classList.contains(className);
};

Util.addClass = function(el, className) {
    let classList = className.split(' ');
    el.classList.add(classList[0]);
    if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
    let classList = className.split(' ');
    el.classList.remove(classList[0]);
    if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
    if(bool) Util.addClass(el, className);
    else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
    for(var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
};

/* DOM manipulation */
Util.getChildrenByClassName = function(el, className) {
    var children = el.children,
        childrenByClass = [];
    for (var i = 0; i < children.length; i++) {
        if (Util.hasClass(children[i], className)) childrenByClass.push(children[i]);
    }
    return childrenByClass;
};

Util.is = function(elem, selector) {
    if(selector.nodeType){
        return elem === selector;
    }

    var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
        length = qa.length;

    while(length--){
        if(qa[length] === elem){
            return true;
        }
    }

    return false;
};

/* Animate height of an element */
Util.setHeight = function(start, to, element, duration, cb, timeFunction) {
    var change = to - start,
        currentTime = null;

    var animateHeight = function(timestamp){
        if (!currentTime) currentTime = timestamp;
        var progress = timestamp - currentTime;
        if(progress > duration) progress = duration;
        var val = parseInt((progress/duration)*change + start);
        if(timeFunction) {
            val = Math[timeFunction](progress, start, to - start, duration);
        }
        element.style.height = val+"px";
        if(progress < duration) {
            window.requestAnimationFrame(animateHeight);
        } else {
            if(cb) cb();
        }
    };

    //set the height of the element before starting animation -> fix bug on Safari
    element.style.height = start+"px";
    window.requestAnimationFrame(animateHeight);
};

/* Smooth Scroll */
Util.scrollTo = function(final, duration, cb, scrollEl) {
    var element = scrollEl || window;
    var start = element.scrollTop || document.documentElement.scrollTop,
        currentTime = null;

    if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;

    var animateScroll = function(timestamp){
        if (!currentTime) currentTime = timestamp;
        var progress = timestamp - currentTime;
        if(progress > duration) progress = duration;
        var val = Math.easeInOutQuad(progress, start, final-start, duration);
        element.scrollTo(0, val);
        if(progress < duration) {
            window.requestAnimationFrame(animateScroll);
        } else {
            cb && cb();
        }
    };

    window.requestAnimationFrame(animateScroll);
};

/* Move Focus */
Util.moveFocus = function (element) {
    if( !element ) element = document.getElementsByTagName("body")[0];
    element.focus();
    if (document.activeElement !== element) {
        element.setAttribute('tabindex','-1');
        element.focus();
    }
};

/* Misc */

Util.getIndexInArray = function(array, el) {
    return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
    return CSS.supports(property, value);
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;

    // Check if a deep merge
    if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
        deep = arguments[0];
        i++;
    }

    // Merge the object into the extended object
    var merge = function (obj) {
        for ( var prop in obj ) {
            if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                // If deep merge and property is an object, merge properties
                if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                    extended[prop] = extend( true, extended[prop], obj[prop] );
                } else {
                    extended[prop] = obj[prop];
                }
            }
        }
    };

    // Loop through each object and conduct a merge
    for ( ; i < length; i++ ) {
        var obj = arguments[i];
        merge(obj);
    }

    return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
    if(!window.matchMedia) return false;
    var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
    if(matchMediaObj) return matchMediaObj.matches;
    return false; // return false if not supported
};

/* Animation curves */
Math.easeInOutQuad = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
    t /= d;
    return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) {
    t /= d;
    t--;
    return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t*t*t + b;
    t -= 2;
    return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
    var s=1.70158;var p=d*0.7;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */

// make focus ring visible only for keyboard navigation (i.e., tab key) 
(function() {
    var focusTab = document.getElementsByClassName('js-tab-focus'),
        shouldInit = false,
        outlineStyle = false,
        eventDetected = false;

    function detectClick() {
        if(focusTab.length > 0) {
            resetFocusStyle(false);
            window.addEventListener('keydown', detectTab);
        }
        window.removeEventListener('mousedown', detectClick);
        outlineStyle = false;
        eventDetected = true;
    };

    function detectTab(event) {
        if(event.keyCode !== 9) return;
        resetFocusStyle(true);
        window.removeEventListener('keydown', detectTab);
        window.addEventListener('mousedown', detectClick);
        outlineStyle = true;
    };

    function resetFocusStyle(bool) {
        var outlineStyle = bool ? '' : 'none';
        for(var i = 0; i < focusTab.length; i++) {
            focusTab[i].style.setProperty('outline', outlineStyle);
        }
    };

    function initFocusTabs() {
        if(shouldInit) {
            if(eventDetected) resetFocusStyle(outlineStyle);
            return;
        }
        shouldInit = focusTab.length > 0;
        window.addEventListener('mousedown', detectClick);
    };

    initFocusTabs();
    window.addEventListener('initFocusTabs', initFocusTabs);
}());

function resetFocusTabsStyle() {
    window.dispatchEvent(new CustomEvent('initFocusTabs'));
}

// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function() {
    var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
    if( menuBtns.length > 0 ) {
        for(var i = 0; i < menuBtns.length; i++) {(function(i){
            initMenuBtn(menuBtns[i]);
        })(i);}

        function initMenuBtn(btn) {
            btn.addEventListener('click', function(event){
                event.preventDefault();
                var status = !Util.hasClass(btn, 'anim-menu-btn--state-b');
                Util.toggleClass(btn, 'anim-menu-btn--state-b', status);
                // emit custom event
                var event = new CustomEvent('anim-menu-btn-clicked', {detail: status});
                btn.dispatchEvent(event);
            });
        }
    }
}());

// File#: flexi-header
// Usage: codyhouse.co/license
(function() {
    var flexHeader = document.getElementsByClassName('js-f-header');
    if(flexHeader.length > 0) {
        var menuTrigger = flexHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
            firstFocusableElement = getMenuFirstFocusable();

        // we'll use these to store the node that needs to receive focus when the mobile menu is closed 
        var focusMenu = false;

        resetFlexHeaderOffset();
        setAriaButtons();

        menuTrigger.addEventListener('anim-menu-btn-clicked', function(event){
            toggleMenuNavigation(event.detail);
        });

        // listen for key events
        window.addEventListener('keyup', function(event){
            // listen for esc key
            if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
                // close navigation on mobile if open
                if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
                    focusMenu = menuTrigger; // move focus to menu trigger when menu is close
                    menuTrigger.click();
                }
            }
            // listen for tab key
            if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
                // close navigation on mobile if open when nav loses focus
                if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-f-header')) menuTrigger.click();
            }
        });

        // detect click on a dropdown control button - expand-on-mobile only
        flexHeader[0].addEventListener('click', function(event){
            var btnLink = event.target.closest('.js-f-header__dropdown-control');
            if(!btnLink) return;
            !btnLink.getAttribute('aria-expanded') ? btnLink.setAttribute('aria-expanded', 'true') : btnLink.removeAttribute('aria-expanded');
        });

        // detect mouseout from a dropdown control button - expand-on-mobile only
        flexHeader[0].addEventListener('mouseout', function(event){
            var btnLink = event.target.closest('.js-f-header__dropdown-control');
            if(!btnLink) return;
            // check layout type
            if(getLayout() == 'mobile') return;
            btnLink.removeAttribute('aria-expanded');
        });

        // close dropdown on focusout - expand-on-mobile only
        flexHeader[0].addEventListener('focusin', function(event){
            var btnLink = event.target.closest('.js-f-header__dropdown-control'),
                dropdown = event.target.closest('.f-header__dropdown');
            if(dropdown) return;
            if(btnLink && btnLink.hasAttribute('aria-expanded')) return;
            // check layout type
            if(getLayout() == 'mobile') return;
            var openDropdown = flexHeader[0].querySelector('.js-f-header__dropdown-control[aria-expanded="true"]');
            if(openDropdown) openDropdown.removeAttribute('aria-expanded');
        });

        // listen for resize
        var resizingId = false;
        window.addEventListener('resize', function() {
            clearTimeout(resizingId);
            resizingId = setTimeout(doneResizing, 500);
        });

        function getMenuFirstFocusable() {
            var focusableEle = flexHeader[0].getElementsByClassName('f-header__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
                firstFocusable = false;
            for(var i = 0; i < focusableEle.length; i++) {
                if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
                    firstFocusable = focusableEle[i];
                    break;
                }
            }

            return firstFocusable;
        };

        function isVisible(element) {
            return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        };

        function doneResizing() {
            if( !isVisible(menuTrigger) && Util.hasClass(flexHeader[0], 'f-header--expanded')) {
                menuTrigger.click();
            }
            resetFlexHeaderOffset();
        };

        function toggleMenuNavigation(bool) { // toggle menu visibility on small devices
            Util.toggleClass(document.getElementsByClassName('f-header__nav')[0], 'f-header__nav--is-visible', bool);
            Util.toggleClass(flexHeader[0], 'f-header--expanded', bool);
            menuTrigger.setAttribute('aria-expanded', bool);
            if(bool) firstFocusableElement.focus(); // move focus to first focusable element
            else if(focusMenu) {
                focusMenu.focus();
                focusMenu = false;
            }
        };

        function resetFlexHeaderOffset() {
            // on mobile -> update max height of the flexi header based on its offset value (e.g., if there's a fixed pre-header element)
            document.documentElement.style.setProperty('--f-header-offset', flexHeader[0].getBoundingClientRect().top+'px');
        };

        function setAriaButtons() {
            var btnDropdown = flexHeader[0].getElementsByClassName('js-f-header__dropdown-control');
            for(var i = 0; i < btnDropdown.length; i++) {
                var id = 'f-header-dropdown-'+i,
                    dropdown = btnDropdown[i].nextElementSibling;
                if(dropdown.hasAttribute('id')) {
                    id = dropdown.getAttribute('id');
                } else {
                    dropdown.setAttribute('id', id);
                }
                btnDropdown[i].setAttribute('aria-controls', id);
            }
        };

        function getLayout() {
            return getComputedStyle(flexHeader[0], ':before').getPropertyValue('content').replace(/\'|"/g, '');
        };
    }
}());

// File#: _1_swipe-content
(function() {
    var SwipeContent = function(element) {
        this.element = element;
        this.delta = [false, false];
        this.dragging = false;
        this.intervalId = false;
        initSwipeContent(this);
    };

    function initSwipeContent(content) {
        content.element.addEventListener('mousedown', handleEvent.bind(content));
        content.element.addEventListener('touchstart', handleEvent.bind(content), {passive: true});
    };

    function initDragging(content) {
        //add event listeners
        content.element.addEventListener('mousemove', handleEvent.bind(content));
        content.element.addEventListener('touchmove', handleEvent.bind(content), {passive: true});
        content.element.addEventListener('mouseup', handleEvent.bind(content));
        content.element.addEventListener('mouseleave', handleEvent.bind(content));
        content.element.addEventListener('touchend', handleEvent.bind(content));
    };

    function cancelDragging(content) {
        //remove event listeners
        if(content.intervalId) {
            (!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
            content.intervalId = false;
        }
        content.element.removeEventListener('mousemove', handleEvent.bind(content));
        content.element.removeEventListener('touchmove', handleEvent.bind(content));
        content.element.removeEventListener('mouseup', handleEvent.bind(content));
        content.element.removeEventListener('mouseleave', handleEvent.bind(content));
        content.element.removeEventListener('touchend', handleEvent.bind(content));
    };

    function handleEvent(event) {
        switch(event.type) {
            case 'mousedown':
            case 'touchstart':
                startDrag(this, event);
                break;
            case 'mousemove':
            case 'touchmove':
                drag(this, event);
                break;
            case 'mouseup':
            case 'mouseleave':
            case 'touchend':
                endDrag(this, event);
                break;
        }
    };

    function startDrag(content, event) {
        content.dragging = true;
        // listen to drag movements
        initDragging(content);
        content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
        // emit drag start event
        emitSwipeEvents(content, 'dragStart', content.delta, event.target);
    };

    function endDrag(content, event) {
        cancelDragging(content);
        // credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
        var dx = parseInt(unify(event).clientX),
            dy = parseInt(unify(event).clientY);

        // check if there was a left/right swipe
        if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
            var s = getSign(dx - content.delta[0]);

            if(Math.abs(dx - content.delta[0]) > 30) {
                (s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);
            }

            content.delta[0] = false;
        }
        // check if there was a top/bottom swipe
        if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
            var y = getSign(dy - content.delta[1]);

            if(Math.abs(dy - content.delta[1]) > 30) {
                (y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
            }

            content.delta[1] = false;
        }
        // emit drag end event
        emitSwipeEvents(content, 'dragEnd', [dx, dy]);
        content.dragging = false;
    };

    function drag(content, event) {
        if(!content.dragging) return;
        // emit dragging event with coordinates
        (!window.requestAnimationFrame)
            ? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250)
            : content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
    };

    function emitDrag(event) {
        emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
    };

    function unify(event) {
        // unify mouse and touch events
        return event.changedTouches ? event.changedTouches[0] : event;
    };

    function emitSwipeEvents(content, eventName, detail, el) {
        var trigger = false;
        if(el) trigger = el;
        // emit event with coordinates
        var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
        content.element.dispatchEvent(event);
    };

    function getSign(x) {
        if(!Math.sign) {
            return ((x > 0) - (x < 0)) || +x;
        } else {
            return Math.sign(x);
        }
    };

    window.SwipeContent = SwipeContent;

    //initialize the SwipeContent objects
    var swipe = document.getElementsByClassName('js-swipe-content');
    if( swipe.length > 0 ) {
        for( var i = 0; i < swipe.length; i++) {
            (function(i){new SwipeContent(swipe[i]);})(i);
        }
    }
}());

// File#: _2_slideshow
// Usage: codyhouse.co/license
(function() {
    var Slideshow = function(opts) {
        this.options = Util.extend(Slideshow.defaults , opts);
        this.element = this.options.element;
        this.items = this.element.getElementsByClassName('js-slideshow__item');
        this.controls = this.element.getElementsByClassName('js-slideshow__control');
        this.selectedSlide = 0;
        this.autoplayId = false;
        this.autoplayPaused = false;
        this.navigation = false;
        this.navCurrentLabel = false;
        this.ariaLive = false;
        this.moveFocus = false;
        this.animating = false;
        this.supportAnimation = Util.cssSupports('transition');
        this.animationOff = (!Util.hasClass(this.element, 'slideshow--transition-fade') && !Util.hasClass(this.element, 'slideshow--transition-slide') && !Util.hasClass(this.element, 'slideshow--transition-prx'));
        this.animationType = Util.hasClass(this.element, 'slideshow--transition-prx') ? 'prx' : 'slide';
        this.animatingClass = 'slideshow--is-animating';
        initSlideshow(this);
        initSlideshowEvents(this);
        initAnimationEndEvents(this);
    };

    Slideshow.prototype.showNext = function() {
        showNewItem(this, this.selectedSlide + 1, 'next');
    };

    Slideshow.prototype.showPrev = function() {
        showNewItem(this, this.selectedSlide - 1, 'prev');
    };

    Slideshow.prototype.showItem = function(index) {
        showNewItem(this, index, false);
    };

    Slideshow.prototype.startAutoplay = function() {
        var self = this;
        if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
            self.autoplayId = setInterval(function(){
                self.showNext();
            }, self.options.autoplayInterval);
        }
    };

    Slideshow.prototype.pauseAutoplay = function() {
        var self = this;
        if(this.options.autoplay) {
            clearInterval(self.autoplayId);
            self.autoplayId = false;
        }
    };

    function initSlideshow(slideshow) { // basic slideshow settings
        // if no slide has been selected -> select the first one
        if(slideshow.element.getElementsByClassName('slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow__item--selected');
        slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow__item--selected')[0]);
        // create an element that will be used to announce the new visible slide to SR
        var srLiveArea = document.createElement('div');
        Util.setAttributes(srLiveArea, {'class': 'sr-only js-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
        slideshow.element.appendChild(srLiveArea);
        slideshow.ariaLive = srLiveArea;
    };

    function initSlideshowEvents(slideshow) {
        // if slideshow navigation is on -> create navigation HTML and add event listeners
        if(slideshow.options.navigation) {
            // check if navigation has already been included
            if(slideshow.element.getElementsByClassName('js-slideshow__navigation').length == 0) {
                var navigation = document.createElement('ol'),
                    navChildren = '';

                var navClasses = slideshow.options.navigationClass+' js-slideshow__navigation';
                if(slideshow.items.length <= 1) {
                    navClasses = navClasses + ' hide';
                }

                navigation.setAttribute('class', navClasses);
                for(var i = 0; i < slideshow.items.length; i++) {
                    var className = (i == slideshow.selectedSlide) ? 'class="'+slideshow.options.navigationItemClass+' '+slideshow.options.navigationItemClass+'--selected js-slideshow__nav-item"' :  'class="'+slideshow.options.navigationItemClass+' js-slideshow__nav-item"',
                        navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-slideshow__nav-current-label">Current Item</span>' : '';
                    navChildren = navChildren + '<li '+className+'><button class="reset"><span class="sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
                }
                navigation.innerHTML = navChildren;
                slideshow.element.appendChild(navigation);
            }

            slideshow.navCurrentLabel = slideshow.element.getElementsByClassName('js-slideshow__nav-current-label')[0];
            slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow__nav-item');

            var dotsNavigation = slideshow.element.getElementsByClassName('js-slideshow__navigation')[0];

            dotsNavigation.addEventListener('click', function(event){
                navigateSlide(slideshow, event, true);
            });
            dotsNavigation.addEventListener('keyup', function(event){
                navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
            });
        }
        // slideshow arrow controls
        if(slideshow.controls.length > 0) {
            // hide controls if one item available
            if(slideshow.items.length <= 1) {
                Util.addClass(slideshow.controls[0], 'hide');
                Util.addClass(slideshow.controls[1], 'hide');
            }
            slideshow.controls[0].addEventListener('click', function(event){
                event.preventDefault();
                slideshow.showPrev();
                updateAriaLive(slideshow);
            });
            slideshow.controls[1].addEventListener('click', function(event){
                event.preventDefault();
                slideshow.showNext();
                updateAriaLive(slideshow);
            });
        }
        // swipe events
        if(slideshow.options.swipe) {
            //init swipe
            new SwipeContent(slideshow.element);
            slideshow.element.addEventListener('swipeLeft', function(event){
                slideshow.showNext();
            });
            slideshow.element.addEventListener('swipeRight', function(event){
                slideshow.showPrev();
            });
        }
        // autoplay
        if(slideshow.options.autoplay) {
            slideshow.startAutoplay();
            // pause autoplay if user is interacting with the slideshow
            if(!slideshow.options.autoplayOnHover) {
                slideshow.element.addEventListener('mouseenter', function(event){
                    slideshow.pauseAutoplay();
                    slideshow.autoplayPaused = true;
                });
                slideshow.element.addEventListener('mouseleave', function(event){
                    slideshow.autoplayPaused = false;
                    slideshow.startAutoplay();
                });
            }
            if(!slideshow.options.autoplayOnFocus) {
                slideshow.element.addEventListener('focusin', function(event){
                    slideshow.pauseAutoplay();
                    slideshow.autoplayPaused = true;
                });
                slideshow.element.addEventListener('focusout', function(event){
                    slideshow.autoplayPaused = false;
                    slideshow.startAutoplay();
                });
            }
        }
        // detect if external buttons control the slideshow
        var slideshowId = slideshow.element.getAttribute('id');
        if(slideshowId) {
            var externalControls = document.querySelectorAll('[data-controls="'+slideshowId+'"]');
            for(var i = 0; i < externalControls.length; i++) {
                (function(i){externalControlSlide(slideshow, externalControls[i]);})(i);
            }
        }
        // custom event to trigger selection of a new slide element
        slideshow.element.addEventListener('selectNewItem', function(event){
            // check if slide is already selected
            if(event.detail) {
                if(event.detail - 1 == slideshow.selectedSlide) return;
                showNewItem(slideshow, event.detail - 1, false);
            }
        });

        // keyboard navigation
        slideshow.element.addEventListener('keydown', function(event){
            if(event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
                slideshow.showNext();
            } else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
                slideshow.showPrev();
            }
        });
    };

    function navigateSlide(slideshow, event, keyNav) {
        // user has interacted with the slideshow navigation -> update visible slide
        var target = ( Util.hasClass(event.target, 'js-slideshow__nav-item') ) ? event.target : event.target.closest('.js-slideshow__nav-item');
        if(keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
            slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
            slideshow.moveFocus = true;
            updateAriaLive(slideshow);
        }
    };

    function initAnimationEndEvents(slideshow) {
        // remove animation classes at the end of a slide transition
        for( var i = 0; i < slideshow.items.length; i++) {
            (function(i){
                slideshow.items[i].addEventListener('animationend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
                slideshow.items[i].addEventListener('transitionend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
            })(i);
        }
    };

    function resetAnimationEnd(slideshow, item) {
        setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
            if(Util.hasClass(item,'slideshow__item--selected')) {
                if(slideshow.moveFocus) Util.moveFocus(item);
                emitSlideshowEvent(slideshow, 'newItemVisible', slideshow.selectedSlide);
                slideshow.moveFocus = false;
            }
            Util.removeClass(item, 'slideshow__item--'+slideshow.animationType+'-out-left slideshow__item--'+slideshow.animationType+'-out-right slideshow__item--'+slideshow.animationType+'-in-left slideshow__item--'+slideshow.animationType+'-in-right');
            item.removeAttribute('aria-hidden');
            slideshow.animating = false;
            Util.removeClass(slideshow.element, slideshow.animatingClass);
        }, 100);
    };

    function showNewItem(slideshow, index, bool) {
        if(slideshow.items.length <= 1) return;
        if(slideshow.animating && slideshow.supportAnimation) return;
        slideshow.animating = true;
        Util.addClass(slideshow.element, slideshow.animatingClass);
        if(index < 0) index = slideshow.items.length - 1;
        else if(index >= slideshow.items.length) index = 0;
        // skip slideshow item if it is hidden
        if(bool && Util.hasClass(slideshow.items[index], 'hide')) {
            slideshow.animating = false;
            index = bool == 'next' ? index + 1 : index - 1;
            showNewItem(slideshow, index, bool);
            return;
        }
        // index of new slide is equal to index of slide selected item
        if(index == slideshow.selectedSlide) {
            slideshow.animating = false;
            return;
        }
        var exitItemClass = getExitItemClass(slideshow, bool, slideshow.selectedSlide, index);
        var enterItemClass = getEnterItemClass(slideshow, bool, slideshow.selectedSlide, index);
        // transition between slides
        if(!slideshow.animationOff) Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
        Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
        slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
        if(slideshow.animationOff) {
            Util.addClass(slideshow.items[index], 'slideshow__item--selected');
        } else {
            Util.addClass(slideshow.items[index], enterItemClass+' slideshow__item--selected');
        }
        // reset slider navigation appearance
        resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
        slideshow.selectedSlide = index;
        // reset autoplay
        slideshow.pauseAutoplay();
        slideshow.startAutoplay();
        // reset controls/navigation color themes
        resetSlideshowTheme(slideshow, index);
        // emit event
        emitSlideshowEvent(slideshow, 'newItemSelected', slideshow.selectedSlide);
        if(slideshow.animationOff) {
            slideshow.animating = false;
            Util.removeClass(slideshow.element, slideshow.animatingClass);
        }
    };

    function getExitItemClass(slideshow, bool, oldIndex, newIndex) {
        var className = '';
        if(bool) {
            className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-out-right' : 'slideshow__item--'+slideshow.animationType+'-out-left';
        } else {
            className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-out-left' : 'slideshow__item--'+slideshow.animationType+'-out-right';
        }
        return className;
    };

    function getEnterItemClass(slideshow, bool, oldIndex, newIndex) {
        var className = '';
        if(bool) {
            className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-in-right' : 'slideshow__item--'+slideshow.animationType+'-in-left';
        } else {
            className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-in-left' : 'slideshow__item--'+slideshow.animationType+'-in-right';
        }
        return className;
    };

    function resetSlideshowNav(slideshow, newIndex, oldIndex) {
        if(slideshow.navigation) {
            Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
            Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
            slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
            slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
        }
    };

    function resetSlideshowTheme(slideshow, newIndex) {
        var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
        if(dataTheme) {
            if(slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
            if(slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
        } else {
            if(slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
            if(slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
        }
    };

    function emitSlideshowEvent(slideshow, eventName, detail) {
        var event = new CustomEvent(eventName, {detail: detail});
        slideshow.element.dispatchEvent(event);
    };

    function updateAriaLive(slideshow) {
        slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
    };

    function externalControlSlide(slideshow, button) { // control slideshow using external element
        button.addEventListener('click', function(event){
            var index = button.getAttribute('data-index');
            if(!index || index == slideshow.selectedSlide + 1) return;
            event.preventDefault();
            showNewItem(slideshow, index - 1, false);
        });
    };

    Slideshow.defaults = {
        element : '',
        navigation : true,
        autoplay : false,
        autoplayOnHover: false,
        autoplayOnFocus: false,
        autoplayInterval: 5000,
        navigationItemClass: 'slideshow__nav-item',
        navigationClass: 'slideshow__navigation',
        swipe: false
    };

    window.Slideshow = Slideshow;

    //initialize the Slideshow objects
    var slideshows = document.getElementsByClassName('js-slideshow');
    if( slideshows.length > 0 ) {
        for( var i = 0; i < slideshows.length; i++) {
            (function(i){
                var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
                    autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
                    autoplayOnHover = (slideshows[i].getAttribute('data-autoplay-hover') && slideshows[i].getAttribute('data-autoplay-hover') == 'on') ? true : false,
                    autoplayOnFocus = (slideshows[i].getAttribute('data-autoplay-focus') && slideshows[i].getAttribute('data-autoplay-focus') == 'on') ? true : false,
                    autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
                    swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false,
                    navigationItemClass = slideshows[i].getAttribute('data-navigation-item-class') ? slideshows[i].getAttribute('data-navigation-item-class') : 'slideshow__nav-item',
                    navigationClass = slideshows[i].getAttribute('data-navigation-class') ? slideshows[i].getAttribute('data-navigation-class') : 'slideshow__navigation';
                new Slideshow({element: slideshows[i], navigation: navigation, autoplay : autoplay, autoplayOnHover: autoplayOnHover, autoplayOnFocus: autoplayOnFocus, autoplayInterval : autoplayInterval, swipe : swipe, navigationItemClass: navigationItemClass, navigationClass: navigationClass});
            })(i);
        }
    }
}());


// File#: _3_testimonial-banner
// Usage: codyhouse.co/license
(function() {
    var Tbanner = function(element) {
        this.element = element;
        this.slideshowContent = this.element.getElementsByClassName('js-t-banner__content-slideshow');
        this.slideshowBg = this.element.getElementsByClassName('js-t-banner__bg-slideshow');
        this.navControls = this.element.getElementsByClassName('js-slideshow__control');

        initSlideshow(this);
        initBannerNavigation(this);
    };

    function initSlideshow(banner) {
        // init background and content slideshows
        banner.slideshowContentObj = new Slideshow({element: banner.slideshowContent[0], navigation: false});
        banner.slideshowBgObj = new Slideshow({element: banner.slideshowBg[0], navigation: false});
    };

    function initBannerNavigation(banner) {
        if(banner.navControls.length < 2) return;
        // use arrows to navigate the slideshow
        banner.navControls[0].addEventListener('click', function(){
            updateSlideshow(banner, 'prev');
        });

        banner.navControls[1].addEventListener('click', function(){
            updateSlideshow(banner, 'next');
        });
    };

    function updateSlideshow(banner, direction) {
        if(direction == 'next') {
            banner.slideshowContentObj.showNext();
            banner.slideshowBgObj.showNext();
        } else {
            banner.slideshowContentObj.showPrev();
            banner.slideshowBgObj.showPrev();
        }
    };

    // init Tbanner obj
    var tBanner = document.getElementsByClassName('js-t-banner');
    if(tBanner.length > 0) {
        for( var i = 0; i < tBanner.length; i++) {
            new Tbanner(tBanner[i]);
        }
    }
}());
// File#: _1_masonry
// Usage: codyhouse.co/license

(function() {
    var Masonry = function(element) {
        this.element = element;
        this.list = this.element.getElementsByClassName('js-masonry__list')[0];
        this.items = this.element.getElementsByClassName('js-masonry__item');
        this.activeColumns = 0;
        this.colStartWidth = 0; // col min-width (defined in CSS using --masonry-col-auto-size variable)
        this.colWidth = 0; // effective column width
        this.colGap = 0;
        // store col heights and items
        this.colHeights = [];
        this.colItems = [];
        // flex full support
        this.flexSupported = checkFlexSupported(this.items[0]);
        getGridLayout(this); // get initial grid params
        setGridLayout(this); // set grid params (width of elements)
        initMasonryLayout(this); // init gallery layout
    };

    function checkFlexSupported(item) {
        var itemStyle = window.getComputedStyle(item);
        return itemStyle.getPropertyValue('flex-basis') !== 'auto';
    };

    function getGridLayout(grid) { // this is used to get initial grid details (width/grid gap)
        var itemStyle = window.getComputedStyle(grid.items[0]);
        if( grid.colStartWidth === 0) {
            grid.colStartWidth = parseFloat(itemStyle.getPropertyValue('width'));
        }
        grid.colGap = parseFloat(itemStyle.getPropertyValue('margin-right'));
    };

    function setGridLayout(grid) { // set width of items in the grid
        var containerWidth = parseFloat(window.getComputedStyle(grid.element).getPropertyValue('width'));
        grid.activeColumns = parseInt((containerWidth + grid.colGap)/(grid.colStartWidth+grid.colGap));
        if(grid.activeColumns == 0) grid.activeColumns = 1;
        grid.colWidth = parseFloat((containerWidth - (grid.activeColumns - 1)*grid.colGap)/grid.activeColumns);
        for(var i = 0; i < grid.items.length; i++) {
            grid.items[i].style.width = grid.colWidth+'px'; // reset items width
        }
    };

    function initMasonryLayout(grid) {
        if(grid.flexSupported) {
            checkImgLoaded(grid); // reset layout when images are loaded
        } else {
            Util.addClass(grid.element, 'masonry--loaded'); // make sure the gallery is visible
        }

        grid.element.addEventListener('masonry-resize', function(){ // window has been resized -> reset masonry layout
            getGridLayout(grid);
            setGridLayout(grid);
            if(grid.flexSupported) layItems(grid);
        });

        grid.element.addEventListener('masonry-reset', function(event){ // reset layout (e.g., new items added to the gallery)
            if(grid.flexSupported) checkImgLoaded(grid);
        });

        // if there are fonts to be loaded -> reset masonry 
        if(document.fonts) {
            document.fonts.onloadingdone = function (fontFaceSetEvent) {
                if(!grid.masonryLaid) return;
                getGridLayout(grid);
                setGridLayout(grid);
                if(grid.flexSupported) layItems(grid);
            };
        }
    };

    function layItems(grid) {
        Util.addClass(grid.element, 'masonry--loaded'); // make sure the gallery is visible
        grid.colHeights = [];
        grid.colItems = [];

        // grid layout has already been set -> update container height and order of items
        for(var j = 0; j < grid.activeColumns; j++) {
            grid.colHeights.push(0); // reset col heights
            grid.colItems[j] = []; // reset items order
        }

        for(var i = 0; i < grid.items.length; i++) {
            var minHeight = Math.min.apply( Math, grid.colHeights ),
                index = grid.colHeights.indexOf(minHeight);
            if(grid.colItems[index]) grid.colItems[index].push(i);
            grid.items[i].style.flexBasis = 0; // reset flex basis before getting height
            var itemHeight = grid.items[i].getBoundingClientRect().height || grid.items[i].offsetHeight || 1;
            grid.colHeights[index] = grid.colHeights[index] + grid.colGap + itemHeight;
        }

        // reset height of container
        var masonryHeight = Math.max.apply( Math, grid.colHeights ) + 5;
        grid.list.style.cssText = 'height: '+ masonryHeight + 'px;';

        // go through elements and set flex order
        var order = 0;
        for(var i = 0; i < grid.colItems.length; i++) {
            for(var j = 0; j < grid.colItems[i].length; j++) {
                grid.items[grid.colItems[i][j]].style.order = order;
                order = order + 1;
            }
            // change flex-basis of last element of each column, so that next element shifts to next col
            var lastItemCol = grid.items[grid.colItems[i][grid.colItems[i].length - 1]];
            if(lastItemCol) lastItemCol.style.flexBasis = masonryHeight - grid.colHeights[i] + lastItemCol.getBoundingClientRect().height - 5 + 'px';
        }

        grid.masonryLaid = true;
        // emit custom event when grid has been reset
        grid.element.dispatchEvent(new CustomEvent('masonry-laid'));
    };

    function checkImgLoaded(grid) {
        var imgs = grid.list.getElementsByTagName('img');

        function countLoaded() {
            var setTimeoutOn = false;
            for(var i = 0; i < imgs.length; i++) {
                if(imgs[i].complete && imgs[i].naturalHeight == 0) {
                    continue; // broken image -> skip
                }

                if(!imgs[i].complete) {
                    setTimeoutOn = true;
                    break;
                } else if (typeof imgs[i].naturalHeight !== "undefined" && imgs[i].naturalHeight == 0) {
                    setTimeoutOn = true;
                    break;
                }
            }

            if(!setTimeoutOn) {
                layItems(grid);
            } else {
                setTimeout(function(){
                    countLoaded();
                }, 100);
            }
        };

        if(imgs.length == 0) {
            layItems(grid); // no need to wait -> no img available
        } else {
            countLoaded();
        }
    };

    //initialize the Masonry objects
    var masonries = document.getElementsByClassName('js-masonry'),
        flexSupported = Util.cssSupports('flex-basis', 'auto'),
        masonriesArray = [];

    if( masonries.length > 0) {
        for( var i = 0; i < masonries.length; i++) {
            if(!flexSupported) {
                Util.addClass(masonries[i], 'masonry--loaded'); // reveal gallery
            } else {
                (function(i){masonriesArray.push(new Masonry(masonries[i]));})(i); // init Masonry Layout
            }
        }

        if(!flexSupported) return;

        // listen to window resize -> reorganize items in gallery
        var resizingId = false,
            customEvent = new CustomEvent('masonry-resize');

        window.addEventListener('resize', function() {
            clearTimeout(resizingId);
            resizingId = setTimeout(doneResizing, 500);
        });

        function doneResizing() {
            for( var i = 0; i < masonriesArray.length; i++) {
                (function(i){masonriesArray[i].element.dispatchEvent(customEvent)})(i);
            };
        };
    };
}());

// File#: _1_modal-window
// Usage: codyhouse.co/license
(function() {
    var Modal = function(element) {
        this.element = element;
        this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.moveFocusEl = null; // focus will be moved to this element when modal is open
        this.modalFocus = this.element.getAttribute('data-modal-first-focus') ? this.element.querySelector(this.element.getAttribute('data-modal-first-focus')) : null;
        this.selectedTrigger = null;
        this.preventScrollEl = this.getPreventScrollEl();
        this.showClass = "modal--is-visible";
        this.initModal();
    };

    Modal.prototype.getPreventScrollEl = function() {
        var scrollEl = false;
        var querySelector = this.element.getAttribute('data-modal-prevent-scroll');
        if(querySelector) scrollEl = document.querySelector(querySelector);
        return scrollEl;
    };

    Modal.prototype.initModal = function() {
        var self = this;
        //open modal when clicking on trigger buttons
        if ( this.triggers ) {
            for(var i = 0; i < this.triggers.length; i++) {
                this.triggers[i].addEventListener('click', function(event) {
                    event.preventDefault();
                    if(Util.hasClass(self.element, self.showClass)) {
                        self.closeModal();
                        return;
                    }
                    self.selectedTrigger = event.currentTarget;
                    self.showModal();
                    self.initModalEvents();
                });
            }
        }

        // listen to the openModal event -> open modal without a trigger button
        this.element.addEventListener('openModal', function(event){
            if(event.detail) self.selectedTrigger = event.detail;
            self.showModal();
            self.initModalEvents();
        });

        // listen to the closeModal event -> close modal without a trigger button
        this.element.addEventListener('closeModal', function(event){
            if(event.detail) self.selectedTrigger = event.detail;
            self.closeModal();
        });

        // if modal is open by default -> initialise modal events
        if(Util.hasClass(this.element, this.showClass)) this.initModalEvents();
    };

    Modal.prototype.showModal = function() {
        var self = this;
        Util.addClass(this.element, this.showClass);
        this.getFocusableElements();
        if(this.moveFocusEl) {
            this.moveFocusEl.focus();
            // wait for the end of transitions before moving focus
            this.element.addEventListener("transitionend", function cb(event) {
                self.moveFocusEl.focus();
                self.element.removeEventListener("transitionend", cb);
            });
        }
        this.emitModalEvents('modalIsOpen');
        // change the overflow of the preventScrollEl
        if(this.preventScrollEl) this.preventScrollEl.style.overflow = 'hidden';
    };

    Modal.prototype.closeModal = function() {
        if(!Util.hasClass(this.element, this.showClass)) return;
        Util.removeClass(this.element, this.showClass);
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.moveFocusEl = null;
        if(this.selectedTrigger) this.selectedTrigger.focus();
        //remove listeners
        this.cancelModalEvents();
        this.emitModalEvents('modalIsClose');
        // change the overflow of the preventScrollEl
        if(this.preventScrollEl) this.preventScrollEl.style.overflow = '';
    };

    Modal.prototype.initModalEvents = function() {
        //add event listeners
        this.element.addEventListener('keydown', this);
        this.element.addEventListener('click', this);
    };

    Modal.prototype.cancelModalEvents = function() {
        //remove event listeners
        this.element.removeEventListener('keydown', this);
        this.element.removeEventListener('click', this);
    };

    Modal.prototype.handleEvent = function (event) {
        switch(event.type) {
            case 'click': {
                this.initClick(event);
            }
            case 'keydown': {
                this.initKeyDown(event);
            }
        }
    };

    Modal.prototype.initKeyDown = function(event) {
        if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
            //trap focus inside modal
            this.trapFocus(event);
        } else if( (event.keyCode && event.keyCode == 13 || event.key && event.key == 'Enter') && event.target.closest('.js-modal__close')) {
            event.preventDefault();
            this.closeModal(); // close modal when pressing Enter on close button
        }
    };

    Modal.prototype.initClick = function(event) {
        //close modal when clicking on close button or modal bg layer 
        if( !event.target.closest('.js-modal__close') && !Util.hasClass(event.target, 'js-modal') ) return;
        event.preventDefault();
        this.closeModal();
    };

    Modal.prototype.trapFocus = function(event) {
        if( this.firstFocusable == document.activeElement && event.shiftKey) {
            //on Shift+Tab -> focus last focusable element when focus moves out of modal
            event.preventDefault();
            this.lastFocusable.focus();
        }
        if( this.lastFocusable == document.activeElement && !event.shiftKey) {
            //on Tab -> focus first focusable element when focus moves out of modal
            event.preventDefault();
            this.firstFocusable.focus();
        }
    }

    Modal.prototype.getFocusableElements = function() {
        //get all focusable elements inside the modal
        var allFocusable = this.element.querySelectorAll(focusableElString);
        this.getFirstVisible(allFocusable);
        this.getLastVisible(allFocusable);
        this.getFirstFocusable();
    };

    Modal.prototype.getFirstVisible = function(elements) {
        //get first visible focusable element inside the modal
        for(var i = 0; i < elements.length; i++) {
            if( isVisible(elements[i]) ) {
                this.firstFocusable = elements[i];
                break;
            }
        }
    };

    Modal.prototype.getLastVisible = function(elements) {
        //get last visible focusable element inside the modal
        for(var i = elements.length - 1; i >= 0; i--) {
            if( isVisible(elements[i]) ) {
                this.lastFocusable = elements[i];
                break;
            }
        }
    };

    Modal.prototype.getFirstFocusable = function() {
        if(!this.modalFocus || !Element.prototype.matches) {
            this.moveFocusEl = this.firstFocusable;
            return;
        }
        var containerIsFocusable = this.modalFocus.matches(focusableElString);
        if(containerIsFocusable) {
            this.moveFocusEl = this.modalFocus;
        } else {
            this.moveFocusEl = false;
            var elements = this.modalFocus.querySelectorAll(focusableElString);
            for(var i = 0; i < elements.length; i++) {
                if( isVisible(elements[i]) ) {
                    this.moveFocusEl = elements[i];
                    break;
                }
            }
            if(!this.moveFocusEl) this.moveFocusEl = this.firstFocusable;
        }
    };

    Modal.prototype.emitModalEvents = function(eventName) {
        var event = new CustomEvent(eventName, {detail: this.selectedTrigger});
        this.element.dispatchEvent(event);
    };

    function isVisible(element) {
        return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
    };

    window.Modal = Modal;

    //initialize the Modal objects
    var modals = document.getElementsByClassName('js-modal');
    // generic focusable elements string selector
    var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
    if( modals.length > 0 ) {
        var modalArrays = [];
        for( var i = 0; i < modals.length; i++) {
            (function(i){modalArrays.push(new Modal(modals[i]));})(i);
        }

        window.addEventListener('keydown', function(event){ //close modal window on esc
            if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape') {
                for( var i = 0; i < modalArrays.length; i++) {
                    (function(i){modalArrays[i].closeModal();})(i);
                };
            }
        });
    }
}());

// File#: _1_smooth-scrolling
// Usage: codyhouse.co/license
(function() {
    var SmoothScroll = function(element) {
        if(!('CSS' in window) || !CSS.supports('color', 'var(--color-var)')) return;
        this.element = element;
        this.scrollDuration = parseInt(this.element.getAttribute('data-duration')) || 300;
        this.dataElementY = this.element.getAttribute('data-scrollable-element-y') || this.element.getAttribute('data-scrollable-element') || this.element.getAttribute('data-element');
        this.scrollElementY = this.dataElementY ? document.querySelector(this.dataElementY) : window;
        this.dataElementX = this.element.getAttribute('data-scrollable-element-x');
        this.scrollElementX = this.dataElementY ? document.querySelector(this.dataElementX) : window;
        this.initScroll();
    };

    SmoothScroll.prototype.initScroll = function() {
        var self = this;

        //detect click on link
        this.element.addEventListener('click', function(event){
            event.preventDefault();
            var targetId = event.target.closest('.js-smooth-scroll').getAttribute('href').replace('#', ''),
                target = document.getElementById(targetId),
                targetTabIndex = target.getAttribute('tabindex'),
                windowScrollTop = self.scrollElementY.scrollTop || document.documentElement.scrollTop;

            // scroll vertically
            if(!self.dataElementY) windowScrollTop = window.scrollY || document.documentElement.scrollTop;

            var scrollElementY = self.dataElementY ? self.scrollElementY : false;

            var fixedHeight = self.getFixedElementHeight(); // check if there's a fixed element on the page
            Util.scrollTo(target.getBoundingClientRect().top + windowScrollTop - fixedHeight, self.scrollDuration, function() {
                // scroll horizontally
                self.scrollHorizontally(target, fixedHeight);
                //move the focus to the target element - don't break keyboard navigation
                Util.moveFocus(target);
                history.pushState(false, false, '#'+targetId);
                self.resetTarget(target, targetTabIndex);
            }, scrollElementY);
        });
    };

    SmoothScroll.prototype.scrollHorizontally = function(target, delta) {
        var scrollEl = this.dataElementX ? this.scrollElementX : false;
        var windowScrollLeft = this.scrollElementX ? this.scrollElementX.scrollLeft : document.documentElement.scrollLeft;
        var final = target.getBoundingClientRect().left + windowScrollLeft - delta,
            duration = this.scrollDuration;

        var element = scrollEl || window;
        var start = element.scrollLeft || document.documentElement.scrollLeft,
            currentTime = null;

        if(!scrollEl) start = window.scrollX || document.documentElement.scrollLeft;
        // return if there's no need to scroll
        if(Math.abs(start - final) < 5) return;

        var animateScroll = function(timestamp){
            if (!currentTime) currentTime = timestamp;
            var progress = timestamp - currentTime;
            if(progress > duration) progress = duration;
            var val = Math.easeInOutQuad(progress, start, final-start, duration);
            element.scrollTo({
                left: val,
            });
            if(progress < duration) {
                window.requestAnimationFrame(animateScroll);
            }
        };

        window.requestAnimationFrame(animateScroll);
    };

    SmoothScroll.prototype.resetTarget = function(target, tabindex) {
        if( parseInt(target.getAttribute('tabindex')) < 0) {
            target.style.outline = 'none';
            !tabindex && target.removeAttribute('tabindex');
        }
    };

    SmoothScroll.prototype.getFixedElementHeight = function() {
        var scrollElementY = this.dataElementY ? this.scrollElementY : document.documentElement;
        var fixedElementDelta = parseInt(getComputedStyle(scrollElementY).getPropertyValue('scroll-padding'));
        if(isNaN(fixedElementDelta) ) { // scroll-padding not supported
            fixedElementDelta = 0;
            var fixedElement = document.querySelector(this.element.getAttribute('data-fixed-element'));
            if(fixedElement) fixedElementDelta = parseInt(fixedElement.getBoundingClientRect().height);
        }
        return fixedElementDelta;
    };

    //initialize the Smooth Scroll objects
    var smoothScrollLinks = document.getElementsByClassName('js-smooth-scroll');
    if( smoothScrollLinks.length > 0 && !Util.cssSupports('scroll-behavior', 'smooth') && window.requestAnimationFrame) {
        // you need javascript only if css scroll-behavior is not supported
        for( var i = 0; i < smoothScrollLinks.length; i++) {
            (function(i){new SmoothScroll(smoothScrollLinks[i]);})(i);
        }
    }
}());

// File#: _2_table-of-contents
// Usage: codyhouse.co/license
(function() {
    var Toc = function(element) {
        this.element = element;
        this.list = this.element.getElementsByClassName('js-toc__list')[0];
        this.anchors = this.list.querySelectorAll('a[href^="#"]');
        this.sections = getSections(this);
        this.controller = this.element.getElementsByClassName('js-toc__control');
        this.controllerLabel = this.element.getElementsByClassName('js-toc__control-label');
        this.content = getTocContent(this);
        this.clickScrolling = false;
        this.intervalID = false;
        this.staticLayoutClass = 'toc--static';
        this.contentStaticLayoutClass = 'toc-content--toc-static';
        this.expandedClass = 'toc--expanded';
        this.isStatic = Util.hasClass(this.element, this.staticLayoutClass);
        this.layout = 'static';
        initToc(this);
    };

    function getSections(toc) {
        var sections = [];
        // get all content sections
        for(var i = 0; i < toc.anchors.length; i++) {
            var section = document.getElementById(toc.anchors[i].getAttribute('href').replace('#', ''));
            if(section) sections.push(section);
        }
        return sections;
    };

    function getTocContent(toc) {
        if(toc.sections.length < 1) return false;
        var content = toc.sections[0].closest('.js-toc-content');
        return content;
    };

    function initToc(toc) {
        checkTocLayour(toc); // switch between mobile and desktop layout
        if(toc.sections.length > 0) {
            // listen for click on anchors
            toc.list.addEventListener('click', function(event){
                var anchor = event.target.closest('a[href^="#"]');
                if(!anchor) return;
                // reset link apperance 
                toc.clickScrolling = true;
                resetAnchors(toc, anchor);
                // close toc if expanded on mobile
                toggleToc(toc, true);
            });

            // check when a new section enters the viewport
            var intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
            if(intersectionObserverSupported) {
                var observer = new IntersectionObserver(
                    function(entries, observer) {
                        entries.forEach(function(entry){
                            if(!toc.clickScrolling) { // do not update classes if user clicked on a link
                                getVisibleSection(toc);
                            }
                        });
                    },
                    {
                        threshold: [0, 0.1],
                        rootMargin: "0px 0px -70% 0px"
                    }
                );

                for(var i = 0; i < toc.sections.length; i++) {
                    observer.observe(toc.sections[i]);
                }
            }

            // detect the end of scrolling -> reactivate IntersectionObserver on scroll
            toc.element.addEventListener('toc-scroll', function(event){
                toc.clickScrolling = false;
            });
        }

        // custom event emitted when window is resized
        toc.element.addEventListener('toc-resize', function(event){
            checkTocLayour(toc);
        });

        // collapsed version only (mobile)
        initCollapsedVersion(toc);
    };

    function resetAnchors(toc, anchor) {
        if(!anchor) return;
        for(var i = 0; i < toc.anchors.length; i++) Util.removeClass(toc.anchors[i], 'toc__link--selected');
        Util.addClass(anchor, 'toc__link--selected');
    };

    function getVisibleSection(toc) {
        if(toc.intervalID) {
            clearInterval(toc.intervalID);
        }
        toc.intervalID = setTimeout(function(){
            var halfWindowHeight = window.innerHeight/2,
                index = -1;
            for(var i = 0; i < toc.sections.length; i++) {
                var top = toc.sections[i].getBoundingClientRect().top;
                if(top < halfWindowHeight) index = i;
            }
            if(index > -1) {
                resetAnchors(toc, toc.anchors[index]);
            }
            toc.intervalID = false;
        }, 100);
    };

    function checkTocLayour(toc) {
        if(toc.isStatic) return;
        toc.layout = getComputedStyle(toc.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
        Util.toggleClass(toc.element, toc.staticLayoutClass, toc.layout == 'static');
        if(toc.content) Util.toggleClass(toc.content, toc.contentStaticLayoutClass, toc.layout == 'static');
    };

    function initCollapsedVersion(toc) { // collapsed version only (mobile)
        if(toc.controller.length < 1) return;

        // toggle nav visibility
        toc.controller[0].addEventListener('click', function(event){
            var isOpen = Util.hasClass(toc.element, toc.expandedClass);
            toggleToc(toc, isOpen);
        });

        // close expanded version on esc
        toc.element.addEventListener('keydown', function(event){
            if(toc.layout == 'static') return;
            if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape') ) {
                toggleToc(toc, true);
                toc.controller[0].focus();
            }
        });
    };

    function toggleToc(toc, bool) { // collapsed version only (mobile)
        if(toc.controller.length < 1) return;
        // toggle mobile version
        Util.toggleClass(toc.element, toc.expandedClass, !bool);
        bool ? toc.controller[0].removeAttribute('aria-expanded') : toc.controller[0].setAttribute('aria-expanded', 'true');
        if(!bool && toc.anchors.length > 0) {
            toc.anchors[0].focus();
        }
    };

    var tocs = document.getElementsByClassName('js-toc');

    var tocsArray = [];
    if( tocs.length > 0) {
        for( var i = 0; i < tocs.length; i++) {
            (function(i){ tocsArray.push(new Toc(tocs[i])); })(i);
        }

        // listen to window scroll -> reset clickScrolling property
        var scrollId = false,
            resizeId = false,
            scrollEvent = new CustomEvent('toc-scroll'),
            resizeEvent = new CustomEvent('toc-resize');

        window.addEventListener('scroll', function() {
            clearTimeout(scrollId);
            scrollId = setTimeout(doneScrolling, 100);
        });

        window.addEventListener('resize', function() {
            clearTimeout(resizeId);
            scrollId = setTimeout(doneResizing, 100);
        });

        function doneScrolling() {
            for( var i = 0; i < tocsArray.length; i++) {
                (function(i){tocsArray[i].element.dispatchEvent(scrollEvent)})(i);
            };
        };

        function doneResizing() {
            for( var i = 0; i < tocsArray.length; i++) {
                (function(i){tocsArray[i].element.dispatchEvent(resizeEvent)})(i);
            };
        };
    }
}());

// File#: _1_accordion
// Usage: codyhouse.co/license
(function() {
    var Accordion = function(element) {
        this.element = element;
        this.items = getChildrenByClassName(this.element, 'js-accordion__item');
        this.version = this.element.getAttribute('data-version') ? '-'+this.element.getAttribute('data-version') : '';
        this.showClass = 'accordion'+this.version+'__item--is-open';
        this.animateHeight = (this.element.getAttribute('data-animation') == 'on');
        this.multiItems = !(this.element.getAttribute('data-multi-items') == 'off');
        // deep linking options
        this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
        // init accordion
        this.initAccordion();
    };

    Accordion.prototype.initAccordion = function() {
        //set initial aria attributes
        for( var i = 0; i < this.items.length; i++) {
            var button = this.items[i].getElementsByTagName('button')[0],
                content = this.items[i].getElementsByClassName('js-accordion__panel')[0],
                isOpen = this.items[i].classList.contains(this.showClass) ? 'true' : 'false';
            button.setAttribute('aria-expanded', isOpen);
            button.setAttribute('aria-controls', 'accordion-content-'+i);
            button.setAttribute('id', 'accordion-header-'+i);
            button.classList.add('js-accordion__trigger');
            content.setAttribute('aria-labelledby', 'accordion-header-'+i);
            content.setAttribute('id', 'accordion-content-'+i);
        }

        //listen for Accordion events
        this.initAccordionEvents();

        // check deep linking option
        this.initDeepLink();
    };

    Accordion.prototype.initAccordionEvents = function() {
        var self = this;

        this.element.addEventListener('click', function(event) {
            var trigger = event.target.closest('.js-accordion__trigger');
            //check index to make sure the click didn't happen inside a children accordion
            if( trigger && Array.prototype.indexOf.call(self.items, trigger.parentElement) >= 0) self.triggerAccordion(trigger);
        });
    };

    Accordion.prototype.triggerAccordion = function(trigger) {
        var bool = (trigger.getAttribute('aria-expanded') === 'true');

        this.animateAccordion(trigger, bool, false);

        if(!bool && this.deepLinkOn) {
            history.replaceState(null, '', '#'+trigger.getAttribute('aria-controls'));
        }
    };

    Accordion.prototype.animateAccordion = function(trigger, bool, deepLink) {
        var self = this;
        var item = trigger.closest('.js-accordion__item'),
            content = item.getElementsByClassName('js-accordion__panel')[0],
            ariaValue = bool ? 'false' : 'true';

        if(!bool) item.classList.add(this.showClass);
        trigger.setAttribute('aria-expanded', ariaValue);
        self.resetContentVisibility(item, content, bool);

        if( !this.multiItems && !bool || deepLink) this.closeSiblings(item);
    };

    Accordion.prototype.resetContentVisibility = function(item, content, bool) {
        item.classList.toggle(this.showClass, !bool);
        content.removeAttribute("style");
        if(bool && !this.multiItems) { // accordion item has been closed -> check if there's one open to move inside viewport 
            this.moveContent();
        }
    };

    Accordion.prototype.closeSiblings = function(item) {
        //if only one accordion can be open -> search if there's another one open
        var index = Array.prototype.indexOf.call(this.items, item);
        for( var i = 0; i < this.items.length; i++) {
            if(this.items[i].classList.contains(this.showClass) && i != index) {
                this.animateAccordion(this.items[i].getElementsByClassName('js-accordion__trigger')[0], true, false);
                return false;
            }
        }
    };

    Accordion.prototype.moveContent = function() { // make sure title of the accordion just opened is inside the viewport
        var openAccordion = this.element.getElementsByClassName(this.showClass);
        if(openAccordion.length == 0) return;
        var boundingRect = openAccordion[0].getBoundingClientRect();
        if(boundingRect.top < 0 || boundingRect.top > window.innerHeight) {
            var windowScrollTop = window.scrollY || document.documentElement.scrollTop;
            window.scrollTo(0, boundingRect.top + windowScrollTop);
        }
    };

    Accordion.prototype.initDeepLink = function() {
        if(!this.deepLinkOn) return;
        var hash = window.location.hash.substr(1);
        if(!hash || hash == '') return;
        var trigger = this.element.querySelector('.js-accordion__trigger[aria-controls="'+hash+'"]');
        if(trigger && trigger.getAttribute('aria-expanded') !== 'true') {
            this.animateAccordion(trigger, false, true);
            setTimeout(function(){trigger.scrollIntoView(true);});
        }
    };

    function getChildrenByClassName(el, className) {
        var children = el.children,
            childrenByClass = [];
        for (var i = 0; i < children.length; i++) {
            if (children[i].classList.contains(className)) childrenByClass.push(children[i]);
        }
        return childrenByClass;
    };

    window.Accordion = Accordion;

    //initialize the Accordion objects
    var accordions = document.getElementsByClassName('js-accordion');
    if( accordions.length > 0 ) {
        for( var i = 0; i < accordions.length; i++) {
            (function(i){new Accordion(accordions[i]);})(i);
        }
    }
}());

// File#: _1_back-to-top
// Usage: codyhouse.co/license
(function() {
    var backTop = document.getElementsByClassName('js-back-to-top')[0];
    if( backTop ) {
        var dataElement = backTop.getAttribute('data-element');
        var scrollElement = dataElement ? document.querySelector(dataElement) : window;
        var scrollOffsetInit = parseInt(backTop.getAttribute('data-offset-in')) || parseInt(backTop.getAttribute('data-offset')) || 0, //show back-to-top if scrolling > scrollOffset
            scrollOffsetOutInit = parseInt(backTop.getAttribute('data-offset-out')) || 0,
            scrollOffset = 0,
            scrollOffsetOut = 0,
            scrolling = false;

        // check if target-in/target-out have been set
        var targetIn = backTop.getAttribute('data-target-in') ? document.querySelector(backTop.getAttribute('data-target-in')) : false,
            targetOut = backTop.getAttribute('data-target-out') ? document.querySelector(backTop.getAttribute('data-target-out')) : false;

        updateOffsets();

        //detect click on back-to-top link
        backTop.addEventListener('click', function(event) {
            event.preventDefault();
            if(!window.requestAnimationFrame) {
                scrollElement.scrollTo(0, 0);
            } else {
                dataElement ? scrollElement.scrollTo({top: 0, behavior: 'smooth'}) : window.scrollTo({top: 0, behavior: 'smooth'});
            }
            //move the focus to the #top-element - don't break keyboard navigation
            moveFocus(document.getElementById(backTop.getAttribute('href').replace('#', '')));
        });

        //listen to the window scroll and update back-to-top visibility
        checkBackToTop();
        if (scrollOffset > 0 || scrollOffsetOut > 0) {
            scrollElement.addEventListener("scroll", function(event) {
                if( !scrolling ) {
                    scrolling = true;
                    (!window.requestAnimationFrame) ? setTimeout(function(){checkBackToTop();}, 250) : window.requestAnimationFrame(checkBackToTop);
                }
            });
        }

        function checkBackToTop() {
            updateOffsets();
            var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
            if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
            var condition =  windowTop >= scrollOffset;
            if(scrollOffsetOut > 0) {
                condition = (windowTop >= scrollOffset) && (window.innerHeight + windowTop < scrollOffsetOut);
            }
            backTop.classList.toggle('back-to-top--is-visible', condition);
            scrolling = false;
        }

        function updateOffsets() {
            scrollOffset = getOffset(targetIn, scrollOffsetInit, true);
            scrollOffsetOut = getOffset(targetOut, scrollOffsetOutInit);
        }

        function getOffset(target, startOffset, bool) {
            var offset = 0;
            if(target) {
                var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
                if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
                var boundingClientRect = target.getBoundingClientRect();
                offset = bool ? boundingClientRect.bottom : boundingClientRect.top;
                offset = offset + windowTop;
            }
            if(startOffset && startOffset) {
                offset = offset + parseInt(startOffset);
            }
            return offset;
        }

        function moveFocus(element) {
            if( !element ) element = document.getElementsByTagName("body")[0];
            element.focus();
            if (document.activeElement !== element) {
                element.setAttribute('tabindex','-1');
                element.focus();
            }
        };
    }
}());
// File#: _2_pricing-table
// Usage: codyhouse.co/license
(function() {
    // NOTE: you need the js code only when using the --has-switch variation of the pricing table
    // default version does not require js
    var pTable = document.getElementsByClassName('js-p-table--has-switch');
    if(pTable.length > 0) {
        for(var i = 0; i < pTable.length; i++) {
            (function(i){ addPTableEvent(pTable[i]);})(i);
        }

        function addPTableEvent(element) {
            var pSwitch = element.getElementsByClassName('js-p-table__switch')[0];
            if(pSwitch) {
                pSwitch.addEventListener('change', function(event) {
                    Util.toggleClass(element, 'p-table--yearly', (event.target.value == 'yearly'));
                });
            }
        }
    }
}());








// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function() {
    var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
    if( menuBtns.length > 0 ) {
        for(var i = 0; i < menuBtns.length; i++) {(function(i){
            initMenuBtn(menuBtns[i]);
        })(i);}

        function initMenuBtn(btn) {
            btn.addEventListener('click', function(event){
                event.preventDefault();
                var status = !Util.hasClass(btn, 'anim-menu-btn--state-b');
                Util.toggleClass(btn, 'anim-menu-btn--state-b', status);
                // emit custom event
                var event = new CustomEvent('anim-menu-btn-clicked', {detail: status});
                btn.dispatchEvent(event);
            });
        };
    }
}());

// File#: flexi-header
// Usage: codyhouse.co/license
(function() {
    var flexHeader = document.getElementsByClassName('js-f-header');
    if(flexHeader.length > 0) {
        var menuTrigger = flexHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
            firstFocusableElement = getMenuFirstFocusable();

        // we'll use these to store the node that needs to receive focus when the mobile menu is closed 
        var focusMenu = false;

        resetFlexHeaderOffset();
        setAriaButtons();

        menuTrigger.addEventListener('anim-menu-btn-clicked', function(event){
            toggleMenuNavigation(event.detail);
        });

        // listen for key events
        window.addEventListener('keyup', function(event){
            // listen for esc key
            if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
                // close navigation on mobile if open
                if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
                    focusMenu = menuTrigger; // move focus to menu trigger when menu is close
                    menuTrigger.click();
                }
            }
            // listen for tab key
            if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
                // close navigation on mobile if open when nav loses focus
                if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-f-header')) menuTrigger.click();
            }
        });

        // detect click on a dropdown control button - expand-on-mobile only
        flexHeader[0].addEventListener('click', function(event){
            var btnLink = event.target.closest('.js-f-header__dropdown-control');
            if(!btnLink) return;
            !btnLink.getAttribute('aria-expanded') ? btnLink.setAttribute('aria-expanded', 'true') : btnLink.removeAttribute('aria-expanded');
        });

        // detect mouseout from a dropdown control button - expand-on-mobile only
        flexHeader[0].addEventListener('mouseout', function(event){
            var btnLink = event.target.closest('.js-f-header__dropdown-control');
            if(!btnLink) return;
            // check layout type
            if(getLayout() == 'mobile') return;
            btnLink.removeAttribute('aria-expanded');
        });

        // close dropdown on focusout - expand-on-mobile only
        flexHeader[0].addEventListener('focusin', function(event){
            var btnLink = event.target.closest('.js-f-header__dropdown-control'),
                dropdown = event.target.closest('.f-header__dropdown');
            if(dropdown) return;
            if(btnLink && btnLink.hasAttribute('aria-expanded')) return;
            // check layout type
            if(getLayout() == 'mobile') return;
            var openDropdown = flexHeader[0].querySelector('.js-f-header__dropdown-control[aria-expanded="true"]');
            if(openDropdown) openDropdown.removeAttribute('aria-expanded');
        });

        // listen for resize
        var resizingId = false;
        window.addEventListener('resize', function() {
            clearTimeout(resizingId);
            resizingId = setTimeout(doneResizing, 500);
        });

        function getMenuFirstFocusable() {
            var focusableEle = flexHeader[0].getElementsByClassName('f-header__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
                firstFocusable = false;
            for(var i = 0; i < focusableEle.length; i++) {
                if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
                    firstFocusable = focusableEle[i];
                    break;
                }
            }

            return firstFocusable;
        };

        function isVisible(element) {
            return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        };

        function doneResizing() {
            if( !isVisible(menuTrigger) && Util.hasClass(flexHeader[0], 'f-header--expanded')) {
                menuTrigger.click();
            }
            resetFlexHeaderOffset();
        };

        function toggleMenuNavigation(bool) { // toggle menu visibility on small devices
            Util.toggleClass(document.getElementsByClassName('f-header__nav')[0], 'f-header__nav--is-visible', bool);
            Util.toggleClass(flexHeader[0], 'f-header--expanded', bool);
            menuTrigger.setAttribute('aria-expanded', bool);
            if(bool) firstFocusableElement.focus(); // move focus to first focusable element
            else if(focusMenu) {
                focusMenu.focus();
                focusMenu = false;
            }
        };

        function resetFlexHeaderOffset() {
            // on mobile -> update max height of the flexi header based on its offset value (e.g., if there's a fixed pre-header element)
            document.documentElement.style.setProperty('--f-header-offset', flexHeader[0].getBoundingClientRect().top+'px');
        };

        function setAriaButtons() {
            var btnDropdown = flexHeader[0].getElementsByClassName('js-f-header__dropdown-control');
            for(var i = 0; i < btnDropdown.length; i++) {
                var id = 'f-header-dropdown-'+i,
                    dropdown = btnDropdown[i].nextElementSibling;
                if(dropdown.hasAttribute('id')) {
                    id = dropdown.getAttribute('id');
                } else {
                    dropdown.setAttribute('id', id);
                }
                btnDropdown[i].setAttribute('aria-controls', id);
            }
        };

        function getLayout() {
            return getComputedStyle(flexHeader[0], ':before').getPropertyValue('content').replace(/\'|"/g, '');
        };
    }
}());

// File#: _1_swipe-content
(function() {
    var SwipeContent = function(element) {
        this.element = element;
        this.delta = [false, false];
        this.dragging = false;
        this.intervalId = false;
        initSwipeContent(this);
    };

    function initSwipeContent(content) {
        content.element.addEventListener('mousedown', handleEvent.bind(content));
        content.element.addEventListener('touchstart', handleEvent.bind(content), {passive: true});
    };

    function initDragging(content) {
        //add event listeners
        content.element.addEventListener('mousemove', handleEvent.bind(content));
        content.element.addEventListener('touchmove', handleEvent.bind(content), {passive: true});
        content.element.addEventListener('mouseup', handleEvent.bind(content));
        content.element.addEventListener('mouseleave', handleEvent.bind(content));
        content.element.addEventListener('touchend', handleEvent.bind(content));
    };

    function cancelDragging(content) {
        //remove event listeners
        if(content.intervalId) {
            (!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
            content.intervalId = false;
        }
        content.element.removeEventListener('mousemove', handleEvent.bind(content));
        content.element.removeEventListener('touchmove', handleEvent.bind(content));
        content.element.removeEventListener('mouseup', handleEvent.bind(content));
        content.element.removeEventListener('mouseleave', handleEvent.bind(content));
        content.element.removeEventListener('touchend', handleEvent.bind(content));
    };

    function handleEvent(event) {
        switch(event.type) {
            case 'mousedown':
            case 'touchstart':
                startDrag(this, event);
                break;
            case 'mousemove':
            case 'touchmove':
                drag(this, event);
                break;
            case 'mouseup':
            case 'mouseleave':
            case 'touchend':
                endDrag(this, event);
                break;
        }
    };

    function startDrag(content, event) {
        content.dragging = true;
        // listen to drag movements
        initDragging(content);
        content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
        // emit drag start event
        emitSwipeEvents(content, 'dragStart', content.delta, event.target);
    };

    function endDrag(content, event) {
        cancelDragging(content);
        // credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
        var dx = parseInt(unify(event).clientX),
            dy = parseInt(unify(event).clientY);

        // check if there was a left/right swipe
        if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
            var s = getSign(dx - content.delta[0]);

            if(Math.abs(dx - content.delta[0]) > 30) {
                (s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);
            }

            content.delta[0] = false;
        }
        // check if there was a top/bottom swipe
        if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
            var y = getSign(dy - content.delta[1]);

            if(Math.abs(dy - content.delta[1]) > 30) {
                (y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
            }

            content.delta[1] = false;
        }
        // emit drag end event
        emitSwipeEvents(content, 'dragEnd', [dx, dy]);
        content.dragging = false;
    };

    function drag(content, event) {
        if(!content.dragging) return;
        // emit dragging event with coordinates
        (!window.requestAnimationFrame)
            ? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250)
            : content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
    };

    function emitDrag(event) {
        emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
    };

    function unify(event) {
        // unify mouse and touch events
        return event.changedTouches ? event.changedTouches[0] : event;
    };

    function emitSwipeEvents(content, eventName, detail, el) {
        var trigger = false;
        if(el) trigger = el;
        // emit event with coordinates
        var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
        content.element.dispatchEvent(event);
    };

    function getSign(x) {
        if(!Math.sign) {
            return ((x > 0) - (x < 0)) || +x;
        } else {
            return Math.sign(x);
        }
    };

    window.SwipeContent = SwipeContent;

    //initialize the SwipeContent objects
    var swipe = document.getElementsByClassName('js-swipe-content');
    if( swipe.length > 0 ) {
        for( var i = 0; i < swipe.length; i++) {
            (function(i){new SwipeContent(swipe[i]);})(i);
        }
    }
}());

// File#: _2_slideshow
// Usage: codyhouse.co/license
(function() {
    var Slideshow = function(opts) {
        this.options = Util.extend(Slideshow.defaults , opts);
        this.element = this.options.element;
        this.items = this.element.getElementsByClassName('js-slideshow__item');
        this.controls = this.element.getElementsByClassName('js-slideshow__control');
        this.selectedSlide = 0;
        this.autoplayId = false;
        this.autoplayPaused = false;
        this.navigation = false;
        this.navCurrentLabel = false;
        this.ariaLive = false;
        this.moveFocus = false;
        this.animating = false;
        this.supportAnimation = Util.cssSupports('transition');
        this.animationOff = (!Util.hasClass(this.element, 'slideshow--transition-fade') && !Util.hasClass(this.element, 'slideshow--transition-slide') && !Util.hasClass(this.element, 'slideshow--transition-prx'));
        this.animationType = Util.hasClass(this.element, 'slideshow--transition-prx') ? 'prx' : 'slide';
        this.animatingClass = 'slideshow--is-animating';
        initSlideshow(this);
        initSlideshowEvents(this);
        initAnimationEndEvents(this);
    };

    Slideshow.prototype.showNext = function() {
        showNewItem(this, this.selectedSlide + 1, 'next');
    };

    Slideshow.prototype.showPrev = function() {
        showNewItem(this, this.selectedSlide - 1, 'prev');
    };

    Slideshow.prototype.showItem = function(index) {
        showNewItem(this, index, false);
    };

    Slideshow.prototype.startAutoplay = function() {
        var self = this;
        if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
            self.autoplayId = setInterval(function(){
                self.showNext();
            }, self.options.autoplayInterval);
        }
    };

    Slideshow.prototype.pauseAutoplay = function() {
        var self = this;
        if(this.options.autoplay) {
            clearInterval(self.autoplayId);
            self.autoplayId = false;
        }
    };

    function initSlideshow(slideshow) { // basic slideshow settings
        // if no slide has been selected -> select the first one
        if(slideshow.element.getElementsByClassName('slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow__item--selected');
        slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow__item--selected')[0]);
        // create an element that will be used to announce the new visible slide to SR
        var srLiveArea = document.createElement('div');
        Util.setAttributes(srLiveArea, {'class': 'sr-only js-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
        slideshow.element.appendChild(srLiveArea);
        slideshow.ariaLive = srLiveArea;
    };

    function initSlideshowEvents(slideshow) {
        // if slideshow navigation is on -> create navigation HTML and add event listeners
        if(slideshow.options.navigation) {
            // check if navigation has already been included
            if(slideshow.element.getElementsByClassName('js-slideshow__navigation').length == 0) {
                var navigation = document.createElement('ol'),
                    navChildren = '';

                var navClasses = slideshow.options.navigationClass+' js-slideshow__navigation';
                if(slideshow.items.length <= 1) {
                    navClasses = navClasses + ' hide';
                }

                navigation.setAttribute('class', navClasses);
                for(var i = 0; i < slideshow.items.length; i++) {
                    var className = (i == slideshow.selectedSlide) ? 'class="'+slideshow.options.navigationItemClass+' '+slideshow.options.navigationItemClass+'--selected js-slideshow__nav-item"' :  'class="'+slideshow.options.navigationItemClass+' js-slideshow__nav-item"',
                        navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-slideshow__nav-current-label">Current Item</span>' : '';
                    navChildren = navChildren + '<li '+className+'><button class="reset"><span class="sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
                }
                navigation.innerHTML = navChildren;
                slideshow.element.appendChild(navigation);
            }

            slideshow.navCurrentLabel = slideshow.element.getElementsByClassName('js-slideshow__nav-current-label')[0];
            slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow__nav-item');

            var dotsNavigation = slideshow.element.getElementsByClassName('js-slideshow__navigation')[0];

            dotsNavigation.addEventListener('click', function(event){
                navigateSlide(slideshow, event, true);
            });
            dotsNavigation.addEventListener('keyup', function(event){
                navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
            });
        }
        // slideshow arrow controls
        if(slideshow.controls.length > 0) {
            // hide controls if one item available
            if(slideshow.items.length <= 1) {
                Util.addClass(slideshow.controls[0], 'hide');
                Util.addClass(slideshow.controls[1], 'hide');
            }
            slideshow.controls[0].addEventListener('click', function(event){
                event.preventDefault();
                slideshow.showPrev();
                updateAriaLive(slideshow);
            });
            slideshow.controls[1].addEventListener('click', function(event){
                event.preventDefault();
                slideshow.showNext();
                updateAriaLive(slideshow);
            });
        }
        // swipe events
        if(slideshow.options.swipe) {
            //init swipe
            new SwipeContent(slideshow.element);
            slideshow.element.addEventListener('swipeLeft', function(event){
                slideshow.showNext();
            });
            slideshow.element.addEventListener('swipeRight', function(event){
                slideshow.showPrev();
            });
        }
        // autoplay
        if(slideshow.options.autoplay) {
            slideshow.startAutoplay();
            // pause autoplay if user is interacting with the slideshow
            if(!slideshow.options.autoplayOnHover) {
                slideshow.element.addEventListener('mouseenter', function(event){
                    slideshow.pauseAutoplay();
                    slideshow.autoplayPaused = true;
                });
                slideshow.element.addEventListener('mouseleave', function(event){
                    slideshow.autoplayPaused = false;
                    slideshow.startAutoplay();
                });
            }
            if(!slideshow.options.autoplayOnFocus) {
                slideshow.element.addEventListener('focusin', function(event){
                    slideshow.pauseAutoplay();
                    slideshow.autoplayPaused = true;
                });
                slideshow.element.addEventListener('focusout', function(event){
                    slideshow.autoplayPaused = false;
                    slideshow.startAutoplay();
                });
            }
        }
        // detect if external buttons control the slideshow
        var slideshowId = slideshow.element.getAttribute('id');
        if(slideshowId) {
            var externalControls = document.querySelectorAll('[data-controls="'+slideshowId+'"]');
            for(var i = 0; i < externalControls.length; i++) {
                (function(i){externalControlSlide(slideshow, externalControls[i]);})(i);
            }
        }
        // custom event to trigger selection of a new slide element
        slideshow.element.addEventListener('selectNewItem', function(event){
            // check if slide is already selected
            if(event.detail) {
                if(event.detail - 1 == slideshow.selectedSlide) return;
                showNewItem(slideshow, event.detail - 1, false);
            }
        });

        // keyboard navigation
        slideshow.element.addEventListener('keydown', function(event){
            if(event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
                slideshow.showNext();
            } else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
                slideshow.showPrev();
            }
        });
    };

    function navigateSlide(slideshow, event, keyNav) {
        // user has interacted with the slideshow navigation -> update visible slide
        var target = ( Util.hasClass(event.target, 'js-slideshow__nav-item') ) ? event.target : event.target.closest('.js-slideshow__nav-item');
        if(keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
            slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
            slideshow.moveFocus = true;
            updateAriaLive(slideshow);
        }
    };

    function initAnimationEndEvents(slideshow) {
        // remove animation classes at the end of a slide transition
        for( var i = 0; i < slideshow.items.length; i++) {
            (function(i){
                slideshow.items[i].addEventListener('animationend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
                slideshow.items[i].addEventListener('transitionend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
            })(i);
        }
    };

    function resetAnimationEnd(slideshow, item) {
        setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
            if(Util.hasClass(item,'slideshow__item--selected')) {
                if(slideshow.moveFocus) Util.moveFocus(item);
                emitSlideshowEvent(slideshow, 'newItemVisible', slideshow.selectedSlide);
                slideshow.moveFocus = false;
            }
            Util.removeClass(item, 'slideshow__item--'+slideshow.animationType+'-out-left slideshow__item--'+slideshow.animationType+'-out-right slideshow__item--'+slideshow.animationType+'-in-left slideshow__item--'+slideshow.animationType+'-in-right');
            item.removeAttribute('aria-hidden');
            slideshow.animating = false;
            Util.removeClass(slideshow.element, slideshow.animatingClass);
        }, 100);
    };

    function showNewItem(slideshow, index, bool) {
        if(slideshow.items.length <= 1) return;
        if(slideshow.animating && slideshow.supportAnimation) return;
        slideshow.animating = true;
        Util.addClass(slideshow.element, slideshow.animatingClass);
        if(index < 0) index = slideshow.items.length - 1;
        else if(index >= slideshow.items.length) index = 0;
        // skip slideshow item if it is hidden
        if(bool && Util.hasClass(slideshow.items[index], 'hide')) {
            slideshow.animating = false;
            index = bool == 'next' ? index + 1 : index - 1;
            showNewItem(slideshow, index, bool);
            return;
        }
        // index of new slide is equal to index of slide selected item
        if(index == slideshow.selectedSlide) {
            slideshow.animating = false;
            return;
        }
        var exitItemClass = getExitItemClass(slideshow, bool, slideshow.selectedSlide, index);
        var enterItemClass = getEnterItemClass(slideshow, bool, slideshow.selectedSlide, index);
        // transition between slides
        if(!slideshow.animationOff) Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
        Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
        slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
        if(slideshow.animationOff) {
            Util.addClass(slideshow.items[index], 'slideshow__item--selected');
        } else {
            Util.addClass(slideshow.items[index], enterItemClass+' slideshow__item--selected');
        }
        // reset slider navigation appearance
        resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
        slideshow.selectedSlide = index;
        // reset autoplay
        slideshow.pauseAutoplay();
        slideshow.startAutoplay();
        // reset controls/navigation color themes
        resetSlideshowTheme(slideshow, index);
        // emit event
        emitSlideshowEvent(slideshow, 'newItemSelected', slideshow.selectedSlide);
        if(slideshow.animationOff) {
            slideshow.animating = false;
            Util.removeClass(slideshow.element, slideshow.animatingClass);
        }
    };

    function getExitItemClass(slideshow, bool, oldIndex, newIndex) {
        var className = '';
        if(bool) {
            className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-out-right' : 'slideshow__item--'+slideshow.animationType+'-out-left';
        } else {
            className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-out-left' : 'slideshow__item--'+slideshow.animationType+'-out-right';
        }
        return className;
    };

    function getEnterItemClass(slideshow, bool, oldIndex, newIndex) {
        var className = '';
        if(bool) {
            className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-in-right' : 'slideshow__item--'+slideshow.animationType+'-in-left';
        } else {
            className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-in-left' : 'slideshow__item--'+slideshow.animationType+'-in-right';
        }
        return className;
    };

    function resetSlideshowNav(slideshow, newIndex, oldIndex) {
        if(slideshow.navigation) {
            Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
            Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
            slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
            slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
        }
    };

    function resetSlideshowTheme(slideshow, newIndex) {
        var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
        if(dataTheme) {
            if(slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
            if(slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
        } else {
            if(slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
            if(slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
        }
    };

    function emitSlideshowEvent(slideshow, eventName, detail) {
        var event = new CustomEvent(eventName, {detail: detail});
        slideshow.element.dispatchEvent(event);
    };

    function updateAriaLive(slideshow) {
        slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
    };

    function externalControlSlide(slideshow, button) { // control slideshow using external element
        button.addEventListener('click', function(event){
            var index = button.getAttribute('data-index');
            if(!index || index == slideshow.selectedSlide + 1) return;
            event.preventDefault();
            showNewItem(slideshow, index - 1, false);
        });
    };

    Slideshow.defaults = {
        element : '',
        navigation : true,
        autoplay : false,
        autoplayOnHover: false,
        autoplayOnFocus: false,
        autoplayInterval: 5000,
        navigationItemClass: 'slideshow__nav-item',
        navigationClass: 'slideshow__navigation',
        swipe: false
    };

    window.Slideshow = Slideshow;

    //initialize the Slideshow objects
    var slideshows = document.getElementsByClassName('js-slideshow');
    if( slideshows.length > 0 ) {
        for( var i = 0; i < slideshows.length; i++) {
            (function(i){
                var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
                    autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
                    autoplayOnHover = (slideshows[i].getAttribute('data-autoplay-hover') && slideshows[i].getAttribute('data-autoplay-hover') == 'on') ? true : false,
                    autoplayOnFocus = (slideshows[i].getAttribute('data-autoplay-focus') && slideshows[i].getAttribute('data-autoplay-focus') == 'on') ? true : false,
                    autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
                    swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false,
                    navigationItemClass = slideshows[i].getAttribute('data-navigation-item-class') ? slideshows[i].getAttribute('data-navigation-item-class') : 'slideshow__nav-item',
                    navigationClass = slideshows[i].getAttribute('data-navigation-class') ? slideshows[i].getAttribute('data-navigation-class') : 'slideshow__navigation';
                new Slideshow({element: slideshows[i], navigation: navigation, autoplay : autoplay, autoplayOnHover: autoplayOnHover, autoplayOnFocus: autoplayOnFocus, autoplayInterval : autoplayInterval, swipe : swipe, navigationItemClass: navigationItemClass, navigationClass: navigationClass});
            })(i);
        }
    }
}());


// File#: _3_testimonial-banner
// Usage: codyhouse.co/license
(function() {
    var Tbanner = function(element) {
        this.element = element;
        this.slideshowContent = this.element.getElementsByClassName('js-t-banner__content-slideshow');
        this.slideshowBg = this.element.getElementsByClassName('js-t-banner__bg-slideshow');
        this.navControls = this.element.getElementsByClassName('js-slideshow__control');

        initSlideshow(this);
        initBannerNavigation(this);
    };

    function initSlideshow(banner) {
        // init background and content slideshows
        banner.slideshowContentObj = new Slideshow({element: banner.slideshowContent[0], navigation: false});
        banner.slideshowBgObj = new Slideshow({element: banner.slideshowBg[0], navigation: false});
    };

    function initBannerNavigation(banner) {
        if(banner.navControls.length < 2) return;
        // use arrows to navigate the slideshow
        banner.navControls[0].addEventListener('click', function(){
            updateSlideshow(banner, 'prev');
        });

        banner.navControls[1].addEventListener('click', function(){
            updateSlideshow(banner, 'next');
        });
    };

    function updateSlideshow(banner, direction) {
        if(direction == 'next') {
            banner.slideshowContentObj.showNext();
            banner.slideshowBgObj.showNext();
        } else {
            banner.slideshowContentObj.showPrev();
            banner.slideshowBgObj.showPrev();
        }
    };

    // init Tbanner obj
    var tBanner = document.getElementsByClassName('js-t-banner');
    if(tBanner.length > 0) {
        for( var i = 0; i < tBanner.length; i++) {
            new Tbanner(tBanner[i]);
        }
    }
}());

// File#: _1_masonry
// Usage: codyhouse.co/license

(function() {
    var Masonry = function(element) {
        this.element = element;
        this.list = this.element.getElementsByClassName('js-masonry__list')[0];
        this.items = this.element.getElementsByClassName('js-masonry__item');
        this.activeColumns = 0;
        this.colStartWidth = 0; // col min-width (defined in CSS using --masonry-col-auto-size variable)
        this.colWidth = 0; // effective column width
        this.colGap = 0;
        // store col heights and items
        this.colHeights = [];
        this.colItems = [];
        // flex full support
        this.flexSupported = checkFlexSupported(this.items[0]);
        getGridLayout(this); // get initial grid params
        setGridLayout(this); // set grid params (width of elements)
        initMasonryLayout(this); // init gallery layout
    };

    function checkFlexSupported(item) {
        var itemStyle = window.getComputedStyle(item);
        return itemStyle.getPropertyValue('flex-basis') !== 'auto';
    };

    function getGridLayout(grid) { // this is used to get initial grid details (width/grid gap)
        var itemStyle = window.getComputedStyle(grid.items[0]);
        if( grid.colStartWidth === 0) {
            grid.colStartWidth = parseFloat(itemStyle.getPropertyValue('width'));
        }
        grid.colGap = parseFloat(itemStyle.getPropertyValue('margin-right'));
    };

    function setGridLayout(grid) { // set width of items in the grid
        var containerWidth = parseFloat(window.getComputedStyle(grid.element).getPropertyValue('width'));
        grid.activeColumns = parseInt((containerWidth + grid.colGap)/(grid.colStartWidth+grid.colGap));
        if(grid.activeColumns == 0) grid.activeColumns = 1;
        grid.colWidth = parseFloat((containerWidth - (grid.activeColumns - 1)*grid.colGap)/grid.activeColumns);
        for(var i = 0; i < grid.items.length; i++) {
            grid.items[i].style.width = grid.colWidth+'px'; // reset items width
        }
    };

    function initMasonryLayout(grid) {
        if(grid.flexSupported) {
            checkImgLoaded(grid); // reset layout when images are loaded
        } else {
            Util.addClass(grid.element, 'masonry--loaded'); // make sure the gallery is visible
        }

        grid.element.addEventListener('masonry-resize', function(){ // window has been resized -> reset masonry layout
            getGridLayout(grid);
            setGridLayout(grid);
            if(grid.flexSupported) layItems(grid);
        });

        grid.element.addEventListener('masonry-reset', function(event){ // reset layout (e.g., new items added to the gallery)
            if(grid.flexSupported) checkImgLoaded(grid);
        });

        // if there are fonts to be loaded -> reset masonry 
        if(document.fonts) {
            document.fonts.onloadingdone = function (fontFaceSetEvent) {
                if(!grid.masonryLaid) return;
                getGridLayout(grid);
                setGridLayout(grid);
                if(grid.flexSupported) layItems(grid);
            };
        }
    };

    function layItems(grid) {
        Util.addClass(grid.element, 'masonry--loaded'); // make sure the gallery is visible
        grid.colHeights = [];
        grid.colItems = [];

        // grid layout has already been set -> update container height and order of items
        for(var j = 0; j < grid.activeColumns; j++) {
            grid.colHeights.push(0); // reset col heights
            grid.colItems[j] = []; // reset items order
        }

        for(var i = 0; i < grid.items.length; i++) {
            var minHeight = Math.min.apply( Math, grid.colHeights ),
                index = grid.colHeights.indexOf(minHeight);
            if(grid.colItems[index]) grid.colItems[index].push(i);
            grid.items[i].style.flexBasis = 0; // reset flex basis before getting height
            var itemHeight = grid.items[i].getBoundingClientRect().height || grid.items[i].offsetHeight || 1;
            grid.colHeights[index] = grid.colHeights[index] + grid.colGap + itemHeight;
        }

        // reset height of container
        var masonryHeight = Math.max.apply( Math, grid.colHeights ) + 5;
        grid.list.style.cssText = 'height: '+ masonryHeight + 'px;';

        // go through elements and set flex order
        var order = 0;
        for(var i = 0; i < grid.colItems.length; i++) {
            for(var j = 0; j < grid.colItems[i].length; j++) {
                grid.items[grid.colItems[i][j]].style.order = order;
                order = order + 1;
            }
            // change flex-basis of last element of each column, so that next element shifts to next col
            var lastItemCol = grid.items[grid.colItems[i][grid.colItems[i].length - 1]];
            if(lastItemCol) lastItemCol.style.flexBasis = masonryHeight - grid.colHeights[i] + lastItemCol.getBoundingClientRect().height - 5 + 'px';
        }

        grid.masonryLaid = true;
        // emit custom event when grid has been reset
        grid.element.dispatchEvent(new CustomEvent('masonry-laid'));
    };

    function checkImgLoaded(grid) {
        var imgs = grid.list.getElementsByTagName('img');

        function countLoaded() {
            var setTimeoutOn = false;
            for(var i = 0; i < imgs.length; i++) {
                if(imgs[i].complete && imgs[i].naturalHeight == 0) {
                    continue; // broken image -> skip
                }

                if(!imgs[i].complete) {
                    setTimeoutOn = true;
                    break;
                } else if (typeof imgs[i].naturalHeight !== "undefined" && imgs[i].naturalHeight == 0) {
                    setTimeoutOn = true;
                    break;
                }
            }

            if(!setTimeoutOn) {
                layItems(grid);
            } else {
                setTimeout(function(){
                    countLoaded();
                }, 100);
            }
        };

        if(imgs.length == 0) {
            layItems(grid); // no need to wait -> no img available
        } else {
            countLoaded();
        }
    };

    //initialize the Masonry objects
    var masonries = document.getElementsByClassName('js-masonry'),
        flexSupported = Util.cssSupports('flex-basis', 'auto'),
        masonriesArray = [];

    if( masonries.length > 0) {
        for( var i = 0; i < masonries.length; i++) {
            if(!flexSupported) {
                Util.addClass(masonries[i], 'masonry--loaded'); // reveal gallery
            } else {
                (function(i){masonriesArray.push(new Masonry(masonries[i]));})(i); // init Masonry Layout
            }
        }

        if(!flexSupported) return;

        // listen to window resize -> reorganize items in gallery
        var resizingId = false,
            customEvent = new CustomEvent('masonry-resize');

        window.addEventListener('resize', function() {
            clearTimeout(resizingId);
            resizingId = setTimeout(doneResizing, 500);
        });

        function doneResizing() {
            for( var i = 0; i < masonriesArray.length; i++) {
                (function(i){masonriesArray[i].element.dispatchEvent(customEvent)})(i);
            };
        };
    };
}());

// File#: _1_modal-window
// Usage: codyhouse.co/license
(function() {
    var Modal = function(element) {
        this.element = element;
        this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.moveFocusEl = null; // focus will be moved to this element when modal is open
        this.modalFocus = this.element.getAttribute('data-modal-first-focus') ? this.element.querySelector(this.element.getAttribute('data-modal-first-focus')) : null;
        this.selectedTrigger = null;
        this.preventScrollEl = this.getPreventScrollEl();
        this.showClass = "modal--is-visible";
        this.initModal();
    };

    Modal.prototype.getPreventScrollEl = function() {
        var scrollEl = false;
        var querySelector = this.element.getAttribute('data-modal-prevent-scroll');
        if(querySelector) scrollEl = document.querySelector(querySelector);
        return scrollEl;
    };

    Modal.prototype.initModal = function() {
        var self = this;
        //open modal when clicking on trigger buttons
        if ( this.triggers ) {
            for(var i = 0; i < this.triggers.length; i++) {
                this.triggers[i].addEventListener('click', function(event) {
                    event.preventDefault();
                    if(Util.hasClass(self.element, self.showClass)) {
                        self.closeModal();
                        return;
                    }
                    self.selectedTrigger = event.currentTarget;
                    self.showModal();
                    self.initModalEvents();
                });
            }
        }

        // listen to the openModal event -> open modal without a trigger button
        this.element.addEventListener('openModal', function(event){
            if(event.detail) self.selectedTrigger = event.detail;
            self.showModal();
            self.initModalEvents();
        });

        // listen to the closeModal event -> close modal without a trigger button
        this.element.addEventListener('closeModal', function(event){
            if(event.detail) self.selectedTrigger = event.detail;
            self.closeModal();
        });

        // if modal is open by default -> initialise modal events
        if(Util.hasClass(this.element, this.showClass)) this.initModalEvents();
    };

    Modal.prototype.showModal = function() {
        var self = this;
        Util.addClass(this.element, this.showClass);
        this.getFocusableElements();
        if(this.moveFocusEl) {
            this.moveFocusEl.focus();
            // wait for the end of transitions before moving focus
            this.element.addEventListener("transitionend", function cb(event) {
                self.moveFocusEl.focus();
                self.element.removeEventListener("transitionend", cb);
            });
        }
        this.emitModalEvents('modalIsOpen');
        // change the overflow of the preventScrollEl
        if(this.preventScrollEl) this.preventScrollEl.style.overflow = 'hidden';
    };

    Modal.prototype.closeModal = function() {
        if(!Util.hasClass(this.element, this.showClass)) return;
        Util.removeClass(this.element, this.showClass);
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.moveFocusEl = null;
        if(this.selectedTrigger) this.selectedTrigger.focus();
        //remove listeners
        this.cancelModalEvents();
        this.emitModalEvents('modalIsClose');
        // change the overflow of the preventScrollEl
        if(this.preventScrollEl) this.preventScrollEl.style.overflow = '';
    };

    Modal.prototype.initModalEvents = function() {
        //add event listeners
        this.element.addEventListener('keydown', this);
        this.element.addEventListener('click', this);
    };

    Modal.prototype.cancelModalEvents = function() {
        //remove event listeners
        this.element.removeEventListener('keydown', this);
        this.element.removeEventListener('click', this);
    };

    Modal.prototype.handleEvent = function (event) {
        switch(event.type) {
            case 'click': {
                this.initClick(event);
            }
            case 'keydown': {
                this.initKeyDown(event);
            }
        }
    };

    Modal.prototype.initKeyDown = function(event) {
        if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
            //trap focus inside modal
            this.trapFocus(event);
        } else if( (event.keyCode && event.keyCode == 13 || event.key && event.key == 'Enter') && event.target.closest('.js-modal__close')) {
            event.preventDefault();
            this.closeModal(); // close modal when pressing Enter on close button
        }
    };

    Modal.prototype.initClick = function(event) {
        //close modal when clicking on close button or modal bg layer 
        if( !event.target.closest('.js-modal__close') && !Util.hasClass(event.target, 'js-modal') ) return;
        event.preventDefault();
        this.closeModal();
    };

    Modal.prototype.trapFocus = function(event) {
        if( this.firstFocusable == document.activeElement && event.shiftKey) {
            //on Shift+Tab -> focus last focusable element when focus moves out of modal
            event.preventDefault();
            this.lastFocusable.focus();
        }
        if( this.lastFocusable == document.activeElement && !event.shiftKey) {
            //on Tab -> focus first focusable element when focus moves out of modal
            event.preventDefault();
            this.firstFocusable.focus();
        }
    }

    Modal.prototype.getFocusableElements = function() {
        //get all focusable elements inside the modal
        var allFocusable = this.element.querySelectorAll(focusableElString);
        this.getFirstVisible(allFocusable);
        this.getLastVisible(allFocusable);
        this.getFirstFocusable();
    };

    Modal.prototype.getFirstVisible = function(elements) {
        //get first visible focusable element inside the modal
        for(var i = 0; i < elements.length; i++) {
            if( isVisible(elements[i]) ) {
                this.firstFocusable = elements[i];
                break;
            }
        }
    };

    Modal.prototype.getLastVisible = function(elements) {
        //get last visible focusable element inside the modal
        for(var i = elements.length - 1; i >= 0; i--) {
            if( isVisible(elements[i]) ) {
                this.lastFocusable = elements[i];
                break;
            }
        }
    };

    Modal.prototype.getFirstFocusable = function() {
        if(!this.modalFocus || !Element.prototype.matches) {
            this.moveFocusEl = this.firstFocusable;
            return;
        }
        var containerIsFocusable = this.modalFocus.matches(focusableElString);
        if(containerIsFocusable) {
            this.moveFocusEl = this.modalFocus;
        } else {
            this.moveFocusEl = false;
            var elements = this.modalFocus.querySelectorAll(focusableElString);
            for(var i = 0; i < elements.length; i++) {
                if( isVisible(elements[i]) ) {
                    this.moveFocusEl = elements[i];
                    break;
                }
            }
            if(!this.moveFocusEl) this.moveFocusEl = this.firstFocusable;
        }
    };

    Modal.prototype.emitModalEvents = function(eventName) {
        var event = new CustomEvent(eventName, {detail: this.selectedTrigger});
        this.element.dispatchEvent(event);
    };

    function isVisible(element) {
        return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
    };

    window.Modal = Modal;

    //initialize the Modal objects
    var modals = document.getElementsByClassName('js-modal');
    // generic focusable elements string selector
    var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
    if( modals.length > 0 ) {
        var modalArrays = [];
        for( var i = 0; i < modals.length; i++) {
            (function(i){modalArrays.push(new Modal(modals[i]));})(i);
        }

        window.addEventListener('keydown', function(event){ //close modal window on esc
            if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape') {
                for( var i = 0; i < modalArrays.length; i++) {
                    (function(i){modalArrays[i].closeModal();})(i);
                };
            }
        });
    }
}());

// File#: _1_smooth-scrolling
// Usage: codyhouse.co/license
(function() {
    var SmoothScroll = function(element) {
        if(!('CSS' in window) || !CSS.supports('color', 'var(--color-var)')) return;
        this.element = element;
        this.scrollDuration = parseInt(this.element.getAttribute('data-duration')) || 300;
        this.dataElementY = this.element.getAttribute('data-scrollable-element-y') || this.element.getAttribute('data-scrollable-element') || this.element.getAttribute('data-element');
        this.scrollElementY = this.dataElementY ? document.querySelector(this.dataElementY) : window;
        this.dataElementX = this.element.getAttribute('data-scrollable-element-x');
        this.scrollElementX = this.dataElementY ? document.querySelector(this.dataElementX) : window;
        this.initScroll();
    };

    SmoothScroll.prototype.initScroll = function() {
        var self = this;

        //detect click on link
        this.element.addEventListener('click', function(event){
            event.preventDefault();
            var targetId = event.target.closest('.js-smooth-scroll').getAttribute('href').replace('#', ''),
                target = document.getElementById(targetId),
                targetTabIndex = target.getAttribute('tabindex'),
                windowScrollTop = self.scrollElementY.scrollTop || document.documentElement.scrollTop;

            // scroll vertically
            if(!self.dataElementY) windowScrollTop = window.scrollY || document.documentElement.scrollTop;

            var scrollElementY = self.dataElementY ? self.scrollElementY : false;

            var fixedHeight = self.getFixedElementHeight(); // check if there's a fixed element on the page
            Util.scrollTo(target.getBoundingClientRect().top + windowScrollTop - fixedHeight, self.scrollDuration, function() {
                // scroll horizontally
                self.scrollHorizontally(target, fixedHeight);
                //move the focus to the target element - don't break keyboard navigation
                Util.moveFocus(target);
                history.pushState(false, false, '#'+targetId);
                self.resetTarget(target, targetTabIndex);
            }, scrollElementY);
        });
    };

    SmoothScroll.prototype.scrollHorizontally = function(target, delta) {
        var scrollEl = this.dataElementX ? this.scrollElementX : false;
        var windowScrollLeft = this.scrollElementX ? this.scrollElementX.scrollLeft : document.documentElement.scrollLeft;
        var final = target.getBoundingClientRect().left + windowScrollLeft - delta,
            duration = this.scrollDuration;

        var element = scrollEl || window;
        var start = element.scrollLeft || document.documentElement.scrollLeft,
            currentTime = null;

        if(!scrollEl) start = window.scrollX || document.documentElement.scrollLeft;
        // return if there's no need to scroll
        if(Math.abs(start - final) < 5) return;

        var animateScroll = function(timestamp){
            if (!currentTime) currentTime = timestamp;
            var progress = timestamp - currentTime;
            if(progress > duration) progress = duration;
            var val = Math.easeInOutQuad(progress, start, final-start, duration);
            element.scrollTo({
                left: val,
            });
            if(progress < duration) {
                window.requestAnimationFrame(animateScroll);
            }
        };

        window.requestAnimationFrame(animateScroll);
    };

    SmoothScroll.prototype.resetTarget = function(target, tabindex) {
        if( parseInt(target.getAttribute('tabindex')) < 0) {
            target.style.outline = 'none';
            !tabindex && target.removeAttribute('tabindex');
        }
    };

    SmoothScroll.prototype.getFixedElementHeight = function() {
        var scrollElementY = this.dataElementY ? this.scrollElementY : document.documentElement;
        var fixedElementDelta = parseInt(getComputedStyle(scrollElementY).getPropertyValue('scroll-padding'));
        if(isNaN(fixedElementDelta) ) { // scroll-padding not supported
            fixedElementDelta = 0;
            var fixedElement = document.querySelector(this.element.getAttribute('data-fixed-element'));
            if(fixedElement) fixedElementDelta = parseInt(fixedElement.getBoundingClientRect().height);
        }
        return fixedElementDelta;
    };

    //initialize the Smooth Scroll objects
    var smoothScrollLinks = document.getElementsByClassName('js-smooth-scroll');
    if( smoothScrollLinks.length > 0 && !Util.cssSupports('scroll-behavior', 'smooth') && window.requestAnimationFrame) {
        // you need javascript only if css scroll-behavior is not supported
        for( var i = 0; i < smoothScrollLinks.length; i++) {
            (function(i){new SmoothScroll(smoothScrollLinks[i]);})(i);
        }
    }
}());

// File#: _2_table-of-contents
// Usage: codyhouse.co/license
(function() {
    var Toc = function(element) {
        this.element = element;
        this.list = this.element.getElementsByClassName('js-toc__list')[0];
        this.anchors = this.list.querySelectorAll('a[href^="#"]');
        this.sections = getSections(this);
        this.controller = this.element.getElementsByClassName('js-toc__control');
        this.controllerLabel = this.element.getElementsByClassName('js-toc__control-label');
        this.content = getTocContent(this);
        this.clickScrolling = false;
        this.intervalID = false;
        this.staticLayoutClass = 'toc--static';
        this.contentStaticLayoutClass = 'toc-content--toc-static';
        this.expandedClass = 'toc--expanded';
        this.isStatic = Util.hasClass(this.element, this.staticLayoutClass);
        this.layout = 'static';
        initToc(this);
    };

    function getSections(toc) {
        var sections = [];
        // get all content sections
        for(var i = 0; i < toc.anchors.length; i++) {
            var section = document.getElementById(toc.anchors[i].getAttribute('href').replace('#', ''));
            if(section) sections.push(section);
        }
        return sections;
    };

    function getTocContent(toc) {
        if(toc.sections.length < 1) return false;
        var content = toc.sections[0].closest('.js-toc-content');
        return content;
    };

    function initToc(toc) {
        checkTocLayour(toc); // switch between mobile and desktop layout
        if(toc.sections.length > 0) {
            // listen for click on anchors
            toc.list.addEventListener('click', function(event){
                var anchor = event.target.closest('a[href^="#"]');
                if(!anchor) return;
                // reset link apperance 
                toc.clickScrolling = true;
                resetAnchors(toc, anchor);
                // close toc if expanded on mobile
                toggleToc(toc, true);
            });

            // check when a new section enters the viewport
            var intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
            if(intersectionObserverSupported) {
                var observer = new IntersectionObserver(
                    function(entries, observer) {
                        entries.forEach(function(entry){
                            if(!toc.clickScrolling) { // do not update classes if user clicked on a link
                                getVisibleSection(toc);
                            }
                        });
                    },
                    {
                        threshold: [0, 0.1],
                        rootMargin: "0px 0px -70% 0px"
                    }
                );

                for(var i = 0; i < toc.sections.length; i++) {
                    observer.observe(toc.sections[i]);
                }
            }

            // detect the end of scrolling -> reactivate IntersectionObserver on scroll
            toc.element.addEventListener('toc-scroll', function(event){
                toc.clickScrolling = false;
            });
        }

        // custom event emitted when window is resized
        toc.element.addEventListener('toc-resize', function(event){
            checkTocLayour(toc);
        });

        // collapsed version only (mobile)
        initCollapsedVersion(toc);
    };

    function resetAnchors(toc, anchor) {
        if(!anchor) return;
        for(var i = 0; i < toc.anchors.length; i++) Util.removeClass(toc.anchors[i], 'toc__link--selected');
        Util.addClass(anchor, 'toc__link--selected');
    };

    function getVisibleSection(toc) {
        if(toc.intervalID) {
            clearInterval(toc.intervalID);
        }
        toc.intervalID = setTimeout(function(){
            var halfWindowHeight = window.innerHeight/2,
                index = -1;
            for(var i = 0; i < toc.sections.length; i++) {
                var top = toc.sections[i].getBoundingClientRect().top;
                if(top < halfWindowHeight) index = i;
            }
            if(index > -1) {
                resetAnchors(toc, toc.anchors[index]);
            }
            toc.intervalID = false;
        }, 100);
    };

    function checkTocLayour(toc) {
        if(toc.isStatic) return;
        toc.layout = getComputedStyle(toc.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
        Util.toggleClass(toc.element, toc.staticLayoutClass, toc.layout == 'static');
        if(toc.content) Util.toggleClass(toc.content, toc.contentStaticLayoutClass, toc.layout == 'static');
    };

    function initCollapsedVersion(toc) { // collapsed version only (mobile)
        if(toc.controller.length < 1) return;

        // toggle nav visibility
        toc.controller[0].addEventListener('click', function(event){
            var isOpen = Util.hasClass(toc.element, toc.expandedClass);
            toggleToc(toc, isOpen);
        });

        // close expanded version on esc
        toc.element.addEventListener('keydown', function(event){
            if(toc.layout == 'static') return;
            if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape') ) {
                toggleToc(toc, true);
                toc.controller[0].focus();
            }
        });
    };

    function toggleToc(toc, bool) { // collapsed version only (mobile)
        if(toc.controller.length < 1) return;
        // toggle mobile version
        Util.toggleClass(toc.element, toc.expandedClass, !bool);
        bool ? toc.controller[0].removeAttribute('aria-expanded') : toc.controller[0].setAttribute('aria-expanded', 'true');
        if(!bool && toc.anchors.length > 0) {
            toc.anchors[0].focus();
        }
    };

    var tocs = document.getElementsByClassName('js-toc');

    var tocsArray = [];
    if( tocs.length > 0) {
        for( var i = 0; i < tocs.length; i++) {
            (function(i){ tocsArray.push(new Toc(tocs[i])); })(i);
        }

        // listen to window scroll -> reset clickScrolling property
        var scrollId = false,
            resizeId = false,
            scrollEvent = new CustomEvent('toc-scroll'),
            resizeEvent = new CustomEvent('toc-resize');

        window.addEventListener('scroll', function() {
            clearTimeout(scrollId);
            scrollId = setTimeout(doneScrolling, 100);
        });

        window.addEventListener('resize', function() {
            clearTimeout(resizeId);
            scrollId = setTimeout(doneResizing, 100);
        });

        function doneScrolling() {
            for( var i = 0; i < tocsArray.length; i++) {
                (function(i){tocsArray[i].element.dispatchEvent(scrollEvent)})(i);
            };
        };

        function doneResizing() {
            for( var i = 0; i < tocsArray.length; i++) {
                (function(i){tocsArray[i].element.dispatchEvent(resizeEvent)})(i);
            };
        };
    }
}());

// File#: _1_accordion
// Usage: codyhouse.co/license
(function() {
    var Accordion = function(element) {
        this.element = element;
        this.items = getChildrenByClassName(this.element, 'js-accordion__item');
        this.version = this.element.getAttribute('data-version') ? '-'+this.element.getAttribute('data-version') : '';
        this.showClass = 'accordion'+this.version+'__item--is-open';
        this.animateHeight = (this.element.getAttribute('data-animation') == 'on');
        this.multiItems = !(this.element.getAttribute('data-multi-items') == 'off');
        // deep linking options
        this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
        // init accordion
        this.initAccordion();
    };

    Accordion.prototype.initAccordion = function() {
        //set initial aria attributes
        for( var i = 0; i < this.items.length; i++) {
            var button = this.items[i].getElementsByTagName('button')[0],
                content = this.items[i].getElementsByClassName('js-accordion__panel')[0],
                isOpen = this.items[i].classList.contains(this.showClass) ? 'true' : 'false';
            button.setAttribute('aria-expanded', isOpen);
            button.setAttribute('aria-controls', 'accordion-content-'+i);
            button.setAttribute('id', 'accordion-header-'+i);
            button.classList.add('js-accordion__trigger');
            content.setAttribute('aria-labelledby', 'accordion-header-'+i);
            content.setAttribute('id', 'accordion-content-'+i);
        }

        //listen for Accordion events
        this.initAccordionEvents();

        // check deep linking option
        this.initDeepLink();
    };

    Accordion.prototype.initAccordionEvents = function() {
        var self = this;

        this.element.addEventListener('click', function(event) {
            var trigger = event.target.closest('.js-accordion__trigger');
            //check index to make sure the click didn't happen inside a children accordion
            if( trigger && Array.prototype.indexOf.call(self.items, trigger.parentElement) >= 0) self.triggerAccordion(trigger);
        });
    };

    Accordion.prototype.triggerAccordion = function(trigger) {
        var bool = (trigger.getAttribute('aria-expanded') === 'true');

        this.animateAccordion(trigger, bool, false);

        if(!bool && this.deepLinkOn) {
            history.replaceState(null, '', '#'+trigger.getAttribute('aria-controls'));
        }
    };

    Accordion.prototype.animateAccordion = function(trigger, bool, deepLink) {
        var self = this;
        var item = trigger.closest('.js-accordion__item'),
            content = item.getElementsByClassName('js-accordion__panel')[0],
            ariaValue = bool ? 'false' : 'true';

        if(!bool) item.classList.add(this.showClass);
        trigger.setAttribute('aria-expanded', ariaValue);
        self.resetContentVisibility(item, content, bool);

        if( !this.multiItems && !bool || deepLink) this.closeSiblings(item);
    };

    Accordion.prototype.resetContentVisibility = function(item, content, bool) {
        item.classList.toggle(this.showClass, !bool);
        content.removeAttribute("style");
        if(bool && !this.multiItems) { // accordion item has been closed -> check if there's one open to move inside viewport 
            this.moveContent();
        }
    };

    Accordion.prototype.closeSiblings = function(item) {
        //if only one accordion can be open -> search if there's another one open
        var index = Array.prototype.indexOf.call(this.items, item);
        for( var i = 0; i < this.items.length; i++) {
            if(this.items[i].classList.contains(this.showClass) && i != index) {
                this.animateAccordion(this.items[i].getElementsByClassName('js-accordion__trigger')[0], true, false);
                return false;
            }
        }
    };

    Accordion.prototype.moveContent = function() { // make sure title of the accordion just opened is inside the viewport
        var openAccordion = this.element.getElementsByClassName(this.showClass);
        if(openAccordion.length == 0) return;
        var boundingRect = openAccordion[0].getBoundingClientRect();
        if(boundingRect.top < 0 || boundingRect.top > window.innerHeight) {
            var windowScrollTop = window.scrollY || document.documentElement.scrollTop;
            window.scrollTo(0, boundingRect.top + windowScrollTop);
        }
    };

    Accordion.prototype.initDeepLink = function() {
        if(!this.deepLinkOn) return;
        var hash = window.location.hash.substr(1);
        if(!hash || hash == '') return;
        var trigger = this.element.querySelector('.js-accordion__trigger[aria-controls="'+hash+'"]');
        if(trigger && trigger.getAttribute('aria-expanded') !== 'true') {
            this.animateAccordion(trigger, false, true);
            setTimeout(function(){trigger.scrollIntoView(true);});
        }
    };

    function getChildrenByClassName(el, className) {
        var children = el.children,
            childrenByClass = [];
        for (var i = 0; i < children.length; i++) {
            if (children[i].classList.contains(className)) childrenByClass.push(children[i]);
        }
        return childrenByClass;
    };

    window.Accordion = Accordion;

    //initialize the Accordion objects
    var accordions = document.getElementsByClassName('js-accordion');
    if( accordions.length > 0 ) {
        for( var i = 0; i < accordions.length; i++) {
            (function(i){new Accordion(accordions[i]);})(i);
        }
    }
}());

// File#: _1_back-to-top
// Usage: codyhouse.co/license
(function() {
    var backTop = document.getElementsByClassName('js-back-to-top')[0];
    if( backTop ) {
        var dataElement = backTop.getAttribute('data-element');
        var scrollElement = dataElement ? document.querySelector(dataElement) : window;
        var scrollOffsetInit = parseInt(backTop.getAttribute('data-offset-in')) || parseInt(backTop.getAttribute('data-offset')) || 0, //show back-to-top if scrolling > scrollOffset
            scrollOffsetOutInit = parseInt(backTop.getAttribute('data-offset-out')) || 0,
            scrollOffset = 0,
            scrollOffsetOut = 0,
            scrolling = false;

        // check if target-in/target-out have been set
        var targetIn = backTop.getAttribute('data-target-in') ? document.querySelector(backTop.getAttribute('data-target-in')) : false,
            targetOut = backTop.getAttribute('data-target-out') ? document.querySelector(backTop.getAttribute('data-target-out')) : false;

        updateOffsets();

        //detect click on back-to-top link
        backTop.addEventListener('click', function(event) {
            event.preventDefault();
            if(!window.requestAnimationFrame) {
                scrollElement.scrollTo(0, 0);
            } else {
                dataElement ? scrollElement.scrollTo({top: 0, behavior: 'smooth'}) : window.scrollTo({top: 0, behavior: 'smooth'});
            }
            //move the focus to the #top-element - don't break keyboard navigation
            moveFocus(document.getElementById(backTop.getAttribute('href').replace('#', '')));
        });

        //listen to the window scroll and update back-to-top visibility
        checkBackToTop();
        if (scrollOffset > 0 || scrollOffsetOut > 0) {
            scrollElement.addEventListener("scroll", function(event) {
                if( !scrolling ) {
                    scrolling = true;
                    (!window.requestAnimationFrame) ? setTimeout(function(){checkBackToTop();}, 250) : window.requestAnimationFrame(checkBackToTop);
                }
            });
        }

        function checkBackToTop() {
            updateOffsets();
            var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
            if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
            var condition =  windowTop >= scrollOffset;
            if(scrollOffsetOut > 0) {
                condition = (windowTop >= scrollOffset) && (window.innerHeight + windowTop < scrollOffsetOut);
            }
            backTop.classList.toggle('back-to-top--is-visible', condition);
            scrolling = false;
        }

        function updateOffsets() {
            scrollOffset = getOffset(targetIn, scrollOffsetInit, true);
            scrollOffsetOut = getOffset(targetOut, scrollOffsetOutInit);
        }

        function getOffset(target, startOffset, bool) {
            var offset = 0;
            if(target) {
                var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
                if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
                var boundingClientRect = target.getBoundingClientRect();
                offset = bool ? boundingClientRect.bottom : boundingClientRect.top;
                offset = offset + windowTop;
            }
            if(startOffset && startOffset) {
                offset = offset + parseInt(startOffset);
            }
            return offset;
        }

        function moveFocus(element) {
            if( !element ) element = document.getElementsByTagName("body")[0];
            element.focus();
            if (document.activeElement !== element) {
                element.setAttribute('tabindex','-1');
                element.focus();
            }
        };
    }
}());
// File#: _2_pricing-table
// Usage: codyhouse.co/license
(function() {
    // NOTE: you need the js code only when using the --has-switch variation of the pricing table
    // default version does not require js
    var pTable = document.getElementsByClassName('js-p-table--has-switch');
    if(pTable.length > 0) {
        for(var i = 0; i < pTable.length; i++) {
            (function(i){ addPTableEvent(pTable[i]);})(i);
        }

        function addPTableEvent(element) {
            var pSwitch = element.getElementsByClassName('js-p-table__switch')[0];
            if(pSwitch) {
                pSwitch.addEventListener('change', function(event) {
                    Util.toggleClass(element, 'p-table--yearly', (event.target.value == 'yearly'));
                });
            }
        }
    }
}());
/*!
 * Masonry PACKAGED v4.2.2
 * Cascading grid layout library
 * https://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */

/**
 * Bridget makes jQuery widgets
 * v2.0.1
 * MIT license
 */

/* jshint browser: true, strict: true, undef: true, unused: true */

( function( window, factory ) {
    // universal module definition
    /*jshint strict: false */ /* globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'jquery-bridget/jquery-bridget',[ 'jquery' ], function( jQuery ) {
            return factory( window, jQuery );
        });
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('jquery')
        );
    } else {
        // browser global
        window.jQueryBridget = factory(
            window,
            window.jQuery
        );
    }

}( window, function factory( window, jQuery ) {
    'use strict';

// ----- utils ----- //

    var arraySlice = Array.prototype.slice;

// helper function for logging errors
// $.error breaks jQuery chaining
    var console = window.console;
    var logError = typeof console == 'undefined' ? function() {} :
        function( message ) {
            console.error( message );
        };

// ----- jQueryBridget ----- //

    function jQueryBridget( namespace, PluginClass, $ ) {
        $ = $ || jQuery || window.jQuery;
        if ( !$ ) {
            return;
        }

        // add option method -> $().plugin('option', {...})
        if ( !PluginClass.prototype.option ) {
            // option setter
            PluginClass.prototype.option = function( opts ) {
                // bail out if not an object
                if ( !$.isPlainObject( opts ) ){
                    return;
                }
                this.options = $.extend( true, this.options, opts );
            };
        }

        // make jQuery plugin
        $.fn[ namespace ] = function( arg0 /*, arg1 */ ) {
            if ( typeof arg0 == 'string' ) {
                // method call $().plugin( 'methodName', { options } )
                // shift arguments by 1
                var args = arraySlice.call( arguments, 1 );
                return methodCall( this, arg0, args );
            }
            // just $().plugin({ options })
            plainCall( this, arg0 );
            return this;
        };

        // $().plugin('methodName')
        function methodCall( $elems, methodName, args ) {
            var returnValue;
            var pluginMethodStr = '$().' + namespace + '("' + methodName + '")';

            $elems.each( function( i, elem ) {
                // get instance
                var instance = $.data( elem, namespace );
                if ( !instance ) {
                    logError( namespace + ' not initialized. Cannot call methods, i.e. ' +
                        pluginMethodStr );
                    return;
                }

                var method = instance[ methodName ];
                if ( !method || methodName.charAt(0) == '_' ) {
                    logError( pluginMethodStr + ' is not a valid method' );
                    return;
                }

                // apply method, get return value
                var value = method.apply( instance, args );
                // set return value if value is returned, use only first value
                returnValue = returnValue === undefined ? value : returnValue;
            });

            return returnValue !== undefined ? returnValue : $elems;
        }

        function plainCall( $elems, options ) {
            $elems.each( function( i, elem ) {
                var instance = $.data( elem, namespace );
                if ( instance ) {
                    // set options & init
                    instance.option( options );
                    instance._init();
                } else {
                    // initialize new instance
                    instance = new PluginClass( elem, options );
                    $.data( elem, namespace, instance );
                }
            });
        }

        updateJQuery( $ );

    }

// ----- updateJQuery ----- //

// set $.bridget for v1 backwards compatibility
    function updateJQuery( $ ) {
        if ( !$ || ( $ && $.bridget ) ) {
            return;
        }
        $.bridget = jQueryBridget;
    }

    updateJQuery( jQuery || window.jQuery );

// -----  ----- //

    return jQueryBridget;

}));

/**
 * EvEmitter v1.1.0
 * Lil' event emitter
 * MIT License
 */

/* jshint unused: true, undef: true, strict: true */

( function( global, factory ) {
    // universal module definition
    /* jshint strict: false */ /* globals define, module, window */
    if ( typeof define == 'function' && define.amd ) {
        // AMD - RequireJS
        define( 'ev-emitter/ev-emitter',factory );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS - Browserify, Webpack
        module.exports = factory();
    } else {
        // Browser globals
        global.EvEmitter = factory();
    }

}( typeof window != 'undefined' ? window : this, function() {



    function EvEmitter() {}

    var proto = EvEmitter.prototype;

    proto.on = function( eventName, listener ) {
        if ( !eventName || !listener ) {
            return;
        }
        // set events hash
        var events = this._events = this._events || {};
        // set listeners array
        var listeners = events[ eventName ] = events[ eventName ] || [];
        // only add once
        if ( listeners.indexOf( listener ) == -1 ) {
            listeners.push( listener );
        }

        return this;
    };

    proto.once = function( eventName, listener ) {
        if ( !eventName || !listener ) {
            return;
        }
        // add event
        this.on( eventName, listener );
        // set once flag
        // set onceEvents hash
        var onceEvents = this._onceEvents = this._onceEvents || {};
        // set onceListeners object
        var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
        // set flag
        onceListeners[ listener ] = true;

        return this;
    };

    proto.off = function( eventName, listener ) {
        var listeners = this._events && this._events[ eventName ];
        if ( !listeners || !listeners.length ) {
            return;
        }
        var index = listeners.indexOf( listener );
        if ( index != -1 ) {
            listeners.splice( index, 1 );
        }

        return this;
    };

    proto.emitEvent = function( eventName, args ) {
        var listeners = this._events && this._events[ eventName ];
        if ( !listeners || !listeners.length ) {
            return;
        }
        // copy over to avoid interference if .off() in listener
        listeners = listeners.slice(0);
        args = args || [];
        // once stuff
        var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

        for ( var i=0; i < listeners.length; i++ ) {
            var listener = listeners[i]
            var isOnce = onceListeners && onceListeners[ listener ];
            if ( isOnce ) {
                // remove listener
                // remove before trigger to prevent recursion
                this.off( eventName, listener );
                // unset once flag
                delete onceListeners[ listener ];
            }
            // trigger listener
            listener.apply( this, args );
        }

        return this;
    };

    proto.allOff = function() {
        delete this._events;
        delete this._onceEvents;
    };

    return EvEmitter;

}));

/*!
 * getSize v2.0.3
 * measure size of elements
 * MIT license
 */

/* jshint browser: true, strict: true, undef: true, unused: true */
/* globals console: false */

( function( window, factory ) {
    /* jshint strict: false */ /* globals define, module */
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'get-size/get-size',factory );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory();
    } else {
        // browser global
        window.getSize = factory();
    }

})( window, function factory() {
    'use strict';

// -------------------------- helpers -------------------------- //

// get a number from a string, not a percentage
    function getStyleSize( value ) {
        var num = parseFloat( value );
        // not a percent like '100%', and a number
        var isValid = value.indexOf('%') == -1 && !isNaN( num );
        return isValid && num;
    }

    function noop() {}

    var logError = typeof console == 'undefined' ? noop :
        function( message ) {
            console.error( message );
        };

// -------------------------- measurements -------------------------- //

    var measurements = [
        'paddingLeft',
        'paddingRight',
        'paddingTop',
        'paddingBottom',
        'marginLeft',
        'marginRight',
        'marginTop',
        'marginBottom',
        'borderLeftWidth',
        'borderRightWidth',
        'borderTopWidth',
        'borderBottomWidth'
    ];

    var measurementsLength = measurements.length;

    function getZeroSize() {
        var size = {
            width: 0,
            height: 0,
            innerWidth: 0,
            innerHeight: 0,
            outerWidth: 0,
            outerHeight: 0
        };
        for ( var i=0; i < measurementsLength; i++ ) {
            var measurement = measurements[i];
            size[ measurement ] = 0;
        }
        return size;
    }

// -------------------------- getStyle -------------------------- //

    /**
     * getStyle, get style of element, check for Firefox bug
     * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
     */
    function getStyle( elem ) {
        var style = getComputedStyle( elem );
        if ( !style ) {
            logError( 'Style returned ' + style +
                '. Are you running this code in a hidden iframe on Firefox? ' +
                'See https://bit.ly/getsizebug1' );
        }
        return style;
    }

// -------------------------- setup -------------------------- //

    var isSetup = false;

    var isBoxSizeOuter;

    /**
     * setup
     * check isBoxSizerOuter
     * do on first getSize() rather than on page load for Firefox bug
     */
    function setup() {
        // setup once
        if ( isSetup ) {
            return;
        }
        isSetup = true;

        // -------------------------- box sizing -------------------------- //

        /**
         * Chrome & Safari measure the outer-width on style.width on border-box elems
         * IE11 & Firefox<29 measures the inner-width
         */
        var div = document.createElement('div');
        div.style.width = '200px';
        div.style.padding = '1px 2px 3px 4px';
        div.style.borderStyle = 'solid';
        div.style.borderWidth = '1px 2px 3px 4px';
        div.style.boxSizing = 'border-box';

        var body = document.body || document.documentElement;
        body.appendChild( div );
        var style = getStyle( div );
        // round value for browser zoom. desandro/masonry#928
        isBoxSizeOuter = Math.round( getStyleSize( style.width ) ) == 200;
        getSize.isBoxSizeOuter = isBoxSizeOuter;

        body.removeChild( div );
    }

// -------------------------- getSize -------------------------- //

    function getSize( elem ) {
        setup();

        // use querySeletor if elem is string
        if ( typeof elem == 'string' ) {
            elem = document.querySelector( elem );
        }

        // do not proceed on non-objects
        if ( !elem || typeof elem != 'object' || !elem.nodeType ) {
            return;
        }

        var style = getStyle( elem );

        // if hidden, everything is 0
        if ( style.display == 'none' ) {
            return getZeroSize();
        }

        var size = {};
        size.width = elem.offsetWidth;
        size.height = elem.offsetHeight;

        var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

        // get all measurements
        for ( var i=0; i < measurementsLength; i++ ) {
            var measurement = measurements[i];
            var value = style[ measurement ];
            var num = parseFloat( value );
            // any 'auto', 'medium' value will be 0
            size[ measurement ] = !isNaN( num ) ? num : 0;
        }

        var paddingWidth = size.paddingLeft + size.paddingRight;
        var paddingHeight = size.paddingTop + size.paddingBottom;
        var marginWidth = size.marginLeft + size.marginRight;
        var marginHeight = size.marginTop + size.marginBottom;
        var borderWidth = size.borderLeftWidth + size.borderRightWidth;
        var borderHeight = size.borderTopWidth + size.borderBottomWidth;

        var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

        // overwrite width and height if we can get it from style
        var styleWidth = getStyleSize( style.width );
        if ( styleWidth !== false ) {
            size.width = styleWidth +
                // add padding and border unless it's already including it
                ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
        }

        var styleHeight = getStyleSize( style.height );
        if ( styleHeight !== false ) {
            size.height = styleHeight +
                // add padding and border unless it's already including it
                ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
        }

        size.innerWidth = size.width - ( paddingWidth + borderWidth );
        size.innerHeight = size.height - ( paddingHeight + borderHeight );

        size.outerWidth = size.width + marginWidth;
        size.outerHeight = size.height + marginHeight;

        return size;
    }

    return getSize;

});

/**
 * matchesSelector v2.0.2
 * matchesSelector( element, '.selector' )
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */

( function( window, factory ) {
    /*global define: false, module: false */
    'use strict';
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'desandro-matches-selector/matches-selector',factory );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory();
    } else {
        // browser global
        window.matchesSelector = factory();
    }

}( window, function factory() {
    'use strict';

    var matchesMethod = ( function() {
        var ElemProto = window.Element.prototype;
        // check for the standard method name first
        if ( ElemProto.matches ) {
            return 'matches';
        }
        // check un-prefixed
        if ( ElemProto.matchesSelector ) {
            return 'matchesSelector';
        }
        // check vendor prefixes
        var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];

        for ( var i=0; i < prefixes.length; i++ ) {
            var prefix = prefixes[i];
            var method = prefix + 'MatchesSelector';
            if ( ElemProto[ method ] ) {
                return method;
            }
        }
    })();

    return function matchesSelector( elem, selector ) {
        return elem[ matchesMethod ]( selector );
    };

}));

/**
 * Fizzy UI utils v2.0.7
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true, strict: true */

( function( window, factory ) {
    // universal module definition
    /*jshint strict: false */ /*globals define, module, require */

    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'fizzy-ui-utils/utils',[
            'desandro-matches-selector/matches-selector'
        ], function( matchesSelector ) {
            return factory( window, matchesSelector );
        });
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('desandro-matches-selector')
        );
    } else {
        // browser global
        window.fizzyUIUtils = factory(
            window,
            window.matchesSelector
        );
    }

}( window, function factory( window, matchesSelector ) {



    var utils = {};

// ----- extend ----- //

// extends objects
    utils.extend = function( a, b ) {
        for ( var prop in b ) {
            a[ prop ] = b[ prop ];
        }
        return a;
    };

// ----- modulo ----- //

    utils.modulo = function( num, div ) {
        return ( ( num % div ) + div ) % div;
    };

// ----- makeArray ----- //

    var arraySlice = Array.prototype.slice;

// turn element or nodeList into an array
    utils.makeArray = function( obj ) {
        if ( Array.isArray( obj ) ) {
            // use object if already an array
            return obj;
        }
        // return empty array if undefined or null. #6
        if ( obj === null || obj === undefined ) {
            return [];
        }

        var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
        if ( isArrayLike ) {
            // convert nodeList to array
            return arraySlice.call( obj );
        }

        // array of single index
        return [ obj ];
    };

// ----- removeFrom ----- //

    utils.removeFrom = function( ary, obj ) {
        var index = ary.indexOf( obj );
        if ( index != -1 ) {
            ary.splice( index, 1 );
        }
    };

// ----- getParent ----- //

    utils.getParent = function( elem, selector ) {
        while ( elem.parentNode && elem != document.body ) {
            elem = elem.parentNode;
            if ( matchesSelector( elem, selector ) ) {
                return elem;
            }
        }
    };

// ----- getQueryElement ----- //

// use element as selector string
    utils.getQueryElement = function( elem ) {
        if ( typeof elem == 'string' ) {
            return document.querySelector( elem );
        }
        return elem;
    };

// ----- handleEvent ----- //

// enable .ontype to trigger from .addEventListener( elem, 'type' )
    utils.handleEvent = function( event ) {
        var method = 'on' + event.type;
        if ( this[ method ] ) {
            this[ method ]( event );
        }
    };

// ----- filterFindElements ----- //

    utils.filterFindElements = function( elems, selector ) {
        // make array of elems
        elems = utils.makeArray( elems );
        var ffElems = [];

        elems.forEach( function( elem ) {
            // check that elem is an actual element
            if ( !( elem instanceof HTMLElement ) ) {
                return;
            }
            // add elem if no selector
            if ( !selector ) {
                ffElems.push( elem );
                return;
            }
            // filter & find items if we have a selector
            // filter
            if ( matchesSelector( elem, selector ) ) {
                ffElems.push( elem );
            }
            // find children
            var childElems = elem.querySelectorAll( selector );
            // concat childElems to filterFound array
            for ( var i=0; i < childElems.length; i++ ) {
                ffElems.push( childElems[i] );
            }
        });

        return ffElems;
    };

// ----- debounceMethod ----- //

    utils.debounceMethod = function( _class, methodName, threshold ) {
        threshold = threshold || 100;
        // original method
        var method = _class.prototype[ methodName ];
        var timeoutName = methodName + 'Timeout';

        _class.prototype[ methodName ] = function() {
            var timeout = this[ timeoutName ];
            clearTimeout( timeout );

            var args = arguments;
            var _this = this;
            this[ timeoutName ] = setTimeout( function() {
                method.apply( _this, args );
                delete _this[ timeoutName ];
            }, threshold );
        };
    };

// ----- docReady ----- //

    utils.docReady = function( callback ) {
        var readyState = document.readyState;
        if ( readyState == 'complete' || readyState == 'interactive' ) {
            // do async to allow for other scripts to run. metafizzy/flickity#441
            setTimeout( callback );
        } else {
            document.addEventListener( 'DOMContentLoaded', callback );
        }
    };

// ----- htmlInit ----- //

// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
    utils.toDashed = function( str ) {
        return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
            return $1 + '-' + $2;
        }).toLowerCase();
    };

    var console = window.console;
    /**
     * allow user to initialize classes via [data-namespace] or .js-namespace class
     * htmlInit( Widget, 'widgetName' )
     * options are parsed from data-namespace-options
     */
    utils.htmlInit = function( WidgetClass, namespace ) {
        utils.docReady( function() {
            var dashedNamespace = utils.toDashed( namespace );
            var dataAttr = 'data-' + dashedNamespace;
            var dataAttrElems = document.querySelectorAll( '[' + dataAttr + ']' );
            var jsDashElems = document.querySelectorAll( '.js-' + dashedNamespace );
            var elems = utils.makeArray( dataAttrElems )
                .concat( utils.makeArray( jsDashElems ) );
            var dataOptionsAttr = dataAttr + '-options';
            var jQuery = window.jQuery;

            elems.forEach( function( elem ) {
                var attr = elem.getAttribute( dataAttr ) ||
                    elem.getAttribute( dataOptionsAttr );
                var options;
                try {
                    options = attr && JSON.parse( attr );
                } catch ( error ) {
                    // log error, do not initialize
                    if ( console ) {
                        console.error( 'Error parsing ' + dataAttr + ' on ' + elem.className +
                            ': ' + error );
                    }
                    return;
                }
                // initialize
                var instance = new WidgetClass( elem, options );
                // make available via $().data('namespace')
                if ( jQuery ) {
                    jQuery.data( elem, namespace, instance );
                }
            });

        });
    };

// -----  ----- //

    return utils;

}));

/**
 * Outlayer Item
 */

( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /* globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
        // AMD - RequireJS
        define( 'outlayer/item',[
                'ev-emitter/ev-emitter',
                'get-size/get-size'
            ],
            factory
        );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS - Browserify, Webpack
        module.exports = factory(
            require('ev-emitter'),
            require('get-size')
        );
    } else {
        // browser global
        window.Outlayer = {};
        window.Outlayer.Item = factory(
            window.EvEmitter,
            window.getSize
        );
    }

}( window, function factory( EvEmitter, getSize ) {
    'use strict';

// ----- helpers ----- //

    function isEmptyObj( obj ) {
        for ( var prop in obj ) {
            return false;
        }
        prop = null;
        return true;
    }

// -------------------------- CSS3 support -------------------------- //


    var docElemStyle = document.documentElement.style;

    var transitionProperty = typeof docElemStyle.transition == 'string' ?
        'transition' : 'WebkitTransition';
    var transformProperty = typeof docElemStyle.transform == 'string' ?
        'transform' : 'WebkitTransform';

    var transitionEndEvent = {
        WebkitTransition: 'webkitTransitionEnd',
        transition: 'transitionend'
    }[ transitionProperty ];

// cache all vendor properties that could have vendor prefix
    var vendorProperties = {
        transform: transformProperty,
        transition: transitionProperty,
        transitionDuration: transitionProperty + 'Duration',
        transitionProperty: transitionProperty + 'Property',
        transitionDelay: transitionProperty + 'Delay'
    };

// -------------------------- Item -------------------------- //

    function Item( element, layout ) {
        if ( !element ) {
            return;
        }

        this.element = element;
        // parent layout class, i.e. Masonry, Isotope, or Packery
        this.layout = layout;
        this.position = {
            x: 0,
            y: 0
        };

        this._create();
    }

// inherit EvEmitter
    var proto = Item.prototype = Object.create( EvEmitter.prototype );
    proto.constructor = Item;

    proto._create = function() {
        // transition objects
        this._transn = {
            ingProperties: {},
            clean: {},
            onEnd: {}
        };

        this.css({
            position: 'absolute'
        });
    };

// trigger specified handler for event type
    proto.handleEvent = function( event ) {
        var method = 'on' + event.type;
        if ( this[ method ] ) {
            this[ method ]( event );
        }
    };

    proto.getSize = function() {
        this.size = getSize( this.element );
    };

    /**
     * apply CSS styles to element
     * @param {Object} style
     */
    proto.css = function( style ) {
        var elemStyle = this.element.style;

        for ( var prop in style ) {
            // use vendor property if available
            var supportedProp = vendorProperties[ prop ] || prop;
            elemStyle[ supportedProp ] = style[ prop ];
        }
    };

    // measure position, and sets it
    proto.getPosition = function() {
        var style = getComputedStyle( this.element );
        var isOriginLeft = this.layout._getOption('originLeft');
        var isOriginTop = this.layout._getOption('originTop');
        var xValue = style[ isOriginLeft ? 'left' : 'right' ];
        var yValue = style[ isOriginTop ? 'top' : 'bottom' ];
        var x = parseFloat( xValue );
        var y = parseFloat( yValue );
        // convert percent to pixels
        var layoutSize = this.layout.size;
        if ( xValue.indexOf('%') != -1 ) {
            x = ( x / 100 ) * layoutSize.width;
        }
        if ( yValue.indexOf('%') != -1 ) {
            y = ( y / 100 ) * layoutSize.height;
        }
        // clean up 'auto' or other non-integer values
        x = isNaN( x ) ? 0 : x;
        y = isNaN( y ) ? 0 : y;
        // remove padding from measurement
        x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
        y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;

        this.position.x = x;
        this.position.y = y;
    };

// set settled position, apply padding
    proto.layoutPosition = function() {
        var layoutSize = this.layout.size;
        var style = {};
        var isOriginLeft = this.layout._getOption('originLeft');
        var isOriginTop = this.layout._getOption('originTop');

        // x
        var xPadding = isOriginLeft ? 'paddingLeft' : 'paddingRight';
        var xProperty = isOriginLeft ? 'left' : 'right';
        var xResetProperty = isOriginLeft ? 'right' : 'left';

        var x = this.position.x + layoutSize[ xPadding ];
        // set in percentage or pixels
        style[ xProperty ] = this.getXValue( x );
        // reset other property
        style[ xResetProperty ] = '';

        // y
        var yPadding = isOriginTop ? 'paddingTop' : 'paddingBottom';
        var yProperty = isOriginTop ? 'top' : 'bottom';
        var yResetProperty = isOriginTop ? 'bottom' : 'top';

        var y = this.position.y + layoutSize[ yPadding ];
        // set in percentage or pixels
        style[ yProperty ] = this.getYValue( y );
        // reset other property
        style[ yResetProperty ] = '';

        this.css( style );
        this.emitEvent( 'layout', [ this ] );
    };

    proto.getXValue = function( x ) {
        var isHorizontal = this.layout._getOption('horizontal');
        return this.layout.options.percentPosition && !isHorizontal ?
            ( ( x / this.layout.size.width ) * 100 ) + '%' : x + 'px';
    };

    proto.getYValue = function( y ) {
        var isHorizontal = this.layout._getOption('horizontal');
        return this.layout.options.percentPosition && isHorizontal ?
            ( ( y / this.layout.size.height ) * 100 ) + '%' : y + 'px';
    };

    proto._transitionTo = function( x, y ) {
        this.getPosition();
        // get current x & y from top/left
        var curX = this.position.x;
        var curY = this.position.y;

        var didNotMove = x == this.position.x && y == this.position.y;

        // save end position
        this.setPosition( x, y );

        // if did not move and not transitioning, just go to layout
        if ( didNotMove && !this.isTransitioning ) {
            this.layoutPosition();
            return;
        }

        var transX = x - curX;
        var transY = y - curY;
        var transitionStyle = {};
        transitionStyle.transform = this.getTranslate( transX, transY );

        this.transition({
            to: transitionStyle,
            onTransitionEnd: {
                transform: this.layoutPosition
            },
            isCleaning: true
        });
    };

    proto.getTranslate = function( x, y ) {
        // flip cooridinates if origin on right or bottom
        var isOriginLeft = this.layout._getOption('originLeft');
        var isOriginTop = this.layout._getOption('originTop');
        x = isOriginLeft ? x : -x;
        y = isOriginTop ? y : -y;
        return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    };

// non transition + transform support
    proto.goTo = function( x, y ) {
        this.setPosition( x, y );
        this.layoutPosition();
    };

    proto.moveTo = proto._transitionTo;

    proto.setPosition = function( x, y ) {
        this.position.x = parseFloat( x );
        this.position.y = parseFloat( y );
    };

// ----- transition ----- //

    /**
     * @param {Object} style - CSS
     * @param {Function} onTransitionEnd
     */

// non transition, just trigger callback
    proto._nonTransition = function( args ) {
        this.css( args.to );
        if ( args.isCleaning ) {
            this._removeStyles( args.to );
        }
        for ( var prop in args.onTransitionEnd ) {
            args.onTransitionEnd[ prop ].call( this );
        }
    };

    /**
     * proper transition
     * @param {Object} args - arguments
     *   @param {Object} to - style to transition to
     *   @param {Object} from - style to start transition from
     *   @param {Boolean} isCleaning - removes transition styles after transition
     *   @param {Function} onTransitionEnd - callback
     */
    proto.transition = function( args ) {
        // redirect to nonTransition if no transition duration
        if ( !parseFloat( this.layout.options.transitionDuration ) ) {
            this._nonTransition( args );
            return;
        }

        var _transition = this._transn;
        // keep track of onTransitionEnd callback by css property
        for ( var prop in args.onTransitionEnd ) {
            _transition.onEnd[ prop ] = args.onTransitionEnd[ prop ];
        }
        // keep track of properties that are transitioning
        for ( prop in args.to ) {
            _transition.ingProperties[ prop ] = true;
            // keep track of properties to clean up when transition is done
            if ( args.isCleaning ) {
                _transition.clean[ prop ] = true;
            }
        }

        // set from styles
        if ( args.from ) {
            this.css( args.from );
            // force redraw. http://blog.alexmaccaw.com/css-transitions
            var h = this.element.offsetHeight;
            // hack for JSHint to hush about unused var
            h = null;
        }
        // enable transition
        this.enableTransition( args.to );
        // set styles that are transitioning
        this.css( args.to );

        this.isTransitioning = true;

    };

// dash before all cap letters, including first for
// WebkitTransform => -webkit-transform
    function toDashedAll( str ) {
        return str.replace( /([A-Z])/g, function( $1 ) {
            return '-' + $1.toLowerCase();
        });
    }

    var transitionProps = 'opacity,' + toDashedAll( transformProperty );

    proto.enableTransition = function(/* style */) {
        // HACK changing transitionProperty during a transition
        // will cause transition to jump
        if ( this.isTransitioning ) {
            return;
        }

        // make `transition: foo, bar, baz` from style object
        // HACK un-comment this when enableTransition can work
        // while a transition is happening
        // var transitionValues = [];
        // for ( var prop in style ) {
        //   // dash-ify camelCased properties like WebkitTransition
        //   prop = vendorProperties[ prop ] || prop;
        //   transitionValues.push( toDashedAll( prop ) );
        // }
        // munge number to millisecond, to match stagger
        var duration = this.layout.options.transitionDuration;
        duration = typeof duration == 'number' ? duration + 'ms' : duration;
        // enable transition styles
        this.css({
            transitionProperty: transitionProps,
            transitionDuration: duration,
            transitionDelay: this.staggerDelay || 0
        });
        // listen for transition end event
        this.element.addEventListener( transitionEndEvent, this, false );
    };

// ----- events ----- //

    proto.onwebkitTransitionEnd = function( event ) {
        this.ontransitionend( event );
    };

    proto.onotransitionend = function( event ) {
        this.ontransitionend( event );
    };

// properties that I munge to make my life easier
    var dashedVendorProperties = {
        '-webkit-transform': 'transform'
    };

    proto.ontransitionend = function( event ) {
        // disregard bubbled events from children
        if ( event.target !== this.element ) {
            return;
        }
        var _transition = this._transn;
        // get property name of transitioned property, convert to prefix-free
        var propertyName = dashedVendorProperties[ event.propertyName ] || event.propertyName;

        // remove property that has completed transitioning
        delete _transition.ingProperties[ propertyName ];
        // check if any properties are still transitioning
        if ( isEmptyObj( _transition.ingProperties ) ) {
            // all properties have completed transitioning
            this.disableTransition();
        }
        // clean style
        if ( propertyName in _transition.clean ) {
            // clean up style
            this.element.style[ event.propertyName ] = '';
            delete _transition.clean[ propertyName ];
        }
        // trigger onTransitionEnd callback
        if ( propertyName in _transition.onEnd ) {
            var onTransitionEnd = _transition.onEnd[ propertyName ];
            onTransitionEnd.call( this );
            delete _transition.onEnd[ propertyName ];
        }

        this.emitEvent( 'transitionEnd', [ this ] );
    };

    proto.disableTransition = function() {
        this.removeTransitionStyles();
        this.element.removeEventListener( transitionEndEvent, this, false );
        this.isTransitioning = false;
    };

    /**
     * removes style property from element
     * @param {Object} style
     **/
    proto._removeStyles = function( style ) {
        // clean up transition styles
        var cleanStyle = {};
        for ( var prop in style ) {
            cleanStyle[ prop ] = '';
        }
        this.css( cleanStyle );
    };

    var cleanTransitionStyle = {
        transitionProperty: '',
        transitionDuration: '',
        transitionDelay: ''
    };

    proto.removeTransitionStyles = function() {
        // remove transition
        this.css( cleanTransitionStyle );
    };

// ----- stagger ----- //

    proto.stagger = function( delay ) {
        delay = isNaN( delay ) ? 0 : delay;
        this.staggerDelay = delay + 'ms';
    };

// ----- show/hide/remove ----- //

// remove element from DOM
    proto.removeElem = function() {
        this.element.parentNode.removeChild( this.element );
        // remove display: none
        this.css({ display: '' });
        this.emitEvent( 'remove', [ this ] );
    };

    proto.remove = function() {
        // just remove element if no transition support or no transition
        if ( !transitionProperty || !parseFloat( this.layout.options.transitionDuration ) ) {
            this.removeElem();
            return;
        }

        // start transition
        this.once( 'transitionEnd', function() {
            this.removeElem();
        });
        this.hide();
    };

    proto.reveal = function() {
        delete this.isHidden;
        // remove display: none
        this.css({ display: '' });

        var options = this.layout.options;

        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
        onTransitionEnd[ transitionEndProperty ] = this.onRevealTransitionEnd;

        this.transition({
            from: options.hiddenStyle,
            to: options.visibleStyle,
            isCleaning: true,
            onTransitionEnd: onTransitionEnd
        });
    };

    proto.onRevealTransitionEnd = function() {
        // check if still visible
        // during transition, item may have been hidden
        if ( !this.isHidden ) {
            this.emitEvent('reveal');
        }
    };

    /**
     * get style property use for hide/reveal transition end
     * @param {String} styleProperty - hiddenStyle/visibleStyle
     * @returns {String}
     */
    proto.getHideRevealTransitionEndProperty = function( styleProperty ) {
        var optionStyle = this.layout.options[ styleProperty ];
        // use opacity
        if ( optionStyle.opacity ) {
            return 'opacity';
        }
        // get first property
        for ( var prop in optionStyle ) {
            return prop;
        }
    };

    proto.hide = function() {
        // set flag
        this.isHidden = true;
        // remove display: none
        this.css({ display: '' });

        var options = this.layout.options;

        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
        onTransitionEnd[ transitionEndProperty ] = this.onHideTransitionEnd;

        this.transition({
            from: options.visibleStyle,
            to: options.hiddenStyle,
            // keep hidden stuff hidden
            isCleaning: true,
            onTransitionEnd: onTransitionEnd
        });
    };

    proto.onHideTransitionEnd = function() {
        // check if still hidden
        // during transition, item may have been un-hidden
        if ( this.isHidden ) {
            this.css({ display: 'none' });
            this.emitEvent('hide');
        }
    };

    proto.destroy = function() {
        this.css({
            position: '',
            left: '',
            right: '',
            top: '',
            bottom: '',
            transition: '',
            transform: ''
        });
    };

    return Item;

}));

/*!
 * Outlayer v2.1.1
 * the brains and guts of a layout library
 * MIT license
 */

( function( window, factory ) {
    'use strict';
    // universal module definition
    /* jshint strict: false */ /* globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
        // AMD - RequireJS
        define( 'outlayer/outlayer',[
                'ev-emitter/ev-emitter',
                'get-size/get-size',
                'fizzy-ui-utils/utils',
                './item'
            ],
            function( EvEmitter, getSize, utils, Item ) {
                return factory( window, EvEmitter, getSize, utils, Item);
            }
        );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS - Browserify, Webpack
        module.exports = factory(
            window,
            require('ev-emitter'),
            require('get-size'),
            require('fizzy-ui-utils'),
            require('./item')
        );
    } else {
        // browser global
        window.Outlayer = factory(
            window,
            window.EvEmitter,
            window.getSize,
            window.fizzyUIUtils,
            window.Outlayer.Item
        );
    }

}( window, function factory( window, EvEmitter, getSize, utils, Item ) {
    'use strict';

// ----- vars ----- //

    var console = window.console;
    var jQuery = window.jQuery;
    var noop = function() {};

// -------------------------- Outlayer -------------------------- //

// globally unique identifiers
    var GUID = 0;
// internal store of all Outlayer intances
    var instances = {};


    /**
     * @param {Element, String} element
     * @param {Object} options
     * @constructor
     */
    function Outlayer( element, options ) {
        var queryElement = utils.getQueryElement( element );
        if ( !queryElement ) {
            if ( console ) {
                console.error( 'Bad element for ' + this.constructor.namespace +
                    ': ' + ( queryElement || element ) );
            }
            return;
        }
        this.element = queryElement;
        // add jQuery
        if ( jQuery ) {
            this.$element = jQuery( this.element );
        }

        // options
        this.options = utils.extend( {}, this.constructor.defaults );
        this.option( options );

        // add id for Outlayer.getFromElement
        var id = ++GUID;
        this.element.outlayerGUID = id; // expando
        instances[ id ] = this; // associate via id

        // kick it off
        this._create();

        var isInitLayout = this._getOption('initLayout');
        if ( isInitLayout ) {
            this.layout();
        }
    }

// settings are for internal use only
    Outlayer.namespace = 'outlayer';
    Outlayer.Item = Item;

// default options
    Outlayer.defaults = {
        containerStyle: {
            position: 'relative'
        },
        initLayout: true,
        originLeft: true,
        originTop: true,
        resize: true,
        resizeContainer: true,
        // item options
        transitionDuration: '0.4s',
        hiddenStyle: {
            opacity: 0,
            transform: 'scale(0.001)'
        },
        visibleStyle: {
            opacity: 1,
            transform: 'scale(1)'
        }
    };

    var proto = Outlayer.prototype;
// inherit EvEmitter
    utils.extend( proto, EvEmitter.prototype );

    /**
     * set options
     * @param {Object} opts
     */
    proto.option = function( opts ) {
        utils.extend( this.options, opts );
    };

    /**
     * get backwards compatible option value, check old name
     */
    proto._getOption = function( option ) {
        var oldOption = this.constructor.compatOptions[ option ];
        return oldOption && this.options[ oldOption ] !== undefined ?
            this.options[ oldOption ] : this.options[ option ];
    };

    Outlayer.compatOptions = {
        // currentName: oldName
        initLayout: 'isInitLayout',
        horizontal: 'isHorizontal',
        layoutInstant: 'isLayoutInstant',
        originLeft: 'isOriginLeft',
        originTop: 'isOriginTop',
        resize: 'isResizeBound',
        resizeContainer: 'isResizingContainer'
    };

    proto._create = function() {
        // get items from children
        this.reloadItems();
        // elements that affect layout, but are not laid out
        this.stamps = [];
        this.stamp( this.options.stamp );
        // set container style
        utils.extend( this.element.style, this.options.containerStyle );

        // bind resize method
        var canBindResize = this._getOption('resize');
        if ( canBindResize ) {
            this.bindResize();
        }
    };

// goes through all children again and gets bricks in proper order
    proto.reloadItems = function() {
        // collection of item elements
        this.items = this._itemize( this.element.children );
    };


    /**
     * turn elements into Outlayer.Items to be used in layout
     * @param {Array or NodeList or HTMLElement} elems
     * @returns {Array} items - collection of new Outlayer Items
     */
    proto._itemize = function( elems ) {

        var itemElems = this._filterFindItemElements( elems );
        var Item = this.constructor.Item;

        // create new Outlayer Items for collection
        var items = [];
        for ( var i=0; i < itemElems.length; i++ ) {
            var elem = itemElems[i];
            var item = new Item( elem, this );
            items.push( item );
        }

        return items;
    };

    /**
     * get item elements to be used in layout
     * @param {Array or NodeList or HTMLElement} elems
     * @returns {Array} items - item elements
     */
    proto._filterFindItemElements = function( elems ) {
        return utils.filterFindElements( elems, this.options.itemSelector );
    };

    /**
     * getter method for getting item elements
     * @returns {Array} elems - collection of item elements
     */
    proto.getItemElements = function() {
        return this.items.map( function( item ) {
            return item.element;
        });
    };

// ----- init & layout ----- //

    /**
     * lays out all items
     */
    proto.layout = function() {
        this._resetLayout();
        this._manageStamps();

        // don't animate first layout
        var layoutInstant = this._getOption('layoutInstant');
        var isInstant = layoutInstant !== undefined ?
            layoutInstant : !this._isLayoutInited;
        this.layoutItems( this.items, isInstant );

        // flag for initalized
        this._isLayoutInited = true;
    };

// _init is alias for layout
    proto._init = proto.layout;

    /**
     * logic before any new layout
     */
    proto._resetLayout = function() {
        this.getSize();
    };


    proto.getSize = function() {
        this.size = getSize( this.element );
    };

    /**
     * get measurement from option, for columnWidth, rowHeight, gutter
     * if option is String -> get element from selector string, & get size of element
     * if option is Element -> get size of element
     * else use option as a number
     *
     * @param {String} measurement
     * @param {String} size - width or height
     * @private
     */
    proto._getMeasurement = function( measurement, size ) {
        var option = this.options[ measurement ];
        var elem;
        if ( !option ) {
            // default to 0
            this[ measurement ] = 0;
        } else {
            // use option as an element
            if ( typeof option == 'string' ) {
                elem = this.element.querySelector( option );
            } else if ( option instanceof HTMLElement ) {
                elem = option;
            }
            // use size of element, if element
            this[ measurement ] = elem ? getSize( elem )[ size ] : option;
        }
    };

    /**
     * layout a collection of item elements
     * @api public
     */
    proto.layoutItems = function( items, isInstant ) {
        items = this._getItemsForLayout( items );

        this._layoutItems( items, isInstant );

        this._postLayout();
    };

    /**
     * get the items to be laid out
     * you may want to skip over some items
     * @param {Array} items
     * @returns {Array} items
     */
    proto._getItemsForLayout = function( items ) {
        return items.filter( function( item ) {
            return !item.isIgnored;
        });
    };

    /**
     * layout items
     * @param {Array} items
     * @param {Boolean} isInstant
     */
    proto._layoutItems = function( items, isInstant ) {
        this._emitCompleteOnItems( 'layout', items );

        if ( !items || !items.length ) {
            // no items, emit event with empty array
            return;
        }

        var queue = [];

        items.forEach( function( item ) {
            // get x/y object from method
            var position = this._getItemLayoutPosition( item );
            // enqueue
            position.item = item;
            position.isInstant = isInstant || item.isLayoutInstant;
            queue.push( position );
        }, this );

        this._processLayoutQueue( queue );
    };

    /**
     * get item layout position
     * @param {Outlayer.Item} item
     * @returns {Object} x and y position
     */
    proto._getItemLayoutPosition = function( /* item */ ) {
        return {
            x: 0,
            y: 0
        };
    };

    /**
     * iterate over array and position each item
     * Reason being - separating this logic prevents 'layout invalidation'
     * thx @paul_irish
     * @param {Array} queue
     */
    proto._processLayoutQueue = function( queue ) {
        this.updateStagger();
        queue.forEach( function( obj, i ) {
            this._positionItem( obj.item, obj.x, obj.y, obj.isInstant, i );
        }, this );
    };

// set stagger from option in milliseconds number
    proto.updateStagger = function() {
        var stagger = this.options.stagger;
        if ( stagger === null || stagger === undefined ) {
            this.stagger = 0;
            return;
        }
        this.stagger = getMilliseconds( stagger );
        return this.stagger;
    };

    /**
     * Sets position of item in DOM
     * @param {Outlayer.Item} item
     * @param {Number} x - horizontal position
     * @param {Number} y - vertical position
     * @param {Boolean} isInstant - disables transitions
     */
    proto._positionItem = function( item, x, y, isInstant, i ) {
        if ( isInstant ) {
            // if not transition, just set CSS
            item.goTo( x, y );
        } else {
            item.stagger( i * this.stagger );
            item.moveTo( x, y );
        }
    };

    /**
     * Any logic you want to do after each layout,
     * i.e. size the container
     */
    proto._postLayout = function() {
        this.resizeContainer();
    };

    proto.resizeContainer = function() {
        var isResizingContainer = this._getOption('resizeContainer');
        if ( !isResizingContainer ) {
            return;
        }
        var size = this._getContainerSize();
        if ( size ) {
            this._setContainerMeasure( size.width, true );
            this._setContainerMeasure( size.height, false );
        }
    };

    /**
     * Sets width or height of container if returned
     * @returns {Object} size
     *   @param {Number} width
     *   @param {Number} height
     */
    proto._getContainerSize = noop;

    /**
     * @param {Number} measure - size of width or height
     * @param {Boolean} isWidth
     */
    proto._setContainerMeasure = function( measure, isWidth ) {
        if ( measure === undefined ) {
            return;
        }

        var elemSize = this.size;
        // add padding and border width if border box
        if ( elemSize.isBorderBox ) {
            measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
                elemSize.borderLeftWidth + elemSize.borderRightWidth :
                elemSize.paddingBottom + elemSize.paddingTop +
                elemSize.borderTopWidth + elemSize.borderBottomWidth;
        }

        measure = Math.max( measure, 0 );
        this.element.style[ isWidth ? 'width' : 'height' ] = measure + 'px';
    };

    /**
     * emit eventComplete on a collection of items events
     * @param {String} eventName
     * @param {Array} items - Outlayer.Items
     */
    proto._emitCompleteOnItems = function( eventName, items ) {
        var _this = this;
        function onComplete() {
            _this.dispatchEvent( eventName + 'Complete', null, [ items ] );
        }

        var count = items.length;
        if ( !items || !count ) {
            onComplete();
            return;
        }

        var doneCount = 0;
        function tick() {
            doneCount++;
            if ( doneCount == count ) {
                onComplete();
            }
        }

        // bind callback
        items.forEach( function( item ) {
            item.once( eventName, tick );
        });
    };

    /**
     * emits events via EvEmitter and jQuery events
     * @param {String} type - name of event
     * @param {Event} event - original event
     * @param {Array} args - extra arguments
     */
    proto.dispatchEvent = function( type, event, args ) {
        // add original event to arguments
        var emitArgs = event ? [ event ].concat( args ) : args;
        this.emitEvent( type, emitArgs );

        if ( jQuery ) {
            // set this.$element
            this.$element = this.$element || jQuery( this.element );
            if ( event ) {
                // create jQuery event
                var $event = jQuery.Event( event );
                $event.type = type;
                this.$element.trigger( $event, args );
            } else {
                // just trigger with type if no event available
                this.$element.trigger( type, args );
            }
        }
    };

// -------------------------- ignore & stamps -------------------------- //


    /**
     * keep item in collection, but do not lay it out
     * ignored items do not get skipped in layout
     * @param {Element} elem
     */
    proto.ignore = function( elem ) {
        var item = this.getItem( elem );
        if ( item ) {
            item.isIgnored = true;
        }
    };

    /**
     * return item to layout collection
     * @param {Element} elem
     */
    proto.unignore = function( elem ) {
        var item = this.getItem( elem );
        if ( item ) {
            delete item.isIgnored;
        }
    };

    /**
     * adds elements to stamps
     * @param {NodeList, Array, Element, or String} elems
     */
    proto.stamp = function( elems ) {
        elems = this._find( elems );
        if ( !elems ) {
            return;
        }

        this.stamps = this.stamps.concat( elems );
        // ignore
        elems.forEach( this.ignore, this );
    };

    /**
     * removes elements to stamps
     * @param {NodeList, Array, or Element} elems
     */
    proto.unstamp = function( elems ) {
        elems = this._find( elems );
        if ( !elems ){
            return;
        }

        elems.forEach( function( elem ) {
            // filter out removed stamp elements
            utils.removeFrom( this.stamps, elem );
            this.unignore( elem );
        }, this );
    };

    /**
     * finds child elements
     * @param {NodeList, Array, Element, or String} elems
     * @returns {Array} elems
     */
    proto._find = function( elems ) {
        if ( !elems ) {
            return;
        }
        // if string, use argument as selector string
        if ( typeof elems == 'string' ) {
            elems = this.element.querySelectorAll( elems );
        }
        elems = utils.makeArray( elems );
        return elems;
    };

    proto._manageStamps = function() {
        if ( !this.stamps || !this.stamps.length ) {
            return;
        }

        this._getBoundingRect();

        this.stamps.forEach( this._manageStamp, this );
    };

// update boundingLeft / Top
    proto._getBoundingRect = function() {
        // get bounding rect for container element
        var boundingRect = this.element.getBoundingClientRect();
        var size = this.size;
        this._boundingRect = {
            left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
            top: boundingRect.top + size.paddingTop + size.borderTopWidth,
            right: boundingRect.right - ( size.paddingRight + size.borderRightWidth ),
            bottom: boundingRect.bottom - ( size.paddingBottom + size.borderBottomWidth )
        };
    };

    /**
     * @param {Element} stamp
     **/
    proto._manageStamp = noop;

    /**
     * get x/y position of element relative to container element
     * @param {Element} elem
     * @returns {Object} offset - has left, top, right, bottom
     */
    proto._getElementOffset = function( elem ) {
        var boundingRect = elem.getBoundingClientRect();
        var thisRect = this._boundingRect;
        var size = getSize( elem );
        var offset = {
            left: boundingRect.left - thisRect.left - size.marginLeft,
            top: boundingRect.top - thisRect.top - size.marginTop,
            right: thisRect.right - boundingRect.right - size.marginRight,
            bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
        };
        return offset;
    };

// -------------------------- resize -------------------------- //

// enable event handlers for listeners
// i.e. resize -> onresize
    proto.handleEvent = utils.handleEvent;

    /**
     * Bind layout to window resizing
     */
    proto.bindResize = function() {
        window.addEventListener( 'resize', this );
        this.isResizeBound = true;
    };

    /**
     * Unbind layout to window resizing
     */
    proto.unbindResize = function() {
        window.removeEventListener( 'resize', this );
        this.isResizeBound = false;
    };

    proto.onresize = function() {
        this.resize();
    };

    utils.debounceMethod( Outlayer, 'onresize', 100 );

    proto.resize = function() {
        // don't trigger if size did not change
        // or if resize was unbound. See #9
        if ( !this.isResizeBound || !this.needsResizeLayout() ) {
            return;
        }

        this.layout();
    };

    /**
     * check if layout is needed post layout
     * @returns Boolean
     */
    proto.needsResizeLayout = function() {
        var size = getSize( this.element );
        // check that this.size and size are there
        // IE8 triggers resize on body size change, so they might not be
        var hasSizes = this.size && size;
        return hasSizes && size.innerWidth !== this.size.innerWidth;
    };

// -------------------------- methods -------------------------- //

    /**
     * add items to Outlayer instance
     * @param {Array or NodeList or Element} elems
     * @returns {Array} items - Outlayer.Items
     **/
    proto.addItems = function( elems ) {
        var items = this._itemize( elems );
        // add items to collection
        if ( items.length ) {
            this.items = this.items.concat( items );
        }
        return items;
    };

    /**
     * Layout newly-appended item elements
     * @param {Array or NodeList or Element} elems
     */
    proto.appended = function( elems ) {
        var items = this.addItems( elems );
        if ( !items.length ) {
            return;
        }
        // layout and reveal just the new items
        this.layoutItems( items, true );
        this.reveal( items );
    };

    /**
     * Layout prepended elements
     * @param {Array or NodeList or Element} elems
     */
    proto.prepended = function( elems ) {
        var items = this._itemize( elems );
        if ( !items.length ) {
            return;
        }
        // add items to beginning of collection
        var previousItems = this.items.slice(0);
        this.items = items.concat( previousItems );
        // start new layout
        this._resetLayout();
        this._manageStamps();
        // layout new stuff without transition
        this.layoutItems( items, true );
        this.reveal( items );
        // layout previous items
        this.layoutItems( previousItems );
    };

    /**
     * reveal a collection of items
     * @param {Array of Outlayer.Items} items
     */
    proto.reveal = function( items ) {
        this._emitCompleteOnItems( 'reveal', items );
        if ( !items || !items.length ) {
            return;
        }
        var stagger = this.updateStagger();
        items.forEach( function( item, i ) {
            item.stagger( i * stagger );
            item.reveal();
        });
    };

    /**
     * hide a collection of items
     * @param {Array of Outlayer.Items} items
     */
    proto.hide = function( items ) {
        this._emitCompleteOnItems( 'hide', items );
        if ( !items || !items.length ) {
            return;
        }
        var stagger = this.updateStagger();
        items.forEach( function( item, i ) {
            item.stagger( i * stagger );
            item.hide();
        });
    };

    /**
     * reveal item elements
     * @param {Array}, {Element}, {NodeList} items
     */
    proto.revealItemElements = function( elems ) {
        var items = this.getItems( elems );
        this.reveal( items );
    };

    /**
     * hide item elements
     * @param {Array}, {Element}, {NodeList} items
     */
    proto.hideItemElements = function( elems ) {
        var items = this.getItems( elems );
        this.hide( items );
    };

    /**
     * get Outlayer.Item, given an Element
     * @param {Element} elem
     * @param {Function} callback
     * @returns {Outlayer.Item} item
     */
    proto.getItem = function( elem ) {
        // loop through items to get the one that matches
        for ( var i=0; i < this.items.length; i++ ) {
            var item = this.items[i];
            if ( item.element == elem ) {
                // return item
                return item;
            }
        }
    };

    /**
     * get collection of Outlayer.Items, given Elements
     * @param {Array} elems
     * @returns {Array} items - Outlayer.Items
     */
    proto.getItems = function( elems ) {
        elems = utils.makeArray( elems );
        var items = [];
        elems.forEach( function( elem ) {
            var item = this.getItem( elem );
            if ( item ) {
                items.push( item );
            }
        }, this );

        return items;
    };

    /**
     * remove element(s) from instance and DOM
     * @param {Array or NodeList or Element} elems
     */
    proto.remove = function( elems ) {
        var removeItems = this.getItems( elems );

        this._emitCompleteOnItems( 'remove', removeItems );

        // bail if no items to remove
        if ( !removeItems || !removeItems.length ) {
            return;
        }

        removeItems.forEach( function( item ) {
            item.remove();
            // remove item from collection
            utils.removeFrom( this.items, item );
        }, this );
    };

// ----- destroy ----- //

// remove and disable Outlayer instance
    proto.destroy = function() {
        // clean up dynamic styles
        var style = this.element.style;
        style.height = '';
        style.position = '';
        style.width = '';
        // destroy items
        this.items.forEach( function( item ) {
            item.destroy();
        });

        this.unbindResize();

        var id = this.element.outlayerGUID;
        delete instances[ id ]; // remove reference to instance by id
        delete this.element.outlayerGUID;
        // remove data for jQuery
        if ( jQuery ) {
            jQuery.removeData( this.element, this.constructor.namespace );
        }

    };

// -------------------------- data -------------------------- //

    /**
     * get Outlayer instance from element
     * @param {Element} elem
     * @returns {Outlayer}
     */
    Outlayer.data = function( elem ) {
        elem = utils.getQueryElement( elem );
        var id = elem && elem.outlayerGUID;
        return id && instances[ id ];
    };


// -------------------------- create Outlayer class -------------------------- //

    /**
     * create a layout class
     * @param {String} namespace
     */
    Outlayer.create = function( namespace, options ) {
        // sub-class Outlayer
        var Layout = subclass( Outlayer );
        // apply new options and compatOptions
        Layout.defaults = utils.extend( {}, Outlayer.defaults );
        utils.extend( Layout.defaults, options );
        Layout.compatOptions = utils.extend( {}, Outlayer.compatOptions  );

        Layout.namespace = namespace;

        Layout.data = Outlayer.data;

        // sub-class Item
        Layout.Item = subclass( Item );

        // -------------------------- declarative -------------------------- //

        utils.htmlInit( Layout, namespace );

        // -------------------------- jQuery bridge -------------------------- //

        // make into jQuery plugin
        if ( jQuery && jQuery.bridget ) {
            jQuery.bridget( namespace, Layout );
        }

        return Layout;
    };

    function subclass( Parent ) {
        function SubClass() {
            Parent.apply( this, arguments );
        }

        SubClass.prototype = Object.create( Parent.prototype );
        SubClass.prototype.constructor = SubClass;

        return SubClass;
    }

// ----- helpers ----- //

// how many milliseconds are in each unit
    var msUnits = {
        ms: 1,
        s: 1000
    };

// munge time-like parameter into millisecond number
// '0.4s' -> 40
    function getMilliseconds( time ) {
        if ( typeof time == 'number' ) {
            return time;
        }
        var matches = time.match( /(^\d*\.?\d*)(\w*)/ );
        var num = matches && matches[1];
        var unit = matches && matches[2];
        if ( !num.length ) {
            return 0;
        }
        num = parseFloat( num );
        var mult = msUnits[ unit ] || 1;
        return num * mult;
    }

// ----- fin ----- //

// back in global
    Outlayer.Item = Item;

    return Outlayer;

}));

/*!
 * Masonry v4.2.2
 * Cascading grid layout library
 * https://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */

( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( [
                'outlayer/outlayer',
                'get-size/get-size'
            ],
            factory );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            require('outlayer'),
            require('get-size')
        );
    } else {
        // browser global
        window.Masonry = factory(
            window.Outlayer,
            window.getSize
        );
    }

}( window, function factory( Outlayer, getSize ) {



// -------------------------- masonryDefinition -------------------------- //

    // create an Outlayer layout class
    var Masonry = Outlayer.create('masonry');
    // isFitWidth -> fitWidth
    Masonry.compatOptions.fitWidth = 'isFitWidth';

    var proto = Masonry.prototype;

    proto._resetLayout = function() {
        this.getSize();
        this._getMeasurement( 'columnWidth', 'outerWidth' );
        this._getMeasurement( 'gutter', 'outerWidth' );
        this.measureColumns();

        // reset column Y
        this.colYs = [];
        for ( var i=0; i < this.cols; i++ ) {
            this.colYs.push( 0 );
        }

        this.maxY = 0;
        this.horizontalColIndex = 0;
    };

    proto.measureColumns = function() {
        this.getContainerWidth();
        // if columnWidth is 0, default to outerWidth of first item
        if ( !this.columnWidth ) {
            var firstItem = this.items[0];
            var firstItemElem = firstItem && firstItem.element;
            // columnWidth fall back to item of first element
            this.columnWidth = firstItemElem && getSize( firstItemElem ).outerWidth ||
                // if first elem has no width, default to size of container
                this.containerWidth;
        }

        var columnWidth = this.columnWidth += this.gutter;

        // calculate columns
        var containerWidth = this.containerWidth + this.gutter;
        var cols = containerWidth / columnWidth;
        // fix rounding errors, typically with gutters
        var excess = columnWidth - containerWidth % columnWidth;
        // if overshoot is less than a pixel, round up, otherwise floor it
        var mathMethod = excess && excess < 1 ? 'round' : 'floor';
        cols = Math[ mathMethod ]( cols );
        this.cols = Math.max( cols, 1 );
    };

    proto.getContainerWidth = function() {
        // container is parent if fit width
        var isFitWidth = this._getOption('fitWidth');
        var container = isFitWidth ? this.element.parentNode : this.element;
        // check that this.size and size are there
        // IE8 triggers resize on body size change, so they might not be
        var size = getSize( container );
        this.containerWidth = size && size.innerWidth;
    };

    proto._getItemLayoutPosition = function( item ) {
        item.getSize();
        // how many columns does this brick span
        var remainder = item.size.outerWidth % this.columnWidth;
        var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
        // round if off by 1 pixel, otherwise use ceil
        var colSpan = Math[ mathMethod ]( item.size.outerWidth / this.columnWidth );
        colSpan = Math.min( colSpan, this.cols );
        // use horizontal or top column position
        var colPosMethod = this.options.horizontalOrder ?
            '_getHorizontalColPosition' : '_getTopColPosition';
        var colPosition = this[ colPosMethod ]( colSpan, item );
        // position the brick
        var position = {
            x: this.columnWidth * colPosition.col,
            y: colPosition.y
        };
        // apply setHeight to necessary columns
        var setHeight = colPosition.y + item.size.outerHeight;
        var setMax = colSpan + colPosition.col;
        for ( var i = colPosition.col; i < setMax; i++ ) {
            this.colYs[i] = setHeight;
        }

        return position;
    };

    proto._getTopColPosition = function( colSpan ) {
        var colGroup = this._getTopColGroup( colSpan );
        // get the minimum Y value from the columns
        var minimumY = Math.min.apply( Math, colGroup );

        return {
            col: colGroup.indexOf( minimumY ),
            y: minimumY,
        };
    };

    /**
     * @param {Number} colSpan - number of columns the element spans
     * @returns {Array} colGroup
     */
    proto._getTopColGroup = function( colSpan ) {
        if ( colSpan < 2 ) {
            // if brick spans only one column, use all the column Ys
            return this.colYs;
        }

        var colGroup = [];
        // how many different places could this brick fit horizontally
        var groupCount = this.cols + 1 - colSpan;
        // for each group potential horizontal position
        for ( var i = 0; i < groupCount; i++ ) {
            colGroup[i] = this._getColGroupY( i, colSpan );
        }
        return colGroup;
    };

    proto._getColGroupY = function( col, colSpan ) {
        if ( colSpan < 2 ) {
            return this.colYs[ col ];
        }
        // make an array of colY values for that one group
        var groupColYs = this.colYs.slice( col, col + colSpan );
        // and get the max value of the array
        return Math.max.apply( Math, groupColYs );
    };

    // get column position based on horizontal index. #873
    proto._getHorizontalColPosition = function( colSpan, item ) {
        var col = this.horizontalColIndex % this.cols;
        var isOver = colSpan > 1 && col + colSpan > this.cols;
        // shift to next row if item can't fit on current row
        col = isOver ? 0 : col;
        // don't let zero-size items take up space
        var hasSize = item.size.outerWidth && item.size.outerHeight;
        this.horizontalColIndex = hasSize ? col + colSpan : this.horizontalColIndex;

        return {
            col: col,
            y: this._getColGroupY( col, colSpan ),
        };
    };

    proto._manageStamp = function( stamp ) {
        var stampSize = getSize( stamp );
        var offset = this._getElementOffset( stamp );
        // get the columns that this stamp affects
        var isOriginLeft = this._getOption('originLeft');
        var firstX = isOriginLeft ? offset.left : offset.right;
        var lastX = firstX + stampSize.outerWidth;
        var firstCol = Math.floor( firstX / this.columnWidth );
        firstCol = Math.max( 0, firstCol );
        var lastCol = Math.floor( lastX / this.columnWidth );
        // lastCol should not go over if multiple of columnWidth #425
        lastCol -= lastX % this.columnWidth ? 0 : 1;
        lastCol = Math.min( this.cols - 1, lastCol );
        // set colYs to bottom of the stamp

        var isOriginTop = this._getOption('originTop');
        var stampMaxY = ( isOriginTop ? offset.top : offset.bottom ) +
            stampSize.outerHeight;
        for ( var i = firstCol; i <= lastCol; i++ ) {
            this.colYs[i] = Math.max( stampMaxY, this.colYs[i] );
        }
    };

    proto._getContainerSize = function() {
        this.maxY = Math.max.apply( Math, this.colYs );
        var size = {
            height: this.maxY
        };

        if ( this._getOption('fitWidth') ) {
            size.width = this._getContainerFitWidth();
        }

        return size;
    };

    proto._getContainerFitWidth = function() {
        var unusedCols = 0;
        // count unused columns
        var i = this.cols;
        while ( --i ) {
            if ( this.colYs[i] !== 0 ) {
                break;
            }
            unusedCols++;
        }
        // fit container to columns that have been used
        return ( this.cols - unusedCols ) * this.columnWidth - this.gutter;
    };

    proto.needsResizeLayout = function() {
        var previousWidth = this.containerWidth;
        this.getContainerWidth();
        return previousWidth != this.containerWidth;
    };

    return Masonry;

}));


/*!
 * imagesLoaded PACKAGED v5.0.0
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

/**
 * EvEmitter v2.1.1
 * Lil' event emitter
 * MIT License
 */

( function( global, factory ) {
    // universal module definition
    if ( typeof module == 'object' && module.exports ) {
        // CommonJS - Browserify, Webpack
        module.exports = factory();
    } else {
        // Browser globals
        global.EvEmitter = factory();
    }

}( typeof window != 'undefined' ? window : this, function() {

    function EvEmitter() {}

    let proto = EvEmitter.prototype;

    proto.on = function( eventName, listener ) {
        if ( !eventName || !listener ) return this;

        // set events hash
        let events = this._events = this._events || {};
        // set listeners array
        let listeners = events[ eventName ] = events[ eventName ] || [];
        // only add once
        if ( !listeners.includes( listener ) ) {
            listeners.push( listener );
        }

        return this;
    };

    proto.once = function( eventName, listener ) {
        if ( !eventName || !listener ) return this;

        // add event
        this.on( eventName, listener );
        // set once flag
        // set onceEvents hash
        let onceEvents = this._onceEvents = this._onceEvents || {};
        // set onceListeners object
        let onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
        // set flag
        onceListeners[ listener ] = true;

        return this;
    };

    proto.off = function( eventName, listener ) {
        let listeners = this._events && this._events[ eventName ];
        if ( !listeners || !listeners.length ) return this;

        let index = listeners.indexOf( listener );
        if ( index != -1 ) {
            listeners.splice( index, 1 );
        }

        return this;
    };

    proto.emitEvent = function( eventName, args ) {
        let listeners = this._events && this._events[ eventName ];
        if ( !listeners || !listeners.length ) return this;

        // copy over to avoid interference if .off() in listener
        listeners = listeners.slice( 0 );
        args = args || [];
        // once stuff
        let onceListeners = this._onceEvents && this._onceEvents[ eventName ];

        for ( let listener of listeners ) {
            let isOnce = onceListeners && onceListeners[ listener ];
            if ( isOnce ) {
                // remove listener
                // remove before trigger to prevent recursion
                this.off( eventName, listener );
                // unset once flag
                delete onceListeners[ listener ];
            }
            // trigger listener
            listener.apply( this, args );
        }

        return this;
    };

    proto.allOff = function() {
        delete this._events;
        delete this._onceEvents;
        return this;
    };

    return EvEmitter;

} ) );
/*!
 * imagesLoaded v5.0.0
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) {
    // universal module definition
    if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory( window, require('ev-emitter') );
    } else {
        // browser global
        window.imagesLoaded = factory( window, window.EvEmitter );
    }

} )( typeof window !== 'undefined' ? window : this,
    function factory( window, EvEmitter ) {

        let $ = window.jQuery;
        let console = window.console;

// -------------------------- helpers -------------------------- //

// turn element or nodeList into an array
        function makeArray( obj ) {
            // use object if already an array
            if ( Array.isArray( obj ) ) return obj;

            let isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
            // convert nodeList to array
            if ( isArrayLike ) return [ ...obj ];

            // array of single index
            return [ obj ];
        }

// -------------------------- imagesLoaded -------------------------- //

        /**
         * @param {[Array, Element, NodeList, String]} elem
         * @param {[Object, Function]} options - if function, use as callback
         * @param {Function} onAlways - callback function
         * @returns {ImagesLoaded}
         */
        function ImagesLoaded( elem, options, onAlways ) {
            // coerce ImagesLoaded() without new, to be new ImagesLoaded()
            if ( !( this instanceof ImagesLoaded ) ) {
                return new ImagesLoaded( elem, options, onAlways );
            }
            // use elem as selector string
            let queryElem = elem;
            if ( typeof elem == 'string' ) {
                queryElem = document.querySelectorAll( elem );
            }
            // bail if bad element
            if ( !queryElem ) {
                console.error(`Bad element for imagesLoaded ${queryElem || elem}`);
                return;
            }

            this.elements = makeArray( queryElem );
            this.options = {};
            // shift arguments if no options set
            if ( typeof options == 'function' ) {
                onAlways = options;
            } else {
                Object.assign( this.options, options );
            }

            if ( onAlways ) this.on( 'always', onAlways );

            this.getImages();
            // add jQuery Deferred object
            if ( $ ) this.jqDeferred = new $.Deferred();

            // HACK check async to allow time to bind listeners
            setTimeout( this.check.bind( this ) );
        }

        ImagesLoaded.prototype = Object.create( EvEmitter.prototype );

        ImagesLoaded.prototype.getImages = function() {
            this.images = [];

            // filter & find items if we have an item selector
            this.elements.forEach( this.addElementImages, this );
        };

        const elementNodeTypes = [ 1, 9, 11 ];

        /**
         * @param {Node} elem
         */
        ImagesLoaded.prototype.addElementImages = function( elem ) {
            // filter siblings
            if ( elem.nodeName === 'IMG' ) {
                this.addImage( elem );
            }
            // get background image on element
            if ( this.options.background === true ) {
                this.addElementBackgroundImages( elem );
            }

            // find children
            // no non-element nodes, #143
            let { nodeType } = elem;
            if ( !nodeType || !elementNodeTypes.includes( nodeType ) ) return;

            let childImgs = elem.querySelectorAll('img');
            // concat childElems to filterFound array
            for ( let img of childImgs ) {
                this.addImage( img );
            }

            // get child background images
            if ( typeof this.options.background == 'string' ) {
                let children = elem.querySelectorAll( this.options.background );
                for ( let child of children ) {
                    this.addElementBackgroundImages( child );
                }
            }
        };

        const reURL = /url\((['"])?(.*?)\1\)/gi;

        ImagesLoaded.prototype.addElementBackgroundImages = function( elem ) {
            let style = getComputedStyle( elem );
            // Firefox returns null if in a hidden iframe https://bugzil.la/548397
            if ( !style ) return;

            // get url inside url("...")
            let matches = reURL.exec( style.backgroundImage );
            while ( matches !== null ) {
                let url = matches && matches[2];
                if ( url ) {
                    this.addBackground( url, elem );
                }
                matches = reURL.exec( style.backgroundImage );
            }
        };

        /**
         * @param {Image} img
         */
        ImagesLoaded.prototype.addImage = function( img ) {
            let loadingImage = new LoadingImage( img );
            this.images.push( loadingImage );
        };

        ImagesLoaded.prototype.addBackground = function( url, elem ) {
            let background = new Background( url, elem );
            this.images.push( background );
        };

        ImagesLoaded.prototype.check = function() {
            this.progressedCount = 0;
            this.hasAnyBroken = false;
            // complete if no images
            if ( !this.images.length ) {
                this.complete();
                return;
            }

            /* eslint-disable-next-line func-style */
            let onProgress = ( image, elem, message ) => {
                // HACK - Chrome triggers event before object properties have changed. #83
                setTimeout( () => {
                    this.progress( image, elem, message );
                } );
            };

            this.images.forEach( function( loadingImage ) {
                loadingImage.once( 'progress', onProgress );
                loadingImage.check();
            } );
        };

        ImagesLoaded.prototype.progress = function( image, elem, message ) {
            this.progressedCount++;
            this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
            // progress event
            this.emitEvent( 'progress', [ this, image, elem ] );
            if ( this.jqDeferred && this.jqDeferred.notify ) {
                this.jqDeferred.notify( this, image );
            }
            // check if completed
            if ( this.progressedCount === this.images.length ) {
                this.complete();
            }

            if ( this.options.debug && console ) {
                console.log( `progress: ${message}`, image, elem );
            }
        };

        ImagesLoaded.prototype.complete = function() {
            let eventName = this.hasAnyBroken ? 'fail' : 'done';
            this.isComplete = true;
            this.emitEvent( eventName, [ this ] );
            this.emitEvent( 'always', [ this ] );
            if ( this.jqDeferred ) {
                let jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
                this.jqDeferred[ jqMethod ]( this );
            }
        };

// --------------------------  -------------------------- //

        function LoadingImage( img ) {
            this.img = img;
        }

        LoadingImage.prototype = Object.create( EvEmitter.prototype );

        LoadingImage.prototype.check = function() {
            // If complete is true and browser supports natural sizes,
            // try to check for image status manually.
            let isComplete = this.getIsImageComplete();
            if ( isComplete ) {
                // report based on naturalWidth
                this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
                return;
            }

            // If none of the checks above matched, simulate loading on detached element.
            this.proxyImage = new Image();
            // add crossOrigin attribute. #204
            if ( this.img.crossOrigin ) {
                this.proxyImage.crossOrigin = this.img.crossOrigin;
            }
            this.proxyImage.addEventListener( 'load', this );
            this.proxyImage.addEventListener( 'error', this );
            // bind to image as well for Firefox. #191
            this.img.addEventListener( 'load', this );
            this.img.addEventListener( 'error', this );
            this.proxyImage.src = this.img.currentSrc || this.img.src;
        };

        LoadingImage.prototype.getIsImageComplete = function() {
            // check for non-zero, non-undefined naturalWidth
            // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
            return this.img.complete && this.img.naturalWidth;
        };

        LoadingImage.prototype.confirm = function( isLoaded, message ) {
            this.isLoaded = isLoaded;
            let { parentNode } = this.img;
            // emit progress with parent <picture> or self <img>
            let elem = parentNode.nodeName === 'PICTURE' ? parentNode : this.img;
            this.emitEvent( 'progress', [ this, elem, message ] );
        };

// ----- events ----- //

// trigger specified handler for event type
        LoadingImage.prototype.handleEvent = function( event ) {
            let method = 'on' + event.type;
            if ( this[ method ] ) {
                this[ method ]( event );
            }
        };

        LoadingImage.prototype.onload = function() {
            this.confirm( true, 'onload' );
            this.unbindEvents();
        };

        LoadingImage.prototype.onerror = function() {
            this.confirm( false, 'onerror' );
            this.unbindEvents();
        };

        LoadingImage.prototype.unbindEvents = function() {
            this.proxyImage.removeEventListener( 'load', this );
            this.proxyImage.removeEventListener( 'error', this );
            this.img.removeEventListener( 'load', this );
            this.img.removeEventListener( 'error', this );
        };

// -------------------------- Background -------------------------- //

        function Background( url, element ) {
            this.url = url;
            this.element = element;
            this.img = new Image();
        }

// inherit LoadingImage prototype
        Background.prototype = Object.create( LoadingImage.prototype );

        Background.prototype.check = function() {
            this.img.addEventListener( 'load', this );
            this.img.addEventListener( 'error', this );
            this.img.src = this.url;
            // check if image is already complete
            let isComplete = this.getIsImageComplete();
            if ( isComplete ) {
                this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
                this.unbindEvents();
            }
        };

        Background.prototype.unbindEvents = function() {
            this.img.removeEventListener( 'load', this );
            this.img.removeEventListener( 'error', this );
        };

        Background.prototype.confirm = function( isLoaded, message ) {
            this.isLoaded = isLoaded;
            this.emitEvent( 'progress', [ this, this.element, message ] );
        };

// -------------------------- jQuery -------------------------- //

        ImagesLoaded.makeJQueryPlugin = function( jQuery ) {
            jQuery = jQuery || window.jQuery;
            if ( !jQuery ) return;

            // set local variable
            $ = jQuery;
            // $().imagesLoaded()
            $.fn.imagesLoaded = function( options, onAlways ) {
                let instance = new ImagesLoaded( this, options, onAlways );
                return instance.jqDeferred.promise( $( this ) );
            };
        };
// try making plugin
        ImagesLoaded.makeJQueryPlugin();

// --------------------------  -------------------------- //

        return ImagesLoaded;

    } );
