export function reconstructPath(start, end, cameFrom: Map<string, string>) {
  let pathLength = 0;
  let key = cameFrom.get(this.end.key);
  while (key && cameFrom.has(key)) {
    const [row, col] = Node.fromKey(key);
    if (row !== this.start.row || col !== this.start.col) {
      this.path.push(new Node(row, col, "path"));
      pathLength++;
    }

    key = cameFrom.get(Node.toKey(row, col));
  }

  this.path.push(this.start);
  return pathLength;
}
