import $ from 'jquery';
import _ from 'lodash';
import postscribe from 'postscribe';

let mng = {};
mng._ = _;
mng.$ = $;
mng.postscribe = postscribe;
mng.promise = function(fn) {
    return new Promise(function(resolve, reject) {
        fn(resolve, reject);
    });
}

mng.fnRecursive = function(delayTime, checkFn, actionFn, target){
    if(checkFn(target)){
        return actionFn(target);
    }else{
        setTimeout(function(){
            mng.fnRecursive(delayTime, checkFn, actionFn, target);
        }, delayTime);
    }
}

mng.addScript = function(src) {
    mng.$(function(){
        mng.postscribe(mng.$("head"), '<script src="'+src+'"><\/script>');
    });
}

mng.addLocalScript = function(src) {
    mng.$(function(){
        mng.$("head").html('<script src="'+src+'"><\/script>');
    });
}

// lodash 관련
mng.setData = function(target, key, value) {
    _.set(target, key, value);
}

mng.getData = function(target, key) {
    return _.get(target, key);
}

mng.getKeys = function(obj){
    return _.keys(obj);
}

mng.makeMap = function(array, keyName) {
    let resultMap = new Map();
    _.each(array, (item) => {
        resultMap.set(item[keyName], item);
    });

    return resultMap;
}

mng.isArray = function (target){
  return target.constructor === Array;
}

mng.isObject = function (target){
  return target.constructor === Object;
}

mng.merge = function(...objs) {
  return _.extend({}, ...objs);
}


// jquery 관련
mng.getTarget = function(id) {
    return $(id);
}

mng.getTargetById = function(id) {
    return $("#"+id);
}

mng.getIframe = function(id) {
    return this.getTargetById(id).find("iframe").get(0).contentWindow;
}

mng.strToJson = function(str) {
    return JSON.parse(str);
}

mng.jsonToStr = function(json) {
    return JSON.stringify(json);
}



mng.getScriptDaumMap = function() {
    mng.addScript("//dapi.kakao.com/v2/maps/sdk.js?appkey="+ mng.getApiKey("KAKAO").clientId);
}

mng.getScriptKakao = function() {
    mng.addScript("//developers.kakao.com/sdk/js/kakao.min.js");
}

mng.getScriptGoogle = function() {
    mng.addScript("https://maps.googleapis.com/maps/api/js?libraries=geometry&"+ mng.getScriptGoogleParams("language", "key"));
}

mng.getScriptNaver = function() {
    mng.addScript("//static.nid.naver.com/js/naveridlogin_js_sdk_2.0.0.js");
}

mng.getScriptGoogleParams = function(...params) {
    let querys = [];
    _.each(params, (value) => {
        if(value === "key") {
            querys.push(value+"="+mng.getApiKey("GOOGLE").apikey);
        }else if(value === "language") {
            querys.push(value+"="+lang.isLang());
        }else if(value === "region") {
            querys.push(value+"="+"ko");
        }else if(value === "address") {
            //querys.push(value+"="+"yongin");
            querys.push(value+"="+GLOBAL_CONSTS.map_gname_en);
        }else if(value === "koAddress") {
            querys.push("address=korea");
        }else if(value === "places") {
          querys.push("libraries=places");
        }
    });

    return querys.join("&");
}


// mng.getScriptFacebook = function() {
//     mng.addScript("https://connect.facebook.net/en_US/sdk.js");
// }


// app 접근 관련
mng.getDevice = function() {
    return app.$f7.device;
}

mng.goPage = function(viewName, url) {
    app.$f7.views.get($$(viewName)).router.navigate(url);
}

mng.goBack = function(viewName) {
    app.$f7.views.get($$("." + viewName)).router.back();
}

mng.getDialog = function() {
    return app.$f7.dialog;
}

mng.getPopup = function() {
    return app.$f7.popup;
}

mng.openPopup = function(el){
  mng.getPopup().open(el, false);
}

mng.getToast = function() {
    return app.$f7.toast;
}

mng.getSheet = function() {
    return app.$f7.sheet;
}
mng.createSheet = function(el) {
  let sheet = mng.getSheet();
  return sheet.create({
    el,
    backdrop: true
  });
}

