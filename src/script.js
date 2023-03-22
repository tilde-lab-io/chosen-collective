
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
﻿// File#: _1_anim-menu-btn
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
﻿// File#: _1_masonry
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



// File#: _1_reveal-effects
// Usage: codyhouse.co/license
(function() {
    var fxElements = document.getElementsByClassName('reveal-fx');
    var intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
    if(fxElements.length > 0) {
        // deactivate effect if Reduced Motion is enabled
        if (Util.osHasReducedMotion() || !intersectionObserverSupported) {
            fxRemoveClasses();
            return;
        }
        //on small devices, do not animate elements -> reveal all
        if( fxDisabled(fxElements[0]) ) {
            fxRevealAll();
            return;
        }

        var fxRevealDelta = 120; // amount (in pixel) the element needs to enter the viewport to be revealed - if not custom value (data-reveal-fx-delta)

        var viewportHeight = window.innerHeight,
            fxChecking = false,
            fxRevealedItems = [],
            fxElementDelays = fxGetDelays(), //elements animation delay
            fxElementDeltas = fxGetDeltas(); // amount (in px) the element needs enter the viewport to be revealed (default value is fxRevealDelta) 


        // add event listeners
        window.addEventListener('load', fxReveal);
        window.addEventListener('resize', fxResize);
        window.addEventListener('restartAll', fxRestart);

        // observe reveal elements
        var observer = [];
        initObserver();

        function initObserver() {
            for(var i = 0; i < fxElements.length; i++) {
                observer[i] = new IntersectionObserver(
                    function(entries, observer) {
                        if(entries[0].isIntersecting) {
                            fxRevealItemObserver(entries[0].target);
                            observer.unobserve(entries[0].target);
                        }
                    },
                    {rootMargin: "0px 0px -"+fxElementDeltas[i]+"px 0px"}
                );

                observer[i].observe(fxElements[i]);
            }
        };

        function fxRevealAll() { // reveal all elements - small devices
            for(var i = 0; i < fxElements.length; i++) {
                Util.addClass(fxElements[i], 'reveal-fx--is-visible');
            }
        };

        function fxResize() { // on resize - check new window height and reveal visible elements
            if(fxChecking) return;
            fxChecking = true;
            (!window.requestAnimationFrame) ? setTimeout(function(){fxReset();}, 250) : window.requestAnimationFrame(fxReset);
        };

        function fxReset() {
            viewportHeight = window.innerHeight;
            fxReveal();
        };

        function fxReveal() { // reveal visible elements
            for(var i = 0; i < fxElements.length; i++) {(function(i){
                if(fxRevealedItems.indexOf(i) != -1 ) return; //element has already been revelead
                if(fxElementIsVisible(fxElements[i], i)) {
                    fxRevealItem(i);
                    fxRevealedItems.push(i);
                }})(i);
            }
            fxResetEvents();
            fxChecking = false;
        };

        function fxRevealItem(index) {
            if(fxElementDelays[index] && fxElementDelays[index] != 0) {
                // wait before revealing element if a delay was added
                setTimeout(function(){
                    Util.addClass(fxElements[index], 'reveal-fx--is-visible');
                }, fxElementDelays[index]);
            } else {
                Util.addClass(fxElements[index], 'reveal-fx--is-visible');
            }
        };

        function fxRevealItemObserver(item) {
            var index = Util.getIndexInArray(fxElements, item);
            if(fxRevealedItems.indexOf(index) != -1 ) return; //element has already been revelead
            fxRevealItem(index);
            fxRevealedItems.push(index);
            fxResetEvents();
            fxChecking = false;
        };

        function fxGetDelays() { // get anmation delays
            var delays = [];
            for(var i = 0; i < fxElements.length; i++) {
                delays.push( fxElements[i].getAttribute('data-reveal-fx-delay') ? parseInt(fxElements[i].getAttribute('data-reveal-fx-delay')) : 0);
            }
            return delays;
        };

        function fxGetDeltas() { // get reveal delta
            var deltas = [];
            for(var i = 0; i < fxElements.length; i++) {
                deltas.push( fxElements[i].getAttribute('data-reveal-fx-delta') ? parseInt(fxElements[i].getAttribute('data-reveal-fx-delta')) : fxRevealDelta);
            }
            return deltas;
        };

        function fxDisabled(element) { // check if elements need to be animated - no animation on small devices
            return !(window.getComputedStyle(element, '::before').getPropertyValue('content').replace(/'|"/g, "") == 'reveal-fx');
        };

        function fxElementIsVisible(element, i) { // element is inside viewport
            return (fxGetElementPosition(element) <= viewportHeight - fxElementDeltas[i]);
        };

        function fxGetElementPosition(element) { // get top position of element
            return element.getBoundingClientRect().top;
        };

        function fxResetEvents() {
            if(fxElements.length > fxRevealedItems.length) return;
            // remove event listeners if all elements have been revealed
            window.removeEventListener('load', fxReveal);
            window.removeEventListener('resize', fxResize);
        };

        function fxRemoveClasses() {
            // Reduced Motion on or Intersection Observer not supported
            while(fxElements[0]) {
                // remove all classes starting with 'reveal-fx--'
                var classes = fxElements[0].getAttribute('class').split(" ").filter(function(c) {
                    return c.lastIndexOf('reveal-fx--', 0) !== 0;
                });
                fxElements[0].setAttribute('class', classes.join(" ").trim());
                Util.removeClass(fxElements[0], 'reveal-fx');
            }
        };

        function fxRestart() {
            // restart the reveal effect -> hide all elements and re-init the observer
            if (Util.osHasReducedMotion() || !intersectionObserverSupported || fxDisabled(fxElements[0])) {
                return;
            }
            // check if we need to add the event listensers back
            if(fxElements.length <= fxRevealedItems.length) {
                window.addEventListener('load', fxReveal);
                window.addEventListener('resize', fxResize);
            }
            // remove observer and reset the observer array
            for(var i = 0; i < observer.length; i++) {
                if(observer[i]) observer[i].disconnect();
            }
            observer = [];
            // remove visible class
            for(var i = 0; i < fxElements.length; i++) {
                Util.removeClass(fxElements[i], 'reveal-fx--is-visible');
            }
            // reset fxRevealedItems array
            fxRevealedItems = [];
            // restart observer
            initObserver();
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



if(!Util) function Util () {};

Util.hasClass = function(el, className) {
    return el.classList.contains(className);
};

Util.addClass = function(el, className) {
    var classList = className.split(' ');
    el.classList.add(classList[0]);
    if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
    var classList = className.split(' ');
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

Util.osHasReducedMotion = function() {
    if(!window.matchMedia) return false;
    var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
    if(matchMediaObj) return matchMediaObj.matches;
    return false;
};

// File#: _2_image-zoom
// Usage: codyhouse.co/license

(function() {
    var ImageZoom = function(element, index) {
        this.element = element;
        this.lightBoxId = 'img-zoom-lightbox--'+index;
        this.imgPreview = this.element.getElementsByClassName('js-image-zoom__preview')[0];

        initImageZoomHtml(this); // init markup

        this.lightbox = document.getElementById(this.lightBoxId);
        this.imgEnlg = this.lightbox.getElementsByClassName('js-image-zoom__fw')[0];
        this.input = this.element.getElementsByClassName('js-image-zoom__input')[0];
        this.animate = this.element.getAttribute('data-morph') != 'off';

        initImageZoomEvents(this); //init events
    };

    function initImageZoomHtml(imageZoom) {
        // get zoomed image url
        var url = imageZoom.element.getAttribute('data-img');
        if(!url) url = imageZoom.imgPreview.getAttribute('src');

        var lightBox = document.createElement('div');
        Util.setAttributes(lightBox, {class: 'image-zoom__lightbox js-image-zoom__lightbox', id: imageZoom.lightBoxId, 'aria-hidden': 'true'});
        lightBox.innerHTML = '<img src="'+url+'" class="js-image-zoom__fw"></img>';
        document.body.appendChild(lightBox);

        var keyboardInput = '<input aria-hidden="true" type="checkbox" class="image-zoom__input js-image-zoom__input"></input>';
        imageZoom.element.insertAdjacentHTML('afterbegin', keyboardInput);

    };

    function initImageZoomEvents(imageZoom) {
        // toggle lightbox on click
        imageZoom.imgPreview.addEventListener('click', function(event){
            toggleFullWidth(imageZoom, true);
            imageZoom.input.checked = true;
        });
        imageZoom.lightbox.addEventListener('click', function(event){
            toggleFullWidth(imageZoom, false);
            imageZoom.input.checked = false;
        });
        // detect swipe down to close lightbox
        new SwipeContent(imageZoom.lightbox);
        imageZoom.lightbox.addEventListener('swipeDown', function(event){
            toggleFullWidth(imageZoom, false);
            imageZoom.input.checked = false;
        });
        // keyboard accessibility
        imageZoom.input.addEventListener('change', function(event){
            toggleFullWidth(imageZoom, imageZoom.input.checked);
        });
        imageZoom.input.addEventListener('keydown', function(event){
            if( (event.keyCode && event.keyCode == 13) || (event.key && event.key.toLowerCase() == 'enter') ) {
                imageZoom.input.checked = !imageZoom.input.checked;
                toggleFullWidth(imageZoom, imageZoom.input.checked);
            }
        });
    };

    function toggleFullWidth(imageZoom, bool) {
        if(animationSupported && imageZoom.animate) { // start expanding animation
            window.requestAnimationFrame(function(){
                animateZoomImage(imageZoom, bool);
            });
        } else { // show lightbox without animation
            Util.toggleClass(imageZoom.lightbox, 'image-zoom__lightbox--is-visible', bool);
        }
    };

    function animateZoomImage(imageZoom, bool) {
        // get img preview position and dimension for the morphing effect
        var rect = imageZoom.imgPreview.getBoundingClientRect(),
            finalWidth = imageZoom.lightbox.getBoundingClientRect().width;
        var init = (bool) ? [rect.top, rect.left, rect.width] : [0, 0, finalWidth],
            final = (bool) ? [-rect.top, -rect.left, parseFloat(finalWidth/rect.width)] : [rect.top + imageZoom.lightbox.scrollTop, rect.left, parseFloat(rect.width/finalWidth)];

        if(bool) {
            imageZoom.imgEnlg.setAttribute('style', 'top: '+init[0]+'px; left:'+init[1]+'px; width:'+init[2]+'px;');
        }

        // show modal
        Util.removeClass(imageZoom.lightbox, 'image-zoom__lightbox--no-transition');
        Util.addClass(imageZoom.lightbox, 'image-zoom__lightbox--is-visible');

        imageZoom.imgEnlg.addEventListener('transitionend', function cb(event){ // reset elements once animation is over
            if(!bool) Util.removeClass(imageZoom.lightbox, 'image-zoom__lightbox--is-visible');
            Util.addClass(imageZoom.lightbox, 'image-zoom__lightbox--no-transition');
            imageZoom.imgEnlg.removeAttribute('style');
            imageZoom.imgEnlg.removeEventListener('transitionend', cb);
        });

        // animate image and bg
        imageZoom.imgEnlg.style.transform = 'translateX('+final[1]+'px) translateY('+final[0]+'px) scale('+final[2]+')';
        Util.toggleClass(imageZoom.lightbox, 'image-zoom__lightbox--animate-bg', bool);
    };

    // init ImageZoom object
    var imageZoom = document.getElementsByClassName('js-image-zoom'),
        animationSupported = window.requestAnimationFrame && !Util.osHasReducedMotion();
    if( imageZoom.length > 0 ) {
        var imageZoomArray = [];
        for( var i = 0; i < imageZoom.length; i++) {
            imageZoomArray.push(new ImageZoom(imageZoom[i], i));
        }

        // close Zoom Image lightbox on Esc
        window.addEventListener('keydown', function(event){
            if((event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'esc')) {
                for( var i = 0; i < imageZoomArray.length; i++) {
                    imageZoomArray[i].input.checked = false;
                    if(Util.hasClass(imageZoomArray[i].lightbox, 'image-zoom__lightbox--is-visible')) toggleFullWidth(imageZoomArray[i], false);
                }
            }
        });
    }
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
﻿// File#: _2_pricing-table
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
﻿