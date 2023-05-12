
class GltfMerger
{ 
    static gltfBackreferences = {
        "/accessors/\\d+": [
          "/animations/\\d+/samplers/\\d+/input",
          "/animations/\\d+/samplers/\\d+/output",
          "/meshes/\\d+/primitives/\\d+/attributes/[a-zA-Z0-9_]*",
          "/meshes/\\d+/primitives/\\d+/indices",
          "/meshes/\\d+/primitives/\\d+/targets/\\d+/NORMAL",
          "/meshes/\\d+/primitives/\\d+/targets/\\d+/POSITION",
          "/meshes/\\d+/primitives/\\d+/targets/\\d+/TANGENT",
          "/skins/\\d+/inverseBindMatrices"
        ],
        //"/animations/\\d+/samplers/\\d+": [
        //  "/animations/\\d+/channels/\\d+/sampler"
        //],
        "/animations/\\d+": [
        ],
        "/bufferViews/\\d+": [
          "/accessors/\\d+/bufferView",
          "/accessors/\\d+/sparse/indices/bufferView",
          "/accessors/\\d+/sparse/values/bufferView",
          "/images/\\d+/bufferView",
          "/meshes/\\d+/primitives/\\d+/extensions/KHR_draco_mesh_compression/bufferView"
        ],
        "/buffers/\\d+": [
          "/bufferViews/\\d+/buffer"
        ],
        "/cameras/\\d+": [
          "/nodes/\\d+/camera"
        ],
        "/extensions/KHR_lights_punctual/lights/\\d+": [
          "/nodes/\\d+/extensions/KHR_lights_punctual/light"
        ],
        "/extensions/KHR_materials_variants/variants/\\d+": [
          "/meshes/\\d+/primitives/\\d+/extensions/KHR_materials_variants/mappings/\\d+/variants/\\d+"
        ],
        "/extensions/KHR_xmp_json_ld/packets/\\d+": [
          "/animations/\\d+/extensions/KHR_xmp_json_ld/packet",
          "/asset/extensions/KHR_xmp_json_ld/packet",
          "/images/\\d+/extensions/KHR_xmp_json_ld/packet",
          "/materials/\\d+/extensions/KHR_xmp_json_ld/packet",
          "/meshes/\\d+/extensions/KHR_xmp_json_ld/packet",
          "/nodes/\\d+/extensions/KHR_xmp_json_ld/packet",
          "/scenes/\\d+/extensions/KHR_xmp_json_ld/packet"
        ],
        "/images/\\d+": [
          "/textures/\\d+/extensions/KHR_texture_basisu/source",
          "/textures/\\d+/source"
        ],
        "/materials/\\d+": [
          "/meshes/\\d+/primitives/\\d+/extensions/KHR_materials_variants/mappings/\\d+/material",
          "/meshes/\\d+/primitives/\\d+/material"
        ],
        "/meshes/\\d+": [
          "/nodes/\\d+/mesh"
        ],
        "/nodes/\\d+": [
          "/animations/\\d+/channels/\\d+/target/node",
          "/nodes/\\d+/children/\\d+",
          "/scenes/\\d+/nodes/\\d+",
          "/skins/\\d+/joints/\\d+",
          "/skins/\\d+/skeleton"
        ],
        "/samplers/\\d+": [
          "/textures/\\d+/sampler"
        ],
        "/scenes/\\d+": [
          "/scene"
        ],
        "/skins/\\d+": [
          "/nodes/\\d+/skin"
        ],
        "/textures/\\d+": [
          "/materials/\\d+/emissiveTexture/index",
          "/materials/\\d+/extensions/KHR_materials_clearcoat/clearcoatNormalTexture/index",
          "/materials/\\d+/extensions/KHR_materials_clearcoat/clearcoatRoughnessTexture/index",
          "/materials/\\d+/extensions/KHR_materials_clearcoat/clearcoatTexture/index",
          "/materials/\\d+/extensions/KHR_materials_iridescence/iridescenceTexture/index",
          "/materials/\\d+/extensions/KHR_materials_iridescence/iridescenceThicknessTexture/index",
          "/materials/\\d+/extensions/KHR_materials_pbrSpecularGlossiness/diffuseTexture/index",
          "/materials/\\d+/extensions/KHR_materials_pbrSpecularGlossiness/specularGlossinessTexture/index",
          "/materials/\\d+/extensions/KHR_materials_sheen/sheenColorTexture/index",
          "/materials/\\d+/extensions/KHR_materials_sheen/sheenRoughnessTexture/index",
          "/materials/\\d+/extensions/KHR_materials_specular/specularColorTexture/index",
          "/materials/\\d+/extensions/KHR_materials_specular/specularTexture/index",
          "/materials/\\d+/extensions/KHR_materials_transmission/transmissionTexture/index",
          "/materials/\\d+/extensions/KHR_materials_volume/thicknessTexture/index",
          "/materials/\\d+/normalTexture/index",
          "/materials/\\d+/occlusionTexture/index",
          "/materials/\\d+/pbrMetallicRoughness/baseColorTexture/index",
          "/materials/\\d+/pbrMetallicRoughness/metallicRoughnessTexture/index"
        ]
      }

