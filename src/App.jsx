import { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, set, get, child } from 'firebase/database';
import axios from 'axios';
import './App.css'; 

function App() {
  const [places, setPlaces] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');

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

  useEffect(() => {
    const dbRef = ref(database);
    get(child(dbRef, `userPreferences/lastRegion`)).then((snapshot) => {
      if (snapshot.exists()) {
        const savedRegionCode = snapshot.val();
        setSelectedRegion(savedRegionCode);
        fetchTourismData(savedRegionCode);
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
    fetchTourismData(newRegionCode);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>✈️ 여행지 카드북</h1>
        <p>훌쩍 떠나고 싶은 지역을 선택해보세요</p>
        
        <select className="region-select" value={selectedRegion} onChange={handleRegionChange}>
          <option value="">🗺️ 지역 선택하기</option>
          {regions.map(region => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>
      </header>

      {places.length > 0 && (
        <div className="card-grid">
          {places.map((place, index) => (
            <div key={index} className="card">
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
          ))}
        </div>
      )}
    </div>
  );
}

export default App;