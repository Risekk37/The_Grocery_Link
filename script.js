mapboxgl.accessToken = 'pk.eyJ1Ijoia2l0Mzc3NSIsImEiOiJjbTNzNzZ2NWIwZTF6Mmlvb2Vpb3FkNDlsIn0.bl1LMgktKyBpPkfkFoFYWw';

//Main_map
const Main_map = new mapboxgl.Map({
    container: 'Main_map',
    style: 'mapbox://styles/kit3775/cm6vixkc7002q01qq66wggyxd',
    center: [-96.35, 38.50], 
    zoom: 3.95, 
    attributionControl: false
});


const layerSettings = {
    delivery: { color: '#001e24', opacity: 0.07, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.9,  outlineOffset:0 },
    demography: { color: '#03748a', opacity: 0.07, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.9,  outlineOffset:0 },
    food: { color: '#cd4e1c', opacity: 0.07, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.9,  outlineOffset:0 },
    deliveryfood: { color: '#FABF1D', opacity: 0, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.9,  outlineOffset:0 },
    fooddemography: { color: '#F215FA', opacity: 0, outlineColor: '#ffffff', outlineWidth: 0.15, outlineOpacity: 0.9,  outlineOffset:0 },
    pick_3: { color: '#ff3600', opacity: 0.5, outlineColor: '#ffffff', outlineWidth: 0.5, outlineOpacity: 1, outlineOffset: -0.5 },
    Usa_All_C: { color: '#ff3600', opacity: 0.5, outlineColor: '#ffffff', outlineWidth: 0.01, outlineOpacity: 0.9, outlineOffset: 0 }
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
            source: 'pick_3',
            paint: {
                'circle-radius': 10, // 클릭 가능한 영역을 두 배로 확대
                'circle-color': '#ff0000',
                'circle-opacity': 0
            }
        });
    });

    

    // Popup 요소 생성
const popup = new mapboxgl.Popup({ 
    closeOnClick: true,
    anchor: 'bottom' // 기본적으로 아래쪽에 표시되도록 설정
 });

const popupStyle = document.createElement("style");
popupStyle.innerHTML = `
    .mapboxgl-popup {
        z-index: 30; /* 모든 요소보다 위 */
    }
    .mapboxgl-popup-tip {
        color: rgba(0, 0, 0, 0.5) !important; /* 삼각형 꼬리의 배경을 팝업과 동일하게 설정 */
    }
    .mapboxgl-popup-close-button {
    color: white !important; /* X 버튼을 흰색으로 변경 */
    opacity: 1 !important; /* 투명도 제거 */
    font-weight: bold !important; /* 글씨 굵게 */
    }
`;
document.head.appendChild(popupStyle);

