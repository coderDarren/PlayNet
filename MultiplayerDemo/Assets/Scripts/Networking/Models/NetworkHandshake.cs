
namespace PlayNet.Models {
    public class NetworkHandshake : NetworkModel
    {
        
        public NetworkPlayerData player;
        public int sessionId;

        public NetworkHandshake(NetworkPlayerData _player, int _sessionId) {
            player = _player;
            sessionId = _sessionId;
        }
    }
}
