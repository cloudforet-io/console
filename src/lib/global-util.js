import VueLodash from 'vue-lodash';
import timezone from 'countries-and-timezones';
import { GlobalEnum } from '@/lib/enum';

export const Util = {
    methods: {
        /** ********************************************************************************
         * Input        => (v:value: => Any)
         * Output       => (Boolean)
         * Description:    Check whether given value is empty.
         ********************************************************************************* */
        isEmpty(v) {
            return !!((v === '' || v === null || v === undefined || (v !== null && typeof v === 'object' && !Object.keys(v).length)));
        },
        /** ********************************************************************************
         * Name       : selectToCopyToClipboard
         * Input   => (t:text            =>  String)
         * Output  => (Empty):
         * Description:  copy given text to clipboard
         ********************************************************************************* */
        selectToCopyToClipboard(t) {
            const textArea = document.createElement('textarea');
            textArea.value = t;
            document.body.appendChild(textArea);
            textArea.select();
            const successFailCondition = document.execCommand('Copy');
            textArea.remove();
        },
        /** ********************************************************************************
         * Name       : capitalize
         * Input   => (s: any String   => String)
         * Output  => (String): with upper case of First letter
         * Description:  Select badges variant by given val
         ********************************************************************************* */
        capitalize(s) {
            if (typeof s !== 'string' || this.isEmpty(s)) {
                return '';
            }
            return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        },
        /** ********************************************************************************
         * Name       : consoleLogEnv
         * Input   => (s: any String   => String)
         *             o: any object   => Object)
         * Output  => print out on console.log
         * Description:  Console.log if only when it's not in production.
         ********************************************************************************* */
        consoleLogEnv(s, o) {
            const processEnv = this.$root.$options.components.App.props.processEnv.default;
            if (!this.isEmpty(processEnv) && processEnv != 'production') {
                if (!this.isEmpty(o)) {
                    console.log(s, o);
                } else {
                    console.log(s);
                }
            }
        },
        /** ********************************************************************************
         * Name       : colSelector
         * Input   => (l: length of data   => Number)
         * Output  => (String): with First letter
         * Description:  return String with selected col size
         ********************************************************************************* */
        colSelector(l) {
            const colNumber = Math.round(12 / l);
            return `col-xs-6 col-sm-6 col-md-6 col-lg-${colNumber} col`;
        },
        /** ********************************************************************************
         * Name       : isSelectedType
         * Input   => (t: type to check  =>  n: Number, s:String, b:Boolean, o:Object, a:Arr
         *             d: data to check  => Any)
         * Output  => boolean whether it's checked type
         * Description:  Console.log if only when it's not in production.
         ********************************************************************************* */
        isSelectedType(d, t) {
            if (t.toUpperCase() === 'N') {
                return (Number.isInteger(d) && !isNaN(d));
            } if (t.toUpperCase() === 'D' || t.toUpperCase() === 'F') {
                return (!isNaN(parseFloat(d)));
            } if (t.toUpperCase() === 'B') {
                return ['1', '0', 1, 0, true, false].includes(d);
            } if (t.toUpperCase() === 'LIST') {
                const splitString = d.split(',');
                return !splitString.includes('');
            } if (t.toUpperCase() === 'S' || t.toUpperCase() === 'STR') {
                return (typeof d === 'string' || d instanceof String);
            } if (t.toUpperCase() === 'O') {
                return (typeof d === 'object' && d !== null && !Array.isArray(d));
            } if (t.toUpperCase() === 'A') {
                return Array.isArray(d);
            }
            throw 'Please, Check data type';
        },
        /** ********************************************************************************
         * Name       : selectIconHtml
         * Input   => (o: icon object   =>  Object, c: class)
         *            {type: type of font awesome ex: fal, fab,
         *             icon: icon name,
         *             size: size of icon ex: -1 ~ 10
         *             color: variant color
         *            }
         * Output  => boolean whether it's checked type
         * Description:  Create a string of <i/> Dom tag with given option
         ********************************************************************************* */
        selectIconHtml(o, c) {
            /** ****************************************************************
             * Note:: Please add a new type letter when New font Type has added.
             * ****************************************************************
             */
            const fontAwesome = ['l', 'b', 'd', 's'];
            let returnHtml = '';
            let defaultClass = 'fal ';
            if (o.hasOwnProperty('type') && fontAwesome.includes(o.type)) {
                defaultClass = `fa${o.type} `;
            }
            if (o.hasOwnProperty('icon')) {
                defaultClass += o.icon;
            } else {
                defaultClass += 'fa-hashtag';
            }
            if (o.hasOwnProperty('size') && o.size > -2 && o.size <= 10) {
                if (o.size === -1) {
                    defaultClass += ' fa-xs';
                } else if (o.size === 0) {
                    defaultClass += ' fa-sm';
                } else if (o.size === 1) {
                    defaultClass += ' fa-lg';
                } else {
                    defaultClass += ` fa-${o.size}x`;
                }
            }
            if (o.hasOwnProperty('color')) {
                defaultClass += ` ${o.color}`;
            }
            returnHtml = `<i class="${defaultClass}"> </i>`;
            return c ? defaultClass : returnHtml;
        },
        // /** ********************************************************************************
        //  * Name       : tr
        //  * Input   => (m: message   =>  String
        //  *             a: argument  =>  String or  Array)
        //  * Output  => String translation Message
        //  * Description:  translation of i18n
        //  ********************************************************************************* */
        // tr(m, a, parent) {
        //     let vm = this;
        //     if (parent) {
        //         vm = parent;
        //     }
        //     if (vm.$i18n.te(m)) {
        //         return vm.isEmpty(a) ? vm.$i18n.t(m) : vm.$i18n.t(m, a);
        //     }
        //     return 'No Message';
        // },
        /** ********************************************************************************
         * Name       : treeDataHandler
         * Input   => (d: data                         =>  Array of data Object
         *             f: flag                         =>  flag key in Enum variables
         * Output  => Object Array which
         * Description:  return tree array of object which suits for BaseTree
         ********************************************************************************* */
        treeDataHandler(d, f) {
            let returnTree = [];
            if (d.hasOwnProperty('items') && d.items.length > 0) {
                d.items.forEach((curItem) => {
                    const treeItem = this.getSelectedNode(curItem, f, true);
                    returnTree.push(treeItem);
                });
            } else {
                const targetObj = f === 'PROJECT' ? 'project group' : 'region';
                returnTree = [{
                    title: `Right-click on your mouse to create a new ${targetObj}.`,
                    isLeaf: true,
                    data: {
                        init: true,
                    },
                }];
            }
            return returnTree;
        },
        /** ********************************************************************************
         * Name       : getSelectedNode
         * Input   => (o: any data Object to bind                         =>  Object)
         * Output  => Node
         * Description:  return tree array of object which suits for BaseTree
         ********************************************************************************* */
        getSelectedNode(o, type, isFirstLoad) {
            const selectedNode = {
                title: '',
                isLeaf: false,
                children: [],
                isExpanded: false,
                isSelected: false,
                isDraggable: type !== 'DATA_CENTER',
                isSelectable: true,
                data: { visible: false },
            };
            if (!this.isEmpty(o)) {
                const leafStatus = GlobalEnum.TREE[type][o.item_type].isLeaf;
                for (const [key, val] of Object.entries(o)) {
                    if (key === 'name') {
                        selectedNode.title = val;
                    } else if (key === 'has_child') {
                        selectedNode.isLeaf = !val;
                    } else if (key === 'domain_id') {
                        continue;
                    } else {
                        selectedNode.data[key] = val;
                    }
                    selectedNode.data.group = type;

                    if (isFirstLoad) {
                        selectedNode.data.is_cached = false;
                    }
                }

                if (!this.isEmpty(leafStatus) && !('has_child' in o)) {
                    selectedNode.isLeaf = leafStatus;
                }
            }
            return selectedNode;
        },
        /** ********************************************************************************
         * Name       : getSelectedNode
         * Input   => (o: any data Object to bind                         =>  Object)
         * Output  => Node
         * Description:  return tree array of object which suits for BaseTree
         ********************************************************************************* */
        getSelectedNodeArr(dataArr, nodeType) {
            const NodeArray = [];
            if (dataArr.length > 0) {
                dataArr.forEach((curItem) => {
                    NodeArray.push(this.getSelectedNode(curItem, nodeType));
                });
            }
            return NodeArray;
        },
        /** ********************************************************************************
         * Name       : getDatefromTimeStamp
         * Input   => (f: flag                         =>  String)
         * Output  => Node
         * Description:  return tree array of object which suits for BaseTree
         ********************************************************************************* */
        getDatefromTimeStamp(ts, tz, tzr) {
            const mxTimezones = timezone.getAllTimezones();
            const options = {
                timeZone: 'UTC',
                hour12: false,
                timeZoneName: 'long',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            };

            if (!this.isEmpty(mxTimezones[tz])) {
                options.timeZone = tz;
            }
            const timeStamps = new Date(ts * 1000).toLocaleString('en-US', options).split(' ');
            const DateTime = this.isEmpty(tzr) ? `${this.getTimeStampFormatter(timeStamps[0])} ${timeStamps[1]}` : new Date(ts * 1000).toLocaleString('en-US', options);
            return DateTime;
        },
        /** ********************************************************************************
         * Name       : getDatefromTimeStamp
         * Input   => (f: flag                         =>  String)
         * Output  => Node
         * Description:  return tree array of object which suits for BaseTree
         ********************************************************************************* */
        getTimeStampFormatter(date) {
            const DateArr = date.split('/');
            return DateArr.length === 3 ? `${this.replaceAll(DateArr[2], ',', '')}-${DateArr[0]}-${DateArr[1]}` : date;
        },
        /** ********************************************************************************
         * Name       : validateLength
         * Input   => (value                           =>  String
         *             boolOnly                        =>  Bolean
         *             minLength                       =>  Number
         *             maxLength                       =>  Number)
         * Output  => Boolean or Null
         * Description:  return the result of validation
         ********************************************************************************* */
        validateLength(value, boolOnly, minLength, maxLength) {
            if (this.isEmpty(value)) {
                if (boolOnly) {
                    return false;
                }
                return null;
            }
            if (value.length < minLength) {
                return false;
            }
            if (!this.isEmpty(this.maxLength) && value.length > maxLength) {
                return false;
            }
            return true;
        },
        /** ********************************************************************************
         * Name       : validateSameness
         * Input   => (value                           =>  String
         *             boolOnly                        =>  Bolean
         *             checkValue                      =>  String)
         * Output  => Boolean or Null
         * Description:  return the result of validation
         ********************************************************************************* */
        validateSameness(value, boolOnly, checkValue) {
            if (this.isEmpty(value) || this.isEmpty(checkValue)) {
                if (boolOnly) {
                    return false;
                }
                return null;
            }
            if (value !== checkValue) {
                return false;
            }
            return true;
        },
        /** ********************************************************************************
         * Name       : validateSameness
         * Input   => (value                           =>  String
         *             boolOnly                        =>  Bolean
         *             checkValue                      =>  String)
         * Output  => Boolean or Null
         * Description:  return the result of validation
         ********************************************************************************* */
        getSelectedValArr(data, path) {
            const returnArray = [];
            if (data.length > 0) {
                data.forEach((currentItem, index) => {
                    if (!this.isEmpty(this._.get(currentItem, path))) {
                        returnArray.push(this._.get(currentItem, path));
                    }
                });
            }
            return returnArray;
        },
        /** ********************************************************************************
         * Name       : isImageUrlValid
         * Input   => (url                            =>   String
         * Output  => Boolean
         * Description:  return image url is valid
         ********************************************************************************* */
        async isImageUrlValid(url) {
            async function checkImage(imageSrc, good, bad) {
                const img = new Image();
                img.onload = await good;
                img.onerror = await bad;
                img.src = imageSrc;
            }
            const returnVal = await checkImage(url, () => true, () => false);
            return returnVal;
        },
        /** ********************************************************************************
         * Name       : validateSameness
         * Input   => (value                           =>  String
         *             boolOnly                        =>  Bolean
         *             checkValue                      =>  String)
         * Output  => Boolean or Null
         * Description:  return the result of validation
         ********************************************************************************* */
        getRightChildrenIndex(ref_data, key) {
            let returnVal = [];
            if (this.isEmpty(key)) {
                return returnVal;
            }

            // means Array
            if (this.isSelectedType(key, 'a')) {
                key.forEach((curItem) => {
                    const index = ref_data.findIndex(x => x.$options.name === curItem);
                    if (index > -1) {
                        returnVal.push(index);
                    }
                });
            } else {
                returnVal = ref_data.findIndex(x => x.$options.name === key);
            }

            return returnVal;
        },
        /** ********************************************************************************
         * Name       : selectIconType
         * Input   => (value                           =>  String
         *             boolOnly                        =>  Bolean
         *             checkValue                      =>  String)
         * Output  => Boolean true or false
         * Description:  return the result of validation
         ********************************************************************************* */
        selectIconType(tag) {
            let returnVal = false;
            let allowedIcon = null;

            if (!this.isEmpty(tag)) {
                let key = '';
                const iconVal = tag.hasOwnProperty('icon') ? tag.icon : this.isSelectedType(tag, 's') ? tag : '';
                if (tag.hasOwnProperty('icon')) {
                    key = tag.icon.includes('svg') ? 'src' : 'file_name';
                } else if (this.isSelectedType(tag, 's')) {
                    key = 'file_name';
                }
                allowedIcon = iconVal.toUpperCase().includes('AWS') ? this._.get(GlobalEnum, 'COLLECTOR.AWS') : allowedIcon;
                returnVal = !this.isEmpty(allowedIcon) ? allowedIcon.some(icon => icon[key] === iconVal) : returnVal;
            }
            return returnVal;
        },
        /** ********************************************************************************
         * Name       : getCollectModeSelectList
         *
         * Output  => Array
         * Description:  return Array of language select list.
         ********************************************************************************* */
        getCollectModeSelectList() {
            return Object.values(GlobalEnum.COLLECT_MODE);
        },
        /** ********************************************************************************
         * Name       : replaceAll
         *
         * Output  => Array
         * Description:  return Array of language select list.
         ********************************************************************************* */
        replaceAll(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        },
        /** ********************************************************************************
         * Name       : replaceFilterFormat
         * str : String
         * int : Integer
         * bool: Boolean
         * float: Float
         * list: List (seperate by comma)
         * Output  => Array
         * Description:  return appropriate type by its key.
         ********************************************************************************* */
        replaceFilterFormat(str, placeHolder) {
            let returnVal = '';

            const filterFormatArr = {
                str: 'String',
                int: 'Integer',
                bool: 'Boolean',
                float: 'Float',
                list: 'List',
            };

            const holderAdditional = {
                list: '(seperate by comma)',
            };

            if (filterFormatArr.hasOwnProperty(str)) {
                returnVal = (placeHolder && holderAdditional.hasOwnProperty(str)) ? `${filterFormatArr[str]} ${holderAdditional[str]}` : filterFormatArr[str];
            }

            return returnVal;
        },
    },
    data() {
        return {
            _: VueLodash,
        };
    },
};
