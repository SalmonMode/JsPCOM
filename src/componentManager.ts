import { Condition, WebDriver } from 'selenium-webdriver';
import { PageComponent } from './component';

export class ComponentManager {
  conditions: Condition<any>[] = [];
  get loaded(): Promise<any> {
    this.parseComponents();
    return this.wait();
  }

  constructor(public driver: WebDriver) {}

  protected componentMapping: { [componentName: string]: typeof PageComponent } = {};

  protected parseComponents() {
    for (let propertyKey in this.componentMapping) {
      const ComponentClass = this.componentMapping[propertyKey];
      this.attachComponentAs(propertyKey, ComponentClass);
    }
  }

  async wait(timeout: number = 10000) {
    await Promise.all(this.conditions.map((condition) => this.driver.wait(condition, timeout)));
  }

  attachComponentAs(propertyKey: string, ComponentClass: typeof PageComponent, ...args: any[]) {
    Object.defineProperty(this, propertyKey, {
      get: function () {
        return new ComponentClass(this, this.driver, ...args);
      },
    });
  }
}
