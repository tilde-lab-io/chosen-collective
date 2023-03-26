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


﻿
﻿// File#: _1_modal-window
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
                    Util.toggleClass(element, 'p-table--yearly', (event.target.value === 'yearly'));
                });
            }
        }
    }
}());
/*!
 * Flickity PACKAGED v2.3.0
 * Touch, responsive, flickable carousels
 *
 * Licensed GPLv3 for open source use
 * or Flickity Commercial License for commercial use
 *
 * https://flickity.metafizzy.co
 * Copyright 2015-2021 Metafizzy
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

// Flickity.Cell
( function( window, factory ) {
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'flickity/js/cell',[
            'get-size/get-size',
        ], function( getSize ) {
            return factory( window, getSize );
        } );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('get-size')
        );
    } else {
        // browser global
        window.Flickity = window.Flickity || {};
        window.Flickity.Cell = factory(
            window,
            window.getSize
        );
    }

}( window, function factory( window, getSize ) {



    function Cell( elem, parent ) {
        this.element = elem;
        this.parent = parent;

        this.create();
    }

    var proto = Cell.prototype;

    proto.create = function() {
        this.element.style.position = 'absolute';
        this.element.setAttribute( 'aria-hidden', 'true' );
        this.x = 0;
        this.shift = 0;
        this.element.style[ this.parent.originSide ] = 0;
    };

    proto.destroy = function() {
        // reset style
        this.unselect();
        this.element.style.position = '';
        var side = this.parent.originSide;
        this.element.style[ side ] = '';
        this.element.style.transform = '';
        this.element.removeAttribute('aria-hidden');
    };

    proto.getSize = function() {
        this.size = getSize( this.element );
    };

    proto.setPosition = function( x ) {
        this.x = x;
        this.updateTarget();
        this.renderPosition( x );
    };

// setDefaultTarget v1 method, backwards compatibility, remove in v3
    proto.updateTarget = proto.setDefaultTarget = function() {
        var marginProperty = this.parent.originSide == 'left' ? 'marginLeft' : 'marginRight';
        this.target = this.x + this.size[ marginProperty ] +
            this.size.width * this.parent.cellAlign;
    };

    proto.renderPosition = function( x ) {
        // render position of cell with in slider
        var sideOffset = this.parent.originSide === 'left' ? 1 : -1;

        var adjustedX = this.parent.options.percentPosition ?
            x * sideOffset * ( this.parent.size.innerWidth / this.size.width ) :
            x * sideOffset;

        this.element.style.transform = 'translateX(' +
            this.parent.getPositionValue( adjustedX ) + ')';
    };

    proto.select = function() {
        this.element.classList.add('is-selected');
        this.element.removeAttribute('aria-hidden');
    };

    proto.unselect = function() {
        this.element.classList.remove('is-selected');
        this.element.setAttribute( 'aria-hidden', 'true' );
    };

    /**
     * @param {Integer} shift - 0, 1, or -1
     */
    proto.wrapShift = function( shift ) {
        this.shift = shift;
        this.renderPosition( this.x + this.parent.slideableWidth * shift );
    };

    proto.remove = function() {
        this.element.parentNode.removeChild( this.element );
    };

    return Cell;

} ) );

// slide
( function( window, factory ) {
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'flickity/js/slide',factory );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory();
    } else {
        // browser global
        window.Flickity = window.Flickity || {};
        window.Flickity.Slide = factory();
    }

}( window, function factory() {
    'use strict';

    function Slide( parent ) {
        this.parent = parent;
        this.isOriginLeft = parent.originSide == 'left';
        this.cells = [];
        this.outerWidth = 0;
        this.height = 0;
    }

    var proto = Slide.prototype;

    proto.addCell = function( cell ) {
        this.cells.push( cell );
        this.outerWidth += cell.size.outerWidth;
        this.height = Math.max( cell.size.outerHeight, this.height );
        // first cell stuff
        if ( this.cells.length == 1 ) {
            this.x = cell.x; // x comes from first cell
            var beginMargin = this.isOriginLeft ? 'marginLeft' : 'marginRight';
            this.firstMargin = cell.size[ beginMargin ];
        }
    };

    proto.updateTarget = function() {
        var endMargin = this.isOriginLeft ? 'marginRight' : 'marginLeft';
        var lastCell = this.getLastCell();
        var lastMargin = lastCell ? lastCell.size[ endMargin ] : 0;
        var slideWidth = this.outerWidth - ( this.firstMargin + lastMargin );
        this.target = this.x + this.firstMargin + slideWidth * this.parent.cellAlign;
    };

    proto.getLastCell = function() {
        return this.cells[ this.cells.length - 1 ];
    };

    proto.select = function() {
        this.cells.forEach( function( cell ) {
            cell.select();
        } );
    };

    proto.unselect = function() {
        this.cells.forEach( function( cell ) {
            cell.unselect();
        } );
    };

    proto.getCellElements = function() {
        return this.cells.map( function( cell ) {
            return cell.element;
        } );
    };

    return Slide;

} ) );

// animate
( function( window, factory ) {
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'flickity/js/animate',[
            'fizzy-ui-utils/utils',
        ], function( utils ) {
            return factory( window, utils );
        } );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('fizzy-ui-utils')
        );
    } else {
        // browser global
        window.Flickity = window.Flickity || {};
        window.Flickity.animatePrototype = factory(
            window,
            window.fizzyUIUtils
        );
    }

}( window, function factory( window, utils ) {



// -------------------------- animate -------------------------- //

    var proto = {};

    proto.startAnimation = function() {
        if ( this.isAnimating ) {
            return;
        }

        this.isAnimating = true;
        this.restingFrames = 0;
        this.animate();
    };

    proto.animate = function() {
        this.applyDragForce();
        this.applySelectedAttraction();

        var previousX = this.x;

        this.integratePhysics();
        this.positionSlider();
        this.settle( previousX );
        // animate next frame
        if ( this.isAnimating ) {
            var _this = this;
            requestAnimationFrame( function animateFrame() {
                _this.animate();
            } );
        }
    };

    proto.positionSlider = function() {
        var x = this.x;
        // wrap position around
        if ( this.options.wrapAround && this.cells.length > 1 ) {
            x = utils.modulo( x, this.slideableWidth );
            x -= this.slideableWidth;
            this.shiftWrapCells( x );
        }

        this.setTranslateX( x, this.isAnimating );
        this.dispatchScrollEvent();
    };

    proto.setTranslateX = function( x, is3d ) {
        x += this.cursorPosition;
        // reverse if right-to-left and using transform
        x = this.options.rightToLeft ? -x : x;
        var translateX = this.getPositionValue( x );
        // use 3D transforms for hardware acceleration on iOS
        // but use 2D when settled, for better font-rendering
        this.slider.style.transform = is3d ?
            'translate3d(' + translateX + ',0,0)' : 'translateX(' + translateX + ')';
    };

    proto.dispatchScrollEvent = function() {
        var firstSlide = this.slides[0];
        if ( !firstSlide ) {
            return;
        }
        var positionX = -this.x - firstSlide.target;
        var progress = positionX / this.slidesWidth;
        this.dispatchEvent( 'scroll', null, [ progress, positionX ] );
    };

    proto.positionSliderAtSelected = function() {
        if ( !this.cells.length ) {
            return;
        }
        this.x = -this.selectedSlide.target;
        this.velocity = 0; // stop wobble
        this.positionSlider();
    };

    proto.getPositionValue = function( position ) {
        if ( this.options.percentPosition ) {
            // percent position, round to 2 digits, like 12.34%
            return ( Math.round( ( position / this.size.innerWidth ) * 10000 ) * 0.01 ) + '%';
        } else {
            // pixel positioning
            return Math.round( position ) + 'px';
        }
    };

    proto.settle = function( previousX ) {
        // keep track of frames where x hasn't moved
        var isResting = !this.isPointerDown &&
            Math.round( this.x * 100 ) == Math.round( previousX * 100 );
        if ( isResting ) {
            this.restingFrames++;
        }
        // stop animating if resting for 3 or more frames
        if ( this.restingFrames > 2 ) {
            this.isAnimating = false;
            delete this.isFreeScrolling;
            // render position with translateX when settled
            this.positionSlider();
            this.dispatchEvent( 'settle', null, [ this.selectedIndex ] );
        }
    };

    proto.shiftWrapCells = function( x ) {
        // shift before cells
        var beforeGap = this.cursorPosition + x;
        this._shiftCells( this.beforeShiftCells, beforeGap, -1 );
        // shift after cells
        var afterGap = this.size.innerWidth - ( x + this.slideableWidth + this.cursorPosition );
        this._shiftCells( this.afterShiftCells, afterGap, 1 );
    };

    proto._shiftCells = function( cells, gap, shift ) {
        for ( var i = 0; i < cells.length; i++ ) {
            var cell = cells[i];
            var cellShift = gap > 0 ? shift : 0;
            cell.wrapShift( cellShift );
            gap -= cell.size.outerWidth;
        }
    };

    proto._unshiftCells = function( cells ) {
        if ( !cells || !cells.length ) {
            return;
        }
        for ( var i = 0; i < cells.length; i++ ) {
            cells[i].wrapShift( 0 );
        }
    };

// -------------------------- physics -------------------------- //

    proto.integratePhysics = function() {
        this.x += this.velocity;
        this.velocity *= this.getFrictionFactor();
    };

    proto.applyForce = function( force ) {
        this.velocity += force;
    };

    proto.getFrictionFactor = function() {
        return 1 - this.options[ this.isFreeScrolling ? 'freeScrollFriction' : 'friction' ];
    };

    proto.getRestingPosition = function() {
        // my thanks to Steven Wittens, who simplified this math greatly
        return this.x + this.velocity / ( 1 - this.getFrictionFactor() );
    };

    proto.applyDragForce = function() {
        if ( !this.isDraggable || !this.isPointerDown ) {
            return;
        }
        // change the position to drag position by applying force
        var dragVelocity = this.dragX - this.x;
        var dragForce = dragVelocity - this.velocity;
        this.applyForce( dragForce );
    };

    proto.applySelectedAttraction = function() {
        // do not attract if pointer down or no slides
        var dragDown = this.isDraggable && this.isPointerDown;
        if ( dragDown || this.isFreeScrolling || !this.slides.length ) {
            return;
        }
        var distance = this.selectedSlide.target * -1 - this.x;
        var force = distance * this.options.selectedAttraction;
        this.applyForce( force );
    };

    return proto;

} ) );

