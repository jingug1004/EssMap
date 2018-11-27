<template>
  <div class="fab fab-right-bottom">
  	<img :src='ImgPath+"images/map_arrows_ns.svg"'/>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath()
    }
  }
}
</script>