import * as Manage from '@/js/Manage';

const mng = Manage.mng;
const _ = mng._;
const infosMng = Manage.infosMng;

const publicServiceKey = "8ES06buQEh86VT%2B6GO7W2auOWjo1FJTxRILkYZdGEPiJSZ7Tq7IWBhzu4vqLUDNU1wNa0NkulKxB38wSXRzfLQ%3D%3D";

const openApiPromise = function(url) {
  return Ajax.getPromise2({url:"/etc/getOpenAPI", method:"POST", data:{url}});
}

const _makeQuerystring = function(datas, sigun_nm) {
  let queryString = [];
  _.each(datas.params, (value, key) => {
    queryString.push(key+"="+value);
  });
  if(sigun_nm)
    queryString.push("SIGUN_NM="+encodeURI(sigun_nm));
  return datas.url + "?" + queryString.join("&");
}

const _makeQuerystringParams = function(datas, keyArr, ...values) {
  let queryString = [];
  _.each(datas.params, (value, key) => {
    queryString.push(key+"="+value);
  });
  _.each(keyArr, (key, idx)  => {
    queryString.push(key+"="+values[idx]);
  });

  return datas.url + "?" + queryString.join("&");
}

const _getPublicData = function(datas, sigun_nm) {
  return mng.promise(function(resolve, reject){
    Ajax.getPromise({url:_makeQuerystring(datas, sigun_nm)}).then((result) => {
      return resolve(result.data[datas.name][1].row);
    });
  });
}

let PublicDatas = (function(){
  let publicObj = {};

  return publicObj;
}());

