import {
  Canvas,
  mainloop,
  WindowCanvas,
} from "https://deno.land/x/dwm@0.3.3/ext/canvas.ts";

const pixelRatio = 2;

console.log(pixelRatio);

const canvasW = new WindowCanvas({
  title: "Deno Window Manager",
  width: 800,
  height: 600,
  resizable: true,
});
const offscreenCanvas = new Canvas(800, 600);

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
    ctx.strokeStyle = "black";
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
/// On click to the window capture the cursor if its not already captured
addEventListener("click", (evt) => {
  // if (canvasW.window.getInputMode("cursor") === "disabled") {
  //   return;
  // }
  // canvasW.window.setInputMode("cursor", "disabled");
});

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

  drawDebugInfo(ctx);
};
await mainloop(() => {
  canvasW.draw();
});
