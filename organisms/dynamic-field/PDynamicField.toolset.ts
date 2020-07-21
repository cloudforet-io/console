import color from '@/components/styles/colors';
import { get } from 'lodash';

export const getColor = (col: string|null) => {
    if (col) {
        if (col[0] === '#') {
            return col;
        }
        return get(color, col);
    }
    return col;
};
