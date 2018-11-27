<template>
  <!-- App -->
  <div id="app">
    <f7-statusbar></f7-statusbar>
    <!-- Left Panel -->
    <f7-panel left cover>
      <f7-view name="left" url="/panel-left/"></f7-view>
    </f7-panel>

      <!-- Main View -->
    <f7-view id="main-view" url="/loading" main></f7-view>

    <!-- 일부러 url에 /404를 넣었다.
    원래 페이지를 넣으면 값이 없어서 오류가 나고
    안 넣으면 (:init="false") empty view가 생성이 되지 않아서
    팝업을 empty로 빼지 못하고 다른 view에서 생성되거나 오류가 난다.
    그래서 오류없는 /404를 넣어서 empty-view 객체를 생성하였다.
    view 객체는 app.$f7.views 여기서 확인할 수 있다. -->
    <!-- <div id="controlDiv"></div> -->
    <f7-popup id="popup-menu" tablet-fullscreen>
      <f7-view class="popup-menu-view"></f7-view>
    </f7-popup>

    <f7-popup id="popup-menu-detail" tablet-fullscreen>
      <f7-view class="popup-menu-detail-view"></f7-view>
    </f7-popup>

    <f7-popup id="popup-trek" tablet-fullscreen>
      <f7-view class="popup-trek-view"></f7-view>
    </f7-popup>

    <f7-popup id="popup-trek-course" tablet-fullscreen>
      <f7-view class="popup-trek-course-view"></f7-view>
    </f7-popup>
  </div>
</template>


<script>
export default {}
</script>
