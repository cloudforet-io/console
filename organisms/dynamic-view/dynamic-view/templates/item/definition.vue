<template>
    <tr class="def">
        <td class="key">
            {{ name }}
        </td>
        <td class="value" :class="{hover:isMouseOver}">
            <p-dynamic-field ref="field" :view_type="view_type" :view_option="view_option"
                             :data="data"
            />
            <PCopyButton v-if="typeof data !== 'undefined'&& data !== ''" class="ml-2" @copy="copy"
                         @mouseover="onMouseOver()" @mouseout="onMouseOut()"
            />
        </td>
    </tr>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    computed, defineComponent, ref,
} from '@vue/composition-api';

import { mouseOverState } from '@/lib/compostion-util';
import PDt from '@/components/atoms/lists/dl-list/Dt.vue';
import PDd from '@/components/atoms/lists/dl-list/Dd.vue';
import PCopyButton from '@/components/molecules/buttons/CopyButton.vue';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';
import { copyAnyData } from '@/lib/util';

export default defineComponent({
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
            default: () => ({}),
        },
        view_type: {
            type: String,
            default: 'text',
        },
    },
    setup(props) {
        const field = ref<any>(null);
        const copy = () => {
            copyAnyData(field.value?.$el.innerText);
        };
        return {
            field,
            copy,
            ...mouseOverState(),
        };
    },
});
</script>

<style scoped lang="postcss">
.def{
    .key{
        @apply py-2 px-4 text-sm font-bold max-w-xs;
        line-height: 1.0625rem;
        width: 18rem;

    }
    .value{
        @apply py-2 px-4;
        &.hover{
            @apply text-blue-500;
        }

    }
}
/*.content-container {*/
/*    display: flex;*/
/*    flex-wrap: wrap;*/
/*    align-items: center;*/
/*    width: 100%;*/
/*    flex-basis: 50%;*/
/*    max-width: 50%;*/
/*    .content {*/
/*        display: flex;*/
/*        align-items: center;*/
/*        padding-bottom: 1rem;*/
/*        .label {*/
/*            @apply text-gray-400;*/
/*            float: left;*/
/*            overflow: hidden;*/
/*            clear: left;*/
/*            text-align: left;*/
/*            word-break: break-word;*/
/*            padding: 0 1rem;*/
/*            text-align: left;*/
/*            font-weight: bold;*/
/*            min-width: 10rem;*/

/*        }*/
/*        .label-common {*/
/*            width: 25%;*/
/*        }*/
/*        .label-full {*/
/*            width: 12.5%;*/
/*        }*/

/*        .data {*/
/*            flex: 1;*/
/*            display: flex;*/
/*            align-items: center;*/
/*            text-align: left;*/
/*            color: #222532;*/
/*            opacity: 1;*/
/*            dd {*/
/*                margin: 0;*/
/*            }*/
/*        }*/
/*        .copy-btn::v-deep {*/
/*            flex: 1;*/
/*            height: 1rem;*/
/*            .p-copy-btn {*/
/*                top: -.3rem;*/
/*            }*/
/*        }*/
/*    }*/
/*}*/

</style>
