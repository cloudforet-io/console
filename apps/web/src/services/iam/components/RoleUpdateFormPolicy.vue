<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import {
    PHeading, PI, PRadioGroup, PRadio, PCodeEditor,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';

import { useRoleGetQuery } from '@/services/iam/composables/use-role-get-query';

const POLICY_TYPE = {
    DEFAULT: 'default',
    CUSTOM: 'custom',
} as const;
type PolicyType = typeof POLICY_TYPE[keyof typeof POLICY_TYPE];
type RadioType = {
    label: TranslateResult,
    name: PolicyType
};

interface Props {
    selectedRadioIdx?: number;
}

const props = withDefaults(defineProps<Props>(), {
    selectedRadioIdx: 0,
});

const emit = defineEmits<{(e: 'update', value: string): void,
    (e: 'update:selected-radio-idx', value: number): void,
}>();

const router = useRouter();
const roleId: string = router.currentRoute.params.id;

const { roleData } = useRoleGetQuery(roleId);

const state = reactive({
    code: '',
    radioMenuList: computed<RadioType[]>(() => ([
        {
            label: i18n.t('IAM.ROLE.FORM.POLICY_DEFAULT'),
            name: POLICY_TYPE.DEFAULT,
        },
        {
            label: i18n.t('IAM.ROLE.FORM.POLICY_CUSTOM'),
            name: POLICY_TYPE.CUSTOM,
        },
    ])),
    proxySelectedRadioIdx: useProxyValue('selectedRadioIdx', props, emit),
});

/* Component */
const handleCodeUpdate = (modifiedCode: string) => {
    state.code = modifiedCode;
    emit('update', modifiedCode);
};

/* Watcher */
watch(roleData, (initialData) => {
    if (initialData?.permissions && initialData.permissions.length > 0) {
        state.proxySelectedRadioIdx = 1;
        state.code = initialData.permissions.join('\n');
    }
}, { deep: true, immediate: true });
</script>

<template>
    <div class="role-update-page-policy">
        <p-heading class="mt-8 mb-2"
                   heading-type="sub"
                   :title="$t('IAM.ROLE.DETAIL.API_POLICY')"
        />
        <p-radio-group>
            <p-radio v-for="(item, idx) in state.radioMenuList"
                     :key="`policy-scope-${idx}`"
                     v-model="state.proxySelectedRadioIdx"
                     :value="idx"
            >
                <span class="radio-item">
                    {{ item.label }}
                </span>
            </p-radio>
        </p-radio-group>
        <div v-if="state.proxySelectedRadioIdx === 0"
             class="has-all-permissions"
        >
            <p-i name="ic_plugs"
                 width="2rem"
                 height="2rem"
                 color="inherit"
            />
            <span class="text">
                {{ $t('IAM.ROLE.FORM.DEFAULT_API_POLICY_HELP_TEXT') }}
            </span>
        </div>
        <p-code-editor v-else
                       :code="state.code"
                       class="content-wrapper"
                       @update:code="handleCodeUpdate"
        />
    </div>
</template>

<style scoped lang="postcss">
.role-update-page-policy {
    @apply flex flex-col;
    margin: 0 1rem 2.5rem 1rem;
    gap: 0.5rem;
    .has-all-permissions {
        @apply flex items-center border border-gray-200 rounded-md;
        padding: 1rem;
        gap: 0.5rem;
        .text {
            flex: 1;
        }
    }
}
</style>
