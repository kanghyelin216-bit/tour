// src/App.jsx
import { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { db } from './firebase';
import './App.css';

// 공공데이터포털 디코딩된 서비스 키 적용
const TOUR_API_KEY = "ec3f7ef297eb3f592b66a248f3cdfc87a34e5e89a4950965a1d1c484fd6d6423";

// 지역 코드 매핑 (한국관광공사 API 기준)
const REGIONS = [
  { code: '1', name: '서울' },
  { code: '2', name: '인천' },
  { code: '6', name: '부산' },
  { code: '39', name: '제주' }
];

function App() {
  const [places, setPlaces] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. 초기 로딩 시 Firebase에서 저장된 지역 정보 확인
  useEffect(() => {
    const fetchSavedRegion = async () => {
      const regionRef = ref(db, 'userActivity/lastRegion');
      const snapshot = await get(regionRef);
      
      if (snapshot.exists()) {
        const savedRegionCode = snapshot.val();
        setSelectedRegion(savedRegionCode);
        fetchTourData(savedRegionCode);
      }
    };
    fetchSavedRegion();
  }, []);

  // 2. 공공데이터포털 관광정보 API 호출
  const fetchTourData = async (areaCode) => {
    setLoading(true);
    // 한국관광공사 국문 관광정보 서비스 - 지역기반 관광정보 조회
    const url = `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${TOUR_API_KEY}&numOfRows=12&pageNo=1&MobileOS=ETC&MobileApp=TourApp&_type=json&arrange=A&contentTypeId=12&areaCode=${areaCode}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const items = data.response.body.items.item || [];
      setPlaces(items);
    } catch (error) {
      console.error("API 호출 에러:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. 지역 선택 핸들러 (Firebase 업데이트 및 데이터 재호출)
  const handleRegionChange = async (e) => {
    const newRegionCode = e.target.value;
    if (!newRegionCode) return;

    // 상태 업데이트 및 API 호출
    setSelectedRegion(newRegionCode);
    fetchTourData(newRegionCode);

    // Firebase에 선택한 지역 정보 덮어쓰기 (계속 업데이트)
    await set(ref(db, 'userActivity/lastRegion'), newRegionCode);
  };

  return (
    <div className="container">
      <h1>🗺️ 지역별 여행지 카드북</h1>
      
      <div className="selector">
        <select value={selectedRegion || ""} onChange={handleRegionChange}>
          <option value="" disabled>지역을 선택하세요</option>
          {REGIONS.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="loading">데이터를 불러오는 중입니다...</p>}

      {/* 4. Firebase에 정보가 없고 선택도 안 한 상태면 목록 뷰 숨김 */}
      {!loading && places.length > 0 && (
        <div className="card-grid">
          {places.map((place, index) => (
            <div className="card" key={index}>
              {/* API에서 이미지가 없을 경우 대체 이미지 처리 */}
              <img 
                src={place.firstimage || 'https://via.placeholder.com/300x200?text=No+Image'} 
                alt={place.title} 
              />
              <div className="card-info">
                <h3>{place.title}</h3>
                <p>{place.addr1}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
