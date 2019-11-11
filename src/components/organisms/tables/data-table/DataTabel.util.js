import { Util } from '@/lib/global-util';

export const makeField = (parent, name, trLabel, extra) => {
    const field = extra ? { ...extra, name } : { name };
    if (trLabel) {
        if (typeof trLabel === 'string') {
            field.label = parent.tr(trLabel, null, parent);
        } else {
            field.label = parent.tr(...trLabel, parent);
        }
    }
    return field;
};

/**
 * use by tr(trArgument) or tr(...trArgument)
 * @typedef {(string||string[])} trArgument
 */

/**
 * tr fields info
 * @typedef {Array} TrField
 * @property {string} 0 - field name
 * @property {trArgument} 1 - tr argument
 * @property {Object} 2 - extra field data
 */

/**
 * help to make table reactive object for composition-api
 * @param {TrField[]} fields - The title of the book.
 * @param {Object} parent - parent vm
 *
 * @example <caption>simpe example</caption>
 * // returns [
 *  {text: 'name', label:tr('COL_NM.NAME',null,parent)},
 *  {text: 'state', label:tr('COL_NM.NAME','en',parent)},
 *  {text: 'name', label:tr('COL_NM.NAME','en',parent)},
 * ]
 * makeTrFields([
 *  ['name', 'COL_NM.NAME'],
 *  ['state', ['COL_NM.STATE','en']]
 */
export const makeTrFields = (fields, parent) => {
    const result = [];
    fields.forEach((val) => {
        result.push(makeField(parent, ...val));
    });
    return result;
};
export const timestampFormater = value => Util.methods.getDatefromTimeStamp(value.seconds, localStorage.getItem('timezone'));
