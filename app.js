(() => {
    const courses = typeof COURSE_DATA !== 'undefined' && Array.isArray(COURSE_DATA) ? COURSE_DATA : [];

    const dom = {
        screens: Array.from(document.querySelectorAll('[data-screen]')),
        budgetInput: document.querySelector('[data-budget-input]'),
        selectedBudget: document.querySelector('[data-selected-budget]'),
        budgetForm: document.querySelector('[data-budget-form]'),
        budgetButtons: Array.from(document.querySelectorAll('[data-budget]')),
        openSavedButton: document.querySelector('[data-open-saved]'),
        listMenu: document.querySelector('[data-list-menu]'),
        listMenuCloseButton: document.querySelector('[data-list-menu-close]'),
        listMenuItems: Array.from(document.querySelectorAll('[data-menu-action]')),
        homeCourseGrid: document.querySelector('[data-home-course-grid]'),
        browseCourseGrid: document.querySelector('[data-browse-course-grid]'),
        resultCourseGrid: document.querySelector('[data-result-course-grid]'),
        savedCourseLists: Array.from(document.querySelectorAll('[data-saved-course-list]')),
        savedEmptyMessages: Array.from(document.querySelectorAll('[data-saved-empty]')),
        savedCounts: Array.from(document.querySelectorAll('[data-saved-count]')),
        guideScreen: document.querySelector('[data-guide-screen]'),
        guideCloseButton: document.querySelector('[data-guide-close]'),
        guideSaveButton: document.querySelector('[data-guide-save]'),
        guideTitle: document.querySelector('.guide-title'),
        guideFlow: document.querySelector('[data-guide-flow]'),
        guideMap: document.querySelector('[data-guide-map]'),
        guideMapPlaceholder: document.querySelector('[data-guide-map-placeholder]'),
    };

    const DEFAULT_BUDGET_TEXT = '10,000원';
    const SAVED_COURSES_KEY = 'manwon-date.savedCourses';
    const SAVE_MESSAGE_DURATION_MS = 5000;
    const SAVE_MESSAGE_FADE_MS = 450;
    const saveMessageTimers = new WeakMap();
    let guideReturnScreen = 'result';

    const escapeHTML = (value = '') => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const formatBudget = (value) => {
        const digits = String(value || '').replace(/[^0-9]/g, '');
        if (!digits) return DEFAULT_BUDGET_TEXT;
        return `${Number(digits).toLocaleString('ko-KR')}원`;
    };

    const getCourseById = (courseId) => courses.find((course) => course.id === courseId) || null;
    const getResultCards = () => Array.from(document.querySelectorAll('[data-screen="result"] [data-course-card]'));
    const getCourseCard = (trigger) => trigger?.closest('[data-course-card]') || getResultCards()[0] || null;
    const getCourseFromTrigger = (trigger) => {
        const triggerCourseId = trigger?.dataset.courseId || trigger?.closest('[data-course-id]')?.dataset.courseId;
        if (triggerCourseId) return getCourseById(triggerCourseId) || courses[0] || null;
        const card = getCourseCard(trigger);
        return getCourseById(card?.dataset.courseId) || courses[0] || null;
    };
    const getScreenFromTrigger = (trigger) => trigger?.closest('[data-screen]')?.dataset.screen || 'result';

    const getMapCourseId = (fallback = '') => fallback || getResultCards()[0]?.dataset.courseId || courses[0]?.id || '';

    const setMapPlaceholder = (message) => {
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `<div class="map-placeholder">${escapeHTML(message)}</div>`;
        }
    };

    const initMap = async (courseId = '') => {
        const mapContainer = document.getElementById('map');
        const course = getCourseById(getMapCourseId(courseId));
        if (!mapContainer || !course) return;

        if (!window.kakao?.maps?.services) {
            setMapPlaceholder('📍 지도 API를 불러오는 중입니다.');
            return;
        }

        const placeNames = (course.places || [])
            .map((place) => place.mapName || place.name)
            .filter(Boolean);
        if (placeNames.length === 0) {
            setMapPlaceholder('📍 지도에 표시할 장소 정보가 없어요.');
            return;
        }

        setMapPlaceholder('📍 선택한 코스 지도를 불러오는 중입니다.');
        const places = new window.kakao.maps.services.Places();
        const searchResults = await Promise.all(placeNames.map((placeName) => new Promise((resolve) => {
            places.keywordSearch(placeName, (data, status) => {
                const matchedPlace = status === window.kakao.maps.services.Status.OK ? data[0] : null;
                resolve(matchedPlace ? { title: placeName, lat: matchedPlace.y, lng: matchedPlace.x } : null);
            });
        })));
        const mapSpots = searchResults.filter(Boolean);

        if (mapSpots.length === 0) {
            setMapPlaceholder('📍 좌표를 찾지 못했어요. 장소명을 확인해 주세요.');
            return;
        }

        mapContainer.innerHTML = '';
        const map = new window.kakao.maps.Map(mapContainer, {
            center: new window.kakao.maps.LatLng(mapSpots[0].lat, mapSpots[0].lng),
            level: 4,
        });
        const bounds = new window.kakao.maps.LatLngBounds();
        const linePath = mapSpots.map((spot) => {
            const position = new window.kakao.maps.LatLng(spot.lat, spot.lng);
            bounds.extend(position);
            new window.kakao.maps.Marker({ map, position, title: spot.title });
            return position;
        });

        if (linePath.length > 1) {
            new window.kakao.maps.Polyline({
                path: linePath,
                strokeWeight: 4,
                strokeColor: '#ff6e87',
                strokeOpacity: 0.8,
                strokeStyle: 'solid',
            }).setMap(map);
            map.setBounds(bounds);
        }
    };

    const getCourseMeta = (course) => [course.duration, course.transport].filter(Boolean).join(' · ') || course.meta || '';

    const generatePlacesHTML = (course) => course.places.map((place, index) => {
        const arrow = index < course.places.length - 1 ? '<div class="path-arrow">→</div>' : '';
        return `
            <div class="path-node">
                <div class="node-icon">${escapeHTML(place.icon)}</div>
                <span class="node-name">${escapeHTML(place.name)}</span>
                <span class="node-price">${escapeHTML(place.priceText)}</span>
            </div>
            ${arrow}
        `;
    }).join('');

    const generateCourseCardHTML = (course, variant = 'actions') => {
        const isHome = variant === 'home';
        const actionHTML = isHome
            ? `<button type="button" class="more-btn" data-route="result" data-course-id="${escapeHTML(course.id)}">자세히 보기 &gt;</button>`
            : `<button class="save-btn" type="button" data-save-course data-course-id="${escapeHTML(course.id)}"
                    aria-label="나만의 코스 저장" aria-pressed="false">♡</button>
               <div class="action-stack">
                    <button class="action-btn green-btn" type="button" data-guide-open data-course-id="${escapeHTML(course.id)}">코스 상세 가이드 보기</button>
               </div>
               <p class="save-status" data-save-status aria-live="polite"></p>`;

        return `
            <article class="course-card ${isHome ? '' : 'has-save-action'} ${escapeHTML(course.theme || 'card-green')}" data-course-card
                data-course-id="${escapeHTML(course.id)}" data-price="${Number(course.maxPrice) || 0}">
                <div class="card-top">
                    <span class="price-tag">${escapeHTML(course.priceRange)}</span>
                    <h3>${escapeHTML(course.title)}</h3>
                    <p class="card-desc">${escapeHTML(course.description)}</p>
                    <div class="card-info">${escapeHTML(getCourseMeta(course))}</div>
                </div>
                <div class="course-path">${generatePlacesHTML(course)}</div>
                ${actionHTML}
            </article>
        `;
    };

    const renderCourseCards = () => {
        if (dom.homeCourseGrid) {
            dom.homeCourseGrid.innerHTML = courses.map((course) => generateCourseCardHTML(course, 'home')).join('');
        }
        if (dom.browseCourseGrid) {
            dom.browseCourseGrid.innerHTML = courses.map((course) => generateCourseCardHTML(course, 'actions')).join('');
        }
        if (dom.resultCourseGrid) {
            dom.resultCourseGrid.innerHTML = courses.map((course) => generateCourseCardHTML(course, 'actions')).join('');
        }
    };

    const clearSaveMessageTimers = (target) => {
        const timers = saveMessageTimers.get(target);
        if (!timers) return;
        if (timers.hide) window.clearTimeout(timers.hide);
        if (timers.clear) window.clearTimeout(timers.clear);
        saveMessageTimers.delete(target);
    };

    const setSaveMessage = (message, card = null) => {
        const target = card?.querySelector('[data-save-status]');
        if (!target) return;
        clearSaveMessageTimers(target);
        target.classList.remove('is-visible');

        if (!message) {
            const clear = window.setTimeout(() => {
                target.textContent = '';
                saveMessageTimers.delete(target);
            }, SAVE_MESSAGE_FADE_MS);
            saveMessageTimers.set(target, { clear });
            return;
        }

        target.textContent = message;
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => target.classList.add('is-visible'));
        });

        const hide = window.setTimeout(() => {
            target.classList.remove('is-visible');
            const clear = window.setTimeout(() => {
                target.textContent = '';
                saveMessageTimers.delete(target);
            }, SAVE_MESSAGE_FADE_MS);
            saveMessageTimers.set(target, { clear });
        }, SAVE_MESSAGE_DURATION_MS);
        saveMessageTimers.set(target, { hide });
    };

    const readSavedCourses = () => {
        try {
            const saved = JSON.parse(localStorage.getItem(SAVED_COURSES_KEY) || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    };

    const writeSavedCourses = (nextCourses, card = null) => {
        try {
            localStorage.setItem(SAVED_COURSES_KEY, JSON.stringify(nextCourses));
            return true;
        } catch {
            setSaveMessage('브라우저 저장소를 사용할 수 없어요.', card);
            return false;
        }
    };

    const createSavedCourseItem = (course) => {
        const item = document.createElement('article');
        item.className = 'saved-course-item';
        item.dataset.savedCourseId = course.id;
        item.dataset.courseId = course.id;

        const title = document.createElement('h4');
        title.className = 'saved-course-title';
        title.textContent = course.title || '이름 없는 코스';

        const meta = document.createElement('p');
        meta.className = 'saved-course-meta';
        meta.textContent = [course.description, getCourseMeta(course)].filter(Boolean).join(' · ');

        const route = document.createElement('p');
        route.className = 'saved-course-route';
        const savedPlaces = course.places || course.steps || [];
        route.textContent = savedPlaces.map((place) => place.name).filter(Boolean).join(' → ');

        const footer = document.createElement('div');
        footer.className = 'saved-course-footer';

        const price = document.createElement('span');
        price.className = 'saved-course-price';
        price.textContent = course.priceRange || course.totalPrice || '';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'saved-course-delete';
        deleteButton.type = 'button';
        deleteButton.dataset.deleteSavedCourse = course.id;
        deleteButton.textContent = '삭제';

        const courseButton = document.createElement('button');
        courseButton.className = 'saved-course-guide';
        courseButton.type = 'button';
        courseButton.dataset.guideOpen = '';
        courseButton.dataset.courseId = course.id;
        courseButton.textContent = '코스';

        footer.append(price, courseButton, deleteButton);
        item.append(title, meta, route, footer);
        return item;
    };

    const updateSaveButtons = (savedCourses = readSavedCourses()) => {
        const savedIds = new Set(savedCourses.map((course) => course.id));

        document.querySelectorAll('[data-save-course]').forEach((button) => {
            const courseId = button.dataset.courseId;
            const isSaved = savedIds.has(courseId);
            button.classList.toggle('is-saved', isSaved);
            button.textContent = isSaved ? '♥' : '♡';
            button.setAttribute('aria-label', isSaved ? '저장 완료된 코스' : '나만의 코스 저장');
            button.setAttribute('aria-pressed', String(isSaved));
        });
    };

    const renderSavedCourses = () => {
        const savedCourses = readSavedCourses();

        dom.savedCounts.forEach((count) => {
            count.textContent = `${savedCourses.length}개`;
        });
        dom.savedEmptyMessages.forEach((message) => {
            message.hidden = savedCourses.length > 0;
        });
        dom.savedCourseLists.forEach((list) => {
            list.replaceChildren(...savedCourses.map(createSavedCourseItem));
        });
        updateSaveButtons(savedCourses);
    };

    const saveCourse = (button) => {
        const course = getCourseFromTrigger(button);
        const card = button?.closest('[data-course-card]') || null;
        if (!course) return;

        const savedCourses = readSavedCourses();
        if (savedCourses.some((savedCourse) => savedCourse.id === course.id)) {
            const nextCourses = savedCourses.filter((savedCourse) => savedCourse.id !== course.id);
            if (!writeSavedCourses(nextCourses, card)) return;
            renderSavedCourses();
            setSaveMessage('저장한 코스를 삭제했어요.', card);
            return;
        }

        if (!writeSavedCourses([{ ...course, savedAt: new Date().toISOString() }, ...savedCourses], card)) return;
        renderSavedCourses();
        setSaveMessage('나만의 데이트 코스에 저장했어요.', card);
    };

    const deleteSavedCourse = (courseId) => {
        const nextCourses = readSavedCourses().filter((course) => course.id !== courseId);
        if (!writeSavedCourses(nextCourses)) return;
        renderSavedCourses();
        setSaveMessage('저장한 코스를 삭제했어요.');
    };

    const showScreen = (target, options = {}) => {
        const allowedScreens = ['home', 'courses', 'result', 'saved', 'guide'];
        const next = allowedScreens.includes(target) ? target : 'home';
        dom.screens.forEach((screen) => {
            const isActive = screen.dataset.screen === next;
            screen.hidden = !isActive;
            screen.classList.toggle('hidden', !isActive);
            screen.classList.toggle('is-active', isActive);
            screen.setAttribute('aria-hidden', String(!isActive));
        });
        if (options.updateHash !== false) {
            history.pushState({ screen: next }, '', `#${next}`);
        }
        if (next === 'result' || next === 'saved') renderSavedCourses();
        if (next === 'result') {
            window.setTimeout(() => initMap(getMapCourseId()), 120);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const setListMenuOpen = (isOpen) => {
        if (!dom.listMenu || !dom.openSavedButton) return;
        if (isOpen) {
            dom.listMenu.hidden = false;
            dom.listMenu.classList.remove('hidden');
            dom.listMenu.getBoundingClientRect();
        }
        dom.listMenu.classList.toggle('is-open', isOpen);
        dom.openSavedButton.setAttribute('aria-expanded', String(isOpen));
        if (!isOpen) {
            window.setTimeout(() => {
                dom.listMenu.hidden = true;
                dom.listMenu.classList.add('hidden');
            }, 180);
        }
    };

    const closeListMenu = () => setListMenuOpen(false);

    const scrollToResultCard = (courseId = '') => {
        const targetCard = courseId
            ? getResultCards().find((card) => card.dataset.courseId === courseId)
            : getResultCards()[0];
        if (!targetCard) return;
        const isMobileResultCarousel = window.matchMedia('(max-width: 1023px)').matches;
        targetCard.scrollIntoView({
            behavior: 'smooth',
            block: isMobileResultCarousel ? 'nearest' : 'start',
            inline: isMobileResultCarousel ? 'center' : 'nearest',
        });
    };

    const setGuideTitle = (title) => {
        if (!dom.guideTitle) return;
        dom.guideTitle.replaceChildren(
            document.createTextNode(title),
            document.createElement('br'),
            document.createTextNode('상세 가이드')
        );
    };

    const updateGuideSummary = (course) => {
        const budget = dom.guideScreen?.querySelector('[data-guide-summary="budget"] strong');
        const durationNode = dom.guideScreen?.querySelector('[data-guide-summary="duration"] strong');
        const transportNode = dom.guideScreen?.querySelector('[data-guide-summary="transport"] strong');
        if (budget) budget.textContent = (course.priceRange || '').replace(/^총\s*/, '');
        if (durationNode) durationNode.textContent = course.duration || '정보 없음';
        if (transportNode) transportNode.textContent = course.transport || '정보 없음';
    };

    const createGuideStage = (place, index) => {
        const stage = document.createElement('article');
        stage.className = 'guide-stage';
        stage.dataset.guideStage = `step-${index + 1}`;

        const heading = document.createElement('div');
        heading.className = 'guide-stage-heading';
        const icon = document.createElement('span');
        icon.className = 'guide-stage-icon';
        icon.textContent = place.icon || '📍';
        const copy = document.createElement('div');
        copy.className = 'guide-stage-copy';
        const name = document.createElement('strong');
        name.className = 'guide-stage-name';
        name.textContent = place.name || '코스 단계';
        const price = document.createElement('p');
        price.className = 'guide-stage-price';
        price.textContent = place.priceText || '';
        copy.append(name, price);
        heading.append(icon, copy);

        const text = document.createElement('div');
        text.className = 'guide-stage-desc';
        const desc = document.createElement('span');
        desc.textContent = place.description || (place.priceText === '0원'
            ? '가볍게 둘러보기 좋은 코스입니다.'
            : `${place.priceText} 정도로 즐길 수 있는 코스입니다.`);
        text.append(desc);

        stage.append(heading, text);
        return stage;
    };

    const updateGuideFlow = (course) => {
        if (!dom.guideFlow) return;
        const places = course.places || [];
        dom.guideFlow.replaceChildren(...places.map(createGuideStage));
    };

    const updateGuideMapPlaceholder = (course) => {
        if (!dom.guideMap) return;
        dom.guideMap.dataset.courseId = course.id;
        /*
         * JS 담당자 메모:
         * - data-guide-map 요소를 지도 API mount 대상으로 사용하세요.
         * - 현재 코스 id는 data-course-id에 들어갑니다.
         * - 장소 검색어는 course.places의 mapName || name 값을 사용하면 됩니다.
         */
        if (dom.guideMapPlaceholder) {
            dom.guideMapPlaceholder.textContent = `${course.title} 코스 지도가 여기에 표시됩니다.`;
        }
    };

    const updateGuide = (course) => {
        setGuideTitle(course.title);
        updateGuideSummary(course);
        updateGuideFlow(course);
        updateGuideMapPlaceholder(course);
        if (dom.guideScreen) dom.guideScreen.dataset.courseId = course.id;
        if (dom.guideSaveButton) dom.guideSaveButton.dataset.courseId = course.id;
        updateSaveButtons();
    };

    const openGuideScreen = (button = null) => {
        const course = getCourseFromTrigger(button);
        if (!course || !dom.guideScreen) return;
        guideReturnScreen = getScreenFromTrigger(button);
        updateGuide(course);
        showScreen('guide');
        dom.guideCloseButton?.focus();
    };

    const closeGuideScreen = () => showScreen(guideReturnScreen || 'result');

    const handleMenuAction = (action) => {
        closeListMenu();
        if (action === 'browse') {
            showScreen('courses');
            return;
        }
        if (action === 'saved') {
            showScreen('saved');
            return;
        }
        if (action === 'recommended' || action === 'food') {
            showScreen('result');
            window.setTimeout(scrollToResultCard, 320);
            return;
        }
        if (action === 'guide') {
            showScreen('result');
            window.setTimeout(() => openGuideScreen(getResultCards()[0]?.querySelector('[data-guide-open]')), 320);
        }
    };

    dom.openSavedButton?.addEventListener('click', () => {
        const isOpen = dom.openSavedButton.getAttribute('aria-expanded') === 'true';
        setListMenuOpen(!isOpen);
    });
    dom.listMenuCloseButton?.addEventListener('click', closeListMenu);
    dom.listMenuItems.forEach((item) => {
        item.addEventListener('click', () => handleMenuAction(item.dataset.menuAction));
    });

    dom.budgetButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (!dom.budgetInput) return;
            dom.budgetInput.value = Number(button.dataset.budget).toLocaleString('ko-KR');
            dom.budgetInput.focus();
        });
    });

    dom.budgetForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        if (dom.selectedBudget) dom.selectedBudget.textContent = formatBudget(dom.budgetInput?.value);
        showScreen('result');
    });

    document.addEventListener('click', (event) => {
        const saveButton = event.target.closest('[data-save-course]');
        if (saveButton) {
            event.preventDefault();
            saveCourse(saveButton);
            return;
        }

        const guideButton = event.target.closest('[data-guide-open]');
        if (guideButton) {
            event.preventDefault();
            openGuideScreen(guideButton);
            return;
        }

        const routeButton = event.target.closest('[data-route]');
        if (routeButton) {
            event.preventDefault();
            showScreen(routeButton.dataset.route);
            if (routeButton.dataset.route === 'result' && routeButton.dataset.courseId) {
                window.setTimeout(() => {
                    scrollToResultCard(routeButton.dataset.courseId);
                    initMap(routeButton.dataset.courseId);
                }, 360);
            }
        }
    });

    dom.savedCourseLists.forEach((list) => {
        list.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('[data-delete-saved-course]');
            if (!deleteButton) return;
            deleteSavedCourse(deleteButton.dataset.deleteSavedCourse);
        });
    });

    dom.guideCloseButton?.addEventListener('click', closeGuideScreen);
    document.addEventListener('click', (event) => {
        if (!dom.listMenu || dom.listMenu.hidden) return;
        if (dom.listMenu.contains(event.target) || dom.openSavedButton?.contains(event.target)) return;
        closeListMenu();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && dom.listMenu && !dom.listMenu.hidden) closeListMenu();
        if (event.key === 'Escape' && document.querySelector('[data-screen="guide"].is-active')) closeGuideScreen();
    });

    window.addEventListener('popstate', () => {
        showScreen(location.hash.replace('#', ''), { updateHash: false });
    });

    renderCourseCards();
    renderSavedCourses();
    if (courses[0]) updateGuide(courses[0]);
    showScreen(location.hash.replace('#', ''), { updateHash: false });
})();
