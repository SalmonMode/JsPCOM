import { use as chaiUse, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { By, WebDriver, type Locator, type WebElementPromise } from 'selenium-webdriver';
import Sinon from 'sinon';
import { Component, DynamicPageComponent, Page } from './index.js';

chaiUse(chaiAsPromised);

class SomeComponent extends DynamicPageComponent {
  get locator(): By {
    return By.id('child');
  }
}

class PageOne extends Page {
  @Component()
  component: SomeComponent;
}

class OtherComponent extends DynamicPageComponent {
}

class PageTwo extends Page {
  @Component()
  component: OtherComponent;
}

describe('Dynamic Component', () => {
  describe('With locator', () => {
    let sandbox: Sinon.SinonSandbox;
    let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
    let page: PageOne;
    before(async () => {
      sandbox = Sinon.createSandbox();
      driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
        findElement: sandbox.stub<[locator: Locator], WebElementPromise>(),
      });
      page = new PageOne(driverStub);
      await page.component.getElement();
    });
    after(() => {
      sandbox.restore();
    });
    it('should call locator and look up element with that locator', async () => {
      expect(driverStub.findElement.callCount).to.equal(1);
      expect(driverStub.findElement.calledWith(By.id('child')));
    });
  });
  describe('Without locator', () => {
    let sandbox: Sinon.SinonSandbox;
    let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
    let page: PageTwo;
    before(async () => {
      sandbox = Sinon.createSandbox();
      driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
        findElement: sandbox.stub<[locator: Locator], WebElementPromise>(),
      });
      page = new PageTwo(driverStub);
    });
    after(() => {
      sandbox.restore();
    });
    it('should call locator and look up element with that locator', async () => {
      await expect(page.component.getElement()).to.eventually.be.rejected;
    });
  });
});
