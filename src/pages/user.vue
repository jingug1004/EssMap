<template>
	<f7-page>
		<f7-navbar>
      <f7-nav-left> </f7-nav-left>
			<f7-nav-title id="menuTitle"> 사용자 </f7-nav-title>
  		<f7-nav-right>
    			<f7-link @click="popupClose">X</f7-link>
  		</f7-nav-right>
		</f7-navbar>
    <div>
      <div class="marginTop0 userTitle block-title "> 기본 정보 </div>
      <f7-list>
        <ul>
	        <li class="media-item" style="top: 0px;">
	        	<a class="item-link item-content" data-view=".popup-trek-view" @click="popupOpen" >
              <div class="item-inner">
                <div class="item-title-row">
                  <div class="item-title"> 사용자정보 </div>
                  <div class="item-after"></div>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </f7-list>
      <div class="userTitle block-title"> 둘레길 코스 이력 정보 </div>
      <f7-list>
        <ul>
          <li class="media-item" style="top: 0px;">
            <a :href="'/trekCourseList'" class="item-link item-content" data-view=".popup-trek-view" @click="popupOpen" >
              <div class="item-inner">
                <div class="item-title-row">
                  <div class="item-title"> 코스 기록 </div>
                  <div class="item-after"></div>
                </div>
              </div>
            </a>
          </li>
          <li class="media-item" style="top: 0px;">
	        	<a class="item-link item-content">
              <div class="item-inner">
                <div class="item-title-row">
                  <div class="item-title"> 완주 인증서 </div>
                  <div class="item-after"></div>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </f7-list>
      <div class="block">
        <p class="row">
          <button class="col button button-big button-fill popup-close" @click="logout">로그아웃</button>
        </p>
      </div>
    </div>
	</f7-page>
</template>
<script>
export default {
	data: function(){
		return {
			ImgPath : GLOBAL_CONSTS.IMG_PATH,
		};
	},
  methods: {
		popupClose(e) {
			Manage.mng.getPopup().close($$("#popup-menu"));
  	},
    popupOpen() {
      Manage.mng.openPopup($$("#popup-trek"));
    },
    logout() {
      Ajax.run({url:"/user/logout", method:"POST", data:{uid:Manage.cookie.getUid()}, token:true}, function(data){
        if(!data.ecode) {
          Manage.cookie.clearUser();
        }
  		});
    }
  }
}
</script>
