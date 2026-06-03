(() => {
    const courses = typeof COURSE_DATA !== 'undefined' && Array.isArray(COURSE_DATA) ? COURSE_DATA : [];

    const dom = {
        screens: Array.from(document.querySelectorAll('[data-screen]')),
        budgetInput: document.querySelector('[data-budget-input]'),
        budgetTotal: document.querySelector('[data-budget-total]'),
        selectedBudget: document.querySelector('[data-selected-budget]'),
        budgetForm: document.querySelector('[data-budget-form]'),
        budgetResetButton: document.querySelector('[data-budget-reset]'),
        budgetAddButtons: Array.from(document.querySelectorAll('[data-budget-add]')),
        openSavedButton: document.querySelector('[data-open-saved]'),
        listMenu: document.querySelector('[data-list-menu]'),
        listMenuCloseButton: document.querySelector('[data-list-menu-close]'),
        listMenuItems: Array.from(document.querySelectorAll('[data-menu-action]')),
        homeCourseGrid: document.querySelector('[data-home-course-grid]'),
        homeCarouselPrev: document.querySelector('[data-home-carousel-prev]'),
        homeCarouselNext: document.querySelector('[data-home-carousel-next]'),
        homeCarouselTrack: document.querySelector('[data-home-carousel-track]'),
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
    const DEFAULT_BUDGET_VALUE = 10000;
    const RESULT_COURSE_LIMIT = 4;
    const HOME_PREVIEW_LIMIT = 3;
    const HOME_CAROUSEL_TRANSITION_MS = 320;
    const SAVED_COURSES_KEY = 'manwon-date.savedCourses';
    const SAVE_MESSAGE_DURATION_MS = 5000;
    const SAVE_MESSAGE_FADE_MS = 450;
    const saveMessageTimers = new WeakMap();
    let guideReturnScreen = 'result';
    let resultRecommendSeed = 0;
    let resultFocusCourseId = '';
    let homeCarouselPage = 0;
    let homeCarouselAnimating = false;

    const escapeHTML = (value = '') => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const parseBudgetNumber = (value) => {
        const digits = String(value || '').replace(/[^0-9]/g, '');
        return digits ? Number(digits) : 0;
    };

    const formatBudget = (value) => {
        const amount = typeof value === 'number' ? value : parseBudgetNumber(value);
        if (!amount) return DEFAULT_BUDGET_TEXT;
        return `${amount.toLocaleString('ko-KR')}원`;
    };

    const setBudgetInputValue = (amount) => {
        if (!dom.budgetInput) return;
        dom.budgetInput.value = amount > 0 ? amount.toLocaleString('ko-KR') : '';
        updateBudgetTotalDisplay();
    };

    const updateBudgetTotalDisplay = () => {
        const amount = parseBudgetNumber(dom.budgetInput?.value);
        if (dom.budgetTotal) {
            dom.budgetTotal.textContent = amount > 0 ? formatBudget(amount) : '0원';
        }
    };

    const getActiveBudget = () => {
        const amount = parseBudgetNumber(dom.budgetInput?.value);
        return amount > 0 ? amount : DEFAULT_BUDGET_VALUE;
    };

    const getCoursesForResult = () => {
        const budget = getActiveBudget();
        const scored = courses.map((course) => ({
            course,
            diff: Math.abs((Number(course.maxPrice) || 0) - budget),
            fitsBudget: (Number(course.maxPrice) || 0) <= budget + 5000,
        }));

        const fitsBudget = scored.filter((item) => item.fitsBudget);
        const pool = fitsBudget.length > 0 ? fitsBudget : scored;

        const tiers = new Map();
        pool.forEach((item) => {
            if (!tiers.has(item.diff)) tiers.set(item.diff, []);
            tiers.get(item.diff).push(item);
        });

        const rotateTier = (tierItems, offset) => {
            if (tierItems.length <= 1) return tierItems;
            const start = offset % tierItems.length;
            return [...tierItems.slice(start), ...tierItems.slice(0, start)];
        };

        const ordered = [...tiers.keys()]
            .sort((left, right) => left - right)
            .flatMap((diff, tierIndex) => rotateTier(tiers.get(diff), budget + resultRecommendSeed + tierIndex * 7));

        const selected = [];
        const usedIds = new Set();
        ordered.forEach((item) => {
            if (selected.length >= RESULT_COURSE_LIMIT) return;
            if (usedIds.has(item.course.id)) return;
            usedIds.add(item.course.id);
            selected.push(item.course);
        });

        if (selected.length < RESULT_COURSE_LIMIT) {
            courses.forEach((course) => {
                if (selected.length >= RESULT_COURSE_LIMIT) return;
                if (usedIds.has(course.id)) return;
                usedIds.add(course.id);
                selected.push(course);
            });
        }

        if (resultFocusCourseId) {
            const focusCourse = getCourseById(resultFocusCourseId);
            if (focusCourse) {
                const withoutFocus = selected.filter((course) => course.id !== focusCourse.id);
                return [focusCourse, ...withoutFocus].slice(0, RESULT_COURSE_LIMIT);
            }
        }

        return selected;
    };

    const openResultForCourse = (courseId = '') => {
        const course = getCourseById(courseId);
        if (!course) return;

        resultRecommendSeed += 1;
        resultFocusCourseId = course.id;
        const budget = Number(course.maxPrice) || DEFAULT_BUDGET_VALUE;
        setBudgetInputValue(budget);
        if (dom.selectedBudget) dom.selectedBudget.textContent = formatBudget(budget);
        renderCourseCards();
        resultFocusCourseId = '';
        showScreen('result');
        window.setTimeout(() => {
            initMap(course.id);
            scrollToResultCard(course.id);
        }, 360);
    };
    const parseBudget = (value) => Number(String(value || '').replace(/[^0-9]/g, '')) || 0;

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

    const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };
    const SEOUL_BOUNDS = { minLat: 37.41, maxLat: 37.72, minLng: 126.74, maxLng: 127.2 };
    const MAP_SEARCH_RADIUS_M = 18000;
    const MAP_NEARBY_RADIUS_M = 4500;
    const MAX_ROUTE_LEG_KM = 6;

    const isInSeoulMetro = (lat, lng) => (
        lat >= SEOUL_BOUNDS.minLat
        && lat <= SEOUL_BOUNDS.maxLat
        && lng >= SEOUL_BOUNDS.minLng
        && lng <= SEOUL_BOUNDS.maxLng
    );

    const distanceKm = (left, right) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const dLat = toRad(right.lat - left.lat);
        const dLng = toRad(right.lng - left.lng);
        const a = Math.sin(dLat / 2) ** 2
            + Math.cos(toRad(left.lat)) * Math.cos(toRad(right.lat)) * Math.sin(dLng / 2) ** 2;
        return 6371 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    };

    const inferMapArea = (course) => {
        if (course.mapArea) return course.mapArea;
        const text = `${course.title} ${course.description}`;
        const areaRules = [
            ['망원', '망원'],
            ['홍제', '홍제'],
            ['성산', '마포 성산'],
            ['합정', '합정'],
            ['연남', '연남동'],
            ['서교', '서교동'],
            ['홍대', '홍대'],
            ['양화', '양화'],
            ['마포', '마포'],
        ];
        const matched = areaRules.find(([keyword]) => text.includes(keyword));
        return matched ? matched[1] : '서울';
    };

    const buildMapSearchQueries = (place, mapArea) => {
        const base = (place.mapName || place.name || '').trim();
        const queries = [base];
        const hasRegionHint = /서울|마포|홍대|연남|합정|망원|홍제|서교|양화|구 |동 |역/.test(base);
        if (!hasRegionHint) {
            queries.push(`${base} ${mapArea}`);
            queries.push(`${base} 서울 ${mapArea}`);
        }
        return [...new Set(queries.filter(Boolean))];
    };

    const pickMapSearchResult = (results, anchor) => {
        const candidates = (results || [])
            .map((item) => ({
                lat: Number.parseFloat(item.y),
                lng: Number.parseFloat(item.x),
                placeName: item.place_name,
            }))
            .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
            .filter((item) => isInSeoulMetro(item.lat, item.lng));

        if (!candidates.length) return null;

        if (!anchor) {
            return candidates
                .map((item) => ({ ...item, dist: distanceKm(SEOUL_CENTER, item) }))
                .sort((left, right) => left.dist - right.dist)[0];
        }

        return candidates
            .map((item) => ({ ...item, dist: distanceKm(anchor, item) }))
            .filter((item) => item.dist <= MAX_ROUTE_LEG_KM)
            .sort((left, right) => left.dist - right.dist)[0] || null;
    };

    const keywordSearchPlaces = (placesService, keyword, anchor) => new Promise((resolve) => {
        const center = anchor
            ? new window.kakao.maps.LatLng(anchor.lat, anchor.lng)
            : new window.kakao.maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng);
        const radius = anchor ? MAP_NEARBY_RADIUS_M : MAP_SEARCH_RADIUS_M;

        placesService.keywordSearch(keyword, (data, status) => {
            if (status !== window.kakao.maps.services.Status.OK) {
                resolve([]);
                return;
            }
            resolve(data || []);
        }, { location: center, radius });
    });

    const resolveMapSpot = async (placesService, place, mapArea, anchor) => {
        const queries = buildMapSearchQueries(place, mapArea);
        for (const query of queries) {
            const results = await keywordSearchPlaces(placesService, query, anchor);
            const picked = pickMapSearchResult(results, anchor);
            if (picked) {
                return {
                    title: place.name || place.mapName || query,
                    lat: picked.lat,
                    lng: picked.lng,
                    placeName: picked.placeName,
                };
            }
        }
        return null;
    };

    const setMapPlaceholder = (mapContainer, message) => {
        if (!mapContainer) return;
        mapContainer.innerHTML = `<div class="map-placeholder">${escapeHTML(message)}</div>`;
    };

    const renderCourseMap = async (mapContainer, courseId = '') => {
        const course = getCourseById(courseId || getMapCourseId(courseId));
        if (!mapContainer || !course) return;

        if (!window.kakao?.maps?.services) {
            setMapPlaceholder(mapContainer, '📍 지도 API를 불러오는 중입니다.');
            return;
        }

        const coursePlaces = (course.places || []).filter((place) => place.mapName || place.name);
        if (coursePlaces.length === 0) {
            setMapPlaceholder(mapContainer, '📍 지도에 표시할 장소 정보가 없어요.');
            return;
        }

        setMapPlaceholder(mapContainer, '📍 선택한 코스 지도를 불러오는 중입니다.');
        const placesService = new window.kakao.maps.services.Places();
        const mapArea = inferMapArea(course);
        const mapSpots = [];
        let anchor = null;

        for (const place of coursePlaces) {
            const spot = await resolveMapSpot(placesService, place, mapArea, anchor);
            if (!spot) continue;
            mapSpots.push(spot);
            anchor = { lat: spot.lat, lng: spot.lng };
        }

        if (mapSpots.length === 0) {
            setMapPlaceholder(mapContainer, '📍 서울 지역 장소를 찾지 못했어요. 장소명을 확인해 주세요.');
            return;
        }

        mapContainer.innerHTML = '';
        const map = new window.kakao.maps.Map(mapContainer, {
            center: new window.kakao.maps.LatLng(mapSpots[0].lat, mapSpots[0].lng),
            level: 5,
        });
        const bounds = new window.kakao.maps.LatLngBounds();
        const routeSegments = [];

        mapSpots.forEach((spot, index) => {
            const position = new window.kakao.maps.LatLng(spot.lat, spot.lng);
            bounds.extend(position);
            new window.kakao.maps.Marker({ map, position, title: spot.placeName || spot.title });
            const labelHTML = `<div class="map-marker-label"><span class="map-marker-index">${index + 1}</span>${escapeHTML(spot.title)}</div>`;
            new window.kakao.maps.CustomOverlay({
                map,
                position,
                content: labelHTML,
                yAnchor: 2.4,
            });

            if (index === 0) {
                routeSegments.push([position]);
                return;
            }

            const legKm = distanceKm(mapSpots[index - 1], spot);
            if (legKm <= MAX_ROUTE_LEG_KM) {
                routeSegments[routeSegments.length - 1].push(position);
            } else {
                routeSegments.push([position]);
            }
        });

        routeSegments.forEach((segment) => {
            if (segment.length < 2) return;
            new window.kakao.maps.Polyline({
                path: segment,
                strokeWeight: 4,
                strokeColor: '#ff6e87',
                strokeOpacity: 0.8,
                strokeStyle: 'solid',
            }).setMap(map);
        });

        map.setBounds(bounds);
    };

    const initMap = (courseId = '') => renderCourseMap(document.getElementById('map'), getMapCourseId(courseId));

    const initGuideMap = (courseId = '') => {
        if (!dom.guideMap) return;
        dom.guideMapPlaceholder?.remove();
        renderCourseMap(dom.guideMap, courseId || dom.guideMap.dataset.courseId);
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

    const generateCourseCardHTML = (course, variant = 'actions', options = {}) => {
        const isHome = variant === 'home';
        const isResultPrimary = options.resultRole === 'primary';
        const isResultRecommend = options.resultRole === 'recommend';
        const badgeHTML = isResultRecommend
            ? '<span class="course-badge course-badge-recommend">추천</span>'
            : isResultPrimary
                ? '<span class="course-badge course-badge-primary">예산 맞춤</span>'
                : '';
        const titleHTML = isHome || variant === 'actions'
            ? `<button type="button" class="course-title-btn" data-result-open data-course-id="${escapeHTML(course.id)}">${escapeHTML(course.title)}</button>`
            : escapeHTML(course.title);
        const actionHTML = isHome
            ? `<button type="button" class="more-btn" data-guide-open data-course-id="${escapeHTML(course.id)}">자세히 보기 &gt;</button>`
            : `<div class="card-actions-footer">
                    <button class="save-btn-inline" type="button" data-save-course data-course-id="${escapeHTML(course.id)}"
                        aria-label="나만의 코스 저장" aria-pressed="false">
                        <span class="save-btn-icon" aria-hidden="true">♡</span>
                        <span class="save-btn-text">저장</span>
                    </button>
                    <button class="action-btn green-btn" type="button" data-guide-open data-course-id="${escapeHTML(course.id)}">자세히 보기</button>
               </div>
               <p class="save-status" data-save-status aria-live="polite"></p>`;

        return `
            <article class="course-card ${isHome ? '' : 'has-card-actions'} ${isResultPrimary ? 'is-result-primary' : ''} ${isResultRecommend ? 'is-result-recommend' : ''} ${escapeHTML(course.theme || 'card-green')}" data-course-card
                data-course-id="${escapeHTML(course.id)}" data-price="${Number(course.maxPrice) || 0}">
                ${badgeHTML}
                <div class="card-top">
                    <span class="price-tag">${escapeHTML(course.priceRange)}</span>
                    <h3 class="course-title">${titleHTML}</h3>
                    <p class="card-desc">${escapeHTML(course.description)}</p>
                    <div class="card-info">${escapeHTML(getCourseMeta(course))}</div>
                </div>
                <div class="course-path">${generatePlacesHTML(course)}</div>
                ${actionHTML}
            </article>
        `;
    };

    const getHomeCarouselPageCount = () => Math.max(1, Math.ceil(courses.length / HOME_PREVIEW_LIMIT));

    const getHomePreviewCourses = (page = homeCarouselPage) => {
        const pageCount = getHomeCarouselPageCount();
        const safePage = ((page % pageCount) + pageCount) % pageCount;
        const start = safePage * HOME_PREVIEW_LIMIT;
        return courses.slice(start, start + HOME_PREVIEW_LIMIT);
    };

    const renderHomePreviewCarousel = () => {
        if (!dom.homeCourseGrid) return;
        const pageCount = getHomeCarouselPageCount();
        homeCarouselPage = ((homeCarouselPage % pageCount) + pageCount) % pageCount;
        dom.homeCourseGrid.innerHTML = getHomePreviewCourses(homeCarouselPage)
            .map((course) => generateCourseCardHTML(course, 'home'))
            .join('');
    };

    const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const clearHomeCarouselMotionClasses = () => {
        dom.homeCarouselTrack?.classList.remove(
            'is-carousel-exit-next',
            'is-carousel-exit-prev',
            'is-carousel-enter-next',
            'is-carousel-enter-prev',
            'is-carousel-enter-active'
        );
    };

    const shiftHomeCarousel = (direction) => {
        const pageCount = getHomeCarouselPageCount();
        if (pageCount <= 1 || homeCarouselAnimating) return;

        const applyPageChange = () => {
            homeCarouselPage = (homeCarouselPage + direction + pageCount) % pageCount;
            renderHomePreviewCarousel();
        };

        const track = dom.homeCarouselTrack;
        if (!track || prefersReducedMotion()) {
            applyPageChange();
            return;
        }

        homeCarouselAnimating = true;
        clearHomeCarouselMotionClasses();

        const exitClass = direction > 0 ? 'is-carousel-exit-next' : 'is-carousel-exit-prev';
        const enterClass = direction > 0 ? 'is-carousel-enter-next' : 'is-carousel-enter-prev';

        let enterFinished = false;
        const finishEnter = () => {
            if (enterFinished) return;
            enterFinished = true;
            track.classList.remove(enterClass, 'is-carousel-enter-active');
            homeCarouselAnimating = false;
        };

        let exitFinished = false;
        const startEnter = () => {
            if (exitFinished) return;
            exitFinished = true;
            track.classList.remove(exitClass);
            applyPageChange();
            track.classList.add(enterClass);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => track.classList.add('is-carousel-enter-active'));
            });
            window.setTimeout(finishEnter, HOME_CAROUSEL_TRANSITION_MS + 80);
        };

        track.classList.add(exitClass);
        window.setTimeout(startEnter, HOME_CAROUSEL_TRANSITION_MS);
    };

    const renderCourseCards = () => {
        renderHomePreviewCarousel();
        if (dom.browseCourseGrid) {
            dom.browseCourseGrid.innerHTML = courses.map((course) => generateCourseCardHTML(course, 'actions')).join('');
        }
        if (dom.resultCourseGrid) {
            dom.resultCourseGrid.innerHTML = getCoursesForResult()
                .map((course, index) => generateCourseCardHTML(course, 'actions', {
                    resultRole: index === 0 ? 'primary' : 'recommend',
                }))
                .join('');
        }
        updateSaveButtons();
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

    const createSavedCourseItem = (course, context = 'result') => {
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

        const actions = document.createElement('div');
        actions.className = 'saved-course-actions';

        const detailButton = document.createElement('button');
        detailButton.className = 'saved-course-detail';
        detailButton.type = 'button';
        detailButton.dataset.guideOpen = '';
        detailButton.dataset.courseId = course.id;
        detailButton.textContent = '자세히 보기';

        const guideButton = document.createElement('button');
        guideButton.className = 'saved-course-guide';
        guideButton.type = 'button';
        guideButton.dataset.guideOpen = '';
        guideButton.dataset.courseId = course.id;
        guideButton.textContent = '상세 가이드';

        const viewResultButton = document.createElement('button');
        viewResultButton.className = 'saved-course-result';
        viewResultButton.type = 'button';
        viewResultButton.dataset.route = 'result';
        viewResultButton.dataset.courseId = course.id;
        viewResultButton.textContent = '결과에서 보기';

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

        if (context === 'saved') {
            actions.append(detailButton, guideButton, viewResultButton);
            footer.append(price, deleteButton);
            item.append(title, meta, route, actions, footer);
            return item;
        }

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
            const icon = button.querySelector('.save-btn-icon');
            const text = button.querySelector('.save-btn-text');
            if (icon) icon.textContent = isSaved ? '♥' : '♡';
            if (text) text.textContent = isSaved ? '저장됨' : '저장';
            if (!icon && !text) button.textContent = isSaved ? '♥' : '♡';
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
            const context = list.closest('[data-screen="saved"]') ? 'saved' : 'result';
            list.replaceChildren(...savedCourses.map((course) => createSavedCourseItem(course, context)));
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
        if (dom.guideMapPlaceholder) {
            dom.guideMapPlaceholder.textContent = `${course.title} 코스 지도를 불러오는 중입니다.`;
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
        window.setTimeout(() => initGuideMap(course.id), 120);
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

    dom.budgetAddButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const addAmount = Number(button.dataset.budgetAdd) || 0;
            setBudgetInputValue(parseBudgetNumber(dom.budgetInput?.value) + addAmount);
            dom.budgetInput?.focus();
        });
    });

    dom.budgetResetButton?.addEventListener('click', () => {
        setBudgetInputValue(0);
        dom.budgetInput?.focus();
    });

    dom.budgetInput?.addEventListener('input', updateBudgetTotalDisplay);

    dom.homeCarouselPrev?.addEventListener('click', () => shiftHomeCarousel(-1));
    dom.homeCarouselNext?.addEventListener('click', () => shiftHomeCarousel(1));

    dom.budgetForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        resultRecommendSeed += 1;
        resultFocusCourseId = '';
        const budget = getActiveBudget();
        setBudgetInputValue(budget);
        if (dom.selectedBudget) dom.selectedBudget.textContent = formatBudget(budget);
        renderCourseCards();
        showScreen('result');
        window.setTimeout(() => {
            initMap(getCoursesForResult()[0]?.id);
            scrollToResultCard(getCoursesForResult()[0]?.id);
        }, 360);
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

        const resultOpenButton = event.target.closest('[data-result-open]');
        if (resultOpenButton) {
            event.preventDefault();
            openResultForCourse(resultOpenButton.dataset.courseId);
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

    setBudgetInputValue(DEFAULT_BUDGET_VALUE);
    renderCourseCards();
    renderSavedCourses();
    if (courses[0]) updateGuide(courses[0]);
    showScreen(location.hash.replace('#', ''), { updateHash: false });
})();
