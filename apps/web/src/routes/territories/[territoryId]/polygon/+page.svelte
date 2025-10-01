<script lang="ts">
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import MapboxDraw from '@mapbox/mapbox-gl-draw';
	import mapboxgl from 'mapbox-gl';
	import { centroid } from '@turf/centroid';

	import 'mapbox-gl/dist/mapbox-gl.css';
	import { PUBLIC_MAPBOX_KEY } from '$env/static/public';
	import { page } from '$app/state';

	let { data }: PageProps = $props();

	let mapRef: HTMLDivElement;
	let map = $state<mapboxgl.Map>();
	let draw = $state<MapboxDraw>();

	onMount(() => {
		mapboxgl.accessToken = PUBLIC_MAPBOX_KEY;

		map = new mapboxgl.Map({
			container: mapRef,
			style: 'mapbox://styles/mapbox/satellite-streets-v12',
			center: [-98.5795, 39.8283],
			zoom: 5
		});

		draw = new MapboxDraw({
			displayControlsDefault: false,
			defaultMode: 'draw_polygon'
		});

		map.addControl(draw);

		map.on('load', () => {
			if (!draw || !data.territories) return;

			const editingTerritory = data.territories.find(
				(t) => t.id === parseInt(page.params.territoryId)
			);

			if (!editingTerritory?.polygon?.features) return;

			const editCenteroid = centroid(editingTerritory.polygon!);
			const editCenterCoords = editCenteroid.geometry.coordinates;

			map?.panTo(editCenterCoords);

			draw.add({
				type: 'Feature',
				id: editingTerritory.id,
				properties: {},
				geometry: {
					type: 'Polygon',
					coordinates: editingTerritory.polygon.features[0]?.geometry.coordinates
				}
			});

			data.territories.forEach((territory) => {
				if (!map || territory.id === editingTerritory.id || !territory?.polygon?.features) return;

				map.addSource(territory.name, {
					type: 'geojson',
					data: {
						type: 'Feature',
						geometry: {
							type: 'Polygon',
							coordinates: territory.polygon.features[0]?.geometry.coordinates
						}
					}
				});

				map.addLayer({
					id: territory.name,
					type: 'fill',
					source: territory.name,
					layout: {},
					paint: {
						'fill-color': '#cc80ff',
						'fill-opacity': 0.5
					}
				});
			});
		});
	});
</script>

<div class="relative h-full w-full">
	<div bind:this={mapRef} class="h-[700px] w-[700px]"></div>
</div>
