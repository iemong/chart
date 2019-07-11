type ChartOption = {
  values: number[];
  maxValue: number;
  words?: string[];
  gradationColors?: string[];
  strokeColor?: string;
  fillColor?: string;
  showScore?: boolean;
};

type Option = {
  canvas: HTMLCanvasElement | null;
  width: number;
  height: number;
  phase?: number;
  lineDistance: number;
  rectDistanceList: number[];
  ruleStrokeColor?: string;
  corners: number;
  bgColor?: string;
  charts: ChartOption[];
};

type DrawingChart = {
  scale: number;
  maxValue: number;
  words: string[];
  showScore: boolean;
};

class Chart {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  centerPos: { x: number; y: number };
  phase: number;
  ruleStrokeColor: string;
  distance: number;
  rectDistanceList: number[];
  bgColor: string;
  corners: number;
  charts: ChartOption[];
  scale: number;

  constructor(option: Option) {
    this.canvas = option.canvas;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = option.width;
    this.canvas.height = option.height;

    // retina対応
    const ratio = window.devicePixelRatio || 1;
    this.canvas.style.width = `${option.width / ratio}px`;
    this.canvas.style.height = `${option.height / ratio}px`;

    this.centerPos = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    };

    this.phase = option.phase || 0;

    // 背景
    this.ruleStrokeColor = option.ruleStrokeColor || "transparent";
    this.distance = option.lineDistance;
    this.rectDistanceList = option.rectDistanceList;
    this.bgColor = option.bgColor || "#fff";
    this.corners = option.corners;
    // chart
    this.charts = option.charts;

    this.scale = 0;
  }

  init() {
    this.ticker();
  }

  drawDivision(array: number[]) {
    array.forEach(d => {
      if (!this.ctx) return;
      this.ctx.beginPath();
      for (let i = 0; i < this.corners; i++) {
        const degreePerCorner = 360 / this.corners;
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
      this.ctx.strokeStyle = this.ruleStrokeColor;
      this.ctx.stroke();
    });
  }

  drawLines() {
    if (!this.ctx) return;
    this.ctx.beginPath();

    for (let i = 0; i < this.corners; i++) {
      const degreePerCorner = 360 / this.corners;
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
    this.ctx.strokeStyle = this.ruleStrokeColor;
    this.ctx.stroke();
  }

  drawFrame(array: number[]) {
    this.drawDivision(array);
    this.drawLines();
  }

  getMarginfromDirection(index: number, array: number[][]) {
    return { x: array[index][0], y: array[index][1] };
  }
  // indexここに書くのやだな
  drawLabel(words: string[], x: number, y: number) {
    return (index: number, color = "#000") => {
      if (!this.ctx) return;
      this.ctx.save();

      this.setFillColor(color);
      this.ctx.font = "26px TsukuGoPro-D";
      this.ctx.textAlign = "center";

      const text = words[index];
      const marginList = [[30, 5], [0, -10], [-30, 5], [0, 25]];
      const margin = this.getMarginfromDirection(index, marginList);
      this.ctx.fillText(text, x + margin.x, y + margin.y);
      this.ctx.restore();
    };
  }

  drawScore(values: number[], x: number, y: number) {
    return (index: number, color = "#000") => {
      if (!this.ctx) return;
      this.ctx.save();

      this.setFillColor(color);
      this.ctx.font = "46px FuturaPT";
      this.ctx.textAlign = "center";

      const text = values[index];
      const marginList = [[30, -25], [0, -40], [-30, -25], [0, 70]];
      const margin = this.getMarginfromDirection(index, marginList);
      this.ctx.fillText(String(text), x + margin.x, y + margin.y);
      this.ctx.restore();
    };
  }

  drawPolygon(values: number[]) {
    return (option: DrawingChart) => {
      if (!this.ctx) return;
      this.ctx.beginPath();
      for (let i = 0; i < values.length; i++) {
        const degreePerCorner = 360 / values.length;
        const x =
          this.centerPos.x +
          option.scale *
            this.distance *
            (values[i] / option.maxValue) *
            Math.cos((Math.PI / 180) * (degreePerCorner * i + this.phase));
        const y =
          this.centerPos.y -
          option.scale *
            this.distance *
            (values[i] / option.maxValue) *
            Math.sin((Math.PI / 180) * (degreePerCorner * i + this.phase));
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
        if (option.words) {
          this.drawLabel(option.words, x, y)(i);
        }
        if (option.showScore) {
          this.drawScore(values, x, y)(i, "#0e73b7");
        }
      }
      this.ctx.closePath();
    };
  }

  setStrokeColor(color: string) {
    if (!this.ctx) return;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  setFillColor(color: string) {
    if (!this.ctx) return;
    this.ctx.fillStyle = color;
  }

  setGradationColors(colors: string[]) {
    if (!this.ctx) return;
    // 真横のグラデーション
    const gradation = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    colors.forEach((color, index) => {
      if (colors.length) {
        const pos = index / colors.length;
        gradation.addColorStop(pos, color);
      }
    });
    this.ctx.fillStyle = gradation;
  }

  drawChart(chart: ChartOption) {
    return (scale: number) => {
      if (!this.ctx) return;
      // 描画には直接関係ない引数をoptionにまとめている
      const option: DrawingChart = {
        scale,
        words: chart.words || [""],
        maxValue: chart.maxValue,
        showScore: chart.showScore || false
      };
      this.ctx.save();
      if (chart.strokeColor) {
        this.drawPolygon(chart.values)(option);
        this.setStrokeColor(chart.strokeColor);
      }
      this.ctx.restore();

      this.ctx.save();
      this.drawPolygon(chart.values)(option);
      this.ctx.clip();

      if (chart.gradationColors && chart.gradationColors.length) {
        this.setGradationColors(chart.gradationColors);
      }
      if (chart.fillColor) {
        this.setFillColor(chart.fillColor);
      }
      if (!this.canvas) return;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    };
  }

  drawCharts(scale: number) {
    if (!(this.charts && this.charts.length)) return;
    this.charts.forEach(chart => {
      this.drawChart(chart)(scale);
    });
  }

  isInRange() {
    return this.scale >= 0 && this.scale <= 1;
  }

  ticker() {
    if (!this.isInRange()) return;
    this.scale += 0.02;
    if (!(this.ctx && this.canvas)) return;
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawFrame(this.rectDistanceList);
    this.drawCharts(this.scale);

    requestAnimationFrame(() => {
      this.ticker();
    });
  }
}

const chart = new Chart({
  canvas: document.querySelector("canvas"),
  width: 800,
  height: 800,
  lineDistance: 200,
  rectDistanceList: [20, 40, 60, 80, 100, 120, 140, 160, 180, 200],
  ruleStrokeColor: "rgba(0, 0, 0, 0.2)",
  corners: 4,
  charts: [
    {
      gradationColors: ["#0e73b7", "#45c1e2", "#94def1"],
      values: [80, 100, 80, 70],
      words: ["力", "素早さ", "特攻", "防御"],
      showScore: true,
      maxValue: 100
    }
  ]
});

chart.init();
