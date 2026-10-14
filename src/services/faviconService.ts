/**
 * Dynamic Favicon Service
 * Renders an animated circular progress ring and countdown indicator in the browser tab favicon.
 */
class FaviconService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private faviconLink: HTMLLinkElement | null = null;
  private defaultFaviconUrl: string | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 32;
      this.canvas.height = 32;
      this.ctx = this.canvas.getContext('2d');

      this.faviconLink = document.querySelector("link[rel*='icon']");
      if (!this.faviconLink) {
        this.faviconLink = document.createElement('link');
        this.faviconLink.rel = 'icon';
        document.head.appendChild(this.faviconLink);
      } else {
        this.defaultFaviconUrl = this.faviconLink.href;
      }
    }
  }

  public update(remainingSeconds: number, totalSeconds: number, isRunning: boolean) {
    if (!this.ctx || !this.canvas || !this.faviconLink) return;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, 32, 32);

    // Dark circle background
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, Math.PI * 2);
    ctx.fill();

    // Progress circle
    const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
    const remainingRatio = Math.max(0, Math.min(1, 1 - progress));

    // Outer track
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(16, 16, 13, 0, Math.PI * 2);
    ctx.stroke();

    // Progress arc
    ctx.strokeStyle = isRunning ? '#ffffff' : '#737373';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(16, 16, 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remainingRatio);
    ctx.stroke();

    // Center indicator (minutes or dot)
    ctx.fillStyle = '#ffffff';
    const minutesLeft = Math.ceil(remainingSeconds / 60);
    if (minutesLeft > 0 && minutesLeft < 100) {
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(minutesLeft.toString(), 16, 16);
    } else {
      ctx.beginPath();
      ctx.arc(16, 16, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    this.faviconLink.href = this.canvas.toDataURL('image/png');
  }

  public reset() {
    if (this.faviconLink && this.defaultFaviconUrl) {
      this.faviconLink.href = this.defaultFaviconUrl;
    }
  }
}

export const faviconService = new FaviconService();
