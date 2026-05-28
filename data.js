// data.js
const COURSE_DATA = [
    {
        id: 'seongsan-walk',
        theme: 'card-green',
        priceRange: '총 3~4만원',
        maxPrice: 40000,
        title: '성산 산책',
        description: '성산에서 가볍게 즐기는 산책 코스',
        duration: '약 2시간',
        transport: '🚶 도보 위주',
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
        transport: '🚶 도보 위주',
        places: [
            { icon: '🍝', name: '까르보네', priceText: '3~4만원' },
            { icon: '☕', name: '하흘', priceText: '12,000원' },
            { icon: '🌳', name: '홍제천 산책', priceText: '0원' }
        ]
    },
    {
        id: 'yeonnam-mmmua-walk',
        theme: 'card-green',
        priceRange: '총 3~4만원',
        maxPrice: 40000,
        title: '연남동 산책 데이트',
        description: '식사 후 경의선 숲길과 카페를 즐기는 연남동 코스',
        duration: '약 3시간',
        transport: '🚶 도보 위주',
        places: [
            { icon: '🍽️', name: '음무아 연남점', priceText: '식사' },
            { icon: '🌿', name: '경의선 숲길', priceText: '산책' },
            { icon: '☕', name: '브레디포스트 연남점', priceText: '카페' }
        ]
    },
    {
        id: 'yeonnam-toma-caricature',
        theme: 'card-green',
        priceRange: '총 5~6만원',
        maxPrice: 60000,
        title: '연남동 이색 데이트',
        description: '식사, 캐리커쳐, 골목 산책, 카페로 이어지는 연남동 코스',
        duration: '약 3시간 30분',
        transport: '🚶 도보 위주',
        places: [
            { icon: '🍝', name: '연남토마 본점', priceText: '식사' },
            { icon: '🎨', name: '도토리캐리커쳐 연남본점', priceText: '체험' },
            { icon: '🏘️', name: '연남동 골목 산책', priceText: '산책' },
            { icon: '☕', name: '연남동벚꽃집', priceText: '카페' }
        ]
    }
];