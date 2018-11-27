<template>
	<f7-page id="menuList">
  		<f7-navbar>
  			<f7-nav-title id="menuTitle"> {{ $t(title) }} </f7-nav-title>
    		<f7-nav-right>
      			<f7-link @click="popupClose">Close</f7-link>
    		</f7-nav-right>
  		</f7-navbar>
		<f7-list id="search-list" class="searchbar-found" media-list virtual-list :virtual-list-params="{ items: items, height: 63, searchAll: searchAll, renderExternal: renderExternal }">
	      <ul>
	        <li class="media-item" style="top: 0px;" v-for="(item, key) in items" :key="key">
	        	<a :href="'/menuDetail/'+item.pid" class="item-link item-content" data-view=".popup-menu-detail-view" @click="popupOpen" >
	        		<div class="item-media">
								<img :src="ImgUrl+'/places/' + item.pid +'/'+ item.image" style="" slot="media"/>
							</div>
        			<div class="item-inner">
        				<div class="item-title-row">
        					<div class="item-title">{{ $t( item.name) }}</div>
        					<div class="item-after"></div>
        				</div>
        				<div class="item-text"> {{ $t(item.text) }} </div>
        			</div>
	        	</a>
	        </li>
	      </ul>
	    </f7-list>
	</f7-page>
</template>
<script>
export default {
	data: function(){
		const cid = this.$f7route.params.cid.toNum();
		return {
			ImgPath : GLOBAL_CONSTS.IMG_PATH,
			ImgUrl: Manage.mng.getImgUrl(),
			title : categoryMap.get(cid).title,
			cid : cid,
			items :[],
			vlData: {}
		};
	},
  created() {
  	const that = this;
  	Ajax.run({url:"/map/mappedPlaces/"+that.cid+"/"+Manage.lang.isLang()}, function(data, res){
			that.items = data.list.map((place) => {
				if(place.images) {
					place.image = JSON.parse(place.images)[0];
				}
				return place;
			});
		});
  },
  methods: {
		popupClose(e) {
			Manage.mng.getPopup().close($$("#popup-menu"));
  	},
  	popupOpen() {
  		// Manage.mng.getPopup().open($$("#popup-menu-detail"), false);
			Manage.mng.openPopup($$("#popup-menu-detail"));
  	},
  	searchAll(query, items) {
			let found = [];
			for (let i = 0, n=items.length; i < n; i += 1) {
		    if (items[i].title.toLowerCase().indexOf(query) >= 0 || query.trim() === '') found.push(i);
			}
			return found; // return array with mathced indexes
		},
		renderExternal(vl, vlData) {
			this.vlData = vlData;
		}
  }
}
</script>