    // getPathArray takes a json file and a pattern string (e.g. "/nodes/\\d+/children/\\d+"). 
    // the function returns an array of paths with valid paths in the json matching the pattern
    static getPathArray(json, pattern)
    {
        const paths = [];

        function traverse(obj, currentPath) 
        {
            if (typeof obj === 'object' && obj !== null) 
            {
              if (Array.isArray(obj)) 
              {
                for (let i = 0; i < obj.length; i++) 
                {
                  const newPath = currentPath + '/' + i;
                  if (newPath.match(pattern+'$')) 
                  {
                    paths.push(newPath);
                     
                  }
                  traverse(obj[i], newPath);
                }
              } 
              else 
              {
                for (const key in obj) 
                {
                  const newPath = currentPath + '/' + key;
                  if (newPath.match(pattern+'$')) 
                  {
                    paths.push(newPath); 
                  }
                  traverse(obj[key], newPath);
                }
              }
            }
          }
      
        traverse(json, '');
      
        return paths;
    }
    
    static applyReferenceOffset(gltf, pattern, offset)
    {
        
        if(this.gltfBackreferences.hasOwnProperty(pattern)){
            let referencePatterns = this.gltfBackreferences[pattern]
            for (const ref of referencePatterns) 
            {
                console.log("ref: "+ref)
              
                let pathArray = this.getPathArray(gltf, ref)

                for (const path of pathArray) 
                {
                    // console.log("path: "+path)
                    let value =this.getObjectAtPath(gltf, path) 
                    this.setValuetAtPath(gltf,path,value+offset)
                } 

            } 
        }
    }
    
    static fixReferences(gltfResident, gltfImport, pattern)
    {
        // /images/0..2 + /images/0..3
        // pattern: /images/\\d+
        // backreferences to images e.g.: /textures/\\d+/image

        let path = pattern.replace('/\\d+', '');
        let propertyArray = this.getObjectAtPath(gltfResident, path) 
        if(propertyArray === undefined)
        {
            // offset === 0 -> nothing to do
            return
        }

        let offset = propertyArray.length
        this.applyReferenceOffset(gltfImport, pattern, offset)
    }

    static getObjectAtPath(json, path) 
    {
        const pathArray = path.split('/').filter(segment => segment !== '');
        let obj = json;
        
        for (let i = 0; i < pathArray.length-1; i++) 
        {
            let key = pathArray[i]

            obj = obj[key];
            if (obj === undefined)
            {
                return undefined;
            }

        }
        if (obj === undefined)
        {
            return undefined;
        }
        if(obj.hasOwnProperty(pathArray[pathArray.length-1]))
        {
            return   obj[pathArray[pathArray.length-1]];
        }

        return undefined
    }

    static setValuetAtPath(json, path, value) 
    {
    
        const pathArray = path.split('/').filter(segment => segment !== '');
        if( pathArray.length===0)
        {
            return;
        }
        let obj = json;
        

        for (let i = 0; i < pathArray.length-1; i++) {
            let key = pathArray[i]

            if(!obj.hasOwnProperty(key))
            {
                obj[key]={}
            }
            obj = obj[key];


        }

        let key = pathArray[pathArray.length-1]

        obj[key] = value
    
    }

    static mergeJsonAtPath(json1, json2, path) {
    
    // Recursive merge function
    const merge = (target, source) => {
        for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] instanceof Array && target.hasOwnProperty(key) && target[key] instanceof Array) {
            // Merge arrays by appending the elements
            target[key] = target[key].concat(source[key]);
            console.log("Merge arrays by appending the elements ")
            } else if (source[key] instanceof Object && target.hasOwnProperty(key) && target[key] instanceof Object) {
            // Recursively merge objects
            merge(target[key], source[key]);
            } else {
            // Add new keys to the target object
            target[key] = source[key];
            }
        }
        }
    };
    
    const targetObj = this.getObjectByPath(json1, path);
    const sourceObj =  this.getObjectByPath(json2, path);
    
    if (targetObj && sourceObj) {
        merge(targetObj, sourceObj);
        console.log("mergeJsonAtPath ")
    }
    
    return json1;
    }

    static mergeProperties(gltfA, gltfB, pattern)
    {   
        let path = pattern.replace('/\\d+', '');
        
        //console.log("merge Property: "+path)
        let objA = this.getObjectAtPath(gltfA, path)
        let objB = this.getObjectAtPath(gltfB, path)
        
        if(objA === undefined && objB=== undefined)
        {
            console.log("both undefined for: "+pattern)
            return
        }       

        
        let merged = undefined
        if(objA === undefined )
        {
            console.log("A undefined for: "+pattern)
            merged = objB
        } 
        else if(objB === undefined )
        {
            console.log("B undefined for: "+pattern)
            merged = objA
        }  
        else
        {
            merged = objA.concat(objB)
        }
        this.setValuetAtPath(gltfA, path, merged) 


    }

    static merge(gltfResident, gltfImport)
    {   
        if(Object.keys(gltfResident).length === 0){
            return gltfImport
        }
        if(Object.keys(gltfImport).length === 0){
            return gltfResident
        }


        console.log("merge glTF")

        let gltfResult = gltfResident

        let propertyArrays = [
            "/accessors/\\d+",
            "/animations/\\d+",
            "/buffers/\\d+",
            "/bufferViews/\\d+",
            "/cameras/\\d+",
            "/images/\\d+",
            "/materials/\\d+",
            "/meshes/\\d+",
            "/nodes/\\d+",
            "/samplers/\\d+",
            "/scenes/\\d+",
            "/skins/\\d+",
            "/textures/\\d+",
            "/extensions/KHR_lights_punctual/lights/\\d+"
        ]

        for (let pattern of propertyArrays) 
        { 
            this.fixReferences(gltfResident, gltfImport, pattern )
        }
        for (let pattern of propertyArrays) 
        { 
            this.mergeProperties(gltfResident, gltfImport, pattern)
        }

        
        gltfResident["scene"] = 1

        console.log("merge result:" );
        console.log(gltfResident );


        return gltfResident
    }
}

export { GltfMerger };