mng.getSheetName = function(name, el) {
  if(infosMng.has("sheets."+name)) {
    return infosMng.get("sheets."+name)
  }else{
    const sheet = mng.createSheet(el);
    infosMng.set("sheets."+name, sheet);
    return sheet;
  }
}



// message 창은 여기서 정의
let msg = {};
msg.create = function(options){
    return mng.getDialog().create(options);
}
msg.alert = function(text){
    msg.create({text:text, buttons:[{text:lang.trans("DEFINE_MESSAGE_BUTTON_OK") , bold:true}]}).open();
}

msg.confirm = function(text, okfn, cancelfn){
    msg.create({
        text:text,
        buttons:[{text:lang.trans("DEFINE_MESSAGE_BUTTON_OK"), bold:true, onClick:okfn}, {text:lang.trans("DEFINE_MESSAGE_BUTTON_CANCEL"), bold:true, onClick:cancelfn}]
    }).open();
}

msg.toast = function(text) {
    msg.getToast().create({text:text, position:"center", closeButton:true}).open();

}


// gps 관련 여기서 정의
let gps = {};
gps.plusPoint = function(point, viewport) {
    return {
        x : point.x + viewport.x,
        y : point.y + viewport.y
    };
}

gps.minusPoint = function(point, viewport) {
    return {
        x : point.x - viewport.x * 2,
        y : point.y - viewport.y * 2
    };
}

gps.setGpsData = function(data){
    return {
        MAP_LPOSY: data[1],
        MAP_RPOSY: data[2],
        MAP_LPOSX: data[3],
        MAP_RPOSX: data[4],
        MAP_W: data[5],
        MAP_H: data[6]
    };
}
gps.getLatlngFromPixel = function(point, gpsData, correctionValue){
    gpsData = gpsData || gps.setGpsData(mng.getNowMapData().gps);

    if(correctionValue) {
        point = gps.plusPoint(point, correctionValue);
    }

    let lng = (-(point.x * ((gpsData.MAP_LPOSX - gpsData.MAP_RPOSX) / gpsData.MAP_W)) + gpsData.MAP_LPOSX).toFixedNum(7), // 경도
        lat = ((point.y * (-(gpsData.MAP_LPOSY - gpsData.MAP_RPOSY) / gpsData.MAP_H)) + gpsData.MAP_LPOSY).toFixedNum(7); // 위도

    return {lat, lng};
}

gps.getPixelFromLatlng = function(point, gpsData, correctionValue){
    gpsData = gpsData || gps.setGpsData(mng.getNowMapData().gps);

    let x = (-(point.y - gpsData.MAP_LPOSX) / ((gpsData.MAP_LPOSX - gpsData.MAP_RPOSX) / gpsData.MAP_W)).toFixedNum(0),
        y = ((point.x - gpsData.MAP_LPOSY) / (-(gpsData.MAP_LPOSY - gpsData.MAP_RPOSY) / gpsData.MAP_H)).toFixedNum(0);

    if(correctionValue) {
        point = gps.plusPoint({x, y}, correctionValue);
        x = point.x;
        y = point.y;
    }
    return {x, y};
}

gps.getLatlngFromPixelTest = function(point, viewport){
    return gps.getLatlngFromPixel(point, gps.setGpsData(mng.getMapData(gps.getMapName()).gps), viewport);
}

gps.getPixelFromLatlngTest = function(point, viewport){
    return gps.getPixelFromLatlng(point, gps.setGpsData(mng.getMapData(gps.getMapName()).gps), viewport);
}

gps.getMapName = function() {
    if(NoblMap.beforeMap.length) {
        return NoblMap.beforeMap.last().name
    }else{
        return mng.getMapNameDefault();
    }
}

// 상수 관련 함수
mng.getGid = function() {
    return GLOBAL_CONSTS.map_gid;
}

mng.getGName = function() {
    return GLOBAL_CONSTS.map_gname;
}

mng.getGSido = function() {
    return GLOBAL_CONSTS.map_gSido;
}

mng.getWeatherXY = function() {
  return GLOBAL_CONSTS.map_weather_xy;
}


