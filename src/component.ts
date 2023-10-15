import 'reflect-metadata';
import type { Locator} from 'selenium-webdriver';
import { BaseComponent } from './baseComponent.js';

export class PageComponent extends BaseComponent {
  locator: Locator | null = null;
}
