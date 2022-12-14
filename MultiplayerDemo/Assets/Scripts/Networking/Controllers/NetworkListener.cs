using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using PlayNet.Models;
using PlayNet.Communications;
using SocketIO;

namespace PlayNet.Networking {
    public class NetworkListener : NetworkComponent
    {
        // Some essential delegates for network hooks
        public delegate void BasicAction();
        public delegate void StringAction(string _msg);

#region NETWORK EVENTS
        public event BasicAction OnConnect;
        public event BasicAction OnDisconnect;
    #region SERVER
        public NetworkEvent<string> chatEvt {get; private set;}
        public NetworkEvent<NetworkInstanceData> handshakeEvt {get; private set;}
        public NetworkEvent<NetworkInstanceData> instanceDataEvt {get; private set;}
    #endregion
    #region PLAYER
        public NetworkEvent<NetworkPlayerData> playerJoinEvt {get; private set;}
        public NetworkEvent<string> playerExitEvt {get; private set;}
        public NetworkEvent<NetworkPlayerData> playerLeaveEvt {get; private set;}
        public NetworkEvent<NetworkPlayerData> playerSpawnEvt {get; private set;}
        public NetworkEvent<NetworkTransform> playerTransformEvt {get; private set;}
    #endregion
    #region NPCs
        public NetworkEvent<NetworkNPCData> npcSpawnEvt {get;private set;}
        public NetworkEvent<string> npcExitEvt {get;private set;}
    #endregion
    // Add more events here!
#endregion

        public override void Initialize(NetworkManager _m) {
            base.Initialize(_m);
            Build();
            Listen();
        }

        public override void Enable() {

        }

        public override void Disable() {

        }

        private void Build() {
            // server events
            chatEvt = new NetworkEvent<string>("Incoming chat", debug);
            handshakeEvt = new NetworkEvent<NetworkInstanceData>("Incoming handshake.", debug);        
            instanceDataEvt = new NetworkEvent<NetworkInstanceData>("Network instance updated.", debug);
            // player events
            playerJoinEvt = new NetworkEvent<NetworkPlayerData>("Player joined.", debug);
            playerExitEvt = new NetworkEvent<string>("Player exited range.", debug);
            playerLeaveEvt = new NetworkEvent<NetworkPlayerData>("Player left.", debug);
            playerSpawnEvt = new NetworkEvent<NetworkPlayerData>("Player entered range.", debug);
            playerTransformEvt = new NetworkEvent<NetworkTransform>("Player transform changed.", debug);
            // npc events
            npcSpawnEvt = new NetworkEvent<NetworkNPCData>("NPC spawned", debug);
            npcExitEvt = new NetworkEvent<string>("NPC exited range", debug);
        }

        /*
         * Subscribe to network events and broadcast to game managers
         */
        private void Listen() {
            // server events
            m_Manager.Socket.On(NetworkMessages.CONNECT, OnNetworkConnected);
            m_Manager.Socket.On(NetworkMessages.DISCONNECT, OnNetworkDisconnected);
            m_Manager.Socket.On(NetworkMessages.HANDSHAKE, handshakeEvt.Broadcast);
        
            m_Manager.Socket.On(NetworkMessages.INSTANCE, instanceDataEvt.Broadcast);
            m_Manager.Socket.On(NetworkMessages.CHAT, chatEvt.Broadcast);

            // player events
            m_Manager.Socket.On(NetworkMessages.PLAYER_SPAWN, playerSpawnEvt.Broadcast);
            m_Manager.Socket.On(NetworkMessages.PLAYER_EXIT, playerExitEvt.Broadcast);
            m_Manager.Socket.On(NetworkMessages.PLAYER_JOINED, playerJoinEvt.Broadcast);
            m_Manager.Socket.On(NetworkMessages.PLAYER_LEFT, playerLeaveEvt.Broadcast);
            m_Manager.Socket.On(NetworkMessages.PLAYER_TRANSFORM_CHANGE, playerTransformEvt.Broadcast);

            // npc events
            m_Manager.Socket.On(NetworkMessages.NPC_SPAWN, npcSpawnEvt.Broadcast);
            m_Manager.Socket.On(NetworkMessages.NPC_EXIT, npcExitEvt.Broadcast);
        }

        private void OnNetworkConnected(SocketIOEvent _evt) {
            // Debug.Log("Successfully connected to the server.");
            TryRunAction(OnConnect);
        }

        private void OnNetworkDisconnected(SocketIOEvent _evt) {
            // Debug.Log("Disconnected from the server.");
            TryRunAction(OnDisconnect);
        }

        private void TryRunAction(BasicAction _action) {
            try {
                _action();
            } catch (System.Exception _e) {
                Debug.LogWarning(_e);
            }
        }
    }
}