// Flickity main
/* eslint-disable max-params */
( function( window, factory ) {
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'flickity/js/flickity',[
            'ev-emitter/ev-emitter',
            'get-size/get-size',
            'fizzy-ui-utils/utils',
            './cell',
            './slide',
            './animate',
        ], function( EvEmitter, getSize, utils, Cell, Slide, animatePrototype ) {
            return factory( window, EvEmitter, getSize, utils, Cell, Slide, animatePrototype );
        } );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('ev-emitter'),
            require('get-size'),
            require('fizzy-ui-utils'),
            require('./cell'),
            require('./slide'),
            require('./animate')
        );
    } else {
        // browser global
        var _Flickity = window.Flickity;

        window.Flickity = factory(
            window,
            window.EvEmitter,
            window.getSize,
            window.fizzyUIUtils,
            _Flickity.Cell,
            _Flickity.Slide,
            _Flickity.animatePrototype
        );
    }

}( window, function factory( window, EvEmitter, getSize,
                             utils, Cell, Slide, animatePrototype ) {

    /* eslint-enable max-params */


// vars
    var jQuery = window.jQuery;
    var getComputedStyle = window.getComputedStyle;
    var console = window.console;

    function moveElements( elems, toElem ) {
        elems = utils.makeArray( elems );
        while ( elems.length ) {
            toElem.appendChild( elems.shift() );
        }
    }

// -------------------------- Flickity -------------------------- //

// globally unique identifiers
    var GUID = 0;
// internal store of all Flickity intances
    var instances = {};

    function Flickity( element, options ) {
        var queryElement = utils.getQueryElement( element );
        if ( !queryElement ) {
            if ( console ) {
                console.error( 'Bad element for Flickity: ' + ( queryElement || element ) );
            }
            return;
        }
        this.element = queryElement;
        // do not initialize twice on same element
        if ( this.element.flickityGUID ) {
            var instance = instances[ this.element.flickityGUID ];
            if ( instance ) instance.option( options );
            return instance;
        }

        // add jQuery
        if ( jQuery ) {
            this.$element = jQuery( this.element );
        }
        // options
        this.options = utils.extend( {}, this.constructor.defaults );
        this.option( options );

        // kick things off
        this._create();
    }

    Flickity.defaults = {
        accessibility: true,
        // adaptiveHeight: false,
        cellAlign: 'center',
        // cellSelector: undefined,
        // contain: false,
        freeScrollFriction: 0.075, // friction when free-scrolling
        friction: 0.28, // friction when selecting
        namespaceJQueryEvents: true,
        // initialIndex: 0,
        percentPosition: true,
        resize: true,
        selectedAttraction: 0.025,
        setGallerySize: true,
        // watchCSS: false,
        // wrapAround: false
    };

// hash of methods triggered on _create()
    Flickity.createMethods = [];

    var proto = Flickity.prototype;
// inherit EventEmitter
    utils.extend( proto, EvEmitter.prototype );

    proto._create = function() {
        // add id for Flickity.data
        var id = this.guid = ++GUID;
        this.element.flickityGUID = id; // expando
        instances[ id ] = this; // associate via id
        // initial properties
        this.selectedIndex = 0;
        // how many frames slider has been in same position
        this.restingFrames = 0;
        // initial physics properties
        this.x = 0;
        this.velocity = 0;
        this.originSide = this.options.rightToLeft ? 'right' : 'left';
        // create viewport & slider
        this.viewport = document.createElement('div');
        this.viewport.className = 'flickity-viewport';
        this._createSlider();

        if ( this.options.resize || this.options.watchCSS ) {
            window.addEventListener( 'resize', this );
        }

        // add listeners from on option
        for ( var eventName in this.options.on ) {
            var listener = this.options.on[ eventName ];
            this.on( eventName, listener );
        }

        Flickity.createMethods.forEach( function( method ) {
            this[ method ]();
        }, this );

        if ( this.options.watchCSS ) {
            this.watchCSS();
        } else {
            this.activate();
        }

    };

    /**
     * set options
     * @param {Object} opts - options to extend
     */
    proto.option = function( opts ) {
        utils.extend( this.options, opts );
    };

    proto.activate = function() {
        if ( this.isActive ) {
            return;
        }
        this.isActive = true;
        this.element.classList.add('flickity-enabled');
        if ( this.options.rightToLeft ) {
            this.element.classList.add('flickity-rtl');
        }

        this.getSize();
        // move initial cell elements so they can be loaded as cells
        var cellElems = this._filterFindCellElements( this.element.children );
        moveElements( cellElems, this.slider );
        this.viewport.appendChild( this.slider );
        this.element.appendChild( this.viewport );
        // get cells from children
        this.reloadCells();

        if ( this.options.accessibility ) {
            // allow element to focusable
            this.element.tabIndex = 0;
            // listen for key presses
            this.element.addEventListener( 'keydown', this );
        }

        this.emitEvent('activate');
        this.selectInitialIndex();
        // flag for initial activation, for using initialIndex
        this.isInitActivated = true;
        // ready event. #493
        this.dispatchEvent('ready');
    };

// slider positions the cells
    proto._createSlider = function() {
        // slider element does all the positioning
        var slider = document.createElement('div');
        slider.className = 'flickity-slider';
        slider.style[ this.originSide ] = 0;
        this.slider = slider;
    };

    proto._filterFindCellElements = function( elems ) {
        return utils.filterFindElements( elems, this.options.cellSelector );
    };

// goes through all children
    proto.reloadCells = function() {
        // collection of item elements
        this.cells = this._makeCells( this.slider.children );
        this.positionCells();
        this._getWrapShiftCells();
        this.setGallerySize();
    };

    /**
     * turn elements into Flickity.Cells
     * @param {[Array, NodeList, HTMLElement]} elems - elements to make into cells
     * @returns {Array} items - collection of new Flickity Cells
     */
    proto._makeCells = function( elems ) {
        var cellElems = this._filterFindCellElements( elems );

        // create new Flickity for collection
        var cells = cellElems.map( function( cellElem ) {
            return new Cell( cellElem, this );
        }, this );

        return cells;
    };

    proto.getLastCell = function() {
        return this.cells[ this.cells.length - 1 ];
    };

    proto.getLastSlide = function() {
        return this.slides[ this.slides.length - 1 ];
    };

// positions all cells
    proto.positionCells = function() {
        // size all cells
        this._sizeCells( this.cells );
        // position all cells
        this._positionCells( 0 );
    };

    /**
     * position certain cells
     * @param {Integer} index - which cell to start with
     */
    proto._positionCells = function( index ) {
        index = index || 0;
        // also measure maxCellHeight
        // start 0 if positioning all cells
        this.maxCellHeight = index ? this.maxCellHeight || 0 : 0;
        var cellX = 0;
        // get cellX
        if ( index > 0 ) {
            var startCell = this.cells[ index - 1 ];
            cellX = startCell.x + startCell.size.outerWidth;
        }
        var len = this.cells.length;
        for ( var i = index; i < len; i++ ) {
            var cell = this.cells[i];
            cell.setPosition( cellX );
            cellX += cell.size.outerWidth;
            this.maxCellHeight = Math.max( cell.size.outerHeight, this.maxCellHeight );
        }
        // keep track of cellX for wrap-around
        this.slideableWidth = cellX;
        // slides
        this.updateSlides();
        // contain slides target
        this._containSlides();
        // update slidesWidth
        this.slidesWidth = len ? this.getLastSlide().target - this.slides[0].target : 0;
    };

    /**
     * cell.getSize() on multiple cells
     * @param {Array} cells - cells to size
     */
    proto._sizeCells = function( cells ) {
        cells.forEach( function( cell ) {
            cell.getSize();
        } );
    };

// --------------------------  -------------------------- //

    proto.updateSlides = function() {
        this.slides = [];
        if ( !this.cells.length ) {
            return;
        }

        var slide = new Slide( this );
        this.slides.push( slide );
        var isOriginLeft = this.originSide == 'left';
        var nextMargin = isOriginLeft ? 'marginRight' : 'marginLeft';

        var canCellFit = this._getCanCellFit();

        this.cells.forEach( function( cell, i ) {
            // just add cell if first cell in slide
            if ( !slide.cells.length ) {
                slide.addCell( cell );
                return;
            }

            var slideWidth = ( slide.outerWidth - slide.firstMargin ) +
                ( cell.size.outerWidth - cell.size[ nextMargin ] );

            if ( canCellFit.call( this, i, slideWidth ) ) {
                slide.addCell( cell );
            } else {
                // doesn't fit, new slide
                slide.updateTarget();

                slide = new Slide( this );
                this.slides.push( slide );
                slide.addCell( cell );
            }
        }, this );
        // last slide
        slide.updateTarget();
        // update .selectedSlide
        this.updateSelectedSlide();
    };

    proto._getCanCellFit = function() {
        var groupCells = this.options.groupCells;
        if ( !groupCells ) {
            return function() {
                return false;
            };
        } else if ( typeof groupCells == 'number' ) {
            // group by number. 3 -> [0,1,2], [3,4,5], ...
            var number = parseInt( groupCells, 10 );
            return function( i ) {
                return ( i % number ) !== 0;
            };
        }
        // default, group by width of slide
        // parse '75%
        var percentMatch = typeof groupCells == 'string' &&
            groupCells.match( /^(\d+)%$/ );
        var percent = percentMatch ? parseInt( percentMatch[1], 10 ) / 100 : 1;
        return function( i, slideWidth ) {
            /* eslint-disable-next-line no-invalid-this */
            return slideWidth <= ( this.size.innerWidth + 1 ) * percent;
        };
    };

// alias _init for jQuery plugin .flickity()
    proto._init =
        proto.reposition = function() {
            this.positionCells();
            this.positionSliderAtSelected();
        };

    proto.getSize = function() {
        this.size = getSize( this.element );
        this.setCellAlign();
        this.cursorPosition = this.size.innerWidth * this.cellAlign;
    };

    var cellAlignShorthands = {
        // cell align, then based on origin side
        center: {
            left: 0.5,
            right: 0.5,
        },
        left: {
            left: 0,
            right: 1,
        },
        right: {
            right: 0,
            left: 1,
        },
    };

    proto.setCellAlign = function() {
        var shorthand = cellAlignShorthands[ this.options.cellAlign ];
        this.cellAlign = shorthand ? shorthand[ this.originSide ] : this.options.cellAlign;
    };

    proto.setGallerySize = function() {
        if ( this.options.setGallerySize ) {
            var height = this.options.adaptiveHeight && this.selectedSlide ?
                this.selectedSlide.height : this.maxCellHeight;
            this.viewport.style.height = height + 'px';
        }
    };

    proto._getWrapShiftCells = function() {
        // only for wrap-around
        if ( !this.options.wrapAround ) {
            return;
        }
        // unshift previous cells
        this._unshiftCells( this.beforeShiftCells );
        this._unshiftCells( this.afterShiftCells );
        // get before cells
        // initial gap
        var gapX = this.cursorPosition;
        var cellIndex = this.cells.length - 1;
        this.beforeShiftCells = this._getGapCells( gapX, cellIndex, -1 );
        // get after cells
        // ending gap between last cell and end of gallery viewport
        gapX = this.size.innerWidth - this.cursorPosition;
        // start cloning at first cell, working forwards
        this.afterShiftCells = this._getGapCells( gapX, 0, 1 );
    };

    proto._getGapCells = function( gapX, cellIndex, increment ) {
        // keep adding cells until the cover the initial gap
        var cells = [];
        while ( gapX > 0 ) {
            var cell = this.cells[ cellIndex ];
            if ( !cell ) {
                break;
            }
            cells.push( cell );
            cellIndex += increment;
            gapX -= cell.size.outerWidth;
        }
        return cells;
    };

// ----- contain ----- //

// contain cell targets so no excess sliding
    proto._containSlides = function() {
        if ( !this.options.contain || this.options.wrapAround || !this.cells.length ) {
            return;
        }
        var isRightToLeft = this.options.rightToLeft;
        var beginMargin = isRightToLeft ? 'marginRight' : 'marginLeft';
        var endMargin = isRightToLeft ? 'marginLeft' : 'marginRight';
        var contentWidth = this.slideableWidth - this.getLastCell().size[ endMargin ];
        // content is less than gallery size
        var isContentSmaller = contentWidth < this.size.innerWidth;
        // bounds
        var beginBound = this.cursorPosition + this.cells[0].size[ beginMargin ];
        var endBound = contentWidth - this.size.innerWidth * ( 1 - this.cellAlign );
        // contain each cell target
        this.slides.forEach( function( slide ) {
            if ( isContentSmaller ) {
                // all cells fit inside gallery
                slide.target = contentWidth * this.cellAlign;
            } else {
                // contain to bounds
                slide.target = Math.max( slide.target, beginBound );
                slide.target = Math.min( slide.target, endBound );
            }
        }, this );
    };

// -----  ----- //

    /**
     * emits events via eventEmitter and jQuery events
     * @param {String} type - name of event
     * @param {Event} event - original event
     * @param {Array} args - extra arguments
     */
    proto.dispatchEvent = function( type, event, args ) {
        var emitArgs = event ? [ event ].concat( args ) : args;
        this.emitEvent( type, emitArgs );

        if ( jQuery && this.$element ) {
            // default trigger with type if no event
            type += this.options.namespaceJQueryEvents ? '.flickity' : '';
            var $event = type;
            if ( event ) {
                // create jQuery event
                var jQEvent = new jQuery.Event( event );
                jQEvent.type = type;
                $event = jQEvent;
            }
            this.$element.trigger( $event, args );
        }
    };

// -------------------------- select -------------------------- //

    /**
     * @param {Integer} index - index of the slide
     * @param {Boolean} isWrap - will wrap-around to last/first if at the end
     * @param {Boolean} isInstant - will immediately set position at selected cell
     */
    proto.select = function( index, isWrap, isInstant ) {
        if ( !this.isActive ) {
            return;
        }
        index = parseInt( index, 10 );
        this._wrapSelect( index );

        if ( this.options.wrapAround || isWrap ) {
            index = utils.modulo( index, this.slides.length );
        }
        // bail if invalid index
        if ( !this.slides[ index ] ) {
            return;
        }
        var prevIndex = this.selectedIndex;
        this.selectedIndex = index;
        this.updateSelectedSlide();
        if ( isInstant ) {
            this.positionSliderAtSelected();
        } else {
            this.startAnimation();
        }
        if ( this.options.adaptiveHeight ) {
            this.setGallerySize();
        }
        // events
        this.dispatchEvent( 'select', null, [ index ] );
        // change event if new index
        if ( index != prevIndex ) {
            this.dispatchEvent( 'change', null, [ index ] );
        }
        // old v1 event name, remove in v3
        this.dispatchEvent('cellSelect');
    };

// wraps position for wrapAround, to move to closest slide. #113
    proto._wrapSelect = function( index ) {
        var len = this.slides.length;
        var isWrapping = this.options.wrapAround && len > 1;
        if ( !isWrapping ) {
            return index;
        }
        var wrapIndex = utils.modulo( index, len );
        // go to shortest
        var delta = Math.abs( wrapIndex - this.selectedIndex );
        var backWrapDelta = Math.abs( ( wrapIndex + len ) - this.selectedIndex );
        var forewardWrapDelta = Math.abs( ( wrapIndex - len ) - this.selectedIndex );
        if ( !this.isDragSelect && backWrapDelta < delta ) {
            index += len;
        } else if ( !this.isDragSelect && forewardWrapDelta < delta ) {
            index -= len;
        }
        // wrap position so slider is within normal area
        if ( index < 0 ) {
            this.x -= this.slideableWidth;
        } else if ( index >= len ) {
            this.x += this.slideableWidth;
        }
    };

    proto.previous = function( isWrap, isInstant ) {
        this.select( this.selectedIndex - 1, isWrap, isInstant );
    };

    proto.next = function( isWrap, isInstant ) {
        this.select( this.selectedIndex + 1, isWrap, isInstant );
    };

    proto.updateSelectedSlide = function() {
        var slide = this.slides[ this.selectedIndex ];
        // selectedIndex could be outside of slides, if triggered before resize()
        if ( !slide ) {
            return;
        }
        // unselect previous selected slide
        this.unselectSelectedSlide();
        // update new selected slide
        this.selectedSlide = slide;
        slide.select();
        this.selectedCells = slide.cells;
        this.selectedElements = slide.getCellElements();
        // HACK: selectedCell & selectedElement is first cell in slide, backwards compatibility
        // Remove in v3?
        this.selectedCell = slide.cells[0];
        this.selectedElement = this.selectedElements[0];
    };

    proto.unselectSelectedSlide = function() {
        if ( this.selectedSlide ) {
            this.selectedSlide.unselect();
        }
    };

    proto.selectInitialIndex = function() {
        var initialIndex = this.options.initialIndex;
        // already activated, select previous selectedIndex
        if ( this.isInitActivated ) {
            this.select( this.selectedIndex, false, true );
            return;
        }
        // select with selector string
        if ( initialIndex && typeof initialIndex == 'string' ) {
            var cell = this.queryCell( initialIndex );
            if ( cell ) {
                this.selectCell( initialIndex, false, true );
                return;
            }
        }

        var index = 0;
        // select with number
        if ( initialIndex && this.slides[ initialIndex ] ) {
            index = initialIndex;
        }
        // select instantly
        this.select( index, false, true );
    };

    /**
     * select slide from number or cell element
     * @param {[Element, Number]} value - zero-based index or element to select
     * @param {Boolean} isWrap - enables wrapping around for extra index
     * @param {Boolean} isInstant - disables slide animation
     */
    proto.selectCell = function( value, isWrap, isInstant ) {
        // get cell
        var cell = this.queryCell( value );
        if ( !cell ) {
            return;
        }

        var index = this.getCellSlideIndex( cell );
        this.select( index, isWrap, isInstant );
    };

    proto.getCellSlideIndex = function( cell ) {
        // get index of slides that has cell
        for ( var i = 0; i < this.slides.length; i++ ) {
            var slide = this.slides[i];
            var index = slide.cells.indexOf( cell );
            if ( index != -1 ) {
                return i;
            }
        }
    };

// -------------------------- get cells -------------------------- //

    /**
     * get Flickity.Cell, given an Element
     * @param {Element} elem - matching cell element
     * @returns {Flickity.Cell} cell - matching cell
     */
    proto.getCell = function( elem ) {
        // loop through cells to get the one that matches
        for ( var i = 0; i < this.cells.length; i++ ) {
            var cell = this.cells[i];
            if ( cell.element == elem ) {
                return cell;
            }
        }
    };

    /**
     * get collection of Flickity.Cells, given Elements
     * @param {[Element, Array, NodeList]} elems - multiple elements
     * @returns {Array} cells - Flickity.Cells
     */
    proto.getCells = function( elems ) {
        elems = utils.makeArray( elems );
        var cells = [];
        elems.forEach( function( elem ) {
            var cell = this.getCell( elem );
            if ( cell ) {
                cells.push( cell );
            }
        }, this );
        return cells;
    };

    /**
     * get cell elements
     * @returns {Array} cellElems
     */
    proto.getCellElements = function() {
        return this.cells.map( function( cell ) {
            return cell.element;
        } );
    };

    /**
     * get parent cell from an element
     * @param {Element} elem - child element
     * @returns {Flickit.Cell} cell - parent cell
     */
    proto.getParentCell = function( elem ) {
        // first check if elem is cell
        var cell = this.getCell( elem );
        if ( cell ) {
            return cell;
        }
        // try to get parent cell elem
        elem = utils.getParent( elem, '.flickity-slider > *' );
        return this.getCell( elem );
    };

    /**
     * get cells adjacent to a slide
     * @param {Integer} adjCount - number of adjacent slides
     * @param {Integer} index - index of slide to start
     * @returns {Array} cells - array of Flickity.Cells
     */
    proto.getAdjacentCellElements = function( adjCount, index ) {
        if ( !adjCount ) {
            return this.selectedSlide.getCellElements();
        }
        index = index === undefined ? this.selectedIndex : index;

        var len = this.slides.length;
        if ( 1 + ( adjCount * 2 ) >= len ) {
            return this.getCellElements();
        }

        var cellElems = [];
        for ( var i = index - adjCount; i <= index + adjCount; i++ ) {
            var slideIndex = this.options.wrapAround ? utils.modulo( i, len ) : i;
            var slide = this.slides[ slideIndex ];
            if ( slide ) {
                cellElems = cellElems.concat( slide.getCellElements() );
            }
        }
        return cellElems;
    };

    /**
     * select slide from number or cell element
     * @param {[Element, String, Number]} selector - element, selector string, or index
     * @returns {Flickity.Cell} - matching cell
     */
    proto.queryCell = function( selector ) {
        if ( typeof selector == 'number' ) {
            // use number as index
            return this.cells[ selector ];
        }
        if ( typeof selector == 'string' ) {
            // do not select invalid selectors from hash: #123, #/. #791
            if ( selector.match( /^[#.]?[\d/]/ ) ) {
                return;
            }
            // use string as selector, get element
            selector = this.element.querySelector( selector );
        }
        // get cell from element
        return this.getCell( selector );
    };

// -------------------------- events -------------------------- //

    proto.uiChange = function() {
        this.emitEvent('uiChange');
    };

// keep focus on element when child UI elements are clicked
    proto.childUIPointerDown = function( event ) {
        // HACK iOS does not allow touch events to bubble up?!
        if ( event.type != 'touchstart' ) {
            event.preventDefault();
        }
        this.focus();
    };

// ----- resize ----- //

    proto.onresize = function() {
        this.watchCSS();
        this.resize();
    };

    utils.debounceMethod( Flickity, 'onresize', 150 );

    proto.resize = function() {
        // #1177 disable resize behavior when animating or dragging for iOS 15
        if ( !this.isActive || this.isAnimating || this.isDragging ) {
            return;
        }
        this.getSize();
        // wrap values
        if ( this.options.wrapAround ) {
            this.x = utils.modulo( this.x, this.slideableWidth );
        }
        this.positionCells();
        this._getWrapShiftCells();
        this.setGallerySize();
        this.emitEvent('resize');
        // update selected index for group slides, instant
        // TODO: position can be lost between groups of various numbers
        var selectedElement = this.selectedElements && this.selectedElements[0];
        this.selectCell( selectedElement, false, true );
    };

// watches the :after property, activates/deactivates
    proto.watchCSS = function() {
        var watchOption = this.options.watchCSS;
        if ( !watchOption ) {
            return;
        }

        var afterContent = getComputedStyle( this.element, ':after' ).content;
        // activate if :after { content: 'flickity' }
        if ( afterContent.indexOf('flickity') != -1 ) {
            this.activate();
        } else {
            this.deactivate();
        }
    };

// ----- keydown ----- //

// go previous/next if left/right keys pressed
    proto.onkeydown = function( event ) {
        // only work if element is in focus
        var isNotFocused = document.activeElement && document.activeElement != this.element;
        if ( !this.options.accessibility || isNotFocused ) {
            return;
        }

        var handler = Flickity.keyboardHandlers[ event.keyCode ];
        if ( handler ) {
            handler.call( this );
        }
    };

    Flickity.keyboardHandlers = {
        // left arrow
        37: function() {
            var leftMethod = this.options.rightToLeft ? 'next' : 'previous';
            this.uiChange();
            this[ leftMethod ]();
        },
        // right arrow
        39: function() {
            var rightMethod = this.options.rightToLeft ? 'previous' : 'next';
            this.uiChange();
            this[ rightMethod ]();
        },
    };

// ----- focus ----- //

    proto.focus = function() {
        // TODO remove scrollTo once focus options gets more support
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus ...
        //    #Browser_compatibility
        var prevScrollY = window.pageYOffset;
        this.element.focus({ preventScroll: true });
        // hack to fix scroll jump after focus, #76
        if ( window.pageYOffset != prevScrollY ) {
            window.scrollTo( window.pageXOffset, prevScrollY );
        }
    };

// -------------------------- destroy -------------------------- //

// deactivate all Flickity functionality, but keep stuff available
    proto.deactivate = function() {
        if ( !this.isActive ) {
            return;
        }
        this.element.classList.remove('flickity-enabled');
        this.element.classList.remove('flickity-rtl');
        this.unselectSelectedSlide();
        // destroy cells
        this.cells.forEach( function( cell ) {
            cell.destroy();
        } );
        this.element.removeChild( this.viewport );
        // move child elements back into element
        moveElements( this.slider.children, this.element );
        if ( this.options.accessibility ) {
            this.element.removeAttribute('tabIndex');
            this.element.removeEventListener( 'keydown', this );
        }
        // set flags
        this.isActive = false;
        this.emitEvent('deactivate');
    };

    proto.destroy = function() {
        this.deactivate();
        window.removeEventListener( 'resize', this );
        this.allOff();
        this.emitEvent('destroy');
        if ( jQuery && this.$element ) {
            jQuery.removeData( this.element, 'flickity' );
        }
        delete this.element.flickityGUID;
        delete instances[ this.guid ];
    };

// -------------------------- prototype -------------------------- //

    utils.extend( proto, animatePrototype );

// -------------------------- extras -------------------------- //

    /**
     * get Flickity instance from element
     * @param {[Element, String]} elem - element or selector string
     * @returns {Flickity} - Flickity instance
     */
    Flickity.data = function( elem ) {
        elem = utils.getQueryElement( elem );
        var id = elem && elem.flickityGUID;
        return id && instances[ id ];
    };

    utils.htmlInit( Flickity, 'flickity' );

    if ( jQuery && jQuery.bridget ) {
        jQuery.bridget( 'flickity', Flickity );
    }

// set internal jQuery, for Webpack + jQuery v3, #478
    Flickity.setJQuery = function( jq ) {
        jQuery = jq;
    };

    Flickity.Cell = Cell;
    Flickity.Slide = Slide;

    return Flickity;

} ) );

/*!
 * Unipointer v2.4.0
 * base class for doing one thing with pointer event
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true, strict: true */

( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*global define, module, require */
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'unipointer/unipointer',[
            'ev-emitter/ev-emitter'
        ], function( EvEmitter ) {
            return factory( window, EvEmitter );
        });
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('ev-emitter')
        );
    } else {
        // browser global
        window.Unipointer = factory(
            window,
            window.EvEmitter
        );
    }

}( window, function factory( window, EvEmitter ) {



    function noop() {}

    function Unipointer() {}

// inherit EvEmitter
    var proto = Unipointer.prototype = Object.create( EvEmitter.prototype );

    proto.bindStartEvent = function( elem ) {
        this._bindStartEvent( elem, true );
    };

    proto.unbindStartEvent = function( elem ) {
        this._bindStartEvent( elem, false );
    };

    /**
     * Add or remove start event
     * @param {Boolean} isAdd - remove if falsey
     */
    proto._bindStartEvent = function( elem, isAdd ) {
        // munge isAdd, default to true
        isAdd = isAdd === undefined ? true : isAdd;
        var bindMethod = isAdd ? 'addEventListener' : 'removeEventListener';

        // default to mouse events
        var startEvent = 'mousedown';
        if ( 'ontouchstart' in window ) {
            // HACK prefer Touch Events as you can preventDefault on touchstart to
            // disable scroll in iOS & mobile Chrome metafizzy/flickity#1177
            startEvent = 'touchstart';
        } else if ( window.PointerEvent ) {
            // Pointer Events
            startEvent = 'pointerdown';
        }
        elem[ bindMethod ]( startEvent, this );
    };

// trigger handler methods for events
    proto.handleEvent = function( event ) {
        var method = 'on' + event.type;
        if ( this[ method ] ) {
            this[ method ]( event );
        }
    };

// returns the touch that we're keeping track of
    proto.getTouch = function( touches ) {
        for ( var i=0; i < touches.length; i++ ) {
            var touch = touches[i];
            if ( touch.identifier == this.pointerIdentifier ) {
                return touch;
            }
        }
    };

// ----- start event ----- //

    proto.onmousedown = function( event ) {
        // dismiss clicks from right or middle buttons
        var button = event.button;
        if ( button && ( button !== 0 && button !== 1 ) ) {
            return;
        }
        this._pointerDown( event, event );
    };

    proto.ontouchstart = function( event ) {
        this._pointerDown( event, event.changedTouches[0] );
    };

    proto.onpointerdown = function( event ) {
        this._pointerDown( event, event );
    };

    /**
     * pointer start
     * @param {Event} event
     * @param {Event or Touch} pointer
     */
    proto._pointerDown = function( event, pointer ) {
        // dismiss right click and other pointers
        // button = 0 is okay, 1-4 not
        if ( event.button || this.isPointerDown ) {
            return;
        }

        this.isPointerDown = true;
        // save pointer identifier to match up touch events
        this.pointerIdentifier = pointer.pointerId !== undefined ?
            // pointerId for pointer events, touch.indentifier for touch events
            pointer.pointerId : pointer.identifier;

        this.pointerDown( event, pointer );
    };

    proto.pointerDown = function( event, pointer ) {
        this._bindPostStartEvents( event );
        this.emitEvent( 'pointerDown', [ event, pointer ] );
    };

// hash of events to be bound after start event
    var postStartEvents = {
        mousedown: [ 'mousemove', 'mouseup' ],
        touchstart: [ 'touchmove', 'touchend', 'touchcancel' ],
        pointerdown: [ 'pointermove', 'pointerup', 'pointercancel' ],
    };

    proto._bindPostStartEvents = function( event ) {
        if ( !event ) {
            return;
        }
        // get proper events to match start event
        var events = postStartEvents[ event.type ];
        // bind events to node
        events.forEach( function( eventName ) {
            window.addEventListener( eventName, this );
        }, this );
        // save these arguments
        this._boundPointerEvents = events;
    };

    proto._unbindPostStartEvents = function() {
        // check for _boundEvents, in case dragEnd triggered twice (old IE8 bug)
        if ( !this._boundPointerEvents ) {
            return;
        }
        this._boundPointerEvents.forEach( function( eventName ) {
            window.removeEventListener( eventName, this );
        }, this );

        delete this._boundPointerEvents;
    };

// ----- move event ----- //

    proto.onmousemove = function( event ) {
        this._pointerMove( event, event );
    };

    proto.onpointermove = function( event ) {
        if ( event.pointerId == this.pointerIdentifier ) {
            this._pointerMove( event, event );
        }
    };

    proto.ontouchmove = function( event ) {
        var touch = this.getTouch( event.changedTouches );
        if ( touch ) {
            this._pointerMove( event, touch );
        }
    };

    /**
     * pointer move
     * @param {Event} event
     * @param {Event or Touch} pointer
     * @private
     */
    proto._pointerMove = function( event, pointer ) {
        this.pointerMove( event, pointer );
    };

// public
    proto.pointerMove = function( event, pointer ) {
        this.emitEvent( 'pointerMove', [ event, pointer ] );
    };

// ----- end event ----- //


    proto.onmouseup = function( event ) {
        this._pointerUp( event, event );
    };

    proto.onpointerup = function( event ) {
        if ( event.pointerId == this.pointerIdentifier ) {
            this._pointerUp( event, event );
        }
    };

    proto.ontouchend = function( event ) {
        var touch = this.getTouch( event.changedTouches );
        if ( touch ) {
            this._pointerUp( event, touch );
        }
    };

    /**
     * pointer up
     * @param {Event} event
     * @param {Event or Touch} pointer
     * @private
     */
    proto._pointerUp = function( event, pointer ) {
        this._pointerDone();
        this.pointerUp( event, pointer );
    };

// public
    proto.pointerUp = function( event, pointer ) {
        this.emitEvent( 'pointerUp', [ event, pointer ] );
    };

// ----- pointer done ----- //

// triggered on pointer up & pointer cancel
    proto._pointerDone = function() {
        this._pointerReset();
        this._unbindPostStartEvents();
        this.pointerDone();
    };

    proto._pointerReset = function() {
        // reset properties
        this.isPointerDown = false;
        delete this.pointerIdentifier;
    };

    proto.pointerDone = noop;

// ----- pointer cancel ----- //

    proto.onpointercancel = function( event ) {
        if ( event.pointerId == this.pointerIdentifier ) {
            this._pointerCancel( event, event );
        }
    };

    proto.ontouchcancel = function( event ) {
        var touch = this.getTouch( event.changedTouches );
        if ( touch ) {
            this._pointerCancel( event, touch );
        }
    };

    /**
     * pointer cancel
     * @param {Event} event
     * @param {Event or Touch} pointer
     * @private
     */
    proto._pointerCancel = function( event, pointer ) {
        this._pointerDone();
        this.pointerCancel( event, pointer );
    };

// public
    proto.pointerCancel = function( event, pointer ) {
        this.emitEvent( 'pointerCancel', [ event, pointer ] );
    };

// -----  ----- //

// utility function for getting x/y coords from event
    Unipointer.getPointerPoint = function( pointer ) {
        return {
            x: pointer.pageX,
            y: pointer.pageY
        };
    };

// -----  ----- //

    return Unipointer;

}));

