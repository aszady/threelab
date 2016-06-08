function MapLoader(maps) {
  this.maps = maps;
}

MapLoader.prototype.load = function(id) {
  return new Map(this.maps[id]);
}