mng.setChangeMapData = function(mapName) {
    GLOBAL_CONSTS.MAP_NOW = GLOBAL_CONSTS.MAP_JSON_SET[mapName];
}

mng.setChangeMapDaumData = function(mapData) {
    GLOBAL_CONSTS.MAP_NOW = mapData;
}

mng.getNowMapData = function() {
    return GLOBAL_CONSTS.MAP_NOW;
}

mng.getMapData = function(mapName) {
    return GLOBAL_CONSTS.MAP_JSON_SET[mapName];
}

mng.getImgPath = function() {
    return GLOBAL_CONSTS.IMG_PATH;
}

mng.getImgUrl = function(asset, id, file) {
  let url = "";
  if(location.hostname === "localhost"){
    url = Ajax.url;
  }else{
    url = Ajax.uri;
  }
  url += "/assets";
  url += ((asset)?"/"+asset:"");
  url += ((id)?"/"+id:"");
  url += ((file)?"/"+file:"");
  return url;
}

mng.getMapNameDefault = function(){
    return GLOBAL_CONSTS.MAIN_MAP_NAME;
}

mng.getCategory = function(name) {
    return GLOBAL_CONSTS.CATEGORY[name];
}

mng.getApiKey = function(name){
    return GLOBAL_CONSTS.APIKEYS[name];
}

mng.toArray = function( map, key ) {
    let datas;
    if(key === "key") {
        datas = map.keys();
    }else{
        datas = map.values();
    }

    return Array.from( datas );
}

mng.setCategoryMap = function(){
    Ajax.run({url:"/map/categories/"+ lang.isLang()},
      function(data, res){
        window.categoryMap = Manage.mng.makeMap(data.list, "cid");
      }
    );
}

mng.getSpotList = function (cid){
    return Ajax.getPromise({url:"/map/mappedPlaces/"+cid+"/"+lang.isLang()});
}

// localStorage 관련
mng.setUserId = function(userId){
    mng.setItem("userId", userId);
}

mng.getUserId = function(){
    return mng.getItem("userId");
}

mng.setItem = function(key, value){
    localStorage.setItem(key, value);
}

mng.getItem = function(key){
    return localStorage.getItem(key);
}

mng.textWidth = function(text, fontSize) {
  if($$("#textWidth").length === 0) {
    $$("body").append("<span id='textWidth' style='display:hidden;'>");
  }
  $$("#textWidth").css("font-size", (fontSize || 12)+"px").html(text);
  return $("#textWidth").outerWidth();
}

mng.calcDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2-lat1).toRad();
  const dLon = (lon2-lon1).toRad();
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}


// String, Number 같은 기본 클래스에 prototype으로 함수 추가할때
String.prototype.toNum = function() {
    return Number(this);
}

String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

Number.prototype.toFixedNum = function(num) {
    return this.toFixed(num).toNum();
}

Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}

Array.prototype.get = function(idx) {
    return this[idx];
}

Array.prototype.first = function() {
    return this[0];
}

Array.prototype.last = function() {
    return this[this.length - 1];
}

Array.prototype.remove = function(str) {
  this.splice(_.indexOf(this, str), 1);
  return this;
}

Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";

    let weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    let d = this;

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|ms|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "ms": return d.getMilliseconds().zf(3);
            case "a/p": return d.getHours() < 12 ? locale.meridiem[0] : locale.meridiem[1];
            default: return $1;
        }
    });
};


Date.prototype.minus = function(type, minus) {
    var dat = new Date(this.valueOf());

    if(type === "year"){
        dat.setFullYear(dat.getFullYear() - minus);
    }else if(type === "month"){
        dat.setMonth(dat.getMonth() - minus);
    }else if(type === "date"){
        dat.setDate(dat.getDate() - minus);
    }else if(type === "hour"){
        dat.setHours(dat.getHours() - minus);
    }else if(type === "minute"){
        dat.setMinutes(dat.getMinutes() - minus);
    }else if(type === "second"){
        dat.setSeconds(dat.getSeconds() - minus);
    }
    return dat;
};

