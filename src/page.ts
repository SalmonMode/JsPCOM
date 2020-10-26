import 'reflect-metadata';
import { WebDriver } from 'selenium-webdriver';
import { PageComponent } from './component';

export class Page {
  protected get _componentMapping(): { [componentName: string]: typeof PageComponent } {
    return {};
  }
  constructor(public driver: WebDriver, ...args: any[]) {
    for (let propertyKey in this._componentMapping) {
      const ComponentClass = this._componentMapping[propertyKey];
      Object.defineProperty(this, propertyKey, {
        get: function() {
          return new ComponentClass(this, this.driver);
        }
      });
    }
  }
}
