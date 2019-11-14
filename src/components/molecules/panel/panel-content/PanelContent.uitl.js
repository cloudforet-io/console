import { reactive } from '@vue/composition-api';

export const makeDef = (parent, name, trLabel,  extra) => {
    const def = extra ? { ...extra, name  } : { name  };
    if (trLabel) {
        if (typeof trLabel === 'string') {
            def.label = parent.tr(trLabel, null, parent);
        } else {
            def.label = parent.tr(...trLabel, parent);
        }
    }
    return def;
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
 *  {name: 'name', label:tr('COL_NM.NAME',null,parent)},
 *  {name: 'state', label:tr('COL_NM.NAME','en',parent)},
 *  {name: 'primary_ip_address', label:tr('COL_NM.NAME','en',parent), copyFlag: true,},
 * ]
 * makeTrFields([
 *  ['name', 'COL_NM.NAME'],
 *  ['state', ['COL_NM.STATE','en']],
 *  ['primary_ip_address', 'COL_NM.IP',{copyFlag: true,}],
 *  ],
 *  parent)
 */
export const makeTrDefs = (defs, parent) => {
    const result = [];
    defs.forEach((def) => {
        result.push(makeDef(parent, ...def));
    });
    return result;
};

export const makeReactiveTrDefs = (defs, parent) => {
    const result = [];
    defs.forEach((def) => {
        result.push(reactive(makeDef(parent, ...def)));
    });
    return reactive(result);
};