let CultureEvent = (function(){
    let publicObj = {};
    publicObj.prev_begin_de = 10; // 축제 시작 10일전

    const _dateToNum = function(str) {
      return new Date(str).format("yyyyMMdd").toNum();
    }

    // 경기데이터 문화축제 현황
    const _CultureFestival = {
      // url : "https://openapi.gg.go.kr/Ggculturevent",
      name : "CultureFestival",
      url : "https://openapi.gg.go.kr/CultureFestival",
      params: {
        key : "0bbd720427f84edbb489ee86cd1f1341",
        Type: "json",
        pIndex:1,
        pSize:10
      }
    }

    // 경기데이터 공연행사정보 현황 // 성남시 데이터 안보임 1000개 받아서 봐도 안나옴.
    const _PerformanceEvent = {
      name: "PerformanceEvent",
      url : "https://openapi.gg.go.kr/PerformanceEvent",
      params: {
        key : "0bbd720427f84edbb489ee86cd1f1341",
        Type: "json",
        pIndex:1,
        pSize:10
      }
    }

    // 경기도 문화 행사 현황
    const _Ggculturevent = {
      name: "Ggculturevent",
      url : "https://openapi.gg.go.kr/Ggculturevent",
      params: {
        key : "0bbd720427f84edbb489ee86cd1f1341",
        Type: "json",
        pIndex:1,
        pSize:10
      }
    }


    const dataFilter_RANGE = function(datas) {
      const toDay = _dateToNum(new Date().format("yyyy-MM-dd"));

      // 축제기간 필터
      return datas.filter((data) => {
        if((_dateToNum(data.FASTVL_BEGIN_DE) -publicObj.prev_begin_de) < toDay && (_dateToNum(data.FASTVL_END_DE)) >= toDay) {
          return true;
        }
      });
    }

    const dataFilter_RANGE_Ggculturevent = function(datas) {
      const toDay = _dateToNum(new Date().format("yyyy-MM-dd"));

      // 축제기간 필터
      return datas.filter((data) => {
        let event_perd = data.EVENT_PERD.split(" ~ ");
        if((_dateToNum(event_perd[0]) - publicObj.prev_begin_de) < toDay && (_dateToNum(event_perd[1])) >= toDay) {
          return true;
        }
      });
    }

    const _setLatlng = function(address, data) {
      return mng.promise(function(resolve, reject){
        address = address.split(/[\d]층|\(/)[0];
        Ajax.run({url:"http://maps.googleapis.com/maps/api/geocode/json?language=ko&address=" + encodeURI(address)}, (result) => {
          if(result.results[0].geometry) {
            const location = result.results[0].geometry.location;
            data.lat = location.lat;
            data.lng = location.lng;
            resolve();
          }else{
            reject();
          }
        });
      });
    }

    // _Ggculturevent 여기선 위경도 정보가 없어서 주소를 기반으로 위경도를 가져온다.
    const _setLatlngWrap = function(datas, func) {
      const promises = [];
      _.each(datas, (data) => {
        promises.push(_setLatlng(data.EVENT_PLC, data));
      });

      return Ajax.promiseAll(promises);
    }

    const _markerData_CultureFestival = function(datas) {
      const newDatas = [];
      _.each(datas, (data, idx) => {
        newDatas.push({
          ...data,
          type:"cultureFestival",
          lat: data.REFINE_WGS84_LAT.toNum(),
          lng: data.REFINE_WGS84_LOGT.toNum(),
          key: "CF_" + idx,
          // key: "CF_" + data.REFINE_WGS84_LAT,
          text: data.TMP01,
        });
      });
      return newDatas;
    }

    const _markerData_PerformanceEvent = function(datas) {
      const newDatas = [];
      _.each(datas, (data, idx) => {
        newDatas.push({
          ...data,
          type:"culturePerformance",
          lat: data.REFINE_WGS84_LAT.toNum(),
          lng: data.REFINE_WGS84_LOGT.toNum(),
          key: "CP_" + idx,
          // key: "CP_" + data.REFINE_WGS84_LAT,
          text: data.EVENT_TITLE,
        });
      });
      return newDatas;
    }

    const _markerData_GgEvent = function(datas) {
      const newDatas = [];
      _.each(datas, (data, idx) => {
        newDatas.push({
          ...data,
          type:"culturGgEvent",
          key: "CE_" + idx,
          // key: "CE_" + data.lat,
          text: data.TITLE,
        });
      });
      return newDatas;
    }


    const _setCultureMarkers = function(datas) {
      let cultureList = [];
      _.each(datas, (data) => {
        cultureList.push({
          ...data,
          text_direction: "bottom",
          icon_label: "map-icon-travel-agency",
          fill_color: "#55ee77"});
      });

      const groupMarker = NoblMap.CustomMarkers.addIconGroupMarker(cultureList, "culture", 12);
      groupMarker.markerLayer.on("click", ".iconMarker", (e) => {
        // (e.stopPropagation) && e.stopPropagation();
        NoblMap.stopCircle = true;
        const key = $$(e.target).parent().attr("id");
        const options = groupMarker.datas.filter((data) => data.key === key)[0];
        NoblMap.cultureData = options;
        NoblMap.PublicDatas.CultureEvent.openSheetDetail();
      });
    }


    publicObj.getCultureFestival = function(sigun_nm) {
      _getPublicData(_CultureFestival, sigun_nm).then((datas) => {
        // 축제 지역 필터
        datas = dataFilter_RANGE(datas);
        if(datas.length > 0) {
          _setCultureMarkers(_markerData_CultureFestival(datas));
        }
      });

      _getPublicData(_PerformanceEvent, sigun_nm).then((datas) => {
        datas = dataFilter_RANGE(datas);
        if(datas.length > 0) {
          _setCultureMarkers(_markerData_PerformanceEvent(datas));
        }
      });

      _getPublicData(_Ggculturevent, sigun_nm).then((datas) => {
        datas = dataFilter_RANGE_Ggculturevent(datas);
        if(datas.length > 0) {
          _setLatlngWrap(datas).then(function(){
            _setCultureMarkers(_markerData_GgEvent(datas));
          });
        }
      });
    }

    publicObj.openSheetDetail = function() {
      mng.getSheetName("cultureSheet", $$("#cultureSheet")).open();
    }

    publicObj.setCultureEvent = function() {
      publicObj.getCultureFestival("성남시");
    }

    return publicObj;
}());
PublicDatas.CultureEvent = CultureEvent;

let BusStation = (function(){
  let publicObj = {};

  const _BusStation = {
    url : "http://openapi.gbis.go.kr/ws/rest/busstationservice/searcharound",
    params : {
      serviceKey : publicServiceKey
    }
  }

  const _BusStationArriveInfo = {
    url : "http://openapi.gbis.go.kr/ws/rest/busarrivalservice/station",
    params : {
      serviceKey : publicServiceKey
    }
  }

  const _BusStationRouteInfo = {
    url : "http://openapi.gbis.go.kr/ws/rest/busstationservice/route",
    params : {
      serviceKey : publicServiceKey
    }
  }

  // 화면 중앙 기준 주변 정류장 가져오기
  publicObj.around = function() {
    const center = NoblMap.map.getCenter(),
          url = _makeQuerystringParams(_BusStation, ["x", "y"], center.lng(), center.lat());
    Ajax.run({url:"/etc/getOpenAPI", method:"POST", data:{url}}, (datas) => {
      let groupMarker = infosMng.get("markers.groupMarkers.icon.bus");
      if(groupMarker) {
        groupMarker.onRemove();
        infosMng.del("markers.groupMarkers.icon.bus");
      }

      let busList = [];
      const list = datas.response.msgBody && datas.response.msgBody.busStationAroundList;
      _.each(list, (busStation) => {
        busList.push({
          type:"bus",
          lat: busStation.y._text.toNum(),
          lng: busStation.x._text.toNum(),
          key: "b"+busStation.stationId._text,
          text: busStation.stationName._text,
          icon_label: "map-icon-bus-station",
          fill_color:"#22BBEE"});
      });
      groupMarker = NoblMap.CustomMarkers.addIconGroupMarker(busList, "bus", 18);

      groupMarker.markerLayer.on("click", ".pictoMarker", (e) => {
        // (e.stopPropagation) && e.stopPropagation();
        // (e.preventDefault) && e.preventDefault();
        NoblMap.stopCircle = true;
        const key = $$(e.target).parent().attr("id");
        const options = groupMarker.datas.filter((data) => data.key === key)[0];
        NoblMap.stationName = options.text;
        NoblMap.PublicDatas.BusStation.busArrive(options.key.substring(1));
      });
    });
  }
  publicObj.around_debounce = _.debounce(publicObj.around, 500);

  publicObj.makeMap = function(array, keyName) {
      let resultMap = {};
      if(mng.isArray(array)){
        _.each(array, (data) => {
          resultMap["r"+data[keyName]._text] = data;
        });
      }else{
        resultMap["r"+array[keyName]._text] = array;
      }

      return resultMap;
  }

  const getArriveInfo = function(data) {
    let arriveArray = [];
    if(data) {
      arriveArray.push({
        locationNo : data.locationNo1._text,      // 차량 위치 정보(위경도) 라는데 가져오는 건 숫자임. (2, 11) 이런식... 남은 정류장 수 같은데 확실하진 않음.
        lowPlate : data.lowPlate1._text,          // 저상 버스
        plateNo : data.plateNo1._text,            // 차량 정보(경기70아8857)
        predictTime : data.predictTime1._text,         // 도착 예상 시간.
        remainSeatCnt : data.remainSeatCnt1._text // 남은 좌석 수 -1 정보 없음.
      });

      if(data.locationNo2._text){
        arriveArray.push({
          locationNo : data.locationNo2._text,
          lowPlate : data.lowPlate2._text,
          plateNo : data.plateNo2._text,
          predictTime : data.predictTime2._text,
          remainSeatCnt : data.remainSeatCnt2._text
        });
      }
    }
    return arriveArray;
  }

  // 정류장 버스 도착 정보 가져오기
  publicObj.busArrive = function(stationId) {
    const arriveUrl = _makeQuerystringParams(_BusStationArriveInfo, ["stationId"], stationId),
          routeUrl = _makeQuerystringParams(_BusStationRouteInfo, ["stationId"], stationId);

    Ajax.promiseAll([openApiPromise(arriveUrl), openApiPromise(routeUrl)]).then((datas) => {
      const arriveDatas = datas[0].response.msgBody && publicObj.makeMap(datas[0].response.msgBody.busArrivalList, "routeId") || null,
            routeDatas  = datas[1].response.msgBody && publicObj.makeMap(datas[1].response.msgBody.busRouteList, "routeId") || null;
      const routeInfo = [];
      // console.log(arriveDatas, routeDatas)
      _.each(routeDatas, (data, key) => {
        routeInfo.push({
          routeId : key,
          routeNm : data.routeName._text,
          arriveInfo: getArriveInfo(arriveDatas && arriveDatas[key])
        });
      });

      NoblMap.routeInfo = routeInfo;
      mng.getSheetName("busSheet", $$("#busSheet")).open();
    });
  }
  return publicObj;
}());
PublicDatas.BusStation = BusStation;


// 날씨 정보를 그냥 가져오기로 함.
let Weather = (function() {
  let publicObj = {};

  const _WeahterUrl = function() {
    const xy = mng.getWeatherXY();
    const d = new Date().minus("hour", 1);
    const _Weather = {
      url : "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastGrib",
      params : {
        serviceKey : publicServiceKey,
        base_date: d.format("yyyyMMdd"),
        base_time: d.format("HHmm"),     // 현재시간에서 한시간 이전 정보를 가져옴.
        nx:xy.x,
        ny:xy.y,
        _type:"json"
      }
    };
    return _makeQuerystring(_Weather);
  }

  const _DustUrl = function() { // 미세먼지
    const _Dust = {
      url : "http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst",
      params : {
        serviceKey : publicServiceKey,
        sidoName : encodeURI(mng.getGSido()),
        searchCondition: "HOUR",
        numOfRows: 40
      }
    };
    return _makeQuerystring(_Dust);
  }

  const code = {};
  code.SKY = {1:"맑음", 2:"구름조금", 3:"구름많음", 4:"흐림"}; // 하늘상태
  code.PTY = {0:"", 1:"비", 2:"비/눈", 3:"눈"}; // 강수형태
  code.LGT = {0:false, 1:true}; // 낙뢰 0 없음 1 있음

  const _getWeatherInfo = function(items, category) {
    return items.filter((item) => item.category === category).first().obsrValue;
  }

  const _getNumberWeatherIcon = function(SKY, PTY, LGT) {
    let num = "01";
    if(LGT === 1) {
      if(SKY === 4 && PTY === 0) {
        num = "11";
      }else if(PTY === 1) {
        num = "12";
      }else if(PTY === 2) {
        num = "14";
      }else if(PTY === 3) {
        num = "13";
      }
    }else{
      if(SKY === 2) {
        num = "02";
      }else if(SKY === 3) {
        if(PTY === 0) {
          num = "03";
        }else if(PTY === 1) {
          num = "04";
        }else if(PTY === 2) {
          num = "06";
        }else if(PTY === 3) {
          num = "05";
        }
      }else if(SKY === 4) {
        if(PTY === 0) {
          num = "07";
        }else if(PTY === 1) {
          num = "08";
        }else if(PTY === 2) {
          num = "10";
        }else if(PTY === 3) {
          num = "09";
        }
      }
    }
    return num;
  }

  const _dustState = function(type, value) {
    let state = "";
    if(type === "PM10") {
      if(0 <= value && value <= 30) {
        state = "좋음";
      }else if(30 < value && value <= 80) {
        state = "보통";
      }else if(80 < value && value <= 150) {
        state = "나쁨";
      }else if(150 < value ) {
        state = "매우나쁨";
      }
    }else if(type === "PM25") {
      if(0 <= value && value <= 15) {
        state = "좋음";
      }else if(15 < value && value <= 35) {
        state = "보통";
      }else if(35 < value && value <= 75) {
        state = "나쁨";
      }else if(76 < value ) {
        state = "매우나쁨";
      }
    }
    return state;
  }

  publicObj.weatherInfos = function() {
    return mng.promise(function(resolve, reject) {
      Ajax.promiseAll([openApiPromise(_WeahterUrl()), openApiPromise(_DustUrl())]).then((datas) => {
        const cityName = mng.getGName();
        if(datas[1].response.body) {
          const dust = datas[1].response.body.items.item.filter((item)=> item.cityName._text === cityName)[0];
          const pm10Value = dust.pm10Value._text.toNum();
          const weatherItem = datas[0].response.body.items.item;
          const icon = _getNumberWeatherIcon(_getWeatherInfo(weatherItem, "SKY"), _getWeatherInfo(weatherItem, "PTY"), _getWeatherInfo(weatherItem, "LGT"));
          resolve({
            temp: _getWeatherInfo(weatherItem, "T1H"), // 기온
            icon,
            dust_desc: _dustState("PM10", pm10Value),
            dust_value: pm10Value
          });
        }else{
          reject({error:true});
        }
      });
    });
  }

  publicObj.weatherInfos = function() {
    return mng.promise(function(resolve, reject) {
      Ajax.promiseAll([openApiPromise(_WeahterUrl()), openApiPromise(_DustUrl())]).then((datas) => {
        const cityName = mng.getGName();
        if(datas[1].response.body) {
          const dust = datas[1].response.body.items.item.filter((item)=> item.cityName._text === cityName)[0];
          const pm10Value = dust.pm10Value._text.toNum();
          const weatherItem = datas[0].response.body.items.item;
          const icon = _getNumberWeatherIcon(_getWeatherInfo(weatherItem, "SKY"), _getWeatherInfo(weatherItem, "PTY"), _getWeatherInfo(weatherItem, "LGT"));
          resolve({
            temp: _getWeatherInfo(weatherItem, "T1H"), // 기온
            icon,
            dust_desc: _dustState("PM10", pm10Value),
            dust_value: pm10Value
          });
        }else{
          reject({error:true});
        }
      });
    });
  }

  return publicObj;
}());
PublicDatas.Weather = Weather;

let Toilet = (function() {
  let publicObj = {};
  const _ToiletUrl = function() { // 미세먼지
    const _Toilet = {
      url : "https://openapi.gg.go.kr/Publtolt",
      params : {
        key : "0bbd720427f84edbb489ee86cd1f1341",
        SIGUN_NM : mng.getGName(),
        Type: "json",
        pSize: 500 // 성남은 297 개 나옴.
      }
    };
    return _makeQuerystring(_Toilet);
  }


  publicObj.toiletInfos = function() {
    if(infosMng.get("datas.toilet")) {
      NoblMap.CustomMarkers.addToiletGroupMarker(infosMng.get("datas.toilet"));
    }else{
      Ajax.run({url:_ToiletUrl()}, (datas) => {
        let rows = datas.Publtolt[1].row,
            newRows = [];
        _.each(rows, (row, idx) => {
          if(row.REFINE_WGS84_LAT) {
            newRows.push({
              key: "key"+ ("000" +  idx).slice(-3),
              lat : row.REFINE_WGS84_LAT.toNum(),
              lng : row.REFINE_WGS84_LOGT.toNum()
            });
          }
        });
        console.log("화장실",newRows);
        NoblMap.CustomMarkers.addToiletGroupMarker(newRows);
        infosMng.set("datas.toilet", newRows);
      });
    }
  }
  return publicObj;
}());
PublicDatas.Toilet = Toilet;

export default PublicDatas;
