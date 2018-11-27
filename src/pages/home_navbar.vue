<template>
  <div class="fab fab-left-top searchBar">
    <f7-navbar>
       <f7-nav-left>
         <a href="#" data-panel="left" class="panel-open icon-only link">
           <img :src='ImgPath + "menu_icon/menu.svg"' style="width: 24px;" />
         </a>
       </f7-nav-left>

       <div class="searchbar-backdrop"></div>
         <div class="searchbar flex1">
           <div class="searchbar-inner">
             <div class="searchbar-input-wrap">
               <input type="search" name="searchValue" data-i18n="DEFINE_FIND_INPUT_PLACEHOLDER.placeholder" @keyup.enter="search" >
               <i class="searchbar-icon"></i>
               <span class="input-clear-button"></span>
             </div>
             <span class="searchbar-disable-button">X</span>
           </div>
         </div>
     </f7-navbar>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath()
    }
  },
  methods: {
    search() {
      const v = $$("[name=searchValue]").val().trim();
      if(v) {
        Ajax.run({url:"/map/search?lang=" + Manage.lang.isLang() + "&v="+v}, (result) => {
          console.log(result);
        });
      }

    }
  }
}
</script>
