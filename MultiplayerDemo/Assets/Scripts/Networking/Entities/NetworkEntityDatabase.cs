using System.Collections;
using UnityEngine;

namespace PlayNet.Entities {
    [CreateAssetMenu(fileName = "NetworkEntity Database", menuName = "PlayNet/NetworkEntity Database", order = 1)]
    public class NetworkEntityDatabase : ScriptableObject {
        public NetworkEntity[] Prefabs;
    }
}
