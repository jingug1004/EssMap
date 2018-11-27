// Import Vue
import Vue from 'vue';
import i18next from 'i18next';
import VueI18Next from '@panter/vue-i18next';
// import "babel-polyfill";
require('core-js');

// Import F7
import Framework7 from 'framework7/dist/framework7.esm.bundle.js';

// Import F7 Vue Plugin
import Framework7Vue from 'framework7-vue/dist/framework7-vue.esm.bundle.js';

// Import F7 Styles
import Framework7Styles from 'framework7/dist/css/framework7.css';

import MapIconStyle from 'map-icons/dist/css/map-icons.min.css';

import AlertifyStyle from '@/plugins/alertify/css/alertify.min.css';
import AlertifyThemeStyle from '@/plugins/alertify/css/themes/default.min.css';


// Import Icons and App Custom Styles
import IconsStyles from '@/css/icons.css';
import AppStyles from '@/css/app.css';
import FontStyles from '@/css/font.css';

// Import Routes
import Routes from '@/js/routes.js'

// Import App Component
import App from '@/app';

import VueAxios from 'vue-axios'
import VueAuthenticate from 'vue-authenticate'
import axios from 'axios';

import Ajax from '@/js/Ajax';
import * as Manage from '@/js/Manage';
import msg from '@/js/Alert';
import GLOBAL_CONSTS from '@/js/GLOBAL_CONSTS';
window.GLOBAL_CONSTS = GLOBAL_CONSTS;
window.Ajax = Ajax;
window.Manage = Manage;
window.msg = msg;

// Init F7 Vue Plugin
Vue.use(VueI18Next);
Vue.use(Framework7Vue, Framework7);
Vue.prototype.$http = axios;
const googleKey = Manage.mng.getApiKey("GOOGLE");
const baseUrl = location.origin ;//+ ":3009";

Vue.use(VueAxios, axios);
Vue.use(VueAuthenticate, {
  baseUrl: baseUrl, // Your API domain
  providers: {
    google: {
      clientId: googleKey.clientId,
      redirectUri: baseUrl + googleKey.redirectUri // Your client app URL
    }
  }
});

let lang = navigator.language.split("-")[0];
let langIdx = Manage.mng._.findIndex(["ko", "en"], (ln) => ln === lang);
if(langIdx === -1){
  lang = "en";
}

Ajax.run({url:"/etc/stringTable/"+lang}, function(data, res){
  const lang_ko = Manage.lang.setData(data.list);
  i18next.init({
      lng: 'ko',
      fallbackLng: 'ko',
      resources: {
        ko: { translation: lang_ko }
      }
  });

  msg.init(i18next);
  // Init App
  window.app = new Vue({
    el: '#app',
    template: '<app/>',
    // Init Framework7 by passing parameters here
    framework7: {
      id: 'io.framework7.noblapp', // App bundle ID
      name: 'Framework7', // App name
      theme: 'auto', // Automatic theme detection
      // App routes
      routes: Routes,
      precompileTemplates :true,
      template7Pages: true,
      on : {
        resize: function(page) {
          if(NoblMap && NoblMap.map && window.google) {
            google.maps.event.trigger(NoblMap.map, 'resize');
          }
        }
      }
    },
    // Register App Component
    components: {app: App},
    i18n: new VueI18Next(i18next)
  });

  window.$$ = app.$$;
  Manage.lang.i18next = app.$i18n.i18next;


  // 우클릭 막기
  // document.addEventListener('contextmenu', function(event) {
  //   event.preventDefault();
  //   return false;
  // });
  document.addEventListener('gesturestart', function (e) {
	    e.preventDefault();
	});

  // 구글 지도 라이브러리 호출
  Manage.mng.getScriptGoogle();
  Manage.mng.setCategoryMap();
  Ajax.run({url:"/map/imaps"}, function(imaps){
    const headers = [];
    const tile_infos = {};
    let key;
    Manage.mng._.each(imaps.list, (imap) => {
      key = "mid"+ imap.mid;
      if(imap.lat !== 0) {
        const header = JSON.parse(imap.header);
        header.key = key;
        header.text = imap.name;
        header.zoom = imap.zoom;
        headers.push(header);
      }
      tile_infos[key] = JSON.parse(imap.tile_info);
    });

    NoblMap.infos.headers = headers;
    NoblMap.infos.tileInfos = tile_infos;
    NoblMap.infos.imaps = imaps.list;
    NoblMap.overlayMapType.setTileInfo();
  });

  Ajax.run({url:"/map/allplaces"}, (places)=>{
    if(places.list) {
      NoblMap.infos.places= places.list.filter((place) => place.map_type > 0);
    }
  });

});
