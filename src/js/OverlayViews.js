import * as Manage from '@/js/Manage';

const mng = Manage.mng;
const _ = mng._;
const infosMng = Manage.infosMng;
const throttleTime = 10;

const CustomOverlays = (function(){
	let publicObj = {};

	const setIcon = function(loc, store) {
		let iconStr = '<div id="'+store.key+'"'
					+'class="map-icon-label iconMarker" '
					+'style="'
						+'left:'+(loc.x)+'px; '
						+'top:'+(loc.y - 10)+'px; '
				+'">';
				iconStr += '<span class="map-icon"><img src="'+(mng.getImgUrl("pictogram", store.map_res_url))+'" /></span>';
				iconStr += '</div>';
		return $$(iconStr);
	}

	const setImage = function(loc, store) {
		return $$('<div id="'+store.key+'"'
					+'class="imageMarker" '
					+'style="'
						+'left:'+loc.x+'px; '
						+'top:'+(loc.y - 10)+'px; '
				+'">'
					+ '<img alt="" src="'+mng.getImgPath()+'map_icon/minimapIcon.svg" draggable="false">'
				+'</div>');
	}

	const setPicto = function(loc, store) {
		let iconStr = '<div id="'+store.key+'" '
					+'class="pictoMarker" '
					+'style="'
						+'left:'+(loc.x)+'px; '
						+'top:'+(loc.y - 10)+'px; '
				+'">';
				iconStr += '<img src="'+(mng.getImgUrl("pictogram", store.map_res_url))+'" />';
				iconStr += '</div>';
		return $$(iconStr);
	}

	const setIFrame = function(loc, store, noEvent) {
    const style = 'style="width:'+store.w+'px;height:'+store.h+'px;"';
		let iframeStr = '<div id="'+store.key+'"'
					+'class="symbol '+ ((noEvent)?'':'scale' )+' " '
					+'style="'
						+'left:'+loc.x+'px; '
						+'top:'+(loc.y - 10)+'px; '
						+'width:' + store.w + 'px;'
						+'height:' + store.h + 'px;'
				+'">'
				if(store.assetId || store.assetFile){
					iframeStr += '<iframe scrolling="no" style="width:100%;height:100%;" src="'+(mng.getImgUrl(store.assetFolder, store.assetId, store.assetFile))+'"></iframe>';
				}
				iframeStr += '<div class="iframeEvent" '+style+'> </div>';
				iframeStr += '</div>';
		return $$(iframeStr);
	}

	const setText = function(params) {
		const $point = params.$point,
					store = params.store,
					type = params.type;
		let fontSize = params.fontSize;
		let pos = {x:0, y:1};


		const textWidth = Math.ceil(mng.textWidth(store.text||store.name, fontSize));
		if(type === "image"){
			pos.x = (-textWidth / 2);
			pos.y = 0;
		}else if(type === "iframe") {
			pos.x = (store.w - textWidth) / 2 ;
			pos.y = store.h - 10;
		}else if(type === "minimap") {
			pos.x = (store.w - textWidth) / 2 ;
			pos.y = store.h - 20;
		}else{
			const direction = store.text_direction || "bottom";
			if(direction === "right") {
				pos.x = 20;
			}else if(direction === "left") {
				pos.x = -textWidth - 3;
			}else if(direction === "bottom") {
				pos.x = (-textWidth / 2) + 9;
				pos.y = 18;
			}else if(direction === "top") {
				pos.x = (-textWidth / 2) + 9;
				pos.y = -18;
			}
		}

		$point.append('<span class="textMarker"'
				+'style="'
					+'top:'+pos.y+'px; '
					+'left:'+pos.x+'px; '
          +((fontSize)?'font-size:'+fontSize+'px':'')
				+'">'
					+(store.text || store.name)
				+'</span>');
	}

	const setMinimap = function(loc, store) {
		return $$('<div class="minimapImageMarker" ">'
					+ '<img alt="" src="'+mng.getImgPath()+'map_icon/puff.svg" draggable="false">'
				+'</div>');
	}

	const setSymbolMinimap = function(loc, store) {

		let $point = setIFrame(loc, store);
		if( store.name ){
			setText({$point, store, type:"minimap", fontSize: 25});
		}

		$point.append(setMinimap(loc, store));
		return $point;
	}

  publicObj.IconGroupMarker = function( options ) {
    const Group = function() {
      this.setValues( options );
      this.markerLayer = $$('<div />').addClass("overlayMarkers");
    }

    Group.prototype = new google.maps.OverlayView;
    Group.prototype.onRemove = IconGroupFn.remove;
    Group.prototype.draw = IconGroupFn.draw;
    Group.prototype.onAdd = IconGroupFn.add;

    return new Group(options);
  }

  const IconGroupFn = {
		add : function() {
			const $pane = $$(this.getPanes().overlayImage); // Pane 4
			$pane.append( this.markerLayer );

			const projection = this.getProjection();
			const fragment = document.createDocumentFragment();
			this.markerLayer.empty();
			let map_res_url ;
			if(this.name === "bus") {
				map_res_url = 67;
			}else if(this.name === "toilet") {
				map_res_url = 10;
			}
			let loc;
			_.each(this.datas, (store) => {
				loc = projection.fromLatLngToDivPixel( new google.maps.LatLng({lat:store.lat, lng:store.lng}) );
				store.map_res_url = map_res_url;
				fragment.appendChild( setPicto(loc, store)[0] );
			});

			this.markerLayer.append(fragment);
		},
    remove : function() {
			if(infosMng.has("markers.groupMarkers.icon."+this.name)) {
				const groupMarker = infosMng.get("markers.groupMarkers.icon."+this.name);
				groupMarker.markerLayer.remove();
				groupMarker.setMap(null);
				infosMng.del("markers.groupMarkers.icon."+this.name);
			}
		},
		draw : function() {
			const projection = this.getProjection(),
						zoom = this.getMap().getZoom();
			let loc;

			if(zoom >= this.minZoom) {
        _.each(this.datas, (store) => {
					loc = projection.fromLatLngToDivPixel( new google.maps.LatLng({lat:store.lat, lng:store.lng}) );
					$$("#"+store.key).css({
						"left":loc.x+"px",
						"top":(loc.y - 10)+"px",
					});
				});
			}else{
				this.onRemove();
			}
		}
	};

	// publicObj.IFrameGroupMarker = function( options ) {
	// 	const Group = function() {
	// 		this.setValues( options );
	// 		this.markerLayer = $$('<div />').addClass("overlayMarkers");
	// 	}
	//
	// 	Group.prototype = new google.maps.OverlayView;
	// 	Group.prototype.onRemove = IFrameGroupFn.remove;
	// 	Group.prototype.draw = IFrameGroupFn.draw;
	// 	Group.prototype.onAdd = IFrameGroupFn.add;
	// 	return new Group(options);
	// }
	//
	// const IFrameGroupFn = {
	// 	visible_: function(maxZoom, curZoom){
	// 		return (NoblMap.infos.selectedMap)?"hidden":"";
	// 	},
	// 	add : function() {
  //     const $pane = $$(this.getPanes().overlayImage); // Pane 4
	// 		$pane.append( this.markerLayer );
	// 		this.markerLayer.empty();
	// 		const projection = this.getProjection(),
	// 					fragment = document.createDocumentFragment();
	// 		let loc;
	//
	// 		_.each(this.datas, (store, idx) => {
	// 				loc = projection.fromLatLngToDivPixel( new google.maps.LatLng({lat:store.lat, lng:store.lng}) );
	// 				store.key = "iSym" + ("000" +  idx).slice(-3);
	// 				store.w = 150;
	// 				store.h = 150;
	// 				loc.x = loc.x - (store.w / 2);
	// 				loc.y = loc.y - (store.h / 2);
	//
	// 				if(store.mid) {
	// 					store.assetFolder = "places";
	// 					store.assetId = store.pid;
	// 					store.assetFile = store.map_res_url;
	// 				}
	// 				let $point = setIFrame(loc, store);
	// 				if( store.name ){
	// 					setText({$point, store, type:"minimap", fontSize: 25});
	// 				}
	// 				fragment.appendChild( $point[0] );
	// 			});
	// 			this.markerLayer.append(fragment);
	// 	},
	// 	remove : function() {
  //     infosMng.del("markers.groupMarkers." + this.name);
	// 		this.markerLayer.remove();
	// 		this.setMap(null);
	// 	},
	//
	// 	draw : function() {
	// 		console.log("iframe draw", this.name, new Date().format("HH:mm:ss.ms"))
	// 		const zoom = this.getMap().getZoom();
	// 		if(zoom > 11) {
	// 			const projection = this.getProjection();
	// 			let loc;
	//
  //       _.each(this.datas, (store) => {
	// 				loc = projection.fromLatLngToDivPixel( new google.maps.LatLng({lat:store.lat, lng:store.lng}) );
  //         loc.x = loc.x - (store.w / 2);
  //         loc.y = loc.y - (store.h / 2);
	// 				$$("#"+store.key).css({
	// 					"left":loc.x+"px",
	// 					"top":(loc.y - 10)+"px",
	// 					"visibility":IFrameGroupFn.visible_(store.zoom, zoom)
	// 				});
	// 			});
	// 		}else{
	// 			this.onRemove();
	// 		}
	// 	}
	// };

	publicObj.MinimapGroupMarker = function( options ) {
		const Group = function() {
			this.setValues( options );
			this.markerLayer = $$('<div />').addClass("overlayMarkers");
		}

		Group.prototype = new google.maps.OverlayView;
		Group.prototype.onRemove = _.debounce(MinimapGroupFn.remove, 30, { 'trailing': true });
		Group.prototype.draw = MinimapGroupFn.draw;
		Group.prototype.onAdd = MinimapGroupFn.add;
		return new Group(options);
	}

	const MinimapGroupFn = {
		visible_: function(maxZoom, curZoom){
			return (NoblMap.infos.selectedMap)?"hidden":"";
		},
		add : function() {
      const $pane = $$(this.getPanes().overlayImage); // Pane 4
			$pane.append( this.markerLayer );
			this.markerLayer.empty();
			const projection = this.getProjection(),
						fragment = document.createDocumentFragment();
			let loc,
					datasMap = {};

			_.each(this.datas, (store, idx) => {
					loc = projection.fromLatLngToDivPixel( new google.maps.LatLng({lat:store.lat, lng:store.lng}) );
					store.key = "mid" + store.mid;

					if(store.pid) {
						store.assetFolder = "places";
						store.assetId = store.pid;
						store.assetFile = store.map_res_url;
					}
					store.w = 150;
					store.h = 150;
					loc.x = loc.x - (store.w / 2);
          loc.y = loc.y - (store.h / 2);

					datasMap["mid"+store.mid] = store;
					fragment.appendChild( setSymbolMinimap(loc, store)[0] );
				});
				this.markerLayer.append(fragment);
				this.datasMap = datasMap;
		},
		remove : function() {
      let minimap = infosMng.get("markers.groupMarkers.minimap");
			if(minimap) {
				minimap.markerLayer.remove();
				minimap.setMap(null);
				infosMng.del("markers.groupMarkers.minimap");
				console.log("꽥 minimap");
			}
		},
		draw : function() {
			// console.log("minimap draw", this.name, new Date().format("HH:mm:ss.ms"))
			const zoom = this.getMap().getZoom();

			if(zoom > 11) {
				const projection = this.getProjection();
				let loc;

        _.each(this.datas, (store) => {
					loc = projection.fromLatLngToDivPixel( new google.maps.LatLng({lat:store.lat, lng:store.lng}) );
					loc.x -= (store.w / 2);
					loc.y -= (store.h / 2);
					$$("#"+store.key).css({
						"left":loc.x+"px",
						"top": (loc.y )+"px",
						// "visibility":MinimapGroupFn.visible_(store.zoom, zoom)
					});
				});
			}else{
				this.onRemove();
			}
		}
	};

	publicObj.ComplexGroupMarker = function( options ) {
		const Group = function() {
			this.setValues( options );
			this.markerLayer = $$('<div />').addClass("overlayMarkers");
		}

		Group.prototype = new google.maps.OverlayView;
		Group.prototype.onRemove = _.debounce(ComplexGroupFn.remove, 50, { 'trailing': true });
		Group.prototype.draw = ComplexGroupFn.draw;
		Group.prototype.onAdd = ComplexGroupFn.add;

		return new Group(options);
	}

	const ComplexGroupFn = {
		add : function() {
			console.log("짠")
      const $pane = $$(this.getPanes().overlayImage); // Pane 4
			$pane.append( this.markerLayer );
			const projection = this.getProjection(),
						fragment = document.createDocumentFragment(),
						zoom = this.getMap().getZoom(),
						showZoom = zoom - this.minZoom,
						name = this.name;
			let loc,
					$point,
					newDom;

			this.markerLayer.empty();
			_.each(this.datas, (store, idx) => {
				loc = projection.fromLatLngToDivPixel( new google.maps.LatLng({lat:store.lat, lng:store.lng}) );

				store.key = "places_" + store.pid;
				if(store.map_type === 1) {
					$point = setPicto(loc, store);
					setText({$point, store});
					fragment.appendChild( $point[0] );
				}else{
					debugger;
					loc.x -= (store.w / 2);
					loc.y -= (store.h / 2);

					store.assetFolder = "places";
					store.assetId = store.pid;
					store.assetFile = store.map_res_url;

					$point = setIFrame(loc, store, true);
					if(store.name.indexOf("symbol") === -1) {
						setText({$point, store, type:"iframe"});
					}
					fragment.appendChild( $point[0] );
				}
			});

			this.markerLayer.append(fragment);

		},
		remove : function() {
			const removeComplex = infosMng.get("markers.groupMarkers.complex." + this.name);
			if(removeComplex) {
				removeComplex.markerLayer.remove();
				removeComplex.setMap(null);
				infosMng.del("markers.groupMarkers.complex." + this.name);
				delete NoblMap.infos.selectedMap;

				console.log(this.name, "여긴 어떻게 왔어???");
				// CustomMarkers.addMinimapGroupMarker(infosMng.get("imapData.details"));
				// CustomMarkers.setTitle(Manage.mng.getGName());
			}
		},
		draw : function() {
			const projection = this.getProjection(),
						zoom = this.getMap().getZoom(),
						showZoom = zoom - this.minZoom;
					// console.log("draw", this.name, zoom, showZoom);
			let loc;
			console.log(this);
			if(zoom >= this.minZoom) {
				let datas = [];
				_.each(this.datas, (store) => {
					if(showZoom >= store.show_zoom) {
						datas.push(store);
						$$("#"+store.key).removeClass("hide");
					}else{
						$$("#"+store.key).addClass("hide");
					}
				});

        _.each(datas, (store) => {
					loc = projection.fromLatLngToDivPixel( new google.maps.LatLng({lat:store.lat, lng:store.lng}) );
					if(store.type === "iframe") {
						loc.x -= (store.w / 2);
	          loc.y -= (store.h / 2);
					}else{
						loc.x -= 8;
					}
					$$("#"+store.key).css({
						"left":loc.x+"px",
						"top":(loc.y - 10)+"px",
					});
				});
			}else{
				this.onRemove();
			}
		}
	};



	publicObj.PictoSymbolComplexGroupMarker = function( options ) {
		const Group = function() {
			this.setValues( options );
			this.markerLayer = $$('<div />').addClass("overlayMarkers");
		}

		Group.prototype = new google.maps.OverlayView;
		Group.prototype.onRemove = _.debounce(PictoSymbolComplexGroupFn.remove, 50, { 'trailing': true });
		Group.prototype.draw = PictoSymbolComplexGroupFn.draw;
		Group.prototype.onAdd = PictoSymbolComplexGroupFn.add;

		return new Group(options);
	}

	const PictoSymbolComplexGroupFn = {
		add : function() {
			const $pane = $$(this.getPanes().overlayImage); // Pane 4
			$pane.append( this.markerLayer );
			const projection = this.getProjection(),
						fragment = document.createDocumentFragment(),
						zoom = this.getMap().getZoom(),
						showZoom = zoom - this.minZoom,
						name = this.name;
			let loc,
					$point,
					newDom;

			this.markerLayer.empty();
			_.each(this.datas, (store, idx) => {
				if(store.cf) {
					const cf = JSON.parse(store.cf);
					const cv = JSON.parse(store.cv);
					const chkList = ["w","h","text_direction"];
					_.each(chkList, (key) => {
						const keyIdx = _.indexOf(cf, key);
						if(keyIdx > -1) {
							if(key === "w" || key === "h") {
								store[key] = Number(cv[keyIdx]);
							}else{
								store[key] = cv[keyIdx];
							}
						}
					});
				}
				loc = projection.fromLatLngToDivPixel( new google.maps.LatLng({lat:store.lat, lng:store.lng}) );
				store.key = "places_" + store.pid;
				if(store.map_type === 1) {
					$point = setPicto(loc, store);
					setText({$point, store});
				}else{
					loc.x -= (store.w / 2);
					loc.y -= (store.h / 2);

					store.assetFolder = "places";
					store.assetId = store.pid;
					store.assetFile = store.map_res_url;

					$point = setIFrame(loc, store, true);
				}
				fragment.appendChild( $point[0] );
			});

			this.markerLayer.append(fragment);
		},
		remove : function() {
			const removeComplex = infosMng.get("markers.groupMarkers.complex." + this.name);
			if(removeComplex) {
				removeComplex.markerLayer.remove();
				removeComplex.setMap(null);
				infosMng.del("markers.groupMarkers.complex." + this.name);
				delete NoblMap.infos.selectedMap;

				console.log(this.name, "여긴 어떻게 왔어???");
				// CustomMarkers.addMinimapGroupMarker(infosMng.get("imapData.details"));
				// CustomMarkers.setTitle(Manage.mng.getGName());
			}
		},
		draw : function() {
			const projection = this.getProjection(),
						zoom = this.getMap().getZoom();

			let loc;
			if(zoom >= this.minZoom) {
				let showDatas = [];

				if(this.beforeZoom !== zoom) { // 줌이 바뀌면 데이터 작성.
					 const allowDistance = (20 - zoom) * 0.03  || 0.01;
					 let check;
					 _.each(this.datas, (store) => {
						 check = 0;
						 for(let i=0, n=showDatas.length; i<n; i++) {
								if(allowDistance < mng.calcDistance(store.lat, store.lng, showDatas[i].lat, showDatas[i].lng)){
									check++;
								}
						 }
						 if(showDatas.length === check) {
							 showDatas.push(store);
							 store.visibility = "";
						 }else{
							 store.visibility = "hidden";
						 }
					 });
					 this.beforeZoom = zoom;
					 this.showDatas = showDatas;
				}

				_.each(this.datas, (store) => {
					loc = projection.fromLatLngToDivPixel( new google.maps.LatLng({lat:store.lat, lng:store.lng}) );
					if(store.map_type === 2) {
						loc.x -= (store.w / 2);
						loc.y -= (store.h / 2);
					}
					$$("#"+store.key).css({
						"left":loc.x+"px",
						"top":(loc.y - 10)+"px",
						"visibility":store.visibility
					});
				});
			}else{
				this.onRemove();
			}
		}
	};

	return publicObj;
}());

