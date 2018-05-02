using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Blazor;
using Microsoft.AspNetCore.Blazor.Browser.Interop;

namespace BlazorApp.Client.Infrastructure
{
    /// <summary>
    /// Invokes .NET methods from JavaScript
    /// </summary>
    public class JavaScriptInvoke
    {
        public static string InvokeDotnetMethod(string methodOptions, string methodArguments)
        {
            var options = JsonUtil.Deserialize<MethodOptions>(methodOptions);
            var argumentDeserializer = GetOrCreateArgumentDeserializer(options);
            Console.WriteLine(methodArguments ?? "(null)");
            var invoker = GetOrCreateInvoker(options, argumentDeserializer);

            var result = invoker(methodArguments);
            if (options.Async != null && !(result is Task))
            {
                throw new InvalidOperationException($"'{options.Method.Name}' in '{options.Type.TypeName}' must return a Task.");
            }
            if (result is Task taskResult)
            {
                taskResult.ContinueWith(task =>
                {
                    if (task.Status == TaskStatus.RanToCompletion)
                    {
                        RegisteredFunction.Invoke<bool>(
                            options.Async.FunctionName,
                            options.Async.ResolveId);
                    }
                    else
                    {
                        RegisteredFunction.Invoke<bool>(
                            options.Async.FunctionName,
                            options.Async.ResolveId);
                    }
                });
            }

            return JsonUtil.Serialize(result);
        }

        private static Func<string, object> GetOrCreateInvoker(MethodOptions options, Func<string, object[]> argumentDeserializer)
        {
            var method = options.GetMethodOrThrow();
            return (string args) => method.Invoke(null, argumentDeserializer(args));
        }

        private static Func<string, object[]> GetOrCreateArgumentDeserializer(MethodOptions options)
        {
            var info = options.GetMethodOrThrow();
            var argsClass = ArgumentList.GetArgumentClass(info.GetParameters().Select(p => p.ParameterType).ToArray());
            var deserializeMethod = argsClass.GetMethod(nameof(ArgumentList.JsonDeserialize));
            var toParameterListMethod = argsClass.GetMethods(BindingFlags.Instance | BindingFlags.Public)
                .Where(m => string.Equals(nameof(ArgumentList.ToParameterList), m.Name))
                .Single();
            return Deserialize;

            object[] Deserialize(string arguments)
            {
                Console.WriteLine("Deserializer: " + deserializeMethod == null ? "(null)" : "non-null");
                Console.WriteLine("ToParameterList: " + toParameterListMethod == null ? "(null)" : "non-null");
                Console.WriteLine("I got updated!");
                var argsInstance = deserializeMethod.Invoke(null, new object[] { arguments });
                Console.WriteLine(argsInstance.GetType().FullName);
                return (object[])toParameterListMethod.Invoke(argsInstance, Array.Empty<object>());
            }
        }

    }
    public class ArgumentList
    {
        public static ArgumentList Instance { get; } = new ArgumentList();

        public static Type GetArgumentClass(Type[] arguments)
        {
            switch (arguments.Length)
            {
                case 0:
                    return typeof(ArgumentList);
                case 1:
                    return typeof(ArgumentList<>).MakeGenericType(arguments);
                case 2:
                    return typeof(ArgumentList<,>).MakeGenericType(arguments);
                case 3:
                    return typeof(ArgumentList<,,>).MakeGenericType(arguments);
                case 4:
                    return typeof(ArgumentList<,,,>).MakeGenericType(arguments);
                case 5:
                    return typeof(ArgumentList<,,,,>).MakeGenericType(arguments);
                case 6:
                    return typeof(ArgumentList<,,,,,>).MakeGenericType(arguments);
                case 7:
                    return typeof(ArgumentList<,,,,,,>).MakeGenericType(arguments);
                default:
                    throw new InvalidOperationException("Unsupported number of arguments");
            }
        }

        public static ArgumentList JsonDeserialize(string item) => Instance;

        public object[] ToParameterList() => Array.Empty<object>();
    }

    public class ArgumentList<T1>
    {
        public T1 Argument1 { get; set; }

        public static ArgumentList<T1> JsonDeserialize(string item) =>
            JsonUtil.Deserialize<ArgumentList<T1>>(item);

        public object[] ToParameterList() => new object[] { Argument1 };
    }

    public class ArgumentList<T1, T2>
    {
        public T1 Argument1 { get; set; }
        public T2 Argument2 { get; set; }
    }

    public class ArgumentList<T1, T2, T3>
    {
        public T1 Argument1 { get; set; }
        public T2 Argument2 { get; set; }
        public T3 Argument3 { get; set; }
    }

    public class ArgumentList<T1, T2, T3, T4>
    {
        public T1 Argument1 { get; set; }
        public T2 Argument2 { get; set; }
        public T3 Argument3 { get; set; }
        public T4 Argument4 { get; set; }
    }

    public class ArgumentList<T1, T2, T3, T4, T5>
    {
        public T1 Argument1 { get; set; }
        public T2 Argument2 { get; set; }
        public T3 Argument3 { get; set; }
        public T4 Argument4 { get; set; }
        public T5 Argument5 { get; set; }
    }
    public class ArgumentList<T1, T2, T3, T4, T5, T6>
    {
        public T1 Argument1 { get; set; }
        public T2 Argument2 { get; set; }
        public T3 Argument3 { get; set; }
        public T4 Argument4 { get; set; }
        public T5 Argument5 { get; set; }
        public T6 Argument6 { get; set; }
    }
    public class ArgumentList<T1, T2, T3, T4, T5, T6, T7>
    {
        public T1 Argument1 { get; set; }
        public T2 Argument2 { get; set; }
        public T3 Argument3 { get; set; }
        public T4 Argument4 { get; set; }
        public T5 Argument5 { get; set; }
        public T6 Argument6 { get; set; }
        public T7 Argument7 { get; set; }

        public ArgumentList<T1, T2, T3, T4, T5, T6, T7> JsonDeserialize(string item) =>
            JsonUtil.Deserialize<ArgumentList<T1, T2, T3, T4, T5, T6, T7>>(item);
    }

    public class TypeInstance
    {
        public TypeInstance()
        {
        }

        public string Assembly { get; set; }
        public string TypeName { get; set; }
        public IDictionary<string, TypeInstance> TypeArguments { get; set; }

        internal Type GetTypeOrThrow()
        {
            return Type.GetType($"{TypeName}, {Assembly}", throwOnError: true);
        }
    }

    public class MethodInstance
    {
        public MethodInstance()
        {
        }

        public string Name { get; set; }
        public IDictionary<string, TypeInstance> TypeArguments { get; set; }
        public TypeInstance[] ParameterTypes { get; set; }

        internal MethodInfo GetMethodOrThrow(Type type)
        {
            var result = type.GetMethods(BindingFlags.Static | BindingFlags.Public).Where(m => string.Equals(m.Name, Name, StringComparison.Ordinal)).SingleOrDefault();
            return result ?? throw new InvalidOperationException($"Couldn't found a method with name '{Name}' in '{type.FullName}'.");
        }
    }

    public class MethodOptions
    {
        public MethodOptions()
        {
        }

        public TypeInstance Type { get; set; }
        public MethodInstance Method { get; set; }
        public Async Async { get; set; }

        internal MethodInfo GetMethodOrThrow()
        {
            var type = Type.GetTypeOrThrow();
            var method = Method.GetMethodOrThrow(type);

            return method;
        }
    }

    public class Async
    {
        public Async()
        {
        }

        public string ResolveId { get; set; }
        public string RejectId { get; set; }
        public string FunctionName { get; set; }
    }
}
