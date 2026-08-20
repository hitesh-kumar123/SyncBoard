import { Board, BoardElement } from "@/types/board";

export function exportBoardAsJson(board: Board) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(board, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${board.title.replace(/\s+/g, "_")}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportCanvasAsPng(stageRef: any, boardTitle: string) {
  if (!stageRef) return;
  const uri = stageRef.toDataURL({ pixelRatio: 2 });
  const link = document.createElement("a");
  link.download = `${boardTitle.replace(/\s+/g, "_")}.png`;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function exportBoardAsSvg(elements: BoardElement[], boardTitle: string) {
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">`;
  svgContent += `<rect width="100%" height="100%" fill="#f9f9ff"/>`;

  elements.forEach((el) => {
    if (el.type === "rectangle") {
      svgContent += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${el.cornerRadius || 0}" fill="${el.fillColor || "transparent"}" stroke="${el.strokeColor || "#0058be"}" stroke-width="${el.strokeWidth || 2}" opacity="${el.opacity ?? 1}" />`;
    } else if (el.type === "circle") {
      svgContent += `<circle cx="${el.x}" cy="${el.y}" r="${el.radius}" fill="${el.fillColor || "transparent"}" stroke="${el.strokeColor || "#ba1a1a"}" stroke-width="${el.strokeWidth || 2}" opacity="${el.opacity ?? 1}" />`;
    } else if (el.type === "pencil") {
      const points = el.points;
      if (points.length >= 4) {
        let d = `M ${points[0]} ${points[1]}`;
        for (let i = 2; i < points.length; i += 2) {
          d += ` L ${points[i]} ${points[i + 1]}`;
        }
        svgContent += `<g transform="translate(${el.x}, ${el.y})"><path d="${d}" fill="none" stroke="${el.strokeColor || "#b75b00"}" stroke-width="${el.strokeWidth || 4}" stroke-linecap="round" stroke-linejoin="round" /></g>`;
      }
    } else if (el.type === "text") {
      svgContent += `<text x="${el.x}" y="${el.y + el.fontSize}" font-family="Inter, sans-serif" font-size="${el.fontSize}" fill="${el.strokeColor || "#151c27"}">${escapeXml(el.text)}</text>`;
    }
  });

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", url);
  downloadAnchor.setAttribute("download", `${boardTitle.replace(/\s+/g, "_")}.svg`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}
