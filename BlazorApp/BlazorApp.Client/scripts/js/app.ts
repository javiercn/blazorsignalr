/// <reference path="../../node_modules/@aspnet/signalr/dist/esm/browser-index.d.ts" />

namespace Greetings {
    export class HelloClient {
        private name: string;
        private hub: signalR.HubConnection;

        public constructor(name: string) {
            this.name = name;
            this.hub = new signalR.HubConnection("/greetings", { logger: signalR.LogLevel.Information });

            this.hub.on("Greeting", (greeting: string): void => {
                console.log(greeting);
            });
        }

        public async greet(name: string): Promise<void> {
            await this.hub.start();
            return this.hub.send("Greet", "Javier");
        }
    }
}