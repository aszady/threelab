function SceneBuilder() {
}

SceneBuilder.prototype.build = function(map, controls) {
  var scene = new THREE.Scene();
  
  for (var i = 0; i < controls.views.length; ++i)
  {
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.fov = 300;
    
    scene.add(camera);
    controls.views[i].camera = camera;
    
    var spotLight = new THREE.SpotLight(0xffffff, 0.3);
    spotLight.castShadow = true;
    spotLight.shadow.CameraVisible = true;
    spotLight.angle = 0.35
    spotLight.penumbra = 1;
    spotLight.shadow.mapSize.width = 1400;
    spotLight.shadow.mapSize.height = 1400;
    spotLight.shadow.camera.fov = 35;
    scene.add(spotLight);
    
    controls.views[i].spotlight = spotLight;
    
    controls.views[i].updateObjects();
  }
  
  this.createObjects(scene, map);
  
  return scene;
}

SceneBuilder.prototype.createObjects = function(scene, map) {
  this.createGround(scene);
  this.createMapCubes(scene, map);
  
  var ambiColor = "#d0d0d0";
  var ambientLight = new THREE.AmbientLight(ambiColor, 0.7);
  scene.add(ambientLight);
        
  //scene.fog = new THREE.Fog(0, 5, 20);
}

SceneBuilder.prototype.createGround = function(scene) {
  var planeGeometry = new THREE.PlaneGeometry(600, 600, 1, 1);
  var planeMaterial = new THREE.MeshPhongMaterial({color: 0xddffdd, side:THREE.DoubleSide});
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;

  scene.add(plane);
}

SceneBuilder.prototype.createMapCubes = function(scene, map) {
  var cubeGeometry = null;
  for (var fieldId in map.data) {
      var field = map.data[fieldId];
      if (field.type == 'none') continue;
      var localGeometry = new THREE.CubeGeometry(1, 1, 1);
      localGeometry.translate(field.x, field.y, 0.5);
      
      var color = new THREE.Color((field.x % 2) *0.1 + 0.5, (field.y % 2) *0.1 + 0.5, 0.5);
      
      for (var f = 0; f < localGeometry.faces.length; f+=1) {
          localGeometry.faces[f].color.set(color);
      }
      
      if (cubeGeometry)
        cubeGeometry.merge(localGeometry);
      else
        cubeGeometry = localGeometry;
  }
  var cubeMaterial = new THREE.MeshPhongMaterial({vertexColors: THREE.FaceColors});
  var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true;
  
  scene.add(cube);
}
