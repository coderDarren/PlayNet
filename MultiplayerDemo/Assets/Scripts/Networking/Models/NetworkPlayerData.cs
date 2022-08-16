
namespace PlayNet.Models {
    
    [System.Serializable]
    public class NetworkPlayerData : NetworkModel
    {
        public int id;
        public string name;
        public int lvl;
        public NetworkPlayerHealth health;
        public NetworkPlayerAnimation anim;
        public NetworkTransform transform;

        public NetworkPlayerData() {
            transform = new NetworkTransform();
            anim = new NetworkPlayerAnimation();
            health = new NetworkPlayerHealth();
        }

    #region Transform Updaters
        public void UpdatePos(UnityEngine.Vector3 _pos) {
            transform.id = name;
            transform.pos.x = _pos.x;
            transform.pos.y = _pos.y;
            transform.pos.z = _pos.z;
        }

        public void UpdateRot(UnityEngine.Vector3 _rot) {
            transform.id = name;
            transform.rot.x = _rot.x;
            transform.rot.y = _rot.y;
            transform.rot.z = _rot.z;
        }
    #endregion

    }

    public class NetworkPlayerAnimation : NetworkModel {
        public NetworkAnimFloat running;
        public NetworkAnimBool grounded;
        public NetworkAnimBool attacking;
        public NetworkAnimBool special;
        public NetworkAnimBool cycle;
        public NetworkPlayerAnimation() {
            running = new NetworkAnimFloat("running");
            grounded = new NetworkAnimBool("grounded");
            cycle = new NetworkAnimBool("cycle");
            attacking = new NetworkAnimBool("");
            special = new NetworkAnimBool("");
        }
    }

    public class NetworkPlayerEvent : NetworkModel {
        public string id;
        public NetworkPlayerEvent(){}
        public NetworkPlayerEvent(string _n) {
            id = _n;
        }
    }

    [System.Serializable]
    public class NetworkPlayerHealth : NetworkPlayerEvent {
        public int health;
        public int maxHealth;
        public NetworkPlayerHealth() {}
        public NetworkPlayerHealth(string _n, int _h, int _m) : base(_n) {
            id = _n;
            health = _h;
            maxHealth = _m;
        }
    }

    public class NetworkPlayerLvl : NetworkPlayerEvent {
        public int lvl;
        public NetworkPlayerLvl(string _n, int _l) : base(_n) {
            id = _n;
            lvl = _l;
        }
    }

    [System.Serializable]
    public class NetworkTransform : NetworkPlayerEvent {
        public NetworkVector3 pos;
        public NetworkVector3 rot;
        public NetworkTransform() : base("") {
            pos = new NetworkVector3();
            rot = new NetworkVector3();
        }
    }

    public class NetworkAnim : NetworkPlayerEvent {
        public string anim;
        public NetworkAnim() {}
        public NetworkAnim(string _id, string _anim) : base(_id) {
            anim = _anim;
        }
    }

    public class NetworkAnimFloat : NetworkAnim {
        public float val;
        public NetworkAnimFloat() {}
        public NetworkAnimFloat(string _a) : base("", _a) {
            val = 0;
        }
        public NetworkAnimFloat(string _i, string _a, float _v) : base(_i, _a) {
            val = _v;
        }
    }

    public class NetworkAnimBool : NetworkAnim {
        public bool val;
        public NetworkAnimBool() {}
        public NetworkAnimBool(string _anim) : base("", _anim) {
            val = false;
        }
        public NetworkAnimBool(string _i, string _a, bool _v) : base(_i, _a) {
            val = _v;
        }
    }
}