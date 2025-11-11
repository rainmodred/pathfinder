import type { Grid } from "./Grid";
import type { View } from "./View";

export class Controller {
  private grid: Grid;
  private view: View;

  constructor(grid: Grid, view: View) {
    this.grid = grid;
    this.view = view;

    this.view.onMouseDown(this.handleMouseDown.bind(this));
  }

  render() {
    this.view.drawGrid(this.grid.rows, this.grid.cols);
    this.view.drawNodes(this.grid.nodes);
  }

  handleMouseDown(row: number, col: number) {
    console.log("meow", row, col);
    this.grid.setNode(row, col, "wall");
    this.view.drawNodes(this.grid.nodes);
    console.log(this.grid.getNodeAt(row, col));
  }
}
