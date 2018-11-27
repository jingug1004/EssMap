import * as Manage from '@/js/Manage';
const mng = Manage.mng;
const _ = mng._;

const Header = (function(){
  let publicObj = {};
  publicObj.status = false;

  const _setHeaderDatas = function() {
    _.each(NoblMap.infos.headers, (data) => {
      data.bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(data.sw.lat, data.sw.lng),
        new google.maps.LatLng(data.ne.lat, data.ne.lng)
      );
    });
    publicObj.status = true;
  }

  const _containsHeaders = function() {
    if(!publicObj.status) {
      _setHeaderDatas();
    }

    const zoom = NoblMap.map.getZoom();
    const headers = [];
    _.each(NoblMap.infos.headers, (data) => {
      if(NoblMap.map.getBounds().intersects(data.bounds) && data.zoom <= zoom && (data.zoom + 3) > zoom){
        headers.push(data);
      }
    });
    return headers;
  }

  const _setHeader = function(header) {
    $$(".fab-left-top.txt").text(header || Manage.mng.getGName());
  }

  const changeHeader = function() {
    const headerDatas = _containsHeaders(),
          length = headerDatas.length;

    let headerTxt =  "",
        activeHeader;

    if(length === 0) {
      headerTxt = null;
    }else if(length === 1) {
      activeHeader = headerDatas[0];
      headerTxt = activeHeader.text;
    }else {
      const center = NoblMap.map.getCenter();
      let distances = [],
          distanceMap = {};

      _.each(headerDatas, (data) => {
        const boundsCenter = data.bounds.getCenter()
        let distance = mng.calcDistance(center.lat(), center.lng(), boundsCenter.lat(), boundsCenter.lng());
        distances.push(distance);
        distanceMap[distance] = data;
      });
      activeHeader = distanceMap[Math.min(...distances)];
      headerTxt = activeHeader.text;
    }

    if(activeHeader) {
      headerTxt = mng.getGName() + "-" + activeHeader.text;
    }

    _setHeader( headerTxt );
  }
  publicObj.changeHeader_debounce = _.debounce(changeHeader, 200);

  return publicObj;
}());

export default Header;
