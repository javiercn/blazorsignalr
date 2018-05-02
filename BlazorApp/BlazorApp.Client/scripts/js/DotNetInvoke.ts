interface MethodHandle { MethodHandle__DO_NOT_IMPLEMENT: any };
interface System_Object { System_Object__DO_NOT_IMPLEMENT: any };
interface System_String extends System_Object { System_String__DO_NOT_IMPLEMENT: any }
interface System_Array<T> extends System_Object { System_Array__DO_NOT_IMPLEMENT: any }
interface Pointer { Pointer__DO_NOT_IMPLEMENT: any }

interface IBlazor {
    platform: IPlatform;
    registerFunction(identifier: string, implementation: Function): any;
}

interface IPlatform {
    findMethod(assemblyName: string, namespace: string, className: string, methodName: string): MethodHandle;
    callMethod(method: MethodHandle, target: System_Object | undefined, args: System_Object[]): System_Object;
    toDotNetString(javaScriptString: string): System_String;
    toJavaScriptString(dotNetString: System_String): string;
}

namespace DotnetInvoke {

    export interface MethodOptions {
        Type: TypeInstance;
        Method: MethodInstance;
        Async?: { ResolveId: string, RejectId: string, FunctionName: string }
    }

    export interface MethodInstance {
        Name: string;
        TypeArguments: { [key: string]: TypeInstance }
        ParameterTypes: TypeInstance[];
    }

    export interface TypeInstance {
        Assembly: string;
        TypeName: string;
        TypeArguments: { [key: string]: TypeInstance };
    }

    export function invokeDotNetMethod<T>(methodOptions: MethodOptions, ...args: any[]): (T | null) {
        const method = Blazor.platform.findMethod(
            "BlazorApp.Client",
            "BlazorApp.Client.Infrastructure",
            "JavaScriptInvoke",
            "InvokeDotnetMethod");

        const serializedOptions = Blazor.platform.toDotNetString(JSON.stringify(methodOptions));
        const serializedArgs = Blazor.platform.toDotNetString(JSON.stringify(args));

        const serializedResult = Blazor.platform.callMethod(method, undefined, [serializedOptions, serializedArgs]);

        if (serializedResult !== null && serializedResult !== undefined && (serializedResult as any) !== 0) {
            const result = JSON.parse(Blazor.platform.toJavaScriptString(serializedResult as System_String));
            return result;
        }

        return null;
    }

    export function invokeDotNetMethodAsync<T>(methodOptions: MethodOptions, ...args: any[]): PromiseLike<T | null> {
        const resolveId = "1";
        const rejectId = "2";
        methodOptions.Async = { ResolveId: resolveId, RejectId: rejectId, FunctionName: "Microsoft.AspNetCore.Blazor.InvokeJavaScriptCallback" };

        const result = new Promise<T | null>((resolve, reject) => {
            TrackedReference.track(resolveId, resolve);
            TrackedReference.track(rejectId, reject);
        });

        invokeDotNetMethod(methodOptions, args);

        return result;
    }

    export function invokeJavaScriptCallback(id: string, ...args: any[]): void {
        const callbackRef = TrackedReference.get(id);
        const callback = callbackRef.trackedObject as Function;
        callback.apply(null, args);
    }

    Blazor.registerFunction("Microsoft.AspNetCore.Blazor.InvokeJavaScriptCallback", invokeJavaScriptCallback);

    type RefType = Exclude<any, undefined | null>;

    class TrackedReference {
        private static references: Map<string, RefType> = new Map<string, RefType>();

        private constructor(public id: string, public trackedObject: RefType) {
        }

        public static track(id: string, trackedObject: RefType): void {
            const ref = new TrackedReference(id, trackedObject);
            const refs = TrackedReference.references;
            if (refs.has(id)) {
                throw new Error(`An element with id '${id}' is already being tracked.`);
            }

            refs.set(id, ref);
        }

        public static untrack(id: string): void {
            const refs = TrackedReference.references;
            if (!refs.has(id)) {
                throw new Error(`An element with id '${id}' is not being being tracked.`);
            }

            refs.delete(id);
        }

        public static get(id: string): TrackedReference {
            const refs = TrackedReference.references;
            if (!refs.has(id)) {
                throw new Error(`An element with id '${id}' is not being being tracked.`);
            }

            return refs.get(id);
        }
    }
}
