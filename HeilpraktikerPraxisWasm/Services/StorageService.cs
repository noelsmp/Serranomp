using Blazored.LocalStorage;
using HeilpraktikerPraxisWasm.Models;
namespace HeilpraktikerPraxisWasm.Services;

// Generic helper: used by all services
public static class IdHelper
{
    public static int NextId<T>(List<T> list, Func<T, int> getId) =>
        list.Count > 0 ? list.Max(getId) + 1 : 1;
}
