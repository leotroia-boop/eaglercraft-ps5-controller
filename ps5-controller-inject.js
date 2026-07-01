/**
 * ============================================
 * PS5 DualSense Controller Support for Eaglercraft 1.8
 * Optimized for Minecraft 1.8.8 keybinds
 * Standalone injection script - Add before </body> tag
 * ============================================
 */

(function() {
  'use strict';

  class EaglerPS5ControllerMC18 {
    constructor() {
      this.gamepad = null;
      this.isConnected = false;
      this.deadzone = 0.15;
      this.triggerThreshold = 0.1;
      
      // Minecraft 1.8 Key Mapping
      this.buttonMap = {
        0: { key: 'Space', name: 'Cross (Jump)' },
        1: { key: 'KeyC', name: 'Circle (Sneak)' },
        2: { key: 'KeyE', name: 'Square (Inventory)' },
        3: { key: 'KeyQ', name: 'Triangle (Drop)' },
        4: { key: 'KeyF', name: 'L1 (Sprint)' },
        5: { key: 'KeyR', name: 'R1 (Attack/Mine)' },
        6: { key: 'Key1', name: 'L2 (Alt Use)' },
        7: { key: 'Key2', name: 'R2 (Use Block)' },
        8: { key: 'KeyH', name: 'Share (Help Menu)' },
        9: { key: 'Escape', name: 'Options (Pause)' },
        10: { key: 'KeyL', name: 'L3 (Left Stick Click)' },
        11: { key: 'KeyU', name: 'R3 (Right Stick Click)' },
        12: { key: 'ArrowUp', name: 'D-Pad Up' },
        13: { key: 'ArrowDown', name: 'D-Pad Down' },
        14: { key: 'ArrowLeft', name: 'D-Pad Left' },
        15: { key: 'ArrowRight', name: 'D-Pad Right' },
        17: { key: 'KeyT', name: 'Touchpad (Chat)' },
      };

      this.previousButtonState = {};
      this.previousAxisState = {};
      this.initialize();
    }

    initialize() {
      console.log('🎮 PS5 DualSense Controller initialized for Eaglercraft 1.8');
      
      window.addEventListener('gamepadconnected', (e) => this.onGamepadConnected(e));
      window.addEventListener('gamepaddisconnected', (e) => this.onGamepadDisconnected(e));
      
      this.pollGamepad();
    }

    onGamepadConnected(event) {
      const gamepad = event.gamepad;
      console.log('✅ Controller Connected:', gamepad.id);
      
      if (gamepad.id.includes('DualSense') || gamepad.id.includes('Wireless Controller')) {
        this.gamepad = gamepad;
        this.isConnected = true;
        this.showNotification('🎮 PS5 DualSense Connected!', '#00ff00');
      }
    }

    onGamepadDisconnected(event) {
      console.log('❌ Controller Disconnected');
      this.gamepad = null;
      this.isConnected = false;
      this.showNotification('🎮 PS5 DualSense Disconnected', '#ff0000');
    }

    pollGamepad() {
      if (this.isConnected) {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
          if (gamepads[i] && (gamepads[i].id.includes('DualSense') || gamepads[i].id.includes('Wireless'))) {
            this.gamepad = gamepads[i];
            this.handleInput(gamepads[i]);
            break;
          }
        }
      }
      requestAnimationFrame(() => this.pollGamepad());
    }

    handleInput(gamepad) {
      // Handle all buttons
      for (let i = 0; i < gamepad.buttons.length; i++) {
        const button = gamepad.buttons[i];
        const buttonConfig = this.buttonMap[i];
        
        if (!buttonConfig) continue;

        const wasPressed = this.previousButtonState[i];
        const isPressed = button.pressed;

        if (isPressed && !wasPressed) {
          this.simulateKeyDown(buttonConfig.key);
        } else if (!isPressed && wasPressed) {
          this.simulateKeyUp(buttonConfig.key);
        }

        this.previousButtonState[i] = isPressed;
      }

      // Handle analog sticks
      this.handleLeftStick(gamepad.axes[0], gamepad.axes[1]);
      this.handleRightStick(gamepad.axes[2], gamepad.axes[3]);

      // Handle triggers
      this.handleTriggers(gamepad.buttons[6].value, gamepad.buttons[7].value);
    }

    handleLeftStick(x, y) {
      const xDeadzoned = Math.abs(x) > this.deadzone ? x : 0;
      const yDeadzoned = Math.abs(y) > this.deadzone ? y : 0;

      // Forward/Backward (W/S)
      if (yDeadzoned < -this.deadzone) {
        if (!this.previousAxisState['W']) {
          this.simulateKeyDown('KeyW');
          this.previousAxisState['W'] = true;
        }
      } else if (this.previousAxisState['W']) {
        this.simulateKeyUp('KeyW');
        this.previousAxisState['W'] = false;
      }

      if (yDeadzoned > this.deadzone) {
        if (!this.previousAxisState['S']) {
          this.simulateKeyDown('KeyS');
          this.previousAxisState['S'] = true;
        }
      } else if (this.previousAxisState['S']) {
        this.simulateKeyUp('KeyS');
        this.previousAxisState['S'] = false;
      }

      // Left/Right (A/D)
      if (xDeadzoned < -this.deadzone) {
        if (!this.previousAxisState['A']) {
          this.simulateKeyDown('KeyA');
          this.previousAxisState['A'] = true;
        }
      } else if (this.previousAxisState['A']) {
        this.simulateKeyUp('KeyA');
        this.previousAxisState['A'] = false;
      }

      if (xDeadzoned > this.deadzone) {
        if (!this.previousAxisState['D']) {
          this.simulateKeyDown('KeyD');
          this.previousAxisState['D'] = true;
        }
      } else if (this.previousAxisState['D']) {
        this.simulateKeyUp('KeyD');
        this.previousAxisState['D'] = false;
      }
    }

    handleRightStick(x, y) {
      if (Math.abs(x) > this.deadzone || Math.abs(y) > this.deadzone) {
        const sensitivity = 2;
        const moveEvent = new MouseEvent('mousemove', {
          movementX: x * sensitivity * 50,
          movementY: y * sensitivity * 50,
          bubbles: true,
          cancelable: true,
        });
        
        const canvas = document.querySelector('canvas');
        if (canvas) {
          canvas.dispatchEvent(moveEvent);
        } else {
          document.dispatchEvent(moveEvent);
        }
      }
    }

    handleTriggers(l2Value, r2Value) {
      if (l2Value > this.triggerThreshold) {
        if (!this.previousAxisState['L2']) {
          this.simulateKeyDown('Key1');
          this.previousAxisState['L2'] = true;
        }
      } else if (this.previousAxisState['L2']) {
        this.simulateKeyUp('Key1');
        this.previousAxisState['L2'] = false;
      }

      if (r2Value > this.triggerThreshold) {
        if (!this.previousAxisState['R2']) {
          this.simulateKeyDown('Key2');
          this.previousAxisState['R2'] = true;
        }
      } else if (this.previousAxisState['R2']) {
        this.simulateKeyUp('Key2');
        this.previousAxisState['R2'] = false;
      }
    }

    simulateKeyDown(keyCode) {
      const event = new KeyboardEvent('keydown', {
        code: keyCode,
        key: keyCode,
        keyCode: this.getKeyCode(keyCode),
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    }

    simulateKeyUp(keyCode) {
      const event = new KeyboardEvent('keyup', {
        code: keyCode,
        key: keyCode,
        keyCode: this.getKeyCode(keyCode),
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    }

    getKeyCode(key) {
      const keyCodes = {
        'KeyW': 87, 'KeyA': 65, 'KeyS': 83, 'KeyD': 68,
        'Space': 32, 'KeyE': 69, 'KeyQ': 81, 'KeyF': 70,
        'KeyC': 67, 'KeyH': 72, 'KeyL': 76, 'KeyR': 82,
        'KeyU': 85, 'KeyT': 84, 'KeyP': 80, 'Key1': 49,
        'Key2': 50, 'Tab': 9, 'Escape': 27,
        'ArrowUp': 38, 'ArrowDown': 40, 'ArrowLeft': 37, 'ArrowRight': 39,
      };
      return keyCodes[key] || 0;
    }

    showNotification(message, color = '#00ff00') {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: rgba(0, 0, 0, 0.9);
        color: ${color};
        padding: 15px 25px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        border: 2px solid ${color};
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 0 10px ${color};
      `;
      notification.textContent = message;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    getControllerStatus() {
      return {
        connected: this.isConnected,
        id: this.gamepad?.id || 'None',
        buttons: this.gamepad?.buttons.length || 0,
        axes: this.gamepad?.axes.length || 0,
      };
    }
  }

  // Initialize controller when page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.eaglerPS5Controller = new EaglerPS5ControllerMC18();
      console.log('✅ Eaglercraft 1.8 PS5 Controller Support loaded!');
    });
  } else {
    window.eaglerPS5Controller = new EaglerPS5ControllerMC18();
    console.log('✅ Eaglercraft 1.8 PS5 Controller Support loaded!');
  }
})();
