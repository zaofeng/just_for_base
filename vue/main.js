
import axios from 'axios'
import qs from 'qs'
let axiosIns = axios.create({});

if (process.env.NODE_ENV == 'development') {
    axiosIns.defaults.baseURL = '***';
} else if (process.env.NODE_ENV == 'debug') {
    axiosIns.defaults.baseURL = '***';
} else if (process.env.NODE_ENV == 'production') {
    axiosIns.defaults.baseURL = '***';
}

axiosIns.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';
axiosIns.defaults.headers.get['X-Requested-With'] = 'XMLHttpRequest';
axiosIns.defaults.responseType = 'json';
axiosIns.defaults.transformRequest = [function (data) {
    //数据序列化
    return qs.stringify(data);
}
];
axiosIns.defaults.validateStatus = function (status) {
    return true;
};
axiosIns.interceptors.request.use(function (config) {
    //配置config
    config.headers.Accept = 'application/json';
    // config.headers.System = 'vue';
    // let token = Vue.localStorage.get('token');
    // if(token){
    //     config.headers.Token = token;
    // }
    return config;
});
axiosIns.interceptors.response.use(function (response) {
    let data = response.data;
    let status = response.status;
    if (status === 200) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(response);
    }
});

let ajaxMethod = ['get', 'post'];
let api = {};
ajaxMethod.forEach((method)=> {
    //数组取值的两种方式
    api[method] = function (uri, data, config) {
        return new Promise(function (resolve, reject) {
            axiosIns[method](uri, data, config).then((response)=> {
                /*根据后台数据进行处理
                 *1 code===200   正常数据+错误数据     code!==200   网络异常等
                 *2 code===200   正常数据     code!==200   错误数据+网络异常等
                 * 这里使用的是第一种方式
                 * ......
                 */
                if (response.data.StatusCode) {
                    //toast封装：  参考ele-mint-ui
                    Toast({
                        message: response.data.Message,
                        position: 'top',
                        duration: 2000
                    });
                    if (response.data.Message === '未登录') {
                        Toast({
                            message: response.data.Message,
                            position: '',
                            duration: 2000
                        });
                        //使用vue实例做出对应行为  change state or router
                        //instance.$store.commit('isLoginShow',true);
                    }
                } else {
                    resolve(response);
                }
            }).catch((response)=> {
                //reject response
                //alert('xiuxiu，限你10分钟到我面前来,不然...');
            })
        })
    }
});

Vue.prototype.$axios = api;

//.....
let instance =new Vue({
    store,
    router,
    el: '#app',
    render: h => h(App)
});

/* 1 根据process.env.NODE_ENV 获取对应的apiDomain
 * 2 处理ajax库axios，为了以后不重复引用，挂在原型对象上
 * 3 axios是封装在main.js里面的，是为了获取vue实例操作store、router
 * 4 组件里面使用this.$axios.get or  this.$axios.post 调用  使用debugger，查看接口返回数据的走向
 */