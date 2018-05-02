using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlazorApp.Client.Infrastructure
{
    public class InvokerTests
    {
        public static void ParameterlessMethod() { Console.WriteLine(nameof(ParameterlessMethod)); }

        public static void SingleParameterMethod(MethodParameter p)
        {
            Console.WriteLine($"{nameof(ParameterlessMethod)} - {p.IntegerValue}, {p.StringValue}");
        }

        public static Task ParameterlessMethodAsync() { Console.WriteLine(nameof(ParameterlessMethodAsync)); return Task.CompletedTask; }
    }

    public class MethodParameter
    {
        public int IntegerValue { get; set; }
        public string StringValue { get; set; }
    }
}
