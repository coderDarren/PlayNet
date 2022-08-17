using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;
using PlayNet.Models;
using PlayNet.Player;

/*
    NetworkManager
    A singleton network object that maintains references and initializes various network components manually

    - NetworkConnector
    - NetworkEntityHandler
*/

namespace PlayNet.Networking {
    [RequireComponent(typeof(NetworkConnector))]
    [RequireComponent(typeof(NetworkEntityHandler))]
    [RequireComponent(typeof(NetworkListener))]
    [RequireComponent(typeof(NetworkSender))]
    [RequireComponent(typeof(SocketIOComponent))]
    public class NetworkManager : SingletonBehavior
    {
        public static NetworkManager instance;

        [Header("Testing Spec")]
        public bool test;
        public PlayNet.Player.NetworkPlayer testPlayer;

        public SocketIOComponent Socket {get;private set;}
        public NetworkConnector Connector {get;private set;}
        public NetworkListener Listener {get;private set;}
        public NetworkEntityHandler EntityHandler {get;private set;}
        public NetworkSender Sender {get;private set;}

        public override void OnAwake() {
            // Get references
            Socket = GetComponent<SocketIOComponent>();
            Connector = GetComponent<NetworkConnector>();
            Listener = GetComponent<NetworkListener>();
            EntityHandler = GetComponent<NetworkEntityHandler>();
            Sender = GetComponent<NetworkSender>();

            // Initialize components
            Socket.Initialize();
            Connector.Initialize(this);
            Listener.Initialize(this);
            EntityHandler.Initialize(this);
            Sender.Initialize(this);

            if (test) {
                // auto connect with handshake
                Connect();
            }

        }

        public override void DidEnable() {
            Listener.OnConnect += OnConnect;
            Listener.OnDisconnect += OnDisconnect;
            Listener.handshakeEvt.OnEvt += OnHandshake;
        }

        public override void DidDisable() {
            Listener.OnConnect -= OnConnect;
            Listener.OnDisconnect -= OnDisconnect;
            Listener.handshakeEvt.OnEvt -= OnHandshake;
        }

        private void OnConnect() {
            Debug.Log("Connect!");
            if (test) {
                NetworkHandshake _handshake = new NetworkHandshake(testPlayer.testData, 0);
                Sender.SendHandshake(_handshake);
            }
        }

        private void OnDisconnect() {
            Debug.Log("Disconnect!");
        }

        private void OnHandshake(NetworkInstanceData _data) {
            Debug.Log("Handshake!");

        }

        private void Connect() {
            Socket.Connect();
        }

        private void Close() {
            Socket.Close();
        }

    }
}
