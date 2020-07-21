<script lang="ts">
import { get } from 'lodash';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import { DynamicFieldProps, EnumOptions } from '@/components/organisms/dynamic-field/type';

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
        extra: {
            type: Object,
            default: () => ({}),
        },
    },
    render(h, { props }) {
        // eslint-disable-next-line camelcase
        const enumOptions: EnumOptions = props.options;
        const option: Omit<DynamicFieldProps, 'data'|'extra'> = get(
            enumOptions, props.data,
            { type: 'text' },
        );
        return h(PDynamicField, { props: { ...option, data: props.data, extra: props.extra } });
    },
};
</script>
