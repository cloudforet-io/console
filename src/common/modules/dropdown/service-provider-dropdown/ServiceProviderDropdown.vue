<template>
    <p-select-dropdown class="service-provider-dropdown"
                       :selected="proxySelected"
                       :items="contextMenuItems"
                       @select="handleSelect"
    >
        <span v-if="providerList[proxySelected]" class="text">
            <p-lazy-img width="1rem" height="1rem"
                        :src="providerList[proxySelected].icon"
                        class="mr-1"
            /><span>{{ providerList[proxySelected].label }}</span>
        </span>
        <template #menu-item--format="{ item }">
            <div class="content-menu-item">
                <p-lazy-img width="1rem" height="1rem"
                            :src="item.icon"
                            class="mr-1"
                /><span>{{ item.label }}</span>
            </div>
        </template>
    </p-select-dropdown>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { PSelectDropdown, PLazyImg } from '@spaceone/design-system';
import { store } from '@/store';
import { useProxyValue } from '@/common/composables/proxy-state';

export default {
    name: 'ServiceProviderDropdown',
    components: {
        PSelectDropdown,
        PLazyImg,
    },
    model: {
        prop: 'selected',
        event: 'update:selected',
    },
    props: {
        selected: {
            type: String,
            default: 'aws',
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxySelected: useProxyValue('selected', props, emit),
            providerList: computed(() => store.state.reference.provider.items),
            contextMenuItems: computed(() => [
                { type: 'header', name: 'serviceProvider', label: 'Service Provider' },
                ...Object.keys(state.providerList).map(k => ({
                    label: state.providerList[k].name,
                    name: k,
                    icon: state.providerList[k]?.icon,
                })),
            ]),
        });
        const handleSelect = (provider) => {
            state.proxySelected = provider;
        };
        return {
            ...toRefs(state),
            handleSelect,
        };
    },
};
</script>

<style lang="postcss" scoped>
.service-provider-dropdown::v-deep {
    .dropdown-button {
        @apply rounded-2xl border-gray-200 bg-gray-100;
        width: unset;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        .text {
            @apply flex items-center;
        }
    }
    &:not(.invalid):not(.disabled):not(.read-only).active.default {
        .dropdown-button {
            @apply bg-gray-100 border-gray-200;
        }
    }
    &:not(.invalid):not(.disabled):not(.active):not(.read-only).default {
        .dropdown-button:not(.active):not(.disabled):hover {
            @apply bg-gray-100 border-gray-200;
        }
    }
    .p-context-menu {
        margin-top: 0.125rem;
        .context-header {
            margin-top: 0.5625rem;
        }
        &.left {
            left: 0.5rem;
        }
    }
}
.content-menu-item {
    @apply flex items-center flex-wrap gap-1;
    width: 8.25rem;
}
</style>
