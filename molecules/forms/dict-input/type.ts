import VueI18n from 'vue-i18n';
import { Ref } from '@vue/composition-api';

interface DictInputSyncType {
    name: string;
    value: number | string;
}

interface DictInputType {
    keyInvalid?: boolean;
    valueInvalid?: boolean;
    keyInvalidText?: VueI18n.TranslateResult | Ref<VueI18n.TranslateResult> | string;
    valueInvalidText?: VueI18n.TranslateResult | Ref<VueI18n.TranslateResult> | string;
    disabled?: boolean;
}

export interface DictInputProps extends DictInputType, DictInputSyncType {}
