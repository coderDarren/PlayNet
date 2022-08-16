using UnityEngine;
using Newtonsoft.Json;
using System.Collections;

namespace PlayNet.Models {
    
    /// <summary>
    /// Information about the instance/zone the player is in.
    /// This includes information about all players.
    ///
    /// Ideally the client sends up their NetworkPlayerData..
    /// ..and receives NetworkInstanceData
    /// </summary>
    [System.Serializable]
    public class NetworkInstanceData : NetworkModel {
        public NetworkGameInfo gameInfo;
        public NetworkTransform[] players;
    }
}