import fs from "fs";
import { createCanvas } from "canvas";
import GIFEncoder from "gifencoder";
import { elog } from "../util/logHelper";

const outputPath = "roulette_wheel.gif";
const width = 300;
const height = 300;
// const durationSeconds = 5;
// const numSectors = 4;
const colors = [
  "#e8c320",
  "#3dbf86",
  "#ce394d",
  "#5677e2",
  "#ed6186",
  "#e2824a",
  "#581493",
  "#1aa541",
  "#5280c4",
  "#0061ea",
  "#bc017b",
];

export const saveRotatingCircleGif = (names: string[]) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const gifEncoder = new GIFEncoder(width, height);
  const outputStream = fs.createWriteStream(outputPath);

  gifEncoder.createReadStream().pipe(outputStream);
  gifEncoder.start();
  gifEncoder.setRepeat(-1); // 0 for repeat, -1 for no-repeat
  gifEncoder.setDelay(50); // Delay between frames in milliseconds

  const totalNames = names.length;
  const anglePerSector = (2 * Math.PI) / totalNames;

  const randomizedColors = colors.sort(() => Math.random() - 0.5);

  ctx.clearRect(0, 0, width, height);

  for (let rotation = 10; rotation > 0; rotation--) {
    const framesCount = 10 - rotation;
    for (let frame = 0; frame < framesCount; frame++) {
      // Draw circle sectors with rotation
      const centerX = width / 2;
      const centerY = width / 2;
      const radius = width / 2 - 20; // Leave some margin
      let startAngle =
        -Math.PI / 2 +
        ((frame + 1) / framesCount) * 2 * Math.PI -
        anglePerSector / 2;

      names.forEach((name, index) => {
        const endAngle = startAngle + anglePerSector;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.fillStyle = randomizedColors[index];
        ctx.fill();
        ctx.closePath();

        // Draw text in the middle of the sector
        ctx.beginPath();
        const textX =
          centerX + (radius / 2) * Math.cos(startAngle + anglePerSector / 2);
        const textY =
          centerY + (radius / 2) * Math.sin(startAngle + anglePerSector / 2);
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(name, textX, textY);
        ctx.closePath();

        startAngle = endAngle;
      });

      // Draw triangle pointing downwards
      ctx.fillStyle = "#FFF"; // Triangle color
      ctx.beginPath();
      ctx.moveTo(width / 2 - 10, 10); // Top-left corner
      ctx.lineTo(width / 2 + 10, 10); // Top-right corner
      ctx.lineTo(width / 2, height / 2 - 40); // Bottom-center corner (adjust the height as needed)
      ctx.closePath();
      ctx.fill();

      gifEncoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
    }
  }

  gifEncoder.finish();
  elog(`Animated GIF saved to: ${outputPath}`);
  // outputStream.on('finish', () => {
  //   elog(`Animated GIF saved to: ${outputPath}`);
  // });

  // const gifStream = gifEncoder.createReadStream();
  // return gifStream;

  return outputPath;
};
