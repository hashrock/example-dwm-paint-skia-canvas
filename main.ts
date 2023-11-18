import {
  Canvas,
  CanvasRenderingContext2D,
  mainloop,
  WindowCanvas,
} from "https://deno.land/x/dwm@0.3.3/ext/canvas.ts";

const canvasW = new WindowCanvas({
  title: "Deno native paint with dwm",
  width: 800,
  height: 600,
  resizable: true,
});
const offscreenCanvas = new Canvas(800, 600);
const uiLayer = new Canvas(800, 600);

addEventListener("keydown", (evt) => {
  if (evt.code === "Escape") {
    canvasW.window.setInputMode("cursor", "normal");
  }
});

const Cursor = {
  x: 0,
  y: 0,
};

addEventListener("mousemove", (evt) => {
  if (!canvasW.window.focused) {
    evt.preventDefault();
    return;
  }
  Cursor.x = evt.x;
  Cursor.y = evt.y;

  if (offset) {
    const ctx = offscreenCanvas.getContext("2d");
    ctx.strokeStyle = selectedColor;
    ctx.lineCap = "round";

    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(offset.x, offset.y);
    ctx.lineTo(evt.x, evt.y);
    ctx.stroke();

    offset = {
      x: evt.x,
      y: evt.y,
    };
  }
});
addEventListener("click", (evt) => {
  if (!canvasW.window.focused) {
    evt.preventDefault();
    return;
  }

  for (const button of buttons) {
    if (button.isInside(evt.x, evt.y)) {
      selectedColor = button.color;
    }
  }
});

let selectedColor = "black";

interface Point {
  x: number;
  y: number;
}

let offset: Point | null = null;

addEventListener("mousedown", (evt) => {
  offset = {
    x: evt.x,
    y: evt.y,
  };
});

addEventListener("mouseup", () => {
  offset = null;
});

function drawDebugInfo(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(
    `Cursor: ${Cursor.x} ${Cursor.y}`,
    10,
    20,
  );
}

class PalleteButton {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color = "black",
  ) {
    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    this.color = color;
  }

  get active() {
    return selectedColor === this.color;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.active ? "blue" : "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width,
      0,
      Math.PI * 2,
      false,
    );
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  isInside(x: number, y: number) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}

const buttons: PalleteButton[] = [];

function addButtons() {
  const colors = ["black", "red", "green", "blue", "yellow", "pink", "purple"];
  const gap = 6;
  const buttonSize = 16;
  const init = 16;
  for (const color of colors) {
    buttons.push(
      new PalleteButton(
        init + (buttonSize + gap) * buttons.length,
        uiLayer.height - 24,
        8,
        8,
        color,
      ),
    );
  }
}

function drawUiLayer(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, uiLayer.width, uiLayer.height);
  for (const button of buttons) {
    button.draw(ctx);
  }
}

canvasW.onDraw = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "white";
  ctx.fillRect(
    0,
    0,
    canvasW.canvas.width,
    canvasW.canvas.height,
  );

  ctx.drawImage(
    offscreenCanvas,
    0,
    0,
    canvasW.canvas.width,
    canvasW.canvas.height,
  );

  drawUiLayer(uiLayer.getContext("2d"));

  ctx.drawImage(
    uiLayer,
    0,
    0,
    canvasW.canvas.width,
    canvasW.canvas.height,
  );
  drawDebugInfo(ctx);
};

addButtons();
await mainloop(() => {
  canvasW.draw();
});
