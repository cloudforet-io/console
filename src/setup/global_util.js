import { hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { GlobalEnum } from '@/setup/enum';
import VueLodash from 'vue-lodash';
import timezone from 'countries-and-timezones';
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
                hexToRgba('#2C68F9', 70),
                hexToRgba('#e81d2a', 70),
                hexToRgba('#8a2be2', 70),
                hexToRgba('#1a1f3e', 70),
                hexToRgba('#0F2965', 70),
                hexToRgba('#4856f2', 70),
                hexToRgba('#FFAE08', 70),
                hexToRgba('#2D9E6E', 70)
            ];
            const colorListWithOutOpacity = ['#2C68F9', '#e81d2a', '#8a2be2', '#1a1f3e', '#4856f2', '#FFAE08', '#2D9E6E' ];

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
            return (i) ? `style="${style}"` : style;
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
        },
        /**********************************************************************************
         * Name       : selectBadges
         * Input   => (s:badges flag String  => String)
         * Output  => (String): variant value
         * Description:  Select badges variant by given val
         **********************************************************************************/
        selectBadges: function (s) {
            const successFlag = ['active', 'success','vm'];
            const secondaryFlag = ['inactive'];
            const dangerFlag = ['banned', 'failure', 'fail'];
            const warningFlag = ['pending','aws'];
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
        capitalize: function (s)  {
            if (typeof s !== 'string' || this.isEmpty(s)) {
                return '';
            }
            return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
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
            } else if (t.toUpperCase() ==='D' || t.toUpperCase() ==='F') {
                return (!isNaN(parseFloat(d)));
            } else if (t.toUpperCase() ==='B') {
                return  ['1', '0', 1, 0, true, false].includes(d);
            } else if (t.toUpperCase() ==='LIST') {
                let splitString = d.split(',');
                return  !splitString.includes('');
            } else if (t.toUpperCase() ==='S' || t.toUpperCase() ==='STR') {
                return  (typeof d === 'string' || d instanceof String);
            } else if (t.toUpperCase() ==='O') {
                return (typeof d === 'object' && d !== null && !Array.isArray(d));
            } else if (t.toUpperCase() ==='A') {
                return Array.isArray(d);
            } else {
                throw 'Please, Check data type';
            }
        },
        /**********************************************************************************
         * Name       : selectIconHtml
         * Input   => (o: icon object   =>  Object, c: class)
         *            {type: type of font awesome ex: fal, fab,
         *             icon: icon name,
         *             size: size of icon ex: -1 ~ 10
         *             color: variant color
         *            }
         * Output  => boolean whether it's checked type
         * Description:  Create a string of <i/> Dom tag with given option
         **********************************************************************************/
        selectIconHtml: function (o, c) {
            /******************************************************************
             * Note:: Please add a new type letter when New font Type has added.
             * ****************************************************************
             */
            const fontAwesome = ['l','b','d','s'];
            let returnHtml = '';
            let defaultClass = 'fal ';
            if (o.hasOwnProperty('type') && fontAwesome.includes(o.type)) {
                defaultClass = 'fa' + o.type + ' ';
            }
            if (o.hasOwnProperty('icon')) {
                defaultClass += o.icon;
            } else {
                defaultClass += 'fa-hashtag';
            }
            if (o.hasOwnProperty('size') && o.size > -2 && o.size <= 10) {
                if (o.size === -1){
                    defaultClass += ' fa-xs';
                } else if (o.size === 0){
                    defaultClass += ' fa-sm';
                } else if (o.size === 1){
                    defaultClass += ' fa-lg';
                } else {
                    defaultClass += ' fa-'+ o.size +'x';
                }
            }
            if (o.hasOwnProperty('color')) {
                defaultClass += ' ' + o.color;
            }
            returnHtml =`<i class="${defaultClass}"> </i>`;
            return c ? defaultClass : returnHtml;
        },
        /**********************************************************************************
         * Name       : tr
         * Input   => (m: message   =>  String
         *             a: argument  =>  String or  Array)
         * Output  => String translation Message
         * Description:  translation of i18n
         **********************************************************************************/
        tr: function (m, a) {
            let path = m.split('.');
            let key = 'MSG';
            if (path[0] !== 'MSG' && path.length < 2) {
                key += '.'+m;
            } else {
                key = m;
            }
            if (this.$i18n.te(key)) {
                return  this.isEmpty(a) ? this.$i18n.t(key) : this.$i18n.t(key, a);
            } else {
                return  'No Message';
            }
        },
        /**********************************************************************************
         * Name       : setFontSize
         * Input   => (m: message   =>  String)
         *            {type: type of font awesome ex: fal, fab,
         *             icon: icon name,
         *             size: size of icon ex: -1 ~ 10
         *             color: variant color
         *            }
         * Output  => String translation Message
         * Description:  return string with font-size with for h1,h2,h3,h4,h5,h6 and personal set data.
         **********************************************************************************/
        setFontSize: function (f) {
            let fontSize = 'font-size:';
            let defaultSet = this.defaultFontSizeSet;
            let length = defaultSet.length;
            if (this.isSelectedType(f,'s') && f.include('px')) {
                fontSize += f;
            } else if ( f > 0 && f < 7 ) {
                fontSize += defaultSet[length-f] + 'px';
            } else {
                fontSize += defaultSet[length-3] + 'px';
            }
            return fontSize;
        },
        /**********************************************************************************
         * Name       : dictToKeyValueArray
         * Input   => (t: data                         =>  Array of data Object
         *             k: key                          =>  String
         *             v: additional value to attach   =>  String
         *             l: location  =>  where to bind additional key at (b: back, or rest default: front)
         * Output  => String translation Message
         * Description:  translation of i18n
         **********************************************************************************/
        dictToKeyValueArray: function (obj) {
            let arr = [];
            for (let key in obj) {
                arr.push({ [key]: obj[key] });
            }
            return arr;
        },
        /**********************************************************************************
         * Name       : treeDataHandler
         * Input   => (d: data                         =>  Array of data Object
         *             f: flag                         =>  flag key in Enum variables
         * Output  => Object Array which
         * Description:  return tree array of object which suits for BaseTree
         **********************************************************************************/
        treeDataHandler: function (d, f) {
            let returnTree = [];
            if (d.hasOwnProperty('items') && d.items.length > 0) {
                d.items.forEach((curItem) =>{
                    this.consoleLogEnv('Tree each: ',curItem);
                    let treeItem = this.getSelectedNode(curItem, f, true);
                    returnTree.push(treeItem);
                });
            } else {
                returnTree =  [{ title: 'Please, Right Click me',
                    isLeaf: true,
                    data: {
                        init: true
                    }}];
            }
            return returnTree;
        },
        /**********************************************************************************
         * Name       : getSelectedNode
         * Input   => (o: any data Object to bind                         =>  Object)
         * Output  => Node
         * Description:  return tree array of object which suits for BaseTree
         **********************************************************************************/
        getSelectedNode: function (o, type, isFirstLoad) {
            let selectedNode = {
                title: '',
                isLeaf: false,
                children: [],
                isExpanded: false,
                isSelected: false,
                isDraggable: (type === 'DATA_CENTER') ? false : true,
                isSelectable: true,
                data: { visible: false }
            };
            if (!this.isEmpty(o)) {
                const leafStatus = GlobalEnum['TREE'][type][o.item_type].isLeaf;
                for (let [key, val] of Object.entries(o)) {
                    if (key==='name') {
                        selectedNode['title'] = val;
                    }  else if (key === 'has_child') {
                        selectedNode['isLeaf'] = !val;
                    }  else if (key === 'domain_id') {
                        continue;
                    } else {
                        selectedNode['data'][key] = val;
                    }
                    selectedNode['data']['group'] = type;

                    if (isFirstLoad){
                        selectedNode['data']['is_cached '] = false;
                    }
                }

                if (!this.isEmpty(leafStatus) && !('has_child' in o)){
                    selectedNode['isLeaf'] = leafStatus;
                }
            }
            return selectedNode;
        },
        /**********************************************************************************
         * Name       : getAllTimezones
         *
         * Output  => Array
         * Description:  return Array of timezone String.
         **********************************************************************************/
        getAllTimezones: function () {
            return Object.keys(timezone.getAllTimezones());
        },
         /**********************************************************************************
         * Name       : getAllTimezones
         *             
         * Output  => Array
         * Description:  return Array of timezone String.
         **********************************************************************************/
        getTimezoneSelectList: function () {
            let results = [];
            let timezones = timezone.getAllTimezones();
            for (var tz in timezones) {
                results.push({
                    value: tz,
                    text: `${tz} ${timezones[tz].offsetStr}`
                });
            }
            return results;
        },
        /**********************************************************************************
         * Name       : getLanguageSelectList
         *             
         * Output  => Array
         * Description:  return Array of language select list.
         **********************************************************************************/
        getLanguageSelectList: function () {
            return Object.values(GlobalEnum.LANGUAGES);
        },
        /**********************************************************************************
         * Name       : getLanguageName
         * Input   => (lang                         =>  String)
         *             
         * Output  => String
         * Description:  return String of language name.
         **********************************************************************************/
        getLanguageName: function (lang) {
            let langObj = GlobalEnum.LANGUAGES[lang];
            if (!langObj) {
                return null;
            }
            return langObj.text;
        },
        /**********************************************************************************
         * Name       : getLanguage
         * Input   => (value                         =>  String)
         *             
         * Output  => Object
         * Description:  return Object of language.
         **********************************************************************************/
        getLanguage: function (value) {
            return GlobalEnum.LANGUAGES[value];
        },
        /**********************************************************************************
         * Name       : getSelectedNode
         * Input   => (o: any data Object to bind                         =>  Object)
         * Output  => Node
         * Description:  return tree array of object which suits for BaseTree
         **********************************************************************************/
        getSelectedNodeArr: function (dataArr, nodeType) {
            let NodeArray = [];
            if (dataArr.length > 0 ) {
                dataArr.forEach(curItem =>{
                    NodeArray.push(this.getSelectedNode(curItem, nodeType));
                });
            }
            return NodeArray;
        },
        /**********************************************************************************
         * Name       : getDatefromTimeStamp
         * Input   => (f: flag                         =>  String)
         * Output  => Node
         * Description:  return tree array of object which suits for BaseTree
         **********************************************************************************/
        getDatefromTimeStamp: function (ts, tz, tzr) {
            const mxTimezones = timezone.getAllTimezones();
            const options = {
                timeZone : 'UTC',
                hour12: false,
                timeZoneName: 'long',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute:'2-digit',
                second: '2-digit'
            };

            if (!this.isEmpty(mxTimezones[tz])){
                options['timeZone'] = tz;
            }
            const DateTime = this.isEmpty(tzr) ? new Date(ts * 1000).toLocaleString('sq-AL', options).substring(0,19) : new Date(ts * 1000).toLocaleString('sq-AL', options);
            return DateTime;
        },
        /**********************************************************************************
         * Name       : getDatefromTimeStamp
         * Input   => (f: flag                         =>  String)
         * Output  => Node
         * Description:  return tree array of object which suits for BaseTree
         **********************************************************************************/
        getTimeStampfromDate: function () {

            return 'a';
        },
        /**********************************************************************************
         * Name       : validateLength
         * Input   => (value                           =>  String
         *             boolOnly                        =>  Bolean
         *             minLength                       =>  Number
         *             maxLength                       =>  Number)
         * Output  => Boolean or Null
         * Description:  return the result of validation
         **********************************************************************************/
        validateLength: function (value, boolOnly, minLength, maxLength) {
            if (this.isEmpty(value)) {
                if (boolOnly) {
                    return false;
                } else {
                    return null;
                }
            }
            if (value.length < minLength) {
                return false;
            }
            if (!this.isEmpty(this.maxLength) && value.length > maxLength) {
                return false;
            }
            return true;
        },
        /**********************************************************************************
         * Name       : validateSameness
         * Input   => (value                           =>  String
         *             boolOnly                        =>  Bolean
         *             checkValue                      =>  String)
         * Output  => Boolean or Null
         * Description:  return the result of validation
         **********************************************************************************/
        validateSameness: function (value, boolOnly, checkValue) {
            if (this.isEmpty(value) || this.isEmpty(checkValue)) {
                if (boolOnly) {
                    return false;
                } else {
                    return null;
                }
            }
            if (value !== checkValue) {
                return false; 
            } 
            return true;
        },
        /**********************************************************************************
         * Name       : validateSameness
         * Input   => (value                           =>  String
         *             boolOnly                        =>  Bolean
         *             checkValue                      =>  String)
         * Output  => Boolean or Null
         * Description:  return the result of validation
         **********************************************************************************/
        getSelectedValArr: function (data, path) {
            let returnArray = [];
            if (data.length > 0){
                data.forEach((currentItem, index) =>{
                    if (!this.isEmpty(this._.get(currentItem, path))){
                        returnArray.push(this._.get(currentItem, path));
                    }
                });
            }
            return returnArray;
        },
        /**********************************************************************************
         * Name       : isImageUrlValid
         * Input   => (url                            =>   String
         * Output  => Boolean
         * Description:  return image url is valid
         **********************************************************************************/
        async isImageUrlValid (url) {
            async function  checkImage(imageSrc, good, bad) {
                let img = new Image();
                img.onload = await good;
                img.onerror = await bad;
                img.src = imageSrc;
            }
            let returnVal = await checkImage(url, function(){
                return true;
            }, function(){
                return false;
            });
            return returnVal;
        },
        /**********************************************************************************
         * Name       : validateSameness
         * Input   => (value                           =>  String
         *             boolOnly                        =>  Bolean
         *             checkValue                      =>  String)
         * Output  => Boolean or Null
         * Description:  return the result of validation
         **********************************************************************************/
        getRightChildrenIndex(ref_data, key){
            let returnVal = [];
            if (this.isEmpty(key)){
                return returnVal;
            }

            //means Array
            if (this.isSelectedType(key,'a')) {
                key.forEach(function(curItem){
                    const index = ref_data.findIndex(x => x.$options.name === curItem);
                    if (index > -1){
                        returnVal.push(index);
                    }
                });
            } else {
                returnVal = ref_data.findIndex(x => x.$options.name === key);
            }

            return returnVal;
        },
        /**********************************************************************************
         * Name       : selectIconType
         * Input   => (value                           =>  String
         *             boolOnly                        =>  Bolean
         *             checkValue                      =>  String)
         * Output  => Boolean true or false
         * Description:  return the result of validation
         **********************************************************************************/
        selectIconType (tag) {
            let returnVal = false;
            let allowedIcon = null;

            if (!this.isEmpty(tag)){
                const iconVal = tag.hasOwnProperty('icon') ? tag.icon : this.isSelectedType(tag, 's') ? tag : '';
                const key = tag.hasOwnProperty('icon') ? 'src' : this.isSelectedType(tag, 's') ? 'file_name' : '';
                allowedIcon = iconVal.toUpperCase().includes('AWS') ? this._.get(GlobalEnum,'COLLECTOR.AWS') : allowedIcon;
                returnVal = !this.isEmpty(allowedIcon) ? allowedIcon.some(icon => icon[key] === iconVal):   returnVal;
            }
            return returnVal;
        },
        /**********************************************************************************
         * Name       : getCollectModeSelectList
         *
         * Output  => Array
         * Description:  return Array of language select list.
         **********************************************************************************/
        getCollectModeSelectList: function () {
            return Object.values(GlobalEnum.COLLECT_MODE);
        },
        /**********************************************************************************
         * Name       : replaceAll
         *
         * Output  => Array
         * Description:  return Array of language select list.
         **********************************************************************************/
        replaceAll (str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }
    },
    data: function () {
        return {
            _: VueLodash,
            defaultFontSizeSet: [10, 12, 14, 16, 18, 24],
            isFirstLogin: 1,
            enums: GlobalEnum
        };
    }
};