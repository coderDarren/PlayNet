using System.Collections;
using UnityEngine;

namespace PlayNet.Entities {
    [CreateAssetMenu(fileName = "NetworkEntity", menuName = "PlayNet/NetworkEntity", order = 1)]
    public class NetworkEntity : ScriptableObject {
        public string nameQuery;
        public GameObject Prefab;
    }
}