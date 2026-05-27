(() => {
    // DOM hooks: HTML에 직접 적은 코스 카드와 화면 상태를 JS가 읽는 연결 지점입니다.
    const dom = {
        screens: Array.from(document.querySelectorAll('[data-screen]')),
        budgetInput: document.querySelector('[data-budget-input]'),
        selectedBudget: document.querySelector('[data-selected-budget]'),
        budgetForm: document.querySelector('[data-budget-form]'),
        routeButtons: Array.from(document.querySelectorAll('[data-route]')),
        budgetButtons: Array.from(document.querySelectorAll('[data-budget]')),
        openSavedButton: document.querySelector('[data-open-saved]'),
        listMenu: document.querySelector('[data-list-menu]'),
        listMenuCloseButton: document.querySelector('[data-list-menu-close]'),
        listMenuItems: Array.from(document.querySelectorAll('[data-menu-action]')),
        resultCourseCards: Array.from(document.querySelectorAll('[data-screen="result"] [data-course-card]')),
        savedCoursesPanels: Array.from(document.querySelectorAll('[data-saved-courses-panel]')),
        savedCourseLists: Array.from(document.querySelectorAll('[data-saved-course-list]')),
        savedEmptyMessages: Array.from(document.querySelectorAll('[data-saved-empty]')),
        savedCounts: Array.from(document.querySelectorAll('[data-saved-count]')),
        guideModal: document.querySelector('[data-guide-modal]'),
        guideCloseButton: document.querySelector('[data-guide-close]'),
        guideTitle: document.querySelector('.guide-title'),
        guideFlow: document.querySelector('[data-guide-flow]'),
        guideImage: document.querySelector('.guide-detail-image'),
    };

    const DEFAULT_BUDGET_TEXT = '10,000원';
    const GUIDE_TRANSITION_MS = 240;
    const SAVED_COURSES_KEY = 'manwon-date.savedCourses';
    const DEFAULT_GUIDE_IMAGE = '웹 사이트 메인화면 일러.PNG';
    let lastGuideTrigger = null;

    const formatBudget = (value) => {
        const digits = String(value || '').replace(/[^0-9]/g, '');
        if (!digits) return DEFAULT_BUDGET_TEXT;
        return `${Number(digits).toLocaleString('ko-KR')}원`;
    };

    const getText = (root, selector, fallback = '') => root?.querySelector(selector)?.textContent.trim() || fallback;
    const getCourseCard = (trigger) => trigger?.closest('[data-course-card]') || dom.resultCourseCards[0] || null;

    const collectCourseFromCard = (card) => {
        const steps = Array.from(card?.querySelectorAll('.path-node') || []).map((node) => ({
            icon: getText(node, '.node-icon'),
            name: getText(node, '.node-name'),
            price: getText(node, '.node-price'),
            description: node.dataset.stepDesc || getText(node, '.node-desc'),
        }));

        return {
            id: card?.dataset.courseId || `course-${Date.now()}`,
            title: getText(card, 'h3', '이름 없는 코스'),
            description: getText(card, '.card-desc'),
            totalPrice: getText(card, '.price-tag'),
            meta: getText(card, '.card-info'),
            steps,
            savedAt: new Date().toISOString(),
        };
    };

    const setSaveMessage = (message, card = null) => {
        const target = card?.querySelector('[data-save-status]') || document.querySelector('[data-save-status]');
        if (target) target.textContent = message;
    };

    const readSavedCourses = () => {
        try {
            const saved = JSON.parse(localStorage.getItem(SAVED_COURSES_KEY) || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    };

    const writeSavedCourses = (courses, card = null) => {
        try {
            localStorage.setItem(SAVED_COURSES_KEY, JSON.stringify(courses));
            return true;
        } catch {
            setSaveMessage('브라우저 저장소를 사용할 수 없어요.', card);
            return false;
        }
    };

    const createSavedCourseItem = (course) => {
        const item = document.createElement('article');
        item.className = 'saved-course-item grid gap-2 rounded-2xl border border-[#f0e3da] bg-white p-4 shadow-sm';
        item.dataset.savedCourseId = course.id;

        const title = document.createElement('h4');
        title.className = 'saved-course-title text-base font-black text-[#5d4037]';
        title.textContent = course.title || '이름 없는 코스';

        const meta = document.createElement('p');
        meta.className = 'saved-course-meta text-xs font-semibold leading-relaxed text-[#6d5a52]';
        meta.textContent = [course.description, course.meta].filter(Boolean).join(' · ');

        const route = document.createElement('p');
        route.className = 'saved-course-route text-xs font-semibold leading-relaxed text-[#6d5a52]';
        route.textContent = (course.steps || []).map((step) => step.name).filter(Boolean).join(' → ');

        const footer = document.createElement('div');
        footer.className = 'saved-course-footer flex items-center justify-between gap-3';

        const price = document.createElement('span');
        price.className = 'saved-course-price text-sm font-black text-[#ff6e87]';
        price.textContent = course.totalPrice || '';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'saved-course-delete rounded-full bg-[#f3ebe6] px-3 py-1 text-xs font-bold text-[#6d5a52] hover:bg-[#fff1e7] hover:text-[#ff6e87]';
        deleteButton.type = 'button';
        deleteButton.dataset.deleteSavedCourse = course.id;
        deleteButton.textContent = '삭제';

        footer.append(price, deleteButton);
        item.append(title, meta, route, footer);
        return item;
    };

    const renderSavedCourses = () => {
        const courses = readSavedCourses();
        const savedIds = new Set(courses.map((course) => course.id));

        dom.savedCounts.forEach((count) => {
            count.textContent = `${courses.length}개`;
        });
        dom.savedEmptyMessages.forEach((message) => {
            message.hidden = courses.length > 0;
        });
        dom.savedCourseLists.forEach((list) => {
            list.replaceChildren(...courses.map(createSavedCourseItem));
        });
        document.querySelectorAll('[data-save-course]').forEach((button) => {
            const card = getCourseCard(button);
            const courseId = collectCourseFromCard(card).id;
            const isSaved = savedIds.has(courseId);
            button.classList.toggle('is-saved', isSaved);
            button.textContent = isSaved ? '저장 완료' : '나만의 코스 저장';
            button.setAttribute('aria-pressed', String(isSaved));
        });
    };

    const saveCourse = (button) => {
        const card = getCourseCard(button);
        const course = collectCourseFromCard(card);
        const courses = readSavedCourses();
        if (courses.some((savedCourse) => savedCourse.id === course.id)) {
            setSaveMessage('이미 저장된 코스예요.', card);
            return;
        }
        if (!writeSavedCourses([course, ...courses], card)) return;
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
        const allowedScreens = ['home', 'courses', 'result', 'saved'];
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
            ? dom.resultCourseCards.find((card) => card.dataset.courseId === courseId)
            : dom.resultCourseCards[0];
        targetCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const parseMeta = (meta = '') => {
        const cleanMeta = meta
            .replace(/\u00a0/g, ' ')
            .replace(/\uFFFD/g, '')
            .replace(/[🕒👣🚶]/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const durationMatch = cleanMeta.match(/(?:약\s*)?[0-9~:\s분시간]+/);
        const duration = durationMatch?.[0]?.trim() || '';
        const transportSource = durationMatch
            ? cleanMeta.slice((durationMatch.index || 0) + durationMatch[0].length)
            : cleanMeta;
        const transport = transportSource.replace(/^[\s·|,/-]+/, '').trim();
        return { duration, transport };
    };

    const setGuideTitle = (title) => {
        if (!dom.guideTitle) return;
        dom.guideTitle.replaceChildren(document.createTextNode(title), document.createElement('br'), document.createTextNode('상세 가이드'));
    };

    const updateGuideSummary = (course) => {
        const { duration, transport } = parseMeta(course.meta);
        const budget = dom.guideModal?.querySelector('[data-guide-summary="budget"] strong');
        const durationNode = dom.guideModal?.querySelector('[data-guide-summary="duration"] strong');
        const transportNode = dom.guideModal?.querySelector('[data-guide-summary="transport"] strong');
        if (budget) budget.textContent = course.totalPrice.replace(/^총\s*/, '');
        if (durationNode) durationNode.textContent = duration || '정보 없음';
        if (transportNode) transportNode.textContent = transport || '정보 없음';
    };

    const createGuideStage = (step, index) => {
        const stage = document.createElement('article');
        stage.className = 'guide-stage rounded-3xl border border-[#dff2e2] bg-[#fbfffb] p-5 text-center';
        stage.dataset.guideStage = `step-${index + 1}`;

        const icon = document.createElement('span');
        icon.className = 'guide-stage-icon text-3xl';
        icon.textContent = step.icon || '📍';

        const text = document.createElement('div');
        const name = document.createElement('strong');
        name.className = 'block text-lg font-black text-[#102034]';
        name.textContent = step.name || '코스 단계';
        const desc = document.createElement('span');
        desc.className = 'text-sm font-semibold text-[#6d5a52]';
        desc.textContent = step.description || (step.price === '0원'
            ? '가볍게 둘러보기 좋은 코스입니다.'
            : `${step.price} 정도로 즐길 수 있는 코스입니다.`);
        text.append(name, desc);

        const price = document.createElement('p');
        price.className = 'guide-stage-price mt-3 font-black text-[#2b9f49]';
        price.textContent = step.price || '';

        stage.append(icon, text, price);
        return stage;
    };

    const updateGuideFlow = (course) => {
        if (!dom.guideFlow) return;
        const nodes = [];
        dom.guideFlow.style.setProperty('--guide-step-count', String(Math.max(course.steps.length, 1)));
        course.steps.forEach((step, index) => {
            nodes.push(createGuideStage(step, index));
        });
        dom.guideFlow.replaceChildren(...nodes);
    };

    const updateGuide = (card) => {
        const course = collectCourseFromCard(card);
        setGuideTitle(course.title);
        updateGuideSummary(course);
        updateGuideFlow(course);
        if (dom.guideModal) dom.guideModal.dataset.courseId = course.id;
        if (dom.guideImage) {
            dom.guideImage.src = card?.dataset.guideImage || DEFAULT_GUIDE_IMAGE;
            dom.guideImage.alt = `${course.title} 상세 참고 이미지`;
        }
    };

    const openGuide = (button = null) => {
        const card = getCourseCard(button) || dom.resultCourseCards[0];
        lastGuideTrigger = button;
        updateGuide(card);
        dom.guideModal.hidden = false;
        dom.guideModal.classList.remove('hidden');
        dom.guideModal.classList.add('flex');
        dom.guideModal.getBoundingClientRect();
        dom.guideModal.classList.add('is-open');
        dom.guideCloseButton?.focus();
    };

    const closeGuide = () => {
        dom.guideModal.classList.remove('is-open');
        window.setTimeout(() => {
            dom.guideModal.hidden = true;
            dom.guideModal.classList.add('hidden');
            dom.guideModal.classList.remove('flex');
            lastGuideTrigger?.focus();
        }, GUIDE_TRANSITION_MS);
    };

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
            window.setTimeout(() => openGuide(dom.resultCourseCards[0]?.querySelector('[data-guide-open]')), 320);
        }
    };

    dom.routeButtons.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            showScreen(trigger.dataset.route);
            if (trigger.dataset.route === 'result' && trigger.dataset.courseId) {
                window.setTimeout(() => scrollToResultCard(trigger.dataset.courseId), 360);
            }
        });
    });

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
            openGuide(guideButton);
        }
    });

    dom.savedCourseLists.forEach((list) => {
        list.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('[data-delete-saved-course]');
            if (!deleteButton) return;
            deleteSavedCourse(deleteButton.dataset.deleteSavedCourse);
        });
    });

    dom.guideCloseButton?.addEventListener('click', closeGuide);
    dom.guideModal?.addEventListener('click', (event) => {
        if (event.target === dom.guideModal) closeGuide();
    });
    document.addEventListener('click', (event) => {
        if (!dom.listMenu || dom.listMenu.hidden) return;
        if (dom.listMenu.contains(event.target) || dom.openSavedButton?.contains(event.target)) return;
        closeListMenu();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && dom.listMenu && !dom.listMenu.hidden) closeListMenu();
        if (event.key === 'Escape' && !dom.guideModal?.hidden) closeGuide();
    });

    window.addEventListener('popstate', () => {
        showScreen(location.hash.replace('#', ''), { updateHash: false });
    });

    renderSavedCourses();
    showScreen(location.hash.replace('#', ''), { updateHash: false });
})();
