import { Context } from './Context';

export abstract class BaseProvider {
    protected readonly context: Context;

    constructor(context: Context) {
        this.context = context;
    }
}