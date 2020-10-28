import 'reflect-metadata';
import { By, Locator, WebDriver, WebElement } from 'selenium-webdriver';
import { ComponentManager } from './componentManager';

export class PageComponent extends ComponentManager {
  get locator(): Locator {
    return By.xpath('/');
  }
  get findFromParent(): boolean {
    return false;
  }
  constructor(public parent: ComponentManager, public driver: WebDriver, ...args: any[]) {
    super(driver);
  }

  protected async getReferenceNode(): Promise<WebElement | WebDriver> {
    if (this.findFromParent && this.parent instanceof PageComponent) {
      return await this.parent.getElement();
    }
    return this.driver;
  }

  async getElement(): Promise<WebElement> {
    let refNode = await this.getReferenceNode();
    return refNode.findElement(this.locator);
  }

  async clear(): Promise<void> {
    const element = await this.getElement();
    return element.clear();
  }
  async click(): Promise<void> {
    const element = await this.getElement();
    return element.click();
  }
  async findElement(locator: Locator): Promise<WebElement> {
    const element = await this.getElement();
    return element.findElement(locator);
  }
  async findElements(locator: Locator): Promise<WebElement[]> {
    const element = await this.getElement();
    return element.findElements(locator);
  }
  async getAttribute(attributeName: string): Promise<string | null> {
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
  async getRect(): Promise<{ height: number; width: number; x: number; y: number }> {
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
  return function (target: ComponentManager, propertyKey: string) {
    var ComponentClass = Reflect.getMetadata('design:type', target, propertyKey);
    target.attachComponentAs(propertyKey, ComponentClass, ...args);
  };
}
