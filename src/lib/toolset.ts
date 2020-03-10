import { reactive } from '@vue/composition-api';
import _ from 'lodash';
import { supportsProjectReferences } from 'ts-loader/dist/utils';

export type optionalType<T1, T2> = T1|T1&T2
export interface StateType<T1, T2> {
    state:optionalType<T1, T2>
}
export interface SyncStateType<T1, T2> {
    syncState:optionalType<T1, T2>
}

interface ClassTypeOf<T> {
    new (...args: any[]): T
}

type StateToolSetStatic<T>=ClassTypeOf<StateType<T, any>>& { initState:()=>T };
export function StateToolSet<stateType>() {
    return function func<T extends StateToolSetStatic<stateType>>(cls: T): T {
        return cls;
    };
}

type SyncStateToolSetStatic<T>= ClassTypeOf<SyncStateType<T, any>>& { initSyncState:()=>T };
export function SyncStateToolSet<syncStateType>() {
    return function func<T extends SyncStateToolSetStatic<syncStateType>>(cls: T): T {
        return cls;
    };
}


type HelperToolSetStatic=ClassTypeOf<any>&{ initToolSet:(_this:any, ...args:any[])=>void };
export function HelperToolSet() {
    return function func<T extends HelperToolSetStatic>(cls: T): T {
        return cls;
    };
}

export function initReactive<T>(lazy:boolean, ...args:any[]):T {
    if (lazy) {
        return null as unknown as T;
    }
    return reactive(_.assign({}, ...args));
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
