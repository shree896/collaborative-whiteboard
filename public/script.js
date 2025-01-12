const socket = io();

const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let erasing = false; // Track eraser mode
let current = {
  color: '#000',
  thickness: 2,
};

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  current.x = e.clientX;
  current.y = e.clientY;
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;

  const x = e.clientX;
  const y = e.clientY;

  const color = erasing ? '#FFFFFF' : current.color; // Use white for eraser
  drawLine(current.x, current.y, x, y, color, current.thickness);
  socket.emit('draw', { x1: current.x, y1: current.y, x2: x, y2: y, color, thickness: current.thickness });

  current.x = x;
  current.y = y;
});

socket.on('draw', (data) => {
  drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.thickness);
});

function drawLine(x1, y1, x2, y2, color, thickness) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.stroke();
}

// Toggle eraser mode
document.getElementById('eraser').addEventListener('click', (e) => {
  erasing = !erasing;
  const eraserButton = e.target;
  eraserButton.classList.toggle('active', erasing); // Highlight button when active
});

// Clear canvas
document.getElementById('clear').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit('clear');
});

// Update color and thickness
document.getElementById('color').addEventListener('change', (e) => {
  current.color = e.target.value;
});

document.getElementById('thickness').addEventListener('input', (e) => {
  current.thickness = e.target.value;
});

// Listen for clear canvas event
socket.on('clear', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
