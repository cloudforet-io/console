<template>
    <div class="favorites-widget">
        <p class="title">
            <span>{{ $t('COMMON.WIDGETS.FAVORITES_WIDGET.TITLE') }}</span>
            <p-i class="icon" name="ic_bookmark" height="1rem"
                 width="1rem"
                 color="transparent inherit"
            />
        </p>
        <div class="list-wrapper">
            <div class="label-wrapper">
                <label v-for="(item, k) in items" :key="k">{{ item.label }}</label>
            </div>
            <div class="item-wrapper">
                <div v-for="(item, k) in items" :key="k" :style="{width}">
                    <div v-if="item.length === 0" class="no-data">
                        {{ $t('COMMON.WIDGETS.FAVORITES_WIDGET.NO_DATA') }}
                    </div>
                    <template v-else>
                        <router-link v-for="d in item.favorites" :key="d.id"
                                     :to="referenceRouter(
                                         d.id, {
                                             resource_type: d.resourceType,
                                         })"
                                     class="item"
                        >
                            {{ d.name }}
                        </router-link>
                    </template>
                </div>
            </div>
        </div>
        <summary v-if="showToggle" class="toggle-btn" @click="onClickToggle">
            {{ isExpanded ? $t('COMMON.WIDGETS.FAVORITES_WIDGET.TOGGLE_LESS') : $t('COMMON.WIDGETS.FAVORITES_WIDGET.TOGGLE_MORE') }}
            <p-i :name="isExpanded ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                 height="1rem" width="1rem" color="inherit transparent"
            />
        </summary>
    </div>
</template>

<script lang="ts">
import PI from '@/components/atoms/icons/PI.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { FavoriteItem } from '@/store/modules/favorite/type';
import { TranslateResult } from 'vue-i18n';
import { FavoritesWidgetProps } from '@/views/common/components/widgets/favorites/type';
import { referenceRouter } from '@/lib/reference/referenceRouter';

type Item = Record<string, {label: TranslateResult; favorites: FavoriteItem[]}>

const LIMIT_COUNT = 5;
export default {
    name: 'FavoritesWidget',
    components: { PI },
    props: {
        project: {
            type: Array,
            default: () => [],
        },
        cloudService: {
            type: Array,
            default: () => [],
        },
    },
    setup(props: FavoritesWidgetProps) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            items: computed<Item>(() => ({
                project: {
                    label: vm.$t('COMMON.WIDGETS.FAVORITES_WIDGET.LABEL_PROJECT'),
                    favorites: state.isExpanded ? props.project : props.project.slice(0, LIMIT_COUNT),
                },
                cloudService: {
                    label: vm.$t('COMMON.WIDGETS.FAVORITES_WIDGET.LABEL_CLOUD_SERVICE'),
                    favorites: state.isExpanded ? props.cloudService : props.cloudService.slice(0, LIMIT_COUNT),
                },
            })),
            width: computed(() => {
                const length = Object.keys(state.items).length;
                return `${length ? 100 / length : 100}%`;
            }),
            isExpanded: false,
            showToggle: computed(() => props.project.length > LIMIT_COUNT || props.cloudService.length > LIMIT_COUNT),
        });

        const onClickToggle = () => {
            state.isExpanded = !state.isExpanded;
        };

        return {
            ...toRefs(state),
            onClickToggle,
            LIMIT_COUNT,
            referenceRouter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.favorites-widget {
    @apply w-full overflow-hidden;
}
.title {
    @apply px-2 mb-2 flex items-center text-gray-800;
    font-size: 1rem;
    font-weight: bold;
    line-height: 1.2;
    .icon {
        @apply text-yellow-500;
        margin-left: 0.375rem;
    }
}
.list-wrapper {
    @apply flex flex-col w-full;
    .label-wrapper {
        @apply flex items-center mb-2;
    }
    .item-wrapper {
        @apply flex;
    }
    label {
        @apply px-2 text-gray-700;
        flex: 1;
        font-size: 0.75rem;
        line-height: 1.2;
        font-weight: bold;
    }
    .item {
        @apply block px-2 text-gray-700 truncate;
        font-size: 0.75rem;
        height: 1.5rem;
        line-height: 1.5rem;
        cursor: pointer;
        &:hover {
            @apply bg-secondary2;
            text-decoration: underline;
        }
    }
}
.toggle-btn {
    @apply ml-2 mt-3 text-blue-600;
    margin-top: 0.625rem;
    text-align: center;
    cursor: pointer;
    right: 1rem;
    bottom: 1rem;
    z-index: 1;
    font-size: 0.75rem;
}
</style>
