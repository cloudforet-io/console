import { defaultsDeep } from 'lodash';
import { i18n } from '@/translations';

export const makeItem = (parent, commonOption, name, trLabel, extra) => {
    let item = extra ? { ...extra, name } : { name };
    if (commonOption) {
        item = defaultsDeep(item, commonOption);
    }
    if (trLabel) {
        const label = (typeof trLabel === 'string') ? [trLabel, null] : trLabel;
        item.label = i18n.t(...label);
    }
    return item;
};

/**
 * use by tr(trArgument) or tr(...trArgument)
 * @typedef {(string||string[])} trArgument
 */

/**
 * tr fields info
 * @typedef {Array} TrDef
 * @property {string} 0 - def name
 * @property {trArgument} 1 - tr argument
 * @property {Object} 2 - extra def data
 */

/**
 * help to make table reactive object for composition-api
 * @param {TrDef[]} defs - The title of the book.
 * @param {Object} parent - parent vm
 *
 * @example <caption>simpe example</caption>
 * // returns [
 *  {name: 'name', label:tr('COL_NM.NAME',null,parent),copyFlag:true},
 *  {name: 'state', label:tr('COL_NM.NAME','en',parent),copyFlag:true},
 *  {name: 'primary_ip_address', label:tr('COL_NM.NAME','en',parent), copyFlag: false,},
 * ]
 * makeTrFields([
 *  ['name', 'COL_NM.NAME'],
 *  ['state', ['COL_NM.STATE','en']],
 *  ['primary_ip_address', 'COL_NM.IP',{copyFlag: false,}],
 *  ],
 *  parent,
 *  {copyFlag:true} // common option! but you can overwrite this option using extra argument
 *  )
 */

export const makeTrItems = (items, parent = null, commonOption = {}) => {
    const result = [];
    items.forEach((item) => {
        result.push(makeItem(null, commonOption, ...item));
    });
    return result;
};
export const ColorBindFactory = (colorMapping, textFnc) => value => ({
    text: textFnc(value),
    ...colorMapping[value],
});
