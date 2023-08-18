/* eslint-disable no-mixed-spaces-and-tabs */
import type { RouteLocationRaw } from 'vue-router';

import { CONSOLE_ERROR_CODE } from '@/common/composables/error/type';

export class ConsoleError extends Error {
    redirectUrl?: RouteLocationRaw;

    constructor() {
	    super();
	    this.name = CONSOLE_ERROR_CODE.DEFAULT_ERROR;
    }
}

export class NoSearchResourceError extends Error {
    redirectUrl: RouteLocationRaw;

    constructor(redirectUrl: RouteLocationRaw) {
    	super();
    	this.name = CONSOLE_ERROR_CODE.NO_SEARCH_RESOURCE_ERROR;
    	this.redirectUrl = redirectUrl;
    }
}

export class NoResourceError extends Error {
    redirectUrl: RouteLocationRaw;

    constructor(redirectUrl: RouteLocationRaw) {
    	super();
	    this.name = CONSOLE_ERROR_CODE.NO_RESOURCE_ERROR;
	    this.redirectUrl = redirectUrl;
    }
}

export const isInstanceOfNoSearchResourceError = (e: unknown): e is NoSearchResourceError => e instanceof NoSearchResourceError;
export const isInstanceOfNoResourceError = (e: unknown): e is NoResourceError => e instanceof NoResourceError;
