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
                            @change="onChange"
                            @init="onChange"
                            @rowLeftClick="onSelect"
            />
            <p class="tag-title">
                {{ $t('PROJECT.DETAIL.MODAL_ADDED_MEMBERS') }}
            </p>
            <p class="tag-container">
                <p-tag v-for="(tag, idx) in tagTools.tags" :key="`tag-${tag}`"
                       class="tag"
                       @delete="tagTools.deleteTag(idx)"
                >
                    {{ tag }}
                </p-tag>
            </p>
            <p-field-group
                :label="'Project Role'"
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
                                       :placeholder="'Select a Role'"
                    />
                </template>
            </p-field-group>
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
    PButtonModal, PTag, PSearchTable, PSelectDropdown, PFieldGroup,
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
        });
        const validationState = reactive({
            isProjectRoleValid: undefined as undefined | boolean,
            projectRoleCheckInvalidText: '' as TranslateResult | string,
        });
        const formState = reactive({
            tagTools: tagList(null),
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
            formState.tagTools.addTag(item.user_id);
        };

        const onChange: SearchTableListeners['change'] = async (options) => {
            if (options) {
                state.options = options;
                await listUser();
            }
        };

        const checkProjectRole = async () => {
            if (state.projectRole === '') {
                validationState.isProjectRoleValid = false;
                validationState.projectRoleCheckInvalidText = 'Select a Role';
            } else {
                validationState.isProjectRoleValid = true;
                validationState.projectRoleCheckInvalidText = '';
            }
        };

        const bindRole = async (id, roleId) => {
            await SpaceConnector.client.identity.roleBinding.create({
                resource_type: 'identity.User',
                resource_id: id,
                role_id: roleId,
                project_id: projectId,
            });
        };

        const confirm = async () => {
            const users = formState.tagTools.tags;

            await checkProjectRole();

            if (validationState.isProjectRoleValid) {
                try {
                    await SpaceConnector.client.identity.project.member.add({
                        project_id: projectId,
                        users,
                    });
                    await users.forEach((id) => {
                        bindRole(id, state.projectRole);
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
            proxyVisible,
        };
    },
};
</script>

<style lang="postcss" scoped>

.tag-title {
    @apply font-semibold leading-normal text-sm mb-1 mt-8;
}
.tag-container {
    @apply border border-gray-200;
    height: 7.5rem;
    padding: 0.5rem;
    border-radius: 0.125rem;
    background-color: theme('colors.primary4');

    >>> .p-tag.deletable {
        @apply bg-white border border-primary;
        margin-bottom: 0.25rem;
        .p-i-icon {
            @apply text-primary;
        }
    }
}
>>> .modal-content .modal-body-container {
    overflow: visible;
}
.dropdown {
    margin-top: 1rem;
}
.p-dropdown-menu-btn {
    max-width: 14rem;
}
</style>