// 이미지 마커에 text 라벨 추가요~
const CustomMarkers = (function(){
  let publicObj = {};
	publicObj.setTitle = function(txt) {
		$$(".fab-left-top.txt").text(txt);
	}

	publicObj.addMinimapGroupMarker = function(datas) {
		if(!infosMng.has("markers.groupMarkers.minimap")){
			const groupMarker = CustomOverlays.MinimapGroupMarker({
	    	map: NoblMap.map,
	    	datas,
				minZoom: 12,
				name: "minimap"
	    });
	    infosMng.set("markers.groupMarkers.minimap", groupMarker);

	    groupMarker.markerLayer.on("click", ".minimapImageMarker", function(e) {
	      // (e.stopPropagation) && e.stopPropagation();
				NoblMap.stopCircle = true;
	      const key = $$(this).parent().attr("id"),
							data = groupMarker.datasMap[key];
				publicObj.setTitle(Manage.mng.getGName() +"-"+ data.name);
				NoblMap.infos.selectedMap = key;
				const bounds = NoblMap.infos.headers.filter((head) => head.key === key)[0].bounds;

				if(NoblMap.infos.places) {
					const pictoDatas = NoblMap.infos.places.filter((place) => bounds.contains(new google.maps.LatLng(place)));

					if(infosMng.has("markers.groupMarkers.complex.pictos")) {
						infosMng.get("markers.groupMarkers.complex.pictos").onRemove();
					}

					CustomMarkers.addPictoSymbolGroupMarker(key+"_gm", pictoDatas, data.zoom);
				}

				if(!NoblMap.map.mapTypes.hasOwnProperty(key+"Type")) {
					NoblMap.imageMapType.setMapType(key+"Type", data.zoom-1, data.maxZoom, data.mid);
				}
				infosMng.del("imapData.curDetail");
				NoblMap.map.setMapTypeId(key+"Type");
				NoblMap.setCenterZoom(data.lat, data.lng, data.minZoom);
				infosMng.get("markers.groupMarkers.minimap").onRemove();
	    });

			groupMarker.markerLayer.on("click", ".iframeEvent", function(e) {
	      // (e.stopPropagation) && e.stopPropagation();
				NoblMap.stopCircle = true;
				const key = $$(this).parent().attr("id"),
							data = groupMarker.datasMap[key];

				mng.goPage(".popup-menu-detail-view", "/menuDetail/"+data.pid);
				mng.openPopup($$("#popup-menu-detail"));
	    });
		}
  }

	publicObj.addPictoSymbolGroupMarker = function(name, datas, minZoom){
		const groupMarker = CustomOverlays.PictoSymbolComplexGroupMarker({
			map: NoblMap.map,
			datas,
			minZoom,
			name
		});
		infosMng.set("markers.groupMarkers.complex." + name, groupMarker);

		groupMarker.markerLayer.on("click", ".pictoMarker", (e) => {
			NoblMap.stopCircle = true;
			let pid = $$(e.target).parent().attr("id").split("_")[1].toNum();
			mng.goPage(".popup-menu-detail-view", "/menuDetail/" + pid);
			mng.openPopup($$("#popup-menu-detail"));
		});

		return groupMarker;
	}

  publicObj.addIconGroupMarker = function(list, name, zoom){
    const groupMarker = CustomOverlays.IconGroupMarker({
      map: NoblMap.map,
      datas: list,
      minZoom: zoom,
      name
    });
    infosMng.set("markers.groupMarkers.icon." + name, groupMarker);
    return groupMarker;
  }



  publicObj.addIconTextGroupMarker = function(name, datas, minZoom){
    const groupMarker = CustomOverlays.ComplexGroupMarker({
      map: NoblMap.map,
      datas,
      minZoom,
      name
    });
    infosMng.set("markers.groupMarkers.complex." + name, groupMarker);

    groupMarker.markerLayer.on("click", ".iconMarker", (e) => {
      NoblMap.stopCircle = true;
			const key = $$(e.target).parent().attr("id") || $$(e.target).parents('[id]').eq(0).attr("id");
			const data = groupMarker.datas.filter((data) => data.key === key)[0];
	    mng.goPage(".popup-menu-detail-view", "/menuDetail/"+("spot_"+data.mid+"."+data.pid));
			mng.openPopup($$("#popup-menu-detail"));
    });

		return groupMarker;
  }

	publicObj.debounceRestrictMovement = _.debounce(function() {
		const mapType = NoblMap.map.getMapTypeId().split("Type")[0];
		if(mapType !== "roadmap") {
			const bounds = NoblMap.infos.headers.filter((head) => head.key === mapType)[0].bounds;
			const center = NoblMap.map.getCenter();

			if (bounds.contains(center)) return;
			const	maxX = bounds.getNorthEast().lng(),
						maxY = bounds.getNorthEast().lat(),
						minX = bounds.getSouthWest().lng(),
						minY = bounds.getSouthWest().lat();

			let x = center.lng(),
					y = center.lat();

			if (x < minX) x = minX;
			if (x > maxX) x = maxX;
			if (y < minY) y = minY;
			if (y > maxY) y = maxY;
			console.log(y, x);
			NoblMap.map.setCenter(new google.maps.LatLng(y, x));
		}
	}, 100);

  // publicObj.addIFrameGroupMarker = function(datas){
  //   const groupMarker = CustomOverlays.IFrameGroupMarker({
  //   	map: NoblMap.map,
  //   	datas
  //   });
  //   infosMng.set("markers.groupMarkers.symbol.", groupMarker);
	//
  //   groupMarker.markerLayer.on("click", ".iframeEvent", (e) => {
	// 		NoblMap.stopCircle = true;
  //     mng.goPage(".popup-menu-detail-view", "/menuDetail/"+$$(e.target).parent().attr("id"));
	// 		mng.openPopup($$("#popup-menu-detail"));
  //   });
  // }

	// publicObj.addPictograms = function(){
  //   const groupMarker = CustomOverlays.IconTextGroupMarker({
  //     map: NoblMap.map,
  //     datas: _pictograms,
  //     minZoom: 12,
  //     name:"pictograms"
  //   });
  //   infosMng.set("markers.groupMarkers.pictograms", groupMarker);
	//
  //   // groupMarker.markerLayer.on("click", ".iconMarker", (e) => {
  //   //   (e.stopPropagation) && e.stopPropagation();
  //   //
  //   // });
  //   return groupMarker;
  // }

	publicObj.addToiletGroupMarker = function(datas){
    const groupMarker = CustomOverlays.IconGroupMarker({
      map: NoblMap.map,
      datas,
      minZoom: 18,
			name:"toilet"
    });
    infosMng.set("markers.groupMarkers.icon.toilet", groupMarker);

		groupMarker.markerLayer.on("click", ".iconMarker", (e) => {
    	NoblMap.stopCircle = true;
    });
    return groupMarker;
  }

  return publicObj;
}());

export {CustomOverlays, CustomMarkers};
