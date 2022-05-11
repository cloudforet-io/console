<template>
    <section>
        <p-page-title
            child
            :title="policyInfo.name"
            @goBack="$router.go(-1)"
        >
            <template #title-right-extra>
                <span v-if="type === POLICY_TYPES.MANAGED" class="policy-managed-badge">
                    <!--                    song-lang-->
                    <p-badge style-type="gray200">View Only</p-badge>
                </span>
                <span v-if="type === POLICY_TYPES.CUSTOM" class="policy-edit-buttons">
                    <p-icon-button name="ic_trashcan" class="w-full delete-btn" />
                    <p-icon-button name="ic_edit-text" class="edit-btn" />
                </span>
                <div v-if="type === POLICY_TYPES.CUSTOM" class="policy-modify-buttons">
                    <!--                    song-lang-->
                    <p-button :disabled="!isCodeModified && !isDescriptionModified" style-type="gray-border">
                        Cancel
                    </p-button>
                    <!--                    song-lang-->
                    <p-button :disabled="!isCodeModified && !isDescriptionModified" style-type="primary-dark">
                        Save Changes
                    </p-button>
                </div>
            </template>
        </p-page-title>
        <p-pane-layout class="policy-detail-info-wrapper">
            <div class="policy-detail-contents">
                <!--                song-lang-->
                <p-label>Type</p-label>
                <br>
                <div class="policy-detail-type-badge">
                    <p-badge v-if="type === POLICY_TYPES.MANAGED" outline style-type="gray">
                        <!--                        song-lang-->
                        Managed Policy
                    </p-badge>
                    <p-badge v-else outline style-type="primary1">
                        <!--                        song-lang-->
                        Custom Policy
                    </p-badge>
                </div>
            </div>
            <div class="policy-detail-contents">
                <!--                song-lang-->
                <p-label>ID</p-label>
                <p>{{ policyInfo.policy_id }}</p>
            </div>
            <div class="policy-detail-contents">
                <!--                song-lang-->
                <p-label>
                    Description
                </p-label>
                <br>
                <p v-if="type === POLICY_TYPES.MANAGED">
                    {{ policyInfo.tags.description }}
                </p>
                <p-text-input
                    v-else
                    :value="description"
                    @input="handleDescriptionUpdate"
                />
            </div>
            <div class="policy-detail-contents">
                <!--                song-lang-->
                <p-label>Content</p-label>
                <p-text-editor
                    :mode="type === POLICY_TYPES.MANAGED ? 'readOnly' : 'edit'"
                    :code="code"
                    @update:code="handleCodeUpdate"
                />
            </div>
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import { administrationStore } from '@/services/administration/store';
import {
    PPageTitle, PIconButton, PBadge, PPaneLayout, PLabel, PTextEditor, PButton, PTextInput,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs, defineComponent,
} from '@vue/composition-api';
import { PolicyDetailPageProps } from '@/services/administration/iam/policy/lib/type';
import { POLICY_TYPES } from '@/services/administration/iam/policy/lib/config';
import { SpaceRouter } from '@/router';

export default defineComponent<PolicyDetailPageProps>({
    name: 'PolicyDetailPage',
    props: {
        id: {
            type: String,
            default: '',
        },
    },
    components: {
        PPageTitle,
        PIconButton,
        PBadge,
        PPaneLayout,
        PLabel,
        PTextEditor,
        PButton,
        PTextInput,
    },
    setup(props) {
        const state = reactive({
            policyInfo: computed(() => administrationStore.state.policy.policyData),
            type: SpaceRouter.router.currentRoute.query.type,
            code: computed(() => JSON.stringify(administrationStore.state.policy.policyData, undefined, 4)),
            isCodeModified: false,
            description: computed(() => administrationStore.state.policy.policyData?.tags?.description ?? ''),
            isDescriptionModified: false,
        });

        const handleCodeUpdate = (modifiedCode: string) => {
            state.isCodeModified = modifiedCode !== JSON.stringify(state.policyInfo, undefined, 4);
            state.code = modifiedCode;
        };

        const handleDescriptionUpdate = (modifiedDescription: string) => {
            state.isDescriptionModified = modifiedDescription !== state.policyInfo?.tags?.description ?? '';
            state.description = modifiedDescription;
        };

        (async () => {
            try {
                await administrationStore.dispatch('policy/getPolicyData', props.id);
            } catch (e) {
                console.error(e);
            }
        })();

        return {
            ...toRefs(state),
            POLICY_TYPES,
            handleCodeUpdate,
            handleDescriptionUpdate,
        };
    },
});
</script>

<style lang="postcss" scoped>
.policy-edit-buttons {
    @apply inline-flex;
}
.policy-modify-buttons {
    @apply inline-flex;
    float: right;
    & .p-button {
        margin-left: 1rem;
    }
}
.policy-detail-info-wrapper {
    padding: 18px 16px 40px;
    .policy-detail-type-badge {
        margin-top: 4px;
    }
    .policy-detail-contents {
        margin-bottom: 18px;
        & p {
            @apply text-sm text-gray-900;
        }
    }
}
</style>
