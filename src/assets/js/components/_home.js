﻿// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function () {
    var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
    if (menuBtns.length > 0) {
        for (var i = 0; i < menuBtns.length; i++) {
            (function (i) {
                initMenuBtn(menuBtns[i]);
            })(i);
        }

        function initMenuBtn(btn) {
            btn.addEventListener('click', function (event) {
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
(function () {
    var flexHeader = document.getElementsByClassName('js-f-header');
    if (flexHeader.length > 0) {
        var menuTrigger = flexHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
            firstFocusableElement = getMenuFirstFocusable();

        // we'll use these to store the node that needs to receive focus when the mobile menu is closed 
        var focusMenu = false;

        resetFlexHeaderOffset();
        setAriaButtons();

        menuTrigger.addEventListener('anim-menu-btn-clicked', function (event) {
            toggleMenuNavigation(event.detail);
        });

        // listen for key events
        window.addEventListener('keyup', function (event) {
            // listen for esc key
            if ((event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape')) {
                // close navigation on mobile if open
                if (menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
                    focusMenu = menuTrigger; // move focus to menu trigger when menu is close
                    menuTrigger.click();
                }
            }
            // listen for tab key
            if ((event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab')) {
                // close navigation on mobile if open when nav loses focus
                if (menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-f-header')) menuTrigger.click();
            }
        });

        // detect click on a dropdown control button - expand-on-mobile only
        flexHeader[0].addEventListener('click', function (event) {
            var btnLink = event.target.closest('.js-f-header__dropdown-control');
            if (!btnLink) return;
            !btnLink.getAttribute('aria-expanded') ? btnLink.setAttribute('aria-expanded', 'true') : btnLink.removeAttribute('aria-expanded');
        });

        // detect mouseout from a dropdown control button - expand-on-mobile only
        flexHeader[0].addEventListener('mouseout', function (event) {
            var btnLink = event.target.closest('.js-f-header__dropdown-control');
            if (!btnLink) return;
            // check layout type
            if (getLayout() == 'mobile') return;
            btnLink.removeAttribute('aria-expanded');
        });

        // close dropdown on focusout - expand-on-mobile only
        flexHeader[0].addEventListener('focusin', function (event) {
            var btnLink = event.target.closest('.js-f-header__dropdown-control'),
                dropdown = event.target.closest('.f-header__dropdown');
            if (dropdown) return;
            if (btnLink && btnLink.hasAttribute('aria-expanded')) return;
            // check layout type
            if (getLayout() == 'mobile') return;
            var openDropdown = flexHeader[0].querySelector('.js-f-header__dropdown-control[aria-expanded="true"]');
            if (openDropdown) openDropdown.removeAttribute('aria-expanded');
        });

        // listen for resize
        var resizingId = false;
        window.addEventListener('resize', function () {
            clearTimeout(resizingId);
            resizingId = setTimeout(doneResizing, 500);
        });

        function getMenuFirstFocusable() {
            var focusableEle = flexHeader[0].getElementsByClassName('f-header__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
                firstFocusable = false;
            for (var i = 0; i < focusableEle.length; i++) {
                if (focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length) {
                    firstFocusable = focusableEle[i];
                    break;
                }
            }

            return firstFocusable;
        }

        function isVisible(element) {
            return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        }

        function doneResizing() {
            if (!isVisible(menuTrigger) && Util.hasClass(flexHeader[0], 'f-header--expanded')) {
                menuTrigger.click();
            }
            resetFlexHeaderOffset();
        }

        function toggleMenuNavigation(bool) { // toggle menu visibility on small devices
            Util.toggleClass(document.getElementsByClassName('f-header__nav')[0], 'f-header__nav--is-visible', bool);
            Util.toggleClass(flexHeader[0], 'f-header--expanded', bool);
            menuTrigger.setAttribute('aria-expanded', bool);
            if (bool) firstFocusableElement.focus(); // move focus to first focusable element
            else if (focusMenu) {
                focusMenu.focus();
                focusMenu = false;
            }
        }

        function resetFlexHeaderOffset() {
            // on mobile -> update max height of the flexi header based on its offset value (e.g., if there's a fixed pre-header element)
            document.documentElement.style.setProperty('--f-header-offset', flexHeader[0].getBoundingClientRect().top + 'px');
        }

        function setAriaButtons() {
            var btnDropdown = flexHeader[0].getElementsByClassName('js-f-header__dropdown-control');
            for (var i = 0; i < btnDropdown.length; i++) {
                var id = 'f-header-dropdown-' + i,
                    dropdown = btnDropdown[i].nextElementSibling;
                if (dropdown.hasAttribute('id')) {
                    id = dropdown.getAttribute('id');
                } else {
                    dropdown.setAttribute('id', id);
                }
                btnDropdown[i].setAttribute('aria-controls', id);
            }
        }

        function getLayout() {
            return getComputedStyle(flexHeader[0], ':before').getPropertyValue('content').replace(/\'|"/g, '');
        }
    }
}());

// File#: _1_back-to-top
// Usage: codyhouse.co/license
(function () {
    let backTop = document.getElementsByClassName('js-back-to-top')[0];
    if (backTop) {
        let dataElement = backTop.getAttribute('data-element');
        let scrollElement = dataElement ? document.querySelector(dataElement) : window;
        let scrollOffsetInit = parseInt(backTop.getAttribute('data-offset-in')) || parseInt(backTop.getAttribute('data-offset')) || 0, //show back-to-top if scrolling > scrollOffset
            scrollOffsetOutInit = parseInt(backTop.getAttribute('data-offset-out')) || 0,
            scrollOffset = 0,
            scrollOffsetOut = 0,
            scrolling = false;

        // check if target-in/target-out have been set
        var targetIn = backTop.getAttribute('data-target-in') ? document.querySelector(backTop.getAttribute('data-target-in')) : false,
            targetOut = backTop.getAttribute('data-target-out') ? document.querySelector(backTop.getAttribute('data-target-out')) : false;

        updateOffsets();

        //detect click on back-to-top link
        backTop.addEventListener('click', function (event) {
            event.preventDefault();
            if (!window.requestAnimationFrame) {
                scrollElement.scrollTo(0, 0);
            } else {
                dataElement ? scrollElement.scrollTo({top: 0, behavior: 'smooth'}) : window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            //move the focus to the #top-element - don't break keyboard navigation
            moveFocus(document.getElementById(backTop.getAttribute('href').replace('#', '')));
        });

        //listen to the window scroll and update back-to-top visibility
        checkBackToTop();
        if (scrollOffset > 0 || scrollOffsetOut > 0) {
            scrollElement.addEventListener("scroll", function (event) {
                if (!scrolling) {
                    scrolling = true;
                    (!window.requestAnimationFrame) ? setTimeout(function () {
                        checkBackToTop();
                    }, 250) : window.requestAnimationFrame(checkBackToTop);
                }
            });
        }

        function checkBackToTop() {
            updateOffsets();
            let windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
            if (!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
            let condition = windowTop >= scrollOffset;
            if (scrollOffsetOut > 0) {
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
            let offset = 0;
            if (target) {
                var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
                if (!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
                var boundingClientRect = target.getBoundingClientRect();
                offset = bool ? boundingClientRect.bottom : boundingClientRect.top;
                offset = offset + windowTop;
            }
            if (startOffset && startOffset) {
                offset = offset + parseInt(startOffset);
            }
            return offset;
        }

        function moveFocus(element) {
            if (!element) element = document.getElementsByTagName("body")[0];
            element.focus();
            if (document.activeElement !== element) {
                element.setAttribute('tabindex', '-1');
                element.focus();
            }
        }
    }
}());

/*** Update copyright yearly ***/
// document.getElementById("date").innerHTML = new Date().getFullYear().toString();