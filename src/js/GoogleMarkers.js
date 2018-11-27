import * as Manage from '@/js/Manage';

const mng = Manage.mng;
const _ = mng._;
const $ = mng.$;
const infosMng = Manage.infosMng;

const makeKey = function (data) {
  return data.key || data.category+"."+data.sp_id;
}

const marker = (function(){
  let publicObj = {};

  const _markerZindex = 250,
        _defaultOptions = {
          zIndex: _markerZindex
        };

  const _pinSymbol = function(color) {
    return {
      path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#000',
      strokeWeight: 1,
      scale: 1,
    };
  }

  const _circleSymbol = function(color) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      strokeColor: '#000',
      strokeWeight: 0,
      fillColor : color,
      fillOpacity: 1,
      scale: 5
    };
  }

  const _starSymbol = function() {
    return {
      url: mng.getImgPath() + "menu_icon/course_spot_off.png",
      size: new google.maps.Size(30, 30),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 15)
    };
  }

  const _latlngToNum = function(num){
    return (typeof num === "string")?num.toNum():num;
  }

  publicObj.addMarker = function(data) {
    let options = mng.merge(_defaultOptions, {
          position: {lat:_latlngToNum(data.lat), lng:_latlngToNum(data.lng)},
          map: NoblMap.map
        }),
        marker = new google.maps.Marker(options);
    return marker;
  }

  publicObj.addCenterMarker = function(lat, lng){
    let options = mng.merge(_defaultOptions, {
        position: {lat, lng},
        map: NoblMap.map
    });

    return new google.maps.Marker(options);
  }

  // 인포윈도우까지 연계되는 마커.
  publicObj.addInfoMarker = function(data){
    const options = mng.merge(_defaultOptions, {
              position: {lat: _latlngToNum(data.lat), lng: _latlngToNum(data.lng)},
              map: NoblMap.map
          }),
          markerKey = "id_"+data.cid+"_" +data.pid;

    let marker = infosMng.get("infoWindow.marker."+markerKey);
    if(marker){
      marker.setOptions(options);
    }else{
      marker = new google.maps.Marker(options);
      marker.addListener('click', function() {
        infoWindow.removeInfoWindows();
        infoWindow.addInfoWindow(markerKey, data, marker);
        publicObj.detailMarker = marker; // 팝업에서 쓰려고 함.
      });
      infosMng.set("infoWindow.marker."+markerKey, marker);
    }
    return marker;
  }

  publicObj.removeInfoMarker = function(name){
    const marker = infosMng.get("markers.infoMarkers."+name );
    marker.setMap(null);
    infosMng.del("markers.infoMarkers."+name );
  }

  publicObj.geoRingMarker = function(params) {
    publicObj.removeRingMarker("geoRingMarker");
    let options = mng.merge(_defaultOptions, {
        position: {lat:params.lat, lng:params.lng},
        map: NoblMap.map
    });

    const circle = new google.maps.Marker(mng.merge(options, {icon: _circleSymbol("#FF4444")}));
    const rings = new google.maps.Marker(mng.merge(options, {zIndex:_markerZindex+1, icon:{
        url: mng.getImgPath() + "map_icon/rings_red.svg",
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(22.5, 22.5),
        scale: 1.2
    }}));

    infosMng.set("markers.geoRingMarker.circle", circle);
    infosMng.set("markers.geoRingMarker.rings", rings);
  }

  publicObj.starMarker = function(params) {
    let options = mng.merge(_defaultOptions, {
        position: {lat:params.lat, lng:params.lng},
        map: NoblMap.map
    });

    let data = {};
    data["star_"+params.tc_id+"_"+params.tcs_id] = new google.maps.Marker(mng.merge(options, {icon: _starSymbol()}));
    infosMng.set("markers.starMarker", Manage.mng.merge(infosMng.get("markers.starMarker"), data));
  }


  const _kakaoNavi = function(lat, lng) {
    Kakao.Navi.start({
      name:"선택한 곳",
      x: lng,
      y: lat,
      coordType: 'wgs84'
    });
  }
  // 유저가 지도를 클릭했을 때 마커.
  publicObj.addClickMarker = function(params){
    publicObj.removeRingMarker("clickMarker");

    let options = mng.merge(_defaultOptions, {
        position: {lat:params.lat, lng:params.lng},
        map: NoblMap.map
    });

    const circle = new google.maps.Marker(mng.merge(options, {icon: _circleSymbol("#00A4FF")}));
    const rings = new google.maps.Marker(mng.merge(options, {zIndex:_markerZindex+1, icon:{
        url: mng.getImgPath() + "map_icon/rings_blue.svg",
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(22.5, 22.5),
        scale: 1.2
    }}));

    rings.addListener('click', function(e) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      msg.navi("경로안내를 사용하시겠습니까?",
        ()=>{
          if(!window.Kakao) {
            Manage.mng.getScriptKakao();
            Manage.mng.fnRecursive(50, function(){return window.Kakao}, function(){
              Kakao.init(Manage.mng.getApiKey("KAKAO").clientId);
              _kakaoNavi(lat, lng);
            });
          }else{
            _kakaoNavi(lat, lng);
          }
        },
        ()=>{
          var request = {
            origin: NoblMap.geolocation.nowLocation.lat+","+NoblMap.geolocation.nowLocation.lng,
            // origin:"37.568929,126.827552",
            //
            //
            destination:lat+","+lng,
            travelMode:'TRANSIT'
          };

          NoblMap.directions.service.route(request, function(result, status) {
            if (status == 'OK') {
              NoblMap.directions.display.setDirections(result);
            }
          });
        });
    });

    infosMng.set("markers.clickMarker.rings", rings);
    infosMng.set("markers.clickMarker.circle", circle);
  }

  publicObj.removeRingMarker = function(name){
    name = "markers." + name + ".";
    let rings = infosMng.get(name + "rings"),
        circle = infosMng.get(name + "circle");
    if(rings) {
        rings.setMap(null);
        infosMng.del(name + "rings");
        circle.setMap(null);
        infosMng.del(name + "circle");
    }
  }

  publicObj.markerBounce = function(marker) {
    const bounceMarker = infosMng.get("markers.bounceMarker");
    if(bounceMarker !== marker) {
      if(bounceMarker) {
        publicObj.stopBounce(bounceMarker);
      }
      publicObj.startBounce(marker);
    }
  }

  publicObj.startBounce = function(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    infosMng.set("markers.bounceMarker", marker);
  }

  publicObj.stopBounce = function(marker) {
    marker.setAnimation(null);
    infosMng.del("markers.bounceMarker");
  }

  const _setMarkerVisible = function(){
    const zoom = NoblMap.map.getZoom(),
          markers = infosMng.get("markers.infoMarkers");

    _.each(markers, (mk) => {
      let flag = true;
      if((!NoblMap.isContainsMapBounds(mk.position.lat(), mk.position.lng()))  || zoom <= 11) {
        flag = false;
      }
      mk.setVisible(flag);
    });
  }

  publicObj.setEvent = function() {
    // NoblMap.map.addListener("zoom_changed", _.debounce(_setMarkerVisible, 50));
    // NoblMap.map.addListener("center_changed", _.debounce(_setMarkerVisible, 50));
  }
  return publicObj;
}());

