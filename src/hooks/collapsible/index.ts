import {
    ComponentRenderProxy, getCurrentInstance, reactive, SetupContext,
} from '@vue/composition-api';
import { makeOptionalProxy } from '@/util/composition-helpers';

export interface CollapsibleProps {
    isCollapsed?: boolean;
}
const getCollapsibleState = (props: CollapsibleProps) => {
    const vm = getCurrentInstance() as ComponentRenderProxy;
    const state = reactive({
        proxyIsCollapsed: makeOptionalProxy('isCollapsed', vm, props.isCollapsed),
    });
    return state;
};

export const useCollapsible = (props: CollapsibleProps, context: SetupContext) => {
    const state = getCollapsibleState(props);
    const onClickToggle = () => {
        state.proxyIsCollapsed = !state.proxyIsCollapsed;
    };
    return {
        state,
        onClickToggle,
    };
};
