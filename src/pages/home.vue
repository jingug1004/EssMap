<template>
  <f7-page>
    <div id="content">
      <div id="map"></div>
      <div id="fabArea">
        <Navbar />
        <Buttons />
        <Compass />
        <Weather />
      </div>
    </div>
    <Actionbar />
    <BusStationSheet />
    <CultureEventSheet />
    <TrekCourseListSheet />
  </f7-page>
</template>
<script>
import Navbar from '@/pages/home_navbar';
import Weather from '@/pages/home_weather';
import Buttons from '@/pages/home_buttons';
import Compass from '@/pages/home_compass';
import Actionbar from '@/pages/home_actionbar';
import BusStationSheet from '@/pages/home_BusStationSheet';
import CultureEventSheet from '@/pages/home_CultureEventSheet';
import TrekCourseListSheet from '@/pages/TrekCourseListSheet';

export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath()
    }
  },
  created() {
  },
  on: {
    pageInit(event, pageData) {
      const mapAreaId = "map";
      const mng = Manage.mng;
      $$("#"+mapAreaId).css("height", ( innerHeight - 10 )+"px");
      NoblMap.init(mapAreaId).then(()=>{});
      setLocale();
    }
  },
  methods: {
  },
  components: {
    Navbar, Weather, Buttons, Compass, BusStationSheet, CultureEventSheet, TrekCourseListSheet, Actionbar
  }
}
</script>
