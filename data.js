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
        priceRange: '총 3~4만원',
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
        priceRange: '총 5~6만원',
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
        id: 'mangwon-market-dangdo-picnic',
        theme: 'card-green',
        priceRange: '총 4~5만원',
        maxPrice: 50000,
        title: '망원 피크닉 데이트',
        description: '망원시장에서 먹거리를 사고 당도, 망리단길, 한강공원 피크닉까지 즐기는 코스',
        duration: '약 4~5시간',
        transport: '도보 위주',
        guideImage: 'course-img/망원 감성.png',
        places: [
            { icon: '🥟', name: '망원시장 먹거리', mapName: '망원시장', priceText: '약 21,000원', description: '우이락 고추튀김, 고로케나 닭강정, 호떡처럼 든든한 먹거리와 피크닉 간식을 준비하는 시작 코스입니다.' },
            { icon: '🍨', name: '당도 젤라또', mapName: '당도 망원', priceText: '약 11,000원', description: '망리단길 산책 중 들르기 좋은 젤라또 맛집에서 쌀, 소금 같은 진한 수제 맛을 가볍게 즐기는 디저트 코스입니다.' },
            { icon: '🛍️', name: '망리단길 소품샵', mapName: '망리단길', priceText: '약 5,000원', description: '제로스페이스와 포롱포롱 잡화점 같은 골목 소품샵을 구경하고, 엽서나 스티커를 부담 없이 골라보는 코스입니다.' },
            { icon: '🌅', name: '망원한강공원 피크닉', mapName: '망원한강공원', priceText: '약 8,000원', description: '시장과 당도에서 산 간식을 들고 한강공원으로 걸어가, 성산대교 뷰와 일몰을 보며 마무리하는 피크닉 코스입니다.' }
        ]
    },
    {
        id: 'hapjeong-okdongsik-anthracite',
        theme: 'card-green',
        priceRange: '총 3~4만원',
        maxPrice: 40000,
        title: '합정동 골목 산책 데이트',
        description: '합정에서 돼지곰탕, 카페 골목, 공장형 감성 카페, 한강 산책을 즐기는 코스',
        duration: '약 3~4시간',
        transport: '도보 위주',
        guideImage: '웹 사이트 메인화면 일러.PNG',
        places: [
            { icon: '🍲', name: '옥동식', mapName: '옥동식 합정', priceText: '약 23,000원', description: '합정역 8번 출구에서 걸어가 깔끔한 돼지곰탕으로 편하게 식사하는 시작 코스입니다.' },
            { icon: '🌿', name: '합정 카페 골목 산책', mapName: '합정 카페거리', priceText: '0원', description: '메인 거리보다 한적한 골목에서 작은 편집샵과 빈티지샵을 가볍게 둘러보는 산책 코스입니다.' },
            { icon: '☕', name: '앤트러사이트 합정점', mapName: '앤트러사이트 합정점', priceText: '약 12,000원', description: '공장형 감성의 카페에서 커피와 디저트를 나누며 오래 이야기하기 좋은 코스입니다.' },
            { icon: '🌅', name: '양화한강공원 산책', mapName: '양화한강공원', priceText: '약 5,000원', description: '노을 시간대에 편의점 음료와 간식을 들고 걷기 좋은 마무리 산책 코스입니다.' }
        ]
    },
    {
        id: 'hapjeong-donkatsu-photo',
        theme: 'card-green',
        priceRange: '총 5~6만원',
        maxPrice: 60000,
        title: '합정동 편집샵 무드 데이트',
        description: '합정에서 돈까스, 편집샵 구경, 포토이즘, 감성 카페를 즐기는 코스',
        duration: '약 3~4시간',
        transport: '도보 위주',
        guideImage: '웹 사이트 메인화면 일러.PNG',
        places: [
            { icon: '🍛', name: '최강금돈까스', mapName: '최강금돈까스 합정', priceText: '약 30,000원', description: '합정역에서 걸어가 두툼한 돈까스와 카레 조합으로 든든하게 시작하는 식사 코스입니다.' },
            { icon: '🛍️', name: '소품샵 & 편집샵 구경', mapName: '합정역', priceText: '약 5,000원', description: 'LP샵, 빈티지샵, 향수샵이 있는 조용한 골목을 둘러보는 중간 코스입니다.' },
            { icon: '📷', name: '포토이즘 합정점', mapName: '포토이즘 합정점', priceText: '약 8,000원', description: '흑백이나 감성 프레임으로 커플 사진을 남기는 가벼운 체험 코스입니다.' },
            { icon: '☕', name: '카페 공명 합정점', mapName: '카페 공명 합정점', priceText: '약 15,000원', description: '한옥 감성이 섞인 분위기에서 비주얼 좋은 디저트와 음료로 마무리하는 코스입니다.' }
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
            { icon: '🍽️', name: '음무아 연남점', mapName: '음무아 연남점', priceText: '약 27,000원', description: '홍대입구역에서 만나 식사로 데이트를 시작하기 좋은 연남동 맛집 코스입니다.' },
            { icon: '🌿', name: '경의선 숲길', priceText: '산책', description: '식사 후 연트럴파크 중심부를 따라 천천히 걷는 산책 코스입니다.' },
            { icon: '🎁', name: '소품샵 구경', priceText: '구경', description: '숲길 주변의 아기자기한 가게를 둘러보며 가볍게 쉬어가는 코스입니다.' },
            { icon: '☕', name: '카페 공명 연남점', mapName: '카페 공명 연남점', priceText: '약 15,000원', description: '카페에서 음료와 디저트를 나누며 대화로 마무리하는 코스입니다.' }
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
            { icon: '🍝', name: '연남토마 본점', mapName: '연남토마 본점', priceText: '약 33,000원', description: '홍대입구역에서 걸어가 식사로 시작하는 연남동 메인 코스입니다.' },
            { icon: '🎨', name: '도토리 캐리커쳐', mapName: '도토리 캐리커쳐 연남본점', priceText: '약 14,000원', description: '둘만의 모습을 그림으로 남길 수 있는 이색 체험 코스입니다.' },
            { icon: '🏘️', name: '연남동 골목 산책', priceText: '산책', description: '주택가 골목과 작은 가게들을 구경하며 카페로 이동하는 코스입니다.' },
            { icon: '☕', name: '연남동집', mapName: '연남동집', priceText: '약 13,000~15,000원', description: '카페에서 음료와 디저트를 나누며 마무리하는 코스입니다.' }
        ]
    },
    {
        id: 'yeonnam-toma-breadypost',
        theme: 'card-green',
        priceRange: '총 3~4만원',
        maxPrice: 40000,
        title: '연남동 토마 골목 데이트',
        description: '연남토마에서 식사하고 경의선숲길, 브레디포스트, 홍대 거리를 즐기는 코스',
        duration: '약 3~4시간',
        transport: '도보 위주',
        guideImage: '웹 사이트 메인화면 일러.PNG',
        places: [
            { icon: '🍝', name: '연남토마 연남본점', mapName: '연남토마 연남본점', priceText: '약 20,000원', description: '홍대입구역 3번 출구에서 걸어가 덮밥과 파스타로 무난하게 시작하는 식사 코스입니다.' },
            { icon: '🌿', name: '경의선숲길 산책', mapName: '경의선숲길 연남동', priceText: '0원', description: '소품샵과 엽서샵을 둘러보며 한적한 연남동 골목 분위기를 즐기는 산책 코스입니다.' },
            { icon: '☕', name: '브레디포스트 연남점', mapName: '브레디포스트 연남점', priceText: '약 12,000원', description: '프렌치토스트와 디저트가 유명한 카페에서 창가 분위기를 즐기는 코스입니다.' },
            { icon: '🎶', name: '홍대 걷고싶은거리', mapName: '홍대 걷고싶은거리', priceText: '약 5,000원', description: '버스킹과 야간 거리 분위기를 구경하며 간식이나 음료로 마무리하는 코스입니다.' }
        ]
    },
    {
        id: 'yeonnam-heygeorge-overdeep',
        theme: 'card-green',
        priceRange: '총 5~6만원',
        maxPrice: 60000,
        title: '연남동 오버딥 무드 데이트',
        description: '연남동 안쪽에서 양식, 골목 산책, 우드톤 카페, 홍대 거리를 즐기는 코스',
        duration: '약 3~4시간',
        transport: '도보 위주',
        guideImage: '웹 사이트 메인화면 일러.PNG',
        places: [
            { icon: '🍽️', name: 'Hey George', mapName: 'Hey George 연남', priceText: '약 30,000원', description: '연남동 골목 안쪽의 조용한 양식 맛집에서 파스타와 음료로 시작하는 코스입니다.' },
            { icon: '🏘️', name: '연남동 주택가 골목 산책', mapName: '연남동 골목길', priceText: '약 5,000원', description: '빈티지샵, 독립서점, 향수샵을 구경하며 메인 거리보다 조용하게 걷는 코스입니다.' },
            { icon: '☕', name: 'Overdeep', mapName: 'Overdeep 연남', priceText: '약 13,000원', description: '우드톤 감성 카페에서 크림라떼와 바스크 치즈케이크를 나누는 디저트 코스입니다.' },
            { icon: '🎶', name: '홍대 걷고싶은거리', mapName: '홍대 걷고싶은거리', priceText: '약 7,000원', description: '버스킹과 거리 공연을 보며 편의점 음료로 가볍게 마무리하는 산책 코스입니다.' }
        ]
    },
    {
        id: 'seogyo-3-4',
        theme: 'card-green',
        priceRange: '총 3~4만원',
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
        priceRange: '총 5~6만원',
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
