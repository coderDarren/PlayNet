using UnityEngine;
using Newtonsoft.Json;

namespace PlayNet.Models {
    public class NetworkModel 
    {
        
        public string timestamp;
        
#region Public Functions
        public string ToJsonString() {
            string _ret = string.Empty;
            try {
                _ret = JsonConvert.SerializeObject(this).Replace("\n","").Replace("\t","");
            } catch (System.Exception _e) {
                Debug.LogWarning("[NetworkModel]: Failed to serialize "+this.GetType()+": "+_e);
            }
            return _ret;
        }

        public static T FromJsonStr<T>(string _json) {
            try { 
                return JsonConvert.DeserializeObject<T>(_json);
            } catch (System.Exception _e) {
                Debug.LogWarning("[NetworkModel]: Failed to deserialize json "+_json+": "+_e);
                return default(T);
            }
        }
#endregion
    }
}