Main_map.on('click', 'pick_3_layer', function (e) {
    const props = e.features[0].properties;
    const idNumber = props.id_number;
    const imagePath = `satellite/satellite_${idNumber}.png`;
    
    // 텍스트 정보 구성
    const town = props.Town || "Unknown";
    const state = props.States || "Unknown";
    const zipcode = props.Zipcode || "Unknown";

       // 인종 및 빈곤율 데이터
       const raceData = [
        { label: "White", value: props["Ratio_White"] },
        { label: "Black", value: props["Ratio_Black and African"] },
        { label: "Other Race", value: props["Ratio_Other Race"] },
        { label: "Asian", value: props["Ratio_Asian"] },
        { label: "Native", value: props["Ratio_Indian and Alaska"] },
        { label: "Pacific Islander", value: props["Ratio_Hawaiian and Pacific"] }
    ];
    const poverty = { label: "- Poverty", value: props["Poverty_Last"] };

    // 가장 높은 race 값 찾기
    let maxRace = raceData.reduce((max, r) => {
        let val = parseFloat(r.value) || 0;
        return val > max.value ? { label: r.label, value: val } : max;
    }, { label: "", value: 0 });

    // 강조 색상 (변경 가능)
    const highlightColor = "#FAEB40";

    // Grid 스타일 테이블 생성
    let raceTable = `  
        <p style= "font-size: 10px; font-weight: bold; margin: 2px 0;">- Race Ratio</p>    
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; text-align: center; font-size: 8px; color: white;">
            ${raceData.map(r => `
                <div style="padding: 1px; ${r.label === maxRace.label ? `color: ${highlightColor}; font-weight: bold;` : ''}">
                    <div>${r.label}</div>
                    <div>${r.value ? parseFloat(r.value).toFixed(2) : "0"}%</div>
                </div>
            `).join("")}
        </div>
        <div style="margin-top: 10px; font-size: 10px;">
            <b>${poverty.label}:</b> ${poverty.value ? parseFloat(poverty.value).toFixed(2) : "0"}%
        </div>
    `;

    // 팝업 내용
    const popupContent = `
    <div style="position: relative; background: rgba(0, 0, 0, 0.7); color: white; padding: 10px; border-radius: 5px;">
        <div style="position: absolute; top: 10px; left: 10px; background: rgba(0, 0, 0, 0); padding: 3px 5px; border-radius: 3px;">
            <p style="font-size: 15px; margin: 0;"><b>${town}</b></p>
        </div>
        <img src="${imagePath}" alt="Satellite Image" style="width: 200px; height: auto; display: block; margin-bottom: 10px;">
        <div>
            <p style="font-size: 10px; font-weight: bold; margin: 2px 0;">- ${town}, ${state}, ${zipcode}</p>
            ${raceTable}
        </div>
    </div>
`;

    // 화면의 50%를 기준으로 팝업 위치 조정
    const windowHeight = window.innerHeight;
    const clickY = e.point.y;
    const anchorPosition = clickY < windowHeight / 2 ? 'top' : 'bottom';

    popup.options.anchor = anchorPosition; // 팝업이 클릭된 위치에 따라 위/아래 표시되도록 설정

    // 팝업 표시
    popup.setLngLat(e.lngLat)
        .setHTML(popupContent)
        .addTo(Main_map);
});

// 마우스 오버 효과 (선택 시 강조)
Main_map.on('mouseenter', 'pick_3_layer', function () {
    Main_map.getCanvas().style.cursor = 'pointer';
});

Main_map.on('mouseleave', 'pick_3_layer', function () {
    Main_map.getCanvas().style.cursor = '';
});
 
// 텍스트 및 원 추가
const labels = [
    { text: 'Undelivered Zone', layer: 'delivery' },
    { text: '', layer: 'deliveryfood' },  // 첫 번째 점 (delivery와 food 사이)
    { text: 'Food Desert', layer: 'food' },
    { text: '', layer: 'fooddemography' },  // 두 번째 점 (food와 demography 사이)
    { text: '1K Population', layer: 'demography' }
];

const mapContainer = document.getElementById('Main_map');
const labelContainer = document.createElement('div');
labelContainer.id = 'labelContainer';  // id 추가
labelContainer.style.position = 'absolute';
labelContainer.style.top = '10vh';
labelContainer.style.left = '55vw';
labelContainer.style.display = 'none';
labelContainer.style.gridTemplateColumns = 'repeat(5, 1fr)'; // 5개의 요소를 균등 배치
labelContainer.style.gridGap = '0px'; // 점들 간격
labelContainer.style.pointerEvents = 'none';
mapContainer.appendChild(labelContainer);

// 수평선 추가
const horizontalLine = document.createElement('div');
horizontalLine.style.position = 'absolute';
horizontalLine.style.top = '45px'; // 점들 바로 아래에 위치하도록 설정
horizontalLine.style.left = '0'; // 왼쪽에서 시작
horizontalLine.style.width = '80%'; // 전체 너비
horizontalLine.style.height = '1px';
horizontalLine.style.backgroundColor = '#BFBFBF'; // 색상 (검정색)

labelContainer.appendChild(horizontalLine);

