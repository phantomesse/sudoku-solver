class Cell {
  private readonly element: Element;
  public number: number;
  public isPredefined: boolean;
  public guesses: number[];
  public readonly x: number;
  public readonly y: number;

  constructor(element: Element, x: number, y: number) {
    this.element = element;
    this.x = x;
    this.y = y;
    this.clear();
  }

  public render() {
    this.element.innerHTML =
      this.number === undefined ? '' : this.number.toString();
    this.element.classList.toggle('predefined', !this.isPredefined);
  }

  public clear() {
    this.number = undefined;
    this.isPredefined = false;
    this.guesses = [];
    this.render();
  }
}
