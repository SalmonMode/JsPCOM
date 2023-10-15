import 'reflect-metadata';
import type { Locator } from 'selenium-webdriver';
import { BaseComponent } from './baseComponent.js';

export class DynamicPageComponent extends BaseComponent {
  get locator(): Locator | null {
    return null;
  }
}
