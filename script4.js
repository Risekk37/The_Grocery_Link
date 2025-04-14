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
    const mainMap = document.getElementById("Main_map");  // Main_map 요소
    const citiesMap = document.getElementById("Cities_map");  // Cities_map 요소
    const X = document.getElementById("X"); // X 버튼 요소 가져오기

    // Main 탭별 콘텐츠 설정
    const mainContentData = {
        "About": {
            name: "About",
            content: "Delivery services have",
            subButtons: ["Delivery", "Food", "Reference"],
            subContent: {
                "Delivery": "The COVID-19 ",
                "Food": "Limited access to supermarkets, ",
                "Reference": "Lorem Ipsum is simply dummy "
            }
        },
        "Suburbs": {
            name: "Suburbs",
            content: "In suburban areas, ",
            subButtons: ["S_Where", "S_Conditions", "Data"],
            subContent: {
                "S_Where": "Areas in food deserts that",
                "S_Conditions": "Areas experiencing ",
                "Data": "디테일 정보입니다."
            }
        },
        "Cities": {
            name: "Cities",
            content: "In urban areas, while grocery ",
            subButtons: ["C_Where", "C_Conditions", "Lorem"],
            subContent: {
                "C_Where": "Function and detail will be made.",
                "C_Conditions": "Zoom in to city plz.. this don't have function yet..",
                "Lorem": "nothing yet"
            }
        },
        "Beyond": {
            name: "Beyond",
            content: "Lorem Ipsum is simply dummy ",
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
                            

                            const layersToChange = ['delivery', 'food', 'demography'];
                            layersToChange.forEach(layer => {
                                Main_map.setPaintProperty(layer, 'fill-opacity', 0.07);
                            });
                        } else {
                            layercheck.style.display = "none";
                            
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
                        if (buttonText === "C_Where") {
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
                            // 각 요소 클릭 시 id를 통해 flyTo 수행
                            const usaAllCLayer = Cities_map.getLayer('Usa_All_C');
                            if (usaAllCLayer) {
                                usaAllCLayer.on('click', function (e) {
                                    // 클릭된 요소의 id를 추출 (예: id는 e.features[0].properties.id)
                                    const cityId = e.features[0].properties.id;

                                    // 해당 id에 맞는 좌표를 지정
                                    const cityCoordinates = {
                                        1: { lat: 32.697806, lng: -117.059776, zoom: 10 }, // Example: San Francisco
                                        2: { lat: 34.011951, lng: -118.167152, zoom: 10 },  // Example: New York
                                        3: { lat: 37.366144, lng: -121.959600, zoom: 10 }, // Example: Los Angeles
                                        4: { lat: 29.413558, lng: -98.502092, zoom: 10 },  // Example: Chicago
                                        5: { lat: 29.808382, lng: -95.447899, zoom: 10 },  // Example: Houston
                                        6: { lat: 32.808241, lng: -96.874070, zoom: 10 },   // Example: London
                                        7: { lat: 33.430145, lng: -112.020377, zoom: 10 },    // Example: Paris
                                        8: { lat: 39.805926, lng: -75.428836, zoom: 10 },   // Example: Berlin
                                        9: { lat: 40.634650, lng: -74.300181, zoom: 10 },  // Example: Tokyo
                                        10: { lat: 41.837555, lng: -87.833305, zoom: 10 }   // Example: Moscow
                                    };

                                    // 선택된 cityId에 맞는 경위도를 찾아 flyTo
                                    const { lat, lng, zoom } = cityCoordinates[cityId];

                                    // C_Conditions로 변경 후 flyTo 실행
                                    button.classList.remove("active");  // "C_Where"에서 "C_Conditions"로 변경
                                    const conditionsButton = document.querySelector('[data-button="C_Conditions"]');
                                    if (conditionsButton) {
                                        conditionsButton.classList.add("active");
                                    }

                                    Cities_map.flyTo({
                                        center: [lng, lat],
                                        zoom: zoom,
                                        speed: 0.5,  // Adjust the speed of the zoom animation
                                        curve: 1,    // Adjust the curve of the zoom animation
                                        easing: (t) => t, // Easing function for smooth zoom
                                    });
                                });
                            }
                        } else {}
                    
                        
                        if (buttonText === "C_Conditions") {
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
                        } else {}
                        
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
                    
                } else {
                    displayButton.style.display = "block";  // "View(Rural/City)" 클릭 시 Display_button 보이기
                    categoryContainer.style.display = "block"; 
                    layercheck.style.display = "blcok";
                    
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
                    mainMap.style.display = "block";
                    citiesMap.style.display = "none";
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
                    mainMap.style.display = "none";
                    citiesMap.style.display = "block";
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
X.addEventListener("click", function () {
    mainTabs[1].click(); // mainTabs[1]을 클릭
});
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