/*!
 * Unidragger v2.4.0
 * Draggable base class
 * MIT license
 */

/*jshint browser: true, unused: true, undef: true, strict: true */

( function( window, factory ) {
    // universal module definition
    /*jshint strict: false */ /*globals define, module, require */

    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'unidragger/unidragger',[
            'unipointer/unipointer'
        ], function( Unipointer ) {
            return factory( window, Unipointer );
        });
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('unipointer')
        );
    } else {
        // browser global
        window.Unidragger = factory(
            window,
            window.Unipointer
        );
    }

}( window, function factory( window, Unipointer ) {



// -------------------------- Unidragger -------------------------- //

    function Unidragger() {}

// inherit Unipointer & EvEmitter
    var proto = Unidragger.prototype = Object.create( Unipointer.prototype );

// ----- bind start ----- //

    proto.bindHandles = function() {
        this._bindHandles( true );
    };

    proto.unbindHandles = function() {
        this._bindHandles( false );
    };

    /**
     * Add or remove start event
     * @param {Boolean} isAdd
     */
    proto._bindHandles = function( isAdd ) {
        // munge isAdd, default to true
        isAdd = isAdd === undefined ? true : isAdd;
        // bind each handle
        var bindMethod = isAdd ? 'addEventListener' : 'removeEventListener';
        var touchAction = isAdd ? this._touchActionValue : '';
        for ( var i=0; i < this.handles.length; i++ ) {
            var handle = this.handles[i];
            this._bindStartEvent( handle, isAdd );
            handle[ bindMethod ]( 'click', this );
            // touch-action: none to override browser touch gestures. metafizzy/flickity#540
            if ( window.PointerEvent ) {
                handle.style.touchAction = touchAction;
            }
        }
    };

// prototype so it can be overwriteable by Flickity
    proto._touchActionValue = 'none';

// ----- start event ----- //

    /**
     * pointer start
     * @param {Event} event
     * @param {Event or Touch} pointer
     */
    proto.pointerDown = function( event, pointer ) {
        var isOkay = this.okayPointerDown( event );
        if ( !isOkay ) {
            return;
        }
        // track start event position
        // Safari 9 overrides pageX and pageY. These values needs to be copied. flickity#842
        this.pointerDownPointer = {
            pageX: pointer.pageX,
            pageY: pointer.pageY,
        };

        event.preventDefault();
        this.pointerDownBlur();
        // bind move and end events
        this._bindPostStartEvents( event );
        this.emitEvent( 'pointerDown', [ event, pointer ] );
    };

// nodes that have text fields
    var cursorNodes = {
        TEXTAREA: true,
        INPUT: true,
        SELECT: true,
        OPTION: true,
    };

// input types that do not have text fields
    var clickTypes = {
        radio: true,
        checkbox: true,
        button: true,
        submit: true,
        image: true,
        file: true,
    };

// dismiss inputs with text fields. flickity#403, flickity#404
    proto.okayPointerDown = function( event ) {
        var isCursorNode = cursorNodes[ event.target.nodeName ];
        var isClickType = clickTypes[ event.target.type ];
        var isOkay = !isCursorNode || isClickType;
        if ( !isOkay ) {
            this._pointerReset();
        }
        return isOkay;
    };

// kludge to blur previously focused input
    proto.pointerDownBlur = function() {
        var focused = document.activeElement;
        // do not blur body for IE10, metafizzy/flickity#117
        var canBlur = focused && focused.blur && focused != document.body;
        if ( canBlur ) {
            focused.blur();
        }
    };

// ----- move event ----- //

    /**
     * drag move
     * @param {Event} event
     * @param {Event or Touch} pointer
     */
    proto.pointerMove = function( event, pointer ) {
        var moveVector = this._dragPointerMove( event, pointer );
        this.emitEvent( 'pointerMove', [ event, pointer, moveVector ] );
        this._dragMove( event, pointer, moveVector );
    };

// base pointer move logic
    proto._dragPointerMove = function( event, pointer ) {
        var moveVector = {
            x: pointer.pageX - this.pointerDownPointer.pageX,
            y: pointer.pageY - this.pointerDownPointer.pageY
        };
        // start drag if pointer has moved far enough to start drag
        if ( !this.isDragging && this.hasDragStarted( moveVector ) ) {
            this._dragStart( event, pointer );
        }
        return moveVector;
    };

// condition if pointer has moved far enough to start drag
    proto.hasDragStarted = function( moveVector ) {
        return Math.abs( moveVector.x ) > 3 || Math.abs( moveVector.y ) > 3;
    };

// ----- end event ----- //

    /**
     * pointer up
     * @param {Event} event
     * @param {Event or Touch} pointer
     */
    proto.pointerUp = function( event, pointer ) {
        this.emitEvent( 'pointerUp', [ event, pointer ] );
        this._dragPointerUp( event, pointer );
    };

    proto._dragPointerUp = function( event, pointer ) {
        if ( this.isDragging ) {
            this._dragEnd( event, pointer );
        } else {
            // pointer didn't move enough for drag to start
            this._staticClick( event, pointer );
        }
    };

// -------------------------- drag -------------------------- //

// dragStart
    proto._dragStart = function( event, pointer ) {
        this.isDragging = true;
        // prevent clicks
        this.isPreventingClicks = true;
        this.dragStart( event, pointer );
    };

    proto.dragStart = function( event, pointer ) {
        this.emitEvent( 'dragStart', [ event, pointer ] );
    };

// dragMove
    proto._dragMove = function( event, pointer, moveVector ) {
        // do not drag if not dragging yet
        if ( !this.isDragging ) {
            return;
        }

        this.dragMove( event, pointer, moveVector );
    };

    proto.dragMove = function( event, pointer, moveVector ) {
        event.preventDefault();
        this.emitEvent( 'dragMove', [ event, pointer, moveVector ] );
    };

// dragEnd
    proto._dragEnd = function( event, pointer ) {
        // set flags
        this.isDragging = false;
        // re-enable clicking async
        setTimeout( function() {
            delete this.isPreventingClicks;
        }.bind( this ) );

        this.dragEnd( event, pointer );
    };

    proto.dragEnd = function( event, pointer ) {
        this.emitEvent( 'dragEnd', [ event, pointer ] );
    };

// ----- onclick ----- //

// handle all clicks and prevent clicks when dragging
    proto.onclick = function( event ) {
        if ( this.isPreventingClicks ) {
            event.preventDefault();
        }
    };

// ----- staticClick ----- //

// triggered after pointer down & up with no/tiny movement
    proto._staticClick = function( event, pointer ) {
        // ignore emulated mouse up clicks
        if ( this.isIgnoringMouseUp && event.type == 'mouseup' ) {
            return;
        }

        this.staticClick( event, pointer );

        // set flag for emulated clicks 300ms after touchend
        if ( event.type != 'mouseup' ) {
            this.isIgnoringMouseUp = true;
            // reset flag after 300ms
            setTimeout( function() {
                delete this.isIgnoringMouseUp;
            }.bind( this ), 400 );
        }
    };

    proto.staticClick = function( event, pointer ) {
        this.emitEvent( 'staticClick', [ event, pointer ] );
    };

// ----- utils ----- //

    Unidragger.getPointerPoint = Unipointer.getPointerPoint;

// -----  ----- //

    return Unidragger;

}));

