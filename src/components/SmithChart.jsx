import React from 'react';

const COLORS = {
  yellow: '#ffeaa7',
  pink: '#fab1a0',
  blue: '#74b9ff',
  green: '#55efc4',
  purple: '#a29bfe',
  orange: '#feca57'
};

export default function SmithChartComponent({ width = 720, height = 720, stroke_width=0.003, scale=1.0, config = {} }) {
  const viewSize = 2.4;
  const half = viewSize / 2;
  const viewBox = `${-half} ${-half} ${viewSize} ${viewSize}`;

  /* ---------------------------
     Utility: polar → Γ plane
  --------------------------- */
  function polToGamma(r, angleDeg) {
    const a = angleDeg * Math.PI / 180;
    return { re: r * Math.cos(a), im: r * Math.sin(a) };
  }

  /* ---------------------------
     Utility: constant reactance curve (clipped)
     X = reactance value (positive or negative)
     returns SVG path "d"
  --------------------------- */
  function reactanceArc(X) {
    const cx = 1;
    const cy = 1 / X;
    const r = Math.abs(1 / X);

    const pts = [];
    for (let t = 0; t <= Math.PI * 2; t += 0.002) {
      const x = cx + r * Math.cos(t);
      const y = cy + r * Math.sin(t);

      // Accept only points inside the unit circle
      if (x * x + y * y <= 1 + 1e-6) pts.push([x, y]);
    }

    if (pts.length === 0) return "";

    const [x0, y0] = pts[0];
    let d = `M ${x0} ${y0}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i][0]} ${pts[i][1]}`;
    }
    return d;
  }

  /* ---------------------------
     Render user shapes
  --------------------------- */
  function renderPoint(pt, key) {
    let g = pt;
    if (pt.type === 'g') g = polToGamma(pt.r, pt.angle);
    const color = COLORS[pt.color] || pt.color || COLORS.blue;
    const size = pt.size ?? 0.025;
    const sw = pt.stroke_width ?? 0.01;
    return (
      <circle
        key={key}
        cx={g.re}
        cy={g.im}
        r={size}
        fill={color}    
        strokeWidth={sw}
      />
    );
  }

  function renderCircle(c, key) {
    let g = c;
    if (c.type === 'g') g = polToGamma(c.r, c.angle);
    const color = COLORS[c.color] || c.color || COLORS.green;
    const sw = c.stroke_width ?? 0.008;
    return (
      <circle
        key={key}
        cx={g.re}
        cy={g.im}
        r={c.radius}
        fill="none"
        stroke={color}
        strokeWidth={sw}
      />
    );
  }

  function renderStub(s, key) {
    const d = s.points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');
    const color = COLORS[s.color] || s.color || COLORS.purple;
    const sw = s.stroke_width ? s.stroke_width * 0.01 : 0.01;
    return (
      <path
        key={key}
        d={d}
        stroke={color}
        strokeWidth={sw}
        fill="none"
        strokeLinecap="round"
      />
    );
  }

  const points = config.points || [];
  const circles = config.circles || [];
  const stubs = config.stubs || [];

  return (
    <div
        style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        }}
    >
        <svg viewBox={viewBox} width={width} height={height}>
        <g transform={`scale(${scale},-${scale})`}>

            {/* --- OUTER UNIT CIRCLE --- */}
            <circle cx={0} cy={0} r={1} stroke="#555" strokeWidth={stroke_width} fill="none" />

            {/* --- CONSTANT RESISTANCE CIRCLES --- */}
            {([0, 0.2, 0.5, 1, 2, 5]).map((r, i) => {
            const center = r / (1 + r);
            const rad = 1 / (1 + r);
            return (
                <circle
                key={`rgrid-${i}`}
                cx={center}
                cy={0}
                r={rad}
                fill="none"
                stroke="#333"
                strokeWidth={stroke_width}
                />
            );
            })}

            {/* --- CONSTANT REACTANCE ARCS (clipped) --- */}
            {([0.2, 0.5, 1, 2, 5]).flatMap((x, i) => {
            const dPlus = reactanceArc(x);
            const dMinus = reactanceArc(-x);
            return [
                <path key={`x+${i}`} d={dPlus} stroke="#333" strokeWidth={stroke_width} fill="none" />,
                <path key={`x-${i}`} d={dMinus} stroke="#333" strokeWidth={stroke_width} fill="none" />
            ];
            })}

            {/* horizontal axis */}
            <line x1={-1.0} y1={0} x2={1.0} y2={0} stroke="#444" strokeWidth={stroke_width} />

            {/* redraw boundary */}
            <circle cx={0} cy={0} r={1} stroke="#777" strokeWidth={stroke_width} fill="none" />

            {/* --- USER GEOMETRY --- */}
            {points.map((p, i) => renderPoint(p, `pt-${i}`))}
            {circles.map((c, i) => renderCircle(c, `circ-${i}`))}
            {stubs.map((s, i) => renderStub(s, `stub-${i}`))}

        </g>
        </svg>
    </div>
  );
}
