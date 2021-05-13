<template>
    <section class="right-contents-container">
        <p-breadcrumbs :routes="routeState.routes" />
        <p-page-title :title="$t('IDENTITY.USER.MAIN.API_KEY')" />
        <p-pane-layout class="main-table-wrapper">
            <article class="table-header">
                <div class="left-section">
                    <p-icon-text-button style-type="primary-dark"
                                        name="ic_plus_bold"
                    >
                        {{ $t('IDENTITY.USER.MAIN.CREATE_API_KEY') }}
                    </p-icon-text-button>
                    <p-dropdown-menu-btn
                        class="dropdown-btn"
                        :menu="dropdownMenu"
                    >
                        {{ $t('IDENTITY.USER.MAIN.ACTION') }}
                    </p-dropdown-menu-btn>
                </div>
                <div class="table-desc">
                    {{ $t('IDENTITY.USER.MAIN.API_TABLE_DESC') }}
                </div>
            </article>
            <p-data-table
                :items="items"
                :loading="loading"
                :fields="fields"
                :striped="false"
            />
        </p-pane-layout>
        <p-pane-layout class="sub-table-wrapper">
            <div class="sub-table-header">
                {{ $t('IDENTITY.USER.MAIN.ENDPOINTS') }}
            </div>
            <p-data-table
                :items="subState.items"
                :loading="subState.loading"
                :fields="subState.fields"
                :striped="false"
            />
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import {
    PEmpty, PBreadcrumbs, PIconTextButton,
    PDropdownMenuBtn, PDataTable, PPageTitle, PPaneLayout,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

export default {
    name: 'UserAPIKey',
    components: {
        PEmpty,
        PPaneLayout,
        PBreadcrumbs,
        PIconTextButton,
        PDropdownMenuBtn,
        PDataTable,
        PPageTitle,
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            fields: [
                { name: 'api_key_id', label: 'API Key ID' },
                { name: 'state', label: 'State' },
                { name: 'created_at', label: 'Created' },
            ],
            items: [] as any,
            dropdownMenu: computed(() => ([
                {
                    type: 'item', name: 'enable', label: vm.$t('IDENTITY.USER.MAIN.ENABLE'), disabled: !state.isSelected,
                },
            ] as MenuItem[])),
        });
        const subState = reactive({
            loading: false,
            fields: [
                { name: 'service', label: 'Service' },
                { name: 'version', label: 'Version' },
                { name: 'endpoint', label: 'Endpoint' },
                { name: 'status', label: 'Status' },
            ],
            items: [] as any,
        });
        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.API_KEY') },
            ])),
        });

        return {
            ...toRefs(state),
            subState,
            routeState,
        };
    },

};
</script>

<style lang="postcss" scoped>
.main-table-wrapper {
    width: 100%;
    height: 100%;
    margin-bottom: 1rem;
}

.table-header {
    display: flex;
    justify-content: space-between;
    padding-left: 1rem;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
    .left-section {
        display: inherit;
    }
    .dropdown-btn {
        margin-left: 1rem;
    }
    .table-desc {
        @apply text-gray-500;
        padding-right: 1rem;
        font-size: 0.875rem;
        line-height: 150%;
    }
}

.sub-table-header {
    padding-left: 1rem;
    padding-top: 2rem;
    margin-bottom: 1rem;
    font-size: 1.375rem;
    line-height: 145%;
}
</style>
