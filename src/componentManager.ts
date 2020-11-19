import { Condition, WebDriver } from 'selenium-webdriver';
import { PageComponent } from './component';

export class ComponentManager {
  conditions: Condition<any>[];

  protected componentMapping: { [componentName: string]: typeof PageComponent };

  private componentsParsed: boolean = false;

  get loaded(): Promise<any> {
    if (!this.componentsParsed){
      this.parseComponents();
  }
    return this.wait();
  }

  constructor(public driver: WebDriver) {
    if (!this.conditions) {
      this.conditions = [];
    }
    if (!this.componentMapping) {
      this.componentMapping = {};
    }
  }

  protected parseComponents() {
    for (const propertyKey of Object.keys(this.componentMapping)) {
      const ComponentClass = this.componentMapping[propertyKey];
      this.attachComponentAs(propertyKey, ComponentClass);
    }
    this.componentsParsed = true;
  }

  async wait(timeout: number = 10000) {
    return await Promise.all(this.conditions.map((condition) => this.driver.wait(condition, timeout)));
  }

  attachComponentAs(propertyKey: string, ComponentClass: typeof PageComponent, ...args: any[]) {
    const newComp = new ComponentClass(this, this.driver, ...args);
    newComp.parseComponents();
    Object.defineProperty(this, propertyKey, {
      get() {
        return newComp;
      },
    });
  }
}
