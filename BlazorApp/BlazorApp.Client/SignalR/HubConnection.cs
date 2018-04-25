using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Blazor.Browser.Interop;

namespace BlazorApp.Client.SignalR
{
    public class HubConnection : IDisposable
    {
        private const string CreateHubClientProxyMethod = "createHubClient";
        private const string ReleaseHubClientProxyMethod = "releaseHubClient";
        private const string StartHubClientProxyMethod = "startHubClient";
        private const string SendHubClientProxyMethod = "sendHubClient";
        private const string SendT1HubClientProxyMethod = "sendT1HubClient";
        private const string RegisterClientVoidProxyMethod = "registerClientMethod";
        private const string RegisterClientT1ProxyMethod = "registerClientT1Method";

        private static readonly IDictionary<string, HubConnection> Instances =
            new Dictionary<string, HubConnection>();

        private readonly IDictionary<string, object> Callbacks = new Dictionary<string, object>();

        private readonly string _id;

        public HubConnection(string path, HubConnectionOptions options)
        {
            _id = Guid.NewGuid().ToString();
            var success = RegisteredFunction.Invoke<bool>(CreateHubClientProxyMethod, _id, path, options);
            if (!success)
            {
                throw new InvalidOperationException("Unable to create client proxy");
            }

            Instances[_id] = this;
        }

        public Task Send(string method, string argument)
        {
            TaskCompletionSource<bool> tcs = new TaskCompletionSource<bool>();

            var callbackId = Guid.NewGuid().ToString();
            Callbacks[callbackId] = new Action(() => tcs.SetResult(true));
            var success = RegisteredFunction.Invoke<bool>(SendT1HubClientProxyMethod, _id, callbackId, method, argument);

            if (!success)
            {
                Callbacks[callbackId] = null;
                throw new InvalidOperationException("Unable to register callback on the proxy");
            }

            return Task.WhenAny(tcs.Task, Task.Delay(5000).ContinueWith((t) =>
            {
                if (!tcs.Task.IsCompleted)
                {
                    return Task.FromException(new InvalidOperationException("Send timed out"));
                }
                else
                {
                    return tcs.Task;
                }
            }));
        }

        public Task Start()
        {
            TaskCompletionSource<bool> tcs = new TaskCompletionSource<bool>();

            var callbackId = Guid.NewGuid().ToString();
            Callbacks[callbackId] = new Action(() => tcs.SetResult(true));
            var success = RegisteredFunction.Invoke<bool>(StartHubClientProxyMethod, _id, callbackId);

            if (!success)
            {
                Callbacks[callbackId] = null;
                throw new InvalidOperationException("Unable to register callback on the proxy");
            }

            return Task.WhenAny(tcs.Task, Task.Delay(5000).ContinueWith((t) =>
            {
                if (!tcs.Task.IsCompleted)
                {
                    return Task.FromException(new InvalidOperationException("Send timed out"));
                }
                else
                {
                    return tcs.Task;
                }
            }));
        }

        public void On(string method, Action newMethod)
        {
            var callbackId = Guid.NewGuid().ToString();
            Callbacks[callbackId] = newMethod;
            var success = RegisteredFunction.Invoke<bool>(RegisterClientVoidProxyMethod, _id, callbackId, method);
            if (!success)
            {
                Callbacks[callbackId] = null;
                throw new InvalidOperationException("Unable to register callback on the proxy");
            }
        }

        public void On<T1>(string method, Action<T1> newMethod)
        {
            var callbackId = Guid.NewGuid().ToString();
            Callbacks[callbackId] = newMethod;
            var success = RegisteredFunction.Invoke<bool>(RegisterClientT1ProxyMethod, _id, callbackId, method);
            if (!success)
            {
                Callbacks[callbackId] = null;
                throw new InvalidOperationException("Unable to register callback on the proxy");
            }
        }

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                }

                RegisteredFunction.Invoke<bool>(ReleaseHubClientProxyMethod, _id);

                disposedValue = true;
            }
        }

        public static void InvokeDotnetCallback(string id, string callbackId)
        {
            if (!Instances.TryGetValue(id, out var hubInstance))
            {
                throw new InvalidOperationException("Can't find the hub instance with ID " + id);
            }

            hubInstance.InvokeCallback(callbackId);
        }

        public static void InvokeDotnetCallbackT1(string id, string callbackId, string arg1)
        {
            if (!Instances.TryGetValue(id, out var hubInstance))
            {
                throw new InvalidOperationException("Can't find the hub instance with ID " + id);
            }

            hubInstance.InvokeCallback(callbackId, arg1);
        }

        private void InvokeCallback(string callbackId)
        {
            if (!Callbacks.TryGetValue(callbackId, out var callback) ||
                !(callback is Action action))
            {

                throw new InvalidOperationException("Callback has the wrong signature");
            }

            action();
        }

        private void InvokeCallback(string callbackId, string arg1)
        {
            if (!Callbacks.TryGetValue(callbackId, out var callback) ||
                !(callback is Action<string> action))
            {

                throw new InvalidOperationException("Callback has the wrong signature");
            }

            action(arg1);
        }

        ~HubConnection()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(false);
        }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
            GC.SuppressFinalize(this);
        }
        #endregion
    }

    public class HubConnectionOptions
    {
        public LogLevel Logger { get; set; }
    }

    public enum LogLevel
    {
        Trace = 0,
        Information = 1,
        Warning = 2,
        Error = 3,
        None = 4
    }
}
