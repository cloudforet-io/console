export const definitionProps = {
    name: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        default: '',
    },
    data: {
        type: [String, Object, Array, Boolean, Number],
        default: undefined,
    },
    options: {
        type: Object,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        default: (): any => ({}),
    },
    type: {
        type: String,
        default: 'text',
    },
};

export interface DefinitionProps {
    name: string;
    label?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: any;
    type?: string;
}
