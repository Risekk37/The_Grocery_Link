mapboxgl.accessToken = 'pk.eyJ1Ijoia2l0Mzc3NSIsImEiOiJjbTNzNzZ2NWIwZTF6Mmlvb2Vpb3FkNDlsIn0.bl1LMgktKyBpPkfkFoFYWw';

//Main_map
const Main_map = new mapboxgl.Map({
    container: 'Main_map',
    style: 'mapbox://styles/kit3775/cm6vixkc7002q01qq66wggyxd',
    center: [-96.35, 38.50], 
    zoom: 3.95, 
    attributionControl: false,
    minZoom: 3, // 최소 줌
    maxZoom: 18, // 최대 줌
    maxBounds: [
        [-140, 5], // 서쪽, 남쪽
        [-55, 60] // 동쪽, 북쪽
    ] // 동서남북 제한
});

const Cities_map = new mapboxgl.Map({
    container: 'Cities_map',
    style: 'mapbox://styles/kit3775/cm7hvhz9g00kw01qod6lv4rzb',
    center: [-96.35, 38.50], 
    zoom: 3.95, 
    attributionControl: false,
    minZoom: 3, // 최소 줌
    maxZoom: 18, // 최대 줌
    maxBounds: [
        [-140, 5], // 서쪽, 남쪽
        [-55, 60] // 동쪽, 북쪽
    ] // 동서남북 제한
});


let detail_map; // 전역 변수로 선언만 하고 초기화는 하지 않음
let detailMapInitialized = false; // 초기화 여부 추적 변수
let currentDetailFeatureId = null; // 현재 표시 중인 피처 ID 추적


const layerSettings = {
    delivery: { color: '#001e24', opacity: 0.07, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.7,  outlineOffset:0 },
    demography: { color: '#03748a', opacity: 0.0, outlineColor: '#ffffff', outlineWidth: 0, outlineOpacity: 0,  outlineOffset:0 },
    food: { color: '#cd4e1c', opacity: 0.07, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.7,  outlineOffset:0 },
    deliveryfood: { color: '#FABF1D', opacity: 0, outlineColor: '#ffffff', outlineWidth: 0, outlineOpacity: 0,  outlineOffset:0 },
    fooddemography: { color: '#F215FA', opacity: 0, outlineColor: '#ffffff', outlineWidth: 0, outlineOpacity: 0,  outlineOffset:0 },
    Access_Void: { color: '#ff3600', opacity: 0.6, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.7, outlineOffset: 0}
};

const layerSettings_city = {
    Usa_All_C: { color: '#ff3600', opacity: 0, outlineColor: '#ff3600', outlineWidth: 0.6, outlineOpacity: 1, outlineOffset: 0 },
    Outcome_All: { color: '#ff3600', opacity: 0.6, outlineColor: '#ffffff', outlineWidth: 0.05, outlineOpacity: 1, outlineOffset: -0.5 },
    Poverty_All: { color: '#001e24', opacity: 0.07, outlineColor: '#ffffff', outlineWidth: 0.05, outlineOpacity: 0.9,  outlineOffset:0 },
    Food_All: { color: '#cd4e1c', opacity: 0.07, outlineColor: '#ffffff', outlineWidth: 0.05, outlineOpacity: 0.9,  outlineOffset:0 }
};

// States 레이어 설정 수정 - 외곽선을 처음에는 투명하게
const statesLayerSettings = {
    States: { 
        color: 'rgba(0, 0, 0, 0)', // 완전 투명
        opacity: 0, 
        outlineColor: 'rgba(0, 0, 0, 0)', // 처음에는 투명
        outlineWidth: 5, 
        outlineOpacity: 0,  // 처음에는 투명
        outlineOffset: 0,
        selectedOutlineColor: '#53B2FF', // 선택 시 빨간색
        selectedOutlineOpacity: 0.8
    }
};

// 선택된 주 정보 저장 변수
let selectedStateId = null;

