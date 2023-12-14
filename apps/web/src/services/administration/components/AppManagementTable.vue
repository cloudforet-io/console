<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PToolboxTable, PSelectDropdown, PStatus, PCopyButton,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/src/data-display/tables/definition-table/type';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import { isEmpty } from 'lodash';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { iso8601Formatter } from '@cloudforet/utils';

import { APP_STATUS_TYPE } from '@/schema/identity/app/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { replaceUrlQuery } from '@/lib/router-query-string';

import {
    appStateFormatter,
    calculateTime,
} from '@/services/administration/composables/refined-table-data';
import {
    ROLE_SEARCH_HANDLERS,
} from '@/services/administration/constants/role-constant';
import { useAppPageStore } from '@/services/administration/store/app-page-store';


const DEFAULT_PAGE_LIMIT = 15;
const APP_DROPDOWN_MENU_ITEM = {
    EDIT: 'edit',
    DELETE: 'delete',
    REGENERATE: 'regenerate',
    ENABLE: 'enable',
    DISABLE: 'disable',
} as const;

interface Props {
    tableHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const appContextStore = useAppContextStore();
const appPageStore = useAppPageStore();
const appPageState = appPageStore.$state;

const route = useRoute();

const appListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(DEFAULT_PAGE_LIMIT)
    .setSort('name', true)
    .setFiltersAsRawQueryString(route.query.filters);
let appListApiQuery = appListApiQueryHelper.data;

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
});
const state = reactive({
    refinedUserItems: computed(() => appPageState.apps.map((app) => ({
        ...app,
        last_accessed_at: calculateTime(app?.last_accessed_at, storeState.timezone),
    }))),
    fields: computed<DefinitionField[]>(() => {
        let additionalFields: DefinitionField = {
            name: 'role_type',
            label: 'Workspace Owner Role',
        };
        if (storeState.isAdminMode) {
            additionalFields = {
                name: 'role_type',
                label: 'Admin Role',
            };
        }
        return [
            { name: 'name', label: 'App Name' },
            { name: 'state', label: 'State' },
            {
                name: 'app_id', label: 'App ID', sortable: false, disableCopy: false,
            },
            additionalFields,
            // { name: 'tags', label: 'Tags', sortable: false },
            { name: 'last_accessed_at', label: 'Last Activity' },
            { name: 'expired_at', label: 'Expiration Date' },
            { name: 'created_at', label: 'Created' },
        ];
    }),
    tags: appListApiQueryHelper.setKeyItemSets(ROLE_SEARCH_HANDLERS.keyItemSets).queryTags,
});
const dropdownMenu = computed<MenuItem[]>(() => ([
    {
        type: 'item', name: APP_DROPDOWN_MENU_ITEM.EDIT, label: i18n.t('IAM.APP.EDIT'), disabled: !isEmpty(appPageState.selectedApp),
    },
    {
        type: 'item', name: APP_DROPDOWN_MENU_ITEM.DELETE, label: i18n.t('IAM.APP.DELETE'), disabled: !isEmpty(appPageState.selectedApp),
    },
    { type: 'divider' },
    {
        type: 'item', name: APP_DROPDOWN_MENU_ITEM.REGENERATE, label: i18n.t('IAM.APP.REGENERATE'), disabled: !isEmpty(appPageState.selectedApp),
    },
    { type: 'divider' },
    {
        type: 'item',
        name: APP_DROPDOWN_MENU_ITEM.ENABLE,
        label: i18n.t('IAM.APP.ENABLE'),
        disabled: !isEmpty(appPageState.selectedApp) && appPageState.selectedApp?.state === APP_STATUS_TYPE.EXPIRED,
    },
    {
        type: 'item',
        name: APP_DROPDOWN_MENU_ITEM.DISABLE,
        label: i18n.t('IAM.APP.DISABLE'),
        disabled: !isEmpty(appPageState.selectedApp) && appPageState.selectedApp?.state === APP_STATUS_TYPE.EXPIRED,
    },
]));

