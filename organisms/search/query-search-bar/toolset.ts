export const keyRegx = new RegExp('^(?<key>.+?):');
export const operatorRegx = new RegExp('^.+?:(?<operator>[=|<|>|!|$]=?)?');
export interface TagInfo {
 hasKey: boolean;
 key: string;
 operator: string;
 value: any;
}

export const parseTag = (text: string): TagInfo => {
    const keyParser = keyRegx.exec(text);
    const operatorParser = operatorRegx.exec(text);
    // @ts-ignore
    const key = keyParser && !!keyParser.groups.key ? keyParser.groups.key.trim() : '';
    // @ts-ignore
    const operator = operatorParser && !!operatorParser.groups.operator ? operatorParser.groups.operator.trim() : '';
    let value: null|string = null;
    if (operatorRegx.test(text) && Array.isArray(operatorParser)) {
        value = text.slice(operatorParser[0].length).trim();
    }
    return {
        hasKey: !!key,
        key,
        operator,
        value,
    };
};
