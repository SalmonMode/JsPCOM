import type { WebDriver } from 'selenium-webdriver';
import type { BaseComponent } from './baseComponent.js';
import type { PageComponent } from './component.js';
import type { DynamicPageComponent } from './dynamicComponent.js';

export type ComponentCondition = () => boolean | Promise<boolean>;

type ComponentClass = typeof PageComponent | typeof DynamicPageComponent;

export class ComponentManager {
  timeout: number = 10000;
  /**The number of milliseconds between attempts at checking conditions */
  pollRate: number = 100;

  get conditions(): ComponentCondition[] {
    return [];
  }

  protected componentMapping: { [componentName: string]: ComponentClass};

  private componentsParsed: boolean = false;

  get loaded(): Promise<boolean> {
    if (!this.componentsParsed) {
      this.parseComponents();
    }
    return this.wait();
  }

  constructor(public driver: WebDriver) {
    if (!this.componentMapping) {
      this.componentMapping = {};
    }
  }

  parseComponents(): void {
    /* c8 ignore start */
    // Ignoring this coverage as this is purely javascript implementation
    for (const propertyKey of Object.keys(this.componentMapping)) {
      const CompClass = this.componentMapping[propertyKey];
      this.attachComponentAs(propertyKey, CompClass);
    }
    /* c8 ignore stop */
    this.componentsParsed = true;
  }

  async wait(): Promise<boolean> {
    const start = Date.now();
    const deadline = start + this.timeout;
    await Promise.all(
      this.conditions.map((condition: ComponentCondition) => this.waitForOneCondition(condition, deadline)),
    );
    return true;
  }

  private async waitForOneCondition(condition: ComponentCondition, deadline: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const pollCondition = async (): Promise<void> => {
        try {
          const now = Date.now();
          if (now >= deadline) {
            return reject(new Error('Unable to complete condition by the deadline'));
          }
          const conditionSucceeded: boolean = await condition();
          if (conditionSucceeded) {
            return resolve();
          }
          setTimeout(pollCondition, this.pollRate);
        } catch (err) {
          return reject(err);
        }
      };
      pollCondition();
    });
  }

  attachComponentAs(propertyKey: string, CompClass: typeof PageComponent | typeof DynamicPageComponent, ...args: unknown[]): void {
    let newComp: BaseComponent;
    Object.defineProperty(this, propertyKey, {
      get() {
        if (!newComp) {
          newComp = new CompClass(this, this.driver, ...args);
          newComp.parseComponents();
        }
        return newComp;
      },
    });
  }
}