/* Component */
const handleSelectDropdown = (name) => {
    switch (name) {
    case APP_DROPDOWN_MENU_ITEM.EDIT:
        appPageStore.$patch((_state) => {
            _state.modal.type = name;
            _state.modal.visible.update = true;
        });
        break;
    case APP_DROPDOWN_MENU_ITEM.DELETE:
        appPageStore.$patch((_state) => {
            _state.modal.type = name;
            _state.modal.visible.delete = true;
        });
        break;
    case APP_DROPDOWN_MENU_ITEM.REGENERATE:
        appPageStore.$patch((_state) => {
            _state.modal.type = name;
            _state.modal.visible.regenerate = true;
        });
        break;
    case APP_DROPDOWN_MENU_ITEM.ENABLE:
        appPageStore.$patch((_state) => {
            _state.modal.type = name;
            _state.modal.visible.enable = true;
        });
        break;
    case APP_DROPDOWN_MENU_ITEM.DISABLE:
        appPageStore.$patch((_state) => {
            _state.modal.type = name;
            _state.modal.visible.disable = true;
        });
        break;
    default: break;
    }
};
const handleSelect = (index: number) => {
    appPageStore.$patch({ selectedApp: appPageState.apps[index] });
};
const handleChange = async (options: ToolboxOptions = {}) => {
    appListApiQuery = getApiQueryWithToolboxOptions(appListApiQueryHelper, options) ?? appListApiQuery;
    if (options.queryTags !== undefined) {
        await replaceUrlQuery('filters', appListApiQueryHelper.rawQueryStrings);
    }
    await getListApps();
};

/* API */
const getListApps = async () => {
    console.log('init!');
    await appPageStore.listApps({ query: appListApiQuery });
};

/* Init */
(async () => {
    console.log('?');
    await getListApps();
})();
</script>

<template>
    <section class="app-management-table">
        <p-toolbox-table search-type="query"
                         selectable
                         sortable
                         :loading="false"
                         disabled
                         :multi-select="false"
                         :items="appPageState.apps"
                         :fields="state.fields"
                         sort-by="name"
                         :sort-desc="true"
                         :total-count="appPageState.totalCount"
                         :query-tags="state.tags"
                         :style="{height: `${props.tableHeight}px`}"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleChange()"
        >
            <template #toolbox-left>
                <p-select-dropdown class="left-toolbox-item-select-dropdown"
                                   :menu="dropdownMenu"
                                   :placeholder="$t('IAM.APP.ACTION')"
                                   @select="handleSelectDropdown"
                />
            </template>
            <template #col-state-format="{value}">
                <p-status v-bind="appStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-app_id-format="{value}">
                <span class="col-app-id">
                    {{ value }}
                    <p-copy-button :value="value" />
                </span>
            </template>
            <!-- TODO: will be updated after api is ready -->
            <!--            <template #col-tags-format="{value}">-->
            <!--                <template v-if="!!Object.keys(value).length">-->
            <!--                    <p-badge v-for="([key, val], idx) in Object.entries(value)"-->
            <!--                             :key="`${key}-${val}-${idx}`"-->
            <!--                             badge-type="subtle"-->
            <!--                             shape="square"-->
            <!--                             style-type="gray200"-->
            <!--                             class="mr-2"-->
            <!--                    >-->
            <!--                        {{ key }}: {{ val }}-->
            <!--                    </p-badge>-->
            <!--                </template>-->
            <!--                <template v-else>-->
            <!--                    <span />-->
            <!--                </template>-->
            <!--            </template>-->
            <template #col-expired_at-format="{value}">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.app-management-table {
    .left-toolbox-item-select-dropdown {
        min-width: 6.5rem;
    }
    .col-app-id {
        @apply flex items-center;
        gap: 0.25rem;
    }
    .role-type {
        @apply flex items-center;
        gap: 0.5rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
    }
}
</style>
