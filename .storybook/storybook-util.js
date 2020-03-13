import {
    text, boolean, number, object, array, select, color,
} from '@storybook/addon-knobs/vue';
import _ from 'lodash'

const knobMapper = {
    String: text,
    Boolean: boolean,
    Number: number,
    Object: object,
}

export const getKnobProps = (props, data = {}, knobs = {}, options = {}) => {
    const res = {};

    if(props instanceof Array) {
        throw new Error('prop MUST be an object.');
        return res;
    };

    _.forEach(props, (v, k) => {
        res[k] = {};

        let type = v.type || v;
        if (type instanceof Array) { type = type[0]};
        const knob = knobs[k] || knobMapper[type.name];
        const defaultVal = data[k] || v.default;
        const option = options[k];

        if (knob === select) {
            res[k].default = knob(k, option, defaultVal);
        } else if (knob === number || knob === array) {
            res[k].default = knob(k, defaultVal, option);
        } else res[k].default = knob(k, defaultVal);
    })

    return res;
}

const propsTypeMapping = {
    string: text,
    boolean,
    number,
    object,
    array,
    select,
    color,
};

function makeKnobProp(prop, value, knobType) {
    const typeName = knobType || prop.type.name;
    let defaultValue = value;

    if (!value) defaultValue = undefined;
    else if (typeName === 'object' && value.name === '_default') defaultValue = {};
    else if (typeName === 'array' && value.name === '_default') defaultValue = [];

    const knobsType = propsTypeMapping[typeName];
    if (knobsType) {
    // let defaultValue = prop.defaultValue.func ? eval(prop.defaultValue.value)() : eval(prop.defaultValue.value) ;
        return { default: knobsType(prop.name, defaultValue) };
    }
}

/**
 * prop info
 * @typedef {Object} propInfo
 * @property {string} name - prop name
 * @property {any} default - prop default value optional
 */

/**
 * custom props
 * @typedef {propInfo} props
 */
/**
 * auto make storybook knob props
 *
 * @param {Object} comp - target vue component
 * @param {props} props
 * @return {Object} knob props
 *
 * @example get all props and use component default value
 *     import BaseInput from './BaseInput';
 *     export const simple = () => ({
 *          ...
 *          props: {
 *              ...autoProps(BaseInput)
 *      });,*
 *
 * @example choice prop but use component default value
 *     import BaseInput from './BaseInput';
 *     export const simple = () => ({
 *          ...
 *          props: {
 *              ...autoProps(BaseInput,[{name:'value'}])
 *      });,
 *
 * @example choice prop and change default value
 *     import BaseInput from './BaseInput';
 *     export const simple = () => ({
 *          ...
 *          props: {
 *              ...autoProps(BaseInput,[{name:'value',default:'typing here!!'}])
 *      });,
 *
 * @example choice prop and change default value with addon-knobs(optional)
 *     import BaseInput from './BaseInput';
 *     export const simple = () => ({
 *          ...
 *          props: {
 *              ...autoProps(BaseInput,[{
 *                  name:'value',
 *                  default:'typing here!!',
 *                  knobType(optional): 'color'
 *              }])
 *      });,
 */
function autoProps(comp, props = []) {
    const mapping = {};
    const docProps = comp.__docgenInfo.props;
    const propsValue = comp.props;
    if (!propsValue) return {};
    Object.keys(docProps).some((key) => {
        try {
            if (!propsValue[key]) return false;

            let defaultValue = propsValue[key].default;
            let knobType = null;

            if (props.length) {
                const info = (props.find(o => o.name === key));
                if (info && 'default' in info) {
                    defaultValue = info.default;
                    knobType = info.knobType;
                }
            }

            const knob = makeKnobProp(docProps[key], defaultValue, knobType);
            if (knob) {
                mapping[key] = knob;
            }
        } catch (e) {
            console.error('autoProps Error: ', e);
        }
        return false;
    });
    return mapping;
}

export { autoProps };
