import { faker } from '@faker-js/faker';

import type { TextHighlightingProps } from '@/data-display/text-highlighting/type';
import { TEXT_HIGHLIGHTING_STYLE_TYPE } from '@/data-display/text-highlighting/type';

export const getTextHighlightingProps = (): TextHighlightingProps => {
    const text = faker.lorem.sentence(20);
    const term = text.slice(5, 10);
    return {
        text,
        term,
        styleType: TEXT_HIGHLIGHTING_STYLE_TYPE[0],
    };
};
