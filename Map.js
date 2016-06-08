function Map(mapDescription) {
  
  this.data = [];
  this.players = [];
  
  var typeFromChar = function(c)
  {
      if (c == '.' || c == 'p' || c == 'q' || c == 'd' || c == 'b') return 'none';
      else return 'wall';
  }
  var getPlayer = function(x, y, c) {
    var dx = 0;
    var dy = 0;
    if (c == 'q') { dx = 1 }
    if (c == 'p') { dy = 1 }
    if (c == 'b') { dx = -1 }
    if (c == 'd') { dy = -1 }
    if (c == 'p' || c == 'q' || c == 'd' || c == 'b') {
      return {x: x, y: y, dx: dx, dy: dy};
    }
    return null;
  }
  
  for (var y = 0; y< mapDescription.length; y++)
    for (var x = 0; x < mapDescription[y].length; x++)
    {
      var p = getPlayer(x, y, mapDescription[y][x]);
      if (p) this.players.push(p);
      
      this.data.push({x: x, y: y, type: typeFromChar(mapDescription[y][x])})
    }
    
  this.height = mapDescription.length;
  this.width = mapDescription[0].length;
    
  this.collisionChecker = this.checkCollision.bind(this);
  this.escapeChecker = this.checkEscape.bind(this);
}

Map.prototype.getField = function(x, y) {
  for (var i in this.data)
		if (this.data[i].x == x && this.data[i].y == y)
			return this.data[i];
	return {x: x, y: y, type: 'none'};
}

Map.prototype.getPlayers = function() {
  return this.players;
}

Map.prototype.checkCollision = function(x, y) {
  return this.getField(x, y).type == 'none';
}

Map.prototype.checkEscape = function(x, y) {
  return x < 0 || y < 0 || x >= this.width || y >= this.height;
}

Map.prototype.getCollisionChecker = function() {
  return this.collisionChecker;
}

Map.prototype.getEscapeChecker = function() {
  return this.escapeChecker;
}
