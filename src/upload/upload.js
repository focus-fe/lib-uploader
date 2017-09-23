import { validateConf, validateSize, validateType } from './validate';
import lib from '../lib/lib';
import ajax from '../lib/ajax';

export default class Upload {
    constructor (conf) {
        this.conf = conf;
        this.dom = document.querySelecter(conf.selecter);

        this.lintConf();
    };

    lintConf () {
        if (!validateConf.call(this)) {
            console.log('缺少必要参数!');
            return;
        }
    };

    init () {
        if (lib.css(this.dom, 'position') === 'static' || lib.css(this.dom, 'position') === '') {
            lib.css(this.dom, 'position', 'relative');
        }
        const isMulti = this.conf.isMultiple ? 'multiple' : '';
        const input = '<input type="file"' + isMulti + ' style="position: absolute; width: 100%; height: 100%; opacity: 0; filter: alpha(opacity=0); cursor: pointer; top: 0; left: 0; z-index: 100;" name="" />';
        lib.prepend(this.dom, input);
        this.uploadDom = this.dom.querySelector('input');

        this.dom.addEventListener('change', function (e) {
            const file = e.target.files;
            let i;
            let item;
            let errors = [];
            let error = '';

            for (i = 0; i < file.length; i++) {
                item = file[i];
                errors[i] = lint.call(this, item).errorType;
            }
            if (errors.indexOf(1) !== -1 || errors.indexOf(3) !== -1) {
                error += '图片大小不符合要求';
            }
            if (errors.indexOf(2) !== -1 || errors.indexOf(3) !== -1) {
                if (error) error += '、';
                error += '图片格式不符合要求';
            }
            if (error) {
                this.conf.fn({error: error});
                return;
            }
            for (i = 0; i < file.length; i++) {
                item = file[i];
                const lintFile = lint.call(this, item);
                // hack onchange
                (function () {
                    var success = this.conf.fn;
                    this.conf.fn = function (res, file) {
                        success.call(this, res, file);
                        uploadDom.value = '';
                    };
                }());
                this.conf.beforeUpload && this.conf.beforeUpload(item);
                uploadAjax(item, lintFile.name, Object.assign({}, this.conf));
            }
        });
    };
};

const lint = function (file) {
    let result = {
        error: '',
        errorType: 0
    };
    const type = result.type = file.name.split('.').pop().toLowerCase();
    const name = result.name = lib.getRandomString(32) + '.' + type;

    if (!validateSize.call(this, file.size)) {
        result.error = '图片大小不符合要求!';
        result.errorType = 1;
    }

    //if (conf.type === '*') {
    //    return result;
    //}

    if (!validateType.call(this, type)) {
        result.error = '图片类型错误!';
        result.errorType = result.errorType ? 3 : 2;
        return result;
    }

    return result;
};

const uploadAjax = (file, name, conf) => {
    let formData = new FormData();
    const uploadData = {
        name: conf.fileName,
        file: file
    };
    conf.file = file;
    formData.append(conf.fileName, file);
    conf.data = formData;
    ajax(conf);
};