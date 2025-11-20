import { useEffect, useRef, useState } from "react";

// Simple perlin noise generator (replace with a real library if you want)
function perlin(x, y) {
  return Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1;
}

export default function IslandPlayground({ width = 600, height = 600 }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function generateIsland() {
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const nx = (x / width) * 2 - 1;
          const ny = (y / height) * 2 - 1;
          const d = Math.sqrt(nx*nx + ny*ny); // distance from center

          // Simple pseudo-Perlin noise
          const e = perlin(nx * 3 * zoom, ny * 3 * zoom);
          const val = (e - d*d) * 255;
          const idx = (y * width + x) * 4;
          const color = Math.max(0, Math.min(255, val));

          if(color < 60){
            data[idx] = 60; data[idx+1]=120; data[idx+2]=200; // water
          } else {
            data[idx] = 34; data[idx+1]=139; data[idx+2]=34; // land
          }
          data[idx+3] = 255; // alpha
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    generateIsland();
  }, [zoom]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ borderRadius: "12px", border: "1px solid #ccc", width: "100%" }}
      />
      <div style={{ marginTop: "12px" }}>
        <label>
          Zoom: {zoom.toFixed(2)}
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
