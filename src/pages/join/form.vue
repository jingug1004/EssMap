<template>
  <f7-page id="loginPage">
    <f7-navbar>
      <f7-nav-left style="color:#F7F7F8;">X</f7-nav-left>
      <f7-nav-title title='회원가입' class="flex1" style="text-align:center;"></f7-nav-title>
      <f7-nav-right>
          <f7-link @click="popupClose">X</f7-link>
      </f7-nav-right>
    </f7-navbar>
    <div class="login-screen modal-in" style="display: block;">
      <div class="page">
        <div class="page-content login-screen-content">
          <div id="join" class="list" style="padding: 0 10px;">
            이름<br />
            <input type="text" name="name" required /> <br />

            Email / Id<br />
            <input type="text" name="id" required /> <br />
            <div id="idChkResult" style="position: relative;top: -18px;"></div><br />

            Password<br />
            <input type="password" name="password" required /> <br />

            Password 확인<br />
            <input type="password" name="passwordChk" @blur="passwdChk" /> <br />
            <p class="row" style="margin-top: 0px;margin-bottom: 30px;">
              <button class="col button button-fill h45" @click="popupClose">취소</button>
              <button class="col button button-fill h45" @click="join">가입</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      ImgPath : Manage.mng.getImgPath(),
    };
  },
  mounted() {
    const that = this;
    $$("#join [name=id]").on("blur", that.idChk);
  },

  methods: {
    popupClose() {
      app.$f7.popup.close($$("#popup-menu-detail"), false);
    },
    idChk(){
      Ajax.run({url:"/user/checkId", method:"POST", data:{id:$$("#join [name=id]").val()}}, function(data){
        console.log(data);
        if(data.ecode === 10003) {
          $$("#idChkResult").html("<span style='color:green;'>사용하셔도 좋습니다.</span>");
        }else{
          $$("#idChkResult").html("<span style='color:red;'>이미 사용 중인 아이디 입니다.</span>");
        }
      });
    },
    validate(target) {
      let datas = {};
      let returnChk = true;
      target.find("[required]").each((idx, dom) => {
        const value = $$(dom).val();
        const name = $$(dom).attr("name");
        if(value === "") {
          Manage.msg.alert(name + "값이 없습니다.");
          returnChk = false;
          return false;
        }
        datas[name] = value;
      });
      if(returnChk) {
        return datas;
      }else{
        return false;
      }
    },
    join() {
      const that = this;
      let data = this.validate($$("#join"));
      if(data) {
        Ajax.run({url:"/user/join", method:"POST", data}, function(data){
          if(data.uid) {
            msg.alert("가입되었습니다.", function(){
              that.popupClose();
            });
          }
        });
      }
    },
    passwdChk() {
      console.log($$("#join [name=password]").val() , $$("#join [name=passwordChk]").val());
      if($$("#join [name=password]").val() !== $$("#join [name=passwordChk]").val()) {
        $$("#join [name=passwordChk]").val("");
        Manage.msg.alert("동일하지 않습니다.");
      }
    }
  }
}
</script>
