mapboxgl.accessToken = 'pk.eyJ1Ijoia2l0Mzc3NSIsImEiOiJjbTNzNzZ2NWIwZTF6Mmlvb2Vpb3FkNDlsIn0.bl1LMgktKyBpPkfkFoFYWw';
const detail_map = new mapboxgl.Map({
    container: 'detail_map',
    style: 'mapbox://styles/kit3775/cm7alf2vv004501s6gs2y0226', 
    center: [-95.683356,38.609846],
    zoom: 9.5
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
const pointStyles = {
    grocery: {
        radius: 3,
        fillColor: '#00FF00', // 녹색 (식료품점)
        fillOpacity: 0,
        strokeColor: '#F5847A',
        strokeWidth: 3,
        strokeOpacity: 0.9
    },
    package: {
        radius: 3,
        fillColor: '#FFA500', // 주황색 (택배 보관소)
        fillOpacity: 0,
        strokeColor: '#F5F16E',
        strokeWidth: 3,
        strokeOpacity: 0.9
    },
    hospital: {
        radius: 3,
        fillColor: '#FF0000', // 빨간색 (병원)
        fillOpacity: 0,
        strokeColor: '#8DF5A6',
        strokeWidth: 3,
        strokeOpacity: 0.9
    },
    community: {
        radius: 3,
        fillColor: '#0000FF', // 파란색 (커뮤니티 센터)
        fillOpacity: 0,
        strokeColor: '#70B1F5',
        strokeWidth: 3,
        strokeOpacity: 0.9
    }
};

// 추가할 GeoJSON 데이터
const pointSources = [
    { id: 'package', url: packageGeoJSON },
    { id: 'hospital', url: hospitalGeoJSON },
    { id: 'community', url: communityGeoJSON },
    { id: 'grocery', url: groceryGeoJSON }
];

detail_map.on('load', () => {
    detail_map.addSource('10mi', { type: 'geojson', data: r10miGeoJSON });
    detail_map.addLayer({
        id: '10mi-layer',
        type: 'fill',
        source: '10mi',
        paint: { 
            'fill-color': r10miStyle.fillColor, 
            'fill-opacity': r10miStyle.fillOpacity 
        }
    });
    detail_map.addLayer({
        id: '10mi-border',
        type: 'line',
        source: '10mi',
        paint: { 
            'line-color': r10miStyle.borderColor, 
            'line-width': r10miStyle.borderWidth, 
            'line-opacity': r10miStyle.borderOpacity,
            'line-dasharray': r10miStyle.dasharray
        }
    });

    detail_map.addSource('5mi', { type: 'geojson', data: r5miGeoJSON });
    detail_map.addLayer({
        id: '5mi-layer',
        type: 'fill',
        source: '5mi',
        paint: { 
            'fill-color': r5miStyle.fillColor, 
            'fill-opacity': r5miStyle.fillOpacity 
        }
    });
    detail_map.addLayer({
        id: '5mi-border',
        type: 'line',
        source: '5mi',
        paint: { 
            'line-color': r5miStyle.borderColor, 
            'line-width': r5miStyle.borderWidth, 
            'line-opacity': r5miStyle.borderOpacity,
            'line-dasharray': r5miStyle.dasharray
        }
    });

    detail_map.addSource('20mi', { type: 'geojson', data: r20miGeoJSON });
    detail_map.addLayer({
        id: '20mi-layer',
        type: 'fill',
        source: '20mi',
        paint: { 
            'fill-color': r20miStyle.fillColor, 
            'fill-opacity': r20miStyle.fillOpacity 
        }
    });
    detail_map.addLayer({
        id: '20mi-border',
        type: 'line',
        source: '20mi',
        paint: { 
            'line-color': r20miStyle.borderColor, 
            'line-width': r20miStyle.borderWidth, 
            'line-opacity': r20miStyle.borderOpacity,
            'line-dasharray':  r20miStyle.dasharray
        }
    });

    // Town Layer (Multipolygon)
    detail_map.addSource('town', { type: 'geojson', data: townGeoJSON });
    detail_map.addLayer({
        id: 'town-layer',
        type: 'fill',
        source: 'town',
        paint: { 
            'fill-color': townStyle.fillColor, 
            'fill-opacity': townStyle.fillOpacity 
        }
    });
    detail_map.addLayer({
        id: 'town-border',
        type: 'line',
        source: 'town',
        paint: { 
            'line-color': townStyle.borderColor, 
            'line-width': townStyle.borderWidth, 
            'line-opacity': townStyle.borderOpacity 
        }
    });

    // Line Layer
    detail_map.addSource('line', { type: 'geojson', data: lineGeoJSON });
    detail_map.addLayer({
        id: 'line-layer',
        type: 'line',
        source: 'line',
        paint: { 
            'line-color': lineStyle.color, 
            'line-width': lineStyle.width, 
            'line-opacity': lineStyle.opacity,
            'line-dasharray': lineStyle.dasharray // 점선 스타일 적용
        }
    });

    // Line Grocery Layer
    detail_map.addSource('line-grocery', { type: 'geojson', data: lineGroceryGeoJSON });
    detail_map.addLayer({
        id: 'line-grocery-layer',
        type: 'line',
        source: 'line-grocery',
        paint: { 
            'line-color': groceryLineStyle.color, 
            'line-width': groceryLineStyle.width, 
            'line-opacity': groceryLineStyle.opacity,
            'line-dasharray': lineStyle.dasharray // 점선 스타일 적용
        
        }
    });

   
    pointSources.forEach(source => {
        const style = pointStyles[source.id];

        detail_map.addSource(source.id, {
            type: 'geojson',
            data: source.url
        });

        detail_map.addLayer({
            id: `${source.id}-layer`,
            type: 'circle',
            source: source.id,
            paint: {
                'circle-radius': style.radius,
                'circle-color': style.fillColor,
                'circle-opacity': style.fillOpacity,
                'circle-stroke-color': style.strokeColor,
                'circle-stroke-width': style.strokeWidth,
                'circle-stroke-opacity': style.strokeOpacity
            }
        });
    });
    detail_map.addSource('p_5', { type: 'geojson', data: P_5miGeoJSON });
    detail_map.addLayer({
        id: 'point-labels',
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
        } 
    });

    detail_map.addSource('p_10', { type: 'geojson', data: P_10miGeoJSON });
    detail_map.addLayer({
        id: 'point-labels-10',
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
        } 
    });
    

    detail_map.addSource('p_20', { type: 'geojson', data: P_20miGeoJSON });
    detail_map.addLayer({
        id: 'point-labels-20',
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
        } 
    });
});