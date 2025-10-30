export class Table {
  private table: HTMLTableElement;

  constructor(el: HTMLTableElement, headers: string[]) {
    this.table = el;

    const thead = document.createElement("thead");
    const tr = document.createElement("tr");

    for (const header of headers) {
      const th = document.createElement("th");
      th.textContent = header;
      tr.appendChild(th);
    }

    thead.appendChild(tr);
    this.table.appendChild(thead);
  }

  addRow(data: string[]) {
    const row = document.createElement("tr");

    for (const value of data) {
      const td = document.createElement("td");
      td.textContent = value;
      row.appendChild(td);
    }

    this.table.appendChild(row);
    row.scrollIntoView(false);
  }
}
