using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace PlayNet.Networking {
    public class NetworkComponent : MonoBehaviour
    {
        public bool debug;

        protected NetworkManager m_Manager;

        protected bool m_DidEnable;

        public virtual void Initialize(NetworkManager _manager) {
            if (debug) {
                Debug.Log("Initializing Network Component: "+this.GetType());
            }
            m_Manager = _manager;
            CallEnable();
        }

        // These functions to be called for Unity Event Functions 'OnEnable' and 'OnDisable' respectively
        public virtual void Enable() {}
        public virtual void Disable() {}

        protected void Log(string _msg) {
            if (!debug) return;
            Debug.Log("["+this.GetType()+"]: "+_msg);
        }

        private void CallEnable() {
            if (m_DidEnable) return;
            m_DidEnable = true;
            Enable();
        }

        private void OnEnable() {
            CallEnable();
        }

        private void OnDisable() {
            Disable();
        }
    }
}
