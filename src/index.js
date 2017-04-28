/*
 * @description lib-upload 通用的上传组件
 * @author luobata
 * @date 2017年1月7日14:46:03
 * */

var lib = require('./lib/lib');
var lint = require('./lib/lint');
var hack = require('./hack');
var uploadHtml = require('./upload-html');
var uploadSwf = require('./upload-swf');

var upload = function (config) {
    var conf = {
        uploadUrl: '',
        type: ['png', 'jpg', 'jpeg'],
        method: 'POST',
        id: '#upload',
        fileName: 'image',
        min: 50 * 1024,
        max: 2.5 * 1024 * 1024,
        credentials: true,
        beforeUpload: function () {
        },
        fn: function (res) {
            console.log('upload success');
        },
        progress: function (res) {
        }
    };
    lib.extends(conf, config);
    var dom = window.document.querySelector(conf.id);
    if (!lint(conf)) {
        console.log('缺少必要参数!');
        return;
    }
    if (window.File && window.fetch) {
        // file 对象 fn 回调 tokenUrl 获取token的
        uploadHtml(dom, conf);
    } else {
        // input file的父元素 上传地址 回调
        hack(conf);
        uploadSwf(dom, conf);
    }
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = upload;
} else {
    window.upload = upload;
}
