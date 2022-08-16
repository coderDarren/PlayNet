using System.Text.RegularExpressions;
using SocketIO;
using UnityEngine;

namespace PlayNet.Models {
    /*
    * This class supports NetworkModel and string types
    */
    public class NetworkEvent<T> {
        
        public delegate void NetworkAction(T _data);
        public delegate void StringAction(string _msg);

        public event NetworkAction OnEvt;
        public event StringAction OnMsg;

        private string m_EvtLog;
        private bool m_Debug;
        private bool m_Invalid;

        public NetworkEvent(string _evtLog, bool _debug) {
            m_EvtLog = _evtLog;
            m_Debug = _debug;

            // Make sure the generic type 'T' is compatible with NetworkModel
            if (!typeof(NetworkModel).IsAssignableFrom(typeof(T)) && !typeof(string).IsAssignableFrom(typeof(T))) {
                m_Invalid = true;
                Debug.LogError("Network Event Handler for event must be of type NetworkModel or string: "+_evtLog);
            }
        }

        public void HandleEvt(SocketIOEvent _evt) {
            if (m_Invalid) return;

            string _msg = Regex.Unescape((string)_evt.data.ToDictionary()["message"]);

            if (typeof(NetworkModel).IsAssignableFrom(typeof(T))) {
                if (m_Debug) 
                    Debug.Log(m_EvtLog+" NETWORK MODEL "+typeof(T)+": "+_msg);
                T _netData = NetworkModel.FromJsonStr<T>(_msg);
                TryRunAction(OnEvt, _netData);
            } else if (typeof(T) == typeof(string)) {
                if (m_Debug)
                    Debug.Log(m_EvtLog+" NETWORK MODEL STRING: "+_msg);
                TryRunAction(OnMsg, _msg);
            } else {
                if (m_Debug)
                    Debug.LogWarning(m_EvtLog+" NO EVENT EMITTED FOR "+_msg+" "+typeof(T));
            }
        }

        private void TryRunAction(NetworkAction _action, T _data) {
            if (m_Invalid) return;

            try {
                _action(_data);
            } catch (System.Exception _e) {
                if (m_Debug) {
                    Debug.LogWarning(_e);
                }
            }
        }

        private void TryRunAction(StringAction _action, string _data) {
            if (m_Invalid) return;

            try {
                _action(_data);
            } catch (System.Exception _e) {
                if (m_Debug) {
                    Debug.LogWarning(_e);
                }
            }
        }
    }
}