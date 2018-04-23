using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace BlazorApp.Server.Hubs
{
    public class GreetingHub : Hub
    {
        public Task Greet(string name)
        {
            return Clients.Caller.SendAsync("Greeting", name);
        }
    }
}
