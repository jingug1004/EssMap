import lottie from 'lottie-web';
import _ from 'lodash';

let lottieMng = (function(){
  const publicObj = {};

  publicObj.makeLottie = function(params) {
    const options = {
      container: params.container,
      renderer: params.renderer || 'svg',
      loop: params.loop || true,
      autoplay: params.autoplay || true
    };

    if(params.animationData) {
      options.animationData = params.animationData;
    }

    if(params.path) {
      options.path = params.path;
    }

    if(params.name) {
      options.name = params.name;
    }
    
    return lottie.loadAnimation(options);
  }

  return publicObj;
}());

export default lottieMng;
