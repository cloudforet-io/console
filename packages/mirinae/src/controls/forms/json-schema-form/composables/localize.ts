import { reactive, toRefs, watch } from 'vue';

import type { Localize } from 'ajv-i18n/localize/types';

import type { JsonSchemaFormProps } from '@/controls/forms/json-schema-form/type';
import type { SupportLanguage } from '@/translations';

export const LOCALIZE_LOADERS: Record<SupportLanguage, () => Promise<Localize>> = {
    en: async () => { const module = await import('ajv-i18n/localize/en'); return module.default; },
    ko: async () => { const module = await import('ajv-i18n/localize/ko'); return module.default; },
    jp: async () => { const module = await import('ajv-i18n/localize/ja'); return module.default; },
};

const localizeMap: Record<SupportLanguage, any|boolean> = {
    en: undefined,
    ko: undefined,
    jp: undefined,
};


export const useLocalize = (props: JsonSchemaFormProps) => {
    const state = reactive({
        localize: null as Localize|null,
    });

    watch(() => props.language, async (language) => {
        if (!language) {
            state.localize = null;
            return;
        }
        const localize = localizeMap[language] ?? await LOCALIZE_LOADERS[language]?.();
        if (!localize) {
            state.localize = null;
            return;
        }

        localizeMap[language] = localize;
        state.localize = localize;
    }, { immediate: true });

    return toRefs(state);
};
