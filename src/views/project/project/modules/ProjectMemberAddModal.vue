<template>
    <p-button-modal
        :header-title="$tc('PROJECT.DETAIL.MODAL_ADD_MEMBER', items.length)"
        :centered="true"
        size="lg"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        @confirm="confirm($event)"
    >
        <template #body>
            <p-search-table :fields="fields"
                            :items="items"
                            :total-count="totalCount"
                            :loading="loading"
                            :style="{
                                height: '19rem', padding: '-1rem'
                            }"
                            :selectable="false"
                            :excel-visible="false"
                            @change="onChange"
                            @init="onChange"
                            @rowLeftClick="onSelect"
            />
            <div v-if="isSelected">
                <div class="field-group-wrapper">
                    <p-field-group
                        :label="$t('PROJECT.DETAIL.MODAL_ADD_MEMBER')"
                        :required="true"
                        :invalid="validationState.isMemberValid === false"
                        :invalid-text="validationState.memberCheckInvalidText"
                    >
                        <template #default="{invalid}">
                            <p class="tag-container">
                                <p-tag v-for="(tag, idx) in tagTools.tags" :key="`tag-${tag}`"
                                       class="tag"
                                       @delete="tagTools.deleteTag(idx)"
                                >
                                    {{ tag }}
                                </p-tag>
                            </p>
                        </template>
                    </p-field-group>
                    <p-field-group
                        :label="$t('PROJECT.DETAIL.PROJECT_ROLE')"
                        :required="true"
                        :invalid="validationState.isProjectRoleValid === false"
                        :invalid-text="validationState.projectRoleCheckInvalidText"
                        class="dropdown"
                    >
                        <template #default="{invalid}">
                            <p-select-dropdown v-model="projectRole"
                                               :items="projectRoleList"
                                               auto-height
                                               :disabled="projectRoleList.length < 1"
                                               :placeholder="$t('PROJECT.DETAIL.MODAL_VALIDATION_SELECT_ROLE')"
                            />
                        </template>
                    </p-field-group>
                    <div class="label-text-wrapper">
                        <span class="label-text">
                            {{ $t('PROJECT.DETAIL.PROJECT_MEMBER_LABEL') }}
                        </span>
                        <span class="label-help-msg">
                            Up to 5 Labels
                        </span>
                    </div>
                    <div class="label-input-wrapper">
                        <p-text-input v-model="memberLabel" block
                                      @keyup.enter="addMemberLabel"
                                      :placeholder="'Ex. Developer'"
                        />
                        <p-button class="icon-button" style-type="gray900"
                                  @click="addMemberLabel"
                        >
                            <p-i name="ic_plus" width="1.5rem" height="1.5rem"
                                 color="transparent inherit"
                            />
                        </p-button>
                    </div>

                    <p class="tag-wrapper">
                        <p-tag v-for="(tag, idx) in labelTagTools.tags" :key="`label-tag-${tag}`"
                               class="tag"
                               @delete="labelTagTools.deleteTag(idx)"
                        >
                            {{ tag }}
                        </p-tag>
                    </p>
                </div>
            </div>
            <div v-else>
                <p-empty class="empty-msg">
                    {{ $t('PROJECT.DETAIL.CLICK_ADD_MEMBER') }}
                </p-empty>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    makeProxy,
} from '@/lib/compostion-util';

import {
    ComponentRenderProxy, computed,
    getCurrentInstance,
    reactive, ref, Ref, toRefs,
} from '@vue/composition-api';

import {
    PButtonModal, PTag, PSearchTable, PSelectDropdown, PFieldGroup, PTextInput, PButton, PI, PEmpty,
} from '@spaceone/design-system';
import { SearchTableListeners, Options } from '@spaceone/design-system/dist/src/organisms/tables/search-table/type';

import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { isEqual } from 'lodash';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { getPageStart } from '@/lib/component-utils/pagination';
import VueI18n from 'vue-i18n';

import TranslateResult = VueI18n.TranslateResult;

const tagList = (proxyTags?: Ref<string[]>|null, checkDuplicate = true) => {
    const tags: Ref<any[]> = proxyTags || ref([]);
    if (!tags.value) tags.value = [];

    /**
     * @param idx {Number}
     */
    const deleteTag = (idx: number) => {
        const updatedTags = [...tags.value];
        updatedTags.splice(idx, 1);
        tags.value = updatedTags;
    };

    const deleteAllTags = () => {
        tags.value = [];
    };

    const validation = value => tags.value.every(tag => !isEqual(tag, value));

    /**
     * @param value {String}
     */
    const addTag = (value) => {
        const val = (typeof value === 'string') ? value.trim() : value;
        if (!val || val === '') return;
        if (checkDuplicate && !validation(val)) return;
        const updatedTags = [...tags.value];
        updatedTags.push(val);
        tags.value = updatedTags;
    };

    return reactive({
        tags,
        deleteTag,
        addTag,
        deleteAllTags,
    });
};

