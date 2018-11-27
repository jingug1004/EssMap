<template>
  <f7-page id="loginPage">
    <f7-navbar>
      <f7-nav-left style="color:#F7F7F8;">X</f7-nav-left>
      <f7-nav-title title='노블앱' class="flex1" style="text-align:center;"></f7-nav-title>
      <f7-nav-right>
          <f7-link @click="popupClose">X</f7-link>
      </f7-nav-right>
    </f7-navbar>
    <div class="login-screen modal-in" style="display: block;">
      <div class="page">
        <div class="page-content login-screen-content">
          <div id="terms" class="list" style="padding: 0 10px;">
            <div style="display:flex;">
              <div style="flex:1;">
                노블앱 이용약관 동의(필수)
              </div>
              <div>
                <label class="toggle toggle-init">
                  <input type="checkbox" name="noblappTerms1" @change="checkTerms" value="yes"><i class="toggle-icon"></i>
                </label>
              </div>
            </div>
            <textarea rows="5" readonly></textarea>

            <div style="display:flex;">
              <div style="flex:1;">
                개인정보 수집 및 이용에 대한 안내(필수)
              </div>
              <div>
                <label class="toggle toggle-init">
                  <input type="checkbox" name="noblappTerms2" @change="checkTerms" value="yes"><i class="toggle-icon"></i>
                </label>
              </div>
            </div>
            <textarea rows="5" readonly></textarea>

            <div style="display:flex;">
              <div style="flex:1;">
                위치정보 이용약관 동의(필수)
              </div>
              <div>
                <label class="toggle toggle-init">
                  <input type="checkbox" name="noblappTerms3" @change="checkTerms" value="yes"><i class="toggle-icon"></i>
                </label>
              </div>
            </div>
            <textarea rows="5" readonly></textarea>
            <f7-list class="h45" style="margin: 10px 0 15px 0;">
              <f7-list-item checkbox title="모두 동의" name="all-terms" @click="toggleAllTerms"></f7-list-item>
            </f7-list>
            <p class="row" style="margin-top: 0px;margin-bottom: 30px;">
              <button class="col button button-fill h45 color-gray" @click="popupClose">비동의</button>
              <button class="col button button-fill h45 color-green" @click="goForm">동의</button>
            </p>
          </div>
        </div>
      </div>
    </div>
    <!-- <div id="loadingDiv" class="hide"><div><img :src='ImgPath+"oval.svg"' class="flex1"></div></div> -->
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      ImgPath : Manage.mng.getImgPath(),
    };
  },

  methods: {
    popupClose() {
      app.$f7.popup.close($$("#popup-menu-detail"), false);
    },
    goForm() {
      if($$("[name=all-terms]").prop("checked")) {
        Manage.mng.goPage(".popup-menu-detail-view", "/joinForm");
      }else{
        Manage.msg.alert("약관에 모두 동의하지 않으셨습니다.");
      }
    },
    toggleAllTerms() {
      // let chkValue = $$("[name=all-terms]").prop("checked");
      // if(!Manage.mng.getDevice().desktop) {
      //   chkValue = !chkValue;
      // }
      // $$("[name=noblappTerms1], [name=noblappTerms2], [name=noblappTerms3]").prop("checked", chkValue);
      $$("[name=noblappTerms1], [name=noblappTerms2], [name=noblappTerms3]").prop("checked", !$$("[name=all-terms]").prop("checked"));
    },
    checkTerms() {
      let check = true;
      let testStr = '';
      $$("[name=noblappTerms1], [name=noblappTerms2], [name=noblappTerms3]").each(function(){
        testStr += $$(this).prop("checked") + ' ';
        check = check && $$(this).prop("checked");
      });
      $$("[name=all-terms]").prop("checked", check);
    }






  }
}
</script>
