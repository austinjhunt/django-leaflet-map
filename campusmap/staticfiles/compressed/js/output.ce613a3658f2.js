let featureCollectionLayerGroup;let tileLayerGroup;let map;let defaultNavbarBrandText="CofC Map";let navbarBrand=document.querySelector(".navbar-brand");let defaultCofCMarkerIcon=L.icon({iconUrl:"/images/map-icon-cofc.png",iconSize:[50,50],});let defaultCofCMarkerIconAltText="Cougar Clyde Icon";let accessToken;let center;let zoom;let activeStyleID;let initMapboxConfig=()=>{fetch("/api/mapbox/access").then((response)=>response.json()).then((data)=>{accessToken=data.accessToken;zoom=data.zoom;center=data.center;}).then(()=>{try{map=L.map("map",{tap:false,}).setView(center,zoom);activeStyleID=document.querySelector("#styles-dropdown-list li button").dataset.styleid;tileLayerGroup=L.layerGroup().addTo(map);activateStyle(activeStyleID);featureCollectionLayerGroup=L.layerGroup().addTo(map);}catch(error){console.log(error);}
try{const params=new Proxy(new URLSearchParams(window.location.search),{get:(searchParams,prop)=>searchParams.get(prop),});if(params.layer){activateLayer(params.layer);}}catch(error){console.log(error);}});};initMapboxConfig();let activateStyle=(styleId)=>{tileLayerGroup.clearLayers();let tileLayer=L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",{attribution:'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',maxZoom:24,id:styleId,tileSize:512,zoomOffset:-1,accessToken:accessToken,});tileLayerGroup.addLayer(tileLayer);document.querySelectorAll(".navbar-nav #styles-dropdown-list .dropdown-item").forEach((item)=>{if(item.id===`style-${styleId}-toggle`){item.classList.add("active");}else{item.classList.remove("active");}});activeStyleID=styleId;};let activateLayer=(layerId)=>{fetch(`/api/layer/${layerId}`).then((response)=>response.json()).then((newLayer)=>{let geojson_layer=JSON.parse(newLayer.geojson);featureCollectionLayerGroup.clearLayers();let newActiveLayer=L.geoJson(geojson_layer,{onEachFeature:function(feature,layer){layer.bindPopup(createFeatureCard(feature));},pointToLayer:function(geoJsonPoint,latlng){return L.marker(latlng,{icon:defaultCofCMarkerIcon,title:newLayer.title,alt:defaultCofCMarkerIconAltText,riseOnHover:true,});},});featureCollectionLayerGroup.addLayer(newActiveLayer);document.querySelectorAll(".navbar-nav #layers-dropdown-list .dropdown-item").forEach((item)=>{if(item.id===`layer-${layerId}-toggle`){item.classList.add("active");}else{item.classList.remove("active");}});navbarBrand.innerText=`${defaultNavbarBrandText} - ${newLayer.title}`;});};let createFeatureCard=(feature)=>{let props=feature.properties;let card=document.createElement("div");card.classList.add("card");card.style.width="18rem";if("image_link"in props){let image=document.createElement("img");image.src=props.image_link;image.classList.add("card-img-top");image.alt=props.title;card.appendChild(image);}
let cardBody=document.createElement("div");cardBody.classList.add("card-body");let cardTitle=document.createElement("h5");cardTitle.className="card-title";cardTitle.textContent=props.title;let cardDescription=document.createElement("p");cardDescription.className="card-text";cardDescription.textContent=props.description;cardBody.appendChild(cardTitle);cardBody.appendChild(cardDescription);if("address"in props){let address=document.createElement("address");address.textContent=props.address;cardBody.appendChild(address);}
if("website"in props){let cardLink=document.createElement("a");cardLink.className="btn btn-primary";cardLink.href=props.website;cardLink.textContent="View Website";cardBody.appendChild(cardLink);}
card.append(cardBody);return card;};;