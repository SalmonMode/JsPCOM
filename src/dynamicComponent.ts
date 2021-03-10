import 'reflect-metadata';
import { Locator } from 'selenium-webdriver';
import { BaseComponent } from './baseComponent';

export class DynamicPageComponent extends BaseComponent {
  static get locator(): Locator | null {
    return null;
  }
}
