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