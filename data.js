const COURSE_DATA = [
    {
        id: 'seongsan-walk',
        theme: 'card-green',
        priceRange: '총 3~4만원',
        maxPrice: 40000,
        title: '성산 산책',
        description: '성산에서 가볍게 즐기는 산책 코스',
        duration: '약 2시간',
        transport: '도보 위주',
        guideImage: 'course-img/성산.png',
        places: [
            { icon: '🍗', name: '베이직 프라이드 치킨', priceText: '26,000원' },
            { icon: '☕', name: '베케이션 카페', priceText: '10,000원' },
            { icon: '🌳', name: '성산 산책', priceText: '0원' }
        ]
    },
    {
        id: 'hongjecheon-walk',
        theme: 'card-green',
        priceRange: '총 5~6만원',
        maxPrice: 60000,
        title: '홍제천 산책 데이트',
        description: '홍제천에서 가볍게 즐기는 산책 코스',
        duration: '약 2시간',
        transport: '도보 위주',
        guideImage: 'course-img/홍제천.png',
        places: [
            { icon: '🍝', name: '까르보네', priceText: '3~4만원' },
            { icon: '☕', name: '하흘', priceText: '12,000원' },
            { icon: '🌳', name: '홍제천 산책', priceText: '0원' }
        ]
    },
    {
        id: 'mangwon-zero-deepblue-market',
        theme: 'card-green',
        priceRange: '총 32,000~40,000원',
        maxPrice: 40000,
        title: '망원 감성 데이트',
        description: '망원에서 소품샵, 카페, 시장 먹거리, 사진, 산책을 즐기는 코스',
        duration: '약 4~5시간',
        transport: '도보 위주',
        guideImage: 'course-img/망원 감성.png',
        places: [
            { icon: '🛍️', name: '제로스페이스', priceText: '0원', description: '문구류와 포스터를 가볍게 구경하는 시작 코스입니다.' },
            { icon: '☕', name: '딥블루레이크', priceText: '12,000~16,000원', description: '음료를 마시며 차분하게 대화하기 좋은 카페 코스입니다.' },
            { icon: '🥟', name: '망원시장 먹거리', priceText: '15,000~22,000원', description: '간식 2~3개를 나눠 먹으며 예산을 맞추기 좋은 코스입니다.' },
            { icon: '📷', name: '망원동 네컷사진', priceText: '5,000~8,000원', description: '마지막에 사진으로 추억을 남기는 선택 코스입니다.' },
            { icon: '🌿', name: '망리단길 산책', priceText: '0원', description: '소품샵과 골목을 천천히 걷는 무료 마무리 코스입니다.' }
        ]
    },
    {
        id: 'mangwon-poeunro-tea',
        theme: 'card-green',
        priceRange: '총 49,000~58,000원',
        maxPrice: 58000,
        title: '망원 포은로 데이트',
        description: '망원역과 포은로 주변에서 서점, 식사, 티룸, 산책을 즐기는 코스',
        duration: '약 4~5시간',
        transport: '도보 위주',
        guideImage: 'course-img/망원 포은로.png',
        places: [
            { icon: '📚', name: '가가77페이지', priceText: '0원', description: '독립출판물과 엽서류를 조용히 둘러보기 좋은 서점 코스입니다.' },
            { icon: '🍱', name: '헤키 망원', priceText: '31,000~36,000원', description: '돈카츠 정식 중심으로 든든하게 식사하는 코스입니다.' },
            { icon: '🍵', name: '티노마드', priceText: '18,000~22,000원', description: '차와 디저트로 오래 앉아 이야기하기 좋은 티룸 코스입니다.' },
            { icon: '🌿', name: '포은로 산책', priceText: '0원', description: '망원2동 쪽으로 빠지지 않는 짧은 산책 마무리입니다.' }
        ]
    },
    {
        id: 'yeonnam-mmmua-walk',
        theme: 'card-green',
        priceRange: '총 3~4만원',
        maxPrice: 40000,
        title: '연남동 산책 데이트',
        description: '식사 후 경의선 숲길과 카페를 즐기는 연남동 코스',
        duration: '약 2시간 40분~3시간',
        transport: '도보 위주',
        guideImage: 'course-img/연남 산책.png',
        places: [
            { icon: '🍽️', name: '음무아 연남점', priceText: '식사', description: '홍대입구역에서 만나 식사로 데이트를 시작하기 좋은 연남동 맛집 코스입니다.' },
            { icon: '🌿', name: '경의선 숲길', priceText: '산책', description: '식사 후 연트럴파크 중심부를 따라 천천히 걷는 산책 코스입니다.' },
            { icon: '🎁', name: '소품샵 구경', priceText: '구경', description: '숲길 주변의 아기자기한 가게를 둘러보며 가볍게 쉬어가는 코스입니다.' },
            { icon: '☕', name: '브레디포스트 연남점', priceText: '카페', description: '빈티지한 분위기의 카페에서 디저트와 대화로 마무리하는 코스입니다.' }
        ]
    },
    {
        id: 'yeonnam-toma-caricature',
        theme: 'card-green',
        priceRange: '총 5~6만원',
        maxPrice: 60000,
        title: '연남동 이색 데이트',
        description: '식사, 캐리커쳐, 골목 산책, 카페로 이어지는 연남동 코스',
        duration: '약 3시간 10분~3시간 40분',
        transport: '도보 위주',
        guideImage: 'course-img/연남 이색.png',
        places: [
            { icon: '🍝', name: '연남토마', priceText: '식사', description: '홍대입구역에서 걸어가 식사로 시작하는 연남동 메인 코스입니다.' },
            { icon: '🎨', name: '도토리 캐리커쳐', priceText: '체험', description: '둘만의 모습을 그림으로 남길 수 있는 이색 체험 코스입니다.' },
            { icon: '🏘️', name: '연남동 골목 산책', priceText: '산책', description: '주택가 골목과 작은 가게들을 구경하며 카페로 이동하는 코스입니다.' },
            { icon: '☕', name: '연남동 벚꽃집', priceText: '카페', description: '단독주택 감성의 카페에서 음료를 마시며 마무리하는 코스입니다.' }
        ]
    },
    {
        id: 'seogyo-3-4',
        theme: 'card-green',
        priceRange: '총 41,000원',
        maxPrice: 41000,
        title: '서교동 디자인 데이트',
        description: '서교동에서 디자인 소품, 식사, 카페, 사진을 즐기는 코스',
        duration: '3~4시간',
        transport: '도보 위주',
        guideImage: 'course-img/서교동 디자인.png',
        places: [
            { icon: '🎨', name: 'KT&G 상상마당', priceText: '0원', description: '디자인 소품과 아이디어 상품을 둘러보며 대화를 시작하기 좋은 코스입니다.' },
            { icon: '🍜', name: '칸다소바 홍대점', priceText: '22,000원', description: '마제소바로 든든하게 식사하며 예산을 맞추기 좋은 코스입니다.' },
            { icon: '☕', name: '테일러커피 서교점', priceText: '14,000원', description: '시그니처 커피를 마시며 여유롭게 쉬어가는 카페 코스입니다.' },
            { icon: '📷', name: '인근 네컷 사진관', priceText: '5,000원', description: '홍대 거리에서 가볍게 사진을 남기며 마무리하는 추억 코스입니다.' }
        ]
    },
    {
        id: 'seogyo-5-6',
        theme: 'card-green',
        priceRange: '총 60,000원',
        maxPrice: 60000,
        title: '서교동 무드 데이트',
        description: '서교동에서 소품샵, 피자, 칵테일을 즐기는 분위기 코스',
        duration: '4~5시간',
        transport: '도보 위주',
        guideImage: 'course-img/서교동 무드.png',
        places: [
            { icon: '🛍️', name: '오브젝트 서교점', priceText: '0원', description: '감성적인 문구와 생활 소품을 여유롭게 구경하는 편집샵 코스입니다.' },
            { icon: '🍕', name: '피자네버슬립스', priceText: '35,000원', description: '캐주얼한 분위기에서 피자를 나눠 먹는 든든한 식사 코스입니다.' },
            { icon: '🍸', name: '자세(JASE)', priceText: '25,000원', description: '은은한 조명 아래 가벼운 칵테일로 대화하기 좋은 마무리 코스입니다.' }
        ]
    }
];
