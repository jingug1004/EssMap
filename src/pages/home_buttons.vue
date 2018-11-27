<template>
  <div>
    <div class="fab fab-left-top txt">
      {{ gName }}
    </div>
    <div class="fab fab-right-top btn">
      <a href="#" class="reduce-home-button">
        <i class="icon f7-icons ios-only">bars</i>
        <i class="icon f7-icons ios-only">close</i>
        <i class="icon material-icons md-only reduce-home-button-inner">menu</i>
        <i class="icon material-icons md-only reduce-home-button-inner">close</i>
      </a>
      <div class="fab-buttons fab-buttons-left fab-close fab-buttons-reduce-size">
        <a class="fab-close reduce-home-button01s" href="#">
          <i class="icon f7-icons ios-only">world</i>
          <i class="icon material-icons md-only reduce-home-button-inner-language">language</i>
        </a>
        <a class="fab-close reduce-home-button01s" @click="trekking">
          <img :src='ImgPath+"images/icon_course_track.svg"' class="imgLevel2">
        </a>
        <!--<a class="fab-close" @click="mygps">-->
          <!--<img :src='ImgPath+"images/icon_gps.png"' class="imgLevel2">-->
        <!--</a>-->
        <a class="fab-close reduce-home-button01s reduce-home-button01s-fontsize" @click="changeLang">
          {{ $t("DEFINE_LANGUAGE") }}
        </a>
        <!-- <a class="fab-close" href="#" @click="fullscreen">
          Full
        </a> -->
      </div>
    </div>

    <div class="fab fab-right-top btn2 actions-open" data-actions="#actions">
      <a href="#" class="reduce-home-button">
        <!-- <img :src='ImgPath+"icons/map-marker-icon.png"' class="imgLevel1"> -->
        <img :src='ImgPath+"images/map_marker_icon.svg"' class="imgLevel1">
      </a>
    </div>

    <div class="fab fab-right-top btn3" @click="zoomIn">
      <a href="#" class="reduce-home-button">
        <i class="icon f7-icons ios-only">add</i>
        <i class="icon material-icons md-only reduce-home-button-inner">add</i>
      </a>
    </div>

     <div class="fab fab-right-top btn4" @click="zoomOut">
      <a href="#" class="reduce-home-button">
        <i class="icon f7-icons ios-only">delete</i>
        <i class="icon material-icons md-only reduce-home-button-inner">remove</i>
      </a>
    </div>

    <div class="fab fab-right-top btn5" @click="mygps">
      <a href="#" class="reduce-home-button">
        <img :src='ImgPath+"images/icon_gps.svg"' class="imgLevel3">
      </a>
    </div>

    <div class="fab fab-right-top btn6" @click="setCenter">
      <a href="#" class="reduce-home-button">C</a>
    </div>
            <!-- <div class="fab fab-right-top btn5" @click="test">
          <a href="#">
            <i class="icon f7-icons ios-only">reload</i>
            <i class="icon material-icons md-only">cached</i>
          </a>
        </div> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath(),
      gName:Manage.mng.getGName()
    }
  },
  methods: {
    zoomIn: function (event) {
      NoblMap.zoomChange(1);
    },
    zoomOut: function(event) {
      NoblMap.zoomChange(-1);
    },
    fullscreen: function() {
      //OsdMap.fullscreen();
    },
    changeLang: function(e) {
        const languages = ["ko", "en"];
        const lang = isLang();
        changeLanguage(languages.filter((langs) => lang !== langs).get(0));
    },
    mygps(){
      NoblMap.geolocation.getCurrentPosition();
    },
    setCenter(){
      const center = NoblMap.center;
      NoblMap.setCenterZoom(center.lat, center.lng, 12);
    },
    trekking() {
      // NoblMap.CustomMarkers.addIconTextGroupMarker("djc");
    }
  }
}
</script>