// drag
( function( window, factory ) {
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'flickity/js/drag',[
            './flickity',
            'unidragger/unidragger',
            'fizzy-ui-utils/utils',
        ], function( Flickity, Unidragger, utils ) {
            return factory( window, Flickity, Unidragger, utils );
        } );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('./flickity'),
            require('unidragger'),
            require('fizzy-ui-utils')
        );
    } else {
        // browser global
        window.Flickity = factory(
            window,
            window.Flickity,
            window.Unidragger,
            window.fizzyUIUtils
        );
    }

}( window, function factory( window, Flickity, Unidragger, utils ) {



// ----- defaults ----- //

    utils.extend( Flickity.defaults, {
        draggable: '>1',
        dragThreshold: 3,
    } );

// ----- create ----- //

    Flickity.createMethods.push('_createDrag');

// -------------------------- drag prototype -------------------------- //

    var proto = Flickity.prototype;
    utils.extend( proto, Unidragger.prototype );
    proto._touchActionValue = 'pan-y';

// --------------------------  -------------------------- //

    proto._createDrag = function() {
        this.on( 'activate', this.onActivateDrag );
        this.on( 'uiChange', this._uiChangeDrag );
        this.on( 'deactivate', this.onDeactivateDrag );
        this.on( 'cellChange', this.updateDraggable );
        // TODO updateDraggable on resize? if groupCells & slides change
    };

    proto.onActivateDrag = function() {
        this.handles = [ this.viewport ];
        this.bindHandles();
        this.updateDraggable();
    };

    proto.onDeactivateDrag = function() {
        this.unbindHandles();
        this.element.classList.remove('is-draggable');
    };

    proto.updateDraggable = function() {
        // disable dragging if less than 2 slides. #278
        if ( this.options.draggable == '>1' ) {
            this.isDraggable = this.slides.length > 1;
        } else {
            this.isDraggable = this.options.draggable;
        }
        if ( this.isDraggable ) {
            this.element.classList.add('is-draggable');
        } else {
            this.element.classList.remove('is-draggable');
        }
    };

// backwards compatibility
    proto.bindDrag = function() {
        this.options.draggable = true;
        this.updateDraggable();
    };

    proto.unbindDrag = function() {
        this.options.draggable = false;
        this.updateDraggable();
    };

    proto._uiChangeDrag = function() {
        delete this.isFreeScrolling;
    };

// -------------------------- pointer events -------------------------- //

    proto.pointerDown = function( event, pointer ) {
        if ( !this.isDraggable ) {
            this._pointerDownDefault( event, pointer );
            return;
        }
        var isOkay = this.okayPointerDown( event );
        if ( !isOkay ) {
            return;
        }

        this._pointerDownPreventDefault( event );
        this.pointerDownFocus( event );
        // blur
        if ( document.activeElement != this.element ) {
            // do not blur if already focused
            this.pointerDownBlur();
        }

        // stop if it was moving
        this.dragX = this.x;
        this.viewport.classList.add('is-pointer-down');
        // track scrolling
        this.pointerDownScroll = getScrollPosition();
        window.addEventListener( 'scroll', this );

        this._pointerDownDefault( event, pointer );
    };

// default pointerDown logic, used for staticClick
    proto._pointerDownDefault = function( event, pointer ) {
        // track start event position
        // Safari 9 overrides pageX and pageY. These values needs to be copied. #779
        this.pointerDownPointer = {
            pageX: pointer.pageX,
            pageY: pointer.pageY,
        };
        // bind move and end events
        this._bindPostStartEvents( event );
        this.dispatchEvent( 'pointerDown', event, [ pointer ] );
    };

    var focusNodes = {
        INPUT: true,
        TEXTAREA: true,
        SELECT: true,
    };

    proto.pointerDownFocus = function( event ) {
        var isFocusNode = focusNodes[ event.target.nodeName ];
        if ( !isFocusNode ) {
            this.focus();
        }
    };

    proto._pointerDownPreventDefault = function( event ) {
        var isTouchStart = event.type == 'touchstart';
        var isTouchPointer = event.pointerType == 'touch';
        var isFocusNode = focusNodes[ event.target.nodeName ];
        if ( !isTouchStart && !isTouchPointer && !isFocusNode ) {
            event.preventDefault();
        }
    };

// ----- move ----- //

    proto.hasDragStarted = function( moveVector ) {
        return Math.abs( moveVector.x ) > this.options.dragThreshold;
    };

// ----- up ----- //

    proto.pointerUp = function( event, pointer ) {
        delete this.isTouchScrolling;
        this.viewport.classList.remove('is-pointer-down');
        this.dispatchEvent( 'pointerUp', event, [ pointer ] );
        this._dragPointerUp( event, pointer );
    };

    proto.pointerDone = function() {
        window.removeEventListener( 'scroll', this );
        delete this.pointerDownScroll;
    };

// -------------------------- dragging -------------------------- //

    proto.dragStart = function( event, pointer ) {
        if ( !this.isDraggable ) {
            return;
        }
        this.dragStartPosition = this.x;
        this.startAnimation();
        window.removeEventListener( 'scroll', this );
        this.dispatchEvent( 'dragStart', event, [ pointer ] );
    };

    proto.pointerMove = function( event, pointer ) {
        var moveVector = this._dragPointerMove( event, pointer );
        this.dispatchEvent( 'pointerMove', event, [ pointer, moveVector ] );
        this._dragMove( event, pointer, moveVector );
    };

    proto.dragMove = function( event, pointer, moveVector ) {
        if ( !this.isDraggable ) {
            return;
        }
        event.preventDefault();

        this.previousDragX = this.dragX;
        // reverse if right-to-left
        var direction = this.options.rightToLeft ? -1 : 1;
        if ( this.options.wrapAround ) {
            // wrap around move. #589
            moveVector.x %= this.slideableWidth;
        }
        var dragX = this.dragStartPosition + moveVector.x * direction;

        if ( !this.options.wrapAround && this.slides.length ) {
            // slow drag
            var originBound = Math.max( -this.slides[0].target, this.dragStartPosition );
            dragX = dragX > originBound ? ( dragX + originBound ) * 0.5 : dragX;
            var endBound = Math.min( -this.getLastSlide().target, this.dragStartPosition );
            dragX = dragX < endBound ? ( dragX + endBound ) * 0.5 : dragX;
        }

        this.dragX = dragX;

        this.dragMoveTime = new Date();
        this.dispatchEvent( 'dragMove', event, [ pointer, moveVector ] );
    };

    proto.dragEnd = function( event, pointer ) {
        if ( !this.isDraggable ) {
            return;
        }
        if ( this.options.freeScroll ) {
            this.isFreeScrolling = true;
        }
        // set selectedIndex based on where flick will end up
        var index = this.dragEndRestingSelect();

        if ( this.options.freeScroll && !this.options.wrapAround ) {
            // if free-scroll & not wrap around
            // do not free-scroll if going outside of bounding slides
            // so bounding slides can attract slider, and keep it in bounds
            var restingX = this.getRestingPosition();
            this.isFreeScrolling = -restingX > this.slides[0].target &&
                -restingX < this.getLastSlide().target;
        } else if ( !this.options.freeScroll && index == this.selectedIndex ) {
            // boost selection if selected index has not changed
            index += this.dragEndBoostSelect();
        }
        delete this.previousDragX;
        // apply selection
        // TODO refactor this, selecting here feels weird
        // HACK, set flag so dragging stays in correct direction
        this.isDragSelect = this.options.wrapAround;
        this.select( index );
        delete this.isDragSelect;
        this.dispatchEvent( 'dragEnd', event, [ pointer ] );
    };

    proto.dragEndRestingSelect = function() {
        var restingX = this.getRestingPosition();
        // how far away from selected slide
        var distance = Math.abs( this.getSlideDistance( -restingX, this.selectedIndex ) );
        // get closet resting going up and going down
        var positiveResting = this._getClosestResting( restingX, distance, 1 );
        var negativeResting = this._getClosestResting( restingX, distance, -1 );
        // use closer resting for wrap-around
        var index = positiveResting.distance < negativeResting.distance ?
            positiveResting.index : negativeResting.index;
        return index;
    };

    /**
     * given resting X and distance to selected cell
     * get the distance and index of the closest cell
     * @param {Number} restingX - estimated post-flick resting position
     * @param {Number} distance - distance to selected cell
     * @param {Integer} increment - +1 or -1, going up or down
     * @returns {Object} - { distance: {Number}, index: {Integer} }
     */
    proto._getClosestResting = function( restingX, distance, increment ) {
        var index = this.selectedIndex;
        var minDistance = Infinity;
        var condition = this.options.contain && !this.options.wrapAround ?
            // if contain, keep going if distance is equal to minDistance
            function( dist, minDist ) {
                return dist <= minDist;
            } : function( dist, minDist ) {
                return dist < minDist;
            };
        while ( condition( distance, minDistance ) ) {
            // measure distance to next cell
            index += increment;
            minDistance = distance;
            distance = this.getSlideDistance( -restingX, index );
            if ( distance === null ) {
                break;
            }
            distance = Math.abs( distance );
        }
        return {
            distance: minDistance,
            // selected was previous index
            index: index - increment,
        };
    };

    /**
     * measure distance between x and a slide target
     * @param {Number} x - horizontal position
     * @param {Integer} index - slide index
     * @returns {Number} - slide distance
     */
    proto.getSlideDistance = function( x, index ) {
        var len = this.slides.length;
        // wrap around if at least 2 slides
        var isWrapAround = this.options.wrapAround && len > 1;
        var slideIndex = isWrapAround ? utils.modulo( index, len ) : index;
        var slide = this.slides[ slideIndex ];
        if ( !slide ) {
            return null;
        }
        // add distance for wrap-around slides
        var wrap = isWrapAround ? this.slideableWidth * Math.floor( index/len ) : 0;
        return x - ( slide.target + wrap );
    };

    proto.dragEndBoostSelect = function() {
        // do not boost if no previousDragX or dragMoveTime
        if ( this.previousDragX === undefined || !this.dragMoveTime ||
            // or if drag was held for 100 ms
            new Date() - this.dragMoveTime > 100 ) {
            return 0;
        }

        var distance = this.getSlideDistance( -this.dragX, this.selectedIndex );
        var delta = this.previousDragX - this.dragX;
        if ( distance > 0 && delta > 0 ) {
            // boost to next if moving towards the right, and positive velocity
            return 1;
        } else if ( distance < 0 && delta < 0 ) {
            // boost to previous if moving towards the left, and negative velocity
            return -1;
        }
        return 0;
    };

// ----- staticClick ----- //

    proto.staticClick = function( event, pointer ) {
        // get clickedCell, if cell was clicked
        var clickedCell = this.getParentCell( event.target );
        var cellElem = clickedCell && clickedCell.element;
        var cellIndex = clickedCell && this.cells.indexOf( clickedCell );
        this.dispatchEvent( 'staticClick', event, [ pointer, cellElem, cellIndex ] );
    };

// ----- scroll ----- //

    proto.onscroll = function() {
        var scroll = getScrollPosition();
        var scrollMoveX = this.pointerDownScroll.x - scroll.x;
        var scrollMoveY = this.pointerDownScroll.y - scroll.y;
        // cancel click/tap if scroll is too much
        if ( Math.abs( scrollMoveX ) > 3 || Math.abs( scrollMoveY ) > 3 ) {
            this._pointerDone();
        }
    };

// ----- utils ----- //

    function getScrollPosition() {
        return {
            x: window.pageXOffset,
            y: window.pageYOffset,
        };
    }

// -----  ----- //

    return Flickity;

} ) );

