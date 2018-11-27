<template>
	<f7-page>
		<f7-navbar>
			<f7-nav-left> </f7-nav-left>
			<f7-nav-title id="menuTitle">  </f7-nav-title>
  		<f7-nav-right>
    			<f7-link @click="popupClose">X</f7-link>
  		</f7-nav-right>
		</f7-navbar>
    <div>
      <div class="marginTop0 userTitle block-title" id="pointTxt"> </div>
  		<table id="historyTable" style="width:100%;">
				<tbody></tbody>
			</table>
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
	created() {
		this.getTrekCourseHistory();
	},
	mounted(){
    let that = this;
    $$("#popup-trek-course").on("popup:open", function(e) {
      that.getTrekCourseHistory();
    });
	},
  methods: {
		popupClose(e) {
			Manage.mng.getPopup().close($$("#popup-trek-course"));
  	},
		getTrekCourseHistory() {
			const that = this;
			const tc_id = Number(this.$f7route.params.tcid);
			const courseName = NoblMap.infos.trekCourse.filter((course) => course.tc_id === tc_id)[0].course_name;
			$$("#historyTable tbody").html("");
			Ajax.run({url:"/leisure/trek/course/log", method:"POST", data:{uid:Manage.cookie.getUid(), tc_id}, token:true}, function(data){
				$$("#popup-trek-course #menuTitle").text(courseName + "기록");
				$$("#popup-trek-course #pointTxt").text(courseName + "기록 부분별 누적포인트 기록 " +(data.total || 0)+ "p");
				let tableHtml = '';
				if(data.list) {
					const borderStyle = 'style="border-top:1px solid gray"';
					Manage.mng._.each(data.list, (data) => {
						tableHtml += '<tr>';
						tableHtml += '<td '+borderStyle+'>'+courseName+'</td>';
						tableHtml += '<td '+borderStyle+'>('+data.name+')</td>';
						tableHtml += '</tr>';
						tableHtml += '<tr>';
						tableHtml += '<td style="color:#c672df;">'+data.point+'</td>';
						tableHtml += '<td>'+new Date(data.issued_time).format("yyyy-MM-dd HH:mm:ss")+'</td>';
						tableHtml += '</tr>';
					});
				}else{
					tableHtml += '<tr>';
					tableHtml += '<td style="text-align: center;">이력이 없습니다.</td>';
					tableHtml += '</tr>';
				}
				$$("#historyTable tbody").html(tableHtml);
			});
		}

  }
}
</script>
