import * as Manage from '@/js/Manage';
import {marker, infoWindow} from '@/js/GoogleMarkers';
import geolocation from '@/js/geolocation';
import PublicDatas from '@/js/PublicDatas';
import {CustomOverlays, CustomMarkers} from '@/js/OverlayViews';
import Trek from '@/js/Trekking';

const mng = Manage.mng;
const infosMng = Manage.infosMng;
const _ = mng._;
const $ = mng.$;

const gMap = (function(){
  let publicObj = {infos:{}};
  publicObj.mapId = "map";
  publicObj.minZoom = 1;
  publicObj.directions ={
    service : "",
    display : ""
  };

  const _setTitle  = function(src) {
    $$(".fab-left-top img").attr("src", mng.getImgPath() + src);
  }

  const geocode = function() {
    return Ajax.getPromise({url:"https://maps.googleapis.com/maps/api/geocode/json?"+mng.getScriptGoogleParams("address","language","region","key")});
  }

  const geocodeKorea = function() {
    return Ajax.getPromise({url:"https://maps.googleapis.com/maps/api/geocode/json?"+mng.getScriptGoogleParams("koAddress","language","region","key")});
  }

  publicObj.init = function(center) {
    return mng.promise(function(resolve, reject){
      mng.fnRecursive(50,
        function() {return !!window.google;},
        function(){
          const mapOptions = {
            fullscreenControl: false, // fullscreen
            mapTypeControl: false,
            //disableDoubleClickZoom: true,
            backgroundColor: "#FFFFFF",
            scaleControl: true,
            zoomControl: false,
            streetViewControl:false, // 거리뷰
            maxZoom : 20, // 16이 반경 1KM 쯤 나옴.
            minZoom : 7,
            zoom: 12,
            //styles: style.test // 스타일은 한국만 적용안됨.
          };

          publicObj.directions.service = new google.maps.DirectionsService();
          publicObj.directions.display = new google.maps.DirectionsRenderer();

          Ajax.promiseAll([geocode()]).then(function(datas){
            const geometry = datas[0].data.results[0].geometry,
                  mapBounds = geometry.bounds;
            let location = geometry.location;
            location = {lat:37.420039, lng:127.126669}; // 성남시청
            // {lat:37.4449168, lng: 127.1388684} // 성남
            // console.log(datas);
            publicObj.center = location;

            // 한국 bounds
            publicObj.strictBounds = new google.maps.LatLngBounds(
              new google.maps.LatLng(33.0041, 124.1718463),  // sw
              new google.maps.LatLng(43.01159, 131.1603)   // ne
            );

            // 지역
            publicObj.strictBounds_map = new google.maps.LatLngBounds(
              new google.maps.LatLng(mapBounds.southwest.lat, mapBounds.southwest.lng),  // sw
              new google.maps.LatLng(mapBounds.northeast.lat, mapBounds.northeast.lng)   // ne
            );

            publicObj.map = new google.maps.Map(document.getElementById(publicObj.mapId), mng.merge(mapOptions, {
              center : location
            }));

            _setHeaderBounds();

            publicObj.directions.display.setMap(publicObj.map);
            polygon.setPolygon(mng.getGid());

            // overlayMapType.setCoordMapTypeBorder(); // 맵 위에 border와 이미지 번호를 표시할 때
            // overlayMapType.setCoordImageMap(); // 이미지 지도

            mng.fnRecursive(50, () => NoblMap.infos.imaps, () => {
              let imapsMinZoom = 20;
              let area;
              NoblMap.infos.imaps.filter((imap) => {
                const temp = _.keys(JSON.parse(imap.tile_info)).map((key)=>Number(key));
              	imap.minZoom = Math.min(...temp);
                imap.maxZoom = Math.max(...temp);

              	if(imapsMinZoom > imap.minZoom) {
              		imapsMinZoom = imap.minZoom;
              		area = imap;
                }
              });

              let details = NoblMap.infos.imaps.filter((imap) => imap.mid !== area.mid);
              CustomMarkers.addMinimapGroupMarker(details);
              infosMng.set("imapData.areaKey", "mid"+area.mid+"Type");
              infosMng.set("imapData.area", area);
              infosMng.set("imapData.details", details);
              publicObj.setAreaMap();
            });

            mng.fnRecursive(50, () => NoblMap.infos.places, () => {
              // 41 : 역사 건축물
              // 42 : 박물관 / 미술관
              // 44 : 수조관
              // 45 : 동물원
              // 47 : 병원
              // 49 : 산
              // 51 : 폭포
              // 52 : 휴양림
              // 53 : 식물원
              // 59 : 공원 / 휴양

              const arr = [49, 51, 59];
              const datas = NoblMap.infos.places.filter((place) => (place.map_type === 1 && _.indexOf(arr, place.map_res_url.toNum()) > 0 ))
              CustomMarkers.addPictoSymbolGroupMarker("pictos", datas, 12);
            });

            publicObj.onMapEvents();
            geolocation.init();
            NoblMap.PublicDatas.CultureEvent.setCultureEvent(); // 지역 문화 축제 아이콘.
            return resolve();
          });
        });
    });
  }

  publicObj.setMapTypeId = function(name) {
    publicObj.map.setMapTypeId(name);
    if(name !== "roadmap") {
      const mid = Number(name.split("mid").join("").split("Type").join(""));
      const info = NoblMap.infos.imaps.filter((info) => info.mid === mid)[0];
      publicObj.setCenterZoom(info.lat, info.lng, info.zoom || info.minZoom );
    }
  }

  publicObj.setAreaMap = function() {
    const area = infosMng.get("imapData.area");
    const areaKey = infosMng.get("imapData.areaKey");
    const map = publicObj.map;
    if(!map.mapTypes.hasOwnProperty(areaKey)) {
      imageMapType.setMapType(areaKey, area.minZoom-1, area.maxZoom, area.mid);
    }
    map.setMapTypeId(areaKey);
    publicObj.setCenterZoom(area.lat, area.lng, area.minZoom);
  }

  const _setHeaderBounds = function() {
    _.each(NoblMap.infos.headers, (data) => {
      data.bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(data.sw.lat, data.sw.lng),
        new google.maps.LatLng(data.ne.lat, data.ne.lng)
      );
    });
  }

  publicObj.event = {};
  publicObj.event.addListener = function(event, func){
    publicObj.map.addListener(event, func);
  }

  publicObj.onMapEvents = function() {
    publicObj.event.zoom();
    publicObj.event.dragend();
    publicObj.event.rightclick();
    publicObj.event.click();
    publicObj.event.bounds_changed();
  }

  publicObj.event.bounds_changed = function(){
    publicObj.event.addListener('bounds_changed', function(){
      const zoom = publicObj.map.getZoom();

      if(!infosMng.has("markers.groupMarkers.pictograms") && zoom === 12) {
        // CustomMarkers.addPictograms();
      }
      if(zoom > 17) {
        PublicDatas.BusStation.around_debounce();
      }
      // Header.changeHeader_debounce();
      if(NoblMap.map.getMapTypeId() !== "roadmap") {
        CustomMarkers.debounceRestrictMovement();
      }
    });
  }

  publicObj.event.zoom = function(){
    publicObj.event.addListener('zoom_changed', function(){
      const zoom = publicObj.map.getZoom();

      clearClickMarker();
      if(!infosMng.has("markers.groupMarkers.icon.toilet") && zoom === 18) {
        PublicDatas.Toilet.toiletInfos();
      }else if(infosMng.has("markers.groupMarkers.icon.toilet") && zoom < 18) {
        infosMng.get("markers.groupMarkers.icon.toilet").onRemove();
      }
      // 성남 전체 지도가 minZoom보다 1이 작을 때(11) mapTypeId가 roadmap이 아니면 roadmap으로 설정.
      // if(publicObj.map.getMapTypeId() !== "roadmap" && zoom < infosMng.get("imapData.area.minZoom")) {
      //   setTimeout(()=>{ NoblMap.setMapTypeId_debounce("roadmap");}, 100);
      // }
      const mapTypeId = publicObj.map.getMapTypeId();
      if(mapTypeId === infosMng.get("imapData.areaKey")) {
        if(zoom < infosMng.get("imapData.area.minZoom") && (zoom - (publicObj.beforeZoom || 12)) <= 0) {
          setTimeout(()=>{
            NoblMap.map.setMapTypeId("roadmap");
          }, 100);
        }
      }

      if (mapTypeId !== "roadmap" && infosMng.get("imapData.areaKey") !== mapTypeId) {
        const key = mapTypeId.split("Type").join("");
        const data = NoblMap.infos.imaps.filter((imap) => imap.key === key)[0];
        if(infosMng.get("imapData.curDetail") && zoom < data.minZoom) {
          setTimeout(()=>{
            const info = Manage.infosMng.get("imapData.area");
            NoblMap.map.setMapTypeId("roadmap");
            setTimeout(()=>{
              NoblMap.map.setMapTypeId(Manage.infosMng.get("imapData.areaKey"));
              publicObj.setCenterZoom(data.lat, data.lng, info.maxZoom );
      				CustomMarkers.setTitle(Manage.mng.getGName());
              CustomMarkers.addMinimapGroupMarker(infosMng.get("imapData.details"));
            }, 100);
          }, 100);
        }else{
          infosMng.set("imapData.curDetail", true);
        }
      }

      if(zoom === 12) {
        if(!infosMng.has("markers.groupMarkers.complex.spot_1")) {
          // CustomMarkers.addIconTextGroupMarker("spot_1", 12);
        }
        if(!infosMng.has("markers.groupMarkers.minimap")) {
          CustomMarkers.addMinimapGroupMarker(infosMng.get("imapData.details"));
        }
      }
      if(zoom === 20) {
        const mapTypeId = NoblMap.map.getMapTypeId();
        if(mapTypeId !== "roadmap" && NoblMap.map.mapTypes[mapTypeId].minZoom + 4 < 20) {
          NoblMap.map.setMapTypeId("roadmap");
        }
      }
      publicObj.beforeZoom = zoom;
    });
  }

  const clearClickMarker = function() {
    if(NoblMap.infos.markers.clickMarker) {
      const clickMarker = NoblMap.infos.markers.clickMarker;
      clickMarker.rings.setMap(null);
      clickMarker.circle.setMap(null);
      delete NoblMap.infos.markers.clickMarker;
    }
  }

  publicObj.event.dragend = function(){
    publicObj.event.addListener('dragend', function(){
      //_restrictMovement(publicObj.map.getMapTypeId(), publicObj.map.getCenter());
    });
  }

  publicObj.event.rightclick = function(){
    publicObj.event.addListener('rightclick', function(e){
      console.log("insertNewSector(new google.maps.LatLng({lat:"+ e.latLng.lat()+", lng:"+e.latLng.lng() + "}))");
      // console.log((e.latLng.toJSON()));
    });
  }

  publicObj.event.click = function(){
    publicObj.event.addListener('click', function(e){
      const latLng = e.latLng;
      setTimeout(()=>{
        if(!NoblMap.stopCircle){
          marker.addClickMarker({lat:latLng.lat(), lng:latLng.lng()});
        }
        NoblMap.stopCircle = false;
      }, 200);
      infoWindow.removeInfoWindows();
    });
  }

  // 이동할 영역을 제한하기.
  const _restrictMovement = function(mapTypeId, center){
    if(mapTypeId === "roadmap") {
      if (publicObj.strictBounds.contains(center)) return;

      const strictBounds = publicObj.strictBounds,
            maxX = strictBounds.getNorthEast().lng(),
            maxY = strictBounds.getNorthEast().lat(),
            minX = strictBounds.getSouthWest().lng(),
            minY = strictBounds.getSouthWest().lat();
      let x = center.lng(),
          y = center.lat();

      if (x < minX) x = minX;
      if (x > maxX) x = maxX;
      if (y < minY) y = minY;
      if (y > maxY) y = maxY;

      publicObj.map.setCenter(new google.maps.LatLng(y, x));
    }
  }

  publicObj.zoomChange = function(num) {
    publicObj.map.setZoom(publicObj.map.getZoom() + num)
  }

  publicObj.panToMarker = function(position) {
    setTimeout(function(){
      publicObj.map.panTo(position);
      publicObj.map.setZoom(16);
    }, 500);
  }

  publicObj.setCenter = function(lat, lng) {
    publicObj.map.panTo(new google.maps.LatLng(lat, lng));
    marker.addCenterMarker(lat, lng);
  }

  publicObj.setCenterZoom = function(lat, lng, zoom) {
    publicObj.map.setCenter(new google.maps.LatLng(lat, lng));
    publicObj.map.setZoom(zoom);
  }

  // 현재 보는 영역에 포함여부 판별.
  publicObj.isContainsMapBounds = function(lat, lng) {
    return publicObj.map.getBounds().contains(new google.maps.LatLng(lat, lng));
  }

  publicObj.LatLng = function(lat, lng) {
    return new google.maps.LatLng({lat, lng});
  }

  return publicObj;
}());

