import { Condition, WebDriver } from 'selenium-webdriver';
import { PageComponent } from './component';
import { DynamicPageComponent } from './dynamicComponent';

export type ComponentCondition = Condition<any> | (() => Promise<any>);

type ComponentClass = typeof PageComponent | typeof DynamicPageComponent;

export class ComponentManager {
  get conditions(): ComponentCondition[] {
    return [];
  }

  protected componentMapping: { [componentName: string]: ComponentClass };

  private componentsParsed: boolean = false;

  get loaded(): Promise<any> {
    if (!this.componentsParsed){
      this.parseComponents();
  }
    return this.wait();
  }

  constructor(public driver: WebDriver) {
    if (!this.componentMapping) {
      this.componentMapping = {};
    }
  }

  parseComponents() {
    for (const propertyKey of Object.keys(this.componentMapping)) {
      const CompClass = this.componentMapping[propertyKey];
      this.attachComponentAs(propertyKey, CompClass);
    }
    this.componentsParsed = true;
  }

  async wait(timeout: number = 10000) {
    return await Promise.all(this.conditions.map((condition: ComponentCondition) => this.driver.wait(condition, timeout)));
  }

  attachComponentAs(propertyKey: string, ComponentClass: ComponentClass, ...args: any[]): void {
    const newComp = new ComponentClass(this, this.driver, ...args);
    newComp.parseComponents();
    Object.defineProperty(this, propertyKey, {
      get() {
        return newComp;
      },
    });
  }
}
