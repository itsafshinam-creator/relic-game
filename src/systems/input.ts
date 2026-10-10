import { GAME_CONFIG } from '../core/config';

export interface InputState {
  moveX: number; // -1 to 1
  moveZ: number; // -1 to 1
  isSprinting: boolean;
  deltaLookX: number;
  deltaLookY: number;
  zoomDelta: number;
}

export type InputActionListener = (action: 'attack' | 'shoot_bow' | 'jump' | 'roll' | 'interact' | 'switch_weapon' | 'toggle_cape' | 'heal') => void;

export class InputController {
  private domElement: HTMLElement;
  private actionListener: InputActionListener | null = null;

  public state: InputState = {
    moveX: 0,
    moveZ: 0,
    isSprinting: false,
    deltaLookX: 0,
    deltaLookY: 0,
    zoomDelta: 0,
  };

  private keys: { [key: string]: boolean } = {};
  private isPointerDown = false;
  private pointerStartX = 0;
  private pointerStartY = 0;
  private prevMouseX = 0;
  private prevMouseY = 0;
  private dragDistance = 0;
  private pointerButton = 0;

  // Virtual mobile touch inputs
  public virtualTouch = {
    x: 0,
    y: 0,
    sprint: false,
  };

  constructor(domElement: HTMLElement, actionListener?: InputActionListener) {
    this.domElement = domElement;
    if (actionListener) this.actionListener = actionListener;
    this.bindEvents();
  }

  public setActionListener(listener: InputActionListener) {
    this.actionListener = listener;
  }

  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.domElement.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    this.domElement.addEventListener('wheel', this.onWheel, { passive: true });
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onKeyDown = (e: KeyboardEvent) => {
    // Ignore when typing inside input or textarea
    if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;

    const key = e.key.toLowerCase();
    this.keys[key] = true;

    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      this.actionListener?.('jump');
    } else if (key === 'f') {
      this.actionListener?.('attack');
    } else if (key === 'q') {
      this.actionListener?.('shoot_bow');
    } else if (key === 'c') {
      this.actionListener?.('roll');
    } else if (key === 'e') {
      this.actionListener?.('interact');
    } else if (key === '1' || key === '2') {
      this.actionListener?.('switch_weapon');
    } else if (key === 'r') {
      this.actionListener?.('toggle_cape');
    } else if (key === 'h') {
      this.actionListener?.('heal');
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keys[key] = false;
  };

  private onMouseDown = (e: MouseEvent) => {
    this.isPointerDown = true;
    this.pointerButton = e.button;
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;
    this.dragDistance = 0;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isPointerDown) return;

    const dx = e.clientX - this.prevMouseX;
    const dy = e.clientY - this.prevMouseY;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;

    this.dragDistance += Math.abs(dx) + Math.abs(dy);

    // Orbit camera sensitivity
    this.state.deltaLookX += dx * GAME_CONFIG.CONTROLS.MOUSE_SENSITIVITY;
    this.state.deltaLookY += dy * GAME_CONFIG.CONTROLS.MOUSE_SENSITIVITY;
  };

  private onMouseUp = (e: MouseEvent) => {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;

    // If mouse was clicked without significant dragging (< 6px), treat as quick action!
    if (this.dragDistance < 6) {
      if (this.pointerButton === 0) {
        // Left click = Primary attack
        this.actionListener?.('attack');
      } else if (this.pointerButton === 2) {
        // Right click = Aim / Shoot bow
        this.actionListener?.('shoot_bow');
      }
    }
  };

  private onWheel = (e: WheelEvent) => {
    this.state.zoomDelta += e.deltaY * 0.003;
  };

  public update(): InputState {
    let rawX = this.virtualTouch.x;
    let rawZ = this.virtualTouch.y;

    if (this.keys['w'] || this.keys['arrowup']) rawZ += 1;
    if (this.keys['s'] || this.keys['arrowdown']) rawZ -= 1;
    if (this.keys['a'] || this.keys['arrowleft']) rawX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) rawX += 1;

    // Normalize diagonal movement vector
    const len = Math.sqrt(rawX * rawX + rawZ * rawZ);
    if (len > 0.001) {
      this.state.moveX = rawX / len;
      this.state.moveZ = rawZ / len;
    } else {
      this.state.moveX = 0;
      this.state.moveZ = 0;
    }

    this.state.isSprinting = !!(this.keys['shift'] || this.virtualTouch.sprint);

    return this.state;
  }

  // Reset deltas after camera consume
  public consumeDeltas(): { lookX: number; lookY: number; zoom: number } {
    const res = {
      lookX: this.state.deltaLookX,
      lookY: this.state.deltaLookY,
      zoom: this.state.zoomDelta,
    };
    this.state.deltaLookX = 0;
    this.state.deltaLookY = 0;
    this.state.zoomDelta = 0;
    return res;
  }

  public destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.domElement.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.domElement.removeEventListener('wheel', this.onWheel);
  }
}
