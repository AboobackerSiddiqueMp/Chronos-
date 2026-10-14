/**
 * True Native Always-On-Top Picture-in-Picture Service
 * Stays visible on screen even when user switches tabs or minimizes Chrome.
 */
class PipService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private video: HTMLVideoElement | null = null;
  private animId: number | null = null;
  private isPipActive = false;
  private pipWindow: Window | null = null;

  // Cached display state for renderer
  private displayTime = '00:00:00';
  private modeLabel = 'TIMER';
  private isRunning = false;
  private progressRatio = 0;

  constructor() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 440;
      this.canvas.height = 220;
      this.ctx = this.canvas.getContext('2d');

      this.video = document.createElement('video');
      this.video.muted = true;
      this.video.playsInline = true;
      this.video.autoplay = true;

      // Listen for PiP exit
      this.video.addEventListener('leavepictureinpicture', () => {
        this.isPipActive = false;
        this.stopCanvasLoop();
      });
    }
  }

  public updateState(timeText: string, mode: string, running: boolean, progress = 0) {
    this.displayTime = timeText;
    this.modeLabel = mode.toUpperCase();
    this.isRunning = running;
    this.progressRatio = progress;

    if (this.pipWindow && !this.pipWindow.closed) {
      const pipDoc = this.pipWindow.document;
      const timeElem = pipDoc.getElementById('pip-time');
      const modeElem = pipDoc.getElementById('pip-mode');
      const progressElem = pipDoc.getElementById('pip-progress') as HTMLElement | null;
      if (timeElem) timeElem.textContent = timeText;
      if (modeElem) modeElem.textContent = mode.toUpperCase();
      if (progressElem) progressElem.style.width = `${Math.min(100, Math.max(0, (1 - progress) * 100))}%`;
    }
  }

  private drawCanvas() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);

    // Subtle border
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    // Mode label
    ctx.fillStyle = '#888888';
    ctx.font = '500 13px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`CHRONOS · ${this.modeLabel}`, w / 2, 40);

    // Giant Time Display with tabular digits
    ctx.fillStyle = '#ffffff';
    ctx.font = '400 62px Outfit, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.displayTime, w / 2, 125);

    // Baseline bar
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 140, 145);
    ctx.lineTo(w / 2 + 140, 145);
    ctx.stroke();

    // Progress bar
    const barW = 280;
    const barH = 4;
    const barX = (w - barW) / 2;
    const barY = 175;

    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(barX, barY, barW, barH);

    ctx.fillStyle = this.isRunning ? '#ffffff' : '#666666';
    const fillW = Math.max(0, Math.min(barW, barW * (1 - this.progressRatio)));
    ctx.fillRect(barX, barY, fillW, barH);
  }

  private startCanvasLoop() {
    const render = () => {
      this.drawCanvas();
      this.animId = requestAnimationFrame(render);
    };
    render();
  }

  private stopCanvasLoop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  public async toggleNativePip(onActionCallback?: (action: 'play' | 'pause' | 'reset') => void): Promise<boolean> {
    // 1. Try Document Picture-in-Picture API first (modern Chrome always-on-top window)
    const navWindow = window as unknown as { documentPictureInPicture?: { requestWindow: (options: { width: number; height: number }) => Promise<Window> } };
    if (navWindow.documentPictureInPicture && typeof navWindow.documentPictureInPicture.requestWindow === 'function') {
      try {
        if (this.pipWindow && !this.pipWindow.closed) {
          this.pipWindow.close();
          this.pipWindow = null;
          this.isPipActive = false;
          return false;
        }

        const pipWin = await navWindow.documentPictureInPicture.requestWindow({
          width: 320,
          height: 180,
        });

        this.pipWindow = pipWin;
        this.isPipActive = true;

        pipWin.document.title = 'Chronos Mini';
        pipWin.document.body.style.cssText = 'margin:0;padding:16px;background:#050505;color:#fff;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;box-sizing:border-box;user-select:none;overflow:hidden;';

        pipWin.document.body.innerHTML = `
          <div id="pip-mode" style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#888;margin-bottom:8px;">${this.modeLabel}</div>
          <div id="pip-time" style="font-size:42px;font-weight:300;letter-spacing:-0.02em;font-variant-numeric:tabular-nums;margin-bottom:12px;">${this.displayTime}</div>
          <div style="width:200px;height:3px;background:#222;border-radius:99px;margin-bottom:16px;overflow:hidden;">
            <div id="pip-progress" style="width:${Math.min(100, (1 - this.progressRatio) * 100)}%;height:100%;background:#fff;border-radius:99px;"></div>
          </div>
          <div style="display:flex;gap:8px;">
            <button id="pip-btn-toggle" style="padding:6px 16px;border-radius:99px;background:#fff;color:#000;border:none;font-size:12px;cursor:pointer;font-weight:500;">Toggle</button>
            <button id="pip-btn-reset" style="padding:6px 12px;border-radius:99px;background:#222;color:#fff;border:none;font-size:12px;cursor:pointer;">Reset</button>
          </div>
        `;

        pipWin.document.getElementById('pip-btn-toggle')?.addEventListener('click', () => {
          if (onActionCallback) onActionCallback('play');
        });
        pipWin.document.getElementById('pip-btn-reset')?.addEventListener('click', () => {
          if (onActionCallback) onActionCallback('reset');
        });

        pipWin.addEventListener('pagehide', () => {
          this.pipWindow = null;
          this.isPipActive = false;
        });

        return true;
      } catch (err) {
        console.warn('Document PiP request failed, falling back to Video Canvas PiP', err);
      }
    }

    // 2. Universal Canvas Stream Video Picture-in-Picture
    if (!this.canvas || !this.video) return false;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        this.isPipActive = false;
        this.stopCanvasLoop();
        return false;
      }

      this.startCanvasLoop();
      const stream = this.canvas.captureStream(30);
      this.video.srcObject = stream;
      await this.video.play();
      await this.video.requestPictureInPicture();
      this.isPipActive = true;
      return true;
    } catch (err) {
      console.warn('Native Video PiP error:', err);
      return false;
    }
  }

  public isActive(): boolean {
    return this.isPipActive;
  }
}

export const pipService = new PipService();
