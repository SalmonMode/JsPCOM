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

  async clear(): Promise<void> {
    const element = await this.getElement()
    return element.clear()
  }
  async click(): Promise<void> {
    const element = await this.getElement()
    return element.click()
  }
  async findElement(locator: Locator): Promise<WebElement> {
    const element = await this.getElement()
    return element.findElement(locator);
  }
  async findElements(locator: Locator): Promise<WebElement[]> {
    const element = await this.getElement();
    return element.findElements(locator);
  }
  async getAttribute(attributeName: string): Promise< string | null > {
    const element = await this.getElement();
    return element.getAttribute(attributeName);
  }
  async getCssValue(cssStyleProperty: string): Promise<string> {
    const element = await this.getElement();
    return element.getCssValue(cssStyleProperty);
  }
  async getId(): Promise<string> {
    const element = await this.getElement();
    return element.getId();
  }
  async getRect(): Promise<{height: number, width: number, x: number, y: number}> {
    const element = await this.getElement();
    return element.getRect();
  }
  async getTagName(): Promise<string> {
    const element = await this.getElement();
    return element.getTagName();
  }
  async getText(): Promise<string> {
    const element = await this.getElement();
    return element.getText();
  }
  async isDisplayed(): Promise<boolean> {
    const element = await this.getElement();
    return element.isDisplayed();
  }
  async isEnabled(): Promise<boolean> {
    const element = await this.getElement();
    return element.isEnabled();
  }
  async isSelected(): Promise<boolean> {
    const element = await this.getElement();
    return element.isSelected();
  }
  async sendKeys(...args: any[]): Promise<void> {
    const element = await this.getElement();
    return element.sendKeys(...args);
  }
  async submit(): Promise<void> {
    const element = await this.getElement();
    return element.submit();
  }
  async takeScreenshot(scroll?: boolean): Promise<string> {
    const element = await this.getElement();
    return element.takeScreenshot(scroll);
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
