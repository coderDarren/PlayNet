using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace PlayNet {
    public class SingletonBehavior : MonoBehaviour
    {
        public static SingletonBehavior instance;

        private void Awake() {
            if (!instance) {
                instance = this;
                DontDestroyOnLoad(this);
                OnAwake();
            } else {
                Destroy(this);
            }
        }

        private void OnEnable() {
            if (instance != this) return;
            DidEnable();
        }

        private void OnDisable() {
            if (instance != this) return;
            DidDisable();
        }

        public virtual void OnAwake() {}
        public virtual void DidEnable() {}
        public virtual void DidDisable() {}
    }
}