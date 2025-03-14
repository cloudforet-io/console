<script setup lang="ts">
import { reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PFieldGroup, PSelectDropdown, PTextHighlighting, PBadge, PButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';

interface DropdownMenuItem extends SelectDropdownMenuItem {
    role_type?: string;
}

interface Props {
    isDetailPage: boolean;
    isEdit: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isDetailPage: false,
    isEdit: false,
});

const emit = defineEmits<{(event: 'is-edit'): void;
}>();

const roleListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true);

const state = reactive({
    proxyIsEdit: useProxyValue('isEdit', props, emit),
});
const dropdownState = reactive({
    loading: false,
    menuItems: [] as DropdownMenuItem[],
    selectedMenuItems: [] as DropdownMenuItem[],
});

const menuHandler: AutocompleteHandler = async (inputText: string) => {
    await fetchListRoles(inputText);
    return {
        results: dropdownState.menuItems,
    };
};
const fetchListRoles = async (inputText?: string) => {
    dropdownState.loading = true;

    roleListApiQueryHelper.setFilters([
        { k: 'role_type', v: [ROLE_TYPE.WORKSPACE_OWNER], o: '=' },
        { k: 'state', v: ROLE_STATE.ENABLED, o: '=' },
    ]);
    if (inputText) {
        roleListApiQueryHelper.addFilter({
            k: 'name',
            v: inputText,
            o: '',
        });
    }

    try {
        const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
            query: {
                ...roleListApiQueryHelper.data,
                filter: [
                    ...(roleListApiQueryHelper.data.filter || []),
                    { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
                ],
            },
        });
        dropdownState.menuItems = (results ?? []).map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        dropdownState.loading = false;
    }
};
</script>

<template>
    <div class="anomaly-detection-configuration-recipients-form">
        <p-field-group :label="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.COL_SEND_TO')"
                       required
                       class="field"
        >
            <p-select-dropdown class="select-options-dropdown"
                               multi-selectable
                               use-fixed-menu-style
                               show-select-marker
                               appearance-type="badge"
                               is-filterable
                               :loading="dropdownState.loading"
                               :search-text.sync="dropdownState.searchText"
                               :selected.sync="dropdownState.selectedMenuItems"
                               :handler="menuHandler"
            >
                <template #dropdown-button>
                    <div v-if="dropdownState.selectedMenuItems.length > 0"
                         class="selected-workspace-wrapper"
                    >
                        <img :src="useRoleFormatter(dropdownState.selectedMenuItems[0].role_type).image"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                        <span>{{ dropdownState.selectedMenuItems[0].label }}</span>
                        <p-badge v-if="dropdownState.selectedMenuItems.length > 1"
                                 style-type="blue200"
                                 badge-type="subtle"
                        >
                            + {{ dropdownState.selectedMenuItems.length - 1 }}
                        </p-badge>
                    </div>
                    <span v-else
                          class="placeholder"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.COL_SEND_TO_PLACEHOLDER') }}
                    </span>
                </template>
                <template #menu-item--format="{item}">
                    <div class="role-menu-item">
                        <img :src="useRoleFormatter(item.role_type).image"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                        <p-text-highlighting class="title"
                                             :term="dropdownState.searchText"
                                             :text="item.label"
                        />
                    </div>
                </template>
            </p-select-dropdown>
        </p-field-group>
        <div v-if="props.isDetailPage"
             class="buttons-wrapper"
        >
            <p-button style-type="tertiary"
                      size="md"
                      @click="state.proxyIsEdit = false"
            >
                {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      size="md"
            >
                {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.SAVE_CHANGES') }}
            </p-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-recipients-form {
    padding-right: 1rem;
    padding-left: 1rem;
    .field {
        max-width: 30rem;
        margin-top: 0.5rem;
        .select-options-dropdown {
            @apply block w-full;
            .role-menu-item {
                @apply flex items-center;
                gap: 0.25rem;
            }
            .role-type-icon {
                @apply rounded-full;
                width: 1rem;
                height: 1rem;
            }
            .selected-workspace-wrapper {
                @apply flex items-center;
                gap: 0.25rem;
            }
            .placeholder {
                @apply text-gray-600;
            }
        }
    }
    .buttons-wrapper {
        @apply inline-flex;
        padding-bottom: 1rem;
        margin-top: 1rem;
        gap: 0.5rem;
    }
}
</style>