labels.forEach((item) => {
    const label = document.createElement('div');
    label.style.position = 'relative';
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.pointerEvents = 'auto';
    label.dataset.layer = item.layer;

    const circle = document.createElement('div');
    circle.style.width = '10px';
    circle.style.height = '10px';
    circle.style.borderRadius = '50%';
    circle.style.backgroundColor = layerSettings[item.layer] ? layerSettings[item.layer].color : '#000'; // 기본값으로 색상 지정
    circle.style.marginRight = '-16px'; // 기존 10px에서 20px 추가
    circle.style.marginTop = '40px'; // y축 20px 이동
    circle.style.zIndex = '4';
    circle.dataset.layer = item.layer;
    

    // 텍스트가 있는 경우 텍스트 추가
    if (item.text) {
        const text = document.createElement('span');
        text.textContent = item.text;
        text.style.color = '#3b3b3b';
        text.style.fontSize = '10px';
        text.style.transformOrigin = 'left center'; // 왼쪽 끝을 기준으로 회전
        text.style.transform = 'rotate(-30deg)'; // 텍스트만 회전
        text.dataset.layer = item.layer;
        text.style.position = 'relative';

        // 선 추가 (밑줄처럼 점에서 글자 끝까지)
        const underline = document.createElement('div');
        underline.style.position = 'absolute';
        underline.style.top = '100%';
        underline.style.left = '0px'; // 점에서 선 시작
        underline.style.width = 'calc(100% + 10px)'; // 글자 길이 + 추가 부분
        underline.style.height = '1px';
        underline.style.backgroundColor = '#BFBFBF';
        

        // 세로 선 (점에서 밑줄로 연결)
        const verticalLine = document.createElement('div');
        verticalLine.style.position = 'absolute';
        verticalLine.style.width = '1px';
        verticalLine.style.height = '10px'; // 점에서 밑줄까지 거리
        verticalLine.style.backgroundColor = '#BFBFBF';
        verticalLine.style.left = '0px'; // 점의 중앙 정렬
        verticalLine.style.top = '20px'; // 점 바로 위에서 시작
        verticalLine.style.zIndex = '0'; // 선분의 z-index를 낮게 설정

        text.appendChild(underline);
        text.appendChild(verticalLine);
        label.appendChild(circle);
        label.appendChild(text);
    } else {
        // 텍스트가 없으면 점만 추가
        label.appendChild(circle);
    }

    // 텍스트가 없는 점들만 왼쪽으로 정렬
    if (!item.text) {
        label.style.justifySelf = 'start'; // 왼쪽으로 정렬
    }

    labelContainer.appendChild(label);
});




// Hover 효과 적용 (개별 label에 이벤트 추가)
labels.forEach((item) => {
    const label = labelContainer.querySelector(`[data-layer="${item.layer}"]`);

    label.addEventListener('mouseover', () => {
        Main_map.setPaintProperty(item.layer, 'fill-opacity', 0.4);
    });

    label.addEventListener('mouseleave', () => {
        Main_map.setPaintProperty(item.layer, 'fill-opacity', layerSettings[item.layer].opacity);
    });
});
document.getElementById('undelivery-zone').addEventListener('change', function() {
    if (this.checked) {
        Main_map.setPaintProperty('delivery', 'fill-opacity', 0.4); // "delivery" 레이어의 opacity를 0.4로 변경
    } else {
        Main_map.setPaintProperty('delivery', 'fill-opacity', layerSettings.delivery.opacity); // 체크 해제 시 원래 값으로
    }
});

document.getElementById('food-desert').addEventListener('change', function() {
    if (this.checked) {
        Main_map.setPaintProperty('food', 'fill-opacity', 0.4); // "food" 레이어의 opacity를 0.4로 변경
    } else {
        Main_map.setPaintProperty('food', 'fill-opacity', layerSettings.food.opacity); // 체크 해제 시 원래 값으로
    }
});

