import 'reflect-metadata';
import type { WebDriver } from 'selenium-webdriver';
import { ComponentManager } from './componentManager.js';

export class Page extends ComponentManager {
  constructor(public driver: WebDriver, ..._args: unknown[]) {
    super(driver);
  }
}
