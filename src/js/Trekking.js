import _ from 'lodash';

let Trek = (function(){
  let publicObj = {};
  publicObj.timeoutId = null;
  publicObj.time = 10000;

  const _userTrekking = function() {
    let data = {
      lat : NoblMap.geolocation.nowLocation.lat,
      lng : NoblMap.geolocation.nowLocation.lng,
      uid : Manage.cookie.getUid()
    };

    if(data.uid && data.lat)  {
      Ajax.run({url:"/leisure/trek/update", method:"POST", data, token:true}, (datas)=>{
        if(!datas.ecode){
          console.log(new Date().format("yyyy-MM-dd HH:mm:ss"), datas);
          NoblMap.setCenterZoom(datas.lat, datas.lng, 18);
          NoblMap.marker.starMarker(datas);
          Ajax.run({url:"/leisure/trek/course/sectors", method:"POST", data:{"tc_id":datas.tc_id}, token:true}, function(sectorDatas){
            NoblMap.polyline.removePolyline();
            Manage.mng._.each(sectorDatas.list, (data) => {
              NoblMap.polyline.addPath(data);
            });
            NoblMap.setCenterZoom(datas.lat, datas.lng, 18);
          });
        }else{
          // console.log(datas);
        }
      });
    }
  }

  publicObj.setUserTrekking = function() {
    _userTrekking();
    if(publicObj.timeoutId) {
      clearTimeout(publicObj.timeoutId);
    }
    publicObj.timeoutId = setTimeout(publicObj.setUserTrekking, publicObj.time);
  }



  return publicObj;
}());

setTimeout(function() {
  Trek.setUserTrekking();
}, 10000);

export default Trek;