const hoverLayers = ['delivery', 'demography', 'food', 'deliveryfood', 'fooddemography'];
Main_map.on('load', () => {
    Object.keys(layerSettings).forEach(layer => {
        let dataPath = `Prototype/${layer}.geojson`; // 기본 경로 설정
        
        // Usa_All 레이어는 City 폴더에서 가져오기
        if (layer === 'Usa_All_C') {
            dataPath = `City/Usa_All_C.geojson`;
        }

        Main_map.addSource(layer, {
            type: 'geojson',
            data: dataPath
        });
        // Access_Void 레이어에 필터 적용
        if (layer === 'Access_Void') {
            Main_map.addLayer({
                id: layer,
                type: 'fill',
                source: layer,
                layout: {},
                paint: {
                    'fill-color': layerSettings[layer].color, 
                    'fill-opacity': layerSettings[layer].opacity 
                },
                // 여기서 바로 필터 적용
                filter: ['>=', ['get', 'Total'], filteredPopulation]
            });
        } else {
            Main_map.addLayer({
                id: layer,
                type: 'fill',
                source: layer,
                layout: {},
                paint: {
                    'fill-color': layerSettings[layer].color, 
                    'fill-opacity': layerSettings[layer].opacity 
                }
            });
        }
        Main_map.addLayer({
            id: `${layer}-outline`,
            type: 'line',
            source: layer,
            layout: {},
            paint: {
                'line-color': layerSettings[layer].outlineColor, 
                'line-width': layerSettings[layer].outlineWidth, 
                'line-opacity': layerSettings[layer].outlineOpacity, 
                'line-offset': layerSettings[layer].outlineOffset
            }
        });
        Main_map.addLayer({
            id: 'pick_3_layer',
            type: 'circle',
            source: 'Access_Void',
            paint: {
                'circle-radius': 10, // 클릭 가능한 영역을 두 배로 확대
                'circle-color': '#ff0000',
                'circle-opacity': 0
            },
            filter: ['>=', ['get', 'Total'], filteredPopulation]
        });
    });
    
    const statesDropdown = document.getElementById('states-dropdown');
    
    if (!statesDropdown) {
        console.error("States dropdown element not found!");
        return;
    }
    // States 레이어 추가
    Main_map.addSource('States', {
        type: 'geojson',
        data: 'Prototype/States.geojson',
        generateId: true
    });

    // States 레이어 추가 (fill)
    Main_map.addLayer({
        id: 'States',
        type: 'fill',
        source: 'States',
        layout: {},
        paint: {
            'fill-color': statesLayerSettings.States.color,
            'fill-opacity': statesLayerSettings.States.opacity
        }
    });

    // States 레이어 경계선 추가 - feature-state 사용
    Main_map.addLayer({
        id: 'States-outline',
        type: 'line',
        source: 'States',
        layout: {},
        paint: {
            'line-color': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                statesLayerSettings.States.selectedOutlineColor,
                statesLayerSettings.States.outlineColor
            ],
            'line-width': statesLayerSettings.States.outlineWidth,
            'line-opacity': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                statesLayerSettings.States.selectedOutlineOpacity,
                statesLayerSettings.States.outlineOpacity
            ],
            'line-offset': statesLayerSettings.States.outlineOffset
        }
    });

    // GeoJSON 데이터와 드롭다운 상태 추적을 위한 변수
    let statesData = null;
        // 드롭다운 메뉴에 주 목록 추가하는 방식 수정
    // States.geojson 데이터 가져오기
    fetch('Prototype/States.geojson')
    .then(response => response.json())
    .then(data => {
        // 데이터 저장
        statesData = data;
        
        // 주 이름을 알파벳 순으로 정렬
        const stateNames = data.features
            .map((feature, index) => ({
                id: index,
                name: feature.properties.NAME
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        
        // 드롭다운 가져오기
        const statesDropdown = document.getElementById('states-dropdown');
        
        // 이미 HTML에 첫 번째 옵션이 있으므로, 추가 옵션만 추가
        stateNames.forEach(state => {
            const option = document.createElement('option');
            option.value = state.id;
            option.textContent = state.name;
            statesDropdown.appendChild(option);
        });
        
        console.log("Added states to dropdown:", stateNames.length);
        
        // 드롭다운 변경 이벤트 리스너
        statesDropdown.addEventListener('change', function() {
            const selectedValue = this.value;
            
            // "reset" 옵션 선택 시 초기화
            if (selectedValue === "reset") {
                // 이전 선택 상태 제거
                if (selectedStateId !== null) {
                    Main_map.setFeatureState(
                        { source: 'States', id: selectedStateId },
                        { selected: false }
                    );
                }
                
                selectedStateId = null;
                

                
                // 지도 초기 위치로 이동
                Main_map.flyTo({
                    center: [-96.35, 38.50], 
                    zoom: 3.95, 
                    essential: true
                });
                
                console.log("Reset state selection");
                return;
            }
            
            // 나머지 선택 처리 - 기존 코드와 동일
            const selectedId = parseInt(selectedValue, 10);
            console.log("Selected state ID:", selectedId);
            
            // 이전 선택 상태 제거
            if (selectedStateId !== null) {
                Main_map.setFeatureState(
                    { source: 'States', id: selectedStateId },
                    { selected: false }
                );
            }
            
            // 새 선택 상태 적용
            selectedStateId = selectedId;
            Main_map.setFeatureState(
                { source: 'States', id: selectedId },
                { selected: true }
            );
            
            // 저장된 데이터에서 선택된 주 피처 찾기
            const selectedFeature = statesData.features[selectedId];
            
            if (selectedFeature) {
                // 주의 바운드를 계산하여 중심 찾기
                const bounds = new mapboxgl.LngLatBounds();
                
                // 주의 모든 좌표 포인트를 경계에 추가
                const geometry = selectedFeature.geometry;
                if (geometry.type === 'Polygon') {
                    geometry.coordinates.forEach(ring => {
                        ring.forEach(coord => {
                            bounds.extend(coord);
                        });
                    });
                } else if (geometry.type === 'MultiPolygon') {
                    geometry.coordinates.forEach(polygon => {
                        polygon.forEach(ring => {
                            ring.forEach(coord => {
                                bounds.extend(coord);
                            });
                        });
                    });
                }
                
                console.log("Flying to bounds center:", bounds.getCenter());
                
                // 경계의 중심으로 이동
                Main_map.flyTo({
                    center: bounds.getCenter(),
                    zoom: 6,
                    essential: true
                });
            } else {
                console.error("Selected feature not found for ID:", selectedId);
            }
        });
    })
    .catch(error => {
        console.error("Error loading States.geojson:", error);
    });

    
    // 드롭다운 변경 이벤트 리스너
    statesDropdown.addEventListener('change', function() {
        const selectedId = parseInt(this.value, 10);
        
        // 이전 선택 상태 제거
        if (selectedStateId !== null) {
            Main_map.setFeatureState(
                { source: 'States', id: selectedStateId },
                { selected: false }
            );
        }
        
        // 새 선택 상태 적용
        selectedStateId = selectedId;
        Main_map.setFeatureState(
            { source: 'States', id: selectedId },
            { selected: true }
        );
        
        // 선택된 주의 중심으로 이동
        const selectedFeatures = Main_map.querySourceFeatures('States', {
            filter: ['==', ['id'], selectedId]
        });
        
        if (selectedFeatures.length > 0) {
            // 주의 바운드를 계산하여 중심 찾기
            const bounds = new mapboxgl.LngLatBounds();
            
            // 주의 모든 좌표 포인트를 경계에 추가
            const geometry = selectedFeatures[0].geometry;
            if (geometry.type === 'Polygon') {
                geometry.coordinates.forEach(ring => {
                    ring.forEach(coord => {
                        bounds.extend(coord);
                    });
                });
            } else if (geometry.type === 'MultiPolygon') {
                geometry.coordinates.forEach(polygon => {
                    polygon.forEach(ring => {
                        ring.forEach(coord => {
                            bounds.extend(coord);
                        });
                    });
                });
            }
            
            // 경계의 중심으로 이동
            Main_map.flyTo({
                center: bounds.getCenter(),
                zoom: 6,
                essential: true
            });
        }
    });
});


Cities_map.on('load', () => {
    Object.keys(layerSettings_city).forEach(layer => {
        let dataPath = `City/${layer}.geojson`; // 기본 경로 설정
        

        Cities_map.addSource(layer, {
            type: 'geojson',
            data: dataPath
        });
        Cities_map.addLayer({
            id: layer,
            type: 'fill',
            source: layer,
            layout: {},
            paint: {
                'fill-color': layerSettings_city[layer].color, 
                'fill-opacity': layerSettings_city[layer].opacity 
            }
        });
        Cities_map.addLayer({
            id: `${layer}-outline`,
            type: 'line',
            source: layer,
            layout: {},
            paint: {
                'line-color': layerSettings_city[layer].outlineColor, 
                'line-width': layerSettings_city[layer].outlineWidth, 
                'line-opacity': layerSettings_city[layer].outlineOpacity, 
                'line-offset': layerSettings_city[layer].outlineOffset
            }
        }); 
        // Usa_All_C 레이어에 id에 따른 텍스트 추가
        if (layer === 'Usa_All_C') {
            Cities_map.addLayer({
                id: `${layer}-labels`,
                type: 'symbol',
                source: layer,
                layout: {
                    'text-field': [
                        'match',
                        ['get', 'id'],
                        "1", "San Diego",
                        "2", "Los Angeles",
                        "3", "San Jose",
                        "4", "San Antonio",
                        "5", "Houston",
                        "6", "Dallas",
                        "7", "Phoenix",
                        "8", "Philadelphia",
                        "9", "New York",
                        "10", "Chicago",
                        "" // 매칭되지 않는 경우 빈 문자열
                    ],
                    'text-font': ['Open Sans Bold'], // 폰트 스타일
                    'text-size': 10, // 글자 크기
                    'text-offset': [0, -2.5], // 세로 방향으로 5px 위로 이동
                    'text-anchor': 'top' // 텍스트 정렬 기준 (위쪽 정렬)
                },
                paint: {
                    'text-color': '#989EDB', // 글자 색상 (빨강)
                    'text-halo-color': '#ffffff', // 글자 외곽선 색상 (흰색)
                    'text-halo-width': 1.5 // 외곽선 두께
                }
            });

            // ID와 도시 키 매핑
            const idToCityMap = {
                "1": "SanDiego",
                "2": "LosAngeles",
                "3": "SanJose",
                "4": "SanAntonio",
                "5": "Houston",
                "6": "Dallas",
                "7": "Phoneix",  // Phoenix가 Phoneix로 되어 있어 기존 코드와 일치시킴
                "8": "Philadelphia",
                "9": "NewYork",
                "10": "Chicago"
            };

             // 폴리곤 클릭 시 해당 도시로 이동하는 이벤트 추가
             Cities_map.on('click', layer, (e) => {
                const currentZoom = Cities_map.getZoom();
                if (currentZoom <= 6) {
                    if (e.features.length > 0) {
                        const feature = e.features[0];
                        const featureId = feature.properties.id;
                        const cityKey = idToCityMap[featureId];
                        
                        if (cityKey && cityLocations[cityKey]) {
                            const city = cityLocations[cityKey];
                            
                            // flyTo 실행
                            Cities_map.flyTo({
                                center: [city.lng, city.lat],
                                zoom: city.zoom,
                                essential: true
                            });
                            
                            // 드롭다운 선택값 변경 - select 요소
                            const dropdownSelect = document.getElementById('dropdown-button');
                            if (dropdownSelect) {
                                dropdownSelect.value = cityKey;
                                
                                // 선택 변경 이벤트 발생 (관련 기능 트리거 위해)
                                const changeEvent = new Event('change');
                                dropdownSelect.dispatchEvent(changeEvent);
                            }
                            
                            // Usa_All_C 레이어 숨기기
                            Cities_map.setPaintProperty('Usa_All_C', 'fill-opacity', 0);
                            Cities_map.setPaintProperty('Usa_All_C-outline', 'line-opacity', 0);

                            // 다른 레이어들 표시하기
                            ['Outcome_All', 'Food_All', 'Poverty_All'].forEach(layer => {
                                Cities_map.setPaintProperty(layer, 'fill-opacity', layerSettings_city[layer].opacity);
                                Cities_map.setPaintProperty(`${layer}-outline`, 'line-opacity', layerSettings_city[layer].outlineOpacity);
                            });

                            const citiesTab = Array.from(document.querySelectorAll(".Main_tab")).find(tab => 
                                tab.textContent.trim() === "Cities"
                            );
                            
                            if (citiesTab) {
                                // Cities 탭 클릭하여 사이드바 업데이트
                                citiesTab.click();
                                
                                // C_AccessStory 서브 버튼 찾기
                                setTimeout(() => {
                                    const cAccessStoryButton = Array.from(document.querySelectorAll(".sub-button")).find(btn => 
                                        btn.textContent.trim() === "C_AccessStory"
                                    );
                                    
                                    if (cAccessStoryButton) {
                                        // C_AccessStory 버튼 클릭
                                        cAccessStoryButton.click();
                                    }
                                }, 50); // 아주 짧은 지연시간을 두어 DOM이 업데이트될 시간 확보
                            }
                        }
                    }
                }
            });
            // 폴리곤에 마우스 오버시 커서 변경
            Cities_map.on('mouseenter', layer, () => {
                Cities_map.getCanvas().style.cursor = 'pointer';
            });
            
            // 폴리곤에서 마우스 아웃시 커서 복원
            Cities_map.on('mouseleave', layer, () => {
                Cities_map.getCanvas().style.cursor = '';
            });
        }
    });
});
    
// GeoJSON 파일 URL
const townGeoJSON = 'Proto_test/Town.geojson';
const lineGeoJSON = 'Proto_test/Line.geojson';
const lineGroceryGeoJSON = 'Proto_test/Line_grocery.geojson';
const r10miGeoJSON = 'Proto_test/10mi.geojson';
const r5miGeoJSON = 'Proto_test/5mi.geojson';
const r20miGeoJSON = 'Proto_test/20mi.geojson';
const groceryGeoJSON = 'Proto_test/Grocery.geojson';
const packageGeoJSON = 'Proto_test/Package.geojson';
const hospitalGeoJSON = 'Proto_test/Hospital.geojson';
const communityGeoJSON = 'Proto_test/Community_Center.geojson';
const P_5miGeoJSON = 'Proto_test/5mi_p.geojson';
const P_10miGeoJSON = 'Proto_test/10mi_p.geojson';
const P_20miGeoJSON = 'Proto_test/20mi_p.geojson';

// 스타일 설정
const townStyle = {
fillColor: '#FF3600',  // 다각형 색상
fillOpacity: 0.2,      // 다각형 투명도
borderColor: '#F58E78', // 테두리 색상
borderWidth: 0.7,        // 테두리 두께
borderOpacity: 0.9       // 테두리 투명도
};
const lineStyle = {
color: '#ffffff',  // 라인 색상
width: 0.3,         // 라인 두께
opacity: 0.9,      // 라인 투명도
dasharray: [5, 5]
};

const groceryLineStyle = {
color: '#F5847A',  // 식료품점 라인 색상
width: 1.5,         // 식료품점 라인 두께
opacity: 0.9,      // 식료품점 라인 투명도
dasharray: [4, 1]
};

const r10miStyle = {
fillColor: '#ffffff',  // 다각형 색상
fillOpacity: 0.05,      // 다각형 투명도
borderColor: '#ffffff', // 테두리 색상
borderWidth: 1.5,        // 테두리 두께
borderOpacity: 0.5,       // 테두리 투명도
dasharray: [2, .5]
};

const r5miStyle = {
fillColor: '#ffffff',  // 다각형 색상
fillOpacity: 0.00,      // 다각형 투명도
borderColor: '#FFF92C', // 테두리 색상
borderWidth: 1.5,        // 테두리 두께
borderOpacity: 0.5,       // 테두리 투명도
dasharray: [3, 1]
};

const r20miStyle = {
fillColor: '#ffffff',  // 다각형 색상
fillOpacity: 0.00,      // 다각형 투명도
borderColor: '#FFF92C', // 테두리 색상
borderWidth: 1.5,        // 테두리 두께
borderOpacity: 0.5,      // 테두리 투명도
dasharray: [3, 1]
};
// 포인트별 스타일 설정
const grocery_pointStyle = {
    radius: 3,
    fillColor: '#00FF00', // 녹색 (식료품점)
    fillOpacity: 0,
    strokeColor: '#F5847A',
    strokeWidth: 3,
    strokeOpacity: 0.9
};
const package_pointStyle = {
radius: 3,
fillColor: '#FFA500', // 주황색 (택배 보관소)
fillOpacity: 0,
strokeColor: '#F5F16E',
strokeWidth: 3,
strokeOpacity: 0.9
};
const hospital_pointStyle = {
radius: 3,
fillColor: '#FF0000', // 빨간색 (병원)
fillOpacity: 0,
strokeColor: '#8DF5A6',
strokeWidth: 3,
strokeOpacity: 0.9
};
const community_pointStyle = {
radius: 3,
fillColor: '#0000FF', // 파란색 (커뮤니티 센터)
fillOpacity: 0,
strokeColor: '#70B1F5',
strokeWidth: 3,
strokeOpacity: 0.9
};


// Popup 요소 생성
const popup = new mapboxgl.Popup({ closeOnClick: true, anchor: 'bottom' });
let popupVisible = false; // 클릭된 팝업 상태 확인

const idMapSettings = {
"0": { center: [-123.942, 46.276], zoom: 9.5 },
"1": { center: [-122.564, 46.547], zoom: 10 },
"2": { center: [-116.196, 48.725], zoom: 8 },
"3": { center: [-116.196, 48.725], zoom: 8 },
"5": { center: [-123.166, 42.97], zoom: 8 },
"6": { center: [-111.849, 39.812], zoom: 8 },
"7": { center: [-110.063, 40.193], zoom: 8 },
"8": { center: [-111.978, 42.037], zoom: 8 },
"9": { center: [-112.334, 42.115], zoom: 8 },
"10": { center: [-111.587, 46.398], zoom: 8 },
"11": { center: [-104.393, 32.778], zoom: 7.5 },
"12": { center: [-103.396, 31.462], zoom: 7.5 },
"13": { center: [-99.76, 28.446], zoom: 7.5 },
"14": { center: [-96.973, 30.959], zoom: 7.5 },
"15": { center: [-100.532, 32.442], zoom: 7.5 },
"16": { center: [-97.721, 33.665], zoom: 7.5 },
"17": { center: [-99.246, 34.99], zoom: 7.5 },
"18": { center: [-102.063, 35.199], zoom: 7.5 },
"19": { center: [-98.158, 38.708], zoom: 7.5 },
"20": { center: [-99.473, 40.368], zoom: 7.5 },
"21": { center: [-98.569, 41.285], zoom: 7.5 },
"22": { center: [-99.761, 41.485], zoom: 7.5 },
"23": { center: [-100.576, 43.014], zoom: 7.5 },
"24": { center: [-100.823, 43.24], zoom: 7.5 },
"25": { center: [-100.345, 44.465], zoom: 7.5 },
"26": { center: [-101.923, 47.285], zoom: 7.5 },
"27": { center: [-96.041, 46.739], zoom: 7.5 },
"28": { center: [-96.956, 45.542], zoom: 7.5 },
"29": { center: [-94.852, 46.091], zoom: 7.5 },
"30": { center: [-92.835, 46.32], zoom: 7.5 },
"31": { center: [-92.878, 46.486], zoom: 7.5 },
"32": { center: [-95.213, 44.598], zoom: 7.5 },
"33": { center: [-97.021, 43.959], zoom: 7.5 },
"34": { center: [-96.263, 43.514], zoom: 7.5 },
"35": { center: [-96.304, 43.342], zoom: 7.5 },
"36": { center: [-96.981, 42.69], zoom: 7.5 },
"37": { center: [-95.545, 42.862], zoom: 7.5 },
"38": { center: [-95.031, 40.581], zoom: 7.5 },
"39": { center: [-92.784, 43.439], zoom: 7.5 },
"40": { center: [-93.209, 42.893], zoom: 7.5 },
"41": { center: [-94.05, 42.688], zoom: 7.5 },
"42": { center: [-91.966, 41.808], zoom: 7.5 },
"43": { center: [-91.96, 41.77], zoom: 7.5 },
"44": { center: [-91.504, 40.148], zoom: 7.5 },
"45": { center: [-95.729, 40.077], zoom: 7.5 },
"46": { center: [-95.684, 38.612], zoom: 7.5 },
"47": { center: [-96.12, 36.879], zoom: 7.5 },
"48": { center: [-95.636, 36.851], zoom: 7.5 },
"49": { center: [-94.702, 37.543], zoom: 7.5 },
"50": { center: [-94.296, 37.658], zoom: 7.5 },
"51": { center: [-92.799, 38.789], zoom: 7.5 },
"52": { center: [-96.593, 34.875], zoom: 7.5 },
"53": { center: [-96.815, 33.848], zoom: 7.5 },
"54": { center: [-94.854, 34.974], zoom: 7.5 },
"55": { center: [-92.658, 32.828], zoom: 7.5 },
"56": { center: [-92.424, 32.393], zoom: 7.5 },
"57": { center: [-95.894, 31.796], zoom: 7.5 },
"58": { center: [-96.37, 31.116], zoom: 7.5 },
"59": { center: [-95.754, 31.025], zoom: 7.5 },
"60": { center: [-93.344, 31.254], zoom: 7.5 },
"61": { center: [-91.825, 31.768], zoom: 7.5 },
"62": { center: [-96.61, 28.821], zoom: 7.5 },
"63": { center: [-96.217, 28.873], zoom: 7.5 },
"64": { center: [-90.207, 31.365], zoom: 7.5 },
"65": { center: [-90.206, 31.501], zoom: 7.5 },
"66": { center: [-88.702, 31.862], zoom: 7.5 },
"67": { center: [-88.941, 31.349], zoom: 7.5 },
"68": { center: [-87.324, 30.712], zoom: 7.5 },
"69": { center: [-87.035, 30.898], zoom: 7.5 },
"70": { center: [-89.06, 33.723], zoom: 7.5 },
"71": { center: [-90.433, 34.017], zoom: 7.5 },
"72": { center: [-89.168, 34.181], zoom: 7.5 },
"73": { center: [-89.191, 34.616], zoom: 7.5 },
"74": { center: [-88.473, 34.5], zoom: 7.5 },
"75": { center: [-88.564, 34.837], zoom: 7.5 },
"76": { center: [-87.993, 35.379], zoom: 7.5 },
"77": { center: [-88.57, 35.602], zoom: 7.5 },
"78": { center: [-88.756, 37.467], zoom: 7.5 },
"79": { center: [-88.342, 37.737], zoom: 7.5 },
"80": { center: [-88.762, 37.914], zoom: 7.5 },
"81": { center: [-89.34, 37.901], zoom: 7.5 },
"82": { center: [-90.772, 37.765], zoom: 7.5 },
"83": { center: [-88.903, 38.491], zoom: 7.5 },
"84": { center: [-88.955, 38.994], zoom: 7.5 },
"85": { center: [-89.279, 39.115], zoom: 7.5 },
"86": { center: [-90.848, 39.708], zoom: 7.5 },
"87": { center: [-87.748, 38.274], zoom: 7.5 },
"88": { center: [-86.583, 38.104], zoom: 7.5 },
"89": { center: [-86.474, 37.572], zoom: 7.5 },
"90": { center: [-89.781, 40.42], zoom: 7.5 },
"91": { center: [-86.126, 43.714], zoom: 7.5 },
"92": { center: [-89.707, 43.885], zoom: 7.5 },
"93": { center: [-90.13, 44.439], zoom: 7.5 },
"94": { center: [-88.896, 44.17], zoom: 7.5 },
"95": { center: [-89.412, 44.576], zoom: 7.5 },
"96": { center: [-90.496, 44.737], zoom: 7.5 },
"97": { center: [-89.337, 44.886], zoom: 7.5 },
"98": { center: [-88.895, 44.722], zoom: 7.5 },
"99": { center: [-88.654, 44.728], zoom: 7.5 },
"100": { center: [-88.529, 47.031], zoom: 7.5 },
"101": { center: [-85.401, 44.411], zoom: 7.5 },
"102": { center: [-85.144, 43.751], zoom: 7.5 },
"103": { center: [-82.936, 43.708], zoom: 7.5 },
"104": { center: [-84.282, 41.095], zoom: 7.5 },
"105": { center: [-78.728, 40.875], zoom: 7.5 },
"106": { center: [-81.336, 39.797], zoom: 7.5 },
"107": { center: [-81.794, 39.549], zoom: 7.5 },
"108": { center: [-82.291, 38.59], zoom: 7.5 },
"109": { center: [-83.957, 36.7], zoom: 7.5 },
"110": { center: [-82.035, 36.356], zoom: 7.5 },
"111": { center: [-80.015, 36.931], zoom: 7.5 },
"112": { center: [-79.69, 37.521], zoom: 7.5 },
"113": { center: [-79.821, 37.755], zoom: 7.5 },
"114": { center: [-80.644, 37.728], zoom: 7.5 },
"115": { center: [-80.687, 37.965], zoom: 7.5 },
"116": { center: [-79.676, 39.118], zoom: 7.5 },
"117": { center: [-79.106, 39.528], zoom: 7.5 },
"118": { center: [-82.596, 34.093], zoom: 7.5 },
"119": { center: [-82.596, 33.233], zoom: 7.5 },
"120": { center: [-83.201, 32.847], zoom: 7.5 },
"121": { center: [-84.798, 32.049], zoom: 7.5 },
"122": { center: [-82.113, 31.409], zoom: 7.5 },
"123": { center: [-83.299, 30.427], zoom: 7.5 },
"124": { center: [-77.894, 36.855], zoom: 7.5 },
"125": { center: [-75.885, 38.305], zoom: 7.5 },
"126": { center: [-78.721, 39.821], zoom: 7.5 },
"127": { center: [-78.577, 41.212], zoom: 7.5 },
"128": { center: [-77.182, 39.186], zoom: 7.5 },
"129": { center: [-74.971, 43.138], zoom: 7.5 }

}


// 팝업 업데이트 함수 (중복 코드 제거)
function updatePopup(e, isClick) {
    if (!isClick && popupVisible) return; // 클릭된 팝업이 있으면 hover 방지

    const props = e.features[0].properties;
    const idNumber = props.id_number;
    // idNumber에 해당하는 center와 zoom을 idMapSettings에서 가져옴
    const mapSettings = idMapSettings[idNumber] || { center: [-95.683356, 38.609846], zoom: 9.5 }; // 기본값 설정

    
    const imagePath = `satellite/satellite_${idNumber}.png`;

    const town = props.Town || "Unknown";
    const state = props.States || "Unknown";
    const zipcode = props.Zipcode || "Unknown";

    const raceData = [
        { label: "White", value: props["Ratio_White"] },
        { label: "Black", value: props["Ratio_Black and African"] },
        { label: "Other Race", value: props["Ratio_Other Race"] },
        { label: "Asian", value: props["Ratio_Asian"] },
        { label: "Native", value: props["Ratio_Indian and Alaska"] },
        { label: "Pacific Islander", value: props["Ratio_Hawaiian and Pacific"] }
    ];
    const poverty = { label: "- Poverty", value: props["Poverty_Rate"] };

    let maxRace = raceData.reduce((max, r) => {
        let val = parseFloat(r.value) || 0;
        return val > max.value ? { label: r.label, value: val } : max;
    }, { label: "", value: 0 });

    const highlightColor = "#EA8901";
    const categoryMap = {
        income: "Poverty rate is higer than U.S average",
        transportation: "No public transportation",
        road: "Roads are unpaved",
        restaurant: "No Restaurants or cafe in town",
        agriculture: "Surrounded by farmland",
        distance: "Nearest city is more than 100 miles away",
        barriers: "Blocked by natural features(Mountain or river)",
        grocery: "Nearest grocery market is more than 15 miles away",
        facilities: "No Hospital, Post offices or communitiy center in town"
    };
        // 1인 값만 필터링하여 텍스트 리스트 생성
    const categoryTexts = Object.keys(categoryMap)
    .filter(category => props[category] === 1)
    .map(category => categoryMap[category])
    .join("<br>"); // 한 줄씩 추가
    let raceTable = `
        <p style="font-size: 14px; font-weight: bold; margin: 2px 0; color:rgb(43, 43, 43);">- Race Ratio</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; text-align: center; font-size: 12px; color:rgb(43, 43, 43);">
            ${raceData.map(r => `
                <div style="padding: 1px; ${r.label === maxRace.label ? `color: ${highlightColor}; font-weight: bold;` : ''}">
                    <div>${r.label}</div>
                    <div>${r.value ? parseFloat(r.value).toFixed(2) : "0"}%</div>
                </div>
            `).join("")}
        </div>
        <div style="margin-top: 10px; font-size: 14px;">
            <b>${poverty.label}:</b> ${poverty.value ? parseFloat(poverty.value).toFixed(2) : "0"}%
        </div>
    `;

    const popupContent = `
    <div style="position: relative; background: rgba(0, 0, 0, 0.7); color: white; padding: 10px; border-radius: 5px;">
        <div style="position: absolute; top: 10px; left: 10px;">
            <p style="font-size: 15px; margin: 0;"><b>${town}</b></p>
        </div>
        <img src="${imagePath}" alt="Satellite Image" style="width: 200px; height: auto; display: block; margin-bottom: 10px;">
        <div>
            <p style="font-size: 10px; font-weight: bold; margin: 2px 0;">- ${town}, ${state}, ${zipcode}</p>
        </div>
         <!-- detail_button을 팝업 내부에 추가 -->
        <div id="detail_button" onclick="toggleDetailPopup()" style="margin-top: 170px; padding: 5px; background-color: rgba(0, 0, 0, 0); text-align: right; cursor: pointer; font-weight: bold; font-size: 12px; color: #ffffff; position: absolute; bottom: 10px; right: 10px;">
        Detail +
        </div>
    </div>`;
    // detail_content에 이미지 추가
    const detailContent = document.getElementById("detail_content");
    detailContent.innerHTML = `
    <img src="${imagePath}" alt="Satellite Image" style=" margin-left: 10%; margin-top: 10%; width: 80%; height: auto; margin-bottom: 10px; border-radius: 15px; ">
    <div style="position: absolute; top: 10px; left: 10px;">
            <p style="font-size: 18px; margin: 0; color:rgb(43, 43, 43);"><b>${town}</b></p>
    </div>
    <div>
        <div  style="position: absolute; left: 10px;">
            <p style=" font-size: 14px; font-weight: bold; margin: 2px 0;">- ${town}, ${state}, ${zipcode}</p>
            ${raceTable}
            <p style="margin-top: 10px; font-size: 12px;">${categoryTexts}</p>
        </div>
    </div>
    `;

    // x 버튼 스타일을 바꾸기 위한 CSS 코드 추가
    
    // x 버튼 스타일을 바꾸기 위한 CSS 코드 추가
    const style = document.createElement('style');
    style.innerHTML = `
        /* x 버튼 흰색으로 변경 */
        .mapboxgl-popup .mapboxgl-popup-close-button {
            color: white; /* 흰색으로 변경 */
            background-color: transparent; /* 배경 투명 */
            border: none; /* 경계선 제거 */
        }
    `;
    document.head.appendChild(style);  // 스타일을 head에 추가
    

    // 화면의 50%를 기준으로 팝업 위치 조정
    const windowHeight = window.innerHeight;
    const clickY = e.point.y;
    const anchorPosition = clickY < windowHeight / 2 ? 'top' : 'bottom';

    popup.options.anchor = anchorPosition; // 팝업이 클릭된 위치에 따라 위/아래 표시되도록 설정

    // 팝업 표시
    let offsetY = e.lngLat.lat > 40 ? -150 : 10;
    popup.setLngLat([e.lngLat.lng, e.lngLat.lat + offsetY / 10000])
         .setHTML(popupContent)
         .addTo(Main_map);

    popup.isTemporary = !isClick; // 클릭 시 영구, hover 시 일시적
    if (isClick) popupVisible = true; // 클릭된 경우 popupVisible 유지
    
    if (!detailMapInitialized) {
        initializeDetailMap();
    } else {
        setTimeout(() => detail_map.resize(), 100);
    }

    // id에 맞는 레이어만 보이도록 설정
    const layerId = `town-layer-${idNumber}`;  // id 값에 맞게 레이어 생성 (예: 'town-layer-123')

    // 레이어를 동적으로 추가하거나 제거하는 방식
    if (!detail_map.getLayer(layerId)) {
        // 해당 id에 맞는 레이어가 없으면 새로 추가
        detail_map.addLayer({
            id: `${layerId}-10mi-layer`,
            type: 'fill',
            source: '10mi',
            paint: { 
                'fill-color': r10miStyle.fillColor, 
                'fill-opacity': r10miStyle.fillOpacity 
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-10mi-border`,
            type: 'line',
            source: '10mi',
            paint: { 
                'line-color': r10miStyle.borderColor, 
                'line-width': r10miStyle.borderWidth, 
                'line-opacity': r10miStyle.borderOpacity,
                'line-dasharray': r10miStyle.dasharray
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-5mi-layer`,
            type: 'fill',
            source: '5mi',
            paint: { 
                'fill-color': r5miStyle.fillColor, 
                'fill-opacity': r5miStyle.fillOpacity 
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-5mi-border`,
            type: 'line',
            source: '5mi',
            paint: { 
                'line-color': r5miStyle.borderColor, 
                'line-width': r5miStyle.borderWidth, 
                'line-opacity': r5miStyle.borderOpacity,
                'line-dasharray': r5miStyle.dasharray
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });detail_map.addLayer({
            id: `${layerId}-20mi-layer`,
            type: 'fill',
            source: '20mi',
            paint: { 
                'fill-color': r20miStyle.fillColor, 
                'fill-opacity': r20miStyle.fillOpacity 
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-20mi-border`,
            type: 'line',
            source: '20mi',
            paint: { 
                'line-color': r20miStyle.borderColor, 
                'line-width': r20miStyle.borderWidth, 
                'line-opacity': r20miStyle.borderOpacity,
                'line-dasharray':  r20miStyle.dasharray
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });detail_map.addLayer({
            id: `${layerId}-line-layer`,
            type: 'line',
            source: 'line',
            paint: { 
                'line-color': lineStyle.color, 
                'line-width': lineStyle.width, 
                'line-opacity': lineStyle.opacity,
                'line-dasharray': lineStyle.dasharray // 점선 스타일 적용
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });detail_map.addLayer({
            id: `${layerId}-line-grocery-layer`,
            type: 'line',
            source: 'line-grocery',
            paint: { 
                'line-color': groceryLineStyle.color, 
                'line-width': groceryLineStyle.width, 
                'line-opacity': groceryLineStyle.opacity,
                'line-dasharray': lineStyle.dasharray // 점선 스타일 적용
            
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-grocery_point-layer`,
            type: 'circle',
            source: 'grocery',
            paint: {
                'circle-radius': grocery_pointStyle.radius,
                'circle-color': grocery_pointStyle.fillColor,
                'circle-opacity': grocery_pointStyle.fillOpacity,
                'circle-stroke-color': grocery_pointStyle.strokeColor,
                'circle-stroke-width': grocery_pointStyle.strokeWidth,
                'circle-stroke-opacity': grocery_pointStyle.strokeOpacity
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-package_point-layer`,
            type: 'circle',
            source: 'package',
            paint: {
                'circle-radius': package_pointStyle.radius,
                'circle-color': package_pointStyle.fillColor,
                'circle-opacity': package_pointStyle.fillOpacity,
                'circle-stroke-color': package_pointStyle.strokeColor,
                'circle-stroke-width': package_pointStyle.strokeWidth,
                'circle-stroke-opacity': package_pointStyle.strokeOpacity
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-hospital_point-layer`,
            type: 'circle',
            source: 'hospital',
            paint: {
                'circle-radius': hospital_pointStyle.radius,
                'circle-color': hospital_pointStyle.fillColor,
                'circle-opacity': hospital_pointStyle.fillOpacity,
                'circle-stroke-color': hospital_pointStyle.strokeColor,
                'circle-stroke-width': hospital_pointStyle.strokeWidth,
                'circle-stroke-opacity': hospital_pointStyle.strokeOpacity
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-community_point-layer`,
            type: 'circle',
            source: 'community',
            paint: {
                'circle-radius': community_pointStyle.radius,
                'circle-color': community_pointStyle.fillColor,
                'circle-opacity': community_pointStyle.fillOpacity,
                'circle-stroke-color': community_pointStyle.strokeColor,
                'circle-stroke-width': community_pointStyle.strokeWidth,
                'circle-stroke-opacity': community_pointStyle.strokeOpacity
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-point-labels`,
            type: 'symbol',
            source: 'p_5',  // 기존 Point GeoJSON의 Source ID
            layout: {
                'text-field': ['literal', '5mi'],  // 고정된 텍스트 사용
                'text-size': 15,  // 글자 크기
                'text-font': ['Open Sans Bold'],  // 글자 두께 (Bold)
                'text-anchor': 'bottom',  // 글자 위치 (점 위쪽)
                'text-offset': [1, 0],  // 점 옆으로 살짝 이동
                'icon-optional': true  // 아이콘 없이 텍스트만 표시 가능하도록 설정
            },
            paint: {
                'text-color': '#ffffff',  // 글자 색상 (흰색)
                'text-opacity': 0.6  // 투명도 (0=완전 투명, 1=완전 불투명)
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시 
        });detail_map.addLayer({
            id: `${layerId}-point-labels-10`,
            type: 'symbol',
            source: 'p_10',  // 기존 Point GeoJSON의 Source ID
            layout: {
                'text-field': ['literal', '10mi'],  // 고정된 텍스트 사용
                'text-size': 15,  // 글자 크기
                'text-font': ['Open Sans Bold'],  // 글자 두께 (Bold)
                'text-anchor': 'bottom',  // 글자 위치 (점 위쪽)
                'text-offset': [1, 0],  // 점 옆으로 살짝 이동
                'icon-optional': true  // 아이콘 없이 텍스트만 표시 가능하도록 설정
            },
            paint: {
                'text-color': '#ffffff',  // 글자 색상 (흰색)
                'text-opacity': 0.6  // 투명도 (0=완전 투명, 1=완전 불투명)
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });detail_map.addLayer({
            id: `${layerId}-point-labels-20`,
            type: 'symbol',
            source: 'p_20',  // 기존 Point GeoJSON의 Source ID
            layout: {
               'text-field': ['literal', '20mi'],  // 고정된 텍스트 사용
                'text-size': 15,  // 글자 크기
                'text-font': ['Open Sans Bold'],  // 글자 두께 (Bold)
                'text-anchor': 'bottom',  // 글자 위치 (점 위쪽)
                'text-offset': [1, 0],  // 점 옆으로 살짝 이동
                'icon-optional': true  // 아이콘 없이 텍스트만 표시 가능하도록 설정
            },
            paint: {
                'text-color': '#ffffff',  // 글자 색상 (흰색)
                'text-opacity': 0.6  // 투명도 (0=완전 투명, 1=완전 불투명)
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시 
        });
        detail_map.addLayer({
            id: `${layerId}-town-fill`,
            type: 'fill',
            source: 'town',
            paint: { 
                'fill-color': townStyle.fillColor, 
                'fill-opacity': townStyle.fillOpacity 
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        
        detail_map.addLayer({
            id: `${layerId}-town-line`,
            type: 'line',
            source: 'town',
            paint: { 
                'line-color': townStyle.borderColor, 
                'line-width': townStyle.borderWidth, 
                'line-opacity': townStyle.borderOpacity 
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
    }

    // 나머지 레이어들을 제거하여 해당 레이어만 보이게 설정
    const allLayers = detail_map.getStyle().layers;
    allLayers.forEach(layer => {
        if (layer.id.startsWith('town-layer') && 
        layer.id !== `${layerId}-town-fill` && 
        layer.id !== `${layerId}-town-line` &&
        layer.id !== `${layerId}-10mi-layer` &&
        layer.id !== `${layerId}-10mi-border` &&
        layer.id !== `${layerId}-5mi-layer` &&
        layer.id !== `${layerId}-5mi-border` &&
        layer.id !== `${layerId}-20mi-layer` &&
        layer.id !== `${layerId}-20mi-border` &&
        layer.id !== `${layerId}-line-layer` &&
        layer.id !== `${layerId}-line-grocery-layer` &&
        layer.id !== `${layerId}-grocery_point-layer` &&
        layer.id !== `${layerId}-package_point-layer` &&
        layer.id !== `${layerId}-hospital_point-layer` &&
        layer.id !== `${layerId}-community_point-layer`&&
        layer.id !== `${layerId}-point-labels`&&
        layer.id !== `${layerId}-point-labels-10`&&
        layer.id !== `${layerId}-point-labels-20`) {
            detail_map.removeLayer(layer.id);  // 기존의 다른 레이어 제거
        }
    });
    // detail_map의 중심과 줌을 업데이트
    detail_map.setCenter(mapSettings.center);
    detail_map.setZoom(mapSettings.zoom);
}
// 이 함수를 추가
function initializeDetailMap() {
    if (!detailMapInitialized) {
        detail_map = new mapboxgl.Map({
            container: 'detail_map',
            style: 'mapbox://styles/kit3775/cm7alf2vv004501s6gs2y0226',
            center: [-95.683356, 38.609846],
            zoom: 9.5
        });

         // Make sure the container is visible
         document.getElementById('detail_map').style.display = "block";
        
        // 원래 detail_map.on('load') 내부에 있던 코드를 여기로 이동
        detail_map.on('load', () => {
            // Town Layer (Multipolygon)
            detail_map.addSource('10mi', { type: 'geojson', data: r10miGeoJSON });
            detail_map.addSource('5mi', { type: 'geojson', data: r5miGeoJSON });
            detail_map.addSource('20mi', { type: 'geojson', data: r20miGeoJSON });
            detail_map.addSource('town', { type: 'geojson', data: townGeoJSON });
            detail_map.addSource('line', { type: 'geojson', data: lineGeoJSON });
            detail_map.addSource('line-grocery', { type: 'geojson', data: lineGroceryGeoJSON });
            detail_map.addSource('p_5', { type: 'geojson', data: P_5miGeoJSON });
            detail_map.addSource('p_10', { type: 'geojson', data: P_10miGeoJSON });
            detail_map.addSource('p_20', { type: 'geojson', data: P_20miGeoJSON });
            detail_map.addSource('grocery', { type: 'geojson', data: groceryGeoJSON });
            detail_map.addSource('package', { type: 'geojson', data: packageGeoJSON });
            detail_map.addSource('hospital', { type: 'geojson', data: hospitalGeoJSON });
            detail_map.addSource('community', { type: 'geojson', data: communityGeoJSON }); 
        });
        
        detailMapInitialized = true;
    } else {
        // 이미 초기화된 맵이면 resize만 호출
        setTimeout(() => {
            detail_map.resize();
        }, 100);
    }
}
// Hover 시 팝업 표시
Main_map.on('mouseenter', 'pick_3_layer', e => {
    // 필터가 적용된 점들에 대해서만 팝업 표시
    if (filteredPopulation >= 1000) {
        // 필터가 적용된 점들에 대해서만 팝업 표시
        const filter = Main_map.getFilter("Access_Void");
        // 필터가 적용되지 않은 경우에도 팝업을 표시하도록 처리
        if (!filter || filter.length === 0 || filter.length > 0) { 
            updatePopup(e, false);
        }
        Main_map.getCanvas().style.cursor = 'pointer';
    } else {
        // 인구수가 1000 미만이면 포인터는 변경하지만 팝업은 표시하지 않음
        Main_map.getCanvas().style.cursor = 'default';
    }
});
// 마우스 벗어날 때 일시적 팝업 제거
Main_map.on('mouseleave', 'pick_3_layer', () => {
    if (popup.isTemporary) popup.remove();
    Main_map.getCanvas().style.cursor = ''; // 기본 커서로 변경
});

// 클릭 시 팝업 표시 및 hover 비활성화
Main_map.on('click', 'pick_3_layer', e => {
    popup.remove();
    updatePopup(e, true);
});

// 팝업 닫힐 때 hover 다시 활성화
popup.on('close', () => popupVisible = false);

// detail_popup을 토글하는 함수
function toggleDetailPopup() {
    const detailPopup = document.getElementById("detail_popup");
    if (detailPopup.style.display === "none") {
        detailPopup.style.display = "block"; // 보여줌
        initializeDetailMap(); // 맵 초기화 또는 리사이즈
    } else {
        detailPopup.style.display = "none"; // 숨김
    }
}

// detail_popup을 닫는 함수
function closePopup() {
    document.getElementById("detail_popup").style.display = "none";
}

function flyToNewYork() {
    Cities_map.flyTo({
        center: [-73.600181, 40.634650], 
        zoom: 8.5,
        essential: true
    });
}

function flyToMain_city() {
    Cities_map.flyTo({
        center: [-96.35, 38.50], 
        zoom: 3.95,
        essential: true
    });
}

function flyToMain() {
    Main_map.flyTo({
        center: [-96.35, 38.50], 
        zoom: 3.95,
        essential: true
    });
}

// 모든 팝업을 닫는 함수
function closeAllPopups() {
    // Main_map의 popup 닫기 (Access_Void 모드에서 사용하는 팝업)
    if (typeof popup !== 'undefined' && popup) {
        popup.remove();
        if (typeof popupVisible !== 'undefined') {
          popupVisible = false;
        }
      }
    
    // Cities_map의 cityPopup 닫기 (Vulnerable Zone 모드에서 사용하는 팝업)
    if (typeof cityPopup !== 'undefined' && cityPopup) {
        cityPopup.remove();
        // cityPopupVisible 변수가 없을 수 있으므로 안전하게 처리
        // 변수가 있다면 false로 설정하고, 없다면 무시
        if (typeof cityPopupVisible !== 'undefined') {
          cityPopupVisible = false;
        }
      }
    
    // detail_popup 닫기 (두 모드 모두에서 사용)
    const detailPopup = document.getElementById("detail_popup");
    if (detailPopup) {
    detailPopup.style.display = "none";
  }
    
    // street 이미지 숨기기 (Vulnerable Zone 모드에서 사용)
    const streetImage = document.getElementById("street_image");
    if (streetImage) {
      streetImage.style.display = "none";
    }
  }
  
function setupAccessVoidMode() {
    // detail_map 컨테이너 가져오기
    const detailMapContainer = document.getElementById("detail_map");
    
    if (detailMapContainer) {
        // Access_Void 모드에서는 detail_map 표시
        detailMapContainer.style.display = "block";
        
        // 숨겨진 street 이미지 있으면 제거
        const streetImage = document.getElementById("street_image");
        if (streetImage) {
            streetImage.style.display = "none";
        }
        
        // detail_map이 이미 초기화되었다면 리사이즈
        if (detailMapInitialized && detail_map) {
            setTimeout(() => {
                detail_map.resize();
            }, 100);
        }
    }
}

 // Function to hide image grid and reset display button
function resetDisplayButton() {
    const imageGridContainer = document.getElementById('imageGridContainer');
    const displayButton = document.getElementById('Display_button');
    
    if (imageGridContainer) {
      imageGridContainer.style.visibility = 'hidden';
      imageGridContainer.style.opacity = 0;
    }
    
    if (displayButton) {
      displayButton.classList.remove('active');
    }
  } 

    document.addEventListener("DOMContentLoaded", function () {
        // Main 탭과 Sidebar 요소 가져오기
        const mainTabs = document.querySelectorAll(".Main_tab");
        const sidebarName = document.querySelector(".Sidebar_Name");
        const sidebarMainContent = document.querySelector(".Sidebar_Main_Content");
        const subButtonsContainer = document.getElementById("sidebar-sub-content");
        const subButtons = document.querySelectorAll(".sub-button");
        const subContent = document.querySelector(".sub-content");
        const displayButton = document.getElementById("Display_button");
        const myGif = document.getElementById("myGif");
        const sidebar = document.getElementById("sidebar"); // sidebar 요소 가져오기
        const fooddesert = document.getElementById("Food_desert");
        const layercheck = document.getElementById("layercheckboxcontainer");
        const mainMap = document.getElementById("Main_map");  // Main_map 요소
        const citiesMap = document.getElementById("Cities_map");  // Cities_map 요소
        const X = document.getElementById("X");
        const reportcontainercity = document.getElementById("report_container_city");
        const DropDown = document.getElementById("dropdown");
        const Search = document.getElementById("search-container");
        const categoryCity = document.getElementById("categoryContainer_city");
        const category = document.getElementById("categoryTitleContainer");
        const statesButton = document.getElementById("states-dropdown-container");
        const storyNavigation = document.getElementById("story-navigation-container")
        const categoryContainer = document.getElementById("categoryContainer")
        const GroupDelivery = document.getElementById("GroupDelivery")
        const GroupDeliveryOrder = document.getElementById("GroupDelivery_Order")
        // 모든 스토리 관련 컨테이너 제거 함수
        function cleanupAllStoryContainers() {
            console.log("Cleaning up all story containers");
            
            // 1. 그래프 제거
            removeStoryGraphs();
            
            // 2. 스토리 4 컨테이너 숨기기
            const story4Container = document.getElementById('story4-container');
            if (story4Container) {
                story4Container.style.display = "none";
            }
            
            // 3. 스토리 5/6/7 그리드 숨기기
            const story5Grid = document.getElementById('story5-grid');
            if (story5Grid) {
                story5Grid.style.display = "none";
            }
            
            // 4. 스토리 8 컨테이너 숨기기
            const story8Container = document.getElementById('story8-container');
            if (story8Container) {
                story8Container.style.display = "none";
            }
            
            // 5. 스토리 9 컨테이너 숨기기
            const story9Container = document.getElementById('story9-container');
            if (story9Container) {
                story9Container.style.display = "none";
            }
            
            // 6. 스토리 내비게이션 컨테이너 숨기기
            if (storyNavigation) {
                storyNavigation.style.display = "none";
            }
            
            // 7. 메인 맵 표시 (만약 숨겨져 있다면)
            if (mainMap) {
                mainMap.style.display = "block";
            }
            const groupDelivery = document.getElementById('GroupDelivery');
            if (groupDelivery) {
                groupDelivery.style.display = "none";
            }
        }

        // Main 탭별 콘텐츠 설정
        const mainContentData = {
            "About": {
                name: "About",
                content: "The Grocery Link is a data-driven tool for analyzing and visualizing food access issues across the United States. By mapping food desert areas and grocery delivery service distribution, we help identify the most vulnerable communities, enabling policymakers and food industry stakeholders to develop effective solutions. \nThe project focuses on two key issues: 1) lack of physical access to fresh food (food deserts) and 2) limited availability of online grocery delivery services. We particularly highlight areas where these factors overlap ('Access_Void') and urban areas where food deserts coincide with high poverty rates ('Vulnerable_Zone'). \nThrough comprehensive data visualization, The Grocery Link helps understand the complex nature of food access problems and identify areas most in need of policy intervention. The tool especially explores how innovative approaches (such as expanded delivery services) can complement traditional solutions (like building new supermarkets) in addressing food access gaps.",
                subButtons: ["Grocery_Delivery", "Food_Desert", "Reference"],
                subContent: {
                    "Grocery_Delivery": "The COVID-19 pandemic has transformed delivery services from a matter of convenience into a critical pillar of everyday life. Today, delivery services fulfill a broad spectrum of needs, ranging from groceries and pharmaceuticals to household essentials and prepared meals. Rather than serving as a supplementary option, delivery has become an indispensable infrastructure for modern society.\n\n<strong>Key Statistics:</strong> \n- Since 2013, the demand for delivery services has surged, with parcel deliveries increasing nearly fivefold to 16.2 billion in 2023.\n- On average, individuals now receive about 65 parcels annually, highlighting delivery's integration into daily life.\n- Meal and grocery deliveries have also tripled since the pre-pandemic era, surpassing 2,100 and 1,500 daily orders, respectively.\n- Acknowledging this growing dependence, the U.S. government designated delivery services as essential infrastructure during the pandemic.\n\nDespite their increasing significance, delivery services are not equitably accessible to all. We define 'Grocery Delivery Desert' as areas where online grocery delivery is either unavailable or severely restricted. This issue is not merely an inconvenience but a factor that exacerbates socioeconomic disparities. Individuals without access to grocery delivery must physically visit stores, which poses a substantial burden for those with limited mobility or inadequate transportation options. Furthermore, in some regions where grocery delivery is technically available, exorbitant service fees render it impractical for low-income households, effectively excluding them from this essential service. Consequently, the unequal distribution of delivery services reflects and reinforces broader structural inequalities in society. ",
                    "Food_Desert": "Food deserts are regions with limited access to fresh, healthy food. According to the U.S. Department of Agriculture (USDA), urban areas where supermarkets or large grocery stores are more than 0.5-1 mile away, and rural areas where they're more than 10 miles away, qualify as food deserts.\n\n<strong>Characteristics of Food Deserts:</strong>\n- Lack of Geographic Access: Physical distance to adequate food retailers\n- Economic Barriers: High cost of healthy food and limited purchasing power of local residents\n- Transportation Constraints: Lack of personal vehicles and limited public transit options\n- Limited Food Variety: Scarcity of fresh and nutritious food options in available stores\n- Demographic Disparities: Food deserts are disproportionately distributed in minority communities and low-income areas\n- More than 10% of American households do not have access, at all times, to enough food for an active, healthy life for all household members. \n- Rural communities comprise 63% of all U.S counties but 87% of the counties with the highest food insecurity rates.\n- A confluence of factors is driving an increase in food insecurity, including the reduction or elimination of support programs offered during the pandemic and increased inflation. \n\nInsecurity also comes from 'food deserts' which, according to the USDA, take two forms based on data from the 2000 Census of Population and Housing:\n\nSuburbs/Rural: At least 10-mile demarcations to the nearest supermarket\nUrban: 1-mile demarcations to the nearest supermarket\n\nExpanding the availability of nutritious and affordable food by developing and equipping grocery stores, small retailers, corner markets and farmers' markets in communities with limited access is an important part of the Healthy Food Financing Initiative.",
                    "Reference": "The Grocery Link integrates various public and private data sources to provide a comprehensive analysis of food access patterns across the United States.\n\n<strong>Key Data Sources:</strong>\n- USDA Food Access Research Atlas: Used for defining and mapping food desert areas\n- U.S. Census Bureau Data: Provides demographic information, poverty rates, income levels, and other socioeconomic indicators\n- Service Area Data from Major Grocery Delivery Providers: Used to analyze online delivery service availability\n- Transportation and Infrastructure Data: Leverages data from the U.S. Department of Transportation and local transit agencies to assess transportation accessibility\n\n<strong>Analytical Methodology:</strong>\n- Geographic Information System (GIS) Analysis: Identifies and visualizes overlaps between food desert areas and delivery service gaps\n- Demographic Analysis: Explores socioeconomic dimensions of food access issues\n- Accessibility Gap Assessment: Multi-criteria analysis for identifying Access_Voids and Vulnerable_Zones\n- Policy Simulation: Modeling potential impacts of various intervention scenarios on food accessibility\n\nAll data is regularly updated, and our methodology is continuously refined based on feedback from academic and industry experts. Our goal is to provide the most accurate and up-to-date understanding of food access issues to support effective policy and business decisions. \n\n<strong>Reference Project & Reference:</strong>\n- <a href='https://www.ers.usda.gov/data-products/food-access-research-atlas'>Food Access Research Atlas, USDA</a> \n- <a href='https://pmc.ncbi.nlm.nih.gov/articles/PMC8990744/Trude'>ACB, Lowery CM, Ali SH, Vedovato GM. An equity-oriented systematic review of online grocery shopping among low-income populations: \n&nbsp;&nbsp;&nbsp;implications for policy and research. Nutr Rev. 2022 Apr 8;80(5):1294-1310. doi: 10.1093/nutrit/nuab122. PMID: 35076065; PMCID: PMC8990744.</a>\n- <a href='https://www.brookings.edu/articles/delivering-to-deserts-new-data-reveals-the-geography-of-digital-access-to-food-in-the-us/'>Delivering to deserts: New data reveals the geography of digital access to food in the U.S.</a> \n- <a href='https://theintercept.co/officer-involved/'>Officer Involved, Josh Begley</a> \n- <a href='https://climate-conflict.org/www/data-pages/hazards'>Climate—Conflict—Vulnerability Index </a>"
                }
            },
            "Food_Access_Analyzer": {
                name: "Food_Access_Analyzer",
                content: "Food access disparities extend beyond the mere absence of physical grocery stores. This tool examines America's food access crisis through two critical lenses. This helps you analyze data and make informed decisions effectively. ",
                subButtons: ["Access_Void", "Vulnerable_Zone"],
                subContent: {
                    "Access_Void": "Access Void Zones represent critically vulnerable areas where food deserts overlap with regions lacking delivery service coverage. Residents in these zones not only have no nearby grocery stores but also cannot access online grocery delivery services, making their access to fresh food extremely limited. The map identifies these “double burden” areas, helping to pinpoint where the most urgent",
                    "Vulnerable_Zone": "Vulnerable Urban Zones highlights urban areas that are classified as food deserts and have a poverty rate of 20% or higher. While food delivery services may be available in these areas, high delivery costs create additional barriers for low-income households. With both physical and economic access to food limited, these zones require particular attention and policy support.",

                }
            },
            "Access_Story": {
                name: "Access_Story",
                content: "Food access issues in America extend beyond the mere absence of grocery stores, encompassing complex socioeconomic challenges. This story explores the reality of food deserts and delivery service gaps, along with methods that could help address these problems.",
                subButtons: ["Overview", "Usage"],
                subContent: {
                    "Overview": "Group Delivery1",
                    "Usage": "Group Delivery1",
                 }
            },
            "Potential_Implementation": {
                name: "Potential_Implementation",
                content: "<strong>Group Delivery System</strong> \nA Community-Based Approach to Improving Food Access\n\nHaving explored the complexity of food access issues through The Grocery Link tool, it's time to consider innovative approaches to address these challenges. While food deserts and delivery service gaps affect many communities, group delivery systems represent one practical solution that can help mitigate these problems.",
                subButtons: ["Overview", "Usage"],
                subContent: {
                    "Overview": "Group Delivery Chrome Extension integrates seamlessly with existing grocery store websites, allowing users to coordinate grocery orders with nearby neighbors. This community-centered approach offers several key benefits: \n\n<strong>Benefits of Group Delivery:</strong> \n1. Cost Sharing: By splitting delivery fees among multiple households, the per-person cost decreases significantly, making delivery services accessible even to low-income households.\n2. Service Area Expansion: When a certain number of orders are combined, areas previously excluded from delivery service can now receive deliveries, giving residents in food deserts access to fresh food.\n3. Environmental Advantages: Consolidated deliveries reduce delivery vehicle mileage and carbon emissions compared to multiple individual deliveries.\n4. Community Building: Group delivery promotes collaboration between neighbors and creates community networks for sharing food-related information and resources.\n5. Retailer Benefits: Grocery stores benefit from expanded customer bases and increased order volumes, making this a sustainable model from a business perspective.\n\nGroup delivery systems could be considered as part of a comprehensive strategy to improve food access in vulnerable areas. \n\n<strong>Policymakers might consider:</strong>\n1. Incentive Programs: Offering tax benefits or subsidies to grocery stores that provide group delivery services to underserved areas\n2. Delivery Subsidies: Developing programs to subsidize delivery costs for food desert areas and low-income households\n3. Digital Literacy Initiatives: Supporting educational programs on how to use online grocery ordering and group delivery systems\n4. Community Partnerships: Collaborating with local organizations to increase awareness and participation in group delivery programs\n5. The group delivery solution should not be seen as a complete answer to food desert issues, but rather as an important component of a broader strategy to improve food access. This project demonstrates how community-based approaches can contribute to addressing structural problems.",
                    "Usage": "The group delivery solution is implemented as a user-friendly Chrome extension that integrates seamlessly with any online grocery shopping platform. \n\n<strong>Here's how it works:</strong> \n1. Simple Installation: Download and install the extension from the Chrome Web Store. \n2. Automatic Activation: When users visit participating grocery store websites, the extension automatically activates.\n3. Location-Based Group Finding: Users enter their ZIP code, and the extension displays active group delivery opportunities within a 10-mile radius.\n4. Join or Create: Users can join existing groups or create new group deliveries, setting preferred delivery dates and times.\n5. Community Features: An integrated community forum allows neighbors to communicate and share food-related information and advice.\n6. This Chrome extension is currently in beta testing and available for anyone interested in addressing food access issues to try. The success of this project depends on community engagement and collaboration among various stakeholders."
                }
            }
        };

    
        // Main 탭 클릭 이벤트
        mainTabs.forEach(tab => {
            
            tab.addEventListener("click", function () {
                // 랜딩 페이지 제거
                const landingPage = document.getElementById('landing-page');
                if (landingPage) {
                    landingPage.style.transition = 'opacity 0.5s ease';
                    landingPage.style.opacity = '0';
                    
                    setTimeout(() => {
                        landingPage.remove();
                        
                        // 숨겨진 요소들 다시 표시
                        const contentElements = [
                            document.getElementById('Main_map'),
                            document.getElementById('Cities_map'),
                            document.getElementById('sidebar')
                        ];
                        
                        contentElements.forEach(element => {
                            if (element) {
                                element.style.display = 'block';
                            }
                        });
                    }, 500);
                }
                // 여기에 Display_button 리셋 코드 추가
                const imageGridContainer = document.getElementById('imageGridContainer');
                const displayButton = document.getElementById('Display_button');
                if (imageGridContainer) {
                    imageGridContainer.style.visibility = 'hidden';
                    imageGridContainer.style.opacity = 0;
                }
                if (displayButton) {
                    displayButton.classList.remove('active');
                }
                const selectedTab = tab.textContent.trim();
                // 여기에 모든 팝업 닫기 함수 호출 추가
                closeAllPopups();

                // 다른 탭으로 이동할 때 모든 스토리 컨테이너 정리
            if (selectedTab !== "Access_Story") {
                cleanupAllStoryContainers();
            }

                // 스토리 그래프 제거 - 탭 전환 시마다 모든 그래프 제거
                removeStoryGraphs();

                // States 선택 초기화 (다른 탭으로 이동할 때마다)
                if (selectedStateId !== null) {
                    Main_map.setFeatureState(
                        { source: 'States', id: selectedStateId },
                        { selected: false }
                    );
                    selectedStateId = null;
                    
                    // 드롭다운 초기화 (Select states로 돌려놓기)
                    const statesDropdown = document.getElementById('states-dropdown');
                    if (statesDropdown) {
                        statesDropdown.selectedIndex = 0; // 첫 번째 옵션 선택 (Select states)
                    }
                }
                // 도시 드롭다운 초기화 추가
                const cityDropdown = document.getElementById('dropdown-button');
                if (cityDropdown) {
                    cityDropdown.selectedIndex = 0; // 첫 번째 옵션 선택 (Select the City)
                }
                // 슬라이더 초기화 추가
                resetSliders();
                resetCitySliders(); // 도시 슬라이더도 초기화
                // 추가: Factor Filters 체크박스 초기화
                resetCategoryFilters();

                if (mainContentData[selectedTab]) {
                    const data = mainContentData[selectedTab];
    
                    // Sidebar 업데이트
                    sidebarName.innerHTML = data.name;
                    
                    // Add this line to update the main content
                    sidebarMainContent.innerHTML = data.content;
                    sidebarMainContent.style.whiteSpace = 'pre-wrap';
                    // 기존 sub-button 제거
                    subButtonsContainer.innerHTML = "";
    
                    // 새로운 sub-button 추가
                    data.subButtons.forEach(buttonText => {
                        const button = document.createElement("div");
                        button.classList.add("sub-button");
                        button.textContent = buttonText;
                        subButtonsContainer.appendChild(button);
    
                        // sub-button 클릭 이벤트 추가
                        button.addEventListener("click", function () {
                            // 여기에 Display_button 리셋 코드 추가
                            const imageGridContainer = document.getElementById('imageGridContainer');
                            const displayButton = document.getElementById('Display_button');
                            if (imageGridContainer) {
                                imageGridContainer.style.visibility = 'hidden';
                                imageGridContainer.style.opacity = 0;
                            }
                            if (displayButton) {
                                displayButton.classList.remove('active');
                            }
    
                            // 모든 팝업 닫기 함수 호출 추가
                            closeAllPopups();
                             // States 선택 초기화
                            if (selectedStateId !== null) {
                                Main_map.setFeatureState(
                                    { source: 'States', id: selectedStateId },
                                    { selected: false }
                                );
                                selectedStateId = null;
                                
                                // 드롭다운 초기화 (Select states로 돌려놓기)
                                const statesDropdown = document.getElementById('states-dropdown');
                                if (statesDropdown) {
                                    statesDropdown.selectedIndex = 0; // 첫 번째 옵션 선택 (Select states)
                                }
                            }

                            // 도시 드롭다운 초기화 추가
                            const cityDropdown = document.getElementById('dropdown-button');
                            if (cityDropdown) {
                                cityDropdown.selectedIndex = 0; // 첫 번째 옵션 선택 (Select the City)
                            }

                            // 슬라이더 초기화 추가
                            resetSliders();
                            // 추가: Factor Filters 체크박스 초기화
                            resetCategoryFilters();
                            subContent.innerHTML = data.subContent[buttonText];
    
                            // 모든 sub-button에서 active 클래스 제거
                            document.querySelectorAll(".sub-button").forEach(btn => btn.classList.remove("active"));
    
                            // 현재 클릭된 버튼에 active 클래스 추가
                            button.classList.add("active");

                              // "AccessStory" 버튼 클릭 시 Display_button 보이기
                            if (buttonText === "Access_Void") {
                                if (selectedTab === "Food_Access_Analyzer") {
                                displayButton.style.display = "block";  // "AccessStory"일 때만 보이게 설정
                                flyToMain();
                            } else {
                                displayButton.style.display = "none";  // "AccessStory"이 아닌 경우 숨기기
                            }}

                            if (buttonText === "Access_Void") {
                                if (selectedTab === "Food_Access_Analyzer") {
                                layercheck.style.display = "block";
                                
                                flyToMain();
                                category.style.display = "flex";
                                mainMap.style.display = "block";
                                displayButton.style.display = "block";
                                citiesMap.style.display = "none";
                                X.style.display = "none";
                                 // 🔹 opacity 변경 기능 추가
                                 const layersToChange = ['delivery', 'food', 'demography', 'Access_Void'];
                                 layersToChange.forEach(layer => {
                                     Main_map.setPaintProperty(layer, 'fill-opacity', layerSettings[layer].opacity );
                                     Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', layerSettings[layer].outlineOpacity);
                                });
                                reportcontainercity.style.display = "none";
                                DropDown.style.display = "none";
                                Search.style.display = "flex";
                                categoryCity.style.display = "none";
                                layercheck.style.display = "block"; 
                                statesButton.style.display = "block";
                            }} else {
                                layercheck.style.display = "none";
                                category.style.display = "none";
                            }
                            
                           
                      
                            if (buttonText === "Grocery_Delivery") {
                                myGif.style.display = "block";  // "Rural"일 때만 보이게 설정
                            } else {
                                myGif.style.display = "none";  // "Rural"이 아닌 경우 숨기기
                            }
                            
                            if (buttonText === "Food_Desert") {
                                fooddesert.style.display = "block";  // "Rural"일 때만 보이게 설정
                            } else {
                                fooddesert.style.display = "none";  // "Rural"이 아닌 경우 숨기기
                            }
                            if (buttonText === "Vulnerable_Zone") {
                                if (selectedTab === "Food_Access_Analyzer") {
                                const layersToChange = ['Outcome_All', 'Food_All', 'Poverty_All'];
                                layersToChange.forEach(layer => {
                                    Cities_map.setPaintProperty(layer, 'fill-opacity', layerSettings_city[layer].opacity);
                                    Cities_map.setPaintProperty(`${layer}-outline`, 'line-opacity', layerSettings_city[layer].outlineOpacity);
                                });
                                const layersToChange2 = ['Usa_All_C'];
                                layersToChange2.forEach(layer => {
                                Cities_map.setPaintProperty(layer, 'fill-opacity', layerSettings_city[layer].opacity );
                                Cities_map.setPaintProperty(`${layer}-outline`, 'line-opacity', layerSettings_city[layer].outlineOpacity);
                                });
                                DropDown.style.display = "block";
                                displayButton.style.display = "none"; 
                                Search.style.display = "flex";
                                flyToMain_city();
                                
                                mainMap.style.display = "none";
                                citiesMap.style.display = "block";
                                X.style.display = "none";
                                 // 🔹 opacity 변경 기능 추가
                                
                                statesButton.style.display = "none";
                                storyNavigation.style.display = "none";
                                reportcontainercity.style.display = "block";
                                displayButton.style.display = "block";  // "AccessStory"일 때만 보이게 설정
                                categoryContainer.style.display = "none";
                                flyToMain_city();   
                                setTimeout(() => {
                                    if (Cities_map) {
                                        // Outcome_All 레이어에 필터 적용
                                        Cities_map.setFilter('Outcome_All', [
                                            'all',
                                            ['>=', ['get', 'id_individual'], 1000],
                                            ['>=', ['get', 'Poverty_Percent'], 20]
                                        ]);
                                        console.log("Initial filters applied: Population >= 1000, Poverty >= 20%");
                                    }
                                }, 300); // 맵이 완전히 로드되기를 기다리기 위한 짧은 지연
                            }} else {reportcontainercity.style.display = "none";}
                               
                            if (button.textContent.trim() !== "Vulnerable_Zone") {
                                resetCitySliders();
                            }
                            if (buttonText === "Usage") {
                                if (selectedTab === "Potential_Implementation") {
                                GroupDeliveryOrder.style.display = "Block";
                                GroupDelivery.style.display = "none";
                                }}
                            if (buttonText === "Overview") {
                                if (selectedTab === "Potential_Implementation") {
                                GroupDeliveryOrder.style.display = "none";
                                GroupDelivery.style.display = "block";
                                }}
                            
                            
                        });
                    });
    
                    // 기본 sub-content 설정
                    subContent.innerHTML = data.subContent[data.subButtons[0]];
                    // 첫 번째 서브 버튼에 active 클래스 추가
                    subButtonsContainer.firstChild.classList.add("active");
                    // Main_tab 클릭 시 displayButton 숨기기
                    if (selectedTab !== "Food_Access_Analyzer") {
                        displayButton.style.display = "none";  // Main_tab을 클릭하면 숨기기
                        category.style.display = "none"; 
                        layercheck.style.display = "none";
                        
                    } else {
                        displayButton.style.display = "block";  // "View(Rural/City)" 클릭 시 Display_button 보이기
                        category.style.display = "flex"; 
                        layercheck.style.display = "blcok";
                        
                    }
                    if (selectedTab!== "About") {
                        myGif.style.display = "none";  // Main_tab을 클릭하면 숨기기
                    } else {
                        myGif.style.display = "block"; // "View(Rural/City)" 클릭 시 Display_button 보이기
                    }
                    if (selectedTab) {
                        categoryContainer.style.display = "none"; 
                        fooddesert.style.display = "none"; 
                    } else {
                        categoryContainer.style.display = "block"; 
                    }
                    if (selectedTab =="Food_Access_Analyzer") {
                        layercheck.style.display = "block"; 
                        mainMap.style.display = "block";
                        displayButton.style.display = "block";
                        citiesMap.style.display = "none";
                        X.style.display = "none";
                         // 🔹 opacity 변경 기능 추가
                         const layersToChange = ['delivery', 'food', 'demography', 'Access_Void'];
                         layersToChange.forEach(layer => {
                             Main_map.setPaintProperty(layer, 'fill-opacity', layerSettings[layer].opacity );
                             Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', layerSettings[layer].outlineOpacity);
                        });
                        reportcontainercity.style.display = "none";
                        DropDown.style.display = "none";
                        Search.style.display = "flex";
                        categoryCity.style.display = "none";
                        subButtonsContainer.style.display ="flex";
                        statesButton.style.display = "block";
                        storyNavigation.style.display = "none";
                        subContent.style.display= "block";
                        GroupDelivery.style.display = "none";
                        GroupDeliveryOrder.style.display = "none";
                    } else {
                        layercheck.style.display = "none";
                    }
                   
                    if (selectedTab =="Potential_Implementation") {
                        X.style.display = "none";
                         // 🔹 opacity 변경 기능 추가
                         const layersToChange = ['delivery', 'food', 'demography', 'Access_Void'];
                         layersToChange.forEach(layer => {
                             Main_map.setPaintProperty(layer, 'fill-opacity', 0);
                             Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                         });
                        reportcontainercity.style.display = "none";
                        DropDown.style.display = "none";
                        categoryCity.style.display = "none";
                        storyNavigation.style.display = "none";
                        subContent.style.display= "block";
                        subButtonsContainer.style.display ="flex";
                        GroupDelivery.style.display = "block";
                        GroupDeliveryOrder.style.display = "none";
                    }

                    if (selectedTab =="About") {
                        X.style.display = "block";
                         // 🔹 opacity 변경 기능 추가
                         const layersToChange = ['delivery', 'food', 'demography', 'Access_Void'];
                         layersToChange.forEach(layer => {
                             Main_map.setPaintProperty(layer, 'fill-opacity', 0.07);
                             Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0.9);
                         });
                        reportcontainercity.style.display = "none"; 
                        DropDown.style.display = "none";
                        Search.style.display = "none";
                        categoryCity.style.display = "none";
                        subButtonsContainer.style.display ="flex";
                        storyNavigation.style.display = "none";
                        statesButton.style.display = "none";
                        subContent.style.display= "block";
                        categoryContainer = style.display = "none";
                        GroupDelivery.style.display = "none";
                        GroupDeliveryOrder.style.display = "none";
                    }

                    if (selectedTab === "Access_Story") {
                        statesButton.style.display = "none";
                        subButtonsContainer.style.display ="none";
                        Search.style.display = "none";
                        storyNavigation.style.display = "Block";
                        DropDown.style.display = "none";
                        categoryCity.style.display = "none";
                        reportcontainercity.style.display = "none"; 
                        mainMap.style.display = "block";
                        citiesMap.style.display = "none";
                        subContent.style.display= "none";
                        categoryContainer.style.display = "none";
                        GroupDelivery.style.display = "none";
                        GroupDeliveryOrder.style.display = "none";
                        
                         // 새로 추가: 항상 스토리를 처음부터 시작
                        resetStoryToBeginning();

                        if (Main_map) {
                            // 모든 레이어 투명도 초기화
                            const layersToChange = ['delivery', 'food', 'demography', 'Access_Void'];
                            layersToChange.forEach(layer => {
                                if (layer === 'food') {
                                    // food 레이어만 0.7 투명도로 표시
                                    Main_map.setPaintProperty(layer, 'fill-opacity', 0.7);
                                    Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0.9);
                                } else {
                                    // 나머지 레이어는 숨김
                                    Main_map.setPaintProperty(layer, 'fill-opacity', 0);
                                    Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                                }
                            });
                            
                            // 필요하다면 지도 위치 이동
                            Main_map.flyTo({
                                center: [-96.35, 38.50], 
                                zoom: 3.95, 
                                essential: true
                            });
                        }
                        
                    }
                    
                }
            });
        });

        // 초기 상태 설정 (View(Rural/City) 탭 기준)
    mainTabs[1].click();  // "View(Rural/City)" 탭을 클릭
});

document.addEventListener("DOMContentLoaded", function () {
    const mainTabs = document.querySelectorAll(".Main_tab");
    const sidebarMainContent = document.querySelector(".Sidebar_Main_Content");

    mainTabs.forEach(tab => {
        tab.addEventListener("click", function () {
            const tabName = this.textContent.trim(); // 클릭한 탭의 이름 가져오기

            if (tabName === "About") {
                sidebar.style.width = "60vw";; // About 선택 시 width 변경
            } else {
                sidebar.style.width = ""; // 다른 탭 선택 시 기본값으로 되돌리기
            }
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const mainTabs = document.querySelectorAll(".Main_tab");
    const X = document.getElementById("X"); // X 버튼 가져오기

    if (X && mainTabs.length > 1) {
        X.addEventListener("click", function () {
            mainTabs[1].click(); // 'Suburbs' 탭 (두 번째 요소) 클릭 이벤트 발생
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar"); // sidebar 요소 가져오기
    sidebar.style.width = "60vw"; // 처음 페이지 로드 시 width 설정
});

document.addEventListener("DOMContentLoaded", function () {
    const checkboxes = document.querySelectorAll("#categoryContainer input[type='checkbox']");
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", updatePick3Layer);
    });

    function updatePick3Layer() {
        const selectedCategories = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        if (selectedCategories.length === 0) {
            // 카테고리가 선택되지 않았을 때, 모든 폴리곤을 표시
            Main_map.setFilter("Access_Void", null);
        } else {
            // 선택된 모든 카테고리 값이 1인 폴리곤만 표시
            const filter = ["all"];
            selectedCategories.forEach(category => {
                filter.push(["==", ["get", category], 1]);
            });

            Main_map.setFilter("Access_Void", filter);
        }
    }
});
// ImageGrid 설정
const imageGrid = document.getElementById("imageGrid");
const totalImages = 129;
const excludeImages = [1, 4, 93]; // 제외할 이미지 목록

// 'pick_3.geojson' 데이터를 불러와서 체크박스에 맞는 이미지 필터링
// ImageGrid 설정 - 현재 표시된 Access_Void 폴리곤에 맞게 이미지 필터링
function loadImagesByCategory() {
    const imageGrid = document.getElementById("imageGrid");
    if (!imageGrid) return;
    
    imageGrid.innerHTML = '';
    
    // 1. 현재 선택된 필터 값 가져오기
    const selectedCategories = Array.from(document.querySelectorAll("#categoryContainer input[type='checkbox']:checked"))
        .map(checkbox => checkbox.value);
    const populationThreshold = filteredPopulation;
    const povertyThreshold = filteredPovertyRate;
    
    fetch('Prototype/Access_Void.geojson')
        .then(response => response.json())
        .then(data => {
            // 2. 기본 필터링 (인구수 및 빈곤율)
            let filteredFeatures = data.features.filter(feature => 
                feature.properties.Total >= populationThreshold && 
                feature.properties.Poverty_Rate >= povertyThreshold &&
                feature.properties.id_number && 
                !excludeImages.includes(feature.properties.id_number)
            );
            
            // 3. 카테고리 필터링 (선택된 경우)
            if (selectedCategories.length > 0) {
                filteredFeatures = filteredFeatures.filter(feature => {
                    // 모든 선택된 카테고리에 대해 값이 1이어야 함
                    return selectedCategories.every(category => 
                        feature.properties[category] === 1
                    );
                });
            }
            
            // 4. 결과가 없는 경우 메시지 표시
            if (filteredFeatures.length === 0) {
                const noResultsMsg = document.createElement("p");
                noResultsMsg.textContent = "No images match the current filters.";
                noResultsMsg.className = "no-results-message";
                imageGrid.appendChild(noResultsMsg);
                return;
            }
            
            // 5. 이미지 추가
            filteredFeatures.forEach(feature => {
                const idNumber = feature.properties.id_number;
                if (idNumber) { // id_number가 있는 경우에만 이미지 추가
                    const imgElement = document.createElement("img");
                    imgElement.src = `satellite/satellite_${idNumber}.png`;
                    imgElement.alt = `Image ${idNumber}`;
                    imgElement.addEventListener('click', () => openDetailPopup(idNumber));
                    imageGrid.appendChild(imgElement);
                }
            });
        })
        .catch(error => {
            console.error('Error loading Access_Void.geojson:', error);
            const errorMsg = document.createElement("p");
            errorMsg.textContent = "Error loading images. Please try again.";
            errorMsg.className = "error-message";
            imageGrid.appendChild(errorMsg);
        });
}


// detail_popup을 여는 함수
function openDetailPopup(idNumber) {
    
    const detailPopup = document.getElementById("detail_popup");
    if (!detailPopup) {
        console.error("detail_popup element not found");
        return;
    }

    const detailMapContainer = document.getElementById("detail_map");
    if (detailMapContainer) {
        detailMapContainer.style.display = "block";
    }

    // Hide street image if it exists
    const streetImage = document.getElementById("street_image");
    if (streetImage) {
        streetImage.style.display = "none";
    }

    // 데이터 fetch
    fetch('Prototype/Access_Void.geojson')
        .then(response => response.json())
        .then(data => {
            // idNumber에 해당하는 feature 찾기
            const feature = data.features.find(f => f.properties.id_number === idNumber);
            const mapSettings = idMapSettings[idNumber] || { center: [-95.683356, 38.609846], zoom: 9.5 }; // 기본값 설정
            if (feature) {
                const props = feature.properties;
                const town = props.Town || "Unknown";
                const state = props.States || "Unknown";
                const zipcode = props.Zipcode || "Unknown";
                
                // Race data 구성
                const raceData = [
                    { label: "White", value: props["Ratio_White"] },
                    { label: "Black", value: props["Ratio_Black and African"] },
                    { label: "Other Race", value: props["Ratio_Other Race"] },
                    { label: "Asian", value: props["Ratio_Asian"] },
                    { label: "Native", value: props["Ratio_Indian and Alaska"] },
                    { label: "Pacific Islander", value: props["Ratio_Hawaiian and Pacific"] }
                ];
                
                // 가장 높은 비율의 인종 찾기
                let maxRace = raceData.reduce((max, r) => {
                    let val = parseFloat(r.value) || 0;
                    return val > max.value ? { label: r.label, value: val } : max;
                }, { label: "", value: 0 });
                
                const poverty = { label: "- Poverty", value: props["Poverty_Rate"] };
                const highlightColor = "#EA8901";
                
                // 카테고리 매핑
                const categoryMap = {
                    income: "Poverty rate is higer than U.S average",
                    transportation: "No public transportation",
                    road: "Roads are unpaved",
                    restaurant: "No Restaurants or cafe in town",
                    agriculture: "Surrounded by farmland",
                    distance: "Nearest city is more than 100 miles away",
                    barriers: "Blocked by natural features(Mountain or river)",
                    grocery: "Nearest grocery market is more than 15 miles away",
                    facilities: "No Hospital, Post offices or communitiy center in town"
                };
                
                // 카테고리 텍스트 생성
                const categoryTexts = Object.keys(categoryMap)
                    .filter(category => props[category] === 1)
                    .map(category => categoryMap[category])
                    .join("<br>");
                    
                // Race 테이블 생성
                let raceTable = `
                    <p style="font-size: 14px; font-weight: bold; margin: 2px 0; color:rgb(43, 43, 43);">- Race Ratio</p>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; text-align: center; font-size: 12px; color:rgb(43, 43, 43);">
                        ${raceData.map(r => `
                            <div style="padding: 1px; ${r.label === maxRace.label ? `color: ${highlightColor}; font-weight: bold;` : ''}">
                                <div>${r.label}</div>
                                <div>${r.value ? parseFloat(r.value).toFixed(2) : "0"}%</div>
                            </div>
                        `).join("")}
                    </div>
                    <div style="margin-top: 10px; font-size: 14px;">
                        <b>${poverty.label}</b> ${poverty.value ? parseFloat(poverty.value).toFixed(2) : "0"}%
                    </div>
                `;
                
                // 팝업 내용 업데이트
                const detailContent = detailPopup.querySelector("#detail_content") || detailPopup;
                detailContent.innerHTML = `
                    <img src="satellite/satellite_${idNumber}.png" alt="Satellite Image" style="margin-left: 10%; margin-top: 10%; width: 80%; height: auto; margin-bottom: 10px; border-radius: 15px;">
                    <div style="position: absolute; top: 10px; left: 10px;">
                        <p style="font-size: 18px; margin: 0; color:rgb(43, 43, 43);"><b>${town}</b></p>
                    </div>
                    <div>
                        <div style="position: absolute; left: 10px;">
                            <p style="font-size: 14px; font-weight: bold; margin: 2px 0;">- ${town}, ${state}, ${zipcode}</p>
                            ${raceTable}
                            <p style="margin-top: 10px; font-size: 12px;">${categoryTexts}</p>
                        </div>
                    </div>
                    
                `;
                // id에 맞는 레이어만 보이도록 설정
    detailPopup.style.display = "block";
    
    // 맵 초기화 또는 리사이즈
    if (!detailMapInitialized) {
        initializeDetailMap();
    } else {
        setTimeout(() => detail_map.resize(), 100);
    }
    const layerId = `town-layer-${idNumber}`;  // id 값에 맞게 레이어 생성 (예: 'town-layer-123')

    // 레이어를 동적으로 추가하거나 제거하는 방식
    if (!detail_map.getLayer(layerId + '-town-fill')) {
        // 해당 id에 맞는 레이어가 없으면 새로 추가
        detail_map.addLayer({
            id: `${layerId}-10mi-layer`,
            type: 'fill',
            source: '10mi',
            paint: { 
                'fill-color': r10miStyle.fillColor, 
                'fill-opacity': r10miStyle.fillOpacity 
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-10mi-border`,
            type: 'line',
            source: '10mi',
            paint: { 
                'line-color': r10miStyle.borderColor, 
                'line-width': r10miStyle.borderWidth, 
                'line-opacity': r10miStyle.borderOpacity,
                'line-dasharray': r10miStyle.dasharray
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-5mi-layer`,
            type: 'fill',
            source: '5mi',
            paint: { 
                'fill-color': r5miStyle.fillColor, 
                'fill-opacity': r5miStyle.fillOpacity 
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-5mi-border`,
            type: 'line',
            source: '5mi',
            paint: { 
                'line-color': r5miStyle.borderColor, 
                'line-width': r5miStyle.borderWidth, 
                'line-opacity': r5miStyle.borderOpacity,
                'line-dasharray': r5miStyle.dasharray
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });detail_map.addLayer({
            id: `${layerId}-20mi-layer`,
            type: 'fill',
            source: '20mi',
            paint: { 
                'fill-color': r20miStyle.fillColor, 
                'fill-opacity': r20miStyle.fillOpacity 
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-20mi-border`,
            type: 'line',
            source: '20mi',
            paint: { 
                'line-color': r20miStyle.borderColor, 
                'line-width': r20miStyle.borderWidth, 
                'line-opacity': r20miStyle.borderOpacity,
                'line-dasharray':  r20miStyle.dasharray
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });detail_map.addLayer({
            id: `${layerId}-line-layer`,
            type: 'line',
            source: 'line',
            paint: { 
                'line-color': lineStyle.color, 
                'line-width': lineStyle.width, 
                'line-opacity': lineStyle.opacity,
                'line-dasharray': lineStyle.dasharray // 점선 스타일 적용
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });detail_map.addLayer({
            id: `${layerId}-line-grocery-layer`,
            type: 'line',
            source: 'line-grocery',
            paint: { 
                'line-color': groceryLineStyle.color, 
                'line-width': groceryLineStyle.width, 
                'line-opacity': groceryLineStyle.opacity,
                'line-dasharray': lineStyle.dasharray // 점선 스타일 적용
            
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-grocery_point-layer`,
            type: 'circle',
            source: 'grocery',
            paint: {
                'circle-radius': grocery_pointStyle.radius,
                'circle-color': grocery_pointStyle.fillColor,
                'circle-opacity': grocery_pointStyle.fillOpacity,
                'circle-stroke-color': grocery_pointStyle.strokeColor,
                'circle-stroke-width': grocery_pointStyle.strokeWidth,
                'circle-stroke-opacity': grocery_pointStyle.strokeOpacity
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-package_point-layer`,
            type: 'circle',
            source: 'package',
            paint: {
                'circle-radius': package_pointStyle.radius,
                'circle-color': package_pointStyle.fillColor,
                'circle-opacity': package_pointStyle.fillOpacity,
                'circle-stroke-color': package_pointStyle.strokeColor,
                'circle-stroke-width': package_pointStyle.strokeWidth,
                'circle-stroke-opacity': package_pointStyle.strokeOpacity
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-hospital_point-layer`,
            type: 'circle',
            source: 'hospital',
            paint: {
                'circle-radius': hospital_pointStyle.radius,
                'circle-color': hospital_pointStyle.fillColor,
                'circle-opacity': hospital_pointStyle.fillOpacity,
                'circle-stroke-color': hospital_pointStyle.strokeColor,
                'circle-stroke-width': hospital_pointStyle.strokeWidth,
                'circle-stroke-opacity': hospital_pointStyle.strokeOpacity
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-community_point-layer`,
            type: 'circle',
            source: 'community',
            paint: {
                'circle-radius': community_pointStyle.radius,
                'circle-color': community_pointStyle.fillColor,
                'circle-opacity': community_pointStyle.fillOpacity,
                'circle-stroke-color': community_pointStyle.strokeColor,
                'circle-stroke-width': community_pointStyle.strokeWidth,
                'circle-stroke-opacity': community_pointStyle.strokeOpacity
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        detail_map.addLayer({
            id: `${layerId}-point-labels`,
            type: 'symbol',
            source: 'p_5',  // 기존 Point GeoJSON의 Source ID
            layout: {
                'text-field': ['literal', '5mi'],  // 고정된 텍스트 사용
                'text-size': 15,  // 글자 크기
                'text-font': ['Open Sans Bold'],  // 글자 두께 (Bold)
                'text-anchor': 'bottom',  // 글자 위치 (점 위쪽)
                'text-offset': [1, 0],  // 점 옆으로 살짝 이동
                'icon-optional': true  // 아이콘 없이 텍스트만 표시 가능하도록 설정
            },
            paint: {
                'text-color': '#ffffff',  // 글자 색상 (흰색)
                'text-opacity': 0.6  // 투명도 (0=완전 투명, 1=완전 불투명)
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시 
        });detail_map.addLayer({
            id: `${layerId}-point-labels-10`,
            type: 'symbol',
            source: 'p_10',  // 기존 Point GeoJSON의 Source ID
            layout: {
                'text-field': ['literal', '10mi'],  // 고정된 텍스트 사용
                'text-size': 15,  // 글자 크기
                'text-font': ['Open Sans Bold'],  // 글자 두께 (Bold)
                'text-anchor': 'bottom',  // 글자 위치 (점 위쪽)
                'text-offset': [1, 0],  // 점 옆으로 살짝 이동
                'icon-optional': true  // 아이콘 없이 텍스트만 표시 가능하도록 설정
            },
            paint: {
                'text-color': '#ffffff',  // 글자 색상 (흰색)
                'text-opacity': 0.6  // 투명도 (0=완전 투명, 1=완전 불투명)
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });detail_map.addLayer({
            id: `${layerId}-point-labels-20`,
            type: 'symbol',
            source: 'p_20',  // 기존 Point GeoJSON의 Source ID
            layout: {
               'text-field': ['literal', '20mi'],  // 고정된 텍스트 사용
                'text-size': 15,  // 글자 크기
                'text-font': ['Open Sans Bold'],  // 글자 두께 (Bold)
                'text-anchor': 'bottom',  // 글자 위치 (점 위쪽)
                'text-offset': [1, 0],  // 점 옆으로 살짝 이동
                'icon-optional': true  // 아이콘 없이 텍스트만 표시 가능하도록 설정
            },
            paint: {
                'text-color': '#ffffff',  // 글자 색상 (흰색)
                'text-opacity': 0.6  // 투명도 (0=완전 투명, 1=완전 불투명)
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시 
        });
        detail_map.addLayer({
            id: `${layerId}-town-fill`,
            type: 'fill',
            source: 'town',
            paint: { 
                'fill-color': townStyle.fillColor, 
                'fill-opacity': townStyle.fillOpacity 
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
        
        detail_map.addLayer({
            id: `${layerId}-town-line`,
            type: 'line',
            source: 'town',
            paint: { 
                'line-color': townStyle.borderColor, 
                'line-width': townStyle.borderWidth, 
                'line-opacity': townStyle.borderOpacity 
            },
            filter: ['==', ['to-number', ['get', 'id']], idNumber] // id_number 속성 값이 일치하는 객체만 표시
        });
    }

    // 나머지 레이어들을 제거하여 해당 레이어만 보이게 설정
    const allLayers = detail_map.getStyle().layers;
    if (allLayers) {
        allLayers.forEach(layer => {
        if (layer.id.startsWith('town-layer') && 
        layer.id !== `${layerId}-town-fill` && 
        layer.id !== `${layerId}-town-line` &&
        layer.id !== `${layerId}-10mi-layer` &&
        layer.id !== `${layerId}-10mi-border` &&
        layer.id !== `${layerId}-5mi-layer` &&
        layer.id !== `${layerId}-5mi-border` &&
        layer.id !== `${layerId}-20mi-layer` &&
        layer.id !== `${layerId}-20mi-border` &&
        layer.id !== `${layerId}-line-layer` &&
        layer.id !== `${layerId}-line-grocery-layer` &&
        layer.id !== `${layerId}-grocery_point-layer` &&
        layer.id !== `${layerId}-package_point-layer` &&
        layer.id !== `${layerId}-hospital_point-layer` &&
        layer.id !== `${layerId}-community_point-layer`&&
        layer.id !== `${layerId}-point-labels`&&
        layer.id !== `${layerId}-point-labels-10`&&
        layer.id !== `${layerId}-point-labels-20`) {
            detail_map.removeLayer(layer.id);  // 기존의 다른 레이어 제거
        }
        });
    }
    // detail_map의 중심과 줌을 업데이트
    detail_map.setCenter(mapSettings.center);
    detail_map.setZoom(mapSettings.zoom);

            }
            
            // 팝업 열기
            detailPopup.style.display = "block";
        })
        .catch(error => {
            console.error('Error loading data:', error);
        });
}

// detail_popup을 닫는 함수
function closePopup() {
    document.getElementById("detail_popup").style.display = "none";
}
// 팝업 열기 함수
function openPopup(idNumber) {
    openDetailPopup(idNumber); // 기존 openDetailPopup 함수를 재사용
    popupImageGrid.style.position = "fixed";
    popupImageGrid.style.top = "50%";
    popupImageGrid.style.left = "50%";
    popupImageGrid.style.transform = "translate(-50%, -50%)";
    popupImageGrid.style.zIndex = "1000";
    popupImageGrid.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    popupImageGrid.style.padding = "20px";
    popupImageGrid.style.borderRadius = "10px";
    popupImageGrid.style.display = "flex";
    popupImageGrid.style.flexDirection = "column";
    popupImageGrid.style.alignItems = "center";

    const imgElement = document.createElement("img");
    imgElement.src = `satellite/satellite_${idNumber}.png`;
    imgElement.alt = `Image ${idNumber}`;
    imgElement.style.maxWidth = "90%";
    imgElement.style.maxHeight = "80vh";

    // Detail+ 버튼 추가
    const detailButton = document.createElement("button");
    detailButton.innerText = "Detail+";
    detailButton.style.marginTop = "10px";
    detailButton.style.padding = "10px";
    detailButton.style.cursor = "pointer";
    detailButton.addEventListener('click', () => {
        alert("Show detailed information here."); // 세부 정보 팝업 등 추가할 수 있음
    });

    // X 버튼 추가
    const closeButton = document.createElement("button");
    closeButton.innerText = "X";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.fontSize = "20px";
    closeButton.style.cursor = "pointer";
    closeButton.addEventListener('click', () => {
        popupImageGrid.remove(); // 팝업 닫기
    });

    // 팝업에 요소들 추가
    popupImageGrid.appendChild(closeButton);
    popupImageGrid.appendChild(imgElement);
    popupImageGrid.appendChild(detailButton);

    // body에 팝업 추가

}

// 체크박스 변경 시 이미지 필터링
document.addEventListener("DOMContentLoaded", function () {
    const checkboxes = document.querySelectorAll("#categoryContainer input[type='checkbox']");
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            // 체크박스 변경 시 모든 필터 적용
            applyAllFilters();
        });
    });
    
    // 초기 필터 적용 (페이지 로드 시)
    setTimeout(() => {
        applyAllFilters();
    }, 1000); // 맵이 완전히 로드될 시간을 주기 위해 약간의 지연
});

// Function to check if we're in Vulnerable Zone mode
function isVulnerableZoneMode() {
    const sidebarName = document.querySelector(".Sidebar_Name");
    const activeSubButton = document.querySelector(".sub-button.active");
    
    const toolTab = sidebarName ? sidebarName.textContent.trim() : "";
    const activeSubButtonText = activeSubButton ? activeSubButton.textContent.trim() : "";
    
    return toolTab === "Food_Access_Analyzer" && activeSubButtonText === "Vulnerable_Zone";
  }
  
  // Function to check if we're in Access Void mode
  function isAccessVoidMode() {
    const sidebarName = document.querySelector(".Sidebar_Name");
    const activeSubButton = document.querySelector(".sub-button.active");
    
    const toolTab = sidebarName ? sidebarName.textContent.trim() : "";
    const activeSubButtonText = activeSubButton ? activeSubButton.textContent.trim() : "";
    
    return toolTab === "Food_Access_Analyzer" && activeSubButtonText === "Access_Void";
  }

// 드롭다운 값과 geojson의 City 속성 값 간의 매핑
const cityMapping = {
    "NewYork": "New York",
    "LosAngeles": "Los Angele", 
    "Chicago": "Chicago",
    "Houston": "Houston",
    "Phoneix": "Phoenix", // 주의: 오타가 있을 수 있음
    "Philadelphia": "Philadelph",
    "SanAntonio": "San Antoni",
    "SanDiego": "San Diego",
    "Dallas": "Dallas",
    "SanJose": "San Jose"
  };
  
  // 선택된 도시를 가져오는 함수
  function getSelectedCity() {
    const dropdown = document.getElementById('dropdown-button');
    if (!dropdown || dropdown.selectedIndex === 0) return null;
    
    const cityKey = dropdown.value;
    console.log("Selected city key:", cityKey);
    
    // 매핑 테이블에서 실제 City 속성 값 반환
    return cityMapping[cityKey] || null;
  }
  
  // 도시 이미지 필터링 로드 함수
  function loadCityImagesByFilters() {
    const imageGrid = document.getElementById("imageGrid");
    if (!imageGrid) return;
    
    imageGrid.innerHTML = '';
    
    // 슬라이더 값 가져오기
    const populationThreshold = cityFilteredIndividuals || 1000;
    const povertyThreshold = cityFilteredPovertyPercent || 20;
    
    // 선택된 도시 가져오기
    const selectedCity = getSelectedCity();
    console.log("Selected city name:", selectedCity);
    
    fetch('City/Outcome_All.geojson')
      .then(response => response.json())
      .then(data => {
        // Outcome_All 데이터 로그 확인
        console.log("Total features:", data.features.length);
        
        if (data.features.length > 0) {
          // 첫 번째 피처의 속성 확인 (디버깅용)
          console.log("Sample feature properties:", data.features[0].properties);
        }
        
        // 필터링된 도시 포인트 가져오기
        let cityFeatures = data.features;
        
        // 1. 도시 필터 적용 (선택된 경우)
        if (selectedCity) {
          cityFeatures = cityFeatures.filter(feature => {
            const cityProp = feature.properties.City;
            return cityProp && cityProp === selectedCity;
          });
          console.log(`Features filtered by city "${selectedCity}":`, cityFeatures.length);
        }
        
        // 2. 인구수 & 빈곤율 필터 적용
        const filteredFeatures = cityFeatures.filter(feature => {
          const props = feature.properties;
          return props.id_individual >= populationThreshold && 
                 props.Poverty_Percent >= povertyThreshold;
        });
        
        console.log("Features after all filters:", filteredFeatures.length);
        
        // 필터링 결과가 없을 경우
        if (filteredFeatures.length === 0) {
          const noResultsMsg = document.createElement("p");
          noResultsMsg.textContent = "No images match the current filters.";
          noResultsMsg.className = "no-results-message";
          imageGrid.appendChild(noResultsMsg);
          return;
        }
        
        // 필터링된 이미지 표시
        filteredFeatures.forEach(feature => {
          const props = feature.properties;
          const id = props.id;
          if (!id) return;
          
          // 이미지 ID 계산 (id-1)
          const imageId = id - 1;
          
          const imgElement = document.createElement("img");
          imgElement.src = `City/satelite_city/satellite_${imageId}.png`;
          imgElement.alt = `${props.City || 'City'} Image`;
          imgElement.title = `${props.City}, ID: ${id}, Population: ${props.id_individual}, Poverty: ${props.Poverty_Percent}%`;
          
          // 이미지 로드 에러 처리
          imgElement.onerror = function() {
            console.warn(`Image not found: satellite_${imageId}.png`);
            this.remove(); // 없는 이미지는 제거
          };
          
          // 여기를 수정: 전체 피처 정보를 전달하여 모든 데이터를 사용할 수 있게 함
            imgElement.addEventListener('click', () => {
            // 이미지 클릭 시 디테일 팝업 표시하면서 전체 속성 데이터 전달
                toggleCityDetailPopup(id, props);
          });
          imageGrid.appendChild(imgElement);
        });
      })
      .catch(error => {
        console.error('Error loading Outcome_All.geojson:', error);
        const errorMsg = document.createElement("p");
        errorMsg.textContent = "Error loading images. Please try again.";
        errorMsg.className = "error-message";
        imageGrid.appendChild(errorMsg);
      });
  }
  
  // 기존 displayButton 코드를 새 코드로 바꾸기
  const displayButton = document.getElementById('Display_button');
  const imageGridContainer = document.getElementById('imageGridContainer');
  
  // 버튼 클릭 시 #imageGridContainer의 visibility와 opacity를 변경
  displayButton.addEventListener('click', () => {
    if (imageGridContainer.style.visibility === 'hidden' || imageGridContainer.style.visibility === '') {
      imageGridContainer.style.visibility = 'visible';  // 보이게 설정
      imageGridContainer.style.opacity = 1;  // 불투명하게 설정
      displayButton.classList.add('active'); // 버튼에 active 클래스 추가
      
      // 모드에 따라 다른 이미지 로드
      if (isVulnerableZoneMode()) {
        loadCityImagesByFilters();
      } else if (isAccessVoidMode()) {
        loadImagesByCategory();
      }
    } else {
      imageGridContainer.style.visibility = 'hidden';  // 숨기기 설정
      imageGridContainer.style.opacity = 0;  // 투명하게 설정
      displayButton.classList.remove('active'); // 버튼에서 active 클래스 제거
    }
  });
  
  // 도시 슬라이더 변경 시 이미지 업데이트
  const cityIndividualRange = document.getElementById('city-individual-range');
  if (cityIndividualRange) {
    cityIndividualRange.addEventListener('input', function() {
      if (isVulnerableZoneMode() && 
          imageGridContainer.style.visibility === 'visible') {
        loadCityImagesByFilters();
      }
    });
  }
  
  const cityPovertyRange = document.getElementById('city-poverty-range');
  if (cityPovertyRange) {
    cityPovertyRange.addEventListener('input', function() {
      if (isVulnerableZoneMode() && 
          imageGridContainer.style.visibility === 'visible') {
        loadCityImagesByFilters();
      }
    });
  }
  
  // 도시 드롭다운 변경 시 이미지 업데이트
  const cityDropdown = document.getElementById('dropdown-button');
  if (cityDropdown) {
    cityDropdown.addEventListener('change', function() {
      if (isVulnerableZoneMode() && 
          imageGridContainer.style.visibility === 'visible') {
        loadCityImagesByFilters();
      }
    });
  }
  
  // 이미지 그리드 스타일 추가
  const cityImageGridStyle = document.createElement('style');
  cityImageGridStyle.textContent = `
    #imageGrid img {
      transition: transform 0.3s ease;
    }
    
    #imageGrid img:hover {
      transform: scale(1.05);
      cursor: pointer;
    }
  `;
  document.head.appendChild(cityImageGridStyle);

let activeElement = null;
let filteredPopulation = 1000; // Default population filter value
let filteredPovertyRate = 0; // 기본 빈곤율 필터 값 (0%로 시작)

// 인구수 슬라이더 생성
const populationSlider = document.createElement('div');
populationSlider.className = 'population-slider';
populationSlider.innerHTML = `
    <label for="population-range">
        Population: <span id="population-value" style="color: #ff6c43; font-weight: 700;">1K</span> people
    </label>
    <div class="slider-container">
        <input type="range" id="population-range" min="0" max="6" step="1" value="3"
               aria-label="Population filter slider" 
               aria-valuemin="0" 
               aria-valuemax="10000"
               aria-valuenow="1000">
    </div>
    <div class="population-labels">
        <span>0</span>
        <span>100</span>
        <span>500</span>
        <span>1K</span>
        <span>2K</span>
        <span>5K</span>
        <span>10K</span>
    </div>
`;

// 슬라이더를 문서에 추가
const reportContainer = document.getElementById('report');
reportContainer.parentNode.insertBefore(populationSlider, reportContainer.nextSibling);

// 소득 수준(빈곤율) 슬라이더 생성
const incomeSlider = document.createElement('div');
incomeSlider.className = 'population-slider income-slider'; // 기본 스타일 클래스 + 소득용 특별 클래스
incomeSlider.innerHTML = `
    <label for="income-range">
        Poverty Rate: <span id="income-value">0</span>%
    </label>
    <div class="slider-container">
        <input type="range" id="income-range" min="0" max="6" step="1" value="0"
               aria-label="Income level filter slider" 
               aria-valuemin="0" 
               aria-valuemax="60"
               aria-valuenow="0">
    </div>
    <div class="poverty-labels">
        <span>0%</span>
        <span>10%</span>
        <span>20%</span>
        <span>30%</span>
        <span>40%</span>
        <span>50%</span>
        <span>60%</span>
    </div>
`;

// 빈곤율 슬라이더를 인구수 슬라이더 아래에 추가
reportContainer.parentNode.insertBefore(incomeSlider, populationSlider.nextSibling);

// 인구수 값 배열 (슬라이더 단계에 맞춤)
const populationValues = [0, 100, 500, 1000, 2000, 5000, 10000];
// 인구수 표시 라벨 배열
const populationLabels = ["0", "100", "500", "1K", "2K", "5K", "10K"];
// 소득 수준 값 배열 (슬라이더 단계에 맞춤)
const povertyRateValues = [0, 10, 20, 30, 40, 50, 60];

function applyAllFilters() {
    // 현재 선택된 카테고리 필터 가져오기
    const selectedCategories = Array.from(document.querySelectorAll("#categoryContainer input[type='checkbox']:checked"))
        .map(checkbox => checkbox.value);
    
    // 현재 슬라이더 값 가져오기 (인구수와 빈곤율)
    const populationThreshold = filteredPopulation;
    const povertyThreshold = filteredPovertyRate;
    
    console.log("Applying all filters:", {
        categories: selectedCategories,
        population: populationThreshold,
        poverty: povertyThreshold
    });
    
    // 필터 조건 생성
    const filter = ["all"];
    
    // 1. 인구수 필터 추가
    filter.push([">=", ["get", "Total"], populationThreshold]);
    
    // 2. 빈곤율 필터 추가
    filter.push([">=", ["get", "Poverty_Rate"], povertyThreshold]);
    
    // 3. 선택된 카테고리 필터 추가 (있을 경우)
    if (selectedCategories.length > 0) {
        const categoryFilter = ["all"];
        selectedCategories.forEach(category => {
            categoryFilter.push(["==", ["get", category], 1]);
        });
        
        // 메인 필터에 카테고리 필터 통합
        filter.push(categoryFilter);
    }
    
    // 맵에 필터 적용
    if (Main_map) {
        Main_map.setFilter('Access_Void', filter);
        Main_map.setFilter('pick_3_layer', filter); // 클릭 가능한 레이어에도 동일한 필터 적용
    }
    
    // Venn 다이어그램도 업데이트
    updateVennDiagramWithBothFilters(populationThreshold, povertyThreshold);
    
    // 이미지 그리드가 표시 중이면 업데이트
    if (document.getElementById('imageGrid').style.display !== 'none') {
        loadImagesByCategory();
    }
}

document.getElementById('population-range').addEventListener('input', function(e) {
    // 기존 코드는 유지 (슬라이더 위치, 표시 애니메이션 등)
    const index = parseInt(e.target.value);
    filteredPopulation = populationValues[index];
    
    // 표시된 값 업데이트 (애니메이션 효과 포함)
    const valueDisplay = document.getElementById('population-value');
    valueDisplay.textContent = populationLabels[index];
    
    // 간단한 하이라이트 효과 적용
    valueDisplay.style.transition = 'none';
    valueDisplay.style.transform = 'scale(1.2)';
    valueDisplay.style.opacity = '0.9';
    
    setTimeout(() => {
        valueDisplay.style.transition = 'all 0.3s ease';
        valueDisplay.style.transform = 'scale(1)';
        valueDisplay.style.opacity = '1';
    }, 50);
    
    // 접근성을 위한 aria 속성 업데이트
    this.setAttribute('aria-valuenow', filteredPopulation);
    
    // 슬라이더 배경 그라데이션 업데이트
    updateSliderBackground(this);
    
    // 모든 필터 적용 (기존 코드 대체)
    applyAllFilters();
});


// 소득 수준 슬라이더에 이벤트 리스너 추가
document.getElementById('income-range').addEventListener('input', function(e) {
    // 기존 코드는 유지 (슬라이더 위치, 표시 애니메이션 등)
    const index = parseInt(e.target.value);
    filteredPovertyRate = povertyRateValues[index];
    
    // 표시된 값 업데이트 (애니메이션 효과 포함)
    const valueDisplay = document.getElementById('income-value');
    valueDisplay.textContent = filteredPovertyRate;
    
    // 간단한 하이라이트 효과 적용
    valueDisplay.style.transition = 'none';
    valueDisplay.style.transform = 'scale(1.2)';
    valueDisplay.style.opacity = '0.9';
    
    setTimeout(() => {
        valueDisplay.style.transition = 'all 0.3s ease';
        valueDisplay.style.transform = 'scale(1)';
        valueDisplay.style.opacity = '1';
    }, 50);
    
    // 접근성을 위한 aria 속성 업데이트
    this.setAttribute('aria-valuenow', filteredPovertyRate);
    
    // 슬라이더 배경 그라데이션 업데이트
    updateSliderBackground(this);
    
    // 모든 필터 적용 (기존 코드 대체)
    applyAllFilters();
});

// 슬라이더 배경 그라데이션을 업데이트하는 함수
function updateSliderBackground(slider) {
    // 현재 값을 기반으로 퍼센티지 계산
    const min = parseInt(slider.min);
    const max = parseInt(slider.max);
    const value = parseInt(slider.value);
    const percentage = ((value - min) / (max - min)) * 100;
    
    // 슬라이더 ID에 따라 적절한 색상 선택
    let color = slider.id === 'income-range' ? '#3d85c6' : '#ff6c43';
    
    // 값에 따라 채워지는 그라데이션 배경 적용
    slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`;
}

// 페이지 로드 시 슬라이더 배경 초기화
window.addEventListener('DOMContentLoaded', () => {
    const populationSlider = document.getElementById('population-range');
    const incomeSlider = document.getElementById('income-range');
    
    if (populationSlider) {
        updateSliderBackground(populationSlider);
    }
    
    if (incomeSlider) {
        updateSliderBackground(incomeSlider);
    }
    
    // 초기 필터 적용
    setTimeout(() => {
        filterAccessVoidByPopulation(filteredPopulation);
    }, 100);
});

// 인구수에 따라 Access_Void 영역을 필터링하는 함수
function filterAccessVoidByPopulation(threshold) {
    // 맵에 GeoJSON 레이어 필터 적용
    if (Main_map) {
        // 인구수와 소득 수준 모두 고려한 복합 필터 적용
        Main_map.setFilter('Access_Void', [
            'all',
            ['>=', ['get', 'Total'], threshold],
            ['>=', ['get', 'Poverty_Rate'], filteredPovertyRate]
        ]);
        
        Main_map.setFilter('pick_3_layer', [
            'all',
            ['>=', ['get', 'Total'], threshold],
            ['>=', ['get', 'Poverty_Rate'], filteredPovertyRate]
        ]);
        
        // Venn 다이어그램 업데이트하여 필터링된 데이터 반영
        updateVennDiagramWithBothFilters(threshold, filteredPovertyRate);
    }
}

// 소득 수준에 따라 Access_Void 영역을 필터링하는 함수
function filterAccessVoidByPovertyRate(threshold) {
    // 맵에 GeoJSON 레이어 필터 적용
    if (Main_map) {
        // 인구수와 소득 수준 모두 고려한 복합 필터 적용
        Main_map.setFilter('Access_Void', [
            'all',
            ['>=', ['get', 'Total'], filteredPopulation],
            ['>=', ['get', 'Poverty_Rate'], threshold]
        ]);
        
        Main_map.setFilter('pick_3_layer', [
            'all',
            ['>=', ['get', 'Total'], filteredPopulation],
            ['>=', ['get', 'Poverty_Rate'], threshold]
        ]);
        
        // Venn 다이어그램 업데이트하여 필터링된 데이터 반영
        updateVennDiagramWithBothFilters(filteredPopulation, threshold);
    }
}

// 두 필터 모두 적용하여 Venn 다이어그램 업데이트
function updateVennDiagramWithBothFilters(populationThreshold, povertyThreshold) {
    const chart = Highcharts.charts.find(chart => chart && chart.renderTo.id === 'report');
    if (chart) {
        const accessVoidPoint = chart.series[0].data.find(point => point.name === "Access_Void");
        if (accessVoidPoint) {
            // 인구수와 빈곤율 모두 표시
            let format = `Access<br>Void`;
            
            // 인구수 필터가 0보다 크거나 빈곤율 필터가 0보다 크면 필터 정보 표시
            if (populationThreshold > 0 || povertyThreshold > 0) {
                format += '<br>(';
                
                // 인구수 필터가 0보다 크면 표시
                if (populationThreshold > 0) {
                    // K 단위로 표시 변환
                    let displayText = populationThreshold;
                    if (populationThreshold >= 1000) {
                        displayText = (populationThreshold / 1000) + 'K';
                    }
                    format += `≥${displayText} people`;
                }
                
                // 두 필터 모두 활성화된 경우 구분자 추가
                if (populationThreshold > 0 && povertyThreshold > 0) {
                    format += ', ';
                }
                
                // 빈곤율 필터가 0보다 크면 표시
                if (povertyThreshold > 0) {
                    format += `≥${povertyThreshold}% poverty`;
                }
                
                format += ')';
            }
            
            accessVoidPoint.update({
                dataLabels: {
                    format: format,
                    style: {
                        fontSize: '11px', // 텍스트가 길어질 수 있으므로 약간 축소
                        color: '#ffffff',
                        textOutline: 'none'
                    }
                }
            });
        }
    }
}
function resetSliders() {
    // 인구수 슬라이더 초기화 (1000 = 인덱스 3)
    const populationSlider = document.getElementById('population-range');
    if (populationSlider) {
        populationSlider.value = 3; // 기본값 1000에 해당하는 인덱스
        
        // 표시된 값 업데이트
        const valueDisplay = document.getElementById('population-value');
        valueDisplay.textContent = populationLabels[3]; // '1K' 라벨 사용
        valueDisplay.style.color = '#ff6c43'; // 색상 유지
        
        // 슬라이더 배경 업데이트
        updateSliderBackground(populationSlider);
        
        // 전역 변수 업데이트
        filteredPopulation = 1000;
    }
    
    // 빈곤율 슬라이더 초기화 (0% = 인덱스 0)
    const incomeSlider = document.getElementById('income-range');
    if (incomeSlider) {
        incomeSlider.value = 0; // 기본값 0%에 해당하는 인덱스
        
        // 표시된 값 업데이트
        const valueDisplay = document.getElementById('income-value');
        valueDisplay.textContent = '0';
        
        // 슬라이더 배경 업데이트
        updateSliderBackground(incomeSlider);
        
        // 전역 변수 업데이트
        filteredPovertyRate = 0;
    }
    
    // 모든 필터 적용 (슬라이더 리셋 후)
    applyAllFilters();
}

function resetCategoryFilters() {
    console.log("Resetting category filters");
    const checkboxes = document.querySelectorAll("#categoryContainer input[type='checkbox']");
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 모든 필터 적용 (체크박스 리셋 후)
    if (typeof applyAllFilters === 'function') {
        applyAllFilters();
    }
}


// 기존 함수는 새 함수로 대체되므로 필요하지 않음
// 하지만 코드 호환성을 위해 유지 (내부적으로는 새 함수 호출)
function updateVennDiagram(threshold) {
    updateVennDiagramWithBothFilters(threshold, filteredPovertyRate);
}

Highcharts.chart('report', {
    chart: {
        type: 'venn',
        backgroundColor: 'transparent',
        events: {
            // 차트가 렌더링된 후 실행
            load: function() {
                // Set initial population filter
                setTimeout(() => {
                    applyAllFilters();
                }, 100);
                
                // 차트 외부로 마우스가 나가도 상태 유지
                const container = this.container;
                Highcharts.addEvent(container, 'mouseleave', function() {
                    // 클릭된 요소가 있으면 해당 스타일 유지
                    if (activeElement) {
                        if (activeElement.name === "Access_Void") {
                            activeElement.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                        } else if (activeElement.name === "delivery") {
                            activeElement.graphic.attr({ fill: "rgb(0,30,36,0.5)" });
                        } else if (activeElement.name === "food") {
                            activeElement.graphic.attr({ fill: "rgb(205,78,28,0.5)" });
                        } else {
                            activeElement.graphic.attr({ opacity: 1 });
                        }
                        
                        // 다른 요소들은 낮은 투명도 유지
                        activeElement.series.data.forEach(point => {
                            if (point !== activeElement) {
                                if (point.name === "Access_Void") {
                                    point.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                                } else if (point.name === "delivery") {
                                    point.graphic.attr({ fill: "rgb(0,30,36,0.07)" });
                                } else if (point.name === "food") {
                                    point.graphic.attr({ fill: "rgb(205,78,28,0.07)" });
                                } else {
                                    point.graphic.attr({ opacity: 1 });
                                }
                                // dataLabel은 투명도 유지
                                point.dataLabel.css({ opacity: 1 });
                            }
                        });
                    }
                });
            }
        }
    },
    title: {
        text: null // 차트 제목 제거
    },
    tooltip: {
        enabled: false // tooltip 완전히 비활성화
    },
    exporting: {
        enabled: false // 내보내기 버튼 제거
    },
    credits: {
        enabled: false // 하단 "highcharts.com" 링크 제거
    },
    plotOptions: {
        venn: {
            point: {
                events: {
                    // mouseOver 이벤트 핸들러 수정
                    mouseOver: function () {
                        // 호버한 요소의 외곽선 변경
                        this.graphic.attr({
                            stroke: '#FFFFFF',
                            'stroke-width': 1
                        });
                        
                        // 맵 레이어 투명도 조절 - 클릭된 요소와 호버된 요소 모두 활성화
                        if (Main_map) {
                            // 모든 레이어 기본 투명도로 초기화
                            Main_map.setPaintProperty('delivery', 'fill-opacity', 0.1);
                            Main_map.setPaintProperty('food', 'fill-opacity', 0.1);
                            Main_map.setPaintProperty('Access_Void', 'fill-opacity', 0.5);
                            
                            // 호버된 레이어 활성화
                            if (this.name === "delivery") {
                                Main_map.setPaintProperty('delivery', 'fill-opacity', 0.4);
                            } else if (this.name === "food") {
                                Main_map.setPaintProperty('food', 'fill-opacity', 0.4);
                            } else if (this.name === "Access_Void") {
                                Main_map.setPaintProperty('Access_Void', 'fill-opacity', 0.5);
                                
                            }
                            
                            // 클릭된 요소가 있고 현재 호버한 요소와 다른 경우 클릭된 레이어도 활성화
                            if (activeElement && this !== activeElement) {
                                if (activeElement.name === "delivery") {
                                    Main_map.setPaintProperty('delivery', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "food") {
                                    Main_map.setPaintProperty('food', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "Access_Void") {
                                    Main_map.setPaintProperty('Access_Void', 'fill-opacity', 0.5);
                                    
                                }
                            }
                        }
                        
                        // 현재 호버한 요소의 벤 다이어그램 투명도 설정
                        if (this.name === "Access_Void") {
                            this.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                        } else if (this.name === "delivery") {
                            this.graphic.attr({ fill: "rgb(0,30,36,0.5)" });
                        } else if (this.name === "food") {
                            this.graphic.attr({ fill: "rgb(205,78,28,0.5)" });
                        } else {
                            this.graphic.attr({ opacity: 1 });
                        }
                        
                        // 클릭된 요소가 있고, 현재 호버한 요소가 클릭된 요소가 아닌 경우
                        if (activeElement && this !== activeElement) {
                            // 클릭된 요소의 투명도도 유지
                            if (activeElement.name === "Access_Void") {
                                activeElement.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                            } else if (activeElement.name === "delivery") {
                                activeElement.graphic.attr({ fill: "rgb(0,30,36,0.5)" });
                            } else if (activeElement.name === "food") {
                                activeElement.graphic.attr({ fill: "rgb(205,78,28,0.5)" });
                            } else {
                                activeElement.graphic.attr({ opacity: 1 });
                            }
                            
                            // 나머지 요소들은 낮은 투명도로 설정
                            this.series.data.forEach(point => {
                                if (point !== this && point !== activeElement) {
                                    if (point.name === "Access_Void") {
                                        point.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                                    } else if (point.name === "delivery") {
                                        point.graphic.attr({ fill: "rgb(0,30,36,0.07)" });
                                    } else if (point.name === "food") {
                                        point.graphic.attr({ fill: "rgb(205,78,28,0.07)" });
                                    } else {
                                        point.graphic.attr({ opacity: 1 });
                                    }
                                    // 모든 dataLabel의 투명도는 항상 1로 유지
                                    point.dataLabel.css({ opacity: 1 });
                                }
                            });
                        }

                        // dataLabels 색상 변경 (호버한 요소만)
                        this.dataLabel.css({ color: '#FFFFFF' });
                        this.dataLabel.css({ opacity: 1 });
                    },

                    // mouseOut 이벤트 핸들러 수정
                    mouseOut: function () {
                        // 외곽선 제거
                        this.graphic.attr({
                            stroke: 'none',
                            'stroke-width': 0
                        });

                        // 활성화된 요소(클릭된 요소)인 경우 투명도 유지하고 함수 종료
                        if (activeElement === this) {
                            if (this.name === "Access_Void") {
                                this.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                            } else if (this.name === "delivery") {
                                this.graphic.attr({ fill: "rgb(0,30,36,0.5)" });
                            } else if (this.name === "food") {
                                this.graphic.attr({ fill: "rgb(205,78,28,0.5)" });
                            } else {
                                this.graphic.attr({ opacity: 1 });
                            }
                            return;
                        }

                        // 맵 레이어 투명도 복원 - 클릭된 요소가 있으면 그 레이어만 활성화
                        if (Main_map) {
                            // 모든 레이어 기본 투명도로 초기화
                            Main_map.setPaintProperty('delivery', 'fill-opacity', 0.1);
                            Main_map.setPaintProperty('food', 'fill-opacity', 0.1);
                            Main_map.setPaintProperty('Access_Void', 'fill-opacity', 0.5);
                            
                            
                            
                            // 클릭된 요소가 있으면 해당 레이어만 활성화
                            if (activeElement) {
                                if (activeElement.name === "delivery") {
                                    Main_map.setPaintProperty('delivery', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "food") {
                                    Main_map.setPaintProperty('food', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "Access_Void") {
                                    Main_map.setPaintProperty('Access_Void', 'fill-opacity', 0.5);
                                }
                            }
                        }

                        // 호버를 벗어난 요소의 상태 복원
                        // 클릭된 요소가 있는 경우, 호버를 벗어난 요소가 클릭된 요소가 아니면 낮은 투명도로 설정
                        if (activeElement && this !== activeElement) {
                            if (this.name === "Access_Void") {
                                this.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                            } else if (this.name === "delivery") {
                                this.graphic.attr({ fill: "rgb(0,30,36,0.07)" });
                            } else if (this.name === "food") {
                                this.graphic.attr({ fill: "rgb(205,78,28,0.07)" });
                            } else {
                                this.graphic.attr({ opacity: 1 });
                            }
                        } else if (!activeElement) {
                            // 클릭된 요소가 없으면 기본 투명도로 복원
                            if (this.name === "Access_Void") {
                                this.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                            } else if (this.name === "delivery") {
                                this.graphic.attr({ fill: "rgb(0,30,36,0.07)" });
                            } else if (this.name === "food") {
                                this.graphic.attr({ fill: "rgb(205,78,28,0.07)" });
                            } else {
                                this.graphic.attr({ opacity: 1});
                            }
                        }

                        // dataLabels 색상 원래 색으로 복원 (클릭된 요소가 아닌 경우)
                        if (activeElement !== this && this.name !== "Access_Void") {
                            this.dataLabel.css({ color: '#8f8f8f' });
                        }
                        
                        // 투명도는 항상 1로 유지
                        this.dataLabel.css({ opacity: 1 });
                    },
                
                    click: function () {
                        // 같은 요소를 다시 클릭한 경우 선택 해제
                        if (activeElement === this) {
                            activeElement = null;
                            
                            // 모든 레이어 투명도 초기화
                            if (Main_map) {
                                Main_map.setPaintProperty('delivery', 'fill-opacity', 0.1);
                                Main_map.setPaintProperty('food', 'fill-opacity', 0.1);
                                Main_map.setPaintProperty('Access_Void', 'fill-opacity', 0.5);
                                
                                
                            }
                            
                            // 모든 요소를 기본 투명도로 설정
                            this.series.data.forEach(point => {
                                if (point.name === "Access_Void") {
                                    point.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                                } else if (point.name === "delivery") {
                                    point.graphic.attr({ fill: "rgb(0,30,36,0.07)" });
                                } else if (point.name === "food") {
                                    point.graphic.attr({ fill: "rgb(205,78,28,0.07)" });
                                } else {
                                    point.graphic.attr({ opacity: 1 });
                                }
                                // 모든 레이블의 투명도는 1로 유지
                                point.dataLabel.css({ opacity: 1 });
                                // 모든 레이블의 색상 원래대로 복원
                                if (point.name !== "Access_Void") {
                                    point.dataLabel.css({ color: '#8f8f8f' });
                                }
                            });
                            return;
                        }
                        
                        // 이전에 선택된 요소가 있으면 텍스트 색상을 원래대로 복원
                        if (activeElement) {
                            if (activeElement.name !== "Access_Void") {
                                activeElement.dataLabel.css({ color: '#8f8f8f' });
                            }
                        }
                        
                        // 새로운 요소 클릭 시
                        activeElement = this;
                
                        // 클릭 시 해당 레이어의 투명도 조정
                        if (Main_map) {
                            // 먼저 모든 레이어 투명도 초기화
                            Main_map.setPaintProperty('delivery', 'fill-opacity', 0.1);
                            Main_map.setPaintProperty('food', 'fill-opacity', 0.1);
                            Main_map.setPaintProperty('Access_Void', 'fill-opacity', 0.5);
                            
                            
                            // 선택된 레이어만 활성화
                            if (this.name === "delivery") {
                                Main_map.setPaintProperty('delivery', 'fill-opacity', 0.4);
                            } else if (this.name === "food") {
                                Main_map.setPaintProperty('food', 'fill-opacity', 0.4);
                            } else if (this.name === "Access_Void") {
                                Main_map.setPaintProperty('Access_Void', 'fill-opacity', 0.5);
                            }
                        }
                        
                        // 클릭된 요소는 투명도 0.5로 설정
                        if (this.name === "Access_Void") {
                            this.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                        } else if (this.name === "delivery") {
                            this.graphic.attr({ fill: "rgb(0,30,36,0.5)" });
                        } else if (this.name === "food") {
                            this.graphic.attr({ fill: "rgb(205,78,28,0.5)" });
                        } else {
                            this.graphic.attr({ opacity: 1 });
                        }
                        // 클릭된 요소의 텍스트 색상을 흰색으로 설정
                        this.dataLabel.css({ color: '#FFFFFF' });
                
                        // 클릭되지 않은 요소들의 투명도를 0.1로 설정
                        this.series.data.forEach(point => {
                            if (point !== this) {
                                if (point.name === "Access_Void") {
                                    point.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                                } else if (point.name === "delivery") {
                                    point.graphic.attr({ fill: "rgb(0,30,36,0.07)" });
                                } else if (point.name === "food") {
                                    point.graphic.attr({ fill: "rgb(205,78,28,0.07)" });
                                } else {
                                    point.graphic.attr({ opacity: 1});
                                }
                                // dataLabel의 투명도는 항상 1로 유지
                                point.dataLabel.css({ opacity: 1 });
                                // 다른 요소들의 텍스트 색상을 원래대로 설정
                                if (point.name !== "Access_Void") {
                                    point.dataLabel.css({ color: '#8f8f8f' });
                                }
                            }
                        });
                    }
                }
            }
        }
    },
    series: [{
        data: [
            { 
                name: "delivery", 
                sets: ["delivery"], 
                value: 100, 
                color: "rgb(0,30,36,0.1)", 
                opacity: 1,
                dataLabels: {
                    enabled: true,
                    format: 'Undeliverable', 
                    style: {
                        fontSize: '12px', 
                        color: '#8f8f8f', 
                        textOutline: 'none'
                    }
                }
            },
            { 
                name: "food", 
                sets: ["food"], 
                value: 100, 
                color: "rgb(205,78,28,0.1)", 
                opacity: 1,
                dataLabels: {
                    enabled: true,
                    format: 'Food Desert',
                    style: {
                        fontSize: '12px',
                        color: '#8f8f8f',
                        textOutline: 'none'
                    }
                }
            },
            { 
                name: "Access_Void", 
                sets: ["delivery", "food"], 
                value: 40, 
                color: "rgb(255,54,0,0.6)", 
                opacity: 1,
                dataLabels: {
                    enabled: true,
                    format: 'Access<br>Void<br>(≥1000)',
                    style: {
                        fontSize: '12px',
                        color: '#ffffff',
                        textOutline: 'none'
                    }
                }
            }
        ],
        borderColor: '#FFFFFF', 
        borderWidth: 1 
    }]
});



const cityLocations = {
    NewYork: { lat: 40.634650, lng: -74.300181, zoom: 8 },
    LosAngeles: { lat: 34.011951, lng: -118.167152, zoom: 8.3 },
    Chicago: { lat: 41.927555, lng: -88.033305, zoom: 8.2 },
    Houston: { lat: 29.808382, lng: -95.447899, zoom: 8.3 },
    Phoneix: { lat: 33.580145, lng: -112.020377, zoom: 8.4 },
    Philadelphia: { lat: 40.005926, lng: -75.428836, zoom: 8.2 },
    SanAntonio: { lat: 29.513558, lng: -98.702092, zoom: 8.8 },
    SanDiego: { lat: 32.997806, lng: -117.059776, zoom: 8.4 },
    Dallas: { lat: 32.808241, lng: -97.074070, zoom: 8.3 },
    SanJose: { lat: 37.366144, lng: -121.959600, zoom: 8.8 }
};

// 드롭다운 변경 이벤트 핸들러
document.getElementById('dropdown-button').addEventListener('change', function() {
    const cityKey = this.value;
    
    // 빈 값 또는 기본값 선택 시 도시 맵을 초기 상태로 돌려놓음
    if (cityKey === "" || cityKey === null) {
        Cities_map.flyTo({
            center: [-96.35, 38.50], 
            zoom: 3.95,
            essential: true
        });
        
        // Usa_All_C 레이어 다시 표시
        Cities_map.setPaintProperty('Usa_All_C', 'fill-opacity', layerSettings_city['Usa_All_C'].opacity);
        Cities_map.setPaintProperty('Usa_All_C-outline', 'line-opacity', layerSettings_city['Usa_All_C'].outlineOpacity);
        
        // 다른 레이어들 숨기기
        ['Outcome_All', 'Food_All', 'Poverty_All'].forEach(layer => {
            Cities_map.setPaintProperty(layer, 'fill-opacity', 0);
            Cities_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
        });
        
        console.log("Reset city selection");
        return;
    }
    
    // 기존 도시 선택 로직 계속 진행
    const city = cityLocations[cityKey];
    
    if (city) {
        Cities_map.flyTo({
            center: [city.lng, city.lat],
            zoom: city.zoom,
            essential: true
        });
        
        // Usa_All_C 레이어 숨기기
        Cities_map.setPaintProperty('Usa_All_C', 'fill-opacity', 0);
        Cities_map.setPaintProperty('Usa_All_C-outline', 'line-opacity', 0);
        
        // 다른 레이어들 표시하기
        ['Outcome_All', 'Food_All', 'Poverty_All'].forEach(layer => {
            Cities_map.setPaintProperty(layer, 'fill-opacity', layerSettings_city[layer].opacity);
            Cities_map.setPaintProperty(`${layer}-outline`, 'line-opacity', layerSettings_city[layer].outlineOpacity);
        });
        
        // 리포트 컨테이너 표시
        document.getElementById('report_container_city').style.display = 'block';
    }
});

let activeElement2 = null;
Highcharts.chart('report_city', {
    chart: {
        type: 'venn',
        backgroundColor: 'transparent',
        events: {
            // 차트가 렌더링된 후 실행
            load: function() {
                // 차트 외부로 마우스가 나가도 상태 유지
                const container = this.container;
                Highcharts.addEvent(container, 'mouseleave', function() {
                    // 클릭된 요소가 있으면 해당 스타일 유지
                    if (activeElement2) {
                        if (activeElement2.name === "Outcome_All") {
                            activeElement2.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                        } else if (activeElement2.name === "Poverty_All") {
                            activeElement2.graphic.attr({ fill: "rgb(0,30,36,0.5)" });
                        } else if (activeElement2.name === "Food_All") {
                            activeElement2.graphic.attr({ fill: "rgb(205,78,28,0.5)" });
                        } else {
                            activeElement2.graphic.attr({ opacity: 1 });
                        }
                        
                        // 다른 요소들은 낮은 투명도 유지
                        activeElement2.series.data.forEach(point => {
                            if (point !== activeElement2) {
                                if (point.name === "Outcome_All") {
                                    point.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                                } else if (point.name === "Poverty_All") {
                                    point.graphic.attr({ fill: "rgb(0,30,36,0.07)" });
                                } else if (point.name === "Food_All") {
                                    point.graphic.attr({ fill: "rgb(205,78,28,0.07)" });
                                } else {
                                    point.graphic.attr({ opacity: 1 });
                                }
                                // dataLabel은 투명도 유지
                                point.dataLabel.css({ opacity: 1 });
                            }
                        });
                    }
                });
            }
        }
    },
    title: {
        text: null // 차트 제목 제거
    },
    tooltip: {
        enabled: false // tooltip 완전히 비활성화
    },
    exporting: {
        enabled: false // 내보내기 버튼 제거
    },
    credits: {
        enabled: false // 하단 "highcharts.com" 링크 제거
    },
    plotOptions: {
        venn: {
            point: {
                events: {
                    // mouseOver 이벤트 핸들러 수정
                    mouseOver: function () {
                        // 호버한 요소의 외곽선 변경
                        this.graphic.attr({
                            stroke: '#FFFFFF',
                            'stroke-width': 1
                        });
                        
                        // 맵 레이어 투명도 조절 - 클릭된 요소와 호버된 요소 모두 활성화
                        if (Cities_map) {
                            // 모든 레이어 기본 투명도로 초기화
                            Cities_map.setPaintProperty('Poverty_All', 'fill-opacity', 0.1);
                            Cities_map.setPaintProperty('Food_All', 'fill-opacity', 0.1);
                            Cities_map.setPaintProperty('Outcome_All', 'fill-opacity', 0.5);
                            
                            // 호버된 레이어 활성화
                            if (this.name === "Poverty_All") {
                                Cities_map.setPaintProperty('Poverty_All', 'fill-opacity', 0.4);
                            } else if (this.name === "Food_All") {
                                Cities_map.setPaintProperty('Food_All', 'fill-opacity', 0.4);
                            } else if (this.name === "Outcome_All") {
                                Cities_map.setPaintProperty('Outcome_All', 'fill-opacity', 0.5);
                            }
                            
                            // 클릭된 요소가 있고 현재 호버한 요소와 다른 경우 클릭된 레이어도 활성화
                            if (activeElement2 && this !== activeElement2) {
                                if (activeElement2.name === "Poverty_All") {
                                    Cities_map.setPaintProperty('Poverty_All', 'fill-opacity', 0.4);
                                } else if (activeElement2.name === "Food_All") {
                                    Cities_map.setPaintProperty('Food_All', 'fill-opacity', 0.4);
                                } else if (activeElement2.name === "Outcome_All") {
                                    Cities_map.setPaintProperty('Outcome_All', 'fill-opacity', 0.5);
                                }
                            }
                        }
                        
                        // 현재 호버한 요소의 벤 다이어그램 투명도 설정
                        if (this.name === "Outcome_All") {
                            this.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                        } else if (this.name === "Poverty_All") {
                            this.graphic.attr({ fill: "rgb(0,30,36,0.5)" });
                        } else if (this.name === "Food_All") {
                            this.graphic.attr({ fill: "rgb(205,78,28,0.5)" });
                        } else {
                            this.graphic.attr({ opacity: 1 });
                        }
                        
                        // 클릭된 요소가 있고, 현재 호버한 요소가 클릭된 요소가 아닌 경우
                        if (activeElement2 && this !== activeElement2) {
                            // 클릭된 요소의 투명도도 유지
                            if (activeElement2.name === "Outcome_All") {
                                activeElement2.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                            } else if (activeElement2.name === "Poverty_All") {
                                activeElement2.graphic.attr({ fill: "rgb(0,30,36,0.5)" });
                            } else if (activeElement2.name === "Food_All") {
                                activeElement2.graphic.attr({ fill: "rgb(205,78,28,0.5)" });
                            } else {
                                activeElement2.graphic.attr({ opacity: 1 });
                            }
                            
                            // 나머지 요소들은 낮은 투명도로 설정
                            this.series.data.forEach(point => {
                                if (point !== this && point !== activeElement2) {
                                    if (point.name === "Outcome_All") {
                                        point.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                                    } else if (point.name === "Poverty_All") {
                                        point.graphic.attr({ fill: "rgb(0,30,36,0.07)" });
                                    } else if (point.name === "Food_All") {
                                        point.graphic.attr({ fill: "rgb(205,78,28,0.07)" });
                                    } else {
                                        point.graphic.attr({ opacity: 1 });
                                    }
                                    // 모든 dataLabel의 투명도는 항상 1로 유지
                                    point.dataLabel.css({ opacity: 1 });
                                }
                            });
                        }

                        // dataLabels 색상 변경 (호버한 요소만)
                        this.dataLabel.css({ color: '#FFFFFF' });
                        this.dataLabel.css({ opacity: 1 });
                    },

                    // mouseOut 이벤트 핸들러 수정
                    mouseOut: function () {
                        // 외곽선 제거
                        this.graphic.attr({
                            stroke: 'none',
                            'stroke-width': 0
                        });

                        // 활성화된 요소(클릭된 요소)인 경우 투명도 유지하고 함수 종료
                        if (activeElement2 === this) {
                            if (this.name === "Outcome_All") {
                                this.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                            } else if (this.name === "Poverty_All") {
                                this.graphic.attr({ fill: "rgb(0,30,36,0.5)" });
                            } else if (this.name === "Food_All") {
                                this.graphic.attr({ fill: "rgb(205,78,28,0.5)" });
                            } else {
                                this.graphic.attr({ opacity: 1 });
                            }
                            return;
                        }

                        // 맵 레이어 투명도 복원 - 클릭된 요소가 있으면 그 레이어만 활성화
                        if (Cities_map) {
                            // 모든 레이어 기본 투명도로 초기화
                            Cities_map.setPaintProperty('Poverty_All', 'fill-opacity', 0.1);
                            Cities_map.setPaintProperty('Food_All', 'fill-opacity', 0.1);
                            Cities_map.setPaintProperty('Outcome_All', 'fill-opacity', 0.5);
                            
                            // 클릭된 요소가 있으면 해당 레이어만 활성화
                            if (activeElement2) {
                                if (activeElement2.name === "Poverty_All") {
                                    Cities_map.setPaintProperty('Poverty_All', 'fill-opacity', 0.4);
                                } else if (activeElement2.name === "Food_All") {
                                    Cities_map.setPaintProperty('Food_All', 'fill-opacity', 0.4);
                                } else if (activeElement2.name === "Outcome_All") {
                                    Cities_map.setPaintProperty('Outcome_All', 'fill-opacity', 0.5);
                                }
                            }
                        }

                        // 호버를 벗어난 요소의 상태 복원
                        // 클릭된 요소가 있는 경우, 호버를 벗어난 요소가 클릭된 요소가 아니면 낮은 투명도로 설정
                        if (activeElement2 && this !== activeElement2) {
                            if (this.name === "Outcome_All") {
                                this.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                            } else if (this.name === "Poverty_All") {
                                this.graphic.attr({ fill: "rgb(0,30,36,0.07)" });
                            } else if (this.name === "Food_All") {
                                this.graphic.attr({ fill: "rgb(205,78,28,0.07)" });
                            } else {
                                this.graphic.attr({ opacity: 1 });
                            }
                        } else if (!activeElement2) {
                            // 클릭된 요소가 없으면 기본 투명도로 복원
                            if (this.name === "Outcome_All") {
                                this.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                            } else if (this.name === "Poverty_All") {
                                this.graphic.attr({ fill: "rgb(0,30,36,0.07)" });
                            } else if (this.name === "Food_All") {
                                this.graphic.attr({ fill: "rgb(205,78,28,0.07)" });
                            } else {
                                this.graphic.attr({ opacity: 1});
                            }
                        }

                        // dataLabels 색상 원래 색으로 복원 (클릭된 요소가 아닌 경우)
                        if (activeElement2 !== this  && this.name !== "Outcome_All") {
                            this.dataLabel.css({ color: '#8f8f8f' });
                        }
                        
                        // 투명도는 항상 1로 유지
                        this.dataLabel.css({ opacity: 1 });
                    },
                
                    click: function () {
                        // 같은 요소를 다시 클릭한 경우 선택 해제
                        if (activeElement2 === this) {
                            activeElement2 = null;
                            
                            // 모든 레이어 투명도 초기화
                            if (Cities_map) {
                                Cities_map.setPaintProperty('Poverty_All', 'fill-opacity', 0.1);
                                Cities_map.setPaintProperty('Food_All', 'fill-opacity', 0.1);
                                Cities_map.setPaintProperty('Outcome_All', 'fill-opacity', 0.5);
                            }
                            
                            // 모든 요소를 기본 투명도로 설정
                            this.series.data.forEach(point => {
                                if (point.name === "Outcome_All") {
                                    point.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                                } else if (point.name === "Poverty_All") {
                                    point.graphic.attr({ fill: "rgb(0,30,36,0.07)" });
                                } else if (point.name === "Food_All") {
                                    point.graphic.attr({ fill: "rgb(205,78,28,0.07)" });
                                } else {
                                    point.graphic.attr({ opacity: 1 });
                                }
                                // 모든 레이블의 투명도는 1로 유지
                                point.dataLabel.css({ opacity: 1 });
                                // 모든 레이블의 색상 원래대로 복원
                                if (point.name !== "Outcome_All") {
                                    point.dataLabel.css({ color: '#8f8f8f' });
                                }
                            });
                            return;
                        }
                        
                        // 수정 2: 이전에 선택된 요소가 있으면 텍스트 색상을 원래대로 복원
                        if (activeElement2) {
                            if (activeElement2.name !== "Outcome_All") {
                                activeElement2.dataLabel.css({ color: '#8f8f8f' });
                            }
                        }
                        
                        // 새로운 요소 클릭 시
                        activeElement2 = this;
                
                        // 클릭 시 해당 레이어의 투명도 조정
                        if (Cities_map) {
                            // 먼저 모든 레이어 투명도 초기화
                            Cities_map.setPaintProperty('Poverty_All', 'fill-opacity', 0.1);
                            Cities_map.setPaintProperty('Food_All', 'fill-opacity', 0.1);
                            Cities_map.setPaintProperty('Outcome_All', 'fill-opacity', 0.5);
                            
                            // 선택된 레이어만 활성화
                            if (this.name === "Poverty_All") {
                                Cities_map.setPaintProperty('Poverty_All', 'fill-opacity', 0.4);
                            } else if (this.name === "Food_All") {
                                Cities_map.setPaintProperty('Food_All', 'fill-opacity', 0.4);
                            } else if (this.name === "Outcome_All") {
                                Cities_map.setPaintProperty('Outcome_All', 'fill-opacity', 0.5);
                            }
                        }
                        
                        // 클릭된 요소는 투명도 0.5로 설정
                        if (this.name === "Outcome_All") {
                            this.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                        } else if (this.name === "Poverty_All") {
                            this.graphic.attr({ fill: "rgb(0,30,36,0.5)" });
                        } else if (this.name === "Food_All") {
                            this.graphic.attr({ fill: "rgb(205,78,28,0.5)" });
                        } else {
                            this.graphic.attr({ opacity: 1 });
                        }
                        // 클릭된 요소의 텍스트 색상을 흰색으로 설정
                        this.dataLabel.css({ color: '#FFFFFF' });
                
                        // 클릭되지 않은 요소들의 투명도를 0.1로 설정
                        this.series.data.forEach(point => {
                            if (point !== this) {
                                if (point.name === "Outcome_All") {
                                    point.graphic.attr({ fill: "rgb(255,54,0,0.5)" });
                                } else if (point.name === "Poverty_All") {
                                    point.graphic.attr({ fill: "rgb(0,30,36,0.07)" });
                                } else if (point.name === "Food_All") {
                                    point.graphic.attr({ fill: "rgb(205,78,28,0.07)" });
                                } else {
                                    point.graphic.attr({ opacity: 1});
                                }
                                // 수정 1: dataLabel의 투명도는 항상 1로 유지
                                point.dataLabel.css({ opacity: 1 });
                                // 수정 2: 다른 요소들의 텍스트 색상을 원래대로 설정
                                if (point.name !== "Outcome_All") {
                                    point.dataLabel.css({ color: '#8f8f8f' });
                                }
                            }
                        });
                    }
                }
            }
        }
    },
    series: [{
        data: [
            { 
                name: "Poverty_All", 
                sets: ["Poverty_All"], 
                value: 100, 
                color: "rgb(0,30,36,0.1)", 
                opacity: 1,
                dataLabels: {
                    enabled: true,
                    format: 'Poverty', // 추가할 텍스트
                    style: {
                        fontSize: '12px', // 작은 글씨 크기
                        color: '#8f8f8f', // 글씨 색
                        textOutline: 'none'
                    }
                }
            },
            { 
                name: "Food_All", 
                sets: ["Food_All"], 
                value: 100, 
                color: "rgb(205,78,28,0.1)", 
                opacity: 1,
                dataLabels: {
                    enabled: true,
                    format: 'Food Desert',
                    style: {
                        fontSize: '12px',
                        color: '#8f8f8f',
                        textOutline: 'none'
                    }
                }
            },
            { 
                name: "Outcome_All", 
                sets: ["Poverty_All", "Food_All"], 
                value: 40, 
                color: "rgb(255,54,0,0.6)", 
                opacity: 1,
                dataLabels: {
                    enabled: true,
                    format: 'Vulnerable<br>Zone',
                    style: {
                        fontSize: '12px',
                        color: '#ffffff',
                        textOutline: 'none'
                    }
                }
            }
        ],
        borderColor: '#FFFFFF', // 선 색을 흰색으로 설정
        borderWidth: 1 // 선 두께를 1로 설정
    }]
});
// report_city를 위한 슬라이더 변수
let cityFilteredIndividuals = 1000; // 기본 인구수 필터 값
let cityFilteredPovertyPercent = 20; // 기본 빈곤율 필터 값 (20%로 시작)

// 인구수 슬라이더 생성
const cityIndividualSlider = document.createElement('div');
cityIndividualSlider.className = 'population-slider';
cityIndividualSlider.innerHTML = `
    <label for="city-individual-range">
        Population: <span id="city-individual-value" style="color: #ff6c43; font-weight: 700;">1K</span> people
    </label>
    <div class="slider-container">
        <input type="range" id="city-individual-range" min="0" max="6" step="1" value="3"
               aria-label="Population filter slider" 
               aria-valuemin="0" 
               aria-valuemax="10000"
               aria-valuenow="1000">
    </div>
    <div class="population-labels">
        <span>0</span>
        <span>100</span>
        <span>500</span>
        <span>1K</span>
        <span>2K</span>
        <span>5K</span>
        <span>10K</span>
    </div>
`;

// 슬라이더를 report_city 컨테이너 다음에 추가
const reportCityContainer = document.getElementById('report_city');
reportCityContainer.parentNode.insertBefore(cityIndividualSlider, reportCityContainer.nextSibling);

// 빈곤율 슬라이더 생성
const cityPovertySlider = document.createElement('div');
cityPovertySlider.className = 'population-slider income-slider'; // 기본 스타일 클래스 + 특별 클래스
cityPovertySlider.innerHTML = `
    <label for="city-poverty-range">
        Poverty Rate: <span id="city-poverty-value" style="color: #3d85c6; font-weight: 700;">20</span>%
    </label>
    <div class="slider-container">
        <input type="range" id="city-poverty-range" min="0" max="6" step="1" value="0"
               aria-label="Poverty rate filter slider" 
               aria-valuemin="20" 
               aria-valuemax="80"
               aria-valuenow="20">
    </div>
    <div class="poverty-labels">
        <span>20%</span>
        <span>30%</span>
        <span>40%</span>
        <span>50%</span>
        <span>60%</span>
        <span>70%</span>
        <span>80%</span>
    </div>
`;

// 빈곤율 슬라이더를 인구수 슬라이더 아래에 추가
reportCityContainer.parentNode.insertBefore(cityPovertySlider, cityIndividualSlider.nextSibling);

// 인구수 값 배열 (슬라이더 단계에 맞춤)
const cityIndividualValues = [0, 100, 500, 1000, 2000, 5000, 10000];
const cityIndividualLabels = ["0", "100", "500", "1K", "2K", "5K", "10K"];

// 빈곤율 값 배열 (슬라이더 단계에 맞춤)
const cityPovertyPercentValues = [20, 30, 40, 50, 60, 70, 80];

// 인구수 슬라이더에 이벤트 리스너 추가
document.getElementById('city-individual-range').addEventListener('input', function(e) {
    // 슬라이더 위치에 따른 인구수 값 가져오기
    const index = parseInt(e.target.value);
    cityFilteredIndividuals = cityIndividualValues[index];
    
    // 표시된 값 업데이트 (애니메이션 효과 포함)
    const valueDisplay = document.getElementById('city-individual-value');
    valueDisplay.textContent = cityIndividualLabels[index];
    valueDisplay.style.color = '#ff6c43'; // 색상 추가
    
    // 간단한 하이라이트 효과 적용
    valueDisplay.style.transition = 'none';
    valueDisplay.style.transform = 'scale(1.2)';
    valueDisplay.style.opacity = '0.9';
    
    setTimeout(() => {
        valueDisplay.style.transition = 'all 0.3s ease';
        valueDisplay.style.transform = 'scale(1)';
        valueDisplay.style.opacity = '1';
    }, 50);
    
    // 접근성을 위한 aria 속성 업데이트
    this.setAttribute('aria-valuenow', cityFilteredIndividuals);
    
    // 인구수에 따라 Outcome_All 레이어만 필터링
    filterCityByIndividual(cityFilteredIndividuals);
    
    // 슬라이더 배경 그라데이션 업데이트
    updateCitySliderBackground(this);
    
    if (isVulnerableZoneMode() && 
    imageGridContainer.style.visibility === 'visible') {
    loadCityImagesByFilters();
}
});

// 빈곤율 슬라이더에 이벤트 리스너 추가
document.getElementById('city-poverty-range').addEventListener('input', function(e) {
    // 슬라이더 위치에 따른 빈곤율 값 가져오기
    const index = parseInt(e.target.value);
    cityFilteredPovertyPercent = cityPovertyPercentValues[index];
    
    // 표시된 값 업데이트 (애니메이션 효과 포함)
    const valueDisplay = document.getElementById('city-poverty-value');
    valueDisplay.textContent = cityFilteredPovertyPercent;
    valueDisplay.style.color = '#3d85c6'; // 색상 추가
    // 간단한 하이라이트 효과 적용
    valueDisplay.style.transition = 'none';
    valueDisplay.style.transform = 'scale(1.2)';
    valueDisplay.style.opacity = '0.9';
    
    setTimeout(() => {
        valueDisplay.style.transition = 'all 0.3s ease';
        valueDisplay.style.transform = 'scale(1)';
        valueDisplay.style.opacity = '1';
    }, 50);
    
    // 접근성을 위한 aria 속성 업데이트
    this.setAttribute('aria-valuenow', cityFilteredPovertyPercent);
    
    // 빈곤율에 따라 Outcome_All 레이어만 필터링
    filterCityByPovertyPercent(cityFilteredPovertyPercent);
    
    // 슬라이더 배경 그라데이션 업데이트
    updateCitySliderBackground(this);

    if (isVulnerableZoneMode() && 
    imageGridContainer.style.visibility === 'visible') {
    loadCityImagesByFilters();
}
});

// 슬라이더 배경 그라데이션을 업데이트하는 함수
function updateCitySliderBackground(slider) {
    // 현재 값을 기반으로 퍼센티지 계산
    const min = parseInt(slider.min);
    const max = parseInt(slider.max);
    const value = parseInt(slider.value);
    const percentage = ((value - min) / (max - min)) * 100;
    
    // 슬라이더 ID에 따라 적절한 색상 선택
    let color = slider.id === 'city-poverty-range' ? '#3d85c6' : '#ff6c43';
    
    // 값에 따라 채워지는 그라데이션 배경 적용
    slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`;
}

// 페이지 로드 시 슬라이더 배경 초기화
window.addEventListener('DOMContentLoaded', () => {
    const cityIndividualSlider = document.getElementById('city-individual-range');
    const cityPovertySlider = document.getElementById('city-poverty-range');
    
    if (cityIndividualSlider) {
        updateCitySliderBackground(cityIndividualSlider);
    }
    
    if (cityPovertySlider) {
        updateCitySliderBackground(cityPovertySlider);
    }
    
    // 초기 필터 적용
    setTimeout(() => {
        filterCityByIndividual(cityFilteredIndividuals);
    }, 100);
});

// 인구수에 따라 Outcome_All 레이어만 필터링하는 함수
function filterCityByIndividual(threshold) {
    // 맵에 GeoJSON 레이어 필터 적용
    if (Cities_map) {
        // 인구수와 빈곤율 모두 고려한 복합 필터 적용 (Outcome_All만 필터링)
        Cities_map.setFilter('Outcome_All', [
            'all',
            ['>=', ['get', 'id_individual'], threshold],
            ['>=', ['get', 'Poverty_Percent'], cityFilteredPovertyPercent] // 속성 이름 수정
        ]);
        
        // Venn 다이어그램 업데이트하여 필터링된 데이터 반영
        updateCityVennDiagram(threshold, cityFilteredPovertyPercent);
    }
}

// 빈곤율에 따라 Outcome_All 레이어만 필터링하는 함수
function filterCityByPovertyPercent(threshold) {
    // 맵에 GeoJSON 레이어 필터 적용
    if (Cities_map) {
        // 인구수와 빈곤율 모두 고려한 복합 필터 적용 (Outcome_All만 필터링)
        Cities_map.setFilter('Outcome_All', [
            'all',
            ['>=', ['get', 'id_individual'], cityFilteredIndividuals],
            ['>=', ['get', 'Poverty_Percent'], threshold] // 속성 이름 수정
        ]);
        
        // Venn 다이어그램 업데이트하여 필터링된 데이터 반영
        updateCityVennDiagram(cityFilteredIndividuals, threshold);
    }
}


// 두 필터 모두 적용하여 도시 Venn 다이어그램 업데이트
function updateCityVennDiagram(populationThreshold, povertyThreshold) {
    const chart = Highcharts.charts.find(chart => chart && chart.renderTo.id === 'report_city');
    if (chart) {
        const outcomePoint = chart.series[0].data.find(point => point.name === "Outcome_All");
        if (outcomePoint) {
            // 인구수와 빈곤율 모두 표시
            let format = `Vulnerable<br>Zone`;
            
            // 인구수 필터가 0보다 크거나 빈곤율 필터가 20%보다 크면 필터 정보 표시
            if (populationThreshold > 0 || povertyThreshold > 20) {
                format += '<br>(';
                
                // 인구수 필터가 0보다 크면 표시
                if (populationThreshold > 0) {
                    // 천 단위는 K로 표시
                    let popDisplay = populationThreshold >= 1000 ? 
                        (populationThreshold / 1000) + 'K' : 
                        populationThreshold;
                    format += `≥${popDisplay} people`;
                }
                
                // 두 필터 모두 활성화된 경우 구분자 추가
                if (populationThreshold > 0 && povertyThreshold > 20) {
                    format += ', ';
                }
                
                // 빈곤율 필터가 20%보다 크면 표시
                if (povertyThreshold > 20) {
                    format += `≥${povertyThreshold}% poverty`;
                }
                
                format += ')';
            }
            
            outcomePoint.update({
                dataLabels: {
                    format: format,
                    style: {
                        fontSize: '11px', // 텍스트가 길어질 수 있으므로 약간 축소
                        color: '#ffffff',
                        textOutline: 'none'
                    }
                }
            });
        }
    }
}

// 슬라이더 리셋 함수
function resetCitySliders() {
    // 인구수 슬라이더 초기화 (1000 = 인덱스 3)
    const cityIndividualSlider = document.getElementById('city-individual-range');
    if (cityIndividualSlider) {
        cityIndividualSlider.value = 3; // 기본값 1000에 해당하는 인덱스
        
        // 표시된 값 업데이트
        const valueDisplay = document.getElementById('city-individual-value');
        valueDisplay.textContent = '1K';
        valueDisplay.style.color = '#ff6c43'; // 색상 유지
        
        // 슬라이더 배경 업데이트
        updateCitySliderBackground(cityIndividualSlider);
        
        // 전역 변수 업데이트
        cityFilteredIndividuals = 1000;
    }
    
    // 빈곤율 슬라이더 초기화 (20% = 인덱스 0)
    const cityPovertySlider = document.getElementById('city-poverty-range');
    if (cityPovertySlider) {
        cityPovertySlider.value = 0; // 기본값 20%에 해당하는 인덱스
        
        // 표시된 값 업데이트
        const valueDisplay = document.getElementById('city-poverty-value');
        valueDisplay.textContent = '20';
        valueDisplay.style.color = '#3d85c6'; // 색상 유지
        
        // 슬라이더 배경 업데이트
        updateCitySliderBackground(cityPovertySlider);
        
        // 전역 변수 업데이트
        cityFilteredPovertyPercent = 20;
    }
    
    // 필터 적용
    if (Cities_map) {
        filterCityByIndividual(1000);
    }
    
    // Venn 다이어그램 업데이트
    updateCityVennDiagram(1000, 20);
}
document.getElementById("search-button").addEventListener("click", function () {
    const location = document.getElementById("search-box").value;

    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${mapboxgl.accessToken}`)
        .then(response => response.json())
        .then(data => {
            if (data.features.length > 0) {
                const [lng, lat] = data.features[0].center;

                // 🔹 두 개의 맵이 동시에 이동
                Main_map.flyTo({
                    center: [lng, lat],
                    zoom: 12,
                    essential: true
                });

                Cities_map.flyTo({
                    center: [lng, lat],
                    zoom: 12,
                    essential: true
                });

            } else {
                alert("위치를 찾을 수 없습니다.");
            }
        })
        .catch(error => console.error("Error:", error));
});

// Factor Filters 토글 기능 구현
document.addEventListener('DOMContentLoaded', function() {
    const categoryTitleContainer = document.getElementById('categoryTitleContainer');
    const categoryContainer = document.getElementById('categoryContainer');
    const toggleButton = document.getElementById('toggleButton');
    
    // 타이틀 컨테이너 클릭 시 필터 항목들 토글
    categoryTitleContainer.addEventListener('click', function() {
        // 카테고리 컨테이너 표시/숨김 토글
        if (categoryContainer.style.display === 'block') {
            categoryContainer.style.display = 'none';
            toggleButton.classList.remove('open');
        } else {
            categoryContainer.style.display = 'block';
            toggleButton.classList.add('open');
        }
    });
    
    // 정보 아이콘에 호버 이벤트 추가
    const infoIcons = document.querySelectorAll('.info-icon');
    infoIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            // 이미 구현된 CSS hover 효과 사용
        });
        
        icon.addEventListener('mouseleave', function() {
            // 이미 구현된 CSS hover 효과 사용
        });
    });
});

let cityPopupVisible = false; // 도시 팝업이 표시되었는지 추적하는 변수

function isVulnerableZoneMode() {
    // null 체크 추가
    const sidebarName = document.querySelector(".Sidebar_Name");
    const activeSubButton = document.querySelector(".sub-button.active");
    
    const toolTab = sidebarName ? sidebarName.textContent.trim() : "";
    const activeSubButtonText = activeSubButton ? activeSubButton.textContent.trim() : "";
    
    return toolTab === "Food_Access_Analyzer" && activeSubButtonText === "Vulnerable_Zone";
  }

// Outcome_All 레이어에 대한 호버 및 클릭 이벤트 추가
Cities_map.on('load', function() {
    // Outcome_All 레이어에 마우스 진입 시 팝업 표시
    Cities_map.on('mouseenter', 'Outcome_All', function(e) {
      // 필터가 적용된 영역에만 팝업 표시
      const cityFilteredIndividuals = 1000; // 기본 인구수 필터 값
      const cityFilteredPovertyPercent = 20; // 기본 빈곤율 필터 값
      
      // 필터가 적용된 점들에 대해서만 팝업 표시 (현재는 필터 확인 생략)
      Cities_map.getCanvas().style.cursor = 'pointer';
      updateCityPopup(e, false);
    });
    
    // 마우스 벗어날 때 일시적 팝업 제거
    Cities_map.on('mouseleave', 'Outcome_All', function() {
      if (cityPopup && cityPopup.isTemporary) cityPopup.remove();
      Cities_map.getCanvas().style.cursor = '';
    });
    
    // 클릭 시 팝업 고정
    Cities_map.on('click', 'Outcome_All', function(e) {
      if (cityPopup) cityPopup.remove();
      updateCityPopup(e, true);
    });
  });
  
  // 도시 팝업 객체 생성
  const cityPopup = new mapboxgl.Popup({
    closeOnClick: true,
    anchor: 'bottom'
  });
  
  // 팝업 업데이트 함수
  // 팝업 업데이트 함수 수정
function updateCityPopup(e, isClick) {
    if (!isClick && cityPopupVisible) return; // 클릭된 팝업이 있으면 hover 방지
    
    const props = e.features[0].properties;
    const id = props.id;
    
     // id에 맞는 이미지 경로 생성 (id-1 형식)
     const imageId = id - 1;
     const imagePath = `City/satelite_city/satellite_${imageId}.png`;
     
     // 도시 이름과 정보 추출
     const city = props.City || "Unknown City";
     const state = props.States || "Unknown State";
     const povertyPercent = props.Poverty_Percent ? `${props.Poverty_Percent}%` : "Unknown";
     
     // 팝업 내용 생성 - 중요: 전체 feature 객체 전달
     const popupContent = `
     <div style="position: relative; background: rgba(0, 0, 0, 0.7); color: white; padding: 10px; border-radius: 5px;">
       <div style="position: absolute; top: 10px; left: 10px;">
         <p style="font-size: 15px; margin: 0;"><b>${city}</b></p>
       </div>
       <img src="${imagePath}" alt="Satellite Image" style="width: 200px; height: auto; display: block; margin-bottom: 10px;">
       <div>
         <p style="font-size: 10px; font-weight: bold; margin: 2px 0;">- ${city}, ${state}</p>
         <p style="font-size: 10px; margin: 2px 0;">Poverty Rate: ${povertyPercent}</p>
       </div>
       <!-- Detail+ 버튼에 전체 feature 객체 전달 -->
       <div id="city_detail_button" onclick='toggleCityDetailPopup(${id}, ${JSON.stringify(props).replace(/"/g, "&quot;")})' style="margin-top: 170px; padding: 5px; background-color: rgba(0, 0, 0, 0); text-align: right; cursor: pointer; font-weight: bold; font-size: 12px; color: #ffffff; position: absolute; bottom: 10px; right: 10px;">
         Detail +
       </div>
     </div>`;
     
     // x 버튼 스타일을 위한 CSS 코드 추가
     const style = document.createElement('style');
     style.innerHTML = `
       /* x 버튼 흰색으로 변경 */
       .mapboxgl-popup .mapboxgl-popup-close-button {
         color: white; /* 흰색으로 변경 */
         background-color: transparent; /* 배경 투명 */
         border: none; /* 경계선 제거 */
       }
     `;
     
     if (!document.head.querySelector('style[data-popup-style="true"]')) {
       style.setAttribute('data-popup-style', 'true');
       document.head.appendChild(style);
     }
     
     // 화면의 50%를 기준으로 팝업 위치 조정
     const windowHeight = window.innerHeight;
     const clickY = e.point.y;
     const anchorPosition = clickY < windowHeight / 2 ? 'top' : 'bottom';
     
     cityPopup.options.anchor = anchorPosition;
     
     // 팝업 표시
     let offsetY = e.lngLat.lat > 40 ? -150 : 10;
     cityPopup.setLngLat([e.lngLat.lng, e.lngLat.lat + offsetY / 10000])
       .setHTML(popupContent)
       .addTo(Cities_map);
     
     cityPopup.isTemporary = !isClick; // 클릭 시 영구, hover 시 일시적
     if (isClick) cityPopupVisible = true; // 클릭된 경우 popupVisible 유지
 }
 
  
  
 function toggleCityDetailPopup(id, props) {
    console.log("toggleCityDetailPopup called with id:", id);
    
    const detailPopup = document.getElementById("detail_popup");
    if (!detailPopup) return;
    
    if (detailPopup.style.display === "none" || !detailPopup.style.display) {
        detailPopup.style.display = "block";
        
        // 이미지 ID 계산
        const imageId = id - 1;
        const imagePath = `City/satelite_city/satellite_${imageId}.png`;
        
        // 도시 정보
        const city = props.City || "Unknown City";
        const state = props.States || "Unknown State";
        const povertyPercent = props.Poverty_Percent ? `${props.Poverty_Percent}%` : "Unknown";
        const population = props.id_individual || "Unknown";
        
        // 인종 데이터
        const raceData = [
            { label: "White", value: props["Race_white"] },
            { label: "Black", value: props["Race_Black or African American"] },
            { label: "Other Race", value: props["Race_Some Other Race"] },
            { label: "Asian", value: props["Race_Asian"] },
            { label: "Native", value: props["Race_American Indian and Alaska Native"] },
            { label: "Pacific Islander", value: props["Race_Native Hawaiian and Other Pacific Islander"] }
        ];
        
        // 가장 높은 비율의 인종 찾기
        let maxRace = raceData.reduce((max, r) => {
            let val = parseFloat(r.value) || 0;
            return val > max.value ? { label: r.label, value: val } : max;
        }, { label: "", value: 0 });
        
        const highlightColor = "#EA8901";
        
        // 인종 테이블 생성
        let raceTable = `
            <p style="font-size: 14px; font-weight: bold; margin: 2px 0; color:rgb(43, 43, 43);">- Race Ratio</p>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; text-align: center; font-size: 12px; color:rgb(43, 43, 43);">
                ${raceData.map(r => `
                    <div style="padding: 1px; ${r.label === maxRace.label ? `color: ${highlightColor}; font-weight: bold;` : ''}">
                        <div>${r.label}</div>
                        <div>${r.value ? parseFloat(r.value).toFixed(2) : "0"}%</div>
                    </div>
                `).join("")}
            </div>
            <div style="margin-top: 10px; font-size: 14px; color:rgb(43, 43, 43);">
                <b>- Population:</b> ${population}
            </div>
            <div style="margin-top: 10px; font-size: 14px; color:rgb(43, 43, 43);">
                <b>- Poverty:</b> ${povertyPercent}
            </div>
        `;
        
        // detail_content 업데이트
        const detailContent = document.getElementById("detail_content");
        if (detailContent) {
            detailContent.innerHTML = `
            <img src="${imagePath}" alt="Satellite Image" style="margin-left: 10%; margin-top: 10%; width: 80%; height: auto; margin-bottom: 10px; border-radius: 15px;">
            <div style="position: absolute; top: 10px; left: 10px;">
                <p style="font-size: 18px; margin: 0; color:rgb(43, 43, 43);"><b>${city}</b></p>
            </div>
            <div>
                <div style="position: absolute; left: 10px;">
                    <p style="font-size: 14px; font-weight: bold; margin: 2px 0;">- ${city}, ${state}</p>
                    ${raceTable}
                </div>
            </div>
            `;
        }
        
        // detail_map 컨테이너 표시
        const detailMapContainer = document.getElementById("detail_map");
        if (detailMapContainer) {
            detailMapContainer.style.display = "block";
        }
        
        // 스트리트 이미지 숨기기
        const streetImage = document.getElementById("street_image");
        if (streetImage) {
            streetImage.style.display = "none";
        }
        
        // detail_map 초기화 및 설정
        if (!detailMapInitialized) {
            console.log("Initializing detail map for the first time");
            initializeDetailMap();
            
            detail_map.on('load', function() {
                console.log("First load - detail map loaded, now setting location");
                currentDetailFeatureId = id; // 현재 피처 ID 저장
                setDetailMapLocation(props);
            });
        } else {
            // 이미 맵이 초기화되었고 다른 피처로 전환하는 경우
            console.log("Detail map already initialized, resizing and updating");
            detail_map.resize();
            
            // 중요: 현재 표시 중인 피처와 다른 경우에만 위치 업데이트
            if (currentDetailFeatureId !== id) {
                console.log("Changing detail map location from ID", currentDetailFeatureId, "to", id);
                currentDetailFeatureId = id; // 현재 피처 ID 업데이트
                
                // 위치 변경 전 짧은 지연 추가 (맵이 준비될 시간 제공)
                setTimeout(() => {
                    setDetailMapLocation(props);
                }, 50);
            } else {
                console.log("Same feature ID, not changing map location");
            }
        }
    } else {
        detailPopup.style.display = "none";
    }
}

 // 3. 새로운 함수 - detail_map의 위치 설정
function setDetailMapLocation(props) {
    if (!detail_map) {
        console.error("Detail map not initialized yet");
        return;
    }
    
    console.log("Setting detail map location with props:", props);
    
    // 1. xcoord, ycoord가 있는 경우 - 직접 좌표 사용
    if (props.xcoord !== undefined && props.ycoord !== undefined &&
        props.xcoord !== null && props.ycoord !== null) {
        const coordinates = [parseFloat(props.xcoord), parseFloat(props.ycoord)];
        console.log("Using explicit coordinates:", coordinates);
        
        try {
            detail_map.flyTo({
                center: coordinates,
                zoom: 14,
                essential: true
            });
            return;
        } catch (e) {
            console.error("Error flying to coordinates:", e);
            // 실패 시 다음 방법으로 진행
        }
    }
    
    // 2. 도시 이름으로 위치 찾기
    try {
        const cityName = props.City || "";
        if (cityName) {
            // 도시 이름과 가장 가까운 매핑 찾기
            const cityCoordinates = {
                "New York": [-73.97, 40.78],
                "Los Angeles": [-118.24, 34.05],
                "Chicago": [-87.65, 41.88],
                "Houston": [-95.37, 29.76],
                "Phoenix": [-112.07, 33.45],
                "Philadelphia": [-75.16, 39.95],
                "San Antonio": [-98.49, 29.42],
                "San Diego": [-117.16, 32.72],
                "Dallas": [-96.77, 32.78],
                "San Jose": [-121.89, 37.34]
            };
            
            // 가장 일치하는 도시 찾기
            const matchingCity = Object.keys(cityCoordinates).find(city => 
                cityName.includes(city) || city.includes(cityName)
            );
            
            if (matchingCity) {
                console.log("Using city name match:", matchingCity);
                detail_map.flyTo({
                    center: cityCoordinates[matchingCity],
                    zoom: 12,
                    essential: true
                });
                return;
            }
        }
    } catch (e) {
        console.error("Error finding city coordinates:", e);
    }   
    // 3. ID 기반 고정 위치 사용 (백업 방법)
    try {
        const id = props.id;
        if (id) {
            console.log("Using ID-based coordinates for ID:", id);
            // ID를 기반으로 미리 정의된 위치 목록에서 찾기
            const idBasedLocations = {
                1: [-73.94, 40.67],    // New York example 1
                2: [-73.98, 40.72],    // New York example 2
                3: [-118.24, 34.05],   // Los Angeles example
                4: [-87.65, 41.88],    // Chicago example
                // 추가 ID 기반 위치 정의...
            };
            
            if (idBasedLocations[id]) {
                detail_map.flyTo({
                    center: idBasedLocations[id],
                    zoom: 14,
                    essential: true
                });
                return;
            } else {
                // ID가 없으면 ID에 기반한 약간의 변동 추가
                // 도시 인덱스 계산 (10개 주요 도시 순환)
                const cityIndex = (id % 10);
                const baseLocations = [
                    [-73.94, 40.67],  // New York
                    [-118.24, 34.05], // Los Angeles
                    [-87.65, 41.88],  // Chicago
                    [-95.37, 29.76],  // Houston
                    [-112.07, 33.45], // Phoenix
                    [-75.16, 39.95],  // Philadelphia
                    [-98.49, 29.42],  // San Antonio
                    [-117.16, 32.72], // San Diego
                    [-96.77, 32.78],  // Dallas
                    [-121.89, 37.34]  // San Jose
                ];
                
                const baseLocation = baseLocations[cityIndex];
                
                // ID 기반 약간의 변동 추가 (같은 도시의 다른 지역)
                const variation = 0.02; // 약 1-2km 변동
                const randomOffset = (id % 100) / 100; // 0-1 사이 랜덤값
                
                const finalLocation = [
                    baseLocation[0] + (randomOffset * variation * 2 - variation),
                    baseLocation[1] + (randomOffset * variation * 2 - variation)
                ];
                
                detail_map.flyTo({
                    center: finalLocation,
                    zoom: 14,
                    essential: true
                });
                return;
            }
        }
    } catch (e) {
        console.error("Error using ID-based coordinates:", e);
    }
    
    // 4. 최후의 방법 - 기본 위치 사용
    console.log("Using default US center coordinates");
    detail_map.flyTo({
        center: [-96.35, 38.50],
        zoom: 4,
        essential: true
    });
}
  
  // Outcome_All 레이어에 대한 호버 및 클릭 이벤트 추가 수정
  Cities_map.on('load', function() {
    // Outcome_All 레이어 로드 시 마커 관련 처리
    Cities_map.on('style.load', function() {
      // Access_Void와 Vulnerable Zone을 구분하는 함수 추가
      window.isVulnerableZoneMode = function() {
        const toolTab = document.querySelector(".Sidebar_Name")?.textContent.trim();
        const activeSubButton = document.querySelector(".sub-button.active")?.textContent.trim();
        return toolTab === "Food_Access_Analyzer" && activeSubButton === "Vulnerable_Zone";
      };
    });
    
    // 기존 이벤트 핸들러는 유지
    Cities_map.on('mouseenter', 'Outcome_All', function(e) {
      Cities_map.getCanvas().style.cursor = 'pointer';
      updateCityPopup(e, false);
    });
    
    Cities_map.on('mouseleave', 'Outcome_All', function() {
      if (cityPopup && cityPopup.isTemporary) cityPopup.remove();
      Cities_map.getCanvas().style.cursor = '';
    });
    
    Cities_map.on('click', 'Outcome_All', function(e) {
      if (cityPopup) cityPopup.remove();
      updateCityPopup(e, true);
    });
  });
  
  // 원래 detail_popup이 닫힐 때의 이벤트 처리 - Vulnerable Zone과 Access_Void 모드 구분
  document.addEventListener('click', function(e) {
    // close_button 클릭 시 
    if (e.target.id === 'close_button') {
      // street 이미지가 있다면 숨기기
      const streetImage = document.getElementById("street_image");
      if (streetImage) {
        streetImage.style.display = "none";
      }
      
      // Vulnerable Zone 모드가 아닌 경우에만 detail_index 표시
      const detailIndex = document.getElementById("detail_index");
      if (detailIndex) {
        if (window.isVulnerableZoneMode && window.isVulnerableZoneMode()) {
          detailIndex.style.display = "none";
        } else {
          detailIndex.style.display = "block";
        }
      }
    }
  });

  function closePopup() {
    const detailPopup = document.getElementById("detail_popup");
    if (detailPopup) {
        detailPopup.style.display = "none";
        
        // Handle different modes when closing
        if (isVulnerableZoneMode()) {
            // Hide street image
            const streetImage = document.getElementById("street_image");
            if (streetImage) {
                streetImage.style.display = "none";
            }
        } else {
            // In Access Void mode, ensure detail_map will be visible next time
            const detailMapContainer = document.getElementById("detail_map");
            if (detailMapContainer) {
                detailMapContainer.style.display = "block";
            }
        }
    }
}

function applyInitialFilters() {
    if (Cities_map) {
        // Outcome_All 레이어에 필터 적용
        Cities_map.setFilter('Outcome_All', [
            'all',
            ['>=', ['get', 'id_individual'], 1000],
            ['>=', ['get', 'Poverty_Percent'], 20]
        ]);
        console.log("Initial filters applied: Population >= 1000, Poverty >= 20%");
    }
}

// 스토리 데이터 (나중에 확장 가능)
const storySteps = [
    { id: 1, title: "Food Deserts in USA", description: "13.5% of the American population—approximately 18 million people—live in food deserts. These are areas where the distance to a grocery store exceeds 1 mile in urban settings or 10 miles in rural regions. About 25% of U.S. territory falls into this category, meaning a significant portion of Americans face limited access to healthy food options. Food deserts represent more than mere inconvenience; they can lead to serious health consequences. Limited access to fresh fruits and vegetables often forces residents to rely on processed foods or fast food options. This dietary pattern is directly linked to increased rates of obesity, diabetes, and cardiovascular disease. Additionally, these areas often offer restricted food choices, making it difficult to obtain culturally appropriate foods. Low-income individuals, seniors, and those with disabilities face even greater challenges due to limited transportation options." },
    { id: 2, title: "Areas Without Grocery Delivery", description: "15.3% of Americans—about 20.5 million people—live in areas without access to grocery delivery services. This encompasses nearly half (49.4%) of the country's territory, revealing how many people are excluded from the online food ordering revolution. In the digital age, grocery delivery services have evolved from convenience to necessity. This trend intensified following the COVID-19 pandemic, with many people now regularly ordering food online. However, delivery services primarily focus on profitable urban and suburban areas, often excluding rural or low-density regions from their service coverage. This results in already marginalized communities being further excluded from digital food access. The situation creates additional barriers for areas with limited internet access or populations with low digital literacy, compounding existing food access challenges." },
    { id: 3, title: "Access Voids: The Double Barrier", description: "Access Voids represent the intersection of food deserts and undeliverable regions, creating areas with the most severe challenges in obtaining fresh food. Residents who cannot drive due to health issues or other reasons face particularly acute food access problems. These areas typically suffer from multiple disadvantaging factors: poor road infrastructure, geographical barriers such as mountains or rivers, distance from urban centers, absence of essential facilities, and lack of public transportation systems. Residents in Access Void areas must invest significant time and resources for food shopping. They often need to drive long distances, while households without vehicles must rely on neighbors or relatives, or use infrequent public transportation. This situation is especially burdensome for seniors, people with disabilities, and parents caring for children. Additionally, the need to purchase food in bulk requires adequate storage facilities like refrigerators and freezers, creating additional financial burden for low-income households. These compounded challenges mean Access Void residents are more likely to experience food insecurity, which can lead to long-term health problems." },
    { id: 4, title: "Case Study: Asherton, Texas", description: "Asherton, Texas exemplifies an Access Void. This community of 1,084 people has the nearest grocery store located over 10 miles away, with hospitals and community centers similarly distant. With a poverty rate of 35.8%—more than three times the national average of 11%—the economic vulnerability is severe. The roads are poorly maintained, the town lacks even restaurants or cafes, and the nearest city is over 100 miles away. Daily life for Asherton residents is significantly impacted by food access issues. Residents must travel at least 20 miles round-trip for grocery shopping, while those without vehicles depend on friends or neighbors for transportation. Some residents can only make major shopping trips once or twice a month, making it difficult to maintain consistent access to fresh produce. The town's high poverty rate further constrains food purchasing ability, with many households relying on SNAP (Supplemental Nutrition Assistance Program) benefits. Such areas face complex challenges that cannot be resolved solely by building grocery stores, requiring multifaceted approaches." },
    { id: 5, title: "Urban Food Deserts", description: "Urban food deserts are defined as areas without a grocery store within a 1-mile radius. In densely populated urban environments, this 1-mile distance can represent a significant barrier. While relatively better than rural areas in terms of food access, many urban residents still find grocery stores beyond comfortable walking distance. Urban food deserts differ from their rural counterparts in several key aspects. In cities, the issue isn't necessarily a complete absence of food retailers, but rather a lack of large supermarkets offering quality food options. Instead, these areas might have convenience stores or small grocers that typically offer limited selections, lower quality fresh foods, and higher prices. Urban food deserts often overlap with historically marginalized communities, particularly communities of color, demonstrating that food access issues extend beyond geography to systemic inequality. Urban mobility can also be problematic, especially in areas with limited public transportation, where grocery shopping might become a day-long endeavor requiring multiple bus transfers or long walks with heavy bags." },
    { id: 6, title: "High-Poverty Urban Areas", description: "Many urban areas have poverty rates exceeding 20%. Residents in these communities experience significant financial burden when purchasing food or accessing various services. Urban costs of living typically exceed those in outlying areas, exacerbating food access issues for low-income populations. Residents of high-poverty urban areas face numerous economic barriers to purchasing healthy food. Limited budgets often lead households to choose processed foods with lower cost-per-calorie ratios, as fresh fruits, vegetables, and protein sources typically cost more than processed alternatives. Additionally, residents in these areas often work multiple jobs or irregular hours, leaving little time for food shopping or cooking. This increases reliance on convenience foods or fast food options. Furthermore, in urban areas with high housing costs, food budgets become even more constrained, sometimes forcing 'rent or food' decisions. The cumulative effect of these economic pressures significantly impacts dietary quality and overall health outcomes in these communities." },
    { id: 7, title: "Vulnerable Zones: Dual Burden", description: "Vulnerable Zones—where urban food deserts overlap with high-poverty areas—require special attention. While grocery stores may be relatively closer than in rural areas and delivery services technically available, residents must travel farther for food purchases compared to other urban dwellers. Additionally, delivery service costs often present a prohibitive expense for low-income households, making them practically inaccessible. Residents of Vulnerable Zones frequently experience 'time poverty.' Relying on public transportation to reach distant grocery stores can consume several hours for a single shopping trip. This creates particular hardship for those working multiple jobs or managing family care responsibilities. While online delivery services could theoretically address these time constraints, additional costs like delivery fees, minimum order requirements, and tips create significant barriers for low-income households. Another critical aspect of these areas is 'food quality inequality.' Grocery stores in low-income neighborhoods often offer lower quality fresh produce with limited selection. This creates additional challenges for residents attempting to maintain healthy diets, effectively imposing a 'quality tax' that compounds existing economic disadvantages." },
    { id: 8, title: "Case Study: Hawthorne, New York", description: "Hawthorne, located in New York City, is home to over 4,500 residents but suffers from an exceptionally high poverty rate of 68.2%. Despite being in a densely populated residential area, the neighborhood only has dollar stores within a 2-mile radius, with the nearest grocery markets offering fresh food located beyond this distance. In such areas, car ownership rates tend to be lower, forcing many residents to rely on public transportation for grocery shopping. Travel to large supermarkets requires significant time and effort, creating additional barriers to regular food shopping. Small stores within the neighborhood typically carry limited varieties of packaged foods, further restricting access to fresh options. This situation demonstrates the inequalities in food access that exist even within urban areas, highlighting how difficult it can be to obtain fresh, healthy food in predominantly low-income neighborhoods. This goes beyond mere inconvenience, representing a serious social issue that can lead to nutritional imbalances and health disparities." },
    { id: 9, title: "Current Supports", description: "The America's Healthy Food Financing Initiative (HFFI) provides grants, loans, and tax incentives to support establishing new grocery stores or expanding existing ones in food desert areas. Since its inception in 2010, this program has supported hundreds of projects nationwide, but challenges remain regarding long-term sustainability. Many grocery stores in low-income areas struggle to maintain profitability, sometimes closing despite initial support. The Supplemental Nutrition Assistance Program (SNAP) offers direct assistance to low-income households for food purchases, but improvements are needed regarding benefit adequacy and enhancing access to fresh foods. Some states have implemented innovative approaches, such as providing additional benefits when SNAP is used at farmers' markets or Community Supported Agriculture (CSA) programs. These government programs provide critical support but have several limitations. First, these initiatives primarily focus on urban areas, allocating relatively fewer resources to addressing rural food desert issues. Second, infrastructure-centered approaches are time-consuming to implement and may not reflect rapidly changing food consumption patterns. Third, these programs often adopt one-size-fits-all approaches that fail to adequately consider specific community needs and cultural preferences." },
    { id: 10, title: "The Potential of Grocery Delivery", description: "While current support policies focus on building physical grocery stores, many food desert areas face economic and geographic constraints that make operating stores difficult. In this context, delivery services can serve as an effective alternative. By supporting or encouraging the expansion of delivery services from existing grocery stores, food accessibility can be improved without constructing new establishments. Grocery delivery services offer several advantages in addressing food desert issues. First, they can be implemented more quickly than physical infrastructure, allowing for rapid improvement in food access. Second, utilizing existing stores and delivery networks can be more cost-effective than building new grocery stores. Third, they provide essential services particularly for seniors with limited mobility, people with disabilities, and residents with restricted vehicle access. Group delivery systems could become a model that further extends these benefits. By ordering together, multiple households can share delivery costs and enable service expansion to previously unserved areas. This approach can also be more environmentally sustainable, as delivering multiple orders simultaneously reduces traffic and carbon emissions. Policymakers could consider subsidies for these services or programs that support delivery costs for low-income individuals." }
];

// 현재 활성화된 스토리 인덱스
let currentStoryIndex = 0;

// 스토리 서클과 연결선 생성
function createStoryCircles() {
    const container = document.getElementById('storyCirclesContainer');
    if (!container) return;
    
    // 기존 내용 제거
    container.innerHTML = '';
    
    // 서클과 연결선 생성
    storySteps.forEach((step, index) => {
        // 이전 서클이 있다면 연결선 추가
        if (index > 0) {
            const connector = document.createElement('div');
            connector.className = 'story-connector';
            // 현재 스토리 이전의 연결선은 활성화
            if (index <= currentStoryIndex) {
                connector.classList.add('active');
            }
            container.appendChild(connector);
        }
        
        // 서클 생성 (번호 없이)
        const circle = document.createElement('div');
        circle.className = 'story-circle';
        circle.setAttribute('data-index', index);
        circle.setAttribute('title', step.title);
        
        // 현재 활성화된 서클 표시
        if (index === currentStoryIndex) {
            circle.classList.add('active');
        }
        // 이미 방문한 서클 표시
        else if (index < currentStoryIndex) {
            circle.classList.add('visited');
        }
        
        // 클릭 이벤트 추가
        circle.addEventListener('click', () => {
            navigateToStory(index);
        });
        
        container.appendChild(circle);
    });
}

// 스토리 이동 함수
function navigateToStory(index) {
    // 유효한 인덱스 범위 체크
    if (index < 0 || index >= storySteps.length) return;
    
    // 스토리 5,6,7에서 다른 스토리로 이동하는 경우 그리드 숨기기
    const fromStory5to7 = (currentStoryIndex === 5 || currentStoryIndex === 6 || currentStoryIndex === 7);
    const toOtherStory = !(index === 5 || index === 6 || index === 7);
    
    if (fromStory5to7 && toOtherStory) {
        const story5Grid = document.getElementById('story5-grid');
        if (story5Grid) {
            story5Grid.style.display = 'none';
        }
    }
    
    // 스토리 4에서 다른 스토리로 이동하는 경우 컨테이너 숨기기
    if (currentStoryIndex === 4 && index !== 4) {
        const story4Container = document.getElementById('story4-container');
        if (story4Container) {
            story4Container.style.display = 'none';
        }
    }

    // 스토리 8에서 다른 스토리로 이동하는 경우 컨테이너 숨기기
    if (currentStoryIndex === 8 && index !== 8) {
        const story8Container = document.getElementById('story8-container');
        if (story8Container) {
            story8Container.style.display = 'none';
        }
    }

    // 이전 스토리 정리
    cleanupCurrentStory();
    
    // 이전 활성화 서클 비활성화
    const prevActiveCircle = document.querySelector('.story-circle.active');
    if (prevActiveCircle) {
        prevActiveCircle.classList.remove('active');
    }
    
    // 새 인덱스로 업데이트
    currentStoryIndex = index;
    
    // 서클과 연결선 업데이트
    createStoryCircles();
    
    // 여기에 스토리 단계별 기능 실행
    executeStoryStep(storySteps[currentStoryIndex]);
    
    // 이전/다음 버튼 상태 업데이트
    updateNavigationButtons();
}
function cleanupCurrentStory() {
    const mainMapContainer = document.getElementById('Main_map');
    
     // 항상 그래프 제거
     console.log("Explicitly removing graphs in cleanupCurrentStory");
     removeStoryGraphs();

    // 스토리 4 정리
    const story4Container = document.getElementById('story4-container');
    if (story4Container) {
        story4Container.style.display = "none";
    }

     // 스토리 8 정리
     const story8Container = document.getElementById('story8-container');
     if (story8Container) {
         story8Container.style.display = "none";
     }
    
    // 스토리 4의 맵 정리
    if (window.story4Map) {
        try {
            // 직접 제거하지 않고 숨김 처리
            // window.story4Map.remove();
            // window.story4Map = null;
        } catch (e) {
            console.error("Error removing story4 map:", e);
        }
    }

     // 스토리 8의 맵 정리
     if (window.story8Map) {
        try {
            // 직접 제거하지 않고 숨김 처리
            // window.story8Map.remove();
            // window.story8Map = null;
        } catch (e) {
            console.error("Error removing story8 map:", e);
        }
    }
    

    // 스토리 5, 6, 7 정리 - 타겟 스토리에 따라 처리
    const story5Grid = document.getElementById('story5-grid');
    const targetStoryIndex = currentStoryIndex; // 이동하려는 스토리 인덱스
    
    // 이동하려는 스토리가 5, 6, 7이 아니면 그리드 숨기기
    if (story5Grid && !(targetStoryIndex === 5 || targetStoryIndex === 6 || targetStoryIndex === 7)) {
        story5Grid.style.display = 'none';
        
        // 시티 맵 인스턴스들도 일시 중지
        if (window.cityMaps) {
            Object.keys(window.cityMaps).forEach(key => {
                if (window.cityMaps[key]) {
                    try {
                        // 여기서 remove()를 호출하면 인스턴스가 완전히 파괴되므로
                        // 다시 스토리 5, 6, 7로 돌아올 때 재생성해야 함
                        // 대신 추가한 레이어의 표시 여부만 조정
                        // window.cityMaps[key].remove();
                    } catch (e) {
                        console.error(`Error handling map for ${key}:`, e);
                    }
                }
            });
        }
    }
    
    // 메인 맵 표시
    if (mainMapContainer) {
        mainMapContainer.style.display = 'block';
    }
    
    // 메인 맵 레이어 초기화
    if (Main_map) {
        try {
            // 모든 레이어 투명도 초기화
            const layersToReset = ['delivery', 'food', 'demography', 'Access_Void'];
            layersToReset.forEach(layer => {
                // 일단 모든 레이어 숨김
                Main_map.setPaintProperty(layer, 'fill-opacity', 0);
                Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
            });
        } catch (e) {
            console.error("Error resetting main map layers:", e);
        }
    }
}

// 이전/다음 버튼 상태 업데이트 함수
function updateNavigationButtons() {
    const prevButton = document.getElementById('prevStory');
    const nextButton = document.getElementById('nextStory');
    
    if (prevButton) {
        // 첫 번째 스토리에서는 이전 버튼 비활성화
        if (currentStoryIndex <= 0) {
            prevButton.classList.add('disabled');
            prevButton.setAttribute('disabled', 'disabled');
        } else {
            prevButton.classList.remove('disabled');
            prevButton.removeAttribute('disabled');
        }
    }
    
    if (nextButton) {
        // 마지막 스토리에서는 다음 버튼 비활성화
        if (currentStoryIndex >= storySteps.length - 1) {
            nextButton.classList.add('disabled');
            nextButton.setAttribute('disabled', 'disabled');
        } else {
            nextButton.classList.remove('disabled');
            nextButton.removeAttribute('disabled');
        }
    }
}

// 맵 레이어 설정 함수 (executeStoryStep 함수 바깥에 정의)
function setMapLayers(cityId, storyId) {
    if (!window.cityMaps || !window.cityMaps[cityId]) return;
    
    try {
        // 모든 레이어 숨기기
        Object.keys(layerSettings_city).forEach(layer => {
            window.cityMaps[cityId].setPaintProperty(layer, 'fill-opacity', 0);
            window.cityMaps[cityId].setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
        });
        
        // 스토리에 따라 적절한 레이어 표시
        switch (storyId) {
            case 5:
                // Food_All 레이어만 표시
                window.cityMaps[cityId].setPaintProperty('Food_All', 'fill-opacity', 0.7);
                window.cityMaps[cityId].setPaintProperty('Food_All-outline', 'line-opacity', 0.9);
                break;
            case 6:
                // Poverty_All 레이어만 표시
                window.cityMaps[cityId].setPaintProperty('Poverty_All', 'fill-opacity', 0.7);
                window.cityMaps[cityId].setPaintProperty('Poverty_All-outline', 'line-opacity', 0.9);
                break;
            case 7:
                // 세 개의 레이어 표시 (다른 투명도로)
                window.cityMaps[cityId].setPaintProperty('Food_All', 'fill-opacity', 0.2);
                window.cityMaps[cityId].setPaintProperty('Food_All-outline', 'line-opacity', 0.3);
                
                window.cityMaps[cityId].setPaintProperty('Poverty_All', 'fill-opacity', 0.2);
                window.cityMaps[cityId].setPaintProperty('Poverty_All-outline', 'line-opacity', 0.3);
                
                window.cityMaps[cityId].setPaintProperty('Outcome_All', 'fill-opacity', 0.7);
                window.cityMaps[cityId].setPaintProperty('Outcome_All-outline', 'line-opacity', 0.9);
                break;
        }
    } catch (e) {
        console.error(`Error setting layers for ${cityId} in story ${storyId}:`, e);
    }
}

// 그래프 컨테이너를 생성하는 함수 수정
function createGraphContainer(id) {
    // 그래프 컨테이너 생성 (왼쪽에 위치, 그래프 두 개를 나란히 배치할 수 있는 크기)
    const container = document.createElement('div');
    container.id = id;
    container.className = 'story-graph-container';
    
    // 스타일 설정 - 맵에 종속되지 않고 독립적으로 위치
    container.style.position = 'absolute';
    container.style.bottom = '20px';
    container.style.left = '0px';
    container.style.display = 'flex'; // 그래프를 나란히 배치하기 위해 flex 사용
    container.style.gap = '0px'; // 그래프 사이 간격
    container.style.zIndex = '10';
    
    // Main_map 컨테이너가 아닌 body에 직접 추가
    document.body.appendChild(container);
    
    return container;
}

function addGraphImage(container, src, position) {
    // SVG 그래프 이미지 생성
    const img = document.createElement('img');
    img.src = src;
    img.style.width = '180px'; // 그래프 크기 조정
    img.style.height = '180px';
    
    // 로딩 실패 시 콘솔에 오류 기록
    img.onerror = function() {
        console.error(`Failed to load graph: ${src}`);
        this.style.display = 'none'; // 이미지 로드 실패 시 숨김
    };
    
    // 컨테이너에 이미지 추가
    container.appendChild(img);
    
    return img;
}

// 그래프 초기화 함수 수정 - Main_map과 독립적으로 동작
function addInitialGraphs() {
    console.log("Adding initial graphs independently");
    
    // 기존 그래프 제거
    removeStoryGraphs();
    
    // 그래프 컨테이너 추가
    const graphContainer = createGraphContainer('graph-container-story1');
    
    // 그래프 이미지 추가
    addGraphImage(graphContainer, 'Graph_M/Graph_1.svg', 'left');
    addGraphImage(graphContainer, 'Graph_M/Graph_2.svg', 'right');
}

// removeStoryGraphs 함수 개선
function removeStoryGraphs() {
    console.log("Removing all story graph containers");
    // 모든 기존 그래프 컨테이너 제거
    const existingGraphs = document.querySelectorAll('.story-graph-container');
    existingGraphs.forEach(graph => {
        console.log(`Removing graph container: ${graph.id}`);
        graph.remove();
    });
}

function resetStoryToBeginning() {
    console.log("Resetting story to beginning");
    
    // 스토리 인덱스를 0으로 설정
    currentStoryIndex = 0;
    
    // 스토리 서클 업데이트
    createStoryCircles();
    
    // 첫 번째 스토리 실행
    executeStoryStep(storySteps[0]);
    
    // 내비게이션 버튼 상태 업데이트
    updateNavigationButtons();
}

// 스토리 단계별 기능 실행 함수 (나중에 확장)
function executeStoryStep(step) {
    console.log(`Executing story step ${step.id}: ${step.title}`);
    
    // 스토리 내용 업데이트
    updateStoryContent(step);
    
    // 스토리 단계별 다른 기능 구현
    switch(step.id) {
        case 1:
            if (Main_map) {
                // 모든 레이어 투명도 초기화
                const layersToChange = ['delivery', 'food', 'demography', 'Access_Void'];
                layersToChange.forEach(layer => {
                    try {
                        if (layer === 'food') {
                            // food 레이어만 0.7 투명도로 표시
                            Main_map.setPaintProperty(layer, 'fill-opacity', 0.7);
                            Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0.9);
                        } else {
                            // 나머지 레이어는 숨김
                            Main_map.setPaintProperty(layer, 'fill-opacity', 0);
                            Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                        }
                    } catch (e) {
                        console.error(`Error setting layer ${layer}:`, e);
                    }
                });
                        
                try {
                    // 지도 위치 이동
                    Main_map.flyTo({
                        center: [-96.35, 38.50], 
                        zoom: 3.95, 
                        essential: true
                    });
                } catch (e) {
                    console.error("Error flying to location:", e);
                }
            }
            
            // Access_Story 탭 선택된 상태에서만 그래프 추가
            // 사이드바 이름 확인을 통해 현재 선택된 탭 확인
            const sidebarName = document.querySelector(".Sidebar_Name");
            if (sidebarName && sidebarName.textContent.trim() === "Access_Story") {
                console.log("Adding graphs for Story 1 in Access_Story tab");
                removeStoryGraphs();
                const graphContainer = createGraphContainer('graph-container-story1');
                addGraphImage(graphContainer, 'Graph_M/Graph_1.svg', 'left');
                addGraphImage(graphContainer, 'Graph_M/Graph_2.svg', 'right');
            } else {
                // Access_Story 탭이 아닌 경우 그래프 제거
                removeStoryGraphs();
            }
            
            break;

            case 2:
                if (Main_map) {
                    // 모든 레이어 투명도 초기화
                    const layersToChange = ['delivery', 'food', 'demography', 'Access_Void'];
                    layersToChange.forEach(layer => {
                        try {
                            if (layer === 'delivery') {
                                // delivery 레이어만 0.7 투명도로 표시
                                Main_map.setPaintProperty(layer, 'fill-opacity', 0.7);
                                Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0.9);
                            } else {
                                // 나머지 레이어는 숨김
                                Main_map.setPaintProperty(layer, 'fill-opacity', 0);
                                Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                            }
                        } catch (e) {
                            console.error(`Error setting layer ${layer}:`, e);
                        }
                    });
                }
                
                // 기존 그래프 제거하고 스토리 2 그래프 추가
                console.log("Adding graphs for Story 2");
                removeStoryGraphs();
                const graphContainer2 = createGraphContainer('graph-container-story2');
                addGraphImage(graphContainer2, 'Graph_M/Graph_3.svg', 'left');
                addGraphImage(graphContainer2, 'Graph_M/Graph_4.svg', 'right');
                
                break;
                case 3:
                    // 모든 그래프 제거
                    removeStoryGraphs();
                    if (Main_map) {
                        // 모든 레이어 투명도 초기화
                        const layersToChange = ['delivery', 'food', 'Access_Void'];
                        layersToChange.forEach(layer => {
                            if (layer === 'Access_Void') {
                                // Access_Void 레이어만 0.7 투명도로 표시
                                Main_map.setPaintProperty(layer, 'fill-opacity', 0.7);
                                Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0.9);
                            } else {
                                // 나머지 레이어는 낮은 투명도
                                Main_map.setPaintProperty(layer, 'fill-opacity', 0.1);
                                Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                            }
                        });
                    }
                    
                    // 스토리 3 그래프 추가
                    console.log("Adding Graph_5 for Story 3");
                    const graphContainer3 = createGraphContainer('graph-container-story3');
                    addGraphImage(graphContainer3, 'Graph_M/Graph_5.svg', 'center');
                    
                    break;
            case 4:
                // 모든 그래프 제거
                removeStoryGraphs();
                // 메인 맵 숨기기
                const mainMapContainer = document.getElementById('Main_map');
                if (mainMapContainer) {
                    mainMapContainer.style.display = "none";
                }

                // 스토리 5의 그리드 숨기기
                const story5Grid = document.getElementById('story5-grid');
                if (story5Grid) {
                    story5Grid.style.display = 'none';
                }
                
                // story4 전용 컨테이너가 없으면 생성
                let story4Container = document.getElementById('story4-container');
                if (!story4Container) {
                    story4Container = document.createElement('div');
                    story4Container.id = 'story4-container';
                    story4Container.style.position = "absolute";
                    story4Container.style.top = "8vh";
                    story4Container.style.left = "0px";
                    story4Container.style.width = "calc(100% - 20vw)";
                    story4Container.style.height = "calc(100% - 8vh)";
                    story4Container.style.zIndex = "100";
                    story4Container.style.display = "flex";
                    
                    // story4 맵 컨테이너 생성
                    const story4MapContainer = document.createElement('div');
                    story4MapContainer.id = 'story4-map';
                    story4MapContainer.style.width = "100%";
                    story4MapContainer.style.height = "100%";
                    story4MapContainer.style.position = "absolute"; // 레전드 배치를 위해 필요
                    
                    // story4 콘텐츠 컨테이너 생성
                    const story4Content = document.createElement('div');
                    story4Content.id = 'story4-content';
                    story4Content.style.width = "30%";
                    story4Content.style.right = "0px";
                    story4Content.style.height = "100%";
                    story4Content.style.overflowY = "auto";
                    story4Content.style.background = "rgba(255, 255, 255, 0.7)";
                    story4Content.style.padding = "15px";
                    story4Content.style.borderRadius = "0px";
                    story4Content.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
                    story4Content.style.boxSizing = "border-box";
                    story4Content.style.zIndex = '10';
                    
                    // 컨테이너에 맵과 콘텐츠 추가
                    story4Container.appendChild(story4MapContainer);
                    story4Container.appendChild(story4Content);
                    
                    // body에 story4 컨테이너 추가
                    document.body.appendChild(story4Container);
                } else {
                    // 이미 존재하면 표시
                    story4Container.style.display = "flex";
                }
                
                // 레전드 추가 함수
                const addStory4Legend = (map) => {
                    // 기존 레전드 제거
                    const oldLegend = document.getElementById('story4-legend');
                    if (oldLegend) {
                        oldLegend.remove();
                    }
                    
                    // 레전드 컨테이너 생성
                    const legendContainer = document.createElement('div');
                    legendContainer.id = 'story4-legend';
                    legendContainer.style.position = 'absolute';
                    legendContainer.style.bottom = '20px';
                    legendContainer.style.right = '20px';
                    legendContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    legendContainer.style.padding = '10px';
                    legendContainer.style.borderRadius = '5px';
                    legendContainer.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
                    legendContainer.style.zIndex = '10';
                    
                    // 레전드 내용 생성
                    legendContainer.innerHTML = `
                        <h4 style="margin-top: 0; margin-bottom: 5px; color: #ffffff;">Map Legend</h4>
                        <div style="display: flex; align-items: center; margin-bottom: 5px;">
                            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${grocery_pointStyle.strokeColor}; margin-right: 5px;"></div>
                            <span style="font-size: 12px; color: #ffffff;">Grocery Store</span>
                        </div>
                        <div style="display: flex; align-items: center; margin-bottom: 5px;">
                            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${package_pointStyle.strokeColor}; margin-right: 5px;"></div>
                            <span style="font-size: 12px; color: #ffffff;">Package Collection</span>
                        </div>
                        <div style="display: flex; align-items: center; margin-bottom: 5px;">
                            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${hospital_pointStyle.strokeColor}; margin-right: 5px;"></div>
                            <span style="font-size: 12px; color: #ffffff;">Hospital</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${community_pointStyle.strokeColor}; margin-right: 5px;"></div>
                            <span style="font-size: 12px; color: #ffffff;">Community Center</span>
                        </div>
                    `;
                    
                    // 맵 컨테이너에 레전드 추가
                    const story4MapContainer = document.getElementById('story4-map');
                    if (story4MapContainer) {
                        story4MapContainer.appendChild(legendContainer);
                    }
                };
                
                // 맵 소스 추가 함수
                const addStory4MapSources = (map) => {
                    // 필요한 모든 소스 추가
                    map.addSource('10mi', { type: 'geojson', data: 'Proto_test/10mi.geojson' });
                    map.addSource('5mi', { type: 'geojson', data: 'Proto_test/5mi.geojson' });
                    map.addSource('20mi', { type: 'geojson', data: 'Proto_test/20mi.geojson' });
                    map.addSource('town', { type: 'geojson', data: 'Proto_test/Town.geojson' });
                    map.addSource('line', { type: 'geojson', data: 'Proto_test/Line.geojson' });
                    map.addSource('line-grocery', { type: 'geojson', data: 'Proto_test/Line_grocery.geojson' });
                    map.addSource('p_5', { type: 'geojson', data: 'Proto_test/5mi_p.geojson' });
                    map.addSource('p_10', { type: 'geojson', data: 'Proto_test/10mi_p.geojson' });
                    map.addSource('p_20', { type: 'geojson', data: 'Proto_test/20mi_p.geojson' });
                    map.addSource('grocery', { type: 'geojson', data: 'Proto_test/Grocery.geojson' });
                    map.addSource('package', { type: 'geojson', data: 'Proto_test/Package.geojson' });
                    map.addSource('hospital', { type: 'geojson', data: 'Proto_test/Hospital.geojson' });
                    map.addSource('community', { type: 'geojson', data: 'Proto_test/Community_Center.geojson' });
                };
                
                // 맵 레이어 추가 함수
                const addStory4MapLayers = (map) => {
                    const layerId = 'story4-layer';
                    
                    // 10mi 레이어
                    map.addLayer({
                        id: `${layerId}-10mi-layer`,
                        type: 'fill',
                        source: '10mi',
                        paint: { 
                            'fill-color': r10miStyle.fillColor, 
                            'fill-opacity': r10miStyle.fillOpacity 
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    map.addLayer({
                        id: `${layerId}-10mi-border`,
                        type: 'line',
                        source: '10mi',
                        paint: { 
                            'line-color': r10miStyle.borderColor, 
                            'line-width': r10miStyle.borderWidth, 
                            'line-opacity': r10miStyle.borderOpacity,
                            'line-dasharray': r10miStyle.dasharray
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    
                    // 5mi 레이어
                    map.addLayer({
                        id: `${layerId}-5mi-layer`,
                        type: 'fill',
                        source: '5mi',
                        paint: { 
                            'fill-color': r5miStyle.fillColor, 
                            'fill-opacity': r5miStyle.fillOpacity 
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    map.addLayer({
                        id: `${layerId}-5mi-border`,
                        type: 'line',
                        source: '5mi',
                        paint: { 
                            'line-color': r5miStyle.borderColor, 
                            'line-width': r5miStyle.borderWidth, 
                            'line-opacity': r5miStyle.borderOpacity,
                            'line-dasharray': r5miStyle.dasharray
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    
                    // 20mi 레이어
                    map.addLayer({
                        id: `${layerId}-20mi-layer`,
                        type: 'fill',
                        source: '20mi',
                        paint: { 
                            'fill-color': r20miStyle.fillColor, 
                            'fill-opacity': r20miStyle.fillOpacity 
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    map.addLayer({
                        id: `${layerId}-20mi-border`,
                        type: 'line',
                        source: '20mi',
                        paint: { 
                            'line-color': r20miStyle.borderColor, 
                            'line-width': r20miStyle.borderWidth, 
                            'line-opacity': r20miStyle.borderOpacity,
                            'line-dasharray': r20miStyle.dasharray
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    
                    // 라인 레이어
                    map.addLayer({
                        id: `${layerId}-line-layer`,
                        type: 'line',
                        source: 'line',
                        paint: { 
                            'line-color': lineStyle.color, 
                            'line-width': lineStyle.width, 
                            'line-opacity': lineStyle.opacity,
                            'line-dasharray': lineStyle.dasharray
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    
                    // 식료품점 라인 레이어
                    map.addLayer({
                        id: `${layerId}-line-grocery-layer`,
                        type: 'line',
                        source: 'line-grocery',
                        paint: { 
                            'line-color': groceryLineStyle.color, 
                            'line-width': groceryLineStyle.width, 
                            'line-opacity': groceryLineStyle.opacity,
                            'line-dasharray': lineStyle.dasharray
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    
                    // 포인트 레이어들
                    map.addLayer({
                        id: `${layerId}-grocery_point-layer`,
                        type: 'circle',
                        source: 'grocery',
                        paint: {
                            'circle-radius': grocery_pointStyle.radius,
                            'circle-color': grocery_pointStyle.fillColor,
                            'circle-opacity': grocery_pointStyle.fillOpacity,
                            'circle-stroke-color': grocery_pointStyle.strokeColor,
                            'circle-stroke-width': grocery_pointStyle.strokeWidth,
                            'circle-stroke-opacity': grocery_pointStyle.strokeOpacity
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    map.addLayer({
                        id: `${layerId}-package_point-layer`,
                        type: 'circle',
                        source: 'package',
                        paint: {
                            'circle-radius': package_pointStyle.radius,
                            'circle-color': package_pointStyle.fillColor,
                            'circle-opacity': package_pointStyle.fillOpacity,
                            'circle-stroke-color': package_pointStyle.strokeColor,
                            'circle-stroke-width': package_pointStyle.strokeWidth,
                            'circle-stroke-opacity': package_pointStyle.strokeOpacity
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    map.addLayer({
                        id: `${layerId}-hospital_point-layer`,
                        type: 'circle',
                        source: 'hospital',
                        paint: {
                            'circle-radius': hospital_pointStyle.radius,
                            'circle-color': hospital_pointStyle.fillColor,
                            'circle-opacity': hospital_pointStyle.fillOpacity,
                            'circle-stroke-color': hospital_pointStyle.strokeColor,
                            'circle-stroke-width': hospital_pointStyle.strokeWidth,
                            'circle-stroke-opacity': hospital_pointStyle.strokeOpacity
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    map.addLayer({
                        id: `${layerId}-community_point-layer`,
                        type: 'circle',
                        source: 'community',
                        paint: {
                            'circle-radius': community_pointStyle.radius,
                            'circle-color': community_pointStyle.fillColor,
                            'circle-opacity': community_pointStyle.fillOpacity,
                            'circle-stroke-color': community_pointStyle.strokeColor,
                            'circle-stroke-width': community_pointStyle.strokeWidth,
                            'circle-stroke-opacity': community_pointStyle.strokeOpacity
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    
                    // 마일 표시 레이블
                    map.addLayer({
                        id: `${layerId}-point-labels`,
                        type: 'symbol',
                        source: 'p_5',
                        layout: {
                            'text-field': ['literal', '5mi'],
                            'text-size': 15,
                            'text-font': ['Open Sans Bold'],
                            'text-anchor': 'bottom',
                            'text-offset': [1, 0],
                            'icon-optional': true
                        },
                        paint: {
                            'text-color': '#ffffff',
                            'text-opacity': 0.6
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    map.addLayer({
                        id: `${layerId}-point-labels-10`,
                        type: 'symbol',
                        source: 'p_10',
                        layout: {
                            'text-field': ['literal', '10mi'],
                            'text-size': 15,
                            'text-font': ['Open Sans Bold'],
                            'text-anchor': 'bottom',
                            'text-offset': [1, 0],
                            'icon-optional': true
                        },
                        paint: {
                            'text-color': '#ffffff',
                            'text-opacity': 0.6
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    map.addLayer({
                        id: `${layerId}-point-labels-20`,
                        type: 'symbol',
                        source: 'p_20',
                        layout: {
                            'text-field': ['literal', '20mi'],
                            'text-size': 15,
                            'text-font': ['Open Sans Bold'],
                            'text-anchor': 'bottom',
                            'text-offset': [1, 0],
                            'icon-optional': true
                        },
                        paint: {
                            'text-color': '#ffffff',
                            'text-opacity': 0.6
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    
                    // 마을 레이어
                    map.addLayer({
                        id: `${layerId}-town-fill`,
                        type: 'fill',
                        source: 'town',
                        paint: { 
                            'fill-color': townStyle.fillColor, 
                            'fill-opacity': townStyle.fillOpacity 
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    map.addLayer({
                        id: `${layerId}-town-line`,
                        type: 'line',
                        source: 'town',
                        paint: { 
                            'line-color': townStyle.borderColor, 
                            'line-width': townStyle.borderWidth, 
                            'line-opacity': townStyle.borderOpacity 
                        },
                        filter: ['==', ['to-number', ['get', 'id']], 13]
                    });
                    
                    // 레전드 추가
                    addStory4Legend(map);
                };
                
                // 상세 내용 업데이트 함수
                const updateStory4Content = () => {
                    const story4Content = document.getElementById('story4-content');
                    if (!story4Content) return;
                    
                    // 스크롤바 스타일 적용
                    story4Content.style.cssText += `
                        scrollbar-width: thin;
                        scrollbar-color: #dadada #00000000;
                    `;
                    
                    // 웹킷 기반 브라우저를 위한 스크롤바 스타일 추가
                    const styleElement = document.createElement('style');
                    styleElement.textContent = `
                        #story4-content::-webkit-scrollbar {
                            width: 5px;
                            height: 10px;
                        }
                        
                        #story4-content::-webkit-scrollbar-track {
                            background: #00000000;
                            border-radius: 10px;
                        }
                        
                        #story4-content::-webkit-scrollbar-thumb {
                            background: #dadada;
                            border-radius: 10px;
                            border: 2px solid #f0f0f000;
                            height: 10px;
                        }
                        
                        #story4-content::-webkit-scrollbar-thumb:hover {
                            background: #555;
                        }
                    `;
                    document.head.appendChild(styleElement);
                    
                    // Access_Void.geojson에서 ID 13의 데이터 가져오기
                    fetch('Prototype/Access_Void.geojson')
                        .then(response => response.json())
                        .then(data => {
                            const feature = data.features.find(f => f.properties.id_number === 13);
                            if (feature) {
                                const props = feature.properties;
                                const town = props.Town || "Unknown";
                                const state = props.States || "Unknown";
                                const zipcode = props.Zipcode || "Unknown";
                                
                                // Race 데이터
                                const raceData = [
                                    { label: "White", value: props["Ratio_White"] },
                                    { label: "Black", value: props["Ratio_Black and African"] },
                                    { label: "Other Race", value: props["Ratio_Other Race"] },
                                    { label: "Asian", value: props["Ratio_Asian"] },
                                    { label: "Native", value: props["Ratio_Indian and Alaska"] },
                                    { label: "Pacific Islander", value: props["Ratio_Hawaiian and Pacific"] }
                                ];
                                
                                // 최대 비율 인종 찾기
                                let maxRace = raceData.reduce((max, r) => {
                                    let val = parseFloat(r.value) || 0;
                                    return val > max.value ? { label: r.label, value: val } : max;
                                }, { label: "", value: 0 });
                                
                                const poverty = { label: "Poverty", value: props["Poverty_Rate"] };
                                const highlightColor = "#EA8901";
                                
                                // 카테고리 매핑
                                const categoryMap = {
                                    income: "Poverty rate is higher than U.S average",
                                    transportation: "No public transportation",
                                    road: "Roads are bad-paved",
                                    restaurant: "No restaurants or cafe in town",
                                    agriculture: "Surrounded by farmland",
                                    distance: "Nearest city is more than 100 miles away",
                                    barriers: "Blocked by natural features (Mountain or river)",
                                    grocery: "Nearest grocery market is more than 15 miles away",
                                    facilities: "No hospital, post offices or community center in town"
                                };
                                
                                // 카테고리 항목 만들기
                                const categoryItems = Object.keys(categoryMap)
                                    .filter(category => props[category] === 1)
                                    .map(category => `<li style="margin-bottom: 8px;">${categoryMap[category]}</li>`)
                                    .join("");
                                
                                // Race 테이블 만들기
                                let raceTable = `
                                    <div style="margin-bottom: 5px;">
                                        <p style="font-size: 14px; margin-bottom: 5px; color: #333;"><strong>Race Demographics</strong></p>
                                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center; font-size: 13px;">
                                            ${raceData.map(r => `
                                                <div style="padding: 2px; border-radius: 5px; background-color: ${r.label === maxRace.label ? 'rgba(234, 137, 1, 0.1)' : 'transparent'}; ${r.label === maxRace.label ? `color: ${highlightColor}; font-weight: bold;` : ''}">
                                                    <div>${r.label}</div>
                                                    <div>${r.value ? parseFloat(r.value).toFixed(1) : "0"}%</div>
                                                </div>
                                            `).join("")}
                                        </div>
                                    </div>
                                `;
                                
                                // 콘텐츠 업데이트
                                story4Content.innerHTML = `
                                    <div style="padding: 0 10px;">
                                        <div style="position: relative; margin-bottom: 15px;">
                                            <!-- 위성 이미지 -->
                                            <img src="satellite/satellite_13.png" alt="Satellite Image of ${town}" 
                                                style="width: 100%; height: auto; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                                            
                                            <!-- 이미지 위에 오버레이된 제목 (absolute 포지셔닝) -->
                                            <h2 style="position: absolute; top: 15px; left: 15px; color: white; margin: 0; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${town}</h2>
                                        </div>
                                        <p style="color: #333; margin-bottom: 10px; "font-size: 16px;"><strong>${state}, ${zipcode}</strong></p>
                                        
                                        ${raceTable}
                                        
                                        <div style="margin-bottom: 10px;">
                                            <p style="font-size: 14px; margin-bottom: 5px;"><strong>${poverty.label} Rate:</strong> ${poverty.value ? parseFloat(poverty.value).toFixed(1) : "0"}%</p>
                                            <p style="font-size: 14px; margin-bottom: 5px;"><strong> Population:</strong> 1084</p>
                                        </div>
                                        <div>
                                            <ul style="padding-left: 20px; font-size: 14px;">
                                                ${categoryItems}
                                            </ul>
                                        </div>
                                    </div>
                                `;
                            }
                        })
                        .catch(error => {
                            console.error('Error loading Access_Void.geojson:', error);
                        });
                };
                
                // story4 맵 초기화 및 데이터 로드
                const loadStory4Map = () => {
                    const story4MapContainer = document.getElementById('story4-map');
                    if (!story4MapContainer) return;
                    
                    // story4 맵이 이미 초기화되어 있는지 확인
                    let story4Map = window.story4Map;
                    
                    if (!story4Map) {
                        // 맵 초기화
                        story4Map = new mapboxgl.Map({
                            container: 'story4-map',
                            style: 'mapbox://styles/kit3775/cm7alf2vv004501s6gs2y0226',
                            center: [-99.96, 28.746], // ID 13의 위치 직접 설정
                            zoom: 8
                        });
                        
                        window.story4Map = story4Map; // 전역 변수에 저장
                        
                        // 맵 로드 완료 후 레이어 추가
                        story4Map.on('load', () => {
                            // GeoJSON 데이터 소스 추가
                            addStory4MapSources(story4Map);
                            
                            // ID 13에 해당하는 레이어 추가
                            addStory4MapLayers(story4Map);
                            
                            // 콘텐츠 업데이트
                            updateStory4Content();
                        });
                    } else {
                        // 이미 초기화된 맵이 있으면 resize 및 위치 설정
                        story4Map.resize();
                        story4Map.setCenter([-99.96, 28.746]);
                        story4Map.setZoom(8);
                        
                        // 콘텐츠 업데이트
                        updateStory4Content();
                        
                        // 레전드가 있는지 확인하고 없으면 추가
                        if (!document.getElementById('story4-legend')) {
                            addStory4Legend(story4Map);
                        }
                    }
                };
                
                // 스토리를 이동할 때 story4 컨테이너를 숨기는 함수
                const hideStory4Container = () => {
                    const story4Container = document.getElementById('story4-container');
                    if (story4Container) {
                        story4Container.style.display = "none";
                    }
                    
                    // 메인 맵 다시 표시
                    if (mainMapContainer) {
                        mainMapContainer.style.display = "block";
                    }
                };
                
                // 이전/다음 버튼 및 스토리 서클에 이벤트 리스너 추가
                const prevButton = document.getElementById('prevStory');
                const nextButton = document.getElementById('nextStory');
                
                // 이벤트 핸들러 추가 (중복 방지를 위해 기존 핸들러 제거)
                if (prevButton) {
                    if (prevButton._story4Handler) {
                        prevButton.removeEventListener('click', prevButton._story4Handler);
                    }
                    prevButton._story4Handler = hideStory4Container;
                    prevButton.addEventListener('click', prevButton._story4Handler);
                }
                
                if (nextButton) {
                    if (nextButton._story4Handler) {
                        nextButton.removeEventListener('click', nextButton._story4Handler);
                    }
                    nextButton._story4Handler = hideStory4Container;
                    nextButton.addEventListener('click', nextButton._story4Handler);
                }
                
                // 스토리 서클에도 이벤트 리스너 추가
                const storyCircles = document.querySelectorAll('.story-circle');
                storyCircles.forEach(circle => {
                    const index = parseInt(circle.getAttribute('data-index'));
                    if (index !== 4) { // 현재 스토리(4)가 아닌 경우에만
                        if (circle._story4Handler) {
                            circle.removeEventListener('click', circle._story4Handler);
                        }
                        circle._story4Handler = hideStory4Container;
                        circle.addEventListener('click', circle._story4Handler);
                    }
                });
                
                // 메인 맵 레이어 숨기기
                if (Main_map) {
                    const layersToChange = ['delivery', 'food', 'demography', 'Access_Void'];
                    layersToChange.forEach(layer => {
                        Main_map.setPaintProperty(layer, 'fill-opacity', 0);
                        Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                    });
                }
                
                // 맵 로드 및 데이터 표시
                loadStory4Map();
                
                break;
                case 5:
                    // 모든 그래프 제거
                    removeStoryGraphs();
                    // 메인 맵 컨테이너를 가져옴
                    const mainMapDiv = document.getElementById('Main_map');
                    if (!mainMapDiv) {
                        console.error("Main map container not found");
                        break;
                    }
                            
                    // 메인 맵 표시 (다른 스토리에서 숨겨졌을 수 있음)
                    mainMapDiv.style.display = 'block';
                    
                    // 기존에 저장된 원본 맵이 있는지 확인
                    if (window.originalMainMap && !Main_map) {
                        Main_map = window.originalMainMap;
                    }
                    
                    // 원본 Main_map을 저장
                    if (Main_map && !window.originalMainMap) {
                        window.originalMainMap = Main_map;
                    }
                    
                    // 메인 맵 레이어 숨기기
                    if (Main_map) {
                        try {
                            const layersToHide = ['delivery', 'food', 'demography', 'Access_Void'];
                            layersToHide.forEach(layer => {
                                Main_map.setPaintProperty(layer, 'fill-opacity', 0);
                                Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                            });
                        } catch (e) {
                            console.error("Error hiding main map layers:", e);
                        }
                    }
                    
                    // story4 컨테이너 숨기기
                    const story4Container5 = document.getElementById('story4-container');
                    if (story4Container5) {
                        story4Container5.style.display = 'none';
                    }
                    
                    // 그리드 컨테이너 찾기 또는 생성
                    let gridContainer = document.getElementById('story5-grid');
                    
                    // 그리드가 없으면 새로 생성
                    if (!gridContainer) {
                        console.log("Creating new grid for story 5");
                        gridContainer = document.createElement('div');
                        gridContainer.id = 'story5-grid';
                        gridContainer.style.position = 'absolute';
                        gridContainer.style.width = "calc(100%)";
                        gridContainer.style.height = "calc(100% - 8vh)";
                        gridContainer.style.top = "8vh";
                        gridContainer.style.display = 'grid';
                        gridContainer.style.gridTemplateColumns = '1fr 1fr';
                        gridContainer.style.gridTemplateRows = '1fr 1fr';
                        gridContainer.style.gap = '10px';
                        gridContainer.style.zIndex = '5';
                        
                        // 메인 맵 컨테이너에 그리드 추가
                        mainMapDiv.appendChild(gridContainer);
                        
                        // 4개 도시 정의
                        const cities = [
                            { id: 'NewYork', name: 'New York' },
                            { id: 'LosAngeles', name: 'Los Angeles' },
                            { id: 'Dallas', name: 'Dallas' },
                            { id: 'Chicago', name: 'Chicago' }
                        ];
                        
                        // 도시 맵 인스턴스 저장할 객체 초기화
                        if (!window.cityMaps) {
                            window.cityMaps = {};
                        }
                        
                        // 각 도시별 맵 컨테이너 생성
                        cities.forEach(city => {
                            // 맵 컨테이너 생성
                            const mapContainer = document.createElement('div');
                            mapContainer.id = `map-${city.id}`;
                            mapContainer.className = 'city-map-container';
                            mapContainer.style.position = 'relative';
                            mapContainer.style.width = '100%';
                            mapContainer.style.height = '100%';
                            mapContainer.style.borderRadius = '5px';
                            mapContainer.style.overflow = 'hidden';
                            mapContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                            mapContainer.style.border = '1px solid rgba(255,255,255,0.2)';
                            
                            // 도시 이름 오버레이 추가
                            const cityTitle = document.createElement('div');
                            cityTitle.className = 'city-title';
                            cityTitle.textContent = city.name;
                            cityTitle.style.position = 'absolute';
                            cityTitle.style.bottom = '10px';
                            cityTitle.style.left = '10px';
                            cityTitle.style.color = 'white';
                            cityTitle.style.fontWeight = 'bold';
                            cityTitle.style.textShadow = '0px 0px 4px rgba(0, 0, 0, 0.8)';
                            cityTitle.style.zIndex = '10';
                            
                            // 맵 컨테이너에 요소 추가
                            mapContainer.appendChild(cityTitle);
                            
                            // 그리드에 맵 컨테이너 추가
                            gridContainer.appendChild(mapContainer);
                            
                            // 도시별 위치 정보 가져오기
                            const cityLocation = {...cityLocations[city.id]};
                            
                            // 줌 레벨 조정 (도시별 맞춤)
                            if (city.id === 'NewYork') {
                                cityLocation.zoom = 7.0; // 뉴욕만 더 넓게 보기
                            } else if (city.id === 'Chicago') {
                                cityLocation.zoom = 7.3;
                            } else {
                                cityLocation.zoom = 7.6; // 다른 도시들
                            }
                            
                            // 맵 인스턴스 생성
                            setTimeout(() => {
                                try {
                                    window.cityMaps[city.id] = new mapboxgl.Map({
                                        container: `map-${city.id}`,
                                        style: 'mapbox://styles/kit3775/cm7hvhz9g00kw01qod6lv4rzb',
                                        center: [cityLocation.lng, cityLocation.lat],
                                        zoom: cityLocation.zoom,
                                        attributionControl: false,
                                        interactive: true
                                    });
                                    
                                    // 맵 로드 이벤트
                                    window.cityMaps[city.id].on('load', () => {
                                        // 모든 소스 및 레이어 추가
                                        Object.keys(layerSettings_city).forEach(layer => {
                                            try {
                                                const dataPath = `City/${layer}.geojson`;
                                                
                                                // 소스 추가
                                                window.cityMaps[city.id].addSource(layer, {
                                                    type: 'geojson',
                                                    data: dataPath
                                                });
                                                
                                                // 레이어 추가
                                                window.cityMaps[city.id].addLayer({
                                                    id: layer,
                                                    type: 'fill',
                                                    source: layer,
                                                    layout: {},
                                                    paint: {
                                                        'fill-color': layerSettings_city[layer].color,
                                                        'fill-opacity': 0 // 초기에는 모두 숨김
                                                    }
                                                });
                                                
                                                // 외곽선 레이어 추가
                                                window.cityMaps[city.id].addLayer({
                                                    id: `${layer}-outline`,
                                                    type: 'line',
                                                    source: layer,
                                                    layout: {},
                                                    paint: {
                                                        'line-color': layerSettings_city[layer].outlineColor,
                                                        'line-width': layerSettings_city[layer].outlineWidth,
                                                        'line-opacity': 0, // 초기에는 모두 숨김
                                                        'line-offset': layerSettings_city[layer].outlineOffset
                                                    }
                                                });
                                            } catch (e) {
                                                console.error(`Error adding layer ${layer} to ${city.id} map:`, e);
                                            }
                                        });
                                        
                                        // Food_All 레이어 표시 (스토리 5 기준)
                                        setMapLayers(city.id, 5);
                                        
                                        // 맵 크기 업데이트
                                        window.cityMaps[city.id].resize();
                                    });
                                    
                                } catch (e) {
                                    console.error(`Failed to create map for ${city.id}:`, e);
                                }
                            }, 100);
                        });
                    } else {
                        // 이미 있는 그리드는 표시만 하고 레이어 변경
                        console.log("Reusing existing grid for story 5");
                        gridContainer.style.display = 'grid';
                        
                        // 각 도시 맵의 레이어 업데이트
                        if (window.cityMaps) {
                            Object.keys(window.cityMaps).forEach(cityId => {
                                if (window.cityMaps[cityId] && window.cityMaps[cityId].loaded()) {
                                    setMapLayers(cityId, 5);
                                }
                            });
                        }
                    }
                    
                    break;
                    case 6:
                        // 모든 그래프 제거
                        removeStoryGraphs();
                        // 메인 맵 컨테이너를 가져옴
                        const mainMapDiv6 = document.getElementById('Main_map');
                        if (!mainMapDiv6) {
                            console.error("Main map container not found");
                            break;
                        }
                                
                        // 메인 맵 표시 (다른 스토리에서 숨겨졌을 수 있음)
                        mainMapDiv6.style.display = 'block';
                        
                        // 기존에 저장된 원본 맵이 있는지 확인
                        if (window.originalMainMap && !Main_map) {
                            Main_map = window.originalMainMap;
                        }
                        
                        // 원본 Main_map을 저장
                        if (Main_map && !window.originalMainMap) {
                            window.originalMainMap = Main_map;
                        }
                        
                        // 메인 맵 레이어 숨기기
                        if (Main_map) {
                            try {
                                const layersToHide6 = ['delivery', 'food', 'demography', 'Access_Void'];
                                layersToHide6.forEach(layer => {
                                    Main_map.setPaintProperty(layer, 'fill-opacity', 0);
                                    Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                                });
                            } catch (e) {
                                console.error("Error hiding main map layers:", e);
                            }
                        }
                        
                        // story4 컨테이너 숨기기
                        const story4Container6 = document.getElementById('story4-container');
                        if (story4Container6) {
                            story4Container6.style.display = 'none';
                        }
                        
                        // 그리드 컨테이너 찾기 또는 생성
                        let gridContainer6 = document.getElementById('story5-grid');
                        
                        // 그리드가 없으면 새로 생성
                        if (!gridContainer6) {
                            console.log("Creating new grid for story 6");
                            gridContainer6 = document.createElement('div');
                            gridContainer6.id = 'story5-grid';
                            gridContainer6.style.position = 'absolute';
                            gridContainer6.style.width = "calc(100%)";
                            gridContainer6.style.height = "calc(100% - 8vh)";
                            gridContainer6.style.top = "8vh";
                            gridContainer6.style.display = 'grid';
                            gridContainer6.style.gridTemplateColumns = '1fr 1fr';
                            gridContainer6.style.gridTemplateRows = '1fr 1fr';
                            gridContainer6.style.gap = '10px';
                            gridContainer6.style.zIndex = '5';
                            
                            // 메인 맵 컨테이너에 그리드 추가
                            mainMapDiv6.appendChild(gridContainer6);
                            
                            // 4개 도시 정의
                            const cities6 = [
                                { id: 'NewYork', name: 'New York' },
                                { id: 'LosAngeles', name: 'Los Angeles' },
                                { id: 'Dallas', name: 'Dallas' },
                                { id: 'Chicago', name: 'Chicago' }
                            ];
                            
                            // 도시 맵 인스턴스 저장할 객체 초기화
                            if (!window.cityMaps) {
                                window.cityMaps = {};
                            }
                            
                            // 각 도시별 맵 컨테이너 생성
                            cities6.forEach(city => {
                                // 맵 컨테이너 생성
                                const mapContainer = document.createElement('div');
                                mapContainer.id = `map-${city.id}`;
                                mapContainer.className = 'city-map-container';
                                mapContainer.style.position = 'relative';
                                mapContainer.style.width = '100%';
                                mapContainer.style.height = '100%';
                                mapContainer.style.borderRadius = '5px';
                                mapContainer.style.overflow = 'hidden';
                                mapContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                                mapContainer.style.border = '1px solid rgba(255,255,255,0.2)';
                                
                                // 도시 이름 오버레이 추가
                                const cityTitle = document.createElement('div');
                                cityTitle.className = 'city-title';
                                cityTitle.textContent = city.name;
                                cityTitle.style.position = 'absolute';
                                cityTitle.style.bottom = '10px';
                                cityTitle.style.left = '10px';
                                cityTitle.style.color = 'white';
                                cityTitle.style.fontWeight = 'bold';
                                cityTitle.style.textShadow = '0px 0px 4px rgba(0, 0, 0, 0.8)';
                                cityTitle.style.zIndex = '10';
                                
                                // 맵 컨테이너에 요소 추가
                                mapContainer.appendChild(cityTitle);
                                
                                // 그리드에 맵 컨테이너 추가
                                gridContainer6.appendChild(mapContainer);
                                
                                // 도시별 위치 정보 가져오기
                                const cityLocation = {...cityLocations[city.id]};
                                
                                // 줌 레벨 조정 (도시별 맞춤)
                                if (city.id === 'NewYork') {
                                    cityLocation.zoom = 7.0; // 뉴욕만 더 넓게 보기
                                } else if (city.id === 'Chicago') {
                                    cityLocation.zoom = 7.3;
                                } else {
                                    cityLocation.zoom = 7.6; // 다른 도시들
                                }
                                
                                // 맵 인스턴스 생성
                                setTimeout(() => {
                                    try {
                                        window.cityMaps[city.id] = new mapboxgl.Map({
                                            container: `map-${city.id}`,
                                            style: 'mapbox://styles/kit3775/cm7hvhz9g00kw01qod6lv4rzb',
                                            center: [cityLocation.lng, cityLocation.lat],
                                            zoom: cityLocation.zoom,
                                            attributionControl: false,
                                            interactive: true
                                        });
                                        
                                        // 맵 로드 이벤트
                                        window.cityMaps[city.id].on('load', () => {
                                            // 모든 소스 및 레이어 추가
                                            Object.keys(layerSettings_city).forEach(layer => {
                                                try {
                                                    const dataPath = `City/${layer}.geojson`;
                                                    
                                                    // 소스 추가
                                                    window.cityMaps[city.id].addSource(layer, {
                                                        type: 'geojson',
                                                        data: dataPath
                                                    });
                                                    
                                                    // 레이어 추가
                                                    window.cityMaps[city.id].addLayer({
                                                        id: layer,
                                                        type: 'fill',
                                                        source: layer,
                                                        layout: {},
                                                        paint: {
                                                            'fill-color': layerSettings_city[layer].color,
                                                            'fill-opacity': 0 // 초기에는 모두 숨김
                                                        }
                                                    });
                                                    
                                                    // 외곽선 레이어 추가
                                                    window.cityMaps[city.id].addLayer({
                                                        id: `${layer}-outline`,
                                                        type: 'line',
                                                        source: layer,
                                                        layout: {},
                                                        paint: {
                                                            'line-color': layerSettings_city[layer].outlineColor,
                                                            'line-width': layerSettings_city[layer].outlineWidth,
                                                            'line-opacity': 0, // 초기에는 모두 숨김
                                                            'line-offset': layerSettings_city[layer].outlineOffset
                                                        }
                                                    });
                                                } catch (e) {
                                                    console.error(`Error adding layer ${layer} to ${city.id} map:`, e);
                                                }
                                            });
                                            
                                            // Poverty_All 레이어 표시 (스토리 6 기준)
                                            setMapLayers(city.id, 6);
                                            
                                            // 맵 크기 업데이트
                                            window.cityMaps[city.id].resize();
                                        });
                                        
                                    } catch (e) {
                                        console.error(`Failed to create map for ${city.id}:`, e);
                                    }
                                }, 100);
                            });
                        } else {
                            // 이미 있는 그리드는 표시만 하고 레이어 변경
                            console.log("Reusing existing grid for story 6");
                            gridContainer6.style.display = 'grid';
                            
                            // 각 도시 맵의 레이어 업데이트
                            if (window.cityMaps) {
                                Object.keys(window.cityMaps).forEach(cityId => {
                                    if (window.cityMaps[cityId] && window.cityMaps[cityId].loaded()) {
                                        setMapLayers(cityId, 6);
                                    }
                                });
                            }
                        }
                        
                        break;
    case 7:
    // 모든 그래프 제거
    removeStoryGraphs();    
    // 메인 맵 컨테이너를 가져옴
        const mainMapDiv7 = document.getElementById('Main_map');
        if (!mainMapDiv7) {
            console.error("Main map container not found");
            break;
        }
                
        // 메인 맵 표시 (다른 스토리에서 숨겨졌을 수 있음)
        mainMapDiv7.style.display = 'block';
        
        // 기존에 저장된 원본 맵이 있는지 확인
        if (window.originalMainMap && !Main_map) {
            Main_map = window.originalMainMap;
        }
        
        // 원본 Main_map을 저장
        if (Main_map && !window.originalMainMap) {
            window.originalMainMap = Main_map;
        }
        
        // 메인 맵 레이어 숨기기
        if (Main_map) {
            try {
                const layersToHide7 = ['delivery', 'food', 'demography', 'Access_Void'];
                layersToHide7.forEach(layer => {
                    Main_map.setPaintProperty(layer, 'fill-opacity', 0);
                    Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                });
            } catch (e) {
                console.error("Error hiding main map layers:", e);
            }
        }
        
        // story4 컨테이너 숨기기
        const story4Container7 = document.getElementById('story4-container');
        if (story4Container7) {
            story4Container7.style.display = 'none';
        }
        
        // 그리드 컨테이너 찾기 또는 생성
        let gridContainer7 = document.getElementById('story5-grid');
        
        // 그리드가 없으면 새로 생성
        if (!gridContainer7) {
            console.log("Creating new grid for story 7");
            gridContainer7 = document.createElement('div');
            gridContainer7.id = 'story5-grid';
            gridContainer7.style.position = 'absolute';
            gridContainer7.style.width = "calc(100%)";
            gridContainer7.style.height = "calc(100% - 8vh)";
            gridContainer7.style.top = "8vh";
            gridContainer7.style.display = 'grid';
            gridContainer7.style.gridTemplateColumns = '1fr 1fr';
            gridContainer7.style.gridTemplateRows = '1fr 1fr';
            gridContainer7.style.gap = '10px';
            gridContainer7.style.zIndex = '5';
            
            // 메인 맵 컨테이너에 그리드 추가
            mainMapDiv7.appendChild(gridContainer7);
            
            // 4개 도시 정의
            const cities7 = [
                { id: 'NewYork', name: 'New York' },
                { id: 'LosAngeles', name: 'Los Angeles' },
                { id: 'Dallas', name: 'Dallas' },
                { id: 'Chicago', name: 'Chicago' }
            ];
            
            // 도시 맵 인스턴스 저장할 객체 초기화
            if (!window.cityMaps) {
                window.cityMaps = {};
            }
            
            // 각 도시별 맵 컨테이너 생성
            cities7.forEach(city => {
                // 맵 컨테이너 생성
                const mapContainer = document.createElement('div');
                mapContainer.id = `map-${city.id}`;
                mapContainer.className = 'city-map-container';
                mapContainer.style.position = 'relative';
                mapContainer.style.width = '100%';
                mapContainer.style.height = '100%';
                mapContainer.style.borderRadius = '5px';
                mapContainer.style.overflow = 'hidden';
                mapContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                mapContainer.style.border = '1px solid rgba(255,255,255,0.2)';
                
                // 도시 이름 오버레이 추가
                const cityTitle = document.createElement('div');
                cityTitle.className = 'city-title';
                cityTitle.textContent = city.name;
                cityTitle.style.position = 'absolute';
                cityTitle.style.bottom = '10px';
                cityTitle.style.left = '10px';
                cityTitle.style.color = 'white';
                cityTitle.style.fontWeight = 'bold';
                cityTitle.style.textShadow = '0px 0px 4px rgba(0, 0, 0, 0.8)';
                cityTitle.style.zIndex = '10';
                
                // 맵 컨테이너에 요소 추가
                mapContainer.appendChild(cityTitle);
                
                // 그리드에 맵 컨테이너 추가
                gridContainer7.appendChild(mapContainer);
                
                // 도시별 위치 정보 가져오기
                const cityLocation = {...cityLocations[city.id]};
                
                // 줌 레벨 조정 (도시별 맞춤)
                if (city.id === 'NewYork') {
                    cityLocation.zoom = 7.0; // 뉴욕만 더 넓게 보기
                } else if (city.id === 'Chicago') {
                    cityLocation.zoom = 7.3;
                } else {
                    cityLocation.zoom = 7.6; // 다른 도시들
                }
                
                // 맵 인스턴스 생성
                setTimeout(() => {
                    try {
                        window.cityMaps[city.id] = new mapboxgl.Map({
                            container: `map-${city.id}`,
                            style: 'mapbox://styles/kit3775/cm7hvhz9g00kw01qod6lv4rzb',
                            center: [cityLocation.lng, cityLocation.lat],
                            zoom: cityLocation.zoom,
                            attributionControl: false,
                            interactive: true
                        });
                        
                        // 맵 로드 이벤트
                        window.cityMaps[city.id].on('load', () => {
                            // 모든 소스 및 레이어 추가
                            Object.keys(layerSettings_city).forEach(layer => {
                                try {
                                    const dataPath = `City/${layer}.geojson`;
                                    
                                    // 소스 추가
                                    window.cityMaps[city.id].addSource(layer, {
                                        type: 'geojson',
                                        data: dataPath
                                    });
                                    
                                    // 레이어 추가
                                    window.cityMaps[city.id].addLayer({
                                        id: layer,
                                        type: 'fill',
                                        source: layer,
                                        layout: {},
                                        paint: {
                                            'fill-color': layerSettings_city[layer].color,
                                            'fill-opacity': 0 // 초기에는 모두 숨김
                                        }
                                    });
                                    
                                    // 외곽선 레이어 추가
                                    window.cityMaps[city.id].addLayer({
                                        id: `${layer}-outline`,
                                        type: 'line',
                                        source: layer,
                                        layout: {},
                                        paint: {
                                            'line-color': layerSettings_city[layer].outlineColor,
                                            'line-width': layerSettings_city[layer].outlineWidth,
                                            'line-opacity': 0, // 초기에는 모두 숨김
                                            'line-offset': layerSettings_city[layer].outlineOffset
                                        }
                                    });
                                } catch (e) {
                                    console.error(`Error adding layer ${layer} to ${city.id} map:`, e);
                                }
                            });
                            
                            // 세 개의 레이어 표시 (스토리 7 기준)
                            setMapLayers(city.id, 7);
                            
                            // 맵 크기 업데이트
                            window.cityMaps[city.id].resize();
                        });
                        
                    } catch (e) {
                        console.error(`Failed to create map for ${city.id}:`, e);
                    }
                }, 100);
            });
        } else {
            // 이미 있는 그리드는 표시만 하고 레이어 변경
            console.log("Reusing existing grid for story 7");
            gridContainer7.style.display = 'grid';
            
            // 각 도시 맵의 레이어 업데이트
            if (window.cityMaps) {
                Object.keys(window.cityMaps).forEach(cityId => {
                    if (window.cityMaps[cityId] && window.cityMaps[cityId].loaded()) {
                        setMapLayers(cityId, 7);
                    }
                });
            }
        }
        
        break;
        // executeStoryStep 함수 내 case 8 구현
case 8:
// 모든 그래프 제거
removeStoryGraphs();    
// 메인 맵 숨기기
    const mainMapContainer8 = document.getElementById('Main_map');
    if (mainMapContainer8) {
        mainMapContainer8.style.display = "none";
    }

    // 스토리 5의 그리드 숨기기
    const story5Grid8 = document.getElementById('story5-grid');
    if (story5Grid8) {
        story5Grid8.style.display = 'none';
    }
    
    // story8 전용 컨테이너가 없으면 생성
    let story8Container = document.getElementById('story8-container');
    if (!story8Container) {
        story8Container = document.createElement('div');
        story8Container.id = 'story8-container';
        story8Container.style.position = "absolute";
        story8Container.style.top = "8vh";
        story8Container.style.left = "0px";
        story8Container.style.width = "calc(100% - 20vw)";
        story8Container.style.height = "calc(100% - 8vh)";
        story8Container.style.zIndex = "100";
        story8Container.style.display = "flex";
        
        // story8 맵 컨테이너 생성
        const story8MapContainer = document.createElement('div');
        story8MapContainer.id = 'story8-map';
        story8MapContainer.style.width = "100%";
        story8MapContainer.style.height = "100%";
        story8MapContainer.style.position = "absolute"; // 레전드 배치를 위해 필요
        
        // story8 콘텐츠 컨테이너 생성
        const story8Content = document.createElement('div');
        story8Content.id = 'story8-content';
        story8Content.style.width = "30%";
        story8Content.style.right = "0px";
        story8Content.style.height = "100%";
        story8Content.style.overflowY = "auto";
        story8Content.style.background = "rgba(255, 255, 255, 0.7)";
        story8Content.style.padding = "15px";
        story8Content.style.borderRadius = "0px";
        story8Content.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
        story8Content.style.boxSizing = "border-box";
        story8Content.style.zIndex = '10';
        
        // 컨테이너에 맵과 콘텐츠 추가
        story8Container.appendChild(story8MapContainer);
        story8Container.appendChild(story8Content);
        
        // body에 story8 컨테이너 추가
        document.body.appendChild(story8Container);
    } else {
        // 이미 존재하면 표시
        story8Container.style.display = "flex";
    }
    
    // 레전드 추가 함수
    const addStory8Legend = (map) => {
        // 기존 레전드 제거
        const oldLegend = document.getElementById('story8-legend');
        if (oldLegend) {
            oldLegend.remove();
        }
        
        // 레전드 컨테이너 생성
        const legendContainer = document.createElement('div');
        legendContainer.id = 'story8-legend';
        legendContainer.style.position = 'absolute';
        legendContainer.style.bottom = '20px';
        legendContainer.style.right = '20px';
        legendContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        legendContainer.style.padding = '10px';
        legendContainer.style.borderRadius = '5px';
        legendContainer.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
        legendContainer.style.zIndex = '10';
        
        // 레전드 내용 생성
        legendContainer.innerHTML = `
            <h4 style="margin-top: 0; margin-bottom: 5px; color: #ffffff;">Map Legend</h4>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${grocery_pointStyle.strokeColor}; margin-right: 5px;"></div>
                <span style="font-size: 12px; color: #ffffff;">Grocery Store</span>
            </div>
            
        `;
        
        // 맵 컨테이너에 레전드 추가
        const story8MapContainer = document.getElementById('story8-map');
        if (story8MapContainer) {
            story8MapContainer.appendChild(legendContainer);
        }
    };
    
    // 맵 소스 추가 함수 - 변경된 파일 경로 적용
    const addStory8MapSources = (map) => {
        // 필요한 소스만 추가 (변경된 경로로)
        map.addSource('5mi', { type: 'geojson', data: 'Proto_test/1mi_city.geojson' });
        map.addSource('10mi', { type: 'geojson', data: 'Proto_test/2mi_city.geojson' });
        map.addSource('20mi', { type: 'geojson', data: 'Proto_test/3mi_city.geojson' });
        map.addSource('grocery', { type: 'geojson', data: 'Proto_test/Grocery_Store_city.geojson' });
        map.addSource('line-grocery', { type: 'geojson', data: 'Proto_test/Line_grocery_city.geojson' });
        map.addSource('p_5_city', { type: 'geojson', data: 'Proto_test/1mi_city_p.geojson' });
        map.addSource('p_10_city', { type: 'geojson', data: 'Proto_test/2mi_city_p.geojson' });
        map.addSource('p_20_city', { type: 'geojson', data: 'Proto_test/3mi_city_p.geojson' });
    };
    
    // 맵 레이어 추가 함수
    const addStory8MapLayers = (map) => {
        const layerId = 'story8-layer';
        
        // 10mi(2mi_city) 레이어
        map.addLayer({
            id: `${layerId}-10mi-layer`,
            type: 'fill',
            source: '10mi',
            paint: { 
                'fill-color': r10miStyle.fillColor, 
                'fill-opacity': r10miStyle.fillOpacity 
            }
        });
        map.addLayer({
            id: `${layerId}-10mi-border`,
            type: 'line',
            source: '10mi',
            paint: { 
                'line-color': r10miStyle.borderColor, 
                'line-width': r10miStyle.borderWidth, 
                'line-opacity': r10miStyle.borderOpacity,
                'line-dasharray': r10miStyle.dasharray
            }
        });
        
        // 5mi(1mi_city) 레이어
        map.addLayer({
            id: `${layerId}-5mi-layer`,
            type: 'fill',
            source: '5mi',
            paint: { 
                'fill-color': r5miStyle.fillColor, 
                'fill-opacity': r5miStyle.fillOpacity 
            }
        });
        map.addLayer({
            id: `${layerId}-5mi-border`,
            type: 'line',
            source: '5mi',
            paint: { 
                'line-color': r5miStyle.borderColor, 
                'line-width': r5miStyle.borderWidth, 
                'line-opacity': r5miStyle.borderOpacity,
                'line-dasharray': r5miStyle.dasharray
            }
        });
        
        // 20mi(3mi_city) 레이어
        map.addLayer({
            id: `${layerId}-20mi-layer`,
            type: 'fill',
            source: '20mi',
            paint: { 
                'fill-color': r20miStyle.fillColor, 
                'fill-opacity': r20miStyle.fillOpacity 
            }
        });
        map.addLayer({
            id: `${layerId}-20mi-border`,
            type: 'line',
            source: '20mi',
            paint: { 
                'line-color': r20miStyle.borderColor, 
                'line-width': r20miStyle.borderWidth, 
                'line-opacity': r20miStyle.borderOpacity,
                'line-dasharray': r20miStyle.dasharray
            }
        });
        
        // 식료품점 라인 레이어
        map.addLayer({
            id: `${layerId}-line-grocery-layer`,
            type: 'line',
            source: 'line-grocery',
            paint: { 
                'line-color': groceryLineStyle.color, 
                'line-width': groceryLineStyle.width, 
                'line-opacity': groceryLineStyle.opacity,
                'line-dasharray': lineStyle.dasharray
            }
        });
        
        // 포인트 레이어 - 식료품점
        map.addLayer({
            id: `${layerId}-grocery_point-layer`,
            type: 'circle',
            source: 'grocery',
            paint: {
                'circle-radius': grocery_pointStyle.radius,
                'circle-color': grocery_pointStyle.fillColor,
                'circle-opacity': grocery_pointStyle.fillOpacity,
                'circle-stroke-color': grocery_pointStyle.strokeColor,
                'circle-stroke-width': grocery_pointStyle.strokeWidth,
                'circle-stroke-opacity': grocery_pointStyle.strokeOpacity
            }
        });

         // 마일 표시 레이블
         map.addLayer({
            id: `${layerId}-point-labels`,
            type: 'symbol',
            source: 'p_5_city',
            layout: {
                'text-field': ['literal', '1mi'],
                'text-size': 15,
                'text-font': ['Open Sans Bold'],
                'text-anchor': 'bottom',
                'text-offset': [1, 0],
                'icon-optional': true
            },
            paint: {
                'text-color': '#ffffff',
                'text-opacity': 0.6
            }
        });
        map.addLayer({
            id: `${layerId}-point-labels-2`,
            type: 'symbol',
            source: 'p_10_city',
            layout: {
                'text-field': ['literal', '2mi'],
                'text-size': 15,
                'text-font': ['Open Sans Bold'],
                'text-anchor': 'bottom',
                'text-offset': [1, 0],
                'icon-optional': true
            },
            paint: {
                'text-color': '#ffffff',
                'text-opacity': 0.6
            }
        });
        map.addLayer({
            id: `${layerId}-point-labels-3`,
            type: 'symbol',
            source: 'p_20_city',
            layout: {
                'text-field': ['literal', '3mi'],
                'text-size': 15,
                'text-font': ['Open Sans Bold'],
                'text-anchor': 'bottom',
                'text-offset': [1, 0],
                'icon-optional': true
            },
            paint: {
                'text-color': '#ffffff',
                'text-opacity': 0.6
            }
        });
        
        // 레전드 추가
        addStory8Legend(map);
    };
    
    // 상세 내용 업데이트 함수
    const updateStory8Content = () => {
        const story8Content = document.getElementById('story8-content');
        if (!story8Content) return;
        
        // 스크롤바 스타일 적용
        story8Content.style.cssText += `
            scrollbar-width: thin;
            scrollbar-color: #dadada #00000000;
        `;
        
        // 웹킷 기반 브라우저를 위한 스크롤바 스타일 추가
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            #story8-content::-webkit-scrollbar {
                width: 5px;
                height: 10px;
            }
            
            #story8-content::-webkit-scrollbar-track {
                background: #00000000;
                border-radius: 10px;
            }
            
            #story8-content::-webkit-scrollbar-thumb {
                background: #dadada;
                border-radius: 10px;
                border: 2px solid #f0f0f000;
                height: 10px;
            }
            
            #story8-content::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
        `;
        document.head.appendChild(styleElement);
        
        // Outcome_All.geojson에서 ID 1027의 데이터 가져오기
        fetch('City/Outcome_All.geojson')
            .then(response => response.json())
            .then(data => {
                const feature = data.features.find(f => f.properties.id === 1027);
                if (feature) {
                    const props = feature.properties;
                    const town = props.Town || "Unknown";
                    const state = props.States || "Unknown";
                    const zipcode = props.Zipcode || "Unknown";
                    
                    // Race 데이터
                    const raceData = [
                        { label: "White", value: props["Race_white"] },
                        { label: "Black", value: props["Race_Black or African American"] },
                        { label: "Other Race", value: props["Race_Some Other Race"] },
                        { label: "Asian", value: props["Race_Asian"] },
                        { label: "Native", value: props["Race_American Indian and Alaska Native"] },
                        { label: "Pacific Islander", value: props["Race_Native Hawaiian and Other Pacific Islander"] }
                    ];
                    
                    // 최대 비율 인종 찾기
                    let maxRace = raceData.reduce((max, r) => {
                        let val = parseFloat(r.value) || 0;
                        return val > max.value ? { label: r.label, value: val } : max;
                    }, { label: "", value: 0 });
                    
                    const poverty = { label: "Poverty", value: props["Poverty_Percent"] };
                    const highlightColor = "#EA8901";
                    
                    // 카테고리 매핑
                    const categoryMap = {
                        income: "Poverty rate is higher than U.S average",
                        transportation: "No public transportation",
                        road: "Roads are bad-paved",
                        restaurant: "No restaurants or cafe in town",
                        agriculture: "Surrounded by farmland",
                        distance: "Nearest city is more than 100 miles away",
                        barriers: "Blocked by natural features (Mountain or river)",
                        grocery: "Nearest grocery market is more than 15 miles away",
                        facilities: "No hospital, post offices or community center in town"
                    };
                    
                    // 카테고리 항목 만들기
                    const categoryItems = Object.keys(categoryMap)
                        .filter(category => props[category] === 1)
                        .map(category => `<li style="margin-bottom: 8px;">${categoryMap[category]}</li>`)
                        .join("");
                    
                    // Race 테이블 만들기
                    let raceTable = `
                        <div style="margin-bottom: 5px;">
                            <p style="font-size: 14px; margin-bottom: 5px; color: #333;"><strong>Race Demographics</strong></p>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center; font-size: 13px;">
                                ${raceData.map(r => `
                                    <div style="padding: 2px; border-radius: 5px; background-color: ${r.label === maxRace.label ? 'rgba(234, 137, 1, 0.1)' : 'transparent'}; ${r.label === maxRace.label ? `color: ${highlightColor}; font-weight: bold;` : ''}">
                                        <div>${r.label}</div>
                                        <div>${r.value ? parseFloat(r.value).toFixed(1) : "0"}%</div>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    `;
                    
                    // 콘텐츠 업데이트
                    story8Content.innerHTML = `
                        <div style="padding: 0 10px;">
                            <div style="position: relative; margin-bottom: 15px;">
                                <!-- 위성 이미지 -->
                                <img src="City/satelite_city/satellite_1026.png" alt="Satellite Image of ${town}" 
                                    style="width: 100%; height: auto; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                                
                                <!-- 이미지 위에 오버레이된 제목 (absolute 포지셔닝) -->
                                <h2 style="position: absolute; top: 15px; left: 15px; color: white; margin: 0; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">Hawthorne</h2>
                            </div>
                            <p style="color: #333; margin-bottom: 10px; "font-size: 16px;"><strong>Hawthorne,${state}, 10532</strong></p>
                            
                            ${raceTable}
                            
                            <div style="margin-bottom: 10px;">
                                <p style="font-size: 14px; margin-bottom: 5px;"><strong>${poverty.label} Rate:</strong> ${poverty.value ? parseFloat(poverty.value).toFixed(1) : "0"}%</p>
                                <p style="font-size: 14px; margin-bottom: 5px;"><strong> Population:</strong> ${props.id_individual || "Unknown"}</p>
                            </div>
                            <div>
                                <ul style="padding-left: 20px; font-size: 14px;">
                                    ${categoryItems}
                                </ul>
                            </div>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error loading Outcome_All.geojson:', error);
            });
    };
    
    // story8 맵 초기화 및 데이터 로드
    const loadStory8Map = () => {
        const story8MapContainer = document.getElementById('story8-map');
        if (!story8MapContainer) return;
        
        // story8 맵이 이미 초기화되어 있는지 확인
        let story8Map = window.story8Map;
        
        if (!story8Map) {
            // 맵 초기화 - 새로운 위치 설정
            story8Map = new mapboxgl.Map({
                container: 'story8-map',
                style: 'mapbox://styles/kit3775/cm7alf2vv004501s6gs2y0226',
                center: [-73.847918359, 41.097634947], // 새로운 위치
                zoom: 11.5
            });
            
            window.story8Map = story8Map; // 전역 변수에 저장
            
            // 맵 로드 완료 후 레이어 추가
            story8Map.on('load', () => {
                // GeoJSON 데이터 소스 추가
                addStory8MapSources(story8Map);
                
                // ID 1027에 해당하는 레이어 추가
                addStory8MapLayers(story8Map);
                
                // 콘텐츠 업데이트
                updateStory8Content();
            });
        } else {
            // 이미 초기화된 맵이 있으면 resize 및 위치 설정
            story8Map.resize();
            story8Map.setCenter([-73.847918359, 41.097634947]);
            story8Map.setZoom(11.5);
            
            // 콘텐츠 업데이트
            updateStory8Content();
            
            // 레전드가 있는지 확인하고 없으면 추가
            if (!document.getElementById('story8-legend')) {
                addStory8Legend(story8Map);
            }
        }
    };
    
    // 스토리를 이동할 때 story8 컨테이너를 숨기는 함수
    const hideStory8Container = () => {
        const story8Container = document.getElementById('story8-container');
        if (story8Container) {
            story8Container.style.display = "none";
        }
        
        // 메인 맵 다시 표시
        if (mainMapContainer8) {
            mainMapContainer8.style.display = "block";
        }
    };
    
    // 이전/다음 버튼 및 스토리 서클에 이벤트 리스너 추가
    const prevButton8 = document.getElementById('prevStory');
    const nextButton8 = document.getElementById('nextStory');
    
    // 이벤트 핸들러 추가 (중복 방지를 위해 기존 핸들러 제거)
    if (prevButton8) {
        if (prevButton8._story8Handler) {
            prevButton8.removeEventListener('click', prevButton8._story8Handler);
        }
        prevButton8._story8Handler = hideStory8Container;
        prevButton8.addEventListener('click', prevButton8._story8Handler);
    }
    
    if (nextButton8) {
        if (nextButton8._story8Handler) {
            nextButton8.removeEventListener('click', nextButton8._story8Handler);
        }
        nextButton8._story8Handler = hideStory8Container;
        nextButton8.addEventListener('click', nextButton8._story8Handler);
    }
    
    // 스토리 서클에도 이벤트 리스너 추가
    const storyCircles8 = document.querySelectorAll('.story-circle');
    storyCircles8.forEach(circle => {
        const index = parseInt(circle.getAttribute('data-index'));
        if (index !== 8) { // 현재 스토리(8)가 아닌 경우에만
            if (circle._story8Handler) {
                circle.removeEventListener('click', circle._story8Handler);
            }
            circle._story8Handler = hideStory8Container;
            circle.addEventListener('click', circle._story8Handler);
        }
    });
    
    // 메인 맵 레이어 숨기기
    if (Main_map) {
        const layersToChange = ['delivery', 'food', 'demography', 'Access_Void'];
        layersToChange.forEach(layer => {
            Main_map.setPaintProperty(layer, 'fill-opacity', 0);
            Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
        });
    }
    
    // 맵 로드 및 데이터 표시
    loadStory8Map();
    
    break;
        // Story 9 Implementation - Future Work
case 9:
// 모든 그래프 제거
removeStoryGraphs();    
console.log("Executing Story 9...");
    
    // 1. First, hide other containers
    const mainMapContainer9 = document.getElementById('Main_map');
    if (mainMapContainer9) {
        mainMapContainer9.style.display = "none";
        console.log("Main map container hidden");
    }

    // Hide story 5 grid if it exists
    const story5Grid9 = document.getElementById('story5-grid');
    if (story5Grid9) {
        story5Grid9.style.display = 'none';
        console.log("Story 5 grid hidden");
    }
    
    // Hide story 4 container if it exists
    const story4Container9 = document.getElementById('story4-container');
    if (story4Container9) {
        story4Container9.style.display = 'none';
        console.log("Story 4 container hidden");
    }
    
    // Hide story 8 container if it exists
    const story8Container9 = document.getElementById('story8-container');
    if (story8Container9) {
        story8Container9.style.display = 'none';
        console.log("Story 8 container hidden");
    }

    // 2. Create story 9 container if it doesn't exist
    let story9Container = document.getElementById('story9-container');
    if (!story9Container) {
        console.log("Creating new Story 9 container");
        story9Container = document.createElement('div');
        story9Container.id = 'story9-container';
        story9Container.style.position = "absolute";
        story9Container.style.top = "8vh";
        story9Container.style.left = "0px";
        story9Container.style.width = "calc(100% - 20vw)";
        story9Container.style.height = "calc(100% - 8vh)";
        story9Container.style.zIndex = "100";
        story9Container.style.display = "flex";
        story9Container.style.flexDirection = "column";
        story9Container.style.overflow = "hidden";
        
        // 3. Create background image container
        const backgroundContainer = document.createElement('div');
        backgroundContainer.id = 'story9-background-container';
        backgroundContainer.style.position = "absolute";
        backgroundContainer.style.top = "0";
        backgroundContainer.style.left = "0";
        backgroundContainer.style.width = "100%";
        backgroundContainer.style.height = "100%";
        backgroundContainer.style.overflow = "hidden";
        backgroundContainer.style.zIndex = "1";
        
        // Add background image
        const backgroundImage = document.createElement('img');
        backgroundImage.id = 'story9-background-image';
        backgroundImage.src = 'Background_Food.png';
        backgroundImage.alt = 'Future Work Background';
        backgroundImage.style.width = '100%';
        backgroundImage.style.height = '100%';
        backgroundImage.style.objectFit = 'cover'; // Cover entire container
        
        // Add error handling for background image
        backgroundImage.onerror = function() {
            console.error("Error loading background image");
            this.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Crect%20fill%3D%22%23212121%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23ffffff%22%20font-family%3D%22Arial%22%20font-size%3D%2210%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EBackground%20Image%20Not%20Found%3C%2Ftext%3E%3C%2Fsvg%3E';
            this.style.backgroundColor = '#212121';
        };
        
        // 4. Create overlay image container (for Image_Food.png)
        const overlayContainer = document.createElement('div');
        overlayContainer.id = 'story9-overlay-container';
        overlayContainer.style.position = "absolute";
        overlayContainer.style.top = "0";
        overlayContainer.style.left = "0";
        overlayContainer.style.width = "100%";
        overlayContainer.style.height = "100%";
        overlayContainer.style.display = "flex";
        overlayContainer.style.justifyContent = "center";
        overlayContainer.style.alignItems = "center";
        overlayContainer.style.zIndex = "2";
        
        // Add overlay image (Image_Food.png)
        const overlayImage = document.createElement('img');
        overlayImage.id = 'story9-overlay-image';
        overlayImage.src = 'Image_Food.png';
        overlayImage.alt = 'Future Work Concept';
        overlayImage.style.maxWidth = '90%';
        overlayImage.style.maxHeight = '90%';
        overlayImage.style.objectFit = 'contain'; // Maintain aspect ratio
        
        // Add error handling for overlay image
        overlayImage.onerror = function() {
            console.error("Error loading overlay image");
            this.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%3E%3Crect%20fill%3D%22%23505050%22%20width%3D%22300%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%23ffffff%22%20font-family%3D%22Arial%22%20font-size%3D%2216%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EOverlay%20Image%20Not%20Found%3C%2Ftext%3E%3C%2Fsvg%3E';
        };
        
        
        
        // 6. Assemble all components
        backgroundContainer.appendChild(backgroundImage);
        overlayContainer.appendChild(overlayImage);
        
        story9Container.appendChild(backgroundContainer);
        story9Container.appendChild(overlayContainer);
        
        // Add to document
        document.body.appendChild(story9Container);
        console.log("Story 9 container added to document");
        
        // 7. Add resize handler to manage image fit
        const resizeOverlayImage = () => {
            if (!backgroundImage.complete || !overlayImage.complete) {
                // Images not loaded yet
                setTimeout(resizeOverlayImage, 100);
                return;
            }
            
            // Get real dimensions of the background container
            const containerWidth = backgroundContainer.clientWidth;
            const containerHeight = backgroundContainer.clientHeight;
            
            // Get natural dimensions of the overlay image
            const imgWidth = overlayImage.naturalWidth;
            const imgHeight = overlayImage.naturalHeight;
            
            // Calculate scale to fit within container while maintaining aspect ratio
            let scale = Math.min(
                (containerWidth * 0.9) / imgWidth,
                (containerHeight * 0.9) / imgHeight
            );
            
            // Apply the scale
            overlayImage.style.maxWidth = `${Math.floor(imgWidth * scale)}px`;
            overlayImage.style.maxHeight = `${Math.floor(imgHeight * scale)}px`;
            
            console.log("Resized overlay image:", {
                containerSize: `${containerWidth}x${containerHeight}`,
                imageSize: `${imgWidth}x${imgHeight}`,
                scale: scale,
                newSize: `${Math.floor(imgWidth * scale)}x${Math.floor(imgHeight * scale)}`
            });
        };
        
        // Initial resize
        backgroundImage.onload = resizeOverlayImage;
        overlayImage.onload = resizeOverlayImage;
        
        // Listen for window resize
        window.addEventListener('resize', resizeOverlayImage);
    } else {
        // Show container if it already exists
        story9Container.style.display = "flex";
        console.log("Using existing Story 9 container");
    }
    
    // 8. Story navigation event handlers
    const hideStory9Container = () => {
        console.log("Hiding Story 9 container");
        const story9Container = document.getElementById('story9-container');
        if (story9Container) {
            story9Container.style.display = "none";
        }
        
        // Show main map again
        if (mainMapContainer9) {
            mainMapContainer9.style.display = "block";
        }
    };
    
    // Add navigation handlers
    const prevButton9 = document.getElementById('prevStory');
    const nextButton9 = document.getElementById('nextStory');
    
    if (prevButton9) {
        if (prevButton9._story9Handler) {
            prevButton9.removeEventListener('click', prevButton9._story9Handler);
        }
        prevButton9._story9Handler = hideStory9Container;
        prevButton9.addEventListener('click', prevButton9._story9Handler);
        console.log("Added prev button handler");
    }
    
    if (nextButton9) {
        if (nextButton9._story9Handler) {
            nextButton9.removeEventListener('click', nextButton9._story9Handler);
        }
        nextButton9._story9Handler = hideStory9Container;
        nextButton9.addEventListener('click', nextButton9._story9Handler);
        console.log("Added next button handler");
    }
    
    // Add handlers to story circles
    const storyCircles9 = document.querySelectorAll('.story-circle');
    storyCircles9.forEach(circle => {
        const index = parseInt(circle.getAttribute('data-index'));
        if (index !== 9) { // Skip current story
            if (circle._story9Handler) {
                circle.removeEventListener('click', circle._story9Handler);
            }
            circle._story9Handler = hideStory9Container;
            circle.addEventListener('click', circle._story9Handler);
        }
    });
    
    // 9. Hide main map layers (cleanup)
    if (Main_map) {
        const layersToChange = ['delivery', 'food', 'demography', 'Access_Void'];
        layersToChange.forEach(layer => {
            try {
                Main_map.setPaintProperty(layer, 'fill-opacity', 0);
                Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
            } catch (e) {
                console.error(`Error hiding main map layer ${layer}:`, e);
            }
        });
    }
    
    console.log("Story 9 initialization complete");
    break;
    case 10:
        // 모든 그래프 제거
        removeStoryGraphs();    
        console.log("Executing Story 10 - Group Delivery Solution");
        
        // 1. First, hide other containers
        const mainMapContainer10 = document.getElementById('Main_map');
        if (mainMapContainer10) {
            mainMapContainer10.style.display = "none";
            console.log("Main map container hidden for story 10");
        }
    
        // Hide story 5 grid if it exists
        const story5Grid10 = document.getElementById('story5-grid');
        if (story5Grid10) {
            story5Grid10.style.display = 'none';
            console.log("Story 5 grid hidden for story 10");
        }
        
        // Hide story 4 container if it exists
        const story4Container10 = document.getElementById('story4-container');
        if (story4Container10) {
            story4Container10.style.display = 'none';
            console.log("Story 4 container hidden for story 10");
        }
        
        // Hide story 8 container if it exists
        const story8Container10 = document.getElementById('story8-container');
        if (story8Container10) {
            story8Container10.style.display = 'none';
            console.log("Story 8 container hidden for story 10");
        }
        
        // Hide story 9 container if it exists
        const story9Container10 = document.getElementById('story9-container');
        if (story9Container10) {
            story9Container10.style.display = 'none';
            console.log("Story 9 container hidden for story 10");
        }
    
        // 2. GroupDelivery 요소 표시
        const groupDelivery = document.getElementById('GroupDelivery');
        if (groupDelivery) {
            // GroupDelivery 요소 표시
            groupDelivery.style.display = 'block';
            console.log("GroupDelivery element displayed for story 10");
        } else {
            console.error("GroupDelivery element not found");
        }
        
        // 3. Story navigation event handlers
        const hideStory10Container = () => {
            console.log("Hiding GroupDelivery for story 10");
            const groupDelivery = document.getElementById('GroupDelivery');
            if (groupDelivery) {
                groupDelivery.style.display = "none";
            }
            
            // Show main map again
            if (mainMapContainer10) {
                mainMapContainer10.style.display = "block";
            }
        };
        
        // Add navigation handlers
        const prevButton10 = document.getElementById('prevStory');
        const nextButton10 = document.getElementById('nextStory');
        
        if (prevButton10) {
            if (prevButton10._story10Handler) {
                prevButton10.removeEventListener('click', prevButton10._story10Handler);
            }
            prevButton10._story10Handler = hideStory10Container;
            prevButton10.addEventListener('click', prevButton10._story10Handler);
            console.log("Added prev button handler for story 10");
        }
        
        if (nextButton10) {
            if (nextButton10._story10Handler) {
                nextButton10.removeEventListener('click', nextButton10._story10Handler);
            }
            nextButton10._story10Handler = hideStory10Container;
            nextButton10.addEventListener('click', nextButton10._story10Handler);
            console.log("Added next button handler for story 10");
        }
        
        // Add handlers to story circles
        const storyCircles10 = document.querySelectorAll('.story-circle');
        storyCircles10.forEach(circle => {
            const index = parseInt(circle.getAttribute('data-index'));
            if (index !== 10) { // Skip current story
                if (circle._story10Handler) {
                    circle.removeEventListener('click', circle._story10Handler);
                }
                circle._story10Handler = hideStory10Container;
                circle.addEventListener('click', circle._story10Handler);
            }
        });
        
        // 4. Hide main map layers (cleanup)
        if (Main_map) {
            const layersToChange = ['delivery', 'food', 'demography', 'Access_Void'];
            layersToChange.forEach(layer => {
                try {
                    Main_map.setPaintProperty(layer, 'fill-opacity', 0);
                    Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                } catch (e) {
                    console.error(`Error hiding main map layer ${layer} for story 10:`, e);
                }
            });
        }
        
        console.log("Story 10 (Group Delivery) initialization complete");
        break;
    }
}

// 스토리 내용 업데이트 함수
function updateStoryContent(step) {
    // 스토리 제목 업데이트
    const storyTitle = document.getElementById('storyTitle');
    if (storyTitle) {
        storyTitle.textContent = step.title;
    }
    
    // 스토리 설명 업데이트
    const storyDescription = document.getElementById('storyDescription');
    if (storyDescription) {
        storyDescription.textContent = step.description;
    }
}

// 이전 스토리로 이동하는 함수
function goToPreviousStory() {
    if (currentStoryIndex > 0) {
        navigateToStory(currentStoryIndex - 1);
    }
}

// 다음 스토리로 이동하는 함수
function goToNextStory() {
    if (currentStoryIndex < storySteps.length - 1) {
        navigateToStory(currentStoryIndex + 1);
    }
}

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 이전/다음 버튼 이벤트 리스너
    const prevButton = document.getElementById('prevStory');
    const nextButton = document.getElementById('nextStory');
    
    if (prevButton) {
        prevButton.addEventListener('click', goToPreviousStory);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', goToNextStory);
    }
    
    // 초기 서클 생성
    createStoryCircles();
    
    // 초기 스토리 단계 실행
    executeStoryStep(storySteps[currentStoryIndex]);
    
    // 초기 이전/다음 버튼 상태 설정
    updateNavigationButtons();
});

// Combined guide script for both Access_Void and Vulnerable_Zone
document.addEventListener("DOMContentLoaded", function() {
    
    // 가이드 요소들
    const guideOverlay = document.getElementById('access-void-guide-overlay');
    const guideReplayContainer = document.getElementById('access-void-guide-replay-container');
    const guideReplayButton = document.getElementById('access-void-guide-replay');
    const guidePrevButton = document.getElementById('guide-prev');
    const guideNextButton = document.getElementById('guide-next');
    const guideCloseButton = document.getElementById('guide-close');
    const guideProgress = document.getElementById('access-void-guide-progress');
    
    // 가이드 마커 요소들
    const guideMarkers = [
        document.getElementById('guide-marker-1'),
        document.getElementById('guide-marker-2'),
        document.getElementById('guide-marker-3'),
        document.getElementById('guide-marker-4'),
        document.getElementById('guide-marker-5'),
        document.getElementById('guide-marker-6'),
        document.getElementById('guide-marker-7')
    ];
    
    // 현재 활성화된 도구
    let currentTool = '';
    
    // Access_Void 참조할 대상 요소들
    const accessVoidTargets = [
        { id: 'Main_map', label: 'mapboxgl_canvas', offset: { top: 20, left: 20 } },
        { id: 'states-dropdown-container', label: 'states-dropdown', offset: { top: 10, left: 10 } },
        { id: 'search-container', label: 'search-container', offset: { top: 10, left: 10 } },
        { id: 'Display_button', label: 'Display_button', offset: { top: 10, left: 10 } },
        { id: 'report', label: 'report', offset: { top: 20, left: 20 } },
        { id: 'population-range', label: 'population-slider', offset: { top: -40, left: 20 } },
        { id: 'categoryTitleContainer', label: 'categoryTitleContainer', offset: { top: 10, left: 10 } }
    ];
    
    // Vulnerable_Zone 참조할 대상 요소들
    const vulnerableZoneTargets = [
        { id: 'Main_map', label: 'mapboxgl_canvas', offset: { top: 20, left: 20 } },
        { id: 'dropdown-button', label: 'dropdown-button', offset: { top: 10, left: 10 } },
        { id: 'search-container', label: 'search-container', offset: { top: 10, left: 10 } },
        { id: 'Display_button', label: 'Display_button', offset: { top: 10, left: 10 } },
        { id: 'report_city', label: 'report_city', offset: { top: 20, left: 20 } },
        { id: 'population-slider', label: 'population-slider', offset: { top: -40, left: 20 } }
    ];
    
    // 가이드 내용
    const guideContents = {
        'Access_Void': [
            { title: 'Map Interaction', description: 'Hover or click on the map to view details by area.' },
            { title: 'Select a State', description: 'Choose a state to explore it in detail.' },
            { title: 'Search Location', description: 'Enter an address to jump to a specific location.' },
            { title: 'Image Grid', description: 'Click "Map/Photo" to view satellite images of Access_Void areas.' },
            { title: 'Indicator Chart', description: 'Hover or click the chart to explore food deserts and delivery access.' },
            { title: 'Filter Slider', description: 'Adjust the sliders to filter areas by population and poverty rate.' },
            { title: 'Factor Filter', description: 'Filter Access_Void areas by factors like transport and road access.' }
        ],
        'Vulnerable_Zone': [
            { title: 'Map Interaction', description: 'Click the city, and then Hover or click on the map to view details by area.' },
            { title: 'Select the city', description: 'Choose the city to explore it in detail.' },
            { title: 'Search Location', description: 'Enter an address to jump to a specific location.' },
            { title: 'Image Grid', description: 'Click "Map/Photo" to view satellite images of Vulnarable_Zone areas.' },
            { title: 'Indicator Chart', description: 'Hover or click the chart to explore food deserts and poverty rate.' },
            { title: 'Filter Slider', description: 'Adjust the sliders to filter areas by population and poverty rate.' }
        ]
    };
    
    // 현재 가이드 단계
    let currentGuideStep = 0;
    
    // 현재 도구에 맞게 가이드 마커 내용 업데이트
    function updateGuideContents() {
        const contents = guideContents[currentTool];
        if (!contents) return;
        
        // 모든 마커 업데이트
        for (let i = 0; i < guideMarkers.length; i++) {
            const marker = guideMarkers[i];
            if (!marker) continue;
            
            // Vulnerable_Zone은 6개만 사용
            if (currentTool === 'Vulnerable_Zone' && i >= 6) {
                marker.style.display = 'none';
                continue;
            }
            
            if (i < contents.length) {
                const titleElement = marker.querySelector('h3');
                const descElement = marker.querySelector('p');
                
                if (titleElement) titleElement.textContent = contents[i].title;
                if (descElement) descElement.textContent = contents[i].description;
            }
        }
    }
    
    // 프로그레스 닷 생성
    function createProgressDots() {
        guideProgress.innerHTML = '';
        
        const maxSteps = currentTool === 'Vulnerable_Zone' ? 6 : 7;
        
        for (let i = 0; i < maxSteps; i++) {
            const dot = document.createElement('div');
            dot.className = `guide-dot ${i === currentGuideStep ? 'active' : ''}`;
            dot.setAttribute('data-step', i);
            dot.addEventListener('click', function() {
                goToStep(parseInt(this.getAttribute('data-step')));
            });
            guideProgress.appendChild(dot);
        }
    }
    
    // 마커 위치 설정
    function positionMarkers() {
        const targetElements = currentTool === 'Vulnerable_Zone' ? vulnerableZoneTargets : accessVoidTargets;
        const maxMarkers = currentTool === 'Vulnerable_Zone' ? 6 : 7;
        
        for (let index = 0; index < maxMarkers; index++) {
            const marker = guideMarkers[index];
            if (!marker) continue;
            
            if (index >= targetElements.length) {
                marker.style.display = 'none';
                continue;
            }
            
            const targetElement = document.getElementById(targetElements[index].id);
            if (!targetElement) {
                marker.style.display = 'none';
                continue;
            }
            
            const rect = targetElement.getBoundingClientRect();
            const offset = targetElements[index].offset;
            
            marker.style.top = `${rect.top + offset.top}px`;
            marker.style.left = `${rect.left + offset.left}px`;
            marker.style.display = index === currentGuideStep ? 'flex' : 'none';
        }
    }
    
    // 특정 스텝으로 이동
    function goToStep(step) {
        // 슬라이더 하이라이트 제거
        if (currentGuideStep === 5) {
            const sliderHandles = document.querySelectorAll('.mapboxgl-ctrl-slider-handle');
            sliderHandles.forEach(handle => {
                handle.classList.remove('highlight-slider-handle');
            });
        }
        
        // 이전 스텝 숨기기
        if (guideMarkers[currentGuideStep]) {
            guideMarkers[currentGuideStep].style.display = 'none';
        }
        
        // 스텝 업데이트
        currentGuideStep = step;
        
        // 범위 체크
        if (currentGuideStep < 0) currentGuideStep = 0;
        
        const maxSteps = currentTool === 'Vulnerable_Zone' ? 6 : 7;
        
        if (currentGuideStep >= maxSteps) {
            // 마지막 스텝 이후에는 튜토리얼 종료
            completeGuide();
            return;
        }
        
        // 현재 스텝 표시
        if (guideMarkers[currentGuideStep]) {
            guideMarkers[currentGuideStep].style.display = 'flex';
            
            // 슬라이더 스텝이면 핸들 강조
            if (currentGuideStep === 5) {
                setTimeout(() => {
                    const sliderHandles = document.querySelectorAll('.mapboxgl-ctrl-slider-handle');
                    sliderHandles.forEach(handle => {
                        handle.classList.add('highlight-slider-handle');
                    });
                }, 100);
            }
        }
        
        // 진행 상태 업데이트
        updateProgress();
        
        // 이전/다음 버튼 상태 업데이트
        guidePrevButton.disabled = currentGuideStep === 0;
        guidePrevButton.style.opacity = currentGuideStep === 0 ? '0.5' : '1';
        
        // 마지막 스텝이면 '다음' 버튼 텍스트 변경
        if (currentGuideStep === maxSteps - 1) {
            guideNextButton.textContent = 'Done';
        } else {
            guideNextButton.textContent = 'Next';
        }
    }
    
    // 진행 상태 업데이트
    function updateProgress() {
        const dots = guideProgress.querySelectorAll('.guide-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentGuideStep);
        });
    }
    
    // 가이드 종료
    function completeGuide() {
        guideOverlay.style.display = 'none';
        guideReplayContainer.style.display = 'block';
        
        // 슬라이더 하이라이트 제거
        const sliderHandles = document.querySelectorAll('.mapboxgl-ctrl-slider-handle');
        sliderHandles.forEach(handle => {
            handle.classList.remove('highlight-slider-handle');
        });
    }
    
    // 이벤트 리스너 설정
    if (guidePrevButton) {
        guidePrevButton.addEventListener('click', function() {
            goToStep(currentGuideStep - 1);
        });
    }
    
    if (guideNextButton) {
        guideNextButton.addEventListener('click', function() {
            goToStep(currentGuideStep + 1);
        });
    }
    
    if (guideCloseButton) {
        guideCloseButton.addEventListener('click', completeGuide);
    }
    
    if (guideReplayButton) {
        guideReplayButton.addEventListener('click', function() {
            // 현재 활성화된 도구 확인
            checkCurrentTool();
            
            // 가이드 재시작
            currentGuideStep = 0;
            updateGuideContents();
            createProgressDots();
            positionMarkers();
            guideOverlay.style.display = 'block';
            guideReplayContainer.style.display = 'none';
        });
    }
    
    // 창 크기 변경 시 마커 위치 조정
    window.addEventListener('resize', positionMarkers);
    
    // 현재 활성화된 도구 확인
    function checkCurrentTool() {
        const sidebarName = document.querySelector('.Sidebar_Name');
        const activeSubButton = document.querySelector('.sub-button.active');
        
        if (sidebarName && sidebarName.textContent.trim() === 'Food_Access_Analyzer' && activeSubButton) {
            const subButtonText = activeSubButton.textContent.trim();
            
            if (subButtonText === 'Access_Void') {
                currentTool = 'Access_Void';
                return true;
            } else if (subButtonText === 'Vulnerable_Zone') {
                currentTool = 'Vulnerable_Zone';
                return true;
            }
        }
        
        return false;
    }
    
    // 초기화
    function initGuide() {
        // 현재 도구 확인
        if (!checkCurrentTool()) return;
        
        // 가이드 내용 업데이트
        updateGuideContents();
        
        // 프로그레스 닷 생성
        createProgressDots();
        
        // 모든 마커 숨기기
        guideMarkers.forEach(marker => {
            if (marker) marker.style.display = 'none';
        });
        
        // 처음 단계 표시
        currentGuideStep = 0;
        goToStep(0);
        
        // 마커 위치 설정
        positionMarkers();
    }
    
    // 메인 탭 클릭 시 가이드 관련 요소 처리
    document.querySelectorAll('.Main_tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Tab 이름 가져오기
            const tabName = this.textContent.trim();
            
            if (tabName === 'Food_Access_Analyzer') {
                // Tool 탭 클릭 시 가이드 표시 여부 확인 (약간의 지연 후)
                setTimeout(checkAndShowGuide, 500);
            } else {
                // Tool이 아닌 다른 탭 클릭 시 가이드 관련 요소 모두 숨기기
                if (guideOverlay) guideOverlay.style.display = 'none';
                if (guideReplayContainer) guideReplayContainer.style.display = 'none';
            }
        });
    });
    
    
    
    // 현재 도구에 맞는 가이드 표시
    function checkAndShowGuide() {
        // 현재 도구 확인
        if (checkCurrentTool()) {
            initGuide();
            guideOverlay.style.display = 'block';
        }
    }
    
    // 페이지 로드 후 조금 지연시켜 요소들의 위치를 정확히 파악
    setTimeout(() => {
        // 현재 활성화된 탭과 서브 버튼 확인
        const activeTab = document.querySelector('.Main_tab.active');
        const sidebarName = document.querySelector('.Sidebar_Name');
        
        // Tool 탭이 활성화되어 있는지 확인
        if ((activeTab && activeTab.textContent.trim() === 'Food_Access_Analyzer') || 
            (sidebarName && sidebarName.textContent.trim() === 'Food_Access_Analyzer')) {
            
            // 가이드 표시 확인
            checkAndShowGuide();
        }
    }, 1000);
});

// 랜딩 페이지 생성 및 이벤트 핸들러 설정
document.addEventListener("DOMContentLoaded", function() {
    // 랜딩 페이지가 있는지 확인
    if (document.getElementById('landing-page')) {
        return; // 이미 존재하면 중복 생성 방지
    }
    
    // 랜딩 페이지 컨테이너 생성 - 전체 화면 영역 차지하되 z-index를 낮게 설정하여 Main 탭이 위에 보이도록 함
    const landingPage = document.createElement('div');
    landingPage.id = 'landing-page';
    landingPage.style.position = 'fixed';
    landingPage.style.top = '0';
    landingPage.style.left = '0';
    landingPage.style.width = '100%';
    landingPage.style.height = '100%';
    landingPage.style.backgroundColor = '#000';
    landingPage.style.zIndex = '5'; // 낮은 z-index - Main 탭(보통 10 이상)보다 낮게 설정
    landingPage.style.display = 'flex';
    landingPage.style.flexDirection = 'column';
    landingPage.style.justifyContent = 'center';
    landingPage.style.alignItems = 'center';
    landingPage.style.overflow = 'hidden';
    
    // 배경 이미지 추가
    const backgroundImage = document.createElement('img');
    backgroundImage.src = 'Landing_Page.png';
    backgroundImage.alt = 'Landing Page';
    backgroundImage.style.width = '100%';
    backgroundImage.style.height = '100%';
    backgroundImage.style.objectFit = 'cover';
    backgroundImage.style.position = 'absolute';
    backgroundImage.style.top = '0';
    backgroundImage.style.left = '0';
    
    // 에러 처리: 이미지를 찾을 수 없는 경우 백업 스타일 적용
    backgroundImage.onerror = function() {
        console.error('Landing page image not found');
        this.style.display = 'none';
        landingPage.style.backgroundColor = '#001e24';
    };
    
    // 텍스트 컨테이너 생성 (왼쪽 부분)
    const textContainer = document.createElement('div');
    textContainer.style.position = 'absolute';
    textContainer.style.left = '80px';
    textContainer.style.top = '50%';
    textContainer.style.transform = 'translateY(-50%)';
    textContainer.style.maxWidth = '600px';
    textContainer.style.zIndex = '6'; // 배경 이미지보다 위에
    
    // 제목 추가 (가장 큰 텍스트)
    const title = document.createElement('h1');
    title.textContent = 'The Grocery Link';
    title.style.color = 'white';
    title.style.fontSize = '3.5rem';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '10px';
    title.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
    
    // 부제목 추가 (중간 크기 텍스트)
    const subtitle = document.createElement('h2');
    subtitle.textContent = 'Mapping Food Deserts and Delivery Gaps';
    subtitle.style.color = 'white';
    subtitle.style.fontSize = '1.8rem';
    subtitle.style.fontWeight = '500';
    subtitle.style.marginBottom = '20px';
    subtitle.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
    
    // 설명 텍스트 추가 (작은 텍스트)
    const description = document.createElement('p');
    description.textContent = 'The Grocery Link is a data-driven tool that visualizes issues of food accessibility across the United States. By identifying areas where food deserts and the absence of delivery services overlap, it highlights the most vulnerable regions at a glance. This tool enables policymakers and food distribution stakeholders to clearly understand where support is most urgently needed.';
    description.style.color = 'white';
    description.style.fontSize = '1.1rem';
    description.style.lineHeight = '1.6';
    description.style.maxWidth = '540px';
    description.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
    
    // 이미지 컨테이너 (오른쪽 부분)
    const imagesContainer = document.createElement('div');
    imagesContainer.style.position = 'absolute';
    imagesContainer.style.right = '80px';
    imagesContainer.style.top = '55%'; // 살짝 위로 조정
    imagesContainer.style.transform = 'translateY(-50%)';
    imagesContainer.style.display = 'flex';
    imagesContainer.style.flexDirection = 'row'; // 가로 배치로 변경
    imagesContainer.style.gap = '20px';
    imagesContainer.style.zIndex = '6'; // 배경 이미지보다 위에
    
    // 그리드 이미지 추가
    const grid1 = document.createElement('img');
    grid1.src = 'Grid1.png';
    grid1.alt = 'Grid Visualization 1';
    grid1.style.width = '380px'; // 가로로 나열되므로 너비 조정
    grid1.style.borderRadius = '8px';
    grid1.style.opacity = '80%';
    grid1.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    
    const grid2 = document.createElement('img');
    grid2.src = 'Grid2.png';
    grid2.alt = 'Grid Visualization 2';
    grid2.style.width = '380px'; // 가로로 나열되므로 너비 조정
    grid2.style.borderRadius = '8px';
    grid2.style.opacity = '80%';
    grid2.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    
    // 그리드 이미지 오류 처리
    grid1.onerror = function() {
        console.error('Grid1.png not found');
        this.style.display = 'none';
    };
    
    grid2.onerror = function() {
        console.error('Grid2.png not found');
        this.style.display = 'none';
    };
    
    // 버튼 컨테이너 (왼쪽 하단에 배치)
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.bottom = '80px';
    buttonContainer.style.left = '80px';
    buttonContainer.style.zIndex = '6'; // 랜딩 페이지보다 위에 표시
    
    // "Go to the Tool" 버튼 생성
    const goToToolButton = document.createElement('button');
    goToToolButton.textContent = 'Go to the Tool →';
    goToToolButton.style.padding = '12px 24px';
    goToToolButton.style.fontSize = '18px';
    goToToolButton.style.fontWeight = 'bold';
    goToToolButton.style.backgroundColor = '#b93f1f';
    goToToolButton.style.color = 'white';
    goToToolButton.style.border = 'none';
    goToToolButton.style.borderRadius = '5px';
    goToToolButton.style.cursor = 'pointer';
    goToToolButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    goToToolButton.style.transition = 'all 0.3s ease';
    
    // 버튼 호버 효과
    goToToolButton.onmouseover = function() {
        this.style.backgroundColor = '#cd4e1c';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
    };
    
    goToToolButton.onmouseout = function() {
        this.style.backgroundColor = '#ff3600';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    };
    
    // 버튼 클릭 시 Tool 페이지로 이동
    goToToolButton.addEventListener('click', navigateToToolPage);
    
    // 랜딩 페이지 스크롤 이벤트 처리 (스크롤 시 Tool 페이지로 이동)
    landingPage.addEventListener('wheel', navigateToToolPage);
    
    // 랜딩 페이지 클릭 이벤트 처리 (클릭 시 Tool 페이지로 이동)
    landingPage.addEventListener('click', function(event) {
        // 버튼, 텍스트, 이미지 클릭 시 제외
        if (event.target !== goToToolButton && 
            event.target !== grid1 && 
            event.target !== grid2 && 
            !textContainer.contains(event.target)) {
            navigateToToolPage();
        }
    });
    
    // Tool 페이지로 이동하는 함수
    function navigateToToolPage() {
        // 랜딩 페이지 페이드아웃 효과
        landingPage.style.transition = 'opacity 0.5s ease';
        landingPage.style.opacity = '0';
        
        // 트랜지션 완료 후 페이지 제거 및 Tool 탭 활성화
        setTimeout(function() {
            // 랜딩 페이지 제거
            landingPage.remove();
            
            // 메인 탭 표시 유지 및 Tool 탭만 활성화
            const toolTab = Array.from(document.querySelectorAll(".Main_tab")).find(tab => 
                tab.textContent.trim() === "Food_Access_Analyzer"
            );
            
            if (toolTab) {
                // Tool 탭 클릭해서 해당 콘텐츠 활성화
                toolTab.click();
            } else {
                console.error("Tool tab not found");
            }
            
            // 사이드바 및 맵 표시
            const sidebar = document.getElementById('sidebar');
            const mainMap = document.getElementById('Main_map');
            
            if (sidebar) sidebar.style.display = 'block';
            if (mainMap) mainMap.style.display = 'block';
        }, 500);
    }
    
    // 요소들을 컨테이너에 추가
    textContainer.appendChild(title);
    textContainer.appendChild(subtitle);
    textContainer.appendChild(description);
    
    imagesContainer.appendChild(grid1);
    imagesContainer.appendChild(grid2);
    
    buttonContainer.appendChild(goToToolButton);
    
    // 모든 요소를 랜딩 페이지에 추가
    landingPage.appendChild(backgroundImage);
    landingPage.appendChild(textContainer);
    landingPage.appendChild(imagesContainer);
    landingPage.appendChild(buttonContainer);
    document.body.appendChild(landingPage);
    
    // 랜딩 페이지가 표시될 때는 콘텐츠 영역만 숨기고 Main 탭은 그대로 표시
    const contentElements = [
        document.getElementById('Main_map'),
        document.getElementById('Cities_map'),
        document.getElementById('sidebar')
    ];
    
    contentElements.forEach(element => {
        if (element) {
            element.style.display = 'none';
        }
    });
});