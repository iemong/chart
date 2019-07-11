type Options = {
  canvas: HTMLCanvasElement | null;
  width: number;
  height: number;
  cornerNum: number;
  phase: number;
  lineDistance: number;
  rectDistanceList: number[];
};

class Chart {
  counter: number;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  centerPos: { x: number; y: number };
  cornerNum: number;
  phase: number;
  distance: number;
  rectDistanceList: number[];
  array: number[];

  constructor(option: Options) {
    this.canvas = option.canvas;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = option.width;
    this.canvas.height = option.height;

    this.centerPos = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    };

    this.cornerNum = option.cornerNum;
    this.phase = option.phase;
    this.distance = option.lineDistance;
    this.rectDistanceList = option.rectDistanceList;

    this.array = [];
    this.counter = 0;
  }

  init() {
    for (let i = 0; i < this.cornerNum; i++) {
      this.array.push(Math.floor(Math.random() * 100));
    }

    this.ticker();
  }

  drawFrame(array: number[]) {
    if (!this.ctx) return;
    array.forEach(d => {
      if (!this.ctx) return;
      this.ctx.beginPath();
      for (let i = 0; i < this.cornerNum; i++) {
        const degreePerCorner = 360 / this.cornerNum;
        const x =
          this.centerPos.x +
          d * Math.cos((Math.PI / 180) * (degreePerCorner * i + this.phase));
        const y =
          this.centerPos.y -
          d * Math.sin((Math.PI / 180) * (degreePerCorner * i + this.phase));
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.closePath();
      this.ctx.strokeStyle = "#00ffff";
      this.ctx.stroke();
    });

    this.ctx.beginPath();

    for (let i = 0; i < this.cornerNum; i++) {
      const degreePerCorner = 360 / this.cornerNum;
      const x =
        this.centerPos.x +
        this.distance *
          Math.cos((Math.PI / 180) * (degreePerCorner * i + this.phase));
      const y =
        this.centerPos.y -
        this.distance *
          Math.sin((Math.PI / 180) * (degreePerCorner * i + this.phase));
      this.ctx.moveTo(this.centerPos.x, this.centerPos.y);
      this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.strokeStyle = "#ffff00";
    this.ctx.stroke();
  }

  drawChart(scale: number) {
    if (!this.ctx) return;
    this.ctx.beginPath();
    for (let i = 0; i < this.cornerNum; i++) {
      const degreePerCorner = 360 / this.cornerNum;
      const x =
        this.centerPos.x +
        scale *
          this.array[i] *
          Math.cos((Math.PI / 180) * (degreePerCorner * i + this.phase));
      const y =
        this.centerPos.y -
        scale *
          this.array[i] *
          Math.sin((Math.PI / 180) * (degreePerCorner * i + this.phase));
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
    this.ctx.fill();
  }

  ticker() {
    if (this.counter >= 0 && this.counter <= 1) {
      this.counter += 0.02;
    }
    if (!(this.ctx && this.canvas)) return;
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawFrame(this.rectDistanceList);
    this.drawChart(this.counter);

    requestAnimationFrame(() => {
      this.ticker();
    });
  }
}

const chart = new Chart({
  canvas: document.querySelector("canvas"),
  width: 400,
  height: 400,
  cornerNum: 4,
  phase: 0,
  lineDistance: 100,
  rectDistanceList: [50, 100]
});

chart.init();
