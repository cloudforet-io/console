import color from '@/styles/colors';
import _ from 'lodash';

export interface DynamicFieldProps {
    type: string;
    options: any;
    data: any;
}

export const getColor = (col: string|null) => {
    if (col) {
        if (col[0] === '#') {
            return col;
        }
        return _.get(color, col);
    }
    return col;
};
