<template>
	<f7-page>
			<div style="height:45px;display:flex;align-items:center;">
				<div id="loginBefore" @click="loginPopupOpen" class="flex1 pointer panel-close">
					<div style="display:flex;align-items: center;padding-left: 15px;margin-top: 5px;">
						<div style="margin-right:10px;">
							<img :src="ImgPath+'menu_icon/user_none.svg'" slot="media" style="width:30px;"/>
						</div>
						<div class="flex1">
							로그인하세요
						</div>
					</div>
				</div>
				<div id="loginAfter" class="hide flex1 pointer panel-close">
					<div style="display:flex;align-items: center;padding-left: 15px;margin-top: 5px;">
						<div style="margin-right:10px;">
							<img :src="ImgPath+'menu_icon/user_none.svg'" slot="media" style="width:30px;"/>
						</div>
						<div id="userName" view=".popup-menu-view" class="flex1 panel-close" @click="userPopupOpen"></div>
					</div>
				</div>
				<!-- <div style="padding-right:5px;display: flex;"><img :src='ImgPath + "map_icon/close.svg"' style="width:16px;color:#416CE4;" class="pointer panel-close" /></div> -->

			</div>
	    <f7-list class="noneMargin accordion-list">
				<!-- <f7-list-item :title="$t( 'DEFINE_USER_LOGIN' )"  link='/login/' view=".popup-menu-view" class="panel-close" @click="popupOpen">
	    		<img :src="ImgPath+'menu_icon/user_none.svg'" slot="media"/>
	    	</f7-list-item> -->

	    	<f7-list-item v-for="(item, key) in items" :key="key" :title="item.title" :accordion-item="item.children?true:false" :link="item.children?false:'/menus/'+item.cid" view=".popup-menu-view" :class="item.children?'':'panel-close'" @click="popupOpen">
	    		<img :src="ImgUrl + '/category/' + item.cid +'/'+ item.icon_url" slot="media"/>
					<f7-accordion-content v-if="item.children">
						<f7-block>
							<f7-list class="noneMargin">
								<f7-list-item v-for="(item2, key2) in item.children" :key="key2" :title="item2.title" :link="'/menus/'+item2.cid" view=".popup-menu-view" class="panel-close" @click="popupOpen">
									<img :src="ImgUrl + '/category/' + item2.cid +'/'+ item2.icon_url" slot="media"/>
					    	</f7-list-item>
							</f7-list>
						</f7-block>
					</f7-accordion-content>
	    	</f7-list-item>

				<f7-list-item title="둘레길 코스"  class="panel-close" link="#" @click="treklistOpen">
	    		<img :src="ImgPath+'menu_icon/user_none.svg'" slot="media"/>
	    	</f7-list-item>
				<f7-list-item :title="$t('DEFINE_VISIT_LOG_TITLE')"  class="panel-close" link="#" @click="treklistOpen">
	    		<img :src="ImgPath+'menu_icon/user_none.svg'" slot="media"/>
	    	</f7-list-item>

		</f7-list>
	</f7-page>
</template>
<script>
export default {
	data () {
		return {
			ImgPath : GLOBAL_CONSTS.IMG_PATH,
			ImgUrl: Manage.mng.getImgUrl(),
			items: [],
		};
	},
	created() {
		const that = this;
		Manage.mng.fnRecursive(50, () => window.categoryMap, () => {
			let categorys = Manage.mng.toArray(categoryMap);
			let pcidCategorys = categorys.filter((data) => data.pcid === 0);
			let categorysLv2 = {};
			pcidCategorys.forEach((datas) => {
				let list = categorys.filter((data) => data.pcid === datas.cid);
				if(list.length > 0) {
					datas.children = list;
				}
			});
			that.items = pcidCategorys;
			NoblMap.infos.categorys = pcidCategorys;
		});
		$$(".panel-left").on("panel:open", function() {
			if(that.isLogin()) {
				$$("#loginBefore").hide();
				$$("#loginAfter").show();
				$$("#loginAfter").find("#userName").text(Manage.cookie.getName());
			}else{
				$$("#loginBefore").show();
				$$("#loginAfter").hide();
			}
		});
  },
	methods: {
		isLogin() {
			return !!Manage.cookie.getName();
		},
		loginPopupOpen() {
			Manage.mng.goPage(".popup-menu-view", "/login/");
			Manage.mng.openPopup($$("#popup-menu"));
		},
		userPopupOpen() {
			Manage.mng.goPage(".popup-menu-view", "/user/");
			Manage.mng.openPopup($$("#popup-menu"));
		},
		popupOpen(e) {
			if(!$$($$(e.target).parents("li")[0]).is(".accordion-item")) {
				Manage.mng.openPopup($$("#popup-menu"));
			}
		},
		treklistOpen(){
			Manage.mng.getSheetName("treklistSheet", $$("#treklistSheet")).open();
		}
	}
}
</script>
