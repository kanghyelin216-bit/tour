import { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, set, get, child } from 'firebase/database';
import axios from 'axios';
import './App.css'; // 기본 스타일링 (카드 그리드 등 설정 필요)

function App() {
  const [places, setPlaces] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');

  // 공공데이터포털 디코딩(일반) API 키 (반드시 본인 키로 변경)
  const API_KEY = 'ec3f7ef297eb3f592b66a248f3cdfc87a34e5e89a4950965a1d1c484fd6d6423'; 

  const regions = [
    { code: '1', name: '서울' }, { code: '2', name: '인천' },
    { code: '6', name: '부산' }, { code: '31', name: '경기도' },
    { code: '32', name: '강원도' }, { code: '39', name: '제주도' }
  ];

  // 1. 처음 화면을 켤 때 Firebase에서 마지막 선택 지역 가져오기
  useEffect(() => {
    const dbRef = ref(database);
    get(child(dbRef, `userPreferences/lastRegion`)).then((snapshot) => {
      if (snapshot.exists()) {
        const savedRegionCode = snapshot.val();
        setSelectedRegion(savedRegionCode);
        fetchTourismData(savedRegionCode); // 저장된 지역이 있으면 바로 API 호출
      }
    });
  }, []);

  // 2. 관광정보 API 호출 함수
  const fetchTourismData = async (areaCode) => {
    try {
      const url = `https://apis.data.go.kr/B551011/KorService1/areaBasedList1`;
      const response = await axios.get(url, {
        params: {
          serviceKey: API_KEY,
          numOfRows: 12,
          pageNo: 1,
          MobileOS: 'ETC',
          MobileApp: 'CardBookApp',
          _type: 'json',
          areaCode: areaCode,
          arrange: 'A'
        }
      });
      const items = response.data.response.body.items.item || [];
      setPlaces(items);
    } catch (error) {
      console.error("API 호출 에러:", error);
    }
  };

  // 3. 지역을 변경했을 때 실행되는 함수
  const handleRegionChange = (e) => {
    const newRegionCode = e.target.value;
    if (!newRegionCode) return;

    setSelectedRegion(newRegionCode);
    
    // 선택한 지역을 Firebase에 업데이트
    set(ref(database, 'userPreferences/lastRegion'), newRegionCode);
    
    // 새 지역으로 API 다시 호출
    fetchTourismData(newRegionCode);
  };

  return (
    <div className="App">
      <h1>지역별 여행지 카드북</h1>
      
      {/* 지역 선택 드롭다운 */}
      <select value={selectedRegion} onChange={handleRegionChange}>
        <option value="">지역을 선택하세요</option>
        {regions.map(region => (
          <option key={region.code} value={region.code}>
            {region.name}
          </option>
        ))}
      </select>

      {/* 불러온 데이터가 있을 때만 시각화된 목록 뷰 표출 */}
      {places.length > 0 && (
        <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {places.map((place, index) => (
            <div key={index} className="card" style={{ border: '1px solid #ddd', padding: '10px' }}>
              {place.firstimage ? (
                <img src={place.firstimage} alt={place.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '200px', backgroundColor: '#eee', textAlign: 'center', lineHeight: '200px' }}>이미지 없음</div>
              )}
              <h3>{place.title}</h3>
              <p>{place.addr1}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
