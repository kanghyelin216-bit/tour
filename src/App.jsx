// src/App.jsx
import { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, set, get, child } from 'firebase/database';
import axios from 'axios';
import './App.css'; 

function App() {
  const [places, setPlaces] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  
  // 보관함(찜) 관련 상태 추가
  const [wishlist, setWishlist] = useState({}); // 찜한 여행지 목록 (객체 형태)
  const [showWishlist, setShowWishlist] = useState(false); // 보관함 보기 여부

  const API_KEY = 'ec3f7ef297eb3f592b66a248f3cdfc87a34e5e89a4950965a1d1c484fd6d6423'; 

  const regions = [
    { code: '1', name: '서울' }, { code: '2', name: '인천' },
    { code: '3', name: '대전' }, { code: '4', name: '대구' },
    { code: '5', name: '광주' }, { code: '6', name: '부산' },
    { code: '7', name: '울산' }, { code: '8', name: '세종' },
    { code: '31', name: '경기도' }, { code: '32', name: '강원도' },
    { code: '33', name: '충청북도' }, { code: '34', name: '충청남도' },
    { code: '35', name: '경상북도' }, { code: '36', name: '경상남도' },
    { code: '37', name: '전라북도' }, { code: '38', name: '전라남도' },
    { code: '39', name: '제주도' }
  ];

  // 1. 처음 화면 켤 때 마지막 지역 및 보관함(Wishlist) 데이터 가져오기
  useEffect(() => {
    const dbRef = ref(database);
    get(child(dbRef, `userPreferences`)).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // 찜 목록 불러오기
        if (data.wishlist) {
          setWishlist(data.wishlist);
        }
        // 마지막 지역 불러오기
        if (data.lastRegion) {
          setSelectedRegion(data.lastRegion);
          fetchTourismData(data.lastRegion);
        }
      }
    });
  }, []);

  const fetchTourismData = async (areaCode) => {
    try {
      const url = `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${API_KEY}&numOfRows=60&pageNo=1&MobileOS=ETC&MobileApp=CardBookApp&_type=json&areaCode=${areaCode}&arrange=P`;
      const response = await axios.get(url);
      
      if (response.data.response && response.data.response.body && response.data.response.body.items) {
        const items = response.data.response.body.items.item || [];
        setPlaces(items);
      } else {
        setPlaces([]); 
      }
    } catch (error) {
      console.error("API 호출 에러:", error);
    }
  };

  const handleRegionChange = (e) => {
    const newRegionCode = e.target.value;
    if (!newRegionCode) return;

    setSelectedRegion(newRegionCode);
    set(ref(database, 'userPreferences/lastRegion'), newRegionCode);
    
    // 지역을 바꾸면 자동으로 보관함 모드를 끄고 전체 목록을 보여줌
    setShowWishlist(false);
    fetchTourismData(newRegionCode);
  };

  // 2. 찜하기 / 찜 취소 토글 함수
  const toggleWishlist = (place) => {
    const newWishlist = { ...wishlist };
    // 이미 찜한 곳이면 제거, 아니면 추가 (고유 ID인 contentid 기준)
    if (newWishlist[place.contentid]) {
      delete newWishlist[place.contentid];
    } else {
      newWishlist[place.contentid] = place;
    }
    
    setWishlist(newWishlist);
    // Firebase에 찜 목록 전체 업데이트
    set(ref(database, 'userPreferences/wishlist'), newWishlist);
  };

  // 화면에 그려줄 데이터 결정 (보관함 모드면 찜한 목록, 아니면 API 호출 목록)
  const displayPlaces = showWishlist ? Object.values(wishlist) : places;

  return (
    <div className="App">
      <header className="app-header">
        <h1>✈️ 여행지 카드북</h1>
        <p>훌쩍 떠나고 싶은 지역을 선택해보세요</p>
        
        <div className="control-panel">
          <select className="region-select" value={selectedRegion} onChange={handleRegionChange}>
            <option value="">🗺️ 지역 선택하기</option>
            {regions.map(region => (
              <option key={region.code} value={region.code}>
                {region.name}
              </option>
            ))}
          </select>
          
          {/* 보관함 토글 버튼 */}
          <button 
            className={`wishlist-toggle-btn ${showWishlist ? 'active' : ''}`}
            onClick={() => setShowWishlist(!showWishlist)}
          >
            {showWishlist ? '🗺️ 지역 전체 보기' : `❤️ 내 보관함 (${Object.keys(wishlist).length})`}
          </button>
        </div>
      </header>

      {displayPlaces.length > 0 ? (
        <div className="card-grid">
          {displayPlaces.map((place, index) => {
            const isWished = !!wishlist[place.contentid]; // 찜 여부 확인

            return (
              <div key={place.contentid || index} className="card">
                {/* 하트 아이콘 */}
                <div className="heart-icon" onClick={() => toggleWishlist(place)}>
                  {isWished ? '❤️' : '🤍'}
                </div>

                {place.firstimage ? (
                  <img src={place.firstimage} alt={place.title} className="card-image" />
                ) : (
                  <div className="no-image">📷 이미지 준비중</div>
                )}
                <div className="card-content">
                  <h3>{place.title}</h3>
                  <p>{place.addr1}</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          {showWishlist ? '보관함이 비어있습니다. 하트를 눌러 추가해보세요!' : '데이터를 불러오는 중이거나 없습니다.'}
        </div>
      )}
    </div>
  );
}

export default App;