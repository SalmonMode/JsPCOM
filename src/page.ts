import 'reflect-metadata';
import { WebDriver } from 'selenium-webdriver';
import { ComponentManager } from './componentManager';

export class Page extends ComponentManager {
  constructor(public driver: WebDriver, ...args: any[]) {
    super(driver);
  }
}
