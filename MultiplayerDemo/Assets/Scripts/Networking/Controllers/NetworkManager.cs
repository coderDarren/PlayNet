using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;
using PlayNet.Models;

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

        public bool test;

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

            }

        }

        public override void DidEnable() {
            Listener.OnConnect += OnConnect;
            Listener.handshakeEvt.OnEvt += OnHandshake;
        }

        public override void DidDisable() {
            Listener.OnConnect -= OnConnect;
            Listener.handshakeEvt.OnEvt -= OnHandshake;
        }

        private void OnConnect() {
            if (test) {
                // send handshake
                
            }
        }

        private void OnHandshake(NetworkInstanceData _data) {

        }

    }
}
