import 'reflect-metadata';
import { error } from 'selenium-webdriver';
import { PageComponent } from './baseComponent';

export class IframePageComponent extends PageComponent {
  async switchTo(): Promise<void> {
    await this.driver.switchTo().frame(await this.getElement());
  }

  async ableToSwitchToFrame(): Promise<boolean> {
    try {
      await this.switchTo();
    } catch (err) {
      if (!(err instanceof error.NoSuchFrameError)) {
        throw err;
      }
      return false;
    }
    await this.switchToParentFrame();
    return true;
  }

  async iFrameIsReady(): Promise<boolean> {
    if (!(await this.isPresent())) {
      return false;
    }
    if (!(await this.ableToSwitchToFrame())) {
      return false;
    }
    return true;
  }
}