// prev/next buttons
( function( window, factory ) {
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'flickity/js/prev-next-button',[
            './flickity',
            'unipointer/unipointer',
            'fizzy-ui-utils/utils',
        ], function( Flickity, Unipointer, utils ) {
            return factory( window, Flickity, Unipointer, utils );
        } );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('./flickity'),
            require('unipointer'),
            require('fizzy-ui-utils')
        );
    } else {
        // browser global
        factory(
            window,
            window.Flickity,
            window.Unipointer,
            window.fizzyUIUtils
        );
    }

}( window, function factory( window, Flickity, Unipointer, utils ) {
    'use strict';

    var svgURI = 'http://www.w3.org/2000/svg';

// -------------------------- PrevNextButton -------------------------- //

    function PrevNextButton( direction, parent ) {
        this.direction = direction;
        this.parent = parent;
        this._create();
    }

    PrevNextButton.prototype = Object.create( Unipointer.prototype );

    PrevNextButton.prototype._create = function() {
        // properties
        this.isEnabled = true;
        this.isPrevious = this.direction == -1;
        var leftDirection = this.parent.options.rightToLeft ? 1 : -1;
        this.isLeft = this.direction == leftDirection;

        var element = this.element = document.createElement('button');
        element.className = 'flickity-button flickity-prev-next-button';
        element.className += this.isPrevious ? ' previous' : ' next';
        // prevent button from submitting form http://stackoverflow.com/a/10836076/182183
        element.setAttribute( 'type', 'button' );
        // init as disabled
        this.disable();

        element.setAttribute( 'aria-label', this.isPrevious ? 'Previous' : 'Next' );

        // create arrow
        var svg = this.createSVG();
        element.appendChild( svg );
        // events
        this.parent.on( 'select', this.update.bind( this ) );
        this.on( 'pointerDown', this.parent.childUIPointerDown.bind( this.parent ) );
    };

    PrevNextButton.prototype.activate = function() {
        this.bindStartEvent( this.element );
        this.element.addEventListener( 'click', this );
        // add to DOM
        this.parent.element.appendChild( this.element );
    };

    PrevNextButton.prototype.deactivate = function() {
        // remove from DOM
        this.parent.element.removeChild( this.element );
        // click events
        this.unbindStartEvent( this.element );
        this.element.removeEventListener( 'click', this );
    };

    PrevNextButton.prototype.createSVG = function() {
        var svg = document.createElementNS( svgURI, 'svg' );
        svg.setAttribute( 'class', 'flickity-button-icon' );
        svg.setAttribute( 'viewBox', '0 0 100 100' );
        var path = document.createElementNS( svgURI, 'path' );
        var pathMovements = getArrowMovements( this.parent.options.arrowShape );
        path.setAttribute( 'd', pathMovements );
        path.setAttribute( 'class', 'arrow' );
        // rotate arrow
        if ( !this.isLeft ) {
            path.setAttribute( 'transform', 'translate(100, 100) rotate(180) ' );
        }
        svg.appendChild( path );
        return svg;
    };

// get SVG path movmement
    function getArrowMovements( shape ) {
        // use shape as movement if string
        if ( typeof shape == 'string' ) {
            return shape;
        }
        // create movement string
        return 'M ' + shape.x0 + ',50' +
            ' L ' + shape.x1 + ',' + ( shape.y1 + 50 ) +
            ' L ' + shape.x2 + ',' + ( shape.y2 + 50 ) +
            ' L ' + shape.x3 + ',50 ' +
            ' L ' + shape.x2 + ',' + ( 50 - shape.y2 ) +
            ' L ' + shape.x1 + ',' + ( 50 - shape.y1 ) +
            ' Z';
    }

    PrevNextButton.prototype.handleEvent = utils.handleEvent;

    PrevNextButton.prototype.onclick = function() {
        if ( !this.isEnabled ) {
            return;
        }
        this.parent.uiChange();
        var method = this.isPrevious ? 'previous' : 'next';
        this.parent[ method ]();
    };

// -----  ----- //

    PrevNextButton.prototype.enable = function() {
        if ( this.isEnabled ) {
            return;
        }
        this.element.disabled = false;
        this.isEnabled = true;
    };

    PrevNextButton.prototype.disable = function() {
        if ( !this.isEnabled ) {
            return;
        }
        this.element.disabled = true;
        this.isEnabled = false;
    };

    PrevNextButton.prototype.update = function() {
        // index of first or last slide, if previous or next
        var slides = this.parent.slides;
        // enable is wrapAround and at least 2 slides
        if ( this.parent.options.wrapAround && slides.length > 1 ) {
            this.enable();
            return;
        }
        var lastIndex = slides.length ? slides.length - 1 : 0;
        var boundIndex = this.isPrevious ? 0 : lastIndex;
        var method = this.parent.selectedIndex == boundIndex ? 'disable' : 'enable';
        this[ method ]();
    };

    PrevNextButton.prototype.destroy = function() {
        this.deactivate();
        this.allOff();
    };

// -------------------------- Flickity prototype -------------------------- //

    utils.extend( Flickity.defaults, {
        prevNextButtons: true,
        arrowShape: {
            x0: 10,
            x1: 60, y1: 50,
            x2: 70, y2: 40,
            x3: 30,
        },
    } );

    Flickity.createMethods.push('_createPrevNextButtons');
    var proto = Flickity.prototype;

    proto._createPrevNextButtons = function() {
        if ( !this.options.prevNextButtons ) {
            return;
        }

        this.prevButton = new PrevNextButton( -1, this );
        this.nextButton = new PrevNextButton( 1, this );

        this.on( 'activate', this.activatePrevNextButtons );
    };

    proto.activatePrevNextButtons = function() {
        this.prevButton.activate();
        this.nextButton.activate();
        this.on( 'deactivate', this.deactivatePrevNextButtons );
    };

    proto.deactivatePrevNextButtons = function() {
        this.prevButton.deactivate();
        this.nextButton.deactivate();
        this.off( 'deactivate', this.deactivatePrevNextButtons );
    };

// --------------------------  -------------------------- //

    Flickity.PrevNextButton = PrevNextButton;

    return Flickity;

} ) );

