using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace PlayNet.Networking {
    public class NetworkComponent : MonoBehaviour
    {
        public bool debug;

        protected NetworkManager m_Manager;

        public virtual void Initialize(NetworkManager _manager) {
            if (debug) {
                Debug.Log("Initializing Network Component: "+this.GetType());
            }
            m_Manager = _manager;
        }

        // These functions to be called for Unity Event Functions 'OnEnable' and 'OnDisable' respectively
        public virtual void Enable() {}
        public virtual void Disable() {}
    }
}