const overlayMapType = (function(){
  let publicObj = {};
  publicObj.tileDataMap = {};
  publicObj.setTileInfo = function() {
    _.each(NoblMap.infos.tileInfos, (mapInfo, key) => {
      _.each(mapInfo, (data, zoom) => {
        for(let i=0, n=data.xRange; i<n; i++){
          for(let ii=0, nn=data.yRange; ii<nn; ii++){
            _.set(publicObj.tileDataMap, (key+".z"+zoom + ".x" + (data.x + i) + ".y" + (data.y + ii)), key);
          }
        }
      });
    });
  }

  const _addMapType = function(mapType) {
    gMap.map.overlayMapTypes.insertAt(0, mapType);
  }

  const _getMapTypeIdx = function(name) {
    for(let i=0, n=gMap.map.overlayMapTypes.length; i<n; i++){
      if(gMap.map.overlayMapTypes.getAt(i).constructor.name === name){
        return i;
      }
    }
  }

  const _removeMapType = function(name) {
    gMap.map.overlayMapTypes.removeAt(_getMapTypeIdx(name));
  }

  const _addStyleCoordMap = function(that, noBorder) {
    let style = 'style="'
      +'width:'+that.tileSize.width+'px; '
      +'height:'+that.tileSize.height+'px; ';
    if(!noBorder) {
      style += 'font-size:10; ';
      style += 'border:1px solid #AAAAAA; ';
    }
    style += '"';
    return $$('<div '+style+'></div>');
  }

  // 맵위에 border 와 이미지 넘버를 적을 때
  function CoordMapTypeBorder(tileSize) {
    this.tileSize = tileSize;
  }

  CoordMapTypeBorder.prototype.getTile = function(coord, zoom, ownerDocument) {
    const fragment = ownerDocument.createDocumentFragment();
    const div = _addStyleCoordMap(this, false);
    div.append( coord.toString() );
    fragment.appendChild( div[0] );
    return fragment;
  };

  publicObj.setCoordMapTypeBorder = function() {
    _addMapType(new CoordMapTypeBorder(new google.maps.Size(256, 256)));
  }

  publicObj.removeCoordMapTypeBorder = function() {
    _removeMapType("CoordMapTypeBorder");
  }

  // 맵위에 image를 타일로 올릴 때
  function CoordImageMap(tileSize) {
    this.tileSize = tileSize;
  }

  CoordImageMap.prototype.getTile = function(coord, zoom, ownerDocument) {
    const mapData = publicObj.getImageMapData(zoom);
    if(mapData) {
      if(mapData["x"+coord.x] && mapData["x"+coord.x]["y"+coord.y]) {
        const mid = mapData["x"+coord.x]["y"+coord.y];
        const fragment = ownerDocument.createDocumentFragment();
        const div = _addStyleCoordMap(this, true); //라인을 그리고 싶으면 true를 false로 바꾸면 끝.
        div.attr("id", coord.x +"_"+coord.y);
        div.css("background-image", "url("+ mng.getImgPath() + "google/"+mid+"/"+zoom+"/"+ coord.x +"/"+ coord.y +".png)");
        div.css("background-size", "256px 256px");
        fragment.appendChild( div[0] );
        return fragment;
      }
    }
  };

  publicObj.setCoordImageMap = function() {
    if(!publicObj.coordImageMapOn) {
      publicObj.coordImageMapOn = true;
      _addMapType(new CoordImageMap(new google.maps.Size(256, 256)));
    }
  }

  publicObj.removeCoordImageMap = function() {
    if(publicObj.coordImageMapOn) {
      _removeMapType("CoordImageMap");
      publicObj.coordImageMapOn = false;
    }
  }

  publicObj.getImageMapData = function(zoom) {
    // return mng.merge(publicObj.tileDataMap["mid1"], publicObj.tileDataMap[NoblMap.infos.selectedMap])["z"+zoom];
    return publicObj.tileDataMap["mid1"]["z"+zoom];
  }

  return publicObj;
}());
gMap.overlayMapType = overlayMapType;

