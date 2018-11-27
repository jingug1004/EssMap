<template>
    <div id="app">
      <div id="loadingArea">
        <div class="loadingImg">
          <img :src="ImgPath + 'images/mascot.png'" />
        </div>
        <div id="lottieDiv"></div>
      </div>
    </div>
</template>
<script>

import lottieMng from '@/js/lottie';

import * as Manage from '@/js/Manage';
import GMap from '@/js/GoogleMap';
window.NoblMap = GMap;
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath(),
    }
  },
  mounted() {
    $$("#loadingArea").css({"height": innerHeight+"px", "background-color":"#E84200"});
    this.setLottie();
    setTimeout(()=>{
      Manage.mng.goPage("#main-view","/Home");
    }, 3000);
  },
  methods: {
    setLottie() {
      lottieMng.makeLottie({
        container : document.getElementById("lottieDiv"),
        path: this.ImgPath + "datas/lottie/loading.json"
        // path: this.ImgPath + "datas/lottie/data_01.json"
      });
    },
  }
}
</script>
