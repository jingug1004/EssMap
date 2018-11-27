<template>
  <div id="cultureSheet" class="sheet-modal my-sheet">
    <div class="toolbar">
      <div class="toolbar-inner">
        <div class="left"></div>
        <div class="right"><a class="link sheet-close" href="#">{{ $t("DEFINE_UI_BUTTON_NAME_CLOSE") }}</a></div>
      </div>
    </div>
    <div class="sheet-modal-inner">
      <div class="block cultureInfo">
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
    $$("#cultureSheet").on("sheet:open", function(e, sheet) {
      const datas = NoblMap.cultureData;
      $$("#cultureSheet").find(".toolbar .left").text(datas.text);
      console.log(datas);
      let html;
      if(datas.type === "cultureFestival") {
        html = that.makeHtml_CultureFestival(datas);
      }else if(datas.type === "culturePerformance") {
        html = that.makeHtml_CulturePerformance(datas);
      }else if(datas.type === "culturGgEvent") {
        html = that.makeHtml_CulturGgEvent(datas);
      }
      $$("#cultureSheet").find(".sheet-modal-inner .block").html(html);
    });

    $$("#cultureSheet").on("sheet:close", function(e, sheet) {
      delete NoblMap.cultureData;
    });
    //
    // $$("#cultureSheet .busArriveInfo").on("scroll", Manage.mng._.throttle(function(e){
    //   if(e.target.scrollTop === 0 && that.touchActionState === "auto"){
    //     $$(e.target).css("touch-action", "pan-down");
    //     that.touchActionState = "pan-down";
    //   }else if(that.touchActionState === "pan-down"){
    //     $$(e.target).css("touch-action", "auto");
    //     that.touchActionState = "auto";
    //   }
    // }), 50, {leading:true});
  },
  methods: {
    makeCard(name, info) {
      let html = '';
      if(info) {
        html += '<div class="block ">';
          html += '<div class="block-title">'+ name +'</div>';
            html += '<div class="card">';
            html += '<div>';
              html += '<div class="card-content card-content-padding">'+ info +'</div>';
            html += '</div>';
          html += '</div>';
        html += '</div>';
      }
      return html;
    },
    makeHtml_CultureFestival(datas) {
      let html = '';
      html += this.makeCard("축제 장소", datas.OPENMEET_PLC);
      html += this.makeCard("축제 기간", new Date(datas.FASTVL_BEGIN_DE).format("yyyy년 MM월 dd일") + " ~ " + new Date(datas.FASTVL_END_DE).format("yyyy년 MM월 dd일"));
      html += this.makeCard("축제 내용", datas.FASTVL_CONT);
      html += this.makeCard("홈페이지", datas.HMPG_ADDR);
      html += this.makeCard("전화번호", datas.MNGT_INST_TELNO);
      html += this.makeCard("주최기관", datas.PROMOTER_INST_NM);
      return html;
    },
    makeHtml_CulturePerformance(datas) {
      let html = '';
      html += this.makeCard("장소", datas.EVENT_PLC);
      if(datas.EVENT_BEGIN_DE === datas.EVENT_END_DE) {
        html += this.makeCard("행사 일시", new Date(datas.EVENT_BEGIN_DE).format("yyyy년 MM월 dd일") + " " + datas.EVENT_TM_INFO);
      }else {
        html += this.makeCard("행사 기간", new Date(datas.EVENT_BEGIN_DE).format("yyyy년 MM월 dd일") + " ~ " + new Date(datas.EVENT_END_DE).format("yyyy년 MM월 dd일"));
      }
      html += this.makeCard("행사 내용", datas.EVENT_CONT);
      html += this.makeCard("홈페이지", datas.HMPG_ADDR);
      html += this.makeCard("전화번호", datas.MNGT_INST_TELNO);
      html += this.makeCard("주최기관", datas.PROMOTER_INST_NM);
      return html;
    },
    makeHtml_CulturGgEvent(datas) {
      let html = '';
      html += this.makeCard("장소", datas.EVENT_PLC);
      const EVENT_PERD = datas.EVENT_PERD.split(" ~ ")
      html += this.makeCard("행사 기간", new Date(EVENT_PERD[0]).format("yyyy년 MM월 dd일") + " ~ " + new Date(EVENT_PERD[1]).format("yyyy년 MM월 dd일"));
      html += this.makeCard("행사 내용", datas.SUMMRY_SNTNC_CONT);
      html += this.makeCard("홈페이지", datas.SNTNC_URL);
      html += this.makeCard("주최기관", datas.INST_NM);
      return html;
    }
  }
}
</script>