const imageMapType = (function(){
  const publicObj = {};
  publicObj.makeImageMapType = function(name, minZoom, maxZoom, mid) {
    return new google.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
        const z = overlayMapType.tileDataMap["mid"+mid]["z"+zoom];
        if(z && z["x"+coord.x] && z["x"+coord.x]["y"+coord.y]){
          return mng.getImgPath() + "google/mid"+mid+"/"+zoom+"/"+ coord.x +"/"+ coord.y +".png";
        }else{
          return null;
        }
      },
      tileSize: new google.maps.Size(256, 256),
      minZoom,
      maxZoom,
      name
    });
  }

  publicObj.setMapType = function(name, minZoom, maxZoom, mid) {
    NoblMap.map.mapTypes.set(name, publicObj.makeImageMapType(name, minZoom, maxZoom, mid));
  }

  return publicObj;
}());
gMap.imageMapType = imageMapType;


const tile = (function(){
  let publicObj = {};

  publicObj.convert = function(zoom, x, y, noMarker) {
    const latlng = {lng:_tile2long(x, zoom), lat: _tile2lat(y, zoom)};
    if(!noMarker) {
      google.maps.Marker({position:latlng, map:NoblMap.map});
    }
    return latlng;
  }

  const _tile2long = function(x, z){
    return (x/Math.pow(2,z)*360-180);
  }

  const _tile2lat = function (y, z) {
    var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
    return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
   }
   // 위 변환 함수2개는 저기서 퍼옴. https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_numbers_to_lon..2Flat

  return publicObj;
}());
gMap.tile = tile;


