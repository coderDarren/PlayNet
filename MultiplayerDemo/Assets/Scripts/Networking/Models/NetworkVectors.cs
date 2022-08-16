
namespace PlayNet.Models {
    [System.Serializable]
    public class NetworkVector3 : NetworkModel {
        public float x;
        public float y;
        public float z;
        public NetworkVector3() {}
        public NetworkVector3(float _x, float _y, float _z) {
            x = _x;
            y = _y;
            z = _z;
        }
    }
}