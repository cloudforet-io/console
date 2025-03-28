import { getParticle, i18n } from '@/translations';

import { useFieldValidator } from '@/common/composables/form-validator';

export type Scope = 'PROJECT'|'WORKSPACE';
export const useTaskTypeScopeField = () => {
    const scopeValidator = useFieldValidator<Scope>('PROJECT', (val) => {
        if (!val) {
            return i18n.t('OPSFLOW.VALIDATION.REQUIRED', {
                topic: i18n.t('OPSFLOW.SCOPE'),
                particle: getParticle(i18n.t('OPSFLOW.SCOPE') as string, 'topic'),
            });
        }
        return true;
    });
    const { value: scope, setValue: setScope } = scopeValidator;

    return {
        scope,
        setScope,
        scopeValidator,
    };
};
