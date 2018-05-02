function invokerTests() {
    DotnetInvoke.invokeDotNetMethod(
        {
            Type: {
                Assembly: "BlazorApp.Client",
                TypeName: "BlazorApp.Client.Infrastructure.InvokerTests",
                TypeArguments: {}
            },
            Method: {
                Name: "ParameterlessMethod",
                TypeArguments: {},
                ParameterTypes: []
            }
        });

    DotnetInvoke.invokeDotNetMethod(
        {
            Type: {
                Assembly: "BlazorApp.Client",
                TypeName: "BlazorApp.Client.Infrastructure.InvokerTests",
                TypeArguments: {}
            },
            Method: {
                Name: "SingleParameterMethod",
                TypeArguments: {},
                ParameterTypes: [{
                    Assembly: "BlazorApp.Client",
                    TypeName: "BlazorApp.Client.Infrastructure.MethodParameter",
                    TypeArguments: {}
                }]
            }
        },
        { IntegerValue: 3, StringValue: "String 3"});

    DotnetInvoke.invokeDotNetMethodAsync(
        {
            Type: {
                Assembly: "BlazorApp.Client",
                TypeName: "BlazorApp.Client.Infrastructure.InvokerTests",
                TypeArguments: {}
            },
            Method: {
                Name: "ParameterlessMethodAsync",
                TypeArguments: {},
                ParameterTypes: []
            }
        }).then(() => console.log('After resolving task'));
}

setTimeout(invokerTests, 5000, []);