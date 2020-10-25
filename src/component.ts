import 'reflect-metadata';
import { Locator, WebDriver, WebElement } from 'selenium-webdriver';
import { Page } from './page';

export class PageComponent {
  locator: Locator;
  protected _findFromParent: boolean = false;
  constructor(public parent: PageComponent | Page, public driver: WebDriver) {}

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
