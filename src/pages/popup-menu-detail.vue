<template>
	<f7-page id="menuDetail">
		<div class="scroll">
			<f7-navbar>
				<f7-nav-left style="color:#F7F7F8;">X</f7-nav-left>
				<f7-nav-title id="menuTitle"> {{menuData.name}} </f7-nav-title>
	    		<f7-nav-right>
      			<f7-link @click="popupClose">Close</f7-link>
    		</f7-nav-right>
  		</f7-navbar>
			<div style="overflow:auto;height:95%">
				<div class="block" >
					<f7-swiper pagination navigation :params="{loop:true}">
					  <f7-swiper-slide v-for="(image, key) in menuData.images" :key="key" >
							<img :src="ImgUrl+'/places/' + menuData.pid +'/'+ image" />
						</f7-swiper-slide>
					</f7-swiper>
				</div>
	<!-- FAE001 -->
				<div class="block">
					<p class="row">
						<button class="col button button-big button-raised button-fill kakaoNavi" @click="kakaoInit"><img :src='ImgPath+"buttons/kakao/navi/kakaonavi_btn_small.png"' /><span>{{ $t("DEFINE_CATEGORY_MID_BUTTON_NAVI") }}</span></button>
						<button class="col button button-big button-raised button-fill" @click="location">{{ $t("DEFINE_CATEGORY_MID_BUTTON_LOCATION") }}</button>
					</p>
				</div>

				<div class="block" v-if="menuData.time && menuData.time.trim()">
					<div class="block-title">{{ $t("DEFINE_CATEGORY_STITLE_STORE_TIME") }}</div>
					<div>
						<div class="card" id="storeTime">
							<div class="card-content card-content-padding">{{ $t(menuData.time) }}</div>
						</div>
					</div>
				</div>
				<div class="block" v-if="menuData.address && menuData.address.trim()">
					<div class="block-title" >{{ $t("DEFINE_CATEGORY_STITLE_ADDRESS") }}</div>
					<div>
						<div class="card" id="address">
							<div class="card-content card-content-padding">{{ $t(menuData.address) }}</div>
						</div>
					</div>
				</div>

				<div class="block" v-if="menuData.website && menuData.website.trim()">
					<div class="block-title" >{{ $t("DEFINE_CATEGORY_STITLE_WEBSITE") }}</div>
					<div>
						<div class="card">
							<div class="card-content card-content-padding">{{ $t(menuData.website) }}</div>
						</div>
					</div>
				</div>

				<div class="block" v-if="menuData.phone && menuData.phone.trim()">
					<div class="block-title" >{{ $t("DEFINE_CATEGORY_STITLE_PHONE") }}</div>
					<div>
						<div class="card">
							<div class="card-content card-content-padding" @click="phone">{{ $t(menuData.phone) }}</div>
						</div>
					</div>
				</div>

				<div class="block" v-if="menuData.etc && menuData.etc.trim()">
					<div class="block-title" >{{ $t("DEFINE_CATEGORY_STITLE_ETC_INFO") }}</div>
					<div>
						<div class="card" id="etcInfo">
							<div class="card-content card-content-padding">{{ $t(menuData.etc) }}</div>
						</div>
					</div>
				</div>

				<div class="block" v-if="menuData.cv[key]" v-for="(cf, key) in menuData.cf" :key="key">
					<div class="block-title" >{{ cf }}</div>
					<div>
						<div class="card" id="etcInfo">
							<div class="card-content card-content-padding">{{ menuData.cv[key] }}</div>
						</div>
					</div>
				</div>

				<div class="block" v-if="menuData.ccv[key]" v-for="(ccf, key) in menuData.ccf" :key="key">
					<div class="block-title" >{{ ccf }}</div>
					<div>
						<div class="card" id="etcInfo">
							<div v-if="ccf === '홈페이지'"  class="card-content card-content-padding">{{ menuData.ccv[key] }}</div>
							<div v-else class="card-content card-content-padding">{{ menuData.ccv[key] }}</div>
						</div>
					</div>
				</div>

				<div class="block" v-if="menuData.text && menuData.text.trim()">
					<div class="block-title" >{{ $t("DEFINE_CATEGORY_STITLE_DETAIL_INFO") }}</div>
					<div>
						<div class="card" id="detailInfo">
							<div class="card-content card-content-padding">{{ $t(menuData.text) }}</div>
						</div>
					</div>
				</div>
			</div>

		</div>
	</f7-page>
</template>
<script>
export default {
	data: function(){
		return {
			menuData: {},
			ImgPath : Manage.mng.getImgPath(),
			ImgUrl: Manage.mng.getImgUrl(),
		};
	},
	created() {
    	const that = this,
    		  pid = that.$f7route.params.pid,
    		  lang = Manage.lang.isLang();

			if(pid.split(".").length === 1) {
				Ajax.run({url:"/map/places/detail/"+pid+"/"+lang}, function(data, res){
					console.log(data);
					if(data.cv) {
						data.cv = JSON.parse(data.cv)
					}

					if(data.cf) {
						data.cf = JSON.parse(data.cf)
					}

					if(data.ccv) {
						data.ccv = JSON.parse(data.ccv)
					}

					if(data.ccf) {
						data.ccf = JSON.parse(data.ccf)
					}

					if(data.images) {
						data.images = JSON.parse(data.images)
					}
					that.menuData = data;
					// that.menuData.images = images;
				});
			}else{
				const ids = pid.split(".");
				const spotPid = Number(ids[1]);
				that.menuData = NoblMap.infos.spots[ids[0]].filter((data) => data.pid === spotPid)[0];
				console.log(that.menuData);
			}
    },
	methods: {
    	popupClose() {
    		Manage.mng.getPopup().close($$("#popup-menu-detail"));
    	},
    	location() {
    		if(this.menuData.lng && this.menuData.lat) {
    			const marker = NoblMap.marker.detailMarker;
					let position;

					if(marker) {
						// NoblMap.marker.markerBounce(marker);
						position = marker.getPosition();
					}else{
						const menuData = this.menuData;
						position = NoblMap.LatLng(menuData.lat, menuData.lng)
					}
					NoblMap.panToMarker(position);

    			this.popupClose();
    			if($$("#popup-menu").css("display") !== "none" ){ // 메뉴리스트 팝업이 있으면 닫기.
					Manage.mng.getPopup().close($$("#popup-menu"));
    			}
    		}else{
    			Manage.msg.alert("위경도 정보가 없습니다.");
    		}
    	},
    	navi() {
    		if(this.menuData.lng && this.menuData.lat) {
	    		Kakao.Navi.start({
		            name: this.menuData.name,
		            x: this.menuData.lng,
		            y: this.menuData.lat,
		            coordType: 'wgs84'
		        });
		        this.popupClose();
    		}else{
    			Manage.msg.alert("위경도 정보가 없습니다.");
    		}
    	},
    	kakaoInit() {
			if(!window.Kakao) {
				let that = this;
				Manage.mng.getScriptKakao();
				Manage.mng.fnRecursive(50, function(){return window.Kakao}, function(){
					Kakao.init(Manage.mng.getApiKey("KAKAO").clientId);
					that.navi();
				});
			}else{
				this.navi();
			}
	    },
	    phone() {
				location.href='tel:' + this.menuData.phone;
	    }
    }
}
</script>
