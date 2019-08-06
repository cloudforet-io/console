import { hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';

export const Mixin = {
    methods: {
    /**********************************************************************************
     * Name       : getGraphColor
     * Input      : => (o: opacity,   => Boolean,
     *                  r: random,    => Boolean,
     *                  l: length     => Number)
     * Output     : => (String || Array of String contains Hex color)
     * Description:    generate random color HEX digits.
     **********************************************************************************/
        getGraphColor: (o, r, l) => {
            const colorListWithOpacity = [
                hexToRgba('#ff0000', 50),
                hexToRgba('#FFA500', 30),
                hexToRgba('#0000ff', 30),
                hexToRgba('#00FFFF', 30),
                hexToRgba('#00FF00', 30),
                hexToRgba('#FFC0CB', 30),
                hexToRgba('#008080', 30),
                hexToRgba('#4B0082', 30),
                hexToRgba('#ffff00', 30),
                hexToRgba('#EE82EE', 30),
                hexToRgba('#000000', 30)
            ];
            const colorListWithOutOpacity = ['#ff0000', '#FFA500', '#0000ff', '#00FFFF', '#00FF00', '#FFC0CB', '#008080', '#4B0082', '#ffff00', '#EE82EE', '#000000'];

            let selectedColor = (o) ? colorListWithOpacity: colorListWithOutOpacity;
            let returnColorVal =  l == 0 ? (r) ? selectedColor[Math.floor(Math.random() * selectedColor.length)] : selectedColor[0]: [];
            let idx = 0;

            for (let i = 0; i < l; i++) {
                if (r) {
                    returnColorVal.push(selectedColor[Math.floor(Math.random() * selectedColor.length)]);
                } else {
                    idx = i >= selectedColor.length ? l%selectedColor.length : i;
                    returnColorVal.push(selectedColor[idx]);
                }
            }
            return returnColorVal;
        },
    /**********************************************************************************
     * Input        => (v:value: => Any)
     * Output       => (Boolean)
     * Description:    Check whether given value is empty.
     **********************************************************************************/
        isEmpty: function (v) {
            return (v === '' || v === null || v === undefined || (v !== null && typeof v === 'object' && !Object.keys(v).length)) ? true : false;
        },
    /**********************************************************************************
     * Name       : cssStyler
     * Input        => (c:css Object      => type of Object,
     *                  i:use 'Style' YN  => Boolean
     *                  t:use  Trim   YN  => Boolean )
     * Output       => (String): All trimmed css String by condition;
     * Description:    Generate full String of css given Object c by condition of i, t
     **********************************************************************************/
        cssStyler: function (c, i, t) {
            let style = '';
            Object.entries(c).forEach(([key, val]) => {
                if (t) {
                    return style += key.trim() + ':' + val.trim() + (val.indexOf(';') > 0) ? '' : ';';
                } else {
                    return style += key + ':' + val + ';';
                }
            });
            return (i) ? 'style=\"' + style + '\"' : style;
        },
    /**********************************************************************************
     * Name       : selectToCopyToClipboard
     * Input   => (t:text            =>  String)
     * Output  => (Empty):
     * Description:  copy given text to clipboard
     **********************************************************************************/
        selectToCopyToClipboard: function (t) {
            let textArea = document.createElement('textarea');
            textArea.value = t;
            document.body.appendChild(textArea);
            textArea.select();
            let successFailCondition = document.execCommand('Copy');
            textArea.remove();
            console.log('Success', successFailCondition);
        },
    /**********************************************************************************
     * Name       : sideBarMiniMaxControl
     * Input   => ()
     * Output  => (Empty):
     * Description:  Minimize or Maximize Side bar Menu
     **********************************************************************************/
        sideBarMiniMaxControl: function () {
            let currentStatus = document.body.className;
            if (currentStatus.indexOf('sidebar-minimized brand-minimized') > -1) {
                document.body.className = 'sidebar-lg-show header-fixed sidebar-fixed';
            } else {
                document.body.className = 'sidebar-lg-show header-fixed sidebar-fixed sidebar-minimized brand-minimized';
            }
        },
    /**********************************************************************************
     * Name       : selectBadges
     * Input   => (s:badges flag String  => String)
     * Output  => (String): variant value
     * Description:  Select badges variant by given val
     **********************************************************************************/
        selectBadges: function (s) {
            const successFlag = ['active', 'success'];
            const secondaryFlag = ['inactive'];
            const dangerFlag = ['banned', 'failure', 'fail'];
            const warningFlag = ['pending'];
            const infoFlag = [];
            const lightFlag = [];
            const darkFlag = [];
            return successFlag.includes(s.toLowerCase()) ? 'success'
                : secondaryFlag.includes(s.toLowerCase()) ? 'secondary'
                : dangerFlag.includes(s.toLowerCase()) ? 'danger'
                : warningFlag.includes(s.toLowerCase()) ? 'warning'
                : infoFlag.includes(s.toLowerCase()) ? 'info'
                : lightFlag.includes(s.toLowerCase()) ? 'light'
                : darkFlag.includes(s.toLowerCase()) ? 'dark'
                : 'primary';
        },
    /**********************************************************************************
     * Name       : capitalize
     * Input   => (s: any String   => String)
     * Output  => (String): with upper case of First letter
     * Description:  Select badges variant by given val
     **********************************************************************************/
        capitalize: (s) => {
            if (typeof s !== 'string') {
                return '';
            }
            return s.charAt(0).toUpperCase() + s.slice(1);
        },
    /**********************************************************************************
     * Name       : consoleLogEnv
     * Input   => (s: any String   => String)
     *             o: any object   => Object)
     * Output  => print out on console.log
     * Description:  Console.log if only when it's not in production.
     **********************************************************************************/
        consoleLogEnv: function (s, o) {
            const processEnv = this.$root.$options.components.App.props.processEnv.default;
            if (!this.isEmpty(processEnv) && processEnv != 'production') {
                if (!this.isEmpty(o)) {
                    console.log(s, o);
                } else {
                    console.log(s);
                }
            }
        },
    /**********************************************************************************
     * Name       : colSelector
     * Input   => (l: length of data   => Number)
     * Output  => (String): with First letter
     * Description:  return String with selected col size
     **********************************************************************************/
        colSelector: function (l) {
            const colNumber = Math.round(12 / l);
            return 'col-xs-6 col-sm-6 col-md-6 col-lg-' + colNumber + ' col';
        },
    /**********************************************************************************
     * Name       : isSelectedType
     * Input   => (t: type to check  =>  n: Number, s:String, b:Boolean, o:Object, a:Arr
     *             d: data to check  => Any)
     * Output  => boolean whether it's checked type
     * Description:  Console.log if only when it's not in production.
     **********************************************************************************/
        isSelectedType: function (d, t) {
            if (t.toUpperCase() ==='N') {
                return (Number.isInteger(d) && !isNaN(d));
            } else if(t.toUpperCase() ==='D' || t.toUpperCase() ==='F') {
                return (!isNaN(parseFloat(d)));
            } else if(t.toUpperCase() ==='B') {
                return  ['1', '0', 1, 0, true, false].includes(d);
            } else if(t.toUpperCase() ==='S') {
                return  (typeof d === 'string' || d instanceof String);
            } else if(t.toUpperCase() ==='O') {
                return (typeof d === 'object' && d !== null && !Array.isArray(d));
            } else if(t.toUpperCase() ==='A') {
                return Array.isArray(d);
            } else {
                throw 'Please, Check data type';
            }
        },
    /**********************************************************************************
     * Name       : selectIconHtml
     * Input   => (o: icon object   =>  Object)
     *            {type: type of font awesome ex: fal, fab,
     *             icon: icon name,
     *             size: size of icon ex: -1 ~ 10
     *             color: variant color
     *            }
     * Output  => boolean whether it's checked type
     * Description:  Create a string of <i/> Dom tag with given option
     **********************************************************************************/
        selectIconHtml: function (o) {
            //Note:: Please add a new type letter when New font Type has added.
            const fontAwesome = ['l','b'];
            let returnHtml = '';
            let defaultClass = 'fal ';
            if (o.hasOwnProperty('type') && fontAwesome.includes(o.type)) {
                defaultClass = 'fa' + o.type + ' ';
            }
            if (o.hasOwnProperty('icon')) {
                defaultClass += o.icon;
            }else {
                defaultClass += 'fa-hashtag';
            }
            if (o.hasOwnProperty('size') && o.size > -2 && o.size <= 10) {
                if(o.size === -1){
                    defaultClass += ' fa-xs';
                }else if(o.size === 0){
                    defaultClass += ' fa-sm';
                }else if(o.size === 1){
                    defaultClass += ' fa-lg';
                }else {
                    defaultClass += ' fa-'+ o.size +'x';
                }
            }
            if(o.hasOwnProperty('color')) {
                defaultClass += ' ' + o.color;
            }
            returnHtml =`<i class="${defaultClass}"> </i>`;
            return returnHtml;
        },
    /**********************************************************************************
     * Name       : tr
     * Input   => (m: message   =>  String)
     *            {type: type of font awesome ex: fal, fab,
     *             icon: icon name,
     *             size: size of icon ex: -1 ~ 10
     *             color: variant color
     *            }
     * Output  => String translation Message
     * Description:  translation of i18n
     **********************************************************************************/
        tr: function (m) {
            let path = m.split('.');
            let key = 'MSG';
            if (path[0] !== 'MSG' && path.length < 2) {
                key += '.'+m;
            }else {
                key = m;
            }
            return  this.$i18n.t(key);
        }
    },

    data: function () {
        //let status = (document.body.className.indexOf('sidebar-minimized brand-minimized') > -1) ? true : false;
        return {
            //sideBarIsMinimized: status,
            currentNodeEnv: null
        };
    }
};

