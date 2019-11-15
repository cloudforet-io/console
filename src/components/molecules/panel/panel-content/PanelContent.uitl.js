
export const makeDef = (parent, commonOption, name, trLabel, extra) => {
    const defaultOption = commonOption || {};
    const def = extra ? { ...defaultOption, ...extra, name } : { ...defaultOption, name };
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
export const makeTrDefs = (defs, parent, commonOption) => {
    const result = [];
    defs.forEach((def) => {
        result.push(makeDef(parent, commonOption, ...def));
    });
    return result;
};
