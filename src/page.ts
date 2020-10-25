import 'reflect-metadata';
import { WebDriver } from 'selenium-webdriver';

export class Page {
  constructor(public driver: WebDriver) {}
}
