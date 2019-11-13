
export const makeDef = (parent, name, trLabel, value, extra) => {
    const def = extra ? { ...extra, name, value } : { name, value };
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
 *  {text: 'name', label:tr('COL_NM.NAME',null,parent),value:'abcd'},
 *  {text: 'state', label:tr('COL_NM.NAME','en',parent),value:'enabled'},
 *  {text: 'primary_ip_address', label:tr('COL_NM.NAME','en',parent),value:'1.1.1.1', copyFlag: true,},
 * ]
 * makeTrFields([
 *  ['name', 'COL_NM.NAME','abcd'],
 *  ['state', ['COL_NM.STATE','en'],'enabled'],
 *  ['primary_ip_address', 'COL_NM.IP','1.1.1.1',{copyFlag: true,}],
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
