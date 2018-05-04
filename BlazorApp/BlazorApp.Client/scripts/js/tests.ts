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

    let result = DotnetInvoke.invokeDotNetMethod<{ IntegerValue: number, StringValue: string }>(
        {
            Type: {
                Assembly: "BlazorApp.Client",
                TypeName: "BlazorApp.Client.Infrastructure.InvokerTests",
                TypeArguments: {}
            },
            Method: {
                Name: "ParameterlessReturningMethod",
                TypeArguments: {},
                ParameterTypes: []
            }
        });

    if (result !== null) {
        console.log(`IntegerValue: '${result.IntegerValue}'`);
        console.log(`StringValue: '${result.StringValue}'`);
    }

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
        { Argument1: { IntegerValue: 3, StringValue: "String 3" } });

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

    DotnetInvoke.invokeDotNetMethodAsync(
        {
            Type: {
                Assembly: "BlazorApp.Client",
                TypeName: "BlazorApp.Client.Infrastructure.InvokerTests",
                TypeArguments: {}
            },
            Method: {
                Name: "SingleParameterMethodAsync",
                TypeArguments: {},
                ParameterTypes: [{
                    Assembly: "BlazorApp.Client",
                    TypeName: "BlazorApp.Client.Infrastructure.MethodParameter",
                    TypeArguments: {}
                }]
            }
        },
        { Argument1: { IntegerValue: 6, StringValue: "String 6" } })
        .then(() => console.log('After resolving task with parameter!'));

    let asyncPromise = DotnetInvoke.invokeDotNetMethodAsync<{ IntegerValue: number, StringValue: string }>(
        {
            Type: {
                Assembly: "BlazorApp.Client",
                TypeName: "BlazorApp.Client.Infrastructure.InvokerTests",
                TypeArguments: {}
            },
            Method: {
                Name: "ParameterlessReturningMethodAsync",
                TypeArguments: {},
                ParameterTypes: []
            }
        }).then(res => {
            if (res !== null) {
                console.log(`IntegerValue: '${res.IntegerValue}'`);
                console.log(`StringValue: '${res.StringValue}'`);
            }
        });
}

setTimeout(invokerTests, 10000, []);