// 국내지도엔 안되서 접었음.
// const style = (function(){
//   let publicObj = {};

//   publicObj.test = [
//   {
//     "featureType": "road.highway",
//     "elementType": "geometry.fill",
//     "stylers": [
//       {
//         "color": "#55c5e6"
//       }
//     ]
//   },{
//     "featureType": "road.arterial",
//     "elementType": "geometry.fill",
//     "stylers": [
//       {
//         "color": "#d349f1"
//       }
//     ]
//   },{
//     "featureType": "road.local",
//     "elementType": "geometry.fill",
//     "stylers": [
//       {
//         "color": "#5280e9"
//       }
//     ]
//   }];

//   return publicObj;
// }());
// gMap.style = style;

const polygon = (function(){
  let publicObj = {polygons : {}};

  publicObj.makePaths = function(name) {
    let paths = [];

    _.each(GLOBAL_CONSTS[name+"_coordinates"].split(" "), function(str){
      str = str.split(",");
      paths.push(new google.maps.LatLng({lng:Number(str[0]), lat:Number(str[1])}));
    });

    return paths;
  }

  publicObj.setPolygon = function(name){
    const polygon = new google.maps.Polygon({
      paths: publicObj.makePaths(name),
      strokeColor: '#AACC66',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#AACC66',
      fillOpacity: 0.35
    });
    polygon.setMap(gMap.map);
    publicObj.polygons[name] = polygon;

    if(publicObj.marker) {
      publicObj.marker.setMap(null);
    }

    let area = infosMng.get("imapData.area") || NoblMap.center;
    publicObj.marker = new google.maps.Marker({
      map:NoblMap.map,
      position:{lat:area.lat, lng:area.lng},
      icon:{url: mng.getImgPath() + "map_icon/puff.svg",
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(50, 50),
        scale: 1
      }
    });

    publicObj.marker.addListener('click', gMap.setAreaMap);
    google.maps.event.addListener(polygon, 'click', gMap.setAreaMap);

    gMap.map.addListener('zoom_changed', _changeEvent);
    _changeEvent();
  }

  const _changeEvent = function(){
    const zoom = gMap.map.getZoom(),
          gid = mng.getGid(),
          hasPoly = publicObj.hasPolygon(gid);

    if(zoom < 12 && !hasPoly) {
      publicObj.setPolygon(gid);
    }else if(zoom > 11 && hasPoly) {
      publicObj.removePolygon(gid);
    }
  };

  publicObj.removePolygon = function(name){
    let polygon = NoblMap.polygon.polygons[name];
    google.maps.event.clearListeners(polygon, "click");
    polygon.setMap(null);
    google.maps.event.clearListeners(publicObj.marker, "click");
    publicObj.marker.setMap(null);
    delete publicObj.polygons[name];
  }

  publicObj.hasPolygon = function(name){
    return !!(publicObj.polygons[name]);
  }

  return publicObj;
}());
gMap.polygon = polygon;

