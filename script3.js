Highcharts.chart('report', {
    chart: {
        type: 'venn'
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
                    mouseOver: function () {
                        // 빨간색 이외의 다른 영역에 호버하면 빨간색의 투명도를 0.1로 설정
                        if (this.name !== "빨강") {
                            const redPoint = this.series.data.find(point => point.name === "빨강");
                            if (redPoint) {
                                redPoint.graphic.attr({ opacity: 0.1 });
                            }
                        }

                        // 호버한 요소의 외곽선 변경
                        this.graphic.attr({
                            stroke: '#FFFFFF', // 외곽선 색을 흰색으로
                            'stroke-width': 1 // 외곽선 두께를 1로
                        });

                        // 호버 시 해당 영역의 투명도 0.5로 설정
                        if (this.name === "노랑") {
                            this.graphic.attr({ 
                                fill: "rgb(250,191,30,0.5)" // 노랑에 색상과 투명도 변경
                            });
                        } else if (this.name === "핑크") {
                            this.graphic.attr({ 
                                fill: "rgb(242,21,250,0.5)" // 핑크에 색상과 투명도 변경
                            });
                        } else if (this.name === "흰색") {
                            this.graphic.attr({ 
                                fill: "rgb(250,250,250,0.5)" // 흰색에 색상과 투명도 변경
                            });
                        } else {
                            this.graphic.attr({ opacity: 0.5 }); // 그 외의 영역은 투명도만 변경
                        }

                        // dataLabels 색상 변경
                        this.dataLabel.css({ color: '#FFFFFF' });
                        // dataLabels 투명도 명시적으로 설정하여 호버 시 변하지 않게 함
                        this.dataLabel.attr({ opacity: 1 });
                    },
                    mouseOut: function () {
                        // 빨간색은 opacity를 원래대로 복원
                        if (this.name === "빨강") {
                            this.graphic.attr({ opacity: 1 });
                        } else {
                            // 빨간색 이외의 다른 요소들은 다시 투명도를 0.1로 설정
                            const redPoint = this.series.data.find(point => point.name === "빨강");
                            if (redPoint) {
                                redPoint.graphic.attr({ opacity: 0.1 });
                            }
                        }
                        if (this.name === "노랑") {
                            this.graphic.attr({ 
                                fill: "rgb(250,191,30,0.1)" // 노랑 원래 색으로 복원
                            });
                        } else if (this.name === "핑크") {
                            this.graphic.attr({ 
                                fill: "rgb(242,21,250,0.1)" // 핑크 원래 색으로 복원
                            });
                        } else if (this.name === "흰색") {
                            this.graphic.attr({ 
                                fill: "rgb(250,250,250,0.3)" // 흰색 원래 색으로 복원
                            });
                        }
                        // 외곽선 제거
                        this.graphic.attr({
                            stroke: 'none',
                            'stroke-width': 0
                        });


                        // dataLabels 색상 원래 색으로 복원
                        this.dataLabel.css({ color: '#8f8f8f' });
                        this.dataLabel.css({ opacity: 0.9 });
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
                value: 20, 
                color: "rgb(250,191,30,0.1)", 
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
                value: 20, 
                color: "rgb(242,21,250,0.1)", 
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
                value: 20, 
                color: "rgb(250,250,250,0.3)", 
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
                value: 10, 
                color: "rgb(255,54,0,0.8)", 
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
            }
        ],
        borderColor: '#FFFFFF', // 선 색을 흰색으로 설정
        borderWidth: 1 // 선 두께를 1로 설정
    }]
});
