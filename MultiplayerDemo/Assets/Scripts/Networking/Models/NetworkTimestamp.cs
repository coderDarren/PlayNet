using System;

namespace PlayNet.Models {
    public class NetworkTimestamp
    {
        public static long Now()
        {
            return new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds();
        }

        public static long NowMilliseconds() {
            return new DateTimeOffset(DateTime.UtcNow).ToUnixTimeMilliseconds();
        }
    }
}
