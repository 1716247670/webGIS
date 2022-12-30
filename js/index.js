require([
	'esri/Map',
	'esri/WebScene',
	'esri/layers/GeoJSONLayer',
	'esri/views/SceneView',
	'esri/views/MapView',
	'esri/widgets/Legend',
	'esri/widgets/BasemapToggle',
	'esri/widgets/Sketch',
	'esri/layers/GraphicsLayer',
], function (
	Map,
	WebScene,
	GeoJSONLayer,
	SceneView,
	MapView,
	Legend,
	BasemapToggle,
	Sketch,
	GraphicsLayer
) {
	const echartPanel = document.getElementsByClassName('chartPanel')[0];
	const switchButton = document.getElementById('switch-btn');
	const listNode = document.getElementById('nyc_graphics');
	const popupTemplate = {
		// autocasts as new PopupTemplate()
		title: '{地名}',
		content: [
			{
				type: 'fields',
				fieldInfos: [
					{
						fieldName: '男',
						label: '男性人口',
						format: {
							places: 0,
							digitSeparator: true,
						},
					},
					{
						fieldName: '女',
						label: '女性人口',
						format: {
							places: 0,
							digitSeparator: true,
						},
					},
					{
						fieldName: '城镇人口',
						label: '城镇人口',
						format: {
							places: 0,
							digitSeparator: true,
						},
					},
					{
						fieldName: '乡村人口',
						label: '乡村人口',
						format: {
							places: 0,
							digitSeparator: true,
						},
					},
					{
						fieldName: '人口数',
						label: '总人口数',
						format: {
							places: 0,
							digitSeparator: true,
						},
					},
					{
						fieldName: '户规模',
						label: '户规模',
						format: {
							places: 0,
							digitSeparator: true,
						},
					},
					{
						fieldName: '一代户',
						label: '一代户',
						format: {
							places: 0,
							digitSeparator: true,
						},
					},
					{
						fieldName: '二代户',
						label: '二代户',
						format: {
							places: 0,
							digitSeparator: true,
						},
					},
					{
						fieldName: '三代户',
						label: '三代户',
						format: {
							places: 0,
							digitSeparator: true,
						},
					},
					{
						fieldName: '四代以上户',
						label: '四代以上户',
						format: {
							places: 0,
							digitSeparator: true,
						},
					},
				],
			},
		],
	};
	const appConfig = {
		mapView: null,
		sceneView: null,
		activeView: null,
		container: 'viewDiv', // use same container for views
	};
	const initialViewParams = {
		center: [100, 32],
		zoom: 4,
		container: appConfig.container,
		padding: {
			right: 300,
		},
	};
	const url =
		'https://1716247670.github.io/webGISData/%E4%BA%BA%E5%8F%A3%E5%9F%BA%E6%9C%AC%E6%83%85%E5%86%B5.json';

	const geojsonLayer = new GeoJSONLayer({
		url: url,
		title: '全国人口基本情况',
		outFields: ['地名', '人口数'],
		popupTemplate: popupTemplate,
	});
	const colors = ['#ffefdc', '#edac90', '#da6843', '#a03523', '#660202'];

	const renderer2D = {
		type: 'class-breaks',
		field: '人口数',
		defaultSymbol: {
			type: 'simple-fill',
			color: '#fff',
			outline: {
				width: 0.2,
				color: [0, 0, 0, 0.3],
			},
		},
		classBreakInfos: [
			{
				minValue: 0,
				maxValue: 1500000,
				symbol: {
					type: 'simple-fill',
					color: colors[0],
					outline: {
						width: 0.2,
						color: [0, 0, 0, 0.3],
					},
				},
				label: '<150万',
			},
			{
				minValue: 1500000,
				maxValue: 4000000,
				symbol: {
					type: 'simple-fill',
					color: colors[1],
					outline: {
						width: 0.2,
						color: [0, 0, 0, 0.3],
					},
				},
				label: '150万-400万',
			},
			{
				minValue: 4000000,
				maxValue: 7000000,
				symbol: {
					type: 'simple-fill',
					color: colors[2],
					outline: {
						width: 0.2,
						color: [0, 0, 0, 0.3],
					},
				},
				label: '400万-700万',
			},
			{
				minValue: 7000000,
				maxValue: 15000000,
				symbol: {
					type: 'simple-fill',
					color: colors[3],
					outline: {
						width: 0.2,
						color: [0, 0, 0, 0.3],
					},
				},
				label: '700万-1500万',
			},
			{
				minValue: 15000000,
				maxValue: 30000000,
				symbol: {
					type: 'simple-fill',
					color: colors[4],
					outline: {
						width: 0.2,
						color: [0, 0, 0, 0.3],
					},
				},
				label: '1500万-3000万',
			},
		],
		defaultLabel: 'No Data', // legend label for features that don't match a class break
	};

	const renderer3D = {
		type: 'simple', // autocasts as new SimpleRenderer()
		symbol: {
			type: 'polygon-3d', // autocasts as new PolygonSymbol3D()
			symbolLayers: [{ type: 'extrude' }], // autocasts as new ExtrudeSymbol3DLayer()
		},
		label: '城镇人口数所占百分比',
		visualVariables: [
			{
				type: 'size', // indicates this is a size visual variable
				field: '城镇人口', // total population in poverty
				normalizationField: '人口数', // total population
				stops: [
					{
						value: 0.3, // features where < 10% of the pop in poverty
						size: 10000, // will be extruded by this height in meters
					},
					{
						value: 0.8, // features where > 50% of the pop in poverty
						size: 500000, // will be extruded by this height in meters
					},
				],
			},
			{
				type: 'color',
				field: '城镇人口',
				normalizationField: '人口数',
				stops: [
					{
						value: 0.3,
						color: colors[0],
					},
					{
						value: 0.8,
						color: colors[4],
					},
				],
			},
		],
	};

	// Add sketch widget

	const map = new Map({
		basemap: 'gray',
		layers: [geojsonLayer],
	});
	geojsonLayer.renderer = renderer2D;

	const graphicsLayerSketch = new GraphicsLayer();
	map.add(graphicsLayerSketch);

	// create 2D view and and set active
	appConfig.mapView = createView(initialViewParams, '2d');
	appConfig.mapView.map = map;
	appConfig.activeView = appConfig.mapView;

	// create 3D view, won't initialize until container is set
	initialViewParams.container = null;
	initialViewParams.map = map;
	appConfig.sceneView = createView(initialViewParams, '3d');

	let graphics;

	appConfig.activeView.whenLayerView(geojsonLayer).then(function (layerView) {
		layerView.watch('updating', function (value) {
			if (!value) {
				// wait for the layer view to finish updating

				// query all the features available for drawing.
				layerView
					.queryFeatures({
						geometry: appConfig.activeView.extent,
						returnGeometry: true,
						orderByFields: ['OBJECTID'],
					})
					.then(function (results) {
						graphics = results.features;

						const fragment = document.createDocumentFragment();

						graphics.forEach(function (result, index) {
							const attributes = result.attributes;
							const name = attributes['地名'];

							// Create a list zip codes in NY
							const li = document.createElement('li');
							li.classList.add('panel-result');
							li.tabIndex = 0;
							li.setAttribute('data-result-id', index);
							li.textContent = name;

							fragment.appendChild(li);
						});
						// Empty the current list
						listNode.innerHTML = '';
						listNode.appendChild(fragment);
					})
					.catch(function (error) {
						console.error('query failed: ', error);
					});
			}
		});
	});

	switchButton.addEventListener('click', () => {
		switchView();
	});
	// listen to click event on the zip code list
	listNode.addEventListener('click', onListClickHandler);
	const basemapToggle = new BasemapToggle({
		view: appConfig.mapView,
		nextBasemap: 'dark-gray',
	});
	appConfig.mapView.ui.add(basemapToggle, 'bottom-right');
	appConfig.mapView.ui.add(new Legend({ view: appConfig.mapView }), 'bottom-left');
	appConfig.sceneView.ui.add(new Legend({ view: appConfig.sceneView }), 'bottom-left');
	const sketch = new Sketch({
		layer: graphicsLayerSketch,
		view: appConfig.mapView,
		creationMode: 'update', // Auto-select
	});

	appConfig.mapView.ui.add(sketch, 'top-right');
	// Add sketch events to listen for and execute query
	sketch.on('update', event => {
		// Create
		if (event.state === 'start') {
			queryFeaturelayer(event.graphics[0].geometry);
		}
		if (event.state === 'complete') {
			graphicsLayerSketch.remove(event.graphics[0]); // Clear the graphic when a user clicks off of it or sketches new one
            echartPanel.style.visibility = 'hidden';
            appConfig.mapView.graphics.removeAll();
		}
		// Change
		if (
			event.toolEventInfo &&
			(event.toolEventInfo.type === 'scale-stop' ||
				event.toolEventInfo.type === 'reshape-stop' ||
				event.toolEventInfo.type === 'move-stop')
		) {
			queryFeaturelayer(event.graphics[0].geometry);
		}
	});
	// Switches the view from 2D to 3D and vice versa
	function switchView() {
		const is3D = appConfig.activeView.type === '3d';
		const activeViewpoint = appConfig.activeView.viewpoint.clone();

		// remove the reference to the container for the previous view
		appConfig.activeView.container = null;

		if (is3D) {
			// if the input view is a SceneView, set the viewpoint on the
			// mapView instance. Set the container on the mapView and flag
			// it as the active view
			appConfig.mapView.viewpoint = activeViewpoint;
			appConfig.mapView.container = appConfig.container;
			appConfig.activeView = appConfig.mapView;
			appConfig.mapView.map.layers.items[0].renderer = renderer2D;
			switchButton.value = '3D';
		} else {
			appConfig.sceneView.viewpoint = activeViewpoint;
			appConfig.sceneView.container = appConfig.container;
			appConfig.activeView = appConfig.sceneView;
			appConfig.sceneView.map.layers.items[0].renderer = renderer3D;

			switchButton.value = '2D';
		}
	}
	// convenience function for creating either a 2D or 3D view dependant on the type parameter
	function createView(params, type) {
		let view;
		if (type === '2d') {
			view = new MapView(params);
			return view;
		} else {
			view = new SceneView(params);
		}
		return view;
	}
	function onListClickHandler(event) {
		const target = event.target;
		const resultId = target.getAttribute('data-result-id');

		// get the graphic corresponding to the clicked zip code
		const result = resultId && graphics && graphics[parseInt(resultId, 10)];
		if (result) {
			// open the popup at the centroid of zip code polygon
			// and set the popup's features which will populate popup content and title.

			appConfig.activeView
				.goTo(result.geometry.extent.expand(2))
				.then(function () {
					appConfig.activeView.popup.open({
						features: [result],
						location: result.geometry.centroid,
					});
				})
				.catch(function (error) {
					if (error.name != 'AbortError') {
						console.error(error);
					}
				});
		}
	}
	function queryFeaturelayer(geometry) {
		const parcelQuery = {
			spatialRelationship: 'intersects', // Relationship operation to apply
			geometry: geometry, // The sketch feature geometry
			outFields: ['*'], // Attributes to return
			returnGeometry: true,
		};

		geojsonLayer
			.queryFeatures(parcelQuery)
			.then(results => {
				const length = results.features.length;
				if (length > 0) {
					echartPanel.style.visibility = 'visible';
					sum = sumData(results.features);
					console.log(sum);
					createChart(sum);
				}
				displayResults(results);
			})
			.catch(error => {
				console.log(error);
			});
	}
	function sumData(features) {
		let male = 0;
		let female = 0;
		let urban = 0;
		let village = 0;
		let city = 0;
		for (let i = 0; i < features.length; i++) {
			const attributes = features[i].attributes;
			male += attributes['男'];
			female += attributes['女'];
			urban += attributes['城镇人口'];
			village += attributes['乡村人口'];
			city += attributes['城区人口'];
		}
		data = [male, female, urban, village, city];
		console.log(data);
		return data;
	}
	// Show features (graphics)
	function displayResults(results) {
		// Create a blue polygon
		const symbol = {
			type: 'simple-fill',
			color: [20, 130, 200, 0.5],
			outline: {
				color: 'white',
				width: 0.5,
			},
		};
		// Set symbol and popup
		results.features.map(feature => {
			feature.symbol = symbol;
			return feature;
		});

		// Clear display
		appConfig.mapView.graphics.removeAll();
		// Add features to graphics layer
		appConfig.mapView.graphics.addMany(results.features);
	}
    //创建图表
	function createChart(data) {
		var chart = echarts.init(document.getElementById('echartDiv'));
		var option = {
            title: {
                x:'center',
                text: '人口分布情况图'
            },
			xAxis: {
				type: 'category',
				data: ['男性人口', '女性人口', '城镇人口', '乡村人口', '城区人口'],
                axisLabel:{
                    interval:0
                }
			},
			yAxis: {
				type: 'value',
                axisLabel:{
                    formatter:function (value) {
                        // 格式化成月/日，只在第一个刻度显示年份
                        value = value / 1000000
                        text = value + '百万'
                        return text
                    }
                }
			},
            grid: {
                left: "15%",
                top:"15%"
              },
            tooltip:{
                trigger:'axis',
                axisPointer:{
                    type:'shadow'
                }
            },
			series: [
				{
					name: '人口数',
					type: 'bar',
					data: data,
				},
			],
		};
		chart.setOption(option);
	}
});
