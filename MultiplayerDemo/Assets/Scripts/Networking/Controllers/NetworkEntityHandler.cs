using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using PlayNet.Models;
using PlayNet.Entities;

namespace PlayNet.Networking {
    public class NetworkEntityHandler : NetworkComponent
    {
        public NetworkEntityDatabase entityDB;

        private Hashtable m_NPCs;
        private Hashtable m_EntityPrefabs;

        public override void Initialize(NetworkManager _m) {
            base.Initialize(_m);
            m_NPCs = new Hashtable();
            BuildEntityDBPrefabReferences();
        }

        public override void Enable() {
            m_Manager.Listener.npcSpawnEvt.OnEvt += OnNPCSpawn;
            m_Manager.Listener.npcExitEvt.OnEvt += OnNPCExit;
        }

        public override void Disable() {
            m_Manager.Listener.npcSpawnEvt.OnEvt -= OnNPCSpawn;
            m_Manager.Listener.npcExitEvt.OnEvt -= OnNPCExit;
        }

        private void BuildEntityDBPrefabReferences() {
            m_EntityPrefabs = new Hashtable();
            foreach (NetworkEntity _e in entityDB.Prefabs) {
                if (m_EntityPrefabs.ContainsKey(_e.nameQuery)) continue;
                m_EntityPrefabs.Add(_e.nameQuery, _e.Prefab);
            }
        }

        private void OnNPCSpawn(NetworkNPCData _npc) {
            if (m_NPCs.ContainsKey(_npc.id)) return; // npc was already spawned
            Log("NPC spawned: "+_npc.id);
            if (!m_EntityPrefabs.ContainsKey(_npc.name)) return;
            GameObject _prefab = (GameObject)m_EntityPrefabs[_npc.name];
            GameObject _obj = Instantiate(_prefab, 
                new Vector3(_npc.transform.pos.x, _npc.transform.pos.y, _npc.transform.pos.z),
                Quaternion.Euler(_npc.transform.rot.x, _npc.transform.rot.y, _npc.transform.rot.z));
            m_NPCs.Add(_npc.id, _obj);
        }

        private void OnNPCExit(string _id) {
            if (!m_NPCs.ContainsKey(_id)) return; // npc already doesnt exist
            Log("NPC exited: "+_id);
        }
    }
}