export default {
    name: 'ProjectMemberAddModal',
    components: {
        PSearchTable,
        PButtonModal,
        PTag,
        PSelectDropdown,
        PFieldGroup,
        PTextInput,
        PButton,
        PI,
        PEmpty,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        item: {
            type: Object,
            default: () => ({
                properties: {},
            }),
        },
        updateMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            fields: [
                { label: 'User ID', name: 'user_id', type: 'item' },
                { label: 'Name', name: 'name', type: 'item' },
                { label: 'Email', name: 'email', type: 'item' },
            ],
            items: [] as any,
            loading: false,
            totalCount: 0,
            options: {} as Options,
            projectRole: '' as string,
            projectRoleList: [] as any[],
            memberLabel: '',
            isSelected: false,
        });
        const validationState = reactive({
            isMemberValid: undefined as undefined | boolean,
            memberCheckInvalidText: '' as TranslateResult | string,
            isProjectRoleValid: undefined as undefined | boolean,
            projectRoleCheckInvalidText: '' as TranslateResult | string,
        });
        const formState = reactive({
            tagTools: tagList(null),
            labelTagTools: tagList(null),
        });
        const proxyVisible = makeProxy('visible', props, emit);
        const projectId = root.$route.params.id;

        const apiQuery = new ApiQueryHelper();
        const getQuery = () => apiQuery.setSort(state.options.sortBy, state.options.sortDesc)
            .setPage(
                getPageStart(state.options.thisPage, state.options.pageSize),
                state.options.pageSize,
            ).setFilters([{ v: state.options.searchText }])
            .data;

        // List api Handler for query search table
        const listUser = async () => {
            state.loading = true;
            try {
                const resp = await SpaceConnector.client.identity.user.list({
                    query: getQuery(),
                });
                state.items = resp.results;
                state.totalCount = resp.total_count || 0;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const getRoleList = async () => {
            const res = await SpaceConnector.client.identity.role.list({
                // eslint-disable-next-line camelcase
                role_type: 'PROJECT',
            });
            state.projectRoleList = res.results.map(d => ({
                type: 'item',
                label: d.name,
                name: d.role_id,
            }));
        };

        const onSelect = (item) => {
            state.isSelected = true;
            formState.tagTools.addTag(item.user_id);
        };

        const onChange: SearchTableListeners['change'] = async (options) => {
            if (options) {
                state.options = options;
                await listUser();
            }
        };

        const checkMember = async () => {
            if (formState.tagTools.tags.length === 0) {
                validationState.isMemberValid = false;
                validationState.memberCheckInvalidText = vm.$t('PROJECT.DETAIL.MODAL_VALIDATION_SELECT_MEMBER');
            } else {
                validationState.isMemberValid = true;
                validationState.memberCheckInvalidText = '';
            }
        };

        const checkProjectRole = async () => {
            if (state.projectRole === '') {
                validationState.isProjectRoleValid = false;
                validationState.projectRoleCheckInvalidText = vm.$t('PROJECT.DETAIL.MODAL_VALIDATION_SELECT_ROLE');
            } else {
                validationState.isProjectRoleValid = true;
                validationState.projectRoleCheckInvalidText = '';
            }
        };

        const addMemberLabel = () => {
            if (formState.labelTagTools.tags.length >= 5) {
                return;
            }
            formState.labelTagTools.addTag(state.memberLabel);
            state.memberLabel = '';
        };

        const confirm = async () => {
            const users = formState.tagTools.tags;
            const labels = formState.labelTagTools.tags;

            await checkMember();
            await checkProjectRole();

            if (validationState.isProjectRoleValid && validationState.isMemberValid) {
                try {
                    await SpaceConnector.client.identity.project.member.add({
                        project_id: projectId,
                        role_id: state.projectRole,
                        users,
                        labels,
                    });
                    showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_ADD_MEMBER'), '', root);
                } catch (e) {
                    showErrorMessage(vm.$t('PROJECT.DETAIL.ALT_E_ADD_MEMBER'), e, root);
                } finally {
                    emit('confirm');
                    proxyVisible.value = false;
                }
            }
        };

        (async () => {
            await Promise.all([listUser(), getRoleList()]);
        })();

        return {
            ...toRefs(state),
            ...toRefs(formState),
            validationState,
            listUser,
            confirm,
            onSelect,
            onChange,
            addMemberLabel,
            proxyVisible,
        };
    },
};
</script>

<style lang="postcss" scoped>
.field-group-wrapper {
    @apply bg-primary4 border border-gray-200;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    padding: 1.5rem 1rem;
}

.tag-container {
    @apply border border-gray-200;
    min-height: 3.625rem;
    height: auto;
    padding: 0.5rem;
    border-radius: 0.125rem;
    background-color: theme('colors.white');
    overflow-y: auto;
    margin-bottom: 1.5rem;
    >>> .p-tag.deletable {
        @apply bg-blue-300;
        margin-bottom: 0.25rem;
        .p-i-icon {
            @apply text-gray-400;
        }
    }
}

.label-text-wrapper {
    .label-text {
        @apply text-gray-900;
        font-size: 0.875rem;
        margin-right: 0.5rem;
        line-height: 140%;
        font-weight: bold;
    }
    .label-help-msg {
        @apply text-gray-500;
        font-size: 0.75rem;
        line-height: 150%;
    }
    margin-bottom: 0.25rem;
}

.label-input-wrapper {
    display: flex;
}

.icon-button::v-deep {
    @apply p-0 inline-flex justify-center items-center;
    min-width: 2rem;
    max-width: 2rem;
    min-height: 2rem;
    max-height: 2rem;
    margin-left: 0.5rem;
    align-self: center;
}

.tag-wrapper {
    min-height: 3.625rem;
}
>>> .modal-content .modal-body-container {
    overflow: auto;
}

.empty-msg {
    margin-top: 1.5rem;
}

.p-dropdown-menu-btn {
    @apply bg-white;
    max-width: 14rem;
}
</style>
