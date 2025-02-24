mapboxgl.accessToken = 'pk.eyJ1Ijoia2l0Mzc3NSIsImEiOiJjbTNzNzZ2NWIwZTF6Mmlvb2Vpb3FkNDlsIn0.bl1LMgktKyBpPkfkFoFYWw';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/kit3775/cm7alf2vv004501s6gs2y0226',
    center: [-84.25625610614946,41.10767276284872],
    zoom: 12
});

map.on('load', () => {
    map.addSource('town', {
        type: 'geojson',
        data: 'Proto_test/town.geojson'
    });
    map.addLayer({
        id: 'town-fill',
        type: 'fill',
        source: 'town',
        paint: {
            'fill-color': '#ff0000',
            'fill-opacity': 0.1
        }
    });
    map.addLayer({
        id: 'town-outline',
        type: 'line',
        source: 'town',
        paint: {
            'line-color': '#000000',
            'line-opacity': 0,
            'line-width': 2
        }
    });

    const layersConfig = {
        'community_Center': { fill: '#007cbf', outline: '#007cbf' },
        'Grocery': { fill: '#28a745', outline: '#28a745' },
        'Hospital': { fill: '#dc3545', outline: '#dc3545' },
        'Package': { fill: '#ffc107', outline: '#ffc107' }
    };

    Object.keys(layersConfig).forEach(layer => {
        map.addSource(layer, {
            type: 'geojson',
            data: `Proto_test/${layer}.geojson`
        });

        map.addLayer({
            id: `${layer}-circle-fill`,
            type: 'circle',
            source: layer,
            paint: {
                'circle-radius': 5,
                'circle-color': layersConfig[layer].fill,
                'circle-opacity': 1
            }
        });

        map.addLayer({
            id: `${layer}-circle-outline`,
            type: 'circle',
            source: layer,
            paint: {
                'circle-radius': 10,
                'circle-opacity': 0,
                'circle-stroke-width': 2,
                'circle-stroke-color': layersConfig[layer].outline,
                'circle-stroke-opacity': 0.9
            }
        });
    });
    });    

