using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace BlazorApp.Server.Hubs
{
    public class GroupRoomHub : Hub
    {
        public async void Join(string name)
        {
            await Clients.All.SendAsync("Joined", $"{name} joined the room.");
        }
    }
}
