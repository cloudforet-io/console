import { reactive, computed, Ref } from '@vue/composition-api';
import { assign } from 'lodash';

interface ClassTypeOf<T> {
    new(...args: any[]): T;
}

export type optionalType<T1, T2> = T1 | T1 & T2
export interface StateType<T1, T2> {
    state: optionalType<T1, T2>;
}
export interface SyncStateType<T1, T2> {
    syncState: optionalType<T1, T2>;
}

type StateToolSetStatic<T> = ClassTypeOf<StateType<T, any>>
& { initState: () => T };
/**
 * @description Use it as decorator for state class.
 */
export function StateToolSet<stateType>() {
    return function func<T extends StateToolSetStatic<stateType>>(cls: T): T {
        return cls;
    };
}

type SyncStateToolSetStatic<T> = ClassTypeOf<SyncStateType<T, any>>
& { initSyncState: () => T };
/**
 * @description Use it as decorator for sync state class.
 */
export function SyncStateToolSet<syncStateType>() {
    return function func<T extends SyncStateToolSetStatic<syncStateType>>(cls: T): T {
        return cls;
    };
}


type HelperToolSetStatic = ClassTypeOf<any>
& { initToolSet: (_this: any, ...args: any[]) => void };
/**
 * @description Use it as decorator for toolset class.
 */
export function HelperToolSet() {
    return function func<T extends HelperToolSetStatic>(cls: T): T {
        return cls;
    };
}

/**
 * @description Use it for initiate state reactive data by merging arguments
 * @function initReactive
 * @param lazy whether init(lazy === false) or not
 */
export function initReactive<T>(lazy: boolean, ...args: any[]): T {
    if (lazy) {
        return null as unknown as T;
    }
    return reactive(assign({}, ...args));
}
// EXAMPLE
// @StateToolSet<string>() // fail
// class Foo { }
//
// interface tempStateType {
//     a:string
//     b:number
//
// }
// @StateToolSet<tempStateType>() // ok
// class Boo<initData> {
//     public state:optionalType<tempStateType, initData>
//
//     static initState() {
//         return {
//             a: 'a',
//             b: 1,
//         };
//     }
//
//     constructor(initData:initData) {
//         this.state = reactive({
//             ...Boo.initState(),
//             ...initData,
//         });
//     }
// }
