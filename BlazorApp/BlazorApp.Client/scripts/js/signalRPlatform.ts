/// <reference path="../../node_modules/@aspnet/signalr/dist/esm/browser-index.d.ts" />

//  signalrRPlatform contains globally scoped methods that wrap the javascript SignalR
//  client and expose it to Blazor.
//  The way things work is as follows:
//  We keep a bidirectional map between the instances created in JavaScript an in Blazor.
//  We assign a unique identifier to each javascript client that we keep on the blazor
//  side of things too.
//  When we create a new HubConnection on the Blazor side of things we invoke a method
//  in the JavaScript side of things to create a client and associate an Id to it.
//  For asynchronous methods, we use a TaskCompletionSource in the .NET side of things
//  that resolves when a callback is invoked.
//  When we perform an asynchronous operation in JavaScript, we chain a continuation that
//  invokes the .NET callback upon success.
//  
//  TODO: The current mechanism for invoking C# functions from JavaScript is cumbersome.
//  We should be able to create mechanism to invoke C# functions from JavaScript similar
//  to the one that exists to invoke JavaScript functions from C#.
//  TODO: We should be able to templatize calling async functions on each side by virtue
//  of using something like TCS.

// Blazor platform declarations
// We include the minimal blazor declarations here as we are not publishing a d.ts file for
// the JavaScript side of the platform.

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
}

declare let Blazor: IBlazor;

// End of Blazor platform declarations

// C# callback constants

const HubConnectionAssembly = "BlazorApp.Client";
const HubConnectionNamespace = "BlazorApp.Client.SignalR";
const HubConnectionClassName = "HubConnection";
const HubConnectionInvokeDotnetCallback = "InvokeDotnetCallback";
const HubConnectionInvokeDotnetCallbackT1 = "InvokeDotnetCallbackT1";

// End of C# callback constants

const hubInstancesMap = new Map<string, signalR.HubConnection>();

function registerClientMethod(id: string, callbackId: string, methodName: string): boolean {
    console.log(`registerClientT1Method - ${id}, ${callbackId}, ${methodName}`);
    let hub = hubInstancesMap.get(id);
    if (hub === undefined) {
        return false;
    }
    hub.on(methodName, () => {
        let method = Blazor.platform.findMethod(
            HubConnectionAssembly,
            HubConnectionNamespace,
            HubConnectionClassName,
            HubConnectionInvokeDotnetCallback);

        let parameters: any = [
            Blazor.platform.toDotNetString(id),
            Blazor.platform.toDotNetString(callbackId)];
        Blazor.platform.callMethod(method, undefined, parameters as System_Object[]);
    });

    return true;
}

function registerClientT1Method(id: string, callbackId: string, methodName: string): boolean {
    console.log(`registerClientT1Method - ${id}, ${callbackId}, ${methodName}`);

    let hub = hubInstancesMap.get(id);
    if (hub === undefined) {
        return false;
    }

    hub.on(methodName, (t1) => {
        let method = Blazor.platform.findMethod(
            HubConnectionAssembly,
            HubConnectionNamespace,
            HubConnectionClassName,
            HubConnectionInvokeDotnetCallbackT1);

        console.log(`invokeDotnetCallbackT1 - ${method}`);

        let parameters: any = [
            Blazor.platform.toDotNetString(id),
            Blazor.platform.toDotNetString(callbackId),
            Blazor.platform.toDotNetString(t1)];

        Blazor.platform.callMethod(method, undefined, parameters);
    });

    return true;
}

function createHubClient(id: string, path: string, options: signalR.IHubConnectionOptions): boolean {
    console.log(`createHubClient - ${id} - ${path}`);
    let hub = new signalR.HubConnection(path, options);
    if (!hubInstancesMap.has(id)) {
        hubInstancesMap.set(id, hub);
        return true;
    } else {
        return false;
    }
}

function releaseHubClient(id: string): boolean {
    return hubInstancesMap.delete(id);
}

function startHubClient(id: string, callbackId: string): boolean {
    console.log(`startHubClient - ${id} - completion callback ${callbackId}`);

    const hub = hubInstancesMap.get(id);
    if (hub === undefined) {
        return false;
    }

    hub.start()
        .then(() => {
            let method = Blazor.platform.findMethod(
                HubConnectionAssembly,
                HubConnectionNamespace,
                HubConnectionClassName,
                HubConnectionInvokeDotnetCallback);

            let parameters: any = [
                Blazor.platform.toDotNetString(id),
                Blazor.platform.toDotNetString(callbackId)];

            Blazor.platform.callMethod(method, undefined, parameters);
        });

    return true;
}

function sendHubClient(id: string, callbackId: string, method: string): boolean {
    const hub = hubInstancesMap.get(id);
    if (hub === undefined) {
        return false;
    }

    hub.send(method)
        .then(() => {
            let method = Blazor.platform.findMethod(
                HubConnectionAssembly,
                HubConnectionNamespace,
                HubConnectionClassName,
                HubConnectionInvokeDotnetCallback);

            let parameters: any = [
                Blazor.platform.toDotNetString(id),
                Blazor.platform.toDotNetString(callbackId)];

            Blazor.platform.callMethod(method, undefined, parameters);
        });

    return true;
}

function sendT1HubClient(id: string, callbackId: string, method: string, argument: string): boolean {
    const hub = hubInstancesMap.get(id);
    if (hub === undefined) {
        return false;
    }

    hub.send(method, argument)
        .then(() => {
            let method = Blazor.platform.findMethod(
                HubConnectionAssembly,
                HubConnectionNamespace,
                HubConnectionClassName,
                HubConnectionInvokeDotnetCallback);

            let parameters: any = [
                Blazor.platform.toDotNetString(id),
                Blazor.platform.toDotNetString(callbackId)];

            Blazor.platform.callMethod(method, undefined, parameters);
        });

    return true;
}

Blazor.registerFunction("createHubClient", createHubClient);
Blazor.registerFunction("releaseHubClient", releaseHubClient);
Blazor.registerFunction("startHubClient", startHubClient);
Blazor.registerFunction("sendHubClient", sendHubClient);
Blazor.registerFunction("sendT1HubClient", sendT1HubClient);
Blazor.registerFunction("registerClientMethod", registerClientMethod);
Blazor.registerFunction("registerClientT1Method", registerClientT1Method);