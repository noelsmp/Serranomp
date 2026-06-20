using Blazored.LocalStorage;
using System.Security.Cryptography;
using System.Text;

namespace HeilpraktikerPraxisWasm.Services;

public class PinService(ILocalStorageService storage)
{
    private const string PinKey = "pin_hash";
    private const string AttemptsKey = "pin_attempts";
    private const string LockUntilKey = "pin_lock_until";

    public bool IsUnlocked { get; private set; }

    public async Task<bool> IsPinSetAsync() =>
        !string.IsNullOrEmpty(await storage.GetItemAsync<string>(PinKey));

    public async Task SetPinAsync(string pin)
    {
        var hash = Hash(pin);
        await storage.SetItemAsync(PinKey, hash);
        await storage.RemoveItemAsync(AttemptsKey);
        await storage.RemoveItemAsync(LockUntilKey);
        IsUnlocked = true;
    }

    public async Task RemovePinAsync()
    {
        await storage.RemoveItemAsync(PinKey);
        await storage.RemoveItemAsync(AttemptsKey);
        await storage.RemoveItemAsync(LockUntilKey);
        IsUnlocked = true;
    }

    public async Task<(bool success, int remainingSeconds, int failedAttempts)> VerifyAsync(string pin)
    {
        // Gesperrt?
        var lockUntil = await storage.GetItemAsync<DateTime?>(LockUntilKey);
        if (lockUntil.HasValue && lockUntil.Value > DateTime.Now)
            return (false, (int)(lockUntil.Value - DateTime.Now).TotalSeconds, 0);

        var stored = await storage.GetItemAsync<string>(PinKey);
        if (Hash(pin) == stored)
        {
            await storage.RemoveItemAsync(AttemptsKey);
            await storage.RemoveItemAsync(LockUntilKey);
            IsUnlocked = true;
            return (true, 0, 0);
        }

        var attempts = (await storage.GetItemAsync<int?>(AttemptsKey) ?? 0) + 1;
        await storage.SetItemAsync(AttemptsKey, attempts);

        if (attempts >= 3)
        {
            var lockSeconds = attempts >= 6 ? 300 : 30;
            await storage.SetItemAsync(LockUntilKey, DateTime.Now.AddSeconds(lockSeconds));
            await storage.RemoveItemAsync(AttemptsKey);
            return (false, lockSeconds, attempts);
        }

        return (false, 0, attempts);
    }

    public async Task<int> RemainingLockSecondsAsync()
    {
        var lockUntil = await storage.GetItemAsync<DateTime?>(LockUntilKey);
        if (lockUntil.HasValue && lockUntil.Value > DateTime.Now)
            return (int)(lockUntil.Value - DateTime.Now).TotalSeconds;
        return 0;
    }

    public void Lock() => IsUnlocked = false;

    private static string Hash(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input + "praxis_salt"));
        return Convert.ToHexString(bytes);
    }
}
