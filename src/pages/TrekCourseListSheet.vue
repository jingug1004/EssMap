
<template>
  <div id="treklistSheet" class="sheet-modal my-sheet">
    <div class="toolbar">
      <div class="toolbar-inner">
        <div class="left">트레킹 코스 목록</div>
        <div class="right"><a class="link sheet-close" href="#">X</a></div>
      </div>
    </div>
    <div class="sheet-modal-inner">
      <div class="list links-list">
        <ul>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath(),
      sheetId : "#treklistSheet",
      touchActionState:"auto"
    }
  },
  mounted(){
    let that = this;
    $$(this.sheetId).on("sheet:open", function(e, sheet) {
      that.setList();
    });

    $$(this.sheetId).find(".sheet-modal-inner").on("scroll", Manage.mng._.throttle(function(e){
      if(e.target.scrollTop === 0 && that.touchActionState === "auto"){
        $$(e.target).css("touch-action", "pan-down");
        that.touchActionState = "pan-down";
      }else if(that.touchActionState === "pan-down"){
        $$(e.target).css("touch-action", "auto");
        that.touchActionState = "auto";
      }
    }), 50, {leading:true});

    $$(this.sheetId).find(".list").on("click", "li", function() {
      const closeTarget = $$(that.sheetId);
      const tc_id = $$(this).data("tc_id");
      Ajax.run({url:"/leisure/trek/course/sectors", method:"POST", data:{tc_id}, token:true}, function(datas){
        let sum = {lat : 0, lng: 0, count: 0};
        NoblMap.polyline.removePolyline();
        Manage.mng._.each(datas.list, (data) => {
          NoblMap.polyline.addPath(data);
          sum.lat += data.lat;
          sum.lng += data.lng;
          sum.count++;
        });

        NoblMap.setCenterZoom(sum.lat / sum.count, sum.lng / sum.count, 16);
        Manage.mng.getSheet().close(closeTarget);
      });
      if(Manage.cookie.getToken()) {
        Ajax.run({url:"/leisure/trek/course/log", method:"POST", data:{uid:Manage.cookie.getUid(), tc_id}, token:true}, function(datas) {
          Manage.mng._.each(datas.list, function(data) {
            NoblMap.marker.starMarker(data);
          });
        });
      }

    });
  },
  methods: {
    setList() {
      Ajax.run({url:"/leisure/trek/course/list", method:"POST", data:{page:0, count:0}, token:true}, function(datas){
        let html = '';
        Manage.mng._.each(datas.list, (data) => {
          html += '<li data-tc_id="'+data.tc_id+'"><a href="#">'+ data.course_name +'</a></li>';
        });

        $$(".sheet-modal-inner ul").html(html);
      });
    }
  }
}
</script>
