using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using PlayNet.Models;
using PlayNet.Communications;

namespace PlayNet.Networking {
    public class NetworkSender : NetworkComponent
    {
        public override void Initialize(NetworkManager _m) {
            base.Initialize(_m);
        }

        private void SendString(string _id, string _data) {
            // Log("Sending {\"message\":\""+_data+"\"} to "+_id);
            m_Manager.Socket.Emit(_id, new JSONObject("{\"message\":\""+_data+"\"}"));
        }

        private void SendNetworkData<T>(string _id, T _data) where T : NetworkModel {
            _data.timestamp = NetworkTimestamp.NowMilliseconds().ToString();
            string _json = _data.ToJsonString();
            m_Manager.Socket.Emit(_id, new JSONObject(_json));
        }

        public void Connect() {
            m_Manager.Socket.Connect();
        }

        public void Close() {
            m_Manager.Socket.Close();
        }

        public void SendChat(string _chat) {
            SendString(NetworkMessages.CHAT, _chat);
        }

        public void SendHandshake(NetworkHandshake _data) {
            SendNetworkData<NetworkHandshake>(NetworkMessages.HANDSHAKE, _data);
        }
    }
}