// page dots
( function( window, factory ) {
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'flickity/js/page-dots',[
            './flickity',
            'unipointer/unipointer',
            'fizzy-ui-utils/utils',
        ], function( Flickity, Unipointer, utils ) {
            return factory( window, Flickity, Unipointer, utils );
        } );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('./flickity'),
            require('unipointer'),
            require('fizzy-ui-utils')
        );
    } else {
        // browser global
        factory(
            window,
            window.Flickity,
            window.Unipointer,
            window.fizzyUIUtils
        );
    }

}( window, function factory( window, Flickity, Unipointer, utils ) {

// -------------------------- PageDots -------------------------- //



    function PageDots( parent ) {
        this.parent = parent;
        this._create();
    }

    PageDots.prototype = Object.create( Unipointer.prototype );

    PageDots.prototype._create = function() {
        // create holder element
        this.holder = document.createElement('ol');
        this.holder.className = 'flickity-page-dots';
        // create dots, array of elements
        this.dots = [];
        // events
        this.handleClick = this.onClick.bind( this );
        this.on( 'pointerDown', this.parent.childUIPointerDown.bind( this.parent ) );
    };

    PageDots.prototype.activate = function() {
        this.setDots();
        this.holder.addEventListener( 'click', this.handleClick );
        this.bindStartEvent( this.holder );
        // add to DOM
        this.parent.element.appendChild( this.holder );
    };

    PageDots.prototype.deactivate = function() {
        this.holder.removeEventListener( 'click', this.handleClick );
        this.unbindStartEvent( this.holder );
        // remove from DOM
        this.parent.element.removeChild( this.holder );
    };

    PageDots.prototype.setDots = function() {
        // get difference between number of slides and number of dots
        var delta = this.parent.slides.length - this.dots.length;
        if ( delta > 0 ) {
            this.addDots( delta );
        } else if ( delta < 0 ) {
            this.removeDots( -delta );
        }
    };

    PageDots.prototype.addDots = function( count ) {
        var fragment = document.createDocumentFragment();
        var newDots = [];
        var length = this.dots.length;
        var max = length + count;

        for ( var i = length; i < max; i++ ) {
            var dot = document.createElement('li');
            dot.className = 'dot';
            dot.setAttribute( 'aria-label', 'Page dot ' + ( i + 1 ) );
            fragment.appendChild( dot );
            newDots.push( dot );
        }

        this.holder.appendChild( fragment );
        this.dots = this.dots.concat( newDots );
    };

    PageDots.prototype.removeDots = function( count ) {
        // remove from this.dots collection
        var removeDots = this.dots.splice( this.dots.length - count, count );
        // remove from DOM
        removeDots.forEach( function( dot ) {
            this.holder.removeChild( dot );
        }, this );
    };

    PageDots.prototype.updateSelected = function() {
        // remove selected class on previous
        if ( this.selectedDot ) {
            this.selectedDot.className = 'dot';
            this.selectedDot.removeAttribute('aria-current');
        }
        // don't proceed if no dots
        if ( !this.dots.length ) {
            return;
        }
        this.selectedDot = this.dots[ this.parent.selectedIndex ];
        this.selectedDot.className = 'dot is-selected';
        this.selectedDot.setAttribute( 'aria-current', 'step' );
    };

    PageDots.prototype.onTap = // old method name, backwards-compatible
        PageDots.prototype.onClick = function( event ) {
            var target = event.target;
            // only care about dot clicks
            if ( target.nodeName != 'LI' ) {
                return;
            }

            this.parent.uiChange();
            var index = this.dots.indexOf( target );
            this.parent.select( index );
        };

    PageDots.prototype.destroy = function() {
        this.deactivate();
        this.allOff();
    };

    Flickity.PageDots = PageDots;

// -------------------------- Flickity -------------------------- //

    utils.extend( Flickity.defaults, {
        pageDots: true,
    } );

    Flickity.createMethods.push('_createPageDots');

    var proto = Flickity.prototype;

    proto._createPageDots = function() {
        if ( !this.options.pageDots ) {
            return;
        }
        this.pageDots = new PageDots( this );
        // events
        this.on( 'activate', this.activatePageDots );
        this.on( 'select', this.updateSelectedPageDots );
        this.on( 'cellChange', this.updatePageDots );
        this.on( 'resize', this.updatePageDots );
        this.on( 'deactivate', this.deactivatePageDots );
    };

    proto.activatePageDots = function() {
        this.pageDots.activate();
    };

    proto.updateSelectedPageDots = function() {
        this.pageDots.updateSelected();
    };

    proto.updatePageDots = function() {
        this.pageDots.setDots();
    };

    proto.deactivatePageDots = function() {
        this.pageDots.deactivate();
    };

// -----  ----- //

    Flickity.PageDots = PageDots;

    return Flickity;

} ) );

