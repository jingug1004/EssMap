import axios from 'axios';
import {cookie} from '@/js/Manage';
const xmljs = require('xml-js');

let Ajax = (function(){
    let publicObj = {};
    let path = location.pathname.split("/client/index.html")[0];
    path = (path.length === 1)?"/noblapp":path;
    publicObj.url = "https://221.150.19.55:8443"+path;
    publicObj.uri = path;

    publicObj.getInstance = function(options){
        const instance = axios.create();
        instance.defaults.timeout = 30000;
        instance.defaults.headers = {
          // 'Accept': 'application/json',
          'Content-Type': 'application/json; charset=UTF-8',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        };

        return instance;
    }

    const _setUrl = function(options) {
        let url = "";
        if(!/^http/.test(options.url)) {
          if(process.env && process.env.NODE_ENV === "development") {
            url = publicObj.url;
          }else{
            url = publicObj.uri;
          }
        }
        options.url = url + options.url;
    }

    const _setData = function(options) {
      if(options.data) {
        options.data = {
          module: options.url,
          parameter : JSON.stringify(options.data)
        };
      }
    }

    const _setOptions = function(options) {
      _setUrl(options);
      _setData(options);
    }

    publicObj.run = function(options, fn) {
        _setOptions(options);
        const instance = publicObj.getInstance(options);
        if(options.token) {
          instance.defaults.headers['access_token'] = cookie.getToken();
        }
        instance.request(options)
        .then((res)=>{
            if(typeof res.data === "string" && /xml/.test(res.data)) {
              fn(JSON.parse(xmljs.xml2json(res.data, {compact: true, spaces: 4})), res);
            }else{
              fn(res.data.response && typeof res.data.response === "string" && JSON.parse(res.data.response) || res.data , res);
            }
        })
        .catch(function(err){
            console.log(err);
        });
    }

    publicObj.getPromise = function(options) {
        _setUrl(options);
        return publicObj.getInstance(options).request(options);
    }

    publicObj.getPromise2 = function(options) {
      _setOptions(options);
      return new Promise(function(resolve, reject) {
        publicObj.getInstance(options).request(options).then((res) => {
          let data;
          if(typeof res.data === "string" && /xml/.test(res.data)) {
            data = JSON.parse(xmljs.xml2json(res.data, {compact: true, spaces: 4}));
          }else{
            data = (res.data.response && typeof res.data.response === "string" && JSON.parse(res.data.response) || res.data) ;
          }
          resolve(data);
        });
      });
    }

    // promises : array
    publicObj.promiseAll = function(promises) {
        return axios.all(promises);
    }
    return publicObj;
}());


export default Ajax;