Date.prototype.plus = function(type, plus) {
    var dat = new Date(this.valueOf());

    if(type === "year"){
        dat.setFullYear(dat.getFullYear() + plus);
    }else if(type === "month"){
        dat.setMonth(dat.getMonth() + plus);
    }else if(type === "date"){
        dat.setDate(dat.getDate() + plus);
    }else if(type === "hour"){
        dat.setHours(dat.getHours() + plus);
    }else if(type === "minute"){
        dat.setMinutes(dat.getMinutes() + plus);
    }else if(type === "second"){
        dat.setSeconds(dat.getSeconds() + plus);
    }
    return dat;
};



// 비교 함수

let compare = {};
mng.compare = compare;


// i18next 관련
let lang = {};
lang.setData = function(list) {
    let language = {}
    _.each(list, (data) => {
        language[data.cname] = data.str;
    })
    return language;
}

lang.setLocale = function(targetArea) {
    const THAT = lang;
    const dataI18n = "[data-i18n]";

    targetArea = targetArea ? targetArea.find(dataI18n) : $$(dataI18n);
    _.each(targetArea, (target) => {
        const i18n = $$(target).data("i18n").split("."),
              last = i18n.last();
        let value = THAT.trans(i18n[0]);

        if(target.tagName === "INPUT"){
            if(i18n.length === 2 && i18n[1] === "placeholder") {
                target.placeholder = value;
            }else{
                target.value = value;
            }
        }else{
            if(i18n.length === 2 ){
                $$(target).find(i18n[1]).text(value);
            }else{
                $$(target).text(value);
            }
        }
    });
}

lang.trans = function(text) {
    return lang.i18next.t(text);
}

lang.changeLanguage = function(changeLang) {
    if(lang.hasLanguage(changeLang)){
        lang.i18next.changeLanguage(changeLang);
        setLocale();
    }else{
        lang.addLanguage(changeLang);
    }
}

lang.isLang = function() {
    return lang.i18next.language;
}

lang.getStoreData = function() {
    return lang.i18next.store.data[this.isLang()].translation;
}

lang.hasLanguage = function(changeLang) {
    return lang.i18next.store.data[changeLang];
}

lang.addLanguage = function(changeLang) {
    Ajax.run({url:"/etc/stringTable/"+changeLang}, function(data){
        Manage.lang.i18next.addResources(changeLang, "translation", lang.setData(data.list));
        lang.changeLanguage(changeLang);
    });
}

window.setLocale = lang.setLocale;
window.changeLanguage = lang.changeLanguage;
window.isLang = lang.isLang;

let infosMng = {};
infosMng.set = function(key, value) {
  _.set(NoblMap.infos, key, value);
}

infosMng.get = function(key) {
  return _.get(NoblMap.infos, key);
}

infosMng.del = function(key) {
  _.unset(NoblMap.infos, key);
}

infosMng.has = function(key) {
  return !!_.get(NoblMap.infos, key);
}

var cookie = {
	set : function(name, value, expires){
		var curCookie = name + "=" + escape(value)+"; path=/";
		if(expires) {
			 // curCookie += "; expires=" + (new Date()).plus("second", expires).toGMTString()+"; ";
			 curCookie += "; expires=" + (new Date()).plus("second", expires).toGMTString()+"; ";
		 }
		document.cookie = curCookie;
	},
	get : function(cName){
		cName = cName + '=';
        var cookieData = document.cookie,
        	start = cookieData.indexOf(cName),
        	end ,
        	cValue = '';

        if(start !== -1){
            start += cName.length;
            end = cookieData.indexOf(';', start);
            if(end === -1){
            	end = cookieData.length;
            }
            cValue = cookieData.substring(start, end);
        }
        return unescape(cValue);
	},

	del : function(name){
		document.cookie = name+"=;Max-Age=0";
	},

	getToken : function(){
		return this.get("access_token");
	},
	getUid : function(){
		return Number(this.get("uid"));
	},
	getName : function(){
		return this.get("name");
	},
  clearUser : function() {
    this.del("uid");
    this.del("name");
    this.del("access_token");
  }
};

export { mng, lang, msg, gps, infosMng, cookie};