const infoWindow = (function(){
  let publicObj = {};
  publicObj.infoWindows = new Map();

  const _newInfoWindow = function(opts, data){
    const iw = new google.maps.InfoWindow();

    google.maps.event.addListener(iw, 'content_changed', function(){
      if(typeof this.getContent()=='string'){
        var n=document.createElement('div');
        n.innerHTML=this.getContent();
        this.setContent(n);
        return;
      }

      google.maps.event.addListener(this,'domready',function(){
        var _this=this;
        if(publicObj.clickEvent){
          google.maps.event.removeListener(publicObj.clickEvent);
        }

        publicObj.clickEvent = google.maps.event.addDomListener(this.getContent().parentNode.parentNode,'click', function(){
          mng.goPage(".popup-menu-detail-view", "/menuDetail/"+data.pid);
  				mng.openPopup($$("#popup-menu-detail"));
        });
      });
    });

    if(opts)iw.setOptions(opts);
    return iw;
  }

  publicObj.addInfoWindow = function(key, data, marker){
    const infoWindow = _newInfoWindow({content: '<div id="content">'+data.name+'</div>'}, data);

    infosMng.set("infoWindow.iws." + key, infoWindow);
    infoWindow.open(NoblMap.map, marker);
  }


  publicObj.removeInfoWindow = function(name) {
    const iw = infosMng.get("infoWindow.iws." + name);
    iw.setMap(null);
    infosMng.del("infoWindow.iws." + name);
  }

  publicObj.removeInfoWindows = function() {
    const iws = infosMng.get("infoWindow.iws");
    _.each(iws, (iw) => {
      iw.setMap(null);
    });
    infosMng.del("infoWindow.iws");
  }

  return publicObj;
}());

export {marker, infoWindow};
