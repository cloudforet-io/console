<script lang="ts">
import { get } from 'lodash';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import { DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { VNodeData } from 'vue';
import { EnumOptions } from '@/components/organisms/dynamic-field/type/field-schema';
import {EnumDynamicFieldProps} from "@/components/organisms/dynamic-field/templates/enum/type";

export default {
    name: 'PDynamicFieldEnum',
    functional: true,
    components: { PDynamicField },
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number, null],
            default: null,
        },
        typeOptions: {
            type: Object,
            default: () => ({}),
        },
        beforeCreate: {
            type: Function,
            default: undefined,
        },
        handler: {
            type: Function,
            default: undefined,
        },
    },
    render(h, { props, listeners }: {props: EnumDynamicFieldProps; listeners: any}) {
        // eslint-disable-next-line camelcase
        const enumOptions: EnumOptions = props.options;
        const option: Omit<DynamicFieldProps, 'data'|'typeOptions'|'options'> = get(
            enumOptions, props.data,
            { type: 'text' },
        );
        return h(PDynamicField, {
            props: {
                ...option, data: props.data, typeOptions: props.typeOptions, beforeCreate: props.beforeCreate, handler: props.handler,
            },
            on: listeners,
        } as VNodeData);
    },
};
</script>
