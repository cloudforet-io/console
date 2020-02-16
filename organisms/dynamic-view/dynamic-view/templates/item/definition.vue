<template>
    <div class="content-container">
        <span class="content">
            <p-dt class="label">{{ name }}</p-dt>
            <span class="data" @mouseleave="onMouseOut">
                <p-dd @mouseenter="onMouseOver">
                    <p-dynamic-field ref="field" :view_type="view_type" :view_option="view_option"
                                     :data="data"
                    />
                </p-dd>
                <p-copy-button v-if="isMouseOver" class="copy-btn" :value="value" />
            </span>
        </span>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    computed, createComponent, Ref, ref,
} from '@vue/composition-api';

import { mouseOverState } from '@/lib/compostion-util';
import PDt from '@/components/atoms/lists/dl-list/Dt.vue';
import PDd from '@/components/atoms/lists/dl-list/Dd.vue';
import PCopyButton from '@/components/molecules/buttons/CopyButton.vue';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';

export default createComponent({
    name: 'Definition',
    components: {
        PDt, PDd, PCopyButton, PDynamicField,
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        view_option: {
            type: Object,
            default: () => {},
        },
        view_type: {
            type: String,
            default: 'text',
        },
    },
    setup(props) {
        const field = ref(null);
        // @ts-ignore
        const value = computed(() => field.value.$el.innerText);
        return {
            field,
            value,
            ...mouseOverState(),
        };
    },
});
</script>

<style scoped lang="scss">
.content-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    flex-basis: 50%;
    max-width: 50%;
    .content {
        display: flex;
        align-items: center;
        padding-bottom: 1rem;
        .label {
            float: left;
            overflow: hidden;
            clear: left;
            text-align: left;
            word-break: break-word;
            padding: 0 1rem;
            text-align: left;
            font-weight: bold;
            color: $gray1;
            min-width: 10rem;

        }
        .label-common {
            width: 25%;
        }
        .label-full {
            width: 12.5%;
        }

        .data {
            flex: 1;
            display: flex;
            align-items: center;
            text-align: left;
            color: #222532;
            opacity: 1;
            dd {
                margin: 0;
            }
        }
        .copy-btn::v-deep {
            flex: 1;
            height: 1rem;
            .p-copy-btn {
                top: -.3rem;
            }
        }
    }
}

</style>
