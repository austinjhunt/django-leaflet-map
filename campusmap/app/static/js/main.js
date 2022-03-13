// global

// layer group to contain the active feature collection (user-chosen layer)
let featureCollectionLayerGroup;

// layer group to contain the active style (tile layer)
let tileLayerGroup;

let map;
let defaultNavbarBrandText = "CofC Map";
let navbarBrand = document.querySelector(".navbar-brand");
let defaultCofCMarkerIcon = L.icon({
  iconUrl: "/static/images/map-icon-cofc.png",
  iconSize: [50, 50],
});
let defaultCofCMarkerIconAltText = "Cougar Clyde Icon";
let accessToken;
let center;
let zoom;
let activeStyleID;

let initMapboxConfig = () => {
  fetch("/api/mapbox/access")
    .then((response) => response.json())
    .then((data) => {
      // data contains config for communicating with mapbox
      accessToken = data.accessToken;
      zoom = data.zoom;
      center = data.center;
    })
    .then(() => {
      // config for mapbox now in place; so set up mapbox :)
      // initialize the map
      try {
        map = L.map("map", {
          /* add tap: false to fix mobile popup disappearance issue, 
                documented here: // https://stackoverflow.com/questions/67406533/react-leaflet-popups-not-working-on-mobile-devices
                */
          tap: false,
        }).setView(center, zoom);

        // set first style as active
        activeStyleID = document.querySelector(
          "#styles-dropdown-list li button"
        ).dataset.styleid;
        tileLayerGroup = L.layerGroup().addTo(map);
        activateStyle(activeStyleID);
        featureCollectionLayerGroup = L.layerGroup().addTo(map);
      } catch (error) {
        console.log(error);
      }

      // if query parameter ?layer= exists, then activate that layer
      try {
        const params = new Proxy(new URLSearchParams(window.location.search), {
          get: (searchParams, prop) => searchParams.get(prop),
        });
        if (params.layer) {
          // activate layer with the parameter value
          activateLayer(params.layer);
        } else {
          // no query params, so just activate the first layer in the nav list
          activateLayer(getFirstAvailableLayerId());
        }
      } catch (error) {
        console.log(error);
      }
    });
};
initMapboxConfig();

let getFirstAvailableLayerId = () => {
  return document.querySelector("#layers-dropdown-list button").dataset.layerid;
};

let activateStyle = (styleId) => {
  // base is just the mapbox style id; need to prefix with <username>/ to use it
  tileLayerGroup.clearLayers();
  let tileLayer = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 24,
      id: styleId,
      tileSize: 512,
      zoomOffset: -1,
      accessToken: accessToken,
    }
  );
  tileLayerGroup.addLayer(tileLayer);

  // update navigation bar to reflect currently active selection
  document
    .querySelectorAll(".navbar-nav #styles-dropdown-list .dropdown-item")
    .forEach((item) => {
      if (item.id === `style-${styleId}-toggle`) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  activeStyleID = styleId;
};

let activateLayer = (layerId) => {
  fetch(`/api/layer/${layerId}`)
    .then((response) => response.json())
    .then((newLayer) => {
      // data is a list of layers. each layer is a JSON object with keys: id, title, description, keywords, geojson.
      // the value of the geojson key is the full geojson io output for that layer :)
      // we need to get the object whose id value matches the argument.
      let geojson_layer = JSON.parse(newLayer.geojson);
      featureCollectionLayerGroup.clearLayers();
      let newActiveLayer = L.geoJson(geojson_layer, {
        /* geojson options */

        /* onEachFeature: A Function that will be called once for each created Feature, 
            after it has been created and styled. Useful for attaching events 
            and popups to features. The default is to do nothing with the newly 
            created layers */
        onEachFeature: function (feature, layer) {
          layer.bindPopup(createFeatureCard(feature));
        },

        /* pointToLayer: A Function defining how GeoJSON points spawn 
            Leaflet layers. It is internally called when data is added, 
            passing the GeoJSON point feature and its LatLng. The 
            default is to spawn a default Marker. We can modify it to use a custom Marker */
        pointToLayer: function (geoJsonPoint, latlng) {
          return L.marker(latlng, {
            icon: defaultCofCMarkerIcon,
            title: newLayer.title,
            alt: defaultCofCMarkerIconAltText,
            riseOnHover: true,
          });
        },
      });
      featureCollectionLayerGroup.addLayer(newActiveLayer);

      // update navigation bar to reflect currently active selection
      document
        .querySelectorAll(".navbar-nav #layers-dropdown-list .dropdown-item")
        .forEach((item) => {
          if (item.id === `layer-${layerId}-toggle`) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      navbarBrand.innerText = `${defaultNavbarBrandText} - ${newLayer.title}`;
    });
};

let createFeatureCard = (feature) => {
  // create a (bootstrap 5.1) card to serve as the popup
  // when you tap / click on a feature (a location)
  let props = feature.properties;
  let card = document.createElement("div");
  card.classList.add("card");
  card.style.width = "18rem";
  if ("image_link" in props) {
    let image = document.createElement("img");
    image.src = props.image_link;
    image.classList.add("card-img-top");
    image.alt = props.title;
    card.appendChild(image);
  }
  let cardBody = document.createElement("div");
  cardBody.classList.add("card-body");
  let cardTitle = document.createElement("h5");
  cardTitle.className = "card-title";
  cardTitle.textContent = props.title;
  let cardDescription = document.createElement("p");
  cardDescription.className = "card-text";
  cardDescription.textContent = props.description;
  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardDescription);
  if ("address" in props) {
    let address = document.createElement("address");
    address.textContent = props.address;
    cardBody.appendChild(address);
  }
  if ("website" in props) {
    let cardLink = document.createElement("a");
    cardLink.className = "btn btn-primary";
    cardLink.href = props.website;
    cardLink.textContent = "View Website";
    cardBody.appendChild(cardLink);
  }
  card.append(cardBody);
  return card;
};
