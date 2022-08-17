namespace PlayNet.Models {
    
    public class NetworkNPCHitInfo : NetworkModel {
        public string id;
        public string npcName;
        public string playerName;
        public int dmg;
        public bool crit;
        public NetworkNPCHitInfo(string _id, string _npcName, int _dmg, bool _crit) {
            id = _id;
            npcName = _npcName;
            dmg = _dmg;
            crit = _crit;
        }
    }

    public class NetworkNPCAttackData : NetworkModel {
        public string id;
        public string npcName;
        public string playerName;
    }

    public class NetworkNPCDeathData : NetworkModel {
        public string id;
        public string name;
        public string[] lootRights; // array of player names who can loot
        public NetworkNPCXpAllottment[] xpAllottment;
    }

    public class NetworkNPCXpAllottment : NetworkModel {
        public string playerName;
        public int xp;
    }

    public class NetworkNPCData : NetworkModel {
        public string id;
        public string name;
        public int level;
        public int maxHealth;
        public int health;
        public int maxEnergy;
        public int energy;
        public float attackSpeed;
        public float aggroRange;
        public bool inAttackRange;
        public bool inCombat;
        public bool dead;
        public NetworkTransform transform;

        public NetworkNPCData() {
            transform = new NetworkTransform();
        }
    }
}