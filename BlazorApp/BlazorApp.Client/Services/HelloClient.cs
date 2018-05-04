using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BlazorApp.Client.Components;
using BlazorApp.Client.SignalR;

namespace BlazorApp.Client.Services
{
    public class HelloClient
    {
        public HelloClient(Action<string> onGreeting)
        {
        }

        public string Name { get; }

        public HubConnection Hub { get; }

        public Task InitAsync() => Hub.StartAsync();

        public Task Greet(string name) => Hub.SendAsync("Greet", name);
    }
}
