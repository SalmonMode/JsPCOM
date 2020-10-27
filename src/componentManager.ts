import { Condition, WebDriver } from 'selenium-webdriver';
import { PageComponent } from './component';

export class ComponentManager {
  _loaded: Promise<any>;
  get _conditions(): Condition<any>[] {
    return [];
  }

  constructor(public driver: WebDriver) {
    this._parseComponents();
    this._loaded = this.wait();
  }

  protected get _componentMapping(): { [componentName: string]: typeof PageComponent } {
    return {};
  }

  protected _parseComponents() {
    for (let propertyKey in this._componentMapping) {
      const ComponentClass = this._componentMapping[propertyKey];
      this._attachComponentAs(propertyKey, ComponentClass);
    }
  }

  async wait(timeout: number = 10000) {
    await Promise.all(this._conditions.map((condition) => this.driver.wait(condition, timeout)));
  }

  _attachComponentAs(propertyKey: string, ComponentClass: typeof PageComponent, ...args: any[]) {
    Object.defineProperty(this, propertyKey, {
      get: function () {
        return new ComponentClass(this, this.driver, ...args);
      },
    });
  }
}
