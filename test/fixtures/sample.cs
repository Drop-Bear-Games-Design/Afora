using System;
using System.Linq;

namespace SampleApp
{
    public class Program
    {
        private static readonly string greeting = "Hello\nWorld";

        public static void Main(string[] args)
        {
            if (args.Length > 0)
            {
                for (int i = 0; i < args.Length; i++)
                {
                    Console.WriteLine($"Arg {i}: {args[i]}");
                }
            }
            else
            {
                throw new ArgumentException("No arguments provided\t!");
            }

            // LINQ query
            var result = from a in args
                         where a.Length > 3
                         select a.ToUpper();

            try
            {
                foreach (var item in result)
                {
                    Console.WriteLine(item);
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error: {ex.Message}");
            }
            finally
            {
                Console.WriteLine("Done");
            }
        }

        protected virtual string GetEscapes()
        {
            return "Tab:\t Newline:\n Quote:\" Backslash:\\ Null:\0";
        }

        internal static string Verbatim()
        {
            return @"This is a verbatim string with ""quotes"" and
multiple lines and (braces) {here}";
        }
    }
}