const polyline = (function(){
  let publicObj = {};
  const lineName = "polyline.line";
  const markerName = "polyline.markers";
  publicObj.addMarker = function(data) {
    const markerOption = {
      position: {lat: data.lat, lng: data.lng},
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        strokeColor: '#000',
        strokeWeight: 0,
        fillColor : "red",
        fillOpacity: 1,
        scale: 4
      },
      zIndex: 300,
      map: NoblMap.map
    };

    const marker = new google.maps.Marker(markerOption);
    let markers = infosMng.get(markerName) || [];
    markers.push(marker);
    infosMng.set(markerName, markers);
  }

  publicObj.addPath = function(data) {
    let polyline = infosMng.get(lineName) || publicObj.setPolyline();
    let path = polyline.getPath();
    path.push(new google.maps.LatLng({lng:data.lng, lat:data.lat}));
    if(data.tcs_type === 2) {
      publicObj.addMarker(data);
    }
  }

  publicObj.setPolyline = function(){
    const polyline = new google.maps.Polyline({
      strokeColor: '#4B8ECB',
      strokeOpacity: 0.7,
      strokeWeight: 6
    });
    polyline.setMap(gMap.map);
    infosMng.set(lineName, polyline);
    return polyline;
  }

  publicObj.removePolyline = function(){
    let polyline = infosMng.get(lineName);
    if(polyline) {
      polyline.setMap(null);
      infosMng.del(lineName);
      let polylineMarkers = infosMng.get(markerName);
      _.each(polylineMarkers, (marker) => {
        marker.setMap(null);
      });
      infosMng.del(markerName);
    }
  }

  return publicObj;
}());
gMap.polyline = polyline;

gMap.marker = marker;
gMap.infoWindow = infoWindow;
gMap.geolocation = geolocation
gMap.PublicDatas = PublicDatas;
gMap.CustomOverlays = CustomOverlays;
gMap.CustomMarkers = CustomMarkers;
gMap.Trek = Trek;
export default gMap;

document.addEventListener('gesturestart', function (e) {e.preventdefault()} );