// player & autoPlay
( function( window, factory ) {
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'flickity/js/player',[
            'ev-emitter/ev-emitter',
            'fizzy-ui-utils/utils',
            './flickity',
        ], function( EvEmitter, utils, Flickity ) {
            return factory( EvEmitter, utils, Flickity );
        } );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            require('ev-emitter'),
            require('fizzy-ui-utils'),
            require('./flickity')
        );
    } else {
        // browser global
        factory(
            window.EvEmitter,
            window.fizzyUIUtils,
            window.Flickity
        );
    }

}( window, function factory( EvEmitter, utils, Flickity ) {



// -------------------------- Player -------------------------- //

    function Player( parent ) {
        this.parent = parent;
        this.state = 'stopped';
        // visibility change event handler
        this.onVisibilityChange = this.visibilityChange.bind( this );
        this.onVisibilityPlay = this.visibilityPlay.bind( this );
    }

    Player.prototype = Object.create( EvEmitter.prototype );

// start play
    Player.prototype.play = function() {
        if ( this.state == 'playing' ) {
            return;
        }
        // do not play if page is hidden, start playing when page is visible
        var isPageHidden = document.hidden;
        if ( isPageHidden ) {
            document.addEventListener( 'visibilitychange', this.onVisibilityPlay );
            return;
        }

        this.state = 'playing';
        // listen to visibility change
        document.addEventListener( 'visibilitychange', this.onVisibilityChange );
        // start ticking
        this.tick();
    };

    Player.prototype.tick = function() {
        // do not tick if not playing
        if ( this.state != 'playing' ) {
            return;
        }

        var time = this.parent.options.autoPlay;
        // default to 3 seconds
        time = typeof time == 'number' ? time : 3000;
        var _this = this;
        // HACK: reset ticks if stopped and started within interval
        this.clear();
        this.timeout = setTimeout( function() {
            _this.parent.next( true );
            _this.tick();
        }, time );
    };

    Player.prototype.stop = function() {
        this.state = 'stopped';
        this.clear();
        // remove visibility change event
        document.removeEventListener( 'visibilitychange', this.onVisibilityChange );
    };

    Player.prototype.clear = function() {
        clearTimeout( this.timeout );
    };

    Player.prototype.pause = function() {
        if ( this.state == 'playing' ) {
            this.state = 'paused';
            this.clear();
        }
    };

    Player.prototype.unpause = function() {
        // re-start play if paused
        if ( this.state == 'paused' ) {
            this.play();
        }
    };

// pause if page visibility is hidden, unpause if visible
    Player.prototype.visibilityChange = function() {
        var isPageHidden = document.hidden;
        this[ isPageHidden ? 'pause' : 'unpause' ]();
    };

    Player.prototype.visibilityPlay = function() {
        this.play();
        document.removeEventListener( 'visibilitychange', this.onVisibilityPlay );
    };

// -------------------------- Flickity -------------------------- //

    utils.extend( Flickity.defaults, {
        pauseAutoPlayOnHover: true,
    } );

    Flickity.createMethods.push('_createPlayer');
    var proto = Flickity.prototype;

    proto._createPlayer = function() {
        this.player = new Player( this );

        this.on( 'activate', this.activatePlayer );
        this.on( 'uiChange', this.stopPlayer );
        this.on( 'pointerDown', this.stopPlayer );
        this.on( 'deactivate', this.deactivatePlayer );
    };

    proto.activatePlayer = function() {
        if ( !this.options.autoPlay ) {
            return;
        }
        this.player.play();
        this.element.addEventListener( 'mouseenter', this );
    };

// Player API, don't hate the ... thanks I know where the door is

    proto.playPlayer = function() {
        this.player.play();
    };

    proto.stopPlayer = function() {
        this.player.stop();
    };

    proto.pausePlayer = function() {
        this.player.pause();
    };

    proto.unpausePlayer = function() {
        this.player.unpause();
    };

    proto.deactivatePlayer = function() {
        this.player.stop();
        this.element.removeEventListener( 'mouseenter', this );
    };

// ----- mouseenter/leave ----- //

// pause auto-play on hover
    proto.onmouseenter = function() {
        if ( !this.options.pauseAutoPlayOnHover ) {
            return;
        }
        this.player.pause();
        this.element.addEventListener( 'mouseleave', this );
    };

// resume auto-play on hover off
    proto.onmouseleave = function() {
        this.player.unpause();
        this.element.removeEventListener( 'mouseleave', this );
    };

// -----  ----- //

    Flickity.Player = Player;

    return Flickity;

} ) );

// add, remove cell
( function( window, factory ) {
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'flickity/js/add-remove-cell',[
            './flickity',
            'fizzy-ui-utils/utils',
        ], function( Flickity, utils ) {
            return factory( window, Flickity, utils );
        } );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('./flickity'),
            require('fizzy-ui-utils')
        );
    } else {
        // browser global
        factory(
            window,
            window.Flickity,
            window.fizzyUIUtils
        );
    }

}( window, function factory( window, Flickity, utils ) {



// append cells to a document fragment
    function getCellsFragment( cells ) {
        var fragment = document.createDocumentFragment();
        cells.forEach( function( cell ) {
            fragment.appendChild( cell.element );
        } );
        return fragment;
    }

// -------------------------- add/remove cell prototype -------------------------- //

    var proto = Flickity.prototype;

    /**
     * Insert, prepend, or append cells
     * @param {[Element, Array, NodeList]} elems - Elements to insert
     * @param {Integer} index - Zero-based number to insert
     */
    proto.insert = function( elems, index ) {
        var cells = this._makeCells( elems );
        if ( !cells || !cells.length ) {
            return;
        }
        var len = this.cells.length;
        // default to append
        index = index === undefined ? len : index;
        // add cells with document fragment
        var fragment = getCellsFragment( cells );
        // append to slider
        var isAppend = index == len;
        if ( isAppend ) {
            this.slider.appendChild( fragment );
        } else {
            var insertCellElement = this.cells[ index ].element;
            this.slider.insertBefore( fragment, insertCellElement );
        }
        // add to this.cells
        if ( index === 0 ) {
            // prepend, add to start
            this.cells = cells.concat( this.cells );
        } else if ( isAppend ) {
            // append, add to end
            this.cells = this.cells.concat( cells );
        } else {
            // insert in this.cells
            var endCells = this.cells.splice( index, len - index );
            this.cells = this.cells.concat( cells ).concat( endCells );
        }

        this._sizeCells( cells );
        this.cellChange( index, true );
    };

    proto.append = function( elems ) {
        this.insert( elems, this.cells.length );
    };

    proto.prepend = function( elems ) {
        this.insert( elems, 0 );
    };

    /**
     * Remove cells
     * @param {[Element, Array, NodeList]} elems - ELements to remove
     */
    proto.remove = function( elems ) {
        var cells = this.getCells( elems );
        if ( !cells || !cells.length ) {
            return;
        }

        var minCellIndex = this.cells.length - 1;
        // remove cells from collection & DOM
        cells.forEach( function( cell ) {
            cell.remove();
            var index = this.cells.indexOf( cell );
            minCellIndex = Math.min( index, minCellIndex );
            utils.removeFrom( this.cells, cell );
        }, this );

        this.cellChange( minCellIndex, true );
    };

    /**
     * logic to be run after a cell's size changes
     * @param {Element} elem - cell's element
     */
    proto.cellSizeChange = function( elem ) {
        var cell = this.getCell( elem );
        if ( !cell ) {
            return;
        }
        cell.getSize();

        var index = this.cells.indexOf( cell );
        this.cellChange( index );
    };

    /**
     * logic any time a cell is changed: added, removed, or size changed
     * @param {Integer} changedCellIndex - index of the changed cell, optional
     * @param {Boolean} isPositioningSlider - Positions slider after selection
     */
    proto.cellChange = function( changedCellIndex, isPositioningSlider ) {
        var prevSelectedElem = this.selectedElement;
        this._positionCells( changedCellIndex );
        this._getWrapShiftCells();
        this.setGallerySize();
        // update selectedIndex
        // try to maintain position & select previous selected element
        var cell = this.getCell( prevSelectedElem );
        if ( cell ) {
            this.selectedIndex = this.getCellSlideIndex( cell );
        }
        this.selectedIndex = Math.min( this.slides.length - 1, this.selectedIndex );

        this.emitEvent( 'cellChange', [ changedCellIndex ] );
        // position slider
        this.select( this.selectedIndex );
        // do not position slider after lazy load
        if ( isPositioningSlider ) {
            this.positionSliderAtSelected();
        }
    };

// -----  ----- //

    return Flickity;

} ) );

// lazyload
( function( window, factory ) {
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'flickity/js/lazyload',[
            './flickity',
            'fizzy-ui-utils/utils',
        ], function( Flickity, utils ) {
            return factory( window, Flickity, utils );
        } );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('./flickity'),
            require('fizzy-ui-utils')
        );
    } else {
        // browser global
        factory(
            window,
            window.Flickity,
            window.fizzyUIUtils
        );
    }

}( window, function factory( window, Flickity, utils ) {
    'use strict';

    Flickity.createMethods.push('_createLazyload');
    var proto = Flickity.prototype;

    proto._createLazyload = function() {
        this.on( 'select', this.lazyLoad );
    };

    proto.lazyLoad = function() {
        var lazyLoad = this.options.lazyLoad;
        if ( !lazyLoad ) {
            return;
        }
        // get adjacent cells, use lazyLoad option for adjacent count
        var adjCount = typeof lazyLoad == 'number' ? lazyLoad : 0;
        var cellElems = this.getAdjacentCellElements( adjCount );
        // get lazy images in those cells
        var lazyImages = [];
        cellElems.forEach( function( cellElem ) {
            var lazyCellImages = getCellLazyImages( cellElem );
            lazyImages = lazyImages.concat( lazyCellImages );
        } );
        // load lazy images
        lazyImages.forEach( function( img ) {
            new LazyLoader( img, this );
        }, this );
    };

    function getCellLazyImages( cellElem ) {
        // check if cell element is lazy image
        if ( cellElem.nodeName == 'IMG' ) {
            var lazyloadAttr = cellElem.getAttribute('data-flickity-lazyload');
            var srcAttr = cellElem.getAttribute('data-flickity-lazyload-src');
            var srcsetAttr = cellElem.getAttribute('data-flickity-lazyload-srcset');
            if ( lazyloadAttr || srcAttr || srcsetAttr ) {
                return [ cellElem ];
            }
        }
        // select lazy images in cell
        var lazySelector = 'img[data-flickity-lazyload], ' +
            'img[data-flickity-lazyload-src], img[data-flickity-lazyload-srcset]';
        var imgs = cellElem.querySelectorAll( lazySelector );
        return utils.makeArray( imgs );
    }

// -------------------------- LazyLoader -------------------------- //

    /**
     * class to handle loading images
     * @param {Image} img - Image element
     * @param {Flickity} flickity - Flickity instance
     */
    function LazyLoader( img, flickity ) {
        this.img = img;
        this.flickity = flickity;
        this.load();
    }

    LazyLoader.prototype.handleEvent = utils.handleEvent;

    LazyLoader.prototype.load = function() {
        this.img.addEventListener( 'load', this );
        this.img.addEventListener( 'error', this );
        // get src & srcset
        var src = this.img.getAttribute('data-flickity-lazyload') ||
            this.img.getAttribute('data-flickity-lazyload-src');
        var srcset = this.img.getAttribute('data-flickity-lazyload-srcset');
        // set src & serset
        this.img.src = src;
        if ( srcset ) {
            this.img.setAttribute( 'srcset', srcset );
        }
        // remove attr
        this.img.removeAttribute('data-flickity-lazyload');
        this.img.removeAttribute('data-flickity-lazyload-src');
        this.img.removeAttribute('data-flickity-lazyload-srcset');
    };

    LazyLoader.prototype.onload = function( event ) {
        this.complete( event, 'flickity-lazyloaded' );
    };

    LazyLoader.prototype.onerror = function( event ) {
        this.complete( event, 'flickity-lazyerror' );
    };

    LazyLoader.prototype.complete = function( event, className ) {
        // unbind events
        this.img.removeEventListener( 'load', this );
        this.img.removeEventListener( 'error', this );

        var cell = this.flickity.getParentCell( this.img );
        var cellElem = cell && cell.element;
        this.flickity.cellSizeChange( cellElem );

        this.img.classList.add( className );
        this.flickity.dispatchEvent( 'lazyLoad', event, cellElem );
    };

// -----  ----- //

    Flickity.LazyLoader = LazyLoader;

    return Flickity;

} ) );

/*!
 * Flickity v2.3.0
 * Touch, responsive, flickable carousels
 *
 * Licensed GPLv3 for open source use
 * or Flickity Commercial License for commercial use
 *
 * https://flickity.metafizzy.co
 * Copyright 2015-2021 Metafizzy
 */

( function( window, factory ) {
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'flickity/js/index',[
            './flickity',
            './drag',
            './prev-next-button',
            './page-dots',
            './player',
            './add-remove-cell',
            './lazyload',
        ], factory );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            require('./flickity'),
            require('./drag'),
            require('./prev-next-button'),
            require('./page-dots'),
            require('./player'),
            require('./add-remove-cell'),
            require('./lazyload')
        );
    }

} )( window, function factory( Flickity ) {
    return Flickity;
} );

/*!
 * Flickity asNavFor v2.0.2
 * enable asNavFor for Flickity
 */

/*jshint browser: true, undef: true, unused: true, strict: true*/

