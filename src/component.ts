import 'reflect-metadata';
import { Locator, WebDriver, WebElement, error, TargetLocator } from 'selenium-webdriver';
import { ComponentManager } from './componentManager';

export class PageComponent extends ComponentManager {
  stalenessCache: WebElement | null = null;
  locator: Locator;
  static get locator(): Locator | null {
    return null;
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
    const refNode = await this.getReferenceNode();
    const locator = this.locator;
    if (!locator) {
      throw new Error('Component requires a locator to be located');
    }
    return refNode.findElement(locator);
  }

  async isPresent() {
    try {
      await this.getElement();
    } catch (err) {
      if (err instanceof error.NoSuchElementError) {
        return false;
      }
      throw err;
    }
    return true;
  }

  async switchToParentFrame(): Promise<void> {
    const targetLocator = new TargetLocator(this.driver);
    await targetLocator.parentFrame();
  }

  async cacheElementForStalenessCheck(): Promise<void> {
    this.stalenessCache = await this.getElement();
  }

  async cacheHasGoneStale(): Promise<boolean> {
    if (!this.stalenessCache) {
      throw new Error('Element reference must be cached before it can be checked for staleness')
    }
    return await this.isCacheStale();
  }

  private async isCacheStale(): Promise<boolean> {
    try {
      await this.stalenessCache!.getTagName();
    } catch (err) {
      if (err instanceof error.StaleElementReferenceError) {
        return true;
      }
      throw err;
    }
    return false;
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
  return (target: ComponentManager, propertyKey: string) => {
    const ComponentClass = Reflect.getMetadata('design:type', target, propertyKey);
    target.attachComponentAs(propertyKey, ComponentClass, ...args);
  };
}
