import 'reflect-metadata';
import { Locator} from 'selenium-webdriver';
import { BaseComponent } from './baseComponent';

export class PageComponent extends BaseComponent {
  locator: Locator | null = null;
}
