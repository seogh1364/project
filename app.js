(() => {
    // DOM hooks: HTML/CSS와 JS를 연결하는 계약입니다.
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
        currentCourseCard: document.querySelector('[data-screen="result"] [data-course-card]'),
        saveCourseButton: document.querySelector('[data-save-course]'),
        saveStatus: document.querySelector('[data-save-status]'),
        savedCoursesPanel: document.querySelector('[data-saved-courses-panel]'),
        savedCourseList: document.querySelector('[data-saved-course-list]'),
        savedEmpty: document.querySelector('[data-saved-empty]'),
        savedCount: document.querySelector('[data-saved-count]'),
        guideModal: document.querySelector('[data-guide-modal]'),
        guideOpenButton: document.querySelector('[data-guide-open]'),
        guideCloseButton: document.querySelector('[data-guide-close]'),
    };

    const DEFAULT_BUDGET_TEXT = '10,000원';
    const GUIDE_TRANSITION_MS = 240;
    const SAVED_COURSES_KEY = 'manwon-date.savedCourses';

    const formatBudget = (value) => {
        const digits = String(value || '').replace(/[^0-9]/g, '');
        if (!digits) return DEFAULT_BUDGET_TEXT;
        return `${Number(digits).toLocaleString('ko-KR')}원`;
    };

    const setSaveMessage = (message) => {
        if (!dom.saveStatus) return;
        dom.saveStatus.textContent = message;
    };

    const readSavedCourses = () => {
        try {
            const saved = JSON.parse(localStorage.getItem(SAVED_COURSES_KEY) || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    };

    const writeSavedCourses = (courses) => {
        try {
            localStorage.setItem(SAVED_COURSES_KEY, JSON.stringify(courses));
            return true;
        } catch {
            setSaveMessage('브라우저 저장소를 사용할 수 없어요.');
            return false;
        }
    };

    const getText = (root, selector, fallback = '') => root?.querySelector(selector)?.textContent.trim() || fallback;

    const collectCurrentCourse = () => {
        const card = dom.currentCourseCard;
        const steps = Array.from(card?.querySelectorAll('.path-node') || []).map((node) => ({
            icon: getText(node, '.node-icon'),
            name: getText(node, '.node-name'),
            price: getText(node, '.node-price'),
        }));

        return {
            id: card?.dataset.courseId || dom.saveCourseButton?.dataset.courseId || `course-${Date.now()}`,
            title: getText(card, 'h3', '이름 없는 코스'),
            description: getText(card, '.card-desc'),
            totalPrice: getText(card, '.price-tag'),
            meta: getText(card, '.card-info'),
            steps,
            savedAt: new Date().toISOString(),
        };
    };

    const createSavedCourseItem = (course) => {
        const item = document.createElement('article');
        item.className = 'saved-course-item';
        item.dataset.savedCourseId = course.id;

        const title = document.createElement('h4');
        title.className = 'saved-course-title';
        title.textContent = course.title;

        const meta = document.createElement('p');
        meta.className = 'saved-course-meta';
        meta.textContent = [course.description, course.meta].filter(Boolean).join(' · ');

        const route = document.createElement('p');
        route.className = 'saved-course-route';
        route.textContent = course.steps.map((step) => step.name).filter(Boolean).join(' → ');

        const footer = document.createElement('div');
        footer.className = 'saved-course-footer';

        const price = document.createElement('span');
        price.className = 'saved-course-price';
        price.textContent = course.totalPrice;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'saved-course-delete';
        deleteButton.type = 'button';
        deleteButton.dataset.deleteSavedCourse = course.id;
        deleteButton.textContent = '삭제';

        footer.append(price, deleteButton);
        item.append(title, meta, route, footer);
        return item;
    };

    const renderSavedCourses = () => {
        const courses = readSavedCourses();
        const currentCourseId = collectCurrentCourse().id;
        const isCurrentSaved = courses.some((course) => course.id === currentCourseId);

        if (dom.savedCount) dom.savedCount.textContent = `${courses.length}개`;
        if (dom.savedEmpty) dom.savedEmpty.hidden = courses.length > 0;
        if (dom.savedCourseList) dom.savedCourseList.replaceChildren(...courses.map(createSavedCourseItem));
        if (dom.saveCourseButton) {
            dom.saveCourseButton.classList.toggle('is-saved', isCurrentSaved);
            dom.saveCourseButton.textContent = isCurrentSaved ? '저장 완료' : '나만의 코스 저장';
            dom.saveCourseButton.setAttribute('aria-pressed', String(isCurrentSaved));
        }
    };

    const saveCurrentCourse = () => {
        const course = collectCurrentCourse();
        const courses = readSavedCourses();
        if (courses.some((savedCourse) => savedCourse.id === course.id)) {
            setSaveMessage('이미 저장된 코스예요.');
            return;
        }
        if (!writeSavedCourses([course, ...courses])) return;
        renderSavedCourses();
        setSaveMessage('나만의 데이트 코스에 저장했어요.');
    };

    const deleteSavedCourse = (courseId) => {
        const nextCourses = readSavedCourses().filter((course) => course.id !== courseId);
        if (!writeSavedCourses(nextCourses)) return;
        renderSavedCourses();
        setSaveMessage('저장한 코스를 삭제했어요.');
    };

    const showScreen = (target, options = {}) => {
        const next = target === 'result' ? 'result' : 'home';
        dom.screens.forEach((screen) => {
            const isActive = screen.dataset.screen === next;
            screen.classList.toggle('is-active', isActive);
            screen.setAttribute('aria-hidden', String(!isActive));
        });
        if (options.updateHash !== false) {
            history.pushState({ screen: next }, '', `#${next}`);
        }
        if (next === 'result') renderSavedCourses();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToSavedCourses = () => {
        dom.savedCoursesPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const setListMenuOpen = (isOpen) => {
        if (!dom.listMenu || !dom.openSavedButton) return;
        if (isOpen) {
            dom.listMenu.hidden = false;
            dom.listMenu.getBoundingClientRect();
        }
        dom.listMenu.classList.toggle('is-open', isOpen);
        dom.openSavedButton.setAttribute('aria-expanded', String(isOpen));
        if (!isOpen) {
            window.setTimeout(() => {
                dom.listMenu.hidden = true;
            }, 180);
        }
    };

    const closeListMenu = () => setListMenuOpen(false);

    dom.routeButtons.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            showScreen(trigger.dataset.route);
        });
    });

    dom.openSavedButton?.addEventListener('click', () => {
        const isOpen = dom.openSavedButton.getAttribute('aria-expanded') === 'true';
        setListMenuOpen(!isOpen);
    });

    dom.listMenuCloseButton?.addEventListener('click', closeListMenu);

    dom.budgetButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (!dom.budgetInput) return;
            dom.budgetInput.value = Number(button.dataset.budget).toLocaleString('ko-KR');
            dom.budgetInput.focus();
        });
    });

    dom.budgetForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        if (dom.selectedBudget) {
            dom.selectedBudget.textContent = formatBudget(dom.budgetInput?.value);
        }
        showScreen('result');
    });

    dom.saveCourseButton?.addEventListener('click', saveCurrentCourse);
    dom.savedCourseList?.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('[data-delete-saved-course]');
        if (!deleteButton) return;
        deleteSavedCourse(deleteButton.dataset.deleteSavedCourse);
    });

    const openGuide = () => {
        if (!dom.guideModal || !dom.guideCloseButton) return;
        dom.guideModal.hidden = false;
        dom.guideModal.getBoundingClientRect();
        dom.guideModal.classList.add('is-open');
        dom.guideCloseButton.focus();
    };

    const closeGuide = () => {
        if (!dom.guideModal) return;
        dom.guideModal.classList.remove('is-open');
        window.setTimeout(() => {
            dom.guideModal.hidden = true;
            dom.guideOpenButton?.focus();
        }, GUIDE_TRANSITION_MS);
    };

    dom.guideOpenButton?.addEventListener('click', openGuide);
    dom.guideCloseButton?.addEventListener('click', closeGuide);
    dom.guideModal?.addEventListener('click', (event) => {
        if (event.target === dom.guideModal) closeGuide();
    });

    const scrollToResultCard = () => {
        dom.currentCourseCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleMenuAction = (action) => {
        closeListMenu();

        if (action === 'recommended') {
            showScreen('result');
            window.setTimeout(scrollToResultCard, 320);
            return;
        }

        if (action === 'saved') {
            showScreen('result');
            window.setTimeout(scrollToSavedCourses, 320);
            return;
        }

        if (action === 'food') {
            showScreen('result');
            window.setTimeout(scrollToResultCard, 320);
            return;
        }

        if (action === 'guide') {
            showScreen('result');
            window.setTimeout(openGuide, 320);
        }
    };

    dom.listMenuItems.forEach((item) => {
        item.addEventListener('click', () => {
            handleMenuAction(item.dataset.menuAction);
        });
    });

    document.addEventListener('click', (event) => {
        if (!dom.listMenu || dom.listMenu.hidden) return;
        if (dom.listMenu.contains(event.target) || dom.openSavedButton?.contains(event.target)) return;
        closeListMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && dom.listMenu && !dom.listMenu.hidden) closeListMenu();
        if (event.key === 'Escape' && dom.guideModal && !dom.guideModal.hidden) closeGuide();
    });

    window.addEventListener('popstate', () => {
        showScreen(location.hash.replace('#', ''), { updateHash: false });
    });

    renderSavedCourses();
    showScreen(location.hash.replace('#', ''), { updateHash: false });
})();
