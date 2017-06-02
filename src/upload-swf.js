var loading = false;
var initList = [];
var resBase = 'http://changyan.itc.cn/mdevp/extensions/cui/002/swfupload.v2.2.0/';
var lib = require('./lib/lib');
var format = require('./lib/format');

var setting = {
    flash_url: resBase + 'swfupload.swf',
    prevent_swf_caching: false,

    file_size_limit: '1 MB',
    file_post_name: 'file',
    file_types: '*.jpg;*.png;*.gif;*.jpeg',

    button_text: '',
    button_image_url: resBase + 'swfupload.js?button_image_url',
};
var id = 0;

function upload(dom, conf) {
    if (dom) {
        uploader.config({
            file_size_limit: format.sizeFormat(conf.max),
            file_size_limit: conf.max + 'B',
            file_post_name: conf.fileName,
            file_types: format.typeFormat(conf.type),
            upload_progress_handler: conf.progress,
            button_placeholder_id: 'selectFiles4'
        });
        conf.id = id++;
        var fn = conf.fn;
        conf.fn = function (response, file) {
            if (typeof response === 'string') response = JSON.parse(response);
            fn.apply(this, arguments);
        }
        uploader.create(dom, conf);
        return;
        uploader.create(dom, conf.uploadUrl, function (response, file, conf) {
            if (typeof response === 'string') response = JSON.parse(response);
            conf.fn(response, file);
        }, conf);
    }
};
var fnLoadScript = function (src, fun) {
    var document = window.document;
    var head = document.getElementsByTagName('head')[0] || document.head || document.documentElement;

    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('charset', 'UTF-8');
    script.setAttribute('src', src);

    if (typeof fun === 'function') {
        if (window.attachEvent) {
            script.onreadystatechange = function () {
                var r = script.readyState;
                if (r === 'loaded' || r === 'complete') {
                    script.onreadystatechange = null;
                    fun();
                }
            };
        } else {
            script.onload = fun;
        }
    }

    head.appendChild(script);
};
var fnInit = function ($dom, conf) {
    var height = lib.getHeight($dom);
    var width = lib.getWidth($dom);

    if (lib.css($dom, 'position') === 'static' || lib.css($dom, 'position') === '') {
        lib.css($dom, 'position', 'relative');
    }
    var id = 'id-' + (+new Date());
    var html = '\
            <span style="position: absolute; top: 0; left: 0; height: ' + height + 'px; width: ' + width + 'px; overflow: hidden; opacity: 0; filter:alpha(opacity=0); z-index: 100;">\
                <span  id="' + id + '"></span>\
            </span>\
        ';
    lib.prepend($dom, html);

    var _setting = lib.extends(setting, {
        upload_url: conf.uploadUrl,
        button_placeholder_id: id,
        button_width: width,
        button_height: height,
        button_cursor: SWFUpload.CURSOR.HAND,
        button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
        conf: conf,
        upload_start_handler: function () {
            this.settings.conf.beforeUpload()
        },
        file_dialog_complete_handler: function () {
            this.startUpload();
        },
        file_queue_error_handler: function (a, b, c) {
            this.settings.conf.fn(b, c);
        },
        upload_success_handler: function (a, b, c) {
            this.settings.conf.fn(b, a);
        }
    });

    var tmp = new SWFUpload(lib.clone(_setting));
};
var uploader = {
    create: function ($dom, conf) {
        if (window.SWFUpload) {
            fnInit($dom, conf);
        } else {
            initList.push([$dom, conf]);

            if (loading) {
                return;
            }

            loading = true;
            fnLoadScript(resBase + 'swfupload.js', function () {
                loading = false;

                var i, item;
                for (i = 0; i < initList.length; i++) {
                    item = initList[i];
                    fnInit(item[0], item[1]);
                }
                initList = [];
            });
        }
    },
    config: function (paramsConfig) {
        lib.extends(setting, paramsConfig);
    }
};
module.exports = upload;
