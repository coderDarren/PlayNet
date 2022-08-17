using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace PlayNet {
    public class SingletonBehavior : MonoBehaviour
    {
        public static SingletonBehavior instance;

        private bool m_DidEnable;

        private void Awake() {
            if (!instance) {
                instance = this;
                DontDestroyOnLoad(this);
                OnAwake();
                Enable();
            } else {
                Destroy(this);
            }
        }

        private void OnEnable() {
            Enable();
        }

        private void OnDisable() {
            if (instance != this) return;
            DidDisable();
        }

        private void Enable() {
            if (instance != this) return;
            if (m_DidEnable) return;
            DidEnable();
            m_DidEnable = true;
        }

        public virtual void OnAwake() {}
        public virtual void DidEnable() {}
        public virtual void DidDisable() {}
    }
}