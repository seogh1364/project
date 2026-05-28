(() => {
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
        savedCourseList: document.querySelectorAll('[data-saved-course-list]'),
        savedEmpty: document.querySelectorAll('[data-saved-empty]'),
        savedCount: document.querySelectorAll('[data-saved-count]'),
    };

    const SAVED_COURSES_KEY = 'manwon-date.savedCourses';

    const generateCourseCardHTML = (course, isResultScreen = false) => {
        const placesHTML = course.places.map((place, index) => {
            const isLast = index === course.places.length - 1;
            return `
                <div class="path-node"><div class="node-icon">${place.icon}</div><span class="node-name">${place.name}</span><span class="node-price">${place.priceText}</span></div>
                ${!isLast ? '<div class="path-arrow">→</div>' : ''}
            `;
        }).join('');

        const buttonHTML = isResultScreen
            ? `<div class="action-stack">
                   <button class="action-btn save-btn" type="button" data-save-course="${course.id}">나만의 코스 저장</button>
               </div>
               <p class="save-status" id="save-status-${course.id}"></p>`
            : `<button type="button" class="more-btn" data-route-result="${course.id}">자세히 보기 &gt;</button>`;

        return `
            <article class="course-card ${course.theme}" data-course-card data-course-id="${course.id}" data-price="${course.maxPrice}">
                <div class="card-top">
                    <span class="price-tag">${course.priceRange}</span>
                    <h3>${course.title}</h3>
                    <p class="card-desc">${course.description}</p>
                    <div class="card-info">${course.duration} &nbsp; ${course.transport}</div>
                </div>
                <div class="course-path">${placesHTML}</div>
                ${buttonHTML}
            </article>
        `;
    };

    const renderAllCourses = () => {
        const homeGrid = document.getElementById('home-course-grid');
        const browseGrid = document.getElementById('browse-course-grid');

        const allCardsHTML = COURSE_DATA.map(course => generateCourseCardHTML(course, false)).join('');

        if (homeGrid) homeGrid.innerHTML = allCardsHTML;
        if (browseGrid) browseGrid.innerHTML = allCardsHTML;
    };

    const renderResultCard = (courseId) => {
        const target = document.getElementById('result-sidebar-container');
        const course = COURSE_DATA.find(c => c.id === courseId);
        if (target && course) {
            target.innerHTML = generateCourseCardHTML(course, true);
        }
    };

    const readSavedCourses = () => JSON.parse(localStorage.getItem(SAVED_COURSES_KEY) || '[]');
    const writeSavedCourses = (courses) => { localStorage.setItem(SAVED_COURSES_KEY, JSON.stringify(courses)); };

    const renderSavedCoursesUI = () => {
        const courses = readSavedCourses();
        dom.savedCount.forEach(el => el.textContent = `${courses.length}개`);
        dom.savedEmpty.forEach(el => el.hidden = courses.length > 0);

        const html = courses.map(course => `
            <article class="saved-course-item">
                <h4 class="saved-course-title">${course.title}</h4>
                <p class="saved-course-meta">${course.description}</p>
                <div class="saved-course-footer">
                    <span class="saved-course-price">${course.priceRange}</span>
                    <button class="saved-course-delete" data-delete-saved="${course.id}">삭제</button>
                </div>
            </article>
        `).join('');

        dom.savedCourseList.forEach(el => el.innerHTML = html);
    };

    const saveCourse = (courseId) => {
        const course = COURSE_DATA.find(c => c.id === courseId);
        const courses = readSavedCourses();
        const statusEl = document.getElementById(`save-status-${courseId}`);

        if (courses.some(c => c.id === courseId)) {
            if (statusEl) statusEl.textContent = '이미 저장된 코스예요.';
            return;
        }
        writeSavedCourses([course, ...courses]);
        if (statusEl) statusEl.textContent = '나만의 데이트 코스에 저장했어요!';
        renderSavedCoursesUI();
    };

    const showScreen = (target) => {
        dom.screens.forEach(screen => {
            const isActive = screen.dataset.screen === target;
            screen.classList.toggle('is-active', isActive);
            screen.setAttribute('aria-hidden', String(!isActive));
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (target === 'result') renderSavedCoursesUI();
    };

    const initMap = async (courseId) => {
        const mapContainer = document.getElementById('map');
        if (!mapContainer || !window.kakao || !window.kakao.maps || !window.kakao.maps.services) return;
        mapContainer.innerHTML = '';

        const courseInfo = COURSE_DATA.find(c => c.id === courseId);
        if (!courseInfo) return;

        const placeNames = courseInfo.places.map(p => p.name);
        const ps = new kakao.maps.services.Places();

        const searchPromises = placeNames.map(placeName => {
            return new Promise(resolve => {
                ps.keywordSearch(placeName, (data, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        resolve({ title: placeName, lat: data[0].y, lng: data[0].x });
                    } else resolve(null);
                });
            });
        });

        const searchResults = await Promise.all(searchPromises);
        const validCoords = searchResults.filter(r => r !== null);

        if (validCoords.length === 0) {
            mapContainer.innerHTML = '<div class="map-placeholder">📍 좌표를 찾지 못했습니다.</div>';
            return;
        }

        const map = new kakao.maps.Map(mapContainer, { center: new kakao.maps.LatLng(validCoords[0].lat, validCoords[0].lng), level: 4 });
        const linePath = [];
        const bounds = new kakao.maps.LatLngBounds();

        validCoords.forEach(spot => {
            const pos = new kakao.maps.LatLng(spot.lat, spot.lng);
            linePath.push(pos);
            bounds.extend(pos);
            new kakao.maps.Marker({ map: map, position: pos, title: spot.title });
        });

        new kakao.maps.Polyline({ path: linePath, strokeWeight: 4, strokeColor: '#ff6e87', strokeOpacity: 0.8, strokeStyle: 'solid' }).setMap(map);
        if (validCoords.length > 1) map.setBounds(bounds);
    };

    dom.budgetForm?.addEventListener('submit', (event) => {
        event.preventDefault();

        const rawValue = dom.budgetInput?.value || '';
        const budgetNumber = parseInt(rawValue.replace(/[^0-9]/g, ''), 10) || 9999;

        if (dom.selectedBudget) {
            dom.selectedBudget.textContent = rawValue ? `${Number(budgetNumber).toLocaleString('ko-KR')}원` : '10,000원';
        }

        const minBudget = budgetNumber - 9999;
        const maxBudget = budgetNumber + 9999;

        const matchedCourses = COURSE_DATA.filter(course => {
            return course.maxPrice >= minBudget && course.maxPrice <= maxBudget;
        });

        showScreen('result');

        if (matchedCourses.length > 0) {
            const randomIndex = Math.floor(Math.random() * matchedCourses.length);
            const selectedCourse = matchedCourses[randomIndex];

            renderResultCard(selectedCourse.id);
            setTimeout(() => initMap(selectedCourse.id), 100);
        } else {

            const target = document.getElementById('result-sidebar-container');
            const mapContainer = document.getElementById('map');

            if (target) {
                target.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #666;">
                        😭 입력하신 예산(범위 ${Number(minBudget).toLocaleString('ko-KR')}원 ~ ${Number(maxBudget).toLocaleString('ko-KR')}원)에 맞는 코스가 아직 없어요. 다른 금액을 입력해 보세요!
                    </div>
                `;
            }
            if (mapContainer) {
                mapContainer.innerHTML = '<div class="map-placeholder">📍 표시할 코스가 없습니다.</div>';
            }
        }
    });

    document.addEventListener('click', (event) => {
        const routeBtn = event.target.closest('[data-route-result]');
        if (routeBtn) {
            const courseId = routeBtn.dataset.routeResult;
            showScreen('result');
            renderResultCard(courseId);
            setTimeout(() => initMap(courseId), 100);
            return;
        }

        const saveBtn = event.target.closest('[data-save-course]');
        if (saveBtn) {
            saveCourse(saveBtn.dataset.saveCourse);
            return;
        }

        const deleteBtn = event.target.closest('[data-delete-saved]');
        if (deleteBtn) {
            const nextCourses = readSavedCourses().filter(c => c.id !== deleteBtn.dataset.deleteSaved);
            writeSavedCourses(nextCourses);
            renderSavedCoursesUI();
            return;
        }

        const homeBtn = event.target.closest('[data-route="home"]');
        if (homeBtn) {
            event.preventDefault();
            showScreen('home');
        }
    });

    dom.openSavedButton?.addEventListener('click', () => { dom.listMenu.hidden = !dom.listMenu.hidden; });
    dom.listMenuCloseButton?.addEventListener('click', () => { dom.listMenu.hidden = true; });
    dom.budgetButtons.forEach(btn => btn.addEventListener('click', () => dom.budgetInput.value = Number(btn.dataset.budget).toLocaleString('ko-KR')));
    dom.listMenuItems.forEach(item => item.addEventListener('click', () => {
        dom.listMenu.hidden = true;
        const action = item.dataset.menuAction;
        if (action === 'browse') showScreen('courses');
        if (action === 'saved') showScreen('saved');
    }));

    renderAllCourses();
    renderSavedCoursesUI();
})();