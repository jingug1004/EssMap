<template>
  <div id="weather">
    <div class="fab fab-left-bottom">
      <img :src='weatherImg'>
      <div class="temperatureTxt"></div>
      <div class="temperatureTxt"><p>℃</p></div>
      <div class="weatherTxtStyle">
        <div class="weatherTxt"></div>
        <div class="dustTxt" data-i18n="DEFINE_WEATHER_PATICLE"></div>
        <div class="dustValue"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath(),
      weatherImg: ""
    }
  },
  created() {
    const that = this;
    NoblMap.PublicDatas.Weather.weatherInfos().then((data) => {
      if(data.error){
          $$("#weather").hide();
      }else{
        $$("#weather").show();
        that.weatherImg = that.getImg(data.icon);
        $$(".temperatureTxt").eq(0).text(data.temp);
        $$(".weatherTxt").attr("data-i18n", that.getWeather(data.icon));
        // $$(".dustTxt").text(Manage.lang.trans("") +" "+ data.dust_desc);
        $$(".dustValue").text(data.dust_desc+" ("+data.dust_value+")");
        setLocale($$("#weather"));
      }
    });
  },
  methods: {
    getImg(idx) {
      return this.ImgPath + "weather/weather_icons_"+idx+".png";
    },
    getWeather(idx) {
      return "DEFINE_WEATHER_CONDITION_"+idx;
    }
  }
}
</script>
