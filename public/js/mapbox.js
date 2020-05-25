export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiamFkZWhlbmRyaWNrcyIsImEiOiJja2FtazUzcGowMWpoMnNwNDV5eGF0eHUxIn0.a5_20XHj4knNk0zbzGjoaw';

  const map = new mapboxgl.Map({
    container: 'map', //will put the container on a elements with the ID of map
    style: 'mapbox://styles/jadehendricks/ckamk8osv4ve01iqt4d1drl3t',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // interactive: false
  });

  //this bounds is the area that will be displayed on the map
  //so we will extend that will all the locations that we have in our tour array of locations
  const bounds = new mapboxgl.LngLatBounds();

  // 1) loop through all the locations and add a marker for each of them
  locations.forEach((loc) => {
    //Create a marker
    const el = document.createElement('div');
    el.className = 'marker';
    //Add the marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom', //the bottom of the pin will be exactly on that gps location
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Add a popup
    new mapboxgl.Popup({
      offset: 40,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //extend th emap bound to include the current locations
    bounds.extend(loc.coordinates);
  });

  //now we need to make sure that the map fits the bounds
  map.fitBounds(bounds, {
    padding: {
      top: 200, //extra padding because of the design
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
