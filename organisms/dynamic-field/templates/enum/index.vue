<script lang="ts">
import { get } from 'lodash';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import { VNodeData } from 'vue';
import { EnumItem, EnumOptions } from '@/components/organisms/dynamic-field/type/field-schema';
import { EnumDynamicFieldProps } from '@/components/organisms/dynamic-field/templates/enum/type';

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
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        typeOptions: {
            type: Object,
            default: () => ({}),
        },
        extraData: {
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
        let option: EnumItem;

        const path = props.data === undefined ? props.options.default : props.data;
        const item = get(
            props.options.items || props.options,
            path,
            undefined,
        );

        if (item === undefined) {
            option = { type: 'text', name: path };
        } else if (typeof item === 'string') {
            option = { type: 'text', name: item };
        } else {
            option = item;
            if (option.name === undefined) option.name = path;
        }

        return h(PDynamicField, {
            props: {
                type: option.type,
                options: option.options,
                data: option.name,
                typeOptions: props.typeOptions,
                beforeCreate: props.beforeCreate,
                handler: props.handler,
                extraData: props.extraData,
            },
            on: listeners,
        } as VNodeData);
    },
};
</script>
