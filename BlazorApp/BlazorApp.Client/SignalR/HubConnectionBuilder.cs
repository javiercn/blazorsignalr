using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlazorApp.Client.SignalR
{
    public class HubConnectionBuilder
    {
        private string _url;
        private HubConnectionOptions _options = new HubConnectionOptions();

        public HubConnection Build()
        {
            return new HubConnection(_url, _options);
        }

        public HubConnectionBuilder WithUrl(string url)
        {
            _url = url;
            return this;
        }

        public HubConnectionBuilder ConfigureLogging(Action<HubConnectionOptions> configure)
        {
            configure(_options);
            return this;
        }
    }
}
