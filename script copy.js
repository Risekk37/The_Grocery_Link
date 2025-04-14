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


const detail_map = new mapboxgl.Map({
    container: 'detail_map',
    style: 'mapbox://styles/kit3775/cm7alf2vv004501s6gs2y0226', 
    center: [-95.683356,38.609846],
    zoom: 9.5
});

const layerSettings = {
    delivery: { color: '#001e24', opacity: 0.07, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.9,  outlineOffset:0 },
    demography: { color: '#03748a', opacity: 0.07, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.9,  outlineOffset:0 },
    food: { color: '#cd4e1c', opacity: 0.07, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.9,  outlineOffset:0 },
    deliveryfood: { color: '#FABF1D', opacity: 0, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.9,  outlineOffset:0 },
    fooddemography: { color: '#F215FA', opacity: 0, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.9,  outlineOffset:0 },
    Access_Void: { color: '#ff3600', opacity: 0.6, outlineColor: '#ffffff', outlineWidth: 0.5, outlineOpacity: 1, outlineOffset: -0.5 }
};

const layerSettings_city = {
    Usa_All_C: { color: '#ff3600', opacity: 0.2, outlineColor: '#ff3600', outlineWidth: 0.5, outlineOpacity: 1, outlineOffset: 0 },
    Outcome_All: { color: '#ff3600', opacity: 0.5, outlineColor: '#ffffff', outlineWidth: 0.5, outlineOpacity: 1, outlineOffset: -0.5 },
    Poverty_All: { color: '#001e24', opacity: 0.2, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.9,  outlineOffset:0 },
    Food_All: { color: '#cd4e1c', opacity: 0.2, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.9,  outlineOffset:0 }
};

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
            }
        });
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
                        
                        // 드롭다운 버튼 텍스트 업데이트
                        const cityText = document.querySelector(`#dropdown-menu li[data-city="${cityKey}"]`).textContent;
                        dropdownButton.textContent = cityText + " ▼";
                        
                        const citiesTab = Array.from(document.querySelectorAll(".Main_tab")).find(tab => 
                            tab.textContent.trim() === "Cities"
                        );
                        
                        if (citiesTab) {
                            // Cities 탭 클릭하여 사이드바 업데이트
                            citiesTab.click();
                            
                            // C_Conditions 서브 버튼 찾기
                            setTimeout(() => {
                                const cConditionsButton = Array.from(document.querySelectorAll(".sub-button")).find(btn => 
                                    btn.textContent.trim() === "C_Conditions"
                                );
                                
                                if (cConditionsButton) {
                                    // C_Conditions 버튼 클릭
                                    cConditionsButton.click();
                                }
                            }, 50); // 아주 짧은 지연시간을 두어 DOM이 업데이트될 시간 확보
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
    const poverty = { label: "- Poverty", value: props["Poverty_Last"] };

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

// Hover 시 팝업 표시
Main_map.on('mouseenter', 'pick_3_layer', e => {
    // 필터가 적용된 점들에 대해서만 팝업 표시
    const filter = Main_map.getFilter("Access_Void");
    // 필터가 적용되지 않은 경우에도 팝업을 표시하도록 처리
    if (!filter || filter.length === 0 || filter.length > 0) { 
        updatePopup(e, false);
    }
    Main_map.getCanvas().style.cursor = 'pointer';
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
       

        // Main 탭별 콘텐츠 설정
        const mainContentData = {
            "About": {
                name: "About",
                content: "Delivery services have become an essential component of modern life, providing convenient access to goods with just a few clicks. They are often perceived as a universally available convenience, seamlessly integrated into daily routines. However, contrary to this assumption, the accessibility of such services is not uniform across all communities. In certain areas, grocery delivery services are either entirely unavailable or functionally inaccessible due to high service fees and coverage limitations. Delivery Desert is a project that aims to visualize these disparities through data and mapping, highlighting the unequal distribution of delivery services. By making these issues visible, this project seeks to raise awareness of the structural barriers that prevent equitable access to delivery services. Ultimately, delivery infrastructure should not be a privilege limited to certain populations but a universally accessible public service.",
                subButtons: ["Delivery", "Food", "Reference"],
                subContent: {
                    "Delivery": "The COVID-19 pandemic has transformed delivery services from a matter of convenience into a critical pillar of everyday life. Today, delivery services fulfill a broad spectrum of needs, ranging from groceries and pharmaceuticals to household essentials and prepared meals. Rather than serving as a supplementary option, delivery has become an indispensable infrastructure for modern society.\nSince 2013, the demand for delivery services has surged, with parcel deliveries increasing nearly fivefold to 16.2 billion in 2023. On average, individuals now receive about 65 parcels annually, highlighting delivery’s integration into daily life. Meal and grocery deliveries have also tripled since the pre-pandemic era, surpassing 2,100 and 1,500 daily orders, respectively. Acknowledging this growing dependence, the U.S. government designated delivery services as essential infrastructure during the pandemic.\nDespite their increasing significance, delivery services are not equitably accessible to all. I define Grocery Delivery Desert as areas where online grocery delivery is either unavailable or severely restricted. This issue is not merely an inconvenience but a factor that exacerbates socioeconomic disparities. Individuals without access to grocery delivery must physically visit stores, which poses a substantial burden for those with limited mobility or inadequate transportation options. Furthermore, in some regions where grocery delivery is technically available, exorbitant service fees render it impractical for low-income households, effectively excluding them from this essential service. Consequently, the unequal distribution of delivery services reflects and reinforces broader structural inequalities in society. ",
                    "Food": "Limited access to supermarkets, supercenters, grocery stores, or other sources of healthy and affordable food may make it harder for some people to eat a healthy diet in this country.  Expanding the availability of nutritious and affordable food by developing and equipping grocery stores, small retailers, corner markets and farmers’ markets in communities with limited access is an important part of the Healthy Food Financing Initiative.\nThere are many ways to define which areas are considered low income and low access (formerly referred to at the Economic Research Service as 'food deserts') and many ways to measure food store access for individuals and for neighborhoods. \n More than 10% of American households do not have access, at all times, to enough food for an active, healthy life for all household members. The reasons for food insecurity can look very different in densely populated urban areas vs. more-rural communities. Solutions that could offset much of the issue in urban areas are simply unfeasible for more-rural consumers, for whom the nearest food store may well be dozens of miles away. \n Rural communities comprise 63% of all U.S counties but 87% of the counties with the highest food insecurity rates. A confluence of factors is driving an increase in food insecurity, including the reduction or elimination of support programs offered during the pandemic and increased inflation. Insecurity also comes from “food deserts” which, according to the USDA, take two forms based on data from the 2000 Census of Population and Housing: \n - Suburbs: At least 10-mile demarcations to the nearest supermarket \n - Urban: 0.5-mile demarcations to the nearest supermarket.",
                    "Reference": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\nWhere does it come from?\nContrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32."
                }
            },
            "Rural_1K": {
                name: "Rural_1K",
                content: "In rural areas, the issue of food access voids is significant, with many regions having grocery stores located over 10 miles away. To address this, the lack of delivery services and the scarcity of grocery stores are key contributing factors. These areas often face challenges due to low population density, economic constraints, and limited transportation infrastructure, making the expansion of delivery services difficult.",
                subButtons: ["Where", "Conditions", "Data"],
                subContent: {
                    "Where": "Areas in food deserts that are far from grocery markets are more likely to be solved through delivery services, but not all regions are able to take advantage of this. The overlap between undelivery zones and food deserts currently highlights areas with very limited access to fresh food. Among these, regions with a population above a certain threshold still lack the necessary infrastructure, despite its potential to be developed. \nThere are more than 100 such towns across the United States. While the number of affected areas varies depending on population size, if population is not considered, it is expected that many more regions are impacted.",
                    "Conditions": "Areas experiencing difficulties in accessing grocery stores are shaped by a combination of various conditions. These challenges often stem from limited connectivity to other residential or commercial hubs, inadequate transportation infrastructure, and the overall level of regional development. In many cases, factors such as road accessibility, public transit availability, population density, and economic conditions further exacerbate food accessibility issues. Additionally, geographic barriers, such as mountains or rivers, can isolate communities, making it even harder for residents to reach essential services. Understanding these conditions is crucial to identifying and addressing food access disparities effectively.",
                    "Data": "디테일 정보입니다."
                }
            },
            "Urban_1M": {
                name: "Urban_1M",
                content: "In urban areas, while grocery stores and delivery services are widely available, certain neighborhoods still experience food access challenges. In particular, food deserts—areas where grocery stores are over a mile away—persist. When food deserts coincide with high-poverty rates, residents may struggle with both physical distance and financial barriers to food access.",
                subButtons: ["Where", "Conditions", "Lorem"],
                subContent: {
                    "Where": "The analysis examines the intersection of poverty and food deserts in the top 10 U.S. cities, selected based on their population size—specifically cities with over 1 million residents. This approach highlights large urban areas where the overlap of food access challenges and poverty is more pronounced, impacting a significant portion of the population.",
                    "Conditions": "In each city, areas with a poverty rate of over 20% and food deserts—defined as regions where grocery stores are located more than 1 mile away—have been highlighted. The intersection of these two factors identifies neighborhoods where low-income residents are at a greater disadvantage in accessing fresh food. These individuals are more likely to rely on grocery delivery or food delivery services to meet their needs. However, the high delivery fees currently associated with these services may be prohibitive, preventing many residents from utilizing these options. As a result, people in these overlapping areas face heightened challenges in accessing affordable, nutritious food compared to other urban populations.",
                    "Lorem": "nothing yet"
                }
            },
            "Beyond": {
                name: "Beyond",
                content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                subButtons: ["Future", "Research", "Impact"],
                subContent: {
                    "Future": "미래 전망입니다.",
                    "Research": "현재 연구 내용입니다.",
                    "Impact": "사회적 영향 분석입니다."
                }
            }
        };

    
        // Main 탭 클릭 이벤트
        mainTabs.forEach(tab => {
            tab.addEventListener("click", function () {
                const selectedTab = tab.textContent.trim();
                if (mainContentData[selectedTab]) {
                    const data = mainContentData[selectedTab];
    
                    // Sidebar 업데이트
                    sidebarName.textContent = data.name;
                    sidebarMainContent.textContent = data.content;
    
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
                            subContent.textContent = data.subContent[buttonText];
    
                            // 모든 sub-button에서 active 클래스 제거
                            document.querySelectorAll(".sub-button").forEach(btn => btn.classList.remove("active"));
    
                            // 현재 클릭된 버튼에 active 클래스 추가
                            button.classList.add("active");

                              // "Conditions" 버튼 클릭 시 Display_button 보이기
                            if (buttonText === "Conditions" | buttonText ==="S_Where") {
                                if (selectedTab === "Rural_1K") {
                                displayButton.style.display = "block";  // "Conditions"일 때만 보이게 설정
                                categoryContainer.style.display = "block";
                            } else {
                                displayButton.style.display = "none";  // "Conditions"이 아닌 경우 숨기기
                                categoryContainer.style.display = "none";
                            }}

                            if (buttonText === "Conditions") {
                                if (selectedTab === "Rural_1K"){
                                categoryContainer.style.display = "block";
                                 // 🔹 opacity 변경 기능 추가
                                const layersToChange = ['delivery', 'food', 'demography'];
                                layersToChange.forEach(layer => {
                                    Main_map.setPaintProperty(layer, 'fill-opacity', 0.03);
                                });
                                flyToMain();
                            }} else {
                                categoryContainer.style.display = "none";
                            }

                            if (buttonText === "Where") {
                                if (selectedTab === "Rural_1K") {
                                layercheck.style.display = "block";
                                const layersToChange = ['delivery', 'food', 'demography'];
                                layersToChange.forEach(layer => {
                                    Main_map.setPaintProperty(layer, 'fill-opacity', 0.07);
                                });
                                flyToMain();
                            }} else {
                                layercheck.style.display = "none";
                            }

                            if (buttonText === "Delivery") {
                                myGif.style.display = "block";  // "Rural"일 때만 보이게 설정
                            } else {
                                myGif.style.display = "none";  // "Rural"이 아닌 경우 숨기기
                            }
                            
                            if (buttonText === "Food") {
                                fooddesert.style.display = "block";  // "Rural"일 때만 보이게 설정
                            } else {
                                fooddesert.style.display = "none";  // "Rural"이 아닌 경우 숨기기
                            }
                            if (buttonText === "Where") {
                                if (selectedTab === "Urban_1M") {
                                const layersToChange = ['Outcome_All', 'Food_All', 'Poverty_All'];
                                layersToChange.forEach(layer => {
                                    Cities_map.setPaintProperty(layer, 'fill-opacity', 0);
                                    Cities_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                                });
                                const layersToChange2 = ['Usa_All_C'];
                                layersToChange2.forEach(layer => {
                                Cities_map.setPaintProperty(layer, 'fill-opacity', layerSettings_city[layer].opacity );
                                Cities_map.setPaintProperty(`${layer}-outline`, 'line-opacity', layerSettings_city[layer].outlineOpacity);
                                });
                                DropDown.style.display = "none";
                                flyToMain_city();
                                categoryCity.style.display = "block";
                            }} else {}
                               
                            
                        
                            
                            if (buttonText === "Conditions") {
                                if (selectedTab === "Urban_1M") {
                                const layersToChange =['Usa_All_C']; 
                                layersToChange.forEach(layer => {
                                    Cities_map.setPaintProperty(layer, 'fill-opacity', 0);
                                    Cities_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                                });
                                const layersToChange2 = ['Outcome_All', 'Food_All', 'Poverty_All'];
                                layersToChange2.forEach(layer => {
                                Cities_map.setPaintProperty(layer, 'fill-opacity', layerSettings_city[layer].opacity );
                                Cities_map.setPaintProperty(`${layer}-outline`, 'line-opacity', layerSettings_city[layer].outlineOpacity);
                                });
                                reportcontainercity.style.display = "block";
                                DropDown.style.display = "block";
                                categoryCity.style.display = "none";
                                if (!citySelected) { // 도시가 선택되지 않았을 때만 flyToNewYork 실행
                                    flyToNewYork();
                                }
                            }} else {reportcontainercity.style.display = "none";}
                            
                        });
                    });
    
                    // 기본 sub-content 설정
                    subContent.textContent = data.subContent[data.subButtons[0]];
                    // 첫 번째 서브 버튼에 active 클래스 추가
                    subButtonsContainer.firstChild.classList.add("active");
                    // Main_tab 클릭 시 displayButton 숨기기
                    if (selectedTab !== "Rural_1K") {
                        displayButton.style.display = "none";  // Main_tab을 클릭하면 숨기기
                        categoryContainer.style.display = "none"; 
                        layercheck.style.display = "none";
                        
                    } else {
                        displayButton.style.display = "block";  // "View(Rural/City)" 클릭 시 Display_button 보이기
                        categoryContainer.style.display = "block"; 
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
                    if (selectedTab =="Rural_1K") {
                        layercheck.style.display = "block"; 
                        mainMap.style.display = "block";
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
                    } else {
                        layercheck.style.display = "none";
                    }
                    if (selectedTab =="Urban_1M") {
                        mainMap.style.display = "none";
                        citiesMap.style.display = "block";
                        X.style.display = "none";
                         // 🔹 opacity 변경 기능 추가
                         const layersToChange = ['delivery', 'food', 'demography', 'Access_Void'];
                         layersToChange.forEach(layer => {
                             Main_map.setPaintProperty(layer, 'fill-opacity', 0);
                             Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                         });
                         const layersToChange2 = ['Outcome_All', 'Food_All', 'Poverty_All'];
                            layersToChange2.forEach(layer => {
                                Cities_map.setPaintProperty(layer, 'fill-opacity', 0);
                                Cities_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                            });
                        reportcontainercity.style.display = "none";
                        DropDown.style.display = "none";
                        flyToMain_city();
                        const layersToChange3 = ['Usa_All_C'];
                                layersToChange3.forEach(layer => {
                                Cities_map.setPaintProperty(layer, 'fill-opacity', layerSettings_city[layer].opacity );
                                Cities_map.setPaintProperty(`${layer}-outline`, 'line-opacity', layerSettings_city[layer].outlineOpacity);
                                });
                        Search.style.display = "none";
                        categoryCity.style.display = "block";
                    } else {}
                    if (selectedTab =="Beyond") {
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
                    }

                    
                }
            });
        });

        // 초기 상태 설정 (View(Rural/City) 탭 기준)
    mainTabs[0].click();  // "View(Rural/City)" 탭을 클릭

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
function loadImagesByCategory() {
    const selectedCategories = Array.from(document.querySelectorAll("#categoryContainer input[type='checkbox']:checked"))
        .map(checkbox => checkbox.value);
    
    imageGrid.innerHTML = '';

    fetch('Prototype/Access_Void.geojson')
        .then(response => response.json())
        .then(data => {
            if (selectedCategories.length === 0) {
                data.features.forEach(feature => {
                    const idNumber = feature.properties.id_number;
                    if (!excludeImages.includes(idNumber)) {
                        const imgElement = document.createElement("img");
                        imgElement.src = `satellite/satellite_${idNumber}.png`; // id_number에 맞는 이미지 불러오기
                        imgElement.alt = `Image ${idNumber}`;
                        imgElement.addEventListener('click', () => openDetailPopup(idNumber)); // 클릭시 팝업 열기
                        imageGrid.appendChild(imgElement);
                    }
                });
            } else {
                data.features.forEach(feature => {
                    const idNumber = feature.properties.id_number;
                    let showImage = true;

                    selectedCategories.forEach(category => {
                        if (feature.properties[category] !== 1) {
                            showImage = false; 
                        }
                    });

                    if (showImage && !excludeImages.includes(idNumber)) {
                        const imgElement = document.createElement("img");
                        imgElement.src = `satellite/satellite_${idNumber}.png`; 
                        imgElement.alt = `Image ${idNumber}`;
                        imgElement.addEventListener('click', () => openPopup(idNumber)); // 클릭시 팝업 열기
                        imageGrid.appendChild(imgElement);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error loading Access_Void.geojson:', error);
        });
}

// detail_popup을 여는 함수
function openDetailPopup(idNumber) {
    const detailPopup = document.getElementById("detail_popup");
    
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
                
                const poverty = { label: "- Poverty", value: props["Poverty_Last"] };
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
    const popupImageGrid = document.createElement("div");
    popupImageGrid.id = "popup_imageGrid";
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
    document.body.appendChild(popupImageGrid);
}

// 체크박스 변경 시 이미지 필터링
document.addEventListener("DOMContentLoaded", function () {
    // 페이지 로드 시 모든 이미지를 먼저 표시
    loadImagesByCategory();

    const checkboxes = document.querySelectorAll("#categoryContainer input[type='checkbox']");

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", loadImagesByCategory);
    });
});


const displayButton = document.getElementById('Display_button');
const imageGridContainer = document.getElementById('imageGridContainer');

// 버튼 클릭 시 #imageGridContainer의 visibility와 opacity를 변경
displayButton.addEventListener('click', () => {
  if (imageGridContainer.style.visibility === 'hidden' || imageGridContainer.style.visibility === '') {
    imageGridContainer.style.visibility = 'visible';  // 보이게 설정
    imageGridContainer.style.opacity = 1;  // 불투명하게 설정
    displayButton.classList.add('active'); // 버튼에 active 클래스 추가
  } else {
    imageGridContainer.style.visibility = 'hidden';  // 숨기기 설정
    imageGridContainer.style.opacity = 0;  // 투명하게 설정
    displayButton.classList.remove('active'); // 버튼에서 active 클래스 제거
  }
});

let activeElement = null;

Highcharts.chart('report', {
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
                    if (activeElement) {
                        if (activeElement.name === "노랑") {
                            activeElement.graphic.attr({ fill: "rgb(250,191,30,0.5)" });
                        } else if (activeElement.name === "핑크") {
                            activeElement.graphic.attr({ fill: "rgb(242,21,250,0.5)" });
                        } else if (activeElement.name === "흰색") {
                            activeElement.graphic.attr({ fill: "rgb(250,250,250,0.5)" });
                        } else {
                            activeElement.graphic.attr({ opacity: 0.5 });
                        }
                       
                        
                        // 다른 요소들은 낮은 투명도 유지
                        activeElement.series.data.forEach(point => {
                            if (point !== activeElement && point.name !== "빨강") {
                                if (point.name === "노랑") {
                                    point.graphic.attr({ fill: "rgb(250,191,30,0.07)" });
                                } else if (point.name === "핑크") {
                                    point.graphic.attr({ fill: "rgb(242,21,250,0.07)" });
                                } else if (point.name === "흰색") {
                                    point.graphic.attr({ fill: "rgb(250,250,250,0.07)" });
                                } else {
                                    point.graphic.attr({ opacity: 0.1 });
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
                        
                        // 빨간색 이외의 다른 영역에 호버하면 빨간색의 투명도를 0.1로 설정
                        if (this.name !== "빨강") {
                            const redPoint = this.series.data.find(point => point.name === "빨강");
                            if (redPoint) {
                                redPoint.graphic.attr({ opacity: 0.1 });
                                // 빨강 레이블은 그대로 보이게 유지
                                redPoint.dataLabel.css({ opacity: 1 });
                            }
                        }
                        
                        // 맵 레이어 투명도 조절 - 클릭된 요소와 호버된 요소 모두 활성화
                        if (Main_map) {
                            // 모든 레이어 기본 투명도로 초기화
                            Main_map.setPaintProperty('delivery', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('food', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('demography', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('deliveryfood', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('fooddemography', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('fooddemography22', 'fill-opacity', 0.07);
                            
                            // 호버된 레이어 활성화
                            if (this.name === "남색") {
                                Main_map.setPaintProperty('delivery', 'fill-opacity', 0.4);
                            } else if (this.name === "주황") {
                                Main_map.setPaintProperty('food', 'fill-opacity', 0.4);
                            } else if (this.name === "청록") {
                                Main_map.setPaintProperty('demography', 'fill-opacity', 0.4);
                            } else if (this.name === "노랑") {
                                Main_map.setPaintProperty('deliveryfood', 'fill-opacity', 0.4);
                            } else if (this.name === "핑크") {
                                Main_map.setPaintProperty('fooddemography', 'fill-opacity', 0.4);
                            } else if (this.name === "흰색") {
                                Main_map.setPaintProperty('fooddemography22', 'fill-opacity', 0.4);
                            }
                            
                            // 클릭된 요소가 있고 현재 호버한 요소와 다른 경우 클릭된 레이어도 활성화
                            if (activeElement && this !== activeElement) {
                                if (activeElement.name === "남색") {
                                    Main_map.setPaintProperty('delivery', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "주황") {
                                    Main_map.setPaintProperty('food', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "청록") {
                                    Main_map.setPaintProperty('demography', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "노랑") {
                                    Main_map.setPaintProperty('deliveryfood', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "핑크") {
                                    Main_map.setPaintProperty('fooddemography', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "흰색") {
                                    Main_map.setPaintProperty('fooddemography22', 'fill-opacity', 0.4);
                                }
                            }
                        }
                        
                        // 현재 호버한 요소의 벤 다이어그램 투명도 설정
                        if (this.name === "노랑") {
                            this.graphic.attr({ fill: "rgb(250,191,30,0.5)" });
                        } else if (this.name === "핑크") {
                            this.graphic.attr({ fill: "rgb(242,21,250,0.5)" });
                        } else if (this.name === "흰색") {
                            this.graphic.attr({ fill: "rgb(250,250,250,0.5)" });
                        } else {
                            this.graphic.attr({ opacity: 0.5 });
                        }
                        
                        // 클릭된 요소가 있고, 현재 호버한 요소가 클릭된 요소가 아닌 경우
                        if (activeElement && this !== activeElement) {
                            // 클릭된 요소의 투명도도 유지
                            if (activeElement.name === "노랑") {
                                activeElement.graphic.attr({ fill: "rgb(250,191,30,0.5)" });
                            } else if (activeElement.name === "핑크") {
                                activeElement.graphic.attr({ fill: "rgb(242,21,250,0.5)" });
                            } else if (activeElement.name === "흰색") {
                                activeElement.graphic.attr({ fill: "rgb(250,250,250,0.5)" });
                            } else {
                                activeElement.graphic.attr({ opacity: 0.5 });
                            }
                            
                            // 나머지 요소들은 낮은 투명도로 설정
                            this.series.data.forEach(point => {
                                if (point !== this && point !== activeElement && point.name !== "빨강") {
                                    if (point.name === "노랑") {
                                        point.graphic.attr({ fill: "rgb(250,191,30,0.07)" });
                                    } else if (point.name === "핑크") {
                                        point.graphic.attr({ fill: "rgb(242,21,250,0.07)" });
                                    } else if (point.name === "흰색") {
                                        point.graphic.attr({ fill: "rgb(250,250,250,0.7)" });
                                    } else {
                                        point.graphic.attr({ opacity: 0.1 });
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
                            if (this.name === "노랑") {
                                this.graphic.attr({ fill: "rgb(250,191,30,0.5)" });
                            } else if (this.name === "핑크") {
                                this.graphic.attr({ fill: "rgb(242,21,250,0.5)" });
                            } else if (this.name === "흰색") {
                                this.graphic.attr({ fill: "rgb(250,250,250,0.5)" });
                            } else {
                                this.graphic.attr({ opacity: 0.5 });
                            }
                            return;
                        }

                        // 맵 레이어 투명도 복원 - 클릭된 요소가 있으면 그 레이어만 활성화
                        if (Main_map) {
                            // 모든 레이어 기본 투명도로 초기화
                            Main_map.setPaintProperty('delivery', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('food', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('demography', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('deliveryfood', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('fooddemography', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('fooddemography22', 'fill-opacity', 0.07);
                            
                            // 클릭된 요소가 있으면 해당 레이어만 활성화
                            if (activeElement) {
                                if (activeElement.name === "남색") {
                                    Main_map.setPaintProperty('delivery', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "주황") {
                                    Main_map.setPaintProperty('food', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "청록") {
                                    Main_map.setPaintProperty('demography', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "노랑") {
                                    Main_map.setPaintProperty('deliveryfood', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "핑크") {
                                    Main_map.setPaintProperty('fooddemography', 'fill-opacity', 0.4);
                                } else if (activeElement.name === "흰색") {
                                    Main_map.setPaintProperty('fooddemography22', 'fill-opacity', 0.4);
                                }
                            }
                        }

                        // 호버를 벗어난 요소의 상태 복원
                        if (this.name === "빨강" && !activeElement) {
                            this.graphic.attr({ opacity: 1 });
                        } else {
                            // 클릭된 요소가 있는 경우, 호버를 벗어난 요소가 클릭된 요소가 아니면 낮은 투명도로 설정
                            if (activeElement && this !== activeElement) {
                                if (this.name === "노랑") {
                                    this.graphic.attr({ fill: "rgb(250,191,30,0.07)" });
                                } else if (this.name === "핑크") {
                                    this.graphic.attr({ fill: "rgb(242,21,250,0.07)" });
                                } else if (this.name === "흰색") {
                                    this.graphic.attr({ fill: "rgb(250,250,250,0.07)" });
                                } else if (this.name !== "빨강") {
                                    this.graphic.attr({ opacity: 0.1 });
                                }
                            } else if (!activeElement) {
                                // 클릭된 요소가 없으면 기본 투명도로 복원
                                if (this.name === "노랑") {
                                    this.graphic.attr({ fill: "rgb(250,191,30,0.07)" });
                                } else if (this.name === "핑크") {
                                    this.graphic.attr({ fill: "rgb(242,21,250,0.07)" });
                                } else if (this.name === "흰색") {
                                    this.graphic.attr({ fill: "rgb(250,250,250,0.07)" });
                                } else if (this.name !== "빨강") {
                                    this.graphic.attr({ opacity: 0.1 });
                                }
                            }
                        }

                        // dataLabels 색상 원래 색으로 복원 (클릭된 요소가 아닌 경우)
                        if (activeElement !== this && this.name !== "빨강") {
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
                                Main_map.setPaintProperty('delivery', 'fill-opacity', 0.07);
                                Main_map.setPaintProperty('food', 'fill-opacity', 0.07);
                                Main_map.setPaintProperty('demography', 'fill-opacity', 0.07);
                                Main_map.setPaintProperty('deliveryfood', 'fill-opacity', 0.07);
                                Main_map.setPaintProperty('fooddemography', 'fill-opacity', 0.07);
                                Main_map.setPaintProperty('fooddemography22', 'fill-opacity', 0.07);
                            }
                            
                            // 빨간색은 완전 불투명하게, 나머지는 기본 투명도로
                            this.series.data.forEach(point => {
                                if (point.name === "빨강") {
                                    point.graphic.attr({ opacity: 1 });
                                } else if (point.name === "노랑") {
                                    point.graphic.attr({ fill: "rgb(250,191,30,0.07)" });
                                } else if (point.name === "핑크") {
                                    point.graphic.attr({ fill: "rgb(242,21,250,0.07)" });
                                } else if (point.name === "흰색") {
                                    point.graphic.attr({ fill: "rgb(250,250,250,0.07)" });
                                } else {
                                    point.graphic.attr({ opacity: 0.1 });
                                }
                                // 모든 레이블의 투명도는 1로 유지
                                point.dataLabel.css({ opacity: 1 });
                                // 모든 레이블의 색상 원래대로 복원
                                if (point.name !== "빨강") {
                                    point.dataLabel.css({ color: '#8f8f8f' });
                                }
                            });
                            return;
                        }
                        
                        // 수정 2: 이전에 선택된 요소가 있으면 텍스트 색상을 원래대로 복원
                        if (activeElement) {
                            if (activeElement.name !== "빨강") {
                                activeElement.dataLabel.css({ color: '#8f8f8f' });
                            }
                        }
                        
                        // 새로운 요소 클릭 시
                        activeElement = this;
                
                        // 클릭 시 해당 레이어의 투명도 조정
                        if (Main_map) {
                            // 먼저 모든 레이어 투명도 초기화
                            Main_map.setPaintProperty('delivery', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('food', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('demography', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('deliveryfood', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('fooddemography', 'fill-opacity', 0.07);
                            Main_map.setPaintProperty('fooddemography22', 'fill-opacity', 0.07);
                            
                            // 선택된 레이어만 활성화
                            if (this.name === "남색") {
                                Main_map.setPaintProperty('delivery', 'fill-opacity', 0.4);
                            } else if (this.name === "주황") {
                                Main_map.setPaintProperty('food', 'fill-opacity', 0.4);
                            } else if (this.name === "청록") {
                                Main_map.setPaintProperty('demography', 'fill-opacity', 0.4);
                            } else if (this.name === "노랑") {
                                Main_map.setPaintProperty('deliveryfood', 'fill-opacity', 0.4);
                            } else if (this.name === "핑크") {
                                Main_map.setPaintProperty('fooddemography', 'fill-opacity', 0.4);
                            } else if (this.name === "흰색") {
                                Main_map.setPaintProperty('fooddemography22', 'fill-opacity', 0.4);
                            }
                        }
                        
                        // 클릭된 요소는 투명도 0.5로 설정
                        if (this.name === "노랑") {
                            this.graphic.attr({ fill: "rgb(250,191,30,0.5)" });
                        } else if (this.name === "핑크") {
                            this.graphic.attr({ fill: "rgb(242,21,250,0.5)" });
                        } else if (this.name === "흰색") {
                            this.graphic.attr({ fill: "rgb(250,250,250,0.5)" });
                        } else {
                            this.graphic.attr({ opacity: 0.5 });
                        }
                        // 클릭된 요소의 텍스트 색상을 흰색으로 설정
                        this.dataLabel.css({ color: '#FFFFFF' });
                
                        // 클릭되지 않은 요소들의 투명도를 0.1로 설정
                        this.series.data.forEach(point => {
                            if (point !== this && point.name !== "빨강") {
                                if (point.name === "노랑") {
                                    point.graphic.attr({ fill: "rgb(250,191,30,0.07)" });
                                } else if (point.name === "핑크") {
                                    point.graphic.attr({ fill: "rgb(242,21,250,0.07)" });
                                } else if (point.name === "흰색") {
                                    point.graphic.attr({ fill: "rgb(250,250,250,0.07)" });
                                } else {
                                    point.graphic.attr({ opacity: 0.1 });
                                }
                                // 수정 1: dataLabel의 투명도는 항상 1로 유지
                                point.dataLabel.css({ opacity: 1 });
                                // 수정 2: 다른 요소들의 텍스트 색상을 원래대로 설정
                                if (point.name !== "빨강") {
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
                name: "남색", 
                sets: ["남색"], 
                value: 100, 
                color: "#001e24", 
                opacity: 0.1,
                dataLabels: {
                    enabled: true,
                    format: 'Undelivered', // 추가할 텍스트
                    style: {
                        fontSize: '12px', // 작은 글씨 크기
                        color: '#8f8f8f', // 글씨 색
                        textOutline: 'none'
                    }
                }
            },
            { 
                name: "주황", 
                sets: ["주황"], 
                value: 100, 
                color: "#cd4e1c", 
                opacity: 0.1,
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
                name: "청록", 
                sets: ["청록"], 
                value: 100, 
                color: "#03748a", 
                opacity: 0.1,
                dataLabels: {
                    enabled: true,
                    format: 'Population > 1K',
                    style: {
                        fontSize: '12px',
                        color: '#8f8f8f',
                        textOutline: 'none'
                    }
                }
            },
            { 
                name: "노랑", 
                sets: ["남색", "주황"], 
                value: 30, 
                color: "rgb(250,191,30,0.07)", 
                opacity: 1,
                dataLabels: {
                    enabled: true,
                    format: '',
                    style: {
                        fontSize: '12px',
                        color: '#000',
                        textOutline: 'none'
                    }
                }
            },
            { 
                name: "핑크", 
                sets: ["주황", "청록"], 
                value: 30, 
                color: "rgb(242,21,250,0.07)", 
                opacity: 1,
                dataLabels: {
                    enabled: true,
                    format: '',
                    style: {
                        fontSize: '12px',
                        color: '#000',
                        textOutline: 'none'
                    }
                }
            },
            { 
                name: "흰색", 
                sets: ["청록", "남색"], 
                value: 30, 
                color: "rgb(250,250,250,0.07)", 
                opacity: 1,
                dataLabels: {
                    enabled: true,
                    format: '',
                    style: {
                        fontSize: '12px',
                        color: '#000',
                        textOutline: 'none'
                    }
                }
            },
            { 
                name: "빨강", 
                sets: ["남색", "주황", "청록"], 
                value: 15, 
                color: "rgb(255,54,0,0.6)", 
                opacity: 1,
                dataLabels: {
                    enabled: true,
                    format: 'Access Void',
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

// 드롭다운 버튼 및 메뉴 요소
const dropdownButton = document.getElementById('dropdown-button');
const dropdownMenu = document.getElementById('dropdown-menu');

// 드롭다운 메뉴 토글
dropdownButton.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
    dropdownMenu.classList.toggle('show');
});

let citySelected = false; // 도시가 선택되었는지 체크하는 변수

// 도시 선택 시 flyTo 실행
document.querySelectorAll('#dropdown-menu li').forEach(item => {
    item.addEventListener('click', () => {
        citySelected = true; // 도시가 선택됨
        const cityKey = item.getAttribute('data-city');
        const city = cityLocations[cityKey];

        if (city) {
            Cities_map.flyTo({
                center: [city.lng, city.lat],
                zoom: city.zoom,
                essential: true
            });

            // 버튼 텍스트 변경 (HTML 구조 변경)
            dropdownButton.innerHTML = `<span>${item.textContent}</span><span>▼</span>`;

            // 메뉴 숨기기
            dropdownMenu.classList.add('hidden');
            dropdownMenu.classList.remove('show');
        }
    });
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
