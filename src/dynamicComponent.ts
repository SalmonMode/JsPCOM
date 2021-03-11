import 'reflect-metadata';
import { Locator } from 'selenium-webdriver';
import { BaseComponent } from './baseComponent';

export class DynamicPageComponent extends BaseComponent {
  get locator(): Locator | null {
    return null;
  }
}
