// Small dependency-free SVG chart helpers (line/area + donut via conic-gradient).

function points(values, w, h, pad){
  const min = Math.min(...values); const max = Math.max(...values);
  const range = max === min ? 1 : (max - min);
  const innerH = h - pad*2;
  const step = (w - pad*2) / (values.length - 1 || 1);
  return values.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * innerH;
    return [x, y];
  });
}

export function areaLine(values, { w=600, h=190, pad=8, color='var(--purple)', fill='#eee8ff' } = {}){
  if(!values || !values.length) return '';
  const pts = points(values, w, h, pad);
  const line = 'M' + pts.map(p => p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L');
  const area = line + ` L${(w-pad).toFixed(1)} ${h-pad} L${pad} ${h-pad} Z`;
  const dots = pts.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4"/>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <path d="${area}" fill="${fill}"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="3"/>
    <g fill="#fff" stroke="${color}" stroke-width="2">${dots}</g>
  </svg>`;
}

export function multiLine(series, { w=800, h=220, pad=8, colors=['#6d3df5','#3478f6'] } = {}){
  const all = series.flatMap(s => s.values);
  if(!all.length) return '';
  const ptsList = series.map(s => points(s.values, w, h, pad));
  const lines = ptsList.map((pts, i) =>
    '<path d="' + 'M' + pts.map(p => p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L') + '" fill="none" stroke="' + colors[i%colors.length] + '" stroke-width="2.5"/>'
  ).join('');
  const base = `M0 ${h-pad} L${w} ${h-pad}`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${base}" fill="none" stroke="#e8eaf1"/>${lines}</svg>`;
}

// segments: [{value, color}] — total = sum. Returns conic-gradient background string.
export function donutStyle(segments){
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let acc = 0;
  const stops = segments.map(seg => {
    const start = (acc / total) * 100;
    acc += seg.value;
    const end = (acc / total) * 100;
    return `${seg.color} ${start}% ${end}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}

export function sparkbar(values, max){
  const vmax = max || Math.max(...values) || 1;
  return values.map(v => Math.round((v / vmax) * 100)).join(',');
}
