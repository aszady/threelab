function TransitingProperty(value, time) {
  this.data = value;
  this.previous = value;
  this.transistionTime = time;
  this.finishTransistionAt = new Date().getTime();
  
  Object.defineProperty(this, 'current', {get: this.getCurrent.bind(this)});
  Object.defineProperty(this, 'value', {get: this.getValue.bind(this), set: this.setValue.bind(this)});
}

TransitingProperty.prototype.getCurrent = function() {
  var trFun = function(startValue, progress, delta) {
    return startValue + -progress*(progress-2)*delta;
  }
  
  var progress = (new Date().getTime() - (this.finishTransistionAt - this.transistionTime))
  / this.transistionTime;
  if (progress > 1) return this.data;
  return trFun(this.previous, progress, this.data - this.previous);
}

TransitingProperty.prototype.getValue = function() {
  return this.data;
}

TransitingProperty.prototype.setValue = function(v) {
  if (v == this.data) return;
  this.previous = this.data;
  this.finishTransistionAt = new Date().getTime() + this.transistionTime;
  this.data = v;
}

TransitingProperty.prototype.isTransiting = function() {
  return new Date().getTime() < this.finishTransistionAt;
}

function PlayerControl(data) {
  console.log(data);
  var MOVE_DELAY = 250;
  var ROTATE_DELAY = 200;
  var ZOOM_DELAY = 500;
  
  this.x = new TransitingProperty(data.x, MOVE_DELAY);
  this.y = new TransitingProperty(data.y, MOVE_DELAY);
  this.dx = new TransitingProperty(data.dx, ROTATE_DELAY);
  this.dy = new TransitingProperty(data.dy, ROTATE_DELAY);
  this.viewAngle = new TransitingProperty(Math.atan2(this.dy.value, this.dx.value), ROTATE_DELAY);
  this.zoomOut = new TransitingProperty(0, ZOOM_DELAY);
  
  this.layout = {which: 0, of: 1};
  
  this.spotlight = null;
  this.camera = null;
}

PlayerControl.prototype.updateLayout = function(which, of) {
  this.layout = {which: which, of: of};
}

PlayerControl.prototype.rotate = function(dir) {
  var olddx = this.dx.value;
  var olddy = this.dy.value;
  
  var angle = -Math.PI/2 * dir;
  this.dx.value = olddy * dir;
  this.dy.value = -olddx * dir;
  
  this.viewAngle.value = this.viewAngle.value + angle;
}

PlayerControl.prototype.move = function(forward, side, collisionChecker) {

  var targetX = this.x.value + this.dx.value * forward;
  var targetY = this.y.value + this.dy.value * forward;

  targetX = targetX + this.dy.value * side;
  targetY = targetY - this.dx.value * side;
  
  if (collisionChecker(targetX, targetY)) {
    this.x.value = targetX;
    this.y.value = targetY;
  }
}

PlayerControl.prototype.updateCamera = function() {
  var ZOOM_OUT_SIZE = 10;
  
  this.camera.position.set(
    this.x.current,
    this.y.current,
    0.5 + this.zoomOut.current * ZOOM_OUT_SIZE
  );
  
  this.camera.up = new THREE.Vector3(0, 0, -1);
  this.camera.lookAt(new THREE.Vector3(
    this.x.current + Math.cos(this.viewAngle.current),
    this.y.current + Math.sin(this.viewAngle.current),
    0.5
  ));
}

PlayerControl.prototype.updateLights = function() {  
  this.spotlight.position.set(
    this.x.current + this.dx.current * -5,
    this.y.current + this.dy.current * -5,
    10);
  this.spotlight.target = this.camera;
}

PlayerControl.prototype.updateObjects = function() {
  this.updateCamera();
  this.updateLights();
}

PlayerControl.prototype.updateRenderer = function(renderer, totalWidth, totalHeight) {
  var rows = Math.floor(Math.sqrt(this.layout.of));
  var cols = Math.ceil(this.layout.of / rows);
  var col = this.layout.which % cols;
  var row = Math.floor(this.layout.which / cols);
  
  var left = col/cols * totalWidth;
  var width = 1 / cols * totalWidth - 10;
  var top = row/rows * totalHeight;
  var height = 1 / rows * totalHeight - 10;
  renderer.setViewport(left, top, width, height);
  renderer.setScissor(left, top, width, height);
  renderer.setScissorTest( true );
  
  this.camera.aspect = width/height;
  this.camera.updateProjectionMatrix();
}

PlayerControl.prototype.isMoving = function() {
  return this.x.isTransiting()
      || this.y.isTransiting()
      || this.dx.isTransiting()
      || this.dy.isTransiting()
      || this.viewAngle.isTransiting();
}

PlayerControl.prototype.isTransiting = function() {
  return this.isMoving()
      || this.zoomOut.isTransiting();
}

function PlayerControls(playersDef) {
  this.views = [];
  
  for (var i = 0; i < playersDef.length; ++i)
    this.views.push(new PlayerControl({
      x: playersDef[i].x,
      y: playersDef[i].y,
      dx: playersDef[i].dx,
      dy: playersDef[i].dy,
      left: i/playersDef.length,
      width: 1/playersDef.length
    }));
}

PlayerControls.prototype.isTransiting = function() {
  for (var i = 0; i < this.views.length; ++i)
    if (this.views[i].isTransiting())
      return true;
  return false;
}

PlayerControls.prototype.isMoving = function() {
  for (var i = 0; i < this.views.length; ++i)
    if (this.views[i].isMoving())
      return true;
  return false;
}

PlayerControls.prototype.rotate = function(dir) {
  for (var i = 0; i < this.views.length; ++i)
    this.views[i].rotate(dir);
}

PlayerControls.prototype.move = function(forward, side, collisionChecker) {
  for (var i = 0; i < this.views.length; ++i)
    this.views[i].move(forward, side, collisionChecker);
}

PlayerControls.prototype.allEscaped = function(escapeChecker) {
  for (var i = 0; i < this.views.length; ++i)
    if (!escapeChecker(this.views[i].x.value, this.views[i].y.value))
      return false;
  return true;
}

PlayerControls.prototype.cleanupDuplicateViews = function() {
  var newViews = [];
  for (var i = 0; i < this.views.length; ++i) {
    var dup = false;
    for (var j = 0; j < i; ++j) {
      if (this.views[i].x.value == this.views[j].x.value &&
          this.views[i].y.value == this.views[j].y.value &&
          this.views[i].dx.value == this.views[j].dx.value &&
          this.views[i].dy.value == this.views[j].dy.value) {
        dup = true;
      }
    }
    if (!dup)
      newViews.push(this.views[i]);
  }
  this.views = newViews;
  this.updateLayout();
}

PlayerControls.prototype.updateLayout = function() {  
  for (var i = 0; i < this.views.length; ++i)
    this.views[i].updateLayout(i, this.views.length);
}
