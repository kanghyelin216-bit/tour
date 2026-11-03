import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ref, get, set } from 'firebase/database';
import { db } from './firebase.js';

const TOUR_API_KEY = "ec3f7ef297eb3f592b66a248f3cdfc87a34e5e89a4950965a1d1c484fd6d6423";

// 전국 17개 시/도 지역 코드 전체 추가
const REGIONS = [
  { code: '1', name: '서울' },
  { code: '2', name: '인천' },
  { code: '3', name: '대전' },
  { code: '4', name: '대구' },
  { code: '5', name: '광주' },
  { code: '6', name: '부산' },
  { code: '7', name: '울산' },
  { code: '8', name: '세종' },
  { code: '31', name: '경기' },
  { code: '32', name: '강원' },
  { code: '33', name: '충북' },
  { code: '34', name: '충남' },
  { code: '35', name: '경북' },
  { code: '36', name: '경남' },
  { code: '37', name: '전북' },
  { code: '38', name: '전남' },
  { code: '39', name: '제주' }
];

function App() {
  const [places, setPlaces] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const fetchTourData = async (areaCode) => {
    setLoading(true);
    const url = `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${TOUR_API_KEY}&numOfRows=12&pageNo=1&MobileOS=ETC&MobileApp=TourApp&_type=json&arrange=A&contentTypeId=12&areaCode=${areaCode}`;

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

  const handleRegionChange = async (e) => {
    const newRegionCode = e.target.value;
    if (!newRegionCode) return;

    setSelectedRegion(newRegionCode);
    fetchTourData(newRegionCode);
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

      {!loading && places.length > 0 && (
        <div className="card-grid">
          {places.map((place, index) => {
            // Mixed Content 에러 방지를 위해 http를 https로 변환
            const imageUrl = place.firstimage 
              ? place.firstimage.replace('http://', 'https://') 
              : 'https://via.placeholder.com/300x200?text=No+Image';

            return (
              <div className="card" key={index}>
                <img src={imageUrl} alt={place.title} />
                <div className="card-info">
                  <h3>{place.title}</h3>
                  <p>{place.addr1}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