document.getElementById('1k-population').addEventListener('change', function() {
    if (this.checked) {
        Main_map.setPaintProperty('demography', 'fill-opacity', 0.4); // "demography" 레이어의 opacity를 0.4로 변경
    } else {
        Main_map.setPaintProperty('demography', 'fill-opacity', layerSettings.demography.opacity); // 체크 해제 시 원래 값으로
    }
});
    });


    document.addEventListener("DOMContentLoaded", function () {
        // Main 탭과 Sidebar 요소 가져오기
        const mainTabs = document.querySelectorAll(".Main_tab");
        const sidebarName = document.querySelector(".Sidebar_Name");
        const sidebarMainContent = document.querySelector(".Sidebar_Main_Content");
        const subButtonsContainer = document.getElementById("sidebar-sub-content");
        const subButtons = document.querySelectorAll(".sub-button");
        const subContent = document.querySelector(".sub-content");
        const displayButton = document.getElementById("Display_button");
        const iframecontainer = document.getElementById("iframeContainer");
        const sidebar = document.getElementById("sidebar"); // sidebar 요소 가져오기
        const fooddesert = document.getElementById("Food_desert");
        const layercheck = document.getElementById("layercheckboxcontainer");
        
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
            "Suburbs": {
                name: "Suburbs",
                content: "In suburban areas, infrastructure is often lacking compared to cities due to the smaller population density. This issue is particularly evident in the case of grocery markets, which are essential for daily life but may not be easily accessible in many locations. In some areas, the absence of grocery delivery services further exacerbates the problem, significantly impacting residents' quality of life. \n Various factors interact in complex ways, contributing to accessibility challenges.\nThis chapter explores problematic areas with a focus on undelivery zones and food deserts, examining the specific conditions that define them and their impact on local communities.",
                subButtons: ["S_Where", "S_Conditions", "Data"],
                subContent: {
                    "S_Where": "Areas in food deserts that are far from grocery markets are more likely to be solved through delivery services, but not all regions are able to take advantage of this. The overlap between undelivery zones and food deserts currently highlights areas with very limited access to fresh food. Among these, regions with a population above a certain threshold still lack the necessary infrastructure, despite its potential to be developed. \nThere are more than 100 such towns across the United States. While the number of affected areas varies depending on population size, if population is not considered, it is expected that many more regions are impacted.",
                    "S_Conditions": "Areas experiencing difficulties in accessing grocery stores are influenced by a combination of various conditions. Generally, these areas are closely related to factors such as their connectivity to other residential areas and the level of development in the region.",
                    "Data": "디테일 정보입니다."
                }
            },
            "Cities": {
                name: "Cities",
                content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                subButtons: ["C_Where", "C_Conditions", "Lorem"],
                subContent: {
                    "C_Where": "인터넷 서비스 정보입니다.",
                    "C_Conditions": "교통 서비스 정보입니다.",
                    "Lorem": "의료 서비스 정보입니다."
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
                            if (buttonText === "S_Conditions" | buttonText ==="S_Where") {
                                displayButton.style.display = "block";  // "Conditions"일 때만 보이게 설정
                                categoryContainer.style.display = "block";
                            } else {
                                displayButton.style.display = "none";  // "Conditions"이 아닌 경우 숨기기
                                categoryContainer.style.display = "none";
                            }

                            if (buttonText === "S_Conditions") {
                                categoryContainer.style.display = "block";
                                 // 🔹 opacity 변경 기능 추가
                                const layersToChange = ['delivery', 'food', 'demography'];
                                layersToChange.forEach(layer => {
                                    Main_map.setPaintProperty(layer, 'fill-opacity', 0.03);
                                });
                            } else {
                                categoryContainer.style.display = "none";
                            }

                            if (buttonText === "S_Where") {
                                layercheck.style.display = "block";
                                labelContainer.style.display = "grid";

                                const layersToChange = ['delivery', 'food', 'demography'];
                                layersToChange.forEach(layer => {
                                    Main_map.setPaintProperty(layer, 'fill-opacity', 0.07);
                                });
                            } else {
                                layercheck.style.display = "none";
                                labelContainer.style.display = "none";
                            }

                            if (buttonText === "Delivery") {
                                iframecontainer.style.display = "block";  // "Rural"일 때만 보이게 설정
                            } else {
                                iframecontainer.style.display = "none";  // "Rural"이 아닌 경우 숨기기
                            }
                            
                            if (buttonText === "Food") {
                                fooddesert.style.display = "block";  // "Rural"일 때만 보이게 설정
                            } else {
                                fooddesert.style.display = "none";  // "Rural"이 아닌 경우 숨기기
                            }
                            
                        });
                    });
    
                    // 기본 sub-content 설정
                    subContent.textContent = data.subContent[data.subButtons[0]];
                    // 첫 번째 서브 버튼에 active 클래스 추가
                    subButtonsContainer.firstChild.classList.add("active");
                    // Main_tab 클릭 시 displayButton 숨기기
                    if (selectedTab !== "Suburbs") {
                        displayButton.style.display = "none";  // Main_tab을 클릭하면 숨기기
                        categoryContainer.style.display = "none"; 
                        layercheck.style.display = "none";
                        labelContainer.style.display = "none";
                    } else {
                        displayButton.style.display = "block";  // "View(Rural/City)" 클릭 시 Display_button 보이기
                        categoryContainer.style.display = "block"; 
                        layercheck.style.display = "blcok";
                        labelContainer.style.display = "grid";
                    }
                    if (selectedTab!== "About") {
                        iframecontainer.style.display = "none";  // Main_tab을 클릭하면 숨기기
                    } else {
                        iframecontainer.style.display = "block"; // "View(Rural/City)" 클릭 시 Display_button 보이기
                    }
                    if (selectedTab) {
                        categoryContainer.style.display = "none"; 
                        fooddesert.style.display = "none"; 
                    } else {
                        categoryContainer.style.display = "block"; 
                    }
                    if (selectedTab =="Suburbs") {
                        layercheck.style.display = "block"; 
                         // 🔹 opacity 변경 기능 추가
                         const layersToChange = ['delivery', 'food', 'demography', 'pick_3'];
                         layersToChange.forEach(layer => {
                             Main_map.setPaintProperty(layer, 'fill-opacity', layerSettings[layer].opacity );
                             Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', layerSettings[layer].outlineOpacity);
                            });
                    } else {
                        layercheck.style.display = "none";
                    }
                    if (selectedTab =="Cities") {
                         // 🔹 opacity 변경 기능 추가
                         const layersToChange = ['delivery', 'food', 'demography', 'pick_3'];
                         layersToChange.forEach(layer => {
                             Main_map.setPaintProperty(layer, 'fill-opacity', 0);
                             Main_map.setPaintProperty(`${layer}-outline`, 'line-opacity', 0);
                         });
                        
                    } else {
    
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
            Main_map.setFilter("pick_3", null);
        } else {
            // 선택된 모든 카테고리 값이 1인 폴리곤만 표시
            const filter = ["all"];
            selectedCategories.forEach(category => {
                filter.push(["==", ["get", category], 1]);
            });

            Main_map.setFilter("pick_3", filter);
        }
    }
});
// imageGrid 설정
const imageGrid = document.getElementById("imageGrid");
const totalImages = 129;
const excludeImages = [1, 4, 93]; // 제외할 이미지 목록

