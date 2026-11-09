// ---------- the Imugi Labs mark on the main menu, re-drawn as pixel art: the vector mark is traced onto a tiny grid and every
// cell is either fully on or fully off, then shown scaled up with crisp edges ----------
{const D="M0 86.5 L110 0 L251 0 L362 86.5 L251 173 L110 173Z M181.0 17.5 L181.6 21.0 L182.5 25.6 L184.0 32.2 L186.0 39.1 L189.0 46.9 L193.0 54.3 L198.0 60.6 L204.0 65.8 L211.0 70.0 L221.0 74.1 L233.0 77.3 L247.0 79.8 L263.0 81.7 L281.0 83.2 L301.0 84.4 L323.0 85.3 L343.0 86.0 L362.0 86.5 L343.0 87.0 L323.0 87.7 L301.0 88.6 L281.0 89.8 L263.0 91.3 L247.0 93.2 L233.0 95.7 L221.0 98.9 L211.0 103.0 L204.0 107.2 L198.0 112.4 L193.0 118.7 L189.0 126.1 L186.0 133.9 L184.0 140.8 L182.5 147.4 L181.6 152.0 L181.0 155.5 L180.4 152.0 L179.5 147.4 L178.0 140.8 L176.0 133.9 L173.0 126.1 L169.0 118.7 L164.0 112.4 L158.0 107.2 L151.0 103.0 L141.0 98.9 L129.0 95.7 L115.0 93.2 L99.0 91.3 L81.0 89.8 L61.0 88.6 L39.0 87.7 L19.0 87.0 L0.0 86.5 L19.0 86.0 L39.0 85.3 L61.0 84.4 L81.0 83.2 L99.0 81.7 L115.0 79.8 L129.0 77.3 L141.0 74.1 L151.0 70.0 L158.0 65.8 L164.0 60.6 L169.0 54.3 L173.0 46.9 L176.0 39.1 L178.0 32.2 L179.5 25.6 L180.4 21.0Z";
 const W=36,H=17,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 g.scale(W/362,H/173);g.fillStyle='#fff';g.fill(new Path2D(D),'evenodd');
 const im=g.getImageData(0,0,W,H),o=document.createElement('canvas');o.width=W+1;o.height=H+1;const q=o.getContext('2d');
 const on=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&im.data[(y*W+x)*4+3]>80;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(on(x,y)){q.fillStyle='#14181c';q.fillRect(x+1,y+1,1,1)}/* hard drop shadow like the menu type */
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(on(x,y)){q.fillStyle='#f4f1e8';q.fillRect(x,y,1,1)}
 const el=document.getElementById('ilMark');if(el)el.src=o.toDataURL()}
