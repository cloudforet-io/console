<template>
    <div class="favorites-widget">
        <p class="title">
            {{ $t('COMMON.WIDGETS.FAVORITES_WIDGET.TITLE') }}
            <p-i class="icon" name="ic_bookmark" color="transparent inherit" />
        </p>
        <div class="list-wrapper">
            <div v-for="(item, k) in items" :key="k">
                <label>{{ item.label }}</label>
                <div v-if="item.favorites.length === 0" class="no-data">
                    {{ $t('COMMON.WIDGETS.FAVORITES_WIDGET.NO_DATA') }}
                </div>
                <template v-else>
                    <div v-for="d in item.favorites" :key="d.id" class="item">
                        {{ d.name }}
                    </div>
                </template>
            </div>
        </div>
        <summary v-if="showToggle" class="toggle-btn" @click="onClickToggle">
            {{ isExpanded ? $t('COMMON.WIDGETS.FAVORITES_WIDGET.TOGGLE_HIDE') : $t('COMMON.WIDGETS.FAVORITES_WIDGET.TOGGLE_MORE') }}
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
import { some } from 'lodash';

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
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            items: computed<Item>(() => ({
                project: {
                    label: vm.$t('COMMON.WIDGETS.FAVORITES_WIDGET.LABEL_PROJECT'),
                    favorites: props.project,
                },
                cloudService: {
                    label: vm.$t('COMMON.WIDGETS.FAVORITES_WIDGET.LABEL_CLOUD_SERVICE'),
                    favorites: props.cloudService,
                },
            })),
            isExpanded: false,
            showToggle: computed(() => some(state.items, d => d.favorites.length > LIMIT_COUNT)),
        });

        const onClickToggle = () => {
            state.isExpanded = !state.isExpanded;
        };

        return {
            ...toRefs(state),
            onClickToggle,
            LIMIT_COUNT,
        };
    },
};
</script>

<style lang="postcss" scoped>
.favorites-widget {
    @apply flex flex-col;
}
.title {
    @apply inline-flex items-center text-gray-800;
    font-size: 1rem;
    font-weight: bold;
    line-height: 1.2;
}
.icon {
    @apply text-yellow-500;
    margin-left: 0.375rem;
}
.list-wrapper {
    @apply flex;
    label {
        @apply mb-2 text-gray-700;
        font-size: 0.75rem;
        line-height: 1.2;
        font-weight: bold;
    }
    .item {
        @apply px-2 text-gray-700;
        font-size: 0.75rem;
        height: 1.5rem;
        line-height: 1.5rem;
    }
}
.toggle-btn {
    @apply mt-3 text-blue-600;
    margin-top: 0.625rem;
    cursor: pointer;
    right: 1rem;
    bottom: 1rem;
    z-index: 1;
    font-size: 0.75rem;
}
</style>
