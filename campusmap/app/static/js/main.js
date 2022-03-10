let activateLayer = (layerId) => {
  fetch(`/layer/${layerId}`)
    .then((response) => response.json())
    .then((newLayer) => {
      let geojson_layer = JSON.parse(newLayer.geojson);
      mainLayerGroup.clearLayers();
      let newActiveLayer = L.geoJson(geojson_layer, {
        onEachFeature: function (feature, layer) {
          layer.bindPopup(createFeatureCard(feature));
        },
      });
      mainLayerGroup.addLayer(newActiveLayer);
    });
};

let createFeatureCard = (feature) => {
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
  cardBody.appendChild(cardTitle).appendChild(cardDescription);
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
