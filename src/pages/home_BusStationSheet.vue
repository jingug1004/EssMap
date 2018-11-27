<template>
  <div id="busSheet" class="sheet-modal my-sheet">
    <div class="toolbar">
      <div class="toolbar-inner">
        <div class="left"></div>
        <div class="right"><a class="link sheet-close" href="#">X</a></div>
      </div>
    </div>
    <div class="sheet-modal-inner">
      <div class="block busArriveInfo">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath(),
      touchActionState:"auto"
    }
  },
  mounted(){
    let that = this;
    $$("#busSheet").on("sheet:open", function(e, sheet) {
      // console.log(NoblMap.stationName);
      $$("#busSheet").find(".toolbar .left").text(NoblMap.stationName);

      let html = '';
      if(NoblMap.routeInfo.length === 0) {
        html += '<div class="noData">정보 없음</div>';
      }else{
        Manage.mng._.each(NoblMap.routeInfo, (route) => {
          html += that.makeHtml(route);
        });
      }
      $$("#busSheet").find(".sheet-modal-inner .block").html(html);
    });

    $$("#busSheet").on("sheet:close", function(e, sheet) {
      delete NoblMap.stationName;
      delete NoblMap.routeInfo;
    });

    $$("#busSheet .busArriveInfo").on("scroll", Manage.mng._.throttle(function(e){
      if(e.target.scrollTop === 0 && that.touchActionState === "auto"){
        $$(e.target).css("touch-action", "pan-down");
        that.touchActionState = "pan-down";
      }else if(that.touchActionState === "pan-down"){
        $$(e.target).css("touch-action", "auto");
        that.touchActionState = "auto";
      }
    }), 50, {leading:true});
  },
  methods: {
    makeHtml(route) {
      let html = '';
      html += '<div class="busRoute">';
        html += '<div class="left">'+route.routeNm+'</div>';
        html += '<div class="right">';

        if(route.arriveInfo && route.arriveInfo.length === 2){
          html += '<div>'+ route.arriveInfo[0].predictTime + '분 ('+route.arriveInfo[0].locationNo+'번째 전)' +'</div>';
          html += '<div>'+ route.arriveInfo[1].predictTime + '분 ('+route.arriveInfo[1].locationNo+'번째 전)' +'</div>';
        }else if(route.arriveInfo && route.arriveInfo.length === 1){
          html += '<div>'+ route.arriveInfo[0].predictTime + '분 ('+route.arriveInfo[0].locationNo+'번째 전)' +'</div>';
          html += '<div class="noData">정보 없음</div>';
        }else{
          html += '<div class="noData middle">정보 없음</div>';
        }

        html += '</div>';
      html += '</div>';
      return html;
    }
  }
}
</script>
