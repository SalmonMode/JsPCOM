import { Condition, WebDriver } from 'selenium-webdriver';
import { PageComponent } from './component';

export class ComponentManager {
  loaded: Promise<any>;
  get conditions(): Condition<any>[] {
    return [];
  }

  constructor(public driver: WebDriver) {
    this.parseComponents();
    this.loaded = this.wait();
  }

  protected get componentMapping(): { [componentName: string]: typeof PageComponent } {
    return {};
  }

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
