import 'reflect-metadata';
import { Locator, WebDriver, WebElement } from 'selenium-webdriver';
import { Page } from './page';

export class PageComponent {
  locator: Locator;
  protected _findFromParent: boolean = false;
  protected get _componentMapping(): { [componentName: string]: typeof PageComponent} { return {}};
  constructor(public parent: PageComponent | Page, public driver: WebDriver, ...args: any[]) {
    for (let propertyKey in this._componentMapping) {
      const ComponentClass = this._componentMapping[propertyKey];
      Object.defineProperty(this, propertyKey, {
        get: function() {
          return new ComponentClass(this, this.driver);
        }
      });
    }
  }

  protected async _getReferenceNode(): Promise<WebElement | WebDriver> {
    return this._findFromParent && this.parent instanceof PageComponent ? await this.parent.getElement() : this.driver;
  }

  async getElement(): Promise<WebElement> {
    let refNode = await this._getReferenceNode();
    return refNode.findElement(this.locator);
  }
}

export function Component(...args: any[]) {
  return function <T extends PageComponent>(target: Object, propertyKey: string) {
    var ComponentClass = Reflect.getMetadata('design:type', target, propertyKey);
    Object.defineProperty(target, propertyKey, {
      get: function (): T {
        return new ComponentClass(this, this.driver, ...args);
      },
    });
  };
}