( function( window, factory ) {
    // universal module definition
    /*jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'flickity-as-nav-for/as-nav-for',[
            'flickity/js/index',
            'fizzy-ui-utils/utils'
        ], factory );
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            require('flickity'),
            require('fizzy-ui-utils')
        );
    } else {
        // browser global
        window.Flickity = factory(
            window.Flickity,
            window.fizzyUIUtils
        );
    }

}( window, function factory( Flickity, utils ) {



// -------------------------- asNavFor prototype -------------------------- //

// Flickity.defaults.asNavFor = null;

    Flickity.createMethods.push('_createAsNavFor');

    var proto = Flickity.prototype;

    proto._createAsNavFor = function() {
        this.on( 'activate', this.activateAsNavFor );
        this.on( 'deactivate', this.deactivateAsNavFor );
        this.on( 'destroy', this.destroyAsNavFor );

        var asNavForOption = this.options.asNavFor;
        if ( !asNavForOption ) {
            return;
        }
        // HACK do async, give time for other flickity to be initalized
        var _this = this;
        setTimeout( function initNavCompanion() {
            _this.setNavCompanion( asNavForOption );
        });
    };

    proto.setNavCompanion = function( elem ) {
        elem = utils.getQueryElement( elem );
        var companion = Flickity.data( elem );
        // stop if no companion or companion is self
        if ( !companion || companion == this ) {
            return;
        }

        this.navCompanion = companion;
        // companion select
        var _this = this;
        this.onNavCompanionSelect = function() {
            _this.navCompanionSelect();
        };
        companion.on( 'select', this.onNavCompanionSelect );
        // click
        this.on( 'staticClick', this.onNavStaticClick );

        this.navCompanionSelect( true );
    };

    proto.navCompanionSelect = function( isInstant ) {
        // wait for companion & selectedCells first. #8
        var companionCells = this.navCompanion && this.navCompanion.selectedCells;
        if ( !companionCells ) {
            return;
        }
        // select slide that matches first cell of slide
        var selectedCell = companionCells[0];
        var firstIndex = this.navCompanion.cells.indexOf( selectedCell );
        var lastIndex = firstIndex + companionCells.length - 1;
        var selectIndex = Math.floor( lerp( firstIndex, lastIndex,
            this.navCompanion.cellAlign ) );
        this.selectCell( selectIndex, false, isInstant );
        // set nav selected class
        this.removeNavSelectedElements();
        // stop if companion has more cells than this one
        if ( selectIndex >= this.cells.length ) {
            return;
        }

        var selectedCells = this.cells.slice( firstIndex, lastIndex + 1 );
        this.navSelectedElements = selectedCells.map( function( cell ) {
            return cell.element;
        });
        this.changeNavSelectedClass('add');
    };

    function lerp( a, b, t ) {
        return ( b - a ) * t + a;
    }

    proto.changeNavSelectedClass = function( method ) {
        this.navSelectedElements.forEach( function( navElem ) {
            navElem.classList[ method ]('is-nav-selected');
        });
    };

    proto.activateAsNavFor = function() {
        this.navCompanionSelect( true );
    };

    proto.removeNavSelectedElements = function() {
        if ( !this.navSelectedElements ) {
            return;
        }
        this.changeNavSelectedClass('remove');
        delete this.navSelectedElements;
    };

    proto.onNavStaticClick = function( event, pointer, cellElement, cellIndex ) {
        if ( typeof cellIndex == 'number' ) {
            this.navCompanion.selectCell( cellIndex );
        }
    };

    proto.deactivateAsNavFor = function() {
        this.removeNavSelectedElements();
    };

    proto.destroyAsNavFor = function() {
        if ( !this.navCompanion ) {
            return;
        }
        this.navCompanion.off( 'select', this.onNavCompanionSelect );
        this.off( 'staticClick', this.onNavStaticClick );
        delete this.navCompanion;
    };

// -----  ----- //

    return Flickity;

}));

/*!
 * imagesLoaded v4.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) { 'use strict';
    // universal module definition

    /*global define: false, module: false, require: false */

    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( 'imagesloaded/imagesloaded',[
            'ev-emitter/ev-emitter'
        ], function( EvEmitter ) {
            return factory( window, EvEmitter );
        });
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('ev-emitter')
        );
    } else {
        // browser global
        window.imagesLoaded = factory(
            window,
            window.EvEmitter
        );
    }

})( typeof window !== 'undefined' ? window : this,

// --------------------------  factory -------------------------- //

    function factory( window, EvEmitter ) {



        var $ = window.jQuery;
        var console = window.console;

// -------------------------- helpers -------------------------- //

// extend objects
        function extend( a, b ) {
            for ( var prop in b ) {
                a[ prop ] = b[ prop ];
            }
            return a;
        }

        var arraySlice = Array.prototype.slice;

// turn element or nodeList into an array
        function makeArray( obj ) {
            if ( Array.isArray( obj ) ) {
                // use object if already an array
                return obj;
            }

            var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
            if ( isArrayLike ) {
                // convert nodeList to array
                return arraySlice.call( obj );
            }

            // array of single index
            return [ obj ];
        }

// -------------------------- imagesLoaded -------------------------- //

        /**
         * @param {Array, Element, NodeList, String} elem
         * @param {Object or Function} options - if function, use as callback
         * @param {Function} onAlways - callback function
         */
        function ImagesLoaded( elem, options, onAlways ) {
            // coerce ImagesLoaded() without new, to be new ImagesLoaded()
            if ( !( this instanceof ImagesLoaded ) ) {
                return new ImagesLoaded( elem, options, onAlways );
            }
            // use elem as selector string
            var queryElem = elem;
            if ( typeof elem == 'string' ) {
                queryElem = document.querySelectorAll( elem );
            }
            // bail if bad element
            if ( !queryElem ) {
                console.error( 'Bad element for imagesLoaded ' + ( queryElem || elem ) );
                return;
            }

            this.elements = makeArray( queryElem );
            this.options = extend( {}, this.options );
            // shift arguments if no options set
            if ( typeof options == 'function' ) {
                onAlways = options;
            } else {
                extend( this.options, options );
            }

            if ( onAlways ) {
                this.on( 'always', onAlways );
            }

            this.getImages();

            if ( $ ) {
                // add jQuery Deferred object
                this.jqDeferred = new $.Deferred();
            }

            // HACK check async to allow time to bind listeners
            setTimeout( this.check.bind( this ) );
        }

        ImagesLoaded.prototype = Object.create( EvEmitter.prototype );

        ImagesLoaded.prototype.options = {};

        ImagesLoaded.prototype.getImages = function() {
            this.images = [];

            // filter & find items if we have an item selector
            this.elements.forEach( this.addElementImages, this );
        };

        /**
         * @param {Node} element
         */
        ImagesLoaded.prototype.addElementImages = function( elem ) {
            // filter siblings
            if ( elem.nodeName == 'IMG' ) {
                this.addImage( elem );
            }
            // get background image on element
            if ( this.options.background === true ) {
                this.addElementBackgroundImages( elem );
            }

            // find children
            // no non-element nodes, #143
            var nodeType = elem.nodeType;
            if ( !nodeType || !elementNodeTypes[ nodeType ] ) {
                return;
            }
            var childImgs = elem.querySelectorAll('img');
            // concat childElems to filterFound array
            for ( var i=0; i < childImgs.length; i++ ) {
                var img = childImgs[i];
                this.addImage( img );
            }

            // get child background images
            if ( typeof this.options.background == 'string' ) {
                var children = elem.querySelectorAll( this.options.background );
                for ( i=0; i < children.length; i++ ) {
                    var child = children[i];
                    this.addElementBackgroundImages( child );
                }
            }
        };

        var elementNodeTypes = {
            1: true,
            9: true,
            11: true
        };

        ImagesLoaded.prototype.addElementBackgroundImages = function( elem ) {
            var style = getComputedStyle( elem );
            if ( !style ) {
                // Firefox returns null if in a hidden iframe https://bugzil.la/548397
                return;
            }
            // get url inside url("...")
            var reURL = /url\((['"])?(.*?)\1\)/gi;
            var matches = reURL.exec( style.backgroundImage );
            while ( matches !== null ) {
                var url = matches && matches[2];
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
            var loadingImage = new LoadingImage( img );
            this.images.push( loadingImage );
        };

        ImagesLoaded.prototype.addBackground = function( url, elem ) {
            var background = new Background( url, elem );
            this.images.push( background );
        };

        ImagesLoaded.prototype.check = function() {
            var _this = this;
            this.progressedCount = 0;
            this.hasAnyBroken = false;
            // complete if no images
            if ( !this.images.length ) {
                this.complete();
                return;
            }

            function onProgress( image, elem, message ) {
                // HACK - Chrome triggers event before object properties have changed. #83
                setTimeout( function() {
                    _this.progress( image, elem, message );
                });
            }

            this.images.forEach( function( loadingImage ) {
                loadingImage.once( 'progress', onProgress );
                loadingImage.check();
            });
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
            if ( this.progressedCount == this.images.length ) {
                this.complete();
            }

            if ( this.options.debug && console ) {
                console.log( 'progress: ' + message, image, elem );
            }
        };

        ImagesLoaded.prototype.complete = function() {
            var eventName = this.hasAnyBroken ? 'fail' : 'done';
            this.isComplete = true;
            this.emitEvent( eventName, [ this ] );
            this.emitEvent( 'always', [ this ] );
            if ( this.jqDeferred ) {
                var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
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
            var isComplete = this.getIsImageComplete();
            if ( isComplete ) {
                // report based on naturalWidth
                this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
                return;
            }

            // If none of the checks above matched, simulate loading on detached element.
            this.proxyImage = new Image();
            this.proxyImage.addEventListener( 'load', this );
            this.proxyImage.addEventListener( 'error', this );
            // bind to image as well for Firefox. #191
            this.img.addEventListener( 'load', this );
            this.img.addEventListener( 'error', this );
            this.proxyImage.src = this.img.src;
        };

        LoadingImage.prototype.getIsImageComplete = function() {
            // check for non-zero, non-undefined naturalWidth
            // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
            return this.img.complete && this.img.naturalWidth;
        };

        LoadingImage.prototype.confirm = function( isLoaded, message ) {
            this.isLoaded = isLoaded;
            this.emitEvent( 'progress', [ this, this.img, message ] );
        };

// ----- events ----- //

// trigger specified handler for event type
        LoadingImage.prototype.handleEvent = function( event ) {
            var method = 'on' + event.type;
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
            var isComplete = this.getIsImageComplete();
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
            if ( !jQuery ) {
                return;
            }
            // set local variable
            $ = jQuery;
            // $().imagesLoaded()
            $.fn.imagesLoaded = function( options, callback ) {
                var instance = new ImagesLoaded( this, options, callback );
                return instance.jqDeferred.promise( $(this) );
            };
        };
// try making plugin
        ImagesLoaded.makeJQueryPlugin();

// --------------------------  -------------------------- //

        return ImagesLoaded;

    });

/*!
 * Flickity imagesLoaded v2.0.0
 * enables imagesLoaded option for Flickity
 */

/*jshint browser: true, strict: true, undef: true, unused: true */

( function( window, factory ) {
    // universal module definition
    /*jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
        // AMD
        define( [
            'flickity/js/index',
            'imagesloaded/imagesloaded'
        ], function( Flickity, imagesLoaded ) {
            return factory( window, Flickity, imagesLoaded );
        });
    } else if ( typeof module == 'object' && module.exports ) {
        // CommonJS
        module.exports = factory(
            window,
            require('flickity'),
            require('imagesloaded')
        );
    } else {
        // browser global
        window.Flickity = factory(
            window,
            window.Flickity,
            window.imagesLoaded
        );
    }

}( window, function factory( window, Flickity, imagesLoaded ) {
    'use strict';

    Flickity.createMethods.push('_createImagesLoaded');

    var proto = Flickity.prototype;

    proto._createImagesLoaded = function() {
        this.on( 'activate', this.imagesLoaded );
    };

    proto.imagesLoaded = function() {
        if ( !this.options.imagesLoaded ) {
            return;
        }
        var _this = this;
        function onImagesLoadedProgress( instance, image ) {
            var cell = _this.getParentCell( image.img );
            _this.cellSizeChange( cell && cell.element );
            if ( !_this.options.freeScroll ) {
                _this.positionSliderAtSelected();
            }
        }
        imagesLoaded( this.slider ).on( 'progress', onImagesLoadedProgress );
    };

    return Flickity;

}));
﻿/*!
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


﻿/*!
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











/* Initializers */
var carousel = document.querySelector('.client-testimonials');
var flkty = new Flickity(carousel, {
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


var elemMasonry = document.querySelector('.masonry-grid');
var msnry = new Masonry( elemMasonry, {
    // options
    itemSelector: '.masonry-grid-item',
    fitWith: true,
    columnWidth: 414.66,
    gutter: 15,
    transitionDuration: '0.2s',
    stagger: 30
});