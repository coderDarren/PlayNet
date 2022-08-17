using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using PlayNet.Models;

namespace PlayNet.Networking {
    public class NetworkEntityHandler : NetworkComponent
    {
        private Hashtable m_NPCs;

        public override void Initialize(NetworkManager _m) {
            base.Initialize(_m);
            m_NPCs = new Hashtable();
        }

        public override void Enable() {
            m_Manager.Listener.npcSpawnEvt.OnEvt += OnNPCSpawn;
            m_Manager.Listener.npcExitEvt.OnEvt += OnNPCExit;
        }

        public override void Disable() {
            m_Manager.Listener.npcSpawnEvt.OnEvt -= OnNPCSpawn;
            m_Manager.Listener.npcExitEvt.OnEvt -= OnNPCExit;
        }

        private void OnNPCSpawn(NetworkNPCData _npc) {
            if (m_NPCs.ContainsKey(_npc.id)) return; // npc was already spawned
            Log("NPC spawned: "+_npc.id);
        }

        private void OnNPCExit(string _id) {
            if (!m_NPCs.ContainsKey(_id)) return; // npc already doesnt exist
            Log("NPC exited: "+_id);
        }
    }
}