// 'pick_3.geojson' 데이터를 불러와서 체크박스에 맞는 이미지 필터링
function loadImagesByCategory() {
    // 체크된 카테고리를 확인
    const selectedCategories = Array.from(document.querySelectorAll("#categoryContainer input[type='checkbox']:checked"))
        .map(checkbox => checkbox.value);
    
    // imageGrid 초기화 (이전에 표시된 이미지 삭제)
    imageGrid.innerHTML = '';

    // 'pick_3.geojson' 데이터 불러오기
    fetch('Prototype/pick_3.geojson')
        .then(response => response.json())
        .then(data => {
            if (selectedCategories.length === 0) {
                // 체크박스가 아무것도 선택되지 않았을 때, 모든 이미지 표시
                data.features.forEach(feature => {
                    const idNumber = feature.properties.id_number;
                    if (!excludeImages.includes(idNumber)) {
                        const imgElement = document.createElement("img");
                        imgElement.src = `satellite/satellite_${idNumber}.png`; // id_number에 맞는 이미지 불러오기
                        imgElement.alt = `Image ${idNumber}`;
                        imageGrid.appendChild(imgElement);
                    }
                });
            } else {
                // 선택된 모든 카테고리 값이 1인 폴리곤만 표시
                data.features.forEach(feature => {
                    const idNumber = feature.properties.id_number;
                    let showImage = true;
                    
                    // 모든 선택된 카테고리가 1이어야만 해당 폴리곤을 표시
                    selectedCategories.forEach(category => {
                        if (feature.properties[category] !== 1) {
                            showImage = false; // 하나라도 값이 1이 아니면 표시하지 않음
                        }
                    });

                    // 모든 카테고리 값이 1이면 이미지 표시
                    if (showImage && !excludeImages.includes(idNumber)) {
                        const imgElement = document.createElement("img");
                        imgElement.src = `satellite/satellite_${idNumber}.png`; // id_number에 맞는 이미지 불러오기
                        imgElement.alt = `Image ${idNumber}`;
                        imageGrid.appendChild(imgElement);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error loading pick_3.geojson:', error);
        });
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
  } else {
    imageGridContainer.style.visibility = 'hidden';  // 숨기기 설정
    imageGridContainer.style.opacity = 0;  // 투명하게 설정
  }
});

