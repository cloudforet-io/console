import { GlobalEnum } from '@/lib/enum';
import _ from 'lodash';

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
         * Name       : copyTextToClipboard
         * Input   => (t:text            =>  String)
         * Output  => (Empty):
         * Description:  copy given text to clipboard
         ********************************************************************************* */
        copyTextToClipboard(t) {
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
        getSelectedValArr(data, path) {
            const returnArray = [];
            if (data.length > 0) {
                data.forEach((currentItem, index) => {
                    if (!this.isEmpty(_.get(currentItem, path))) {
                        returnArray.push(_.get(currentItem, path));
                    }
                });
            }
            return returnArray;
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
    },
    data() {
        return { };
    },
};
