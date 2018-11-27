import alertify from '@/plugins/alertify/alertify.js';
import _ from 'lodash';
import $ from 'jquery';

let Alert = (function(){
  let publicObj = {};

  const _setZindex = function (target) {
    const zIndex = "6000";
    let elements = target.elements;
    $(elements.header).remove();
    $(elements.modal).css("z-index", zIndex);
    $(elements.dimmer).css("z-index", zIndex);
  }

  publicObj.init = function(i18next) {
    var options = {
  		'autoReset':true,
  		'resizable':false,
  		'movable':true,
  		'closable':false,
  		'pinnable':false,
  		'transition':'zoom'
    };

    alertify.alert().setting( _.extend({'label':i18next.t("DEFINE_MESSAGE_BUTTON_OK")}, options));
    _setZindex(alertify.alert());

    // alertify.confirm().setting(_.extend({'labels':{ok:bomLocale.getText("confirm"), cancel:bomLocale.getText("cancel")}}, options));
    alertify.confirm().setting(_.extend({'labels':{ok:i18next.t("DEFINE_MESSAGE_BUTTON_OK"), cancel:i18next.t("DEFINE_MESSAGE_BUTTON_CANCEL")}}, options));
    _setZindex(alertify.confirm());

    alertify.dialog('mapClickConfirm', function() {
			var settings;
			return {
				setup: function() {
					var settings = alertify.confirm().settings;
					for (var prop in settings){
		        		this.settings[prop] = settings[prop];
					}

					var setup = alertify.confirm().setup();
					setup.buttons = [
						{text: i18next.t("DEFINE_CATEGORY_MID_BUTTON_NAVI"), className:'navi'},
						// {text: i18next.t("DEFINE_MESSAGE_BUTTON_CANCEL"), className:'path'},
						{text: "대중교통 경로안내", className:'path'},
						{text: i18next.t("DEFINE_MESSAGE_BUTTON_CANCEL"), key:27/*Esc*/ , className:'cancel'}];

					setup.options = _.extend(options, {'maximizable':false});
					return setup;
		    	},
		    	settings: {
					oncontinue: null
				},
				callback: function(closeEvent) {
					if (closeEvent.index === 2) {
						if (typeof this.get('oncontinue') === 'function') {
							returnValue = this.get('oncontinue').call(this, closeEvent);
							if (typeof returnValue !== 'undefined') {
								closeEvent.cancel = !returnValue;
							}
						}
					} else {
						alertify.confirm().callback.call(this, closeEvent);
					}
				}
			};
		}, false, 'confirm');
		$(alertify.mapClickConfirm().elements.header).remove();
    _setZindex(alertify.mapClickConfirm());
  }


  publicObj.alert = function(msg, callback, params, isNoModal){
		if(isNoModal){
			alertify.alert("", msg, callback).set({'modal':false, 'pinnable':false}) ;
		}else if(params){
			alertify.alert("", msg, callback).set(params) ;
		}else{
			alertify.alert("", msg, callback).set({'modal':true}) ;
		}
	}

	publicObj.confirm = function(msg, callback, params){
		alertify.confirm(msg, callback).set(params) ;
  }


  publicObj.navi = function(msg, func1, func2, params){
    if(params) {
      alertify.mapClickConfirm(msg, func1, func2).set(params);
    }else{
      alertify.mapClickConfirm(msg, func1, func2);
    }
  }

  return publicObj;
}());

export default Alert;
