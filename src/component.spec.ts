import { use as chaiUse, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { assertHasProperty, assertIsObject } from 'primitive-predicates';
import type {
  TargetLocator} from 'selenium-webdriver';
import {
  By,
  WebDriver,
  WebElement,
  error,
  type IRectangle,
  type Locator,
  type WebElementPromise,
} from 'selenium-webdriver';
import type { ShadowRootPromise } from 'selenium-webdriver/lib/webdriver.js';
import Sinon from 'sinon';
import { Component, IframePageComponent, Page, PageComponent } from './index.js';

chaiUse(chaiAsPromised);

// Needed because the conflicts between @types/selenium-webdriver and selenium-webdriver prevent the import of the
// actual one.
class TargetLocatorPlaceholder {
  constructor() {}
  parentFrame(): void {
    return;
  }
}

describe('TargetLocatorPlaceholder', () => {
  it('returns nothing when parentFrame method is called', () => {
    const locator = new TargetLocatorPlaceholder();
    expect(locator.parentFrame()).to.equal(undefined);
  });
});

class ChildComponent extends PageComponent {
  locator = By.id('child');
  findFromParent: boolean = true;
}

export class ParentComponent extends PageComponent {
  locator = By.id('parent');

  @Component()
  childComponent: ChildComponent;
}

class PageOne extends Page {
  @Component()
  component: ParentComponent;
}

class PageTwo extends Page {
  @Component()
  component: ParentComponent;
}

class PageThree extends Page {
  @Component()
  component: ParentComponent;
}

class PageFour extends Page {
  @Component()
  component: ParentComponent;
}

class PageFive extends Page {
  @Component()
  component: ParentComponent;
}

class PageSix extends Page {
  @Component()
  component: ParentComponent;
}

class PageSeven extends Page {
  @Component()
  component: ParentComponent;
}

class PageEight extends Page {
  @Component()
  component: ParentComponent;
}

class PageNine extends Page {
  @Component()
  component: ParentComponent;
}

class PageTen extends Page {
  @Component()
  component: ParentComponent;
}

class PageEleven extends Page {
  @Component()
  component: ParentComponent;
}

class OtherComponent extends PageComponent {
  locator = By.id('child');
}

class PageTwelve extends Page {
  @Component()
  component: OtherComponent;

  get conditions(): (() => Promise<boolean>)[] {
    return [
      async (): Promise<boolean> => {
        return await this.component.isDisplayed();
      },
      async (): Promise<boolean> => {
        return await this.component.isPresent();
      },
    ];
  }
}

class PageThirteen extends Page {
  @Component()
  component: OtherComponent;
}

class PageFourteen extends Page {
  timeout = 100;
  @Component()
  component: OtherComponent;

  get conditions(): (() => Promise<boolean>)[] {
    return [
      async (): Promise<boolean> => {
        return await this.component.isDisplayed();
      },
      async (): Promise<boolean> => {
        return await this.component.isPresent();
      },
    ];
  }
}

class PageFifteen extends Page {
  @Component()
  component: OtherComponent;

  get conditions(): (() => Promise<boolean>)[] {
    return [
      async (): Promise<boolean> => {
        return await this.component.isDisplayed();
      },
      async (): Promise<boolean> => {
        return await this.component.isPresent();
      },
    ];
  }
}


class IFComponent extends IframePageComponent {
  locator = By.id('child');
}

class PageSixteen extends Page {
  @Component()
  component: IFComponent;
}

class PageSeventeen extends Page {
  @Component()
  component: IFComponent;
}

class PageEighteen extends Page {
  @Component()
  component: IFComponent;
}

class PageNineteen extends Page {
  @Component()
  component: IFComponent;
}

class PageTwenty extends Page {
  @Component()
  component: IFComponent;
}

describe('Component', () => {
  describe('findFromParent', async () => {
    let sandbox: Sinon.SinonSandbox;
    let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
    let parentElementStub: Sinon.SinonStubbedInstance<WebElement>;
    let childElementStub: Sinon.SinonStubbedInstance<WebElement>;
    let page: PageOne;
    let result: WebElement;
    before(async () => {
      sandbox = Sinon.createSandbox();
      childElementStub = sandbox.createStubInstance<WebElement>(WebElement);
      parentElementStub = sandbox.createStubInstance<WebElement>(WebElement, {
        findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(childElementStub),
      });
      driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
        findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(parentElementStub),
      });
      page = new PageOne(driverStub);
      result = await page.component.childComponent.getElement();
    });
    after(() => {
      sandbox.restore();
    });
    it('tries to find only 1 element through the driver directly', async () => {
      expect(driverStub.findElement.callCount).to.equal(1);
    });
    it('uses the parent component as the refNode to find the child component', async () => {
      expect(result).to.equal(childElementStub);
    });
  });
  describe('locator', async () => {
    let sandbox: Sinon.SinonSandbox;
    let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
    let page: PageTwo;
    before(async () => {
      sandbox = Sinon.createSandbox();
      driverStub = sandbox.createStubInstance<WebDriver>(WebDriver);
      page = new PageTwo(driverStub);
      const component: unknown = page.component;
      assertIsObject(component);
      assertHasProperty(component, 'locator');
      delete component.locator;
    });
    after(() => {
      sandbox.restore();
    });
    it('throws an error if there is no locator', async () => {
      await expect(page.component.getElement()).to.eventually.be.rejectedWith(Error);
    });
  });
  describe('isPresent', async () => {
    describe('Actually Present', async () => {
      let sandbox: Sinon.SinonSandbox;
      let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
      let page: PageThree;
      before(async () => {
        sandbox = Sinon.createSandbox();
        driverStub = sandbox.createStubInstance<WebDriver>(WebDriver);
        page = new PageThree(driverStub);
      });
      after(() => {
        sandbox.restore();
      });
      it('returns true', async () => {
        expect(await page.component.isPresent()).to.be.true;
      });
    });
    describe('Not Present', async () => {
      let sandbox: Sinon.SinonSandbox;
      let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
      let page: PageFour;
      before(async () => {
        sandbox = Sinon.createSandbox();
        driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
          findElement: sandbox.stub<[locator: Locator], WebElementPromise>().throws(new error.NoSuchElementError()),
        });
        page = new PageFour(driverStub);
      });
      after(() => {
        sandbox.restore();
      });
      it('returns false', async () => {
        expect(await page.component.isPresent()).to.be.false;
      });
    });
    describe('Unrecognized Error', async () => {
      let sandbox: Sinon.SinonSandbox;
      let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
      let page: PageFive;
      let err: Error;
      before(async () => {
        err = new Error('unknown');
        sandbox = Sinon.createSandbox();
        driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
          findElement: sandbox.stub<[locator: Locator], WebElementPromise>().throws(err),
        });
        page = new PageFive(driverStub);
      });
      after(() => {
        sandbox.restore();
      });
      it('should throw error', async () => {
        await expect(page.component.isPresent()).to.eventually.be.rejectedWith(err);
      });
    });
  });
  describe('Method Proxies', () => {
    let sandbox: Sinon.SinonSandbox;
    let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
    let parentElementStub: Sinon.SinonStubbedInstance<WebElement>;
    let page: PageSix;
    before(() => {
      sandbox = Sinon.createSandbox();
      parentElementStub = sandbox.createStubInstance<WebElement>(WebElement, {
        clear: sandbox.stub<[], Promise<void>>(),
        click: sandbox.stub<[], Promise<void>>(),
        getAttribute: sandbox.stub<[attributeName: string], Promise<string>>(),
        getCssValue: sandbox.stub<[cssStyleProperty: string], Promise<string>>(),
        getId: sandbox.stub<[], Promise<string>>(),
        getRect: sandbox.stub<[], Promise<IRectangle>>(),
        getTagName: sandbox.stub<[], Promise<string>>(),
        getText: sandbox.stub<[], Promise<string>>(),
        findElement: sandbox.stub<[locator: Locator], WebElementPromise>(),
        findElements: sandbox.stub<[locator: Locator], Promise<WebElement[]>>(),
        isDisplayed: sandbox.stub<[], Promise<boolean>>(),
        isEnabled: sandbox.stub<[], Promise<boolean>>(),
        isSelected: sandbox.stub<[], Promise<boolean>>(),
        sendKeys: sandbox.stub<(string | number | Promise<string | number>)[], Promise<void>>(),
        submit: sandbox.stub<[], Promise<void>>(),
        takeScreenshot: sandbox.stub<[opt_scroll?: boolean | undefined], Promise<string>>(),
        getShadowRoot: sandbox.stub<[], ShadowRootPromise>(),
      });
      driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
        findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(parentElementStub),
      });
      page = new PageSix(driverStub);
    });
    after(() => {
      sandbox.restore();
    });
    it('proxies clear', async () => {
      await page.component.clear();
      expect(driverStub.findElement.callCount).to.equal(1);
      expect(parentElementStub.clear.callCount).to.equal(1);
    });

    it('proxies click', async () => {
      await page.component.click();
      expect(parentElementStub.click.callCount).to.equal(1);
    });
    it('proxies findElement', async () => {
      const locator = By.id('test');
      await page.component.findElement(locator);
      expect(parentElementStub.findElement.callCount).to.equal(1);
      expect(parentElementStub.findElement.calledWithExactly(locator)).to.be.true;
    });
    it('proxies findElements', async () => {
      const locator = By.id('test');
      await page.component.findElements(locator);
      expect(parentElementStub.findElements.callCount).to.equal(1);
      expect(parentElementStub.findElements.calledWithExactly(locator)).to.be.true;
    });
    it('proxies getAttribute', async () => {
      await page.component.getAttribute('test');
      expect(parentElementStub.getAttribute.callCount).to.equal(1);
      expect(parentElementStub.getAttribute.calledWithExactly('test')).to.be.true;
    });
    it('proxies getCssValue', async () => {
      await page.component.getCssValue('test');
      expect(parentElementStub.getCssValue.callCount).to.equal(1);
      expect(parentElementStub.getCssValue.calledWithExactly('test')).to.be.true;
    });
    it('proxies getId', async () => {
      await page.component.getId();
      expect(parentElementStub.getId.callCount).to.equal(1);
    });
    it('proxies getRect', async () => {
      await page.component.getRect();
      expect(parentElementStub.getRect.callCount).to.equal(1);
    });
    it('proxies getTagName', async () => {
      await page.component.getTagName();
      expect(parentElementStub.getTagName.callCount).to.equal(1);
    });
    it('proxies getText', async () => {
      await page.component.getText();
      expect(parentElementStub.getText.callCount).to.equal(1);
    });
    it('proxies isDisplayed', async () => {
      await page.component.isDisplayed();
      expect(parentElementStub.isDisplayed.callCount).to.equal(1);
    });
    it('proxies isEnabled', async () => {
      await page.component.isEnabled();
      expect(parentElementStub.isEnabled.callCount).to.equal(1);
    });
    it('proxies isSelected', async () => {
      await page.component.isSelected();
      expect(parentElementStub.isSelected.callCount).to.equal(1);
    });
    it('proxies sendKeys', async () => {
      await page.component.sendKeys();
      expect(parentElementStub.sendKeys.callCount).to.equal(1);
    });
    it('proxies submit', async () => {
      await page.component.submit();
      expect(parentElementStub.submit.callCount).to.equal(1);
    });
    it('proxies takeScreenshot', async () => {
      await page.component.takeScreenshot();
      expect(parentElementStub.takeScreenshot.callCount).to.equal(1);
    });
    it('proxies getShadowRoot', async () => {
      await page.component.getShadowRoot();
      expect(parentElementStub.getShadowRoot.callCount).to.equal(1);
    });
  });
  describe('Switching to parent frame context', async () => {
    let sandbox: Sinon.SinonSandbox;
    let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
    let targetLocatorStub: Sinon.SinonStubbedInstance<TargetLocator>;
    let page: PageSeven;
    before(async () => {
      sandbox = Sinon.createSandbox();
      targetLocatorStub = sandbox.createStubInstance<TargetLocator>(
        TargetLocatorPlaceholder as unknown as typeof TargetLocator,
        {
          parentFrame: sandbox.stub<[], Promise<void>>(),
        },
      );
      driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
        switchTo: sandbox.stub<[], TargetLocator>().returns(targetLocatorStub),
      });

      page = new PageSeven(driverStub);
      await page.component.switchToParentFrame();
    });
    after(() => {
      sandbox.restore();
    });
    it('should call driver methods', () => {
      expect(driverStub.switchTo.callCount).to.equal(1);
      expect(targetLocatorStub.parentFrame.callCount).to.equal(1);
    });
  });
  describe('Staleness', async () => {
    describe('No cache', () => {
      let sandbox: Sinon.SinonSandbox;
      let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
      let page: PageEight;
      before(() => {
        sandbox = Sinon.createSandbox();
        driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {});

        page = new PageEight(driverStub);
      });
      after(() => {
        sandbox.restore();
      });
      it('throws error when checking staleness of cache', async () => {
        await expect(page.component.cacheHasGoneStale()).to.eventually.be.rejectedWith(Error);
      });
    });

    describe('With cache', () => {
      let sandbox: Sinon.SinonSandbox;
      let parentElementStub: Sinon.SinonStubbedInstance<WebElement>;
      let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
      let page: PageNine;
      before(async () => {
        sandbox = Sinon.createSandbox();
        parentElementStub = sandbox.createStubInstance<WebElement>(WebElement, {
          getTagName: sandbox.stub<[], Promise<string>>().resolves('thing'),
        });
        driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
          findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(parentElementStub),
        });
        page = new PageNine(driverStub);
        await page.component.cacheElementForStalenessCheck();
      });
      after(() => {
        sandbox.restore();
      });
      it('returns false when checking staleness of cache', async () => {
        expect(await page.component.cacheHasGoneStale()).to.be.false;
      });
    });
    describe('With cache, but it is stale', () => {
      let sandbox: Sinon.SinonSandbox;
      let parentElementStub: Sinon.SinonStubbedInstance<WebElement>;
      let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
      let page: PageTen;
      before(async () => {
        sandbox = Sinon.createSandbox();
        parentElementStub = sandbox.createStubInstance<WebElement>(WebElement, {
          getTagName: sandbox.stub<[], Promise<string>>().throws(new error.StaleElementReferenceError()),
        });
        driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
          findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(parentElementStub),
        });
        page = new PageTen(driverStub);
        await page.component.cacheElementForStalenessCheck();
      });
      after(() => {
        sandbox.restore();
      });
      it('returns false when checking staleness of cache', async () => {
        expect(await page.component.cacheHasGoneStale()).to.be.true;
      });
    });
    describe('With cache, but another error occurs', () => {
      let sandbox: Sinon.SinonSandbox;
      let parentElementStub: Sinon.SinonStubbedInstance<WebElement>;
      let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
      let page: PageEleven;
      before(async () => {
        sandbox = Sinon.createSandbox();
        parentElementStub = sandbox.createStubInstance<WebElement>(WebElement, {
          getTagName: sandbox.stub<[], Promise<string>>().throws(new Error('unkown')),
        });
        driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
          findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(parentElementStub),
        });
        page = new PageEleven(driverStub);
        await page.component.cacheElementForStalenessCheck();
      });
      after(() => {
        sandbox.restore();
      });
      it('returns false when checking staleness of cache', async () => {
        await expect(page.component.cacheHasGoneStale()).to.eventually.be.rejectedWith(Error);
      });
    });
  });
  describe('Conditions', async () => {
    let sandbox: Sinon.SinonSandbox;
    let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
    let parentElementStub: Sinon.SinonStubbedInstance<WebElement>;
    let page: PageTwelve;
    before(async () => {
      sandbox = Sinon.createSandbox();
      parentElementStub = sandbox.createStubInstance<WebElement>(WebElement, {
        isDisplayed: sandbox.stub<[], Promise<boolean>>().onCall(0).resolves(false).onCall(1).resolves(true),
      });
      driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
        findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(parentElementStub),
      });
      page = new PageTwelve(driverStub);
      await page.loaded;
    });
    after(() => {
      sandbox.restore();
    });
    it('tries to pass conditions to wait', async () => {
      expect(parentElementStub.isDisplayed.callCount).to.equal(2);
      expect(driverStub.findElement.callCount).to.equal(3);
    });
  });
  describe('Conditions (default)', async () => {
    let sandbox: Sinon.SinonSandbox;
    let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
    let parentElementStub: Sinon.SinonStubbedInstance<WebElement>;
    let page: PageThirteen;
    before(async () => {
      sandbox = Sinon.createSandbox();
      parentElementStub = sandbox.createStubInstance<WebElement>(WebElement, {
        isDisplayed: sandbox.stub<[], Promise<boolean>>().onCall(0).resolves(false).onCall(1).resolves(true),
      });
      driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
        findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(parentElementStub),
      });
      page = new PageThirteen(driverStub);
      await page.loaded;
    });
    after(() => {
      sandbox.restore();
    });
    it('tries to pass conditions to wait', async () => {
      expect(parentElementStub.isDisplayed.callCount).to.equal(0);
      expect(driverStub.findElement.callCount).to.equal(0);
    });
  });
  describe('Conditions (timeout)', async () => {
    let sandbox: Sinon.SinonSandbox;
    let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
    let parentElementStub: Sinon.SinonStubbedInstance<WebElement>;
    let page: PageFourteen;
    before(async () => {
      sandbox = Sinon.createSandbox();
      parentElementStub = sandbox.createStubInstance<WebElement>(WebElement, {
        isDisplayed: sandbox.stub<[], Promise<boolean>>().onCall(0).resolves(false).onCall(1).resolves(false).onCall(2).resolves(false).onCall(3).resolves(true),
      });
      driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
        findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(parentElementStub),
      });
      page = new PageFourteen(driverStub);
    });
    after(() => {
      sandbox.restore();
    });
    it('will timeout', async () => {
      await expect(page.loaded).to.eventually.be.rejected;
    });
  });

  describe('Conditions (error)', async () => {
    let sandbox: Sinon.SinonSandbox;
    let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
    let parentElementStub: Sinon.SinonStubbedInstance<WebElement>;
    let page: PageFifteen;
    before(async () => {
      sandbox = Sinon.createSandbox();
      parentElementStub = sandbox.createStubInstance<WebElement>(WebElement, {
        isDisplayed: sandbox.stub<[], Promise<boolean>>().onCall(0).resolves(false).onCall(1).throws(new Error("Unknown")),
      });
      driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
        findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(parentElementStub),
      });
      page = new PageFifteen(driverStub);
    });
    after(() => {
      sandbox.restore();
    });
    it('will timeout', async () => {
      await expect(page.loaded).to.eventually.be.rejected;
    });
  });
  describe("Iframe Component", () => {
    describe('Switching to frame', async () => {
      let sandbox: Sinon.SinonSandbox;
      let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
      let targetLocatorStub: Sinon.SinonStubbedInstance<TargetLocator>;
      let frameElementStub: Sinon.SinonStubbedInstance<WebElement>;
      let page: PageSixteen;
      before(async () => {
        sandbox = Sinon.createSandbox();
        frameElementStub = sandbox.createStubInstance<WebElement>(WebElement);
        targetLocatorStub = sandbox.createStubInstance<TargetLocator>(
          TargetLocatorPlaceholder as unknown as typeof TargetLocator,
          {
            parentFrame: sandbox.stub<[], Promise<void>>(),
          },
        );
        targetLocatorStub.frame = sandbox.stub<[id: number | WebElement | null], Promise<void>>();
        driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
          findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(frameElementStub),
          switchTo: sandbox.stub<[], TargetLocator>().returns(targetLocatorStub),
        });

        page = new PageSixteen(driverStub);
        await page.component.switchTo();
      });
      after(() => {
        sandbox.restore();
      });
      it('pass the element to the frame method of the TargetLocator', () => {
        expect(driverStub.switchTo.callCount).to.equal(1);
        expect(targetLocatorStub.frame.calledOnceWith(frameElementStub)).to.be.true;
      });
    });
    describe('Frame is ready', async () => {
      let sandbox: Sinon.SinonSandbox;
      let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
      let targetLocatorStub: Sinon.SinonStubbedInstance<TargetLocator>;
      let frameElementStub: Sinon.SinonStubbedInstance<WebElement>;
      let page: PageSeventeen;
      let result: boolean;
      before(async () => {
        sandbox = Sinon.createSandbox();
        frameElementStub = sandbox.createStubInstance<WebElement>(WebElement);
        targetLocatorStub = sandbox.createStubInstance<TargetLocator>(
          TargetLocatorPlaceholder as unknown as typeof TargetLocator,
          {
            parentFrame: sandbox.stub<[], Promise<void>>(),
          },
        );
        targetLocatorStub.frame = sandbox.stub<[id: number | WebElement | null], Promise<void>>();
        driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
          findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(frameElementStub),
          switchTo: sandbox.stub<[], TargetLocator>().returns(targetLocatorStub),
        });

        page = new PageSeventeen(driverStub);
        result = await page.component.iFrameIsReady();
      });
      after(() => {
        sandbox.restore();
      });
      it('pass the element to the frame method of the TargetLocator', () => {
        expect(result).to.be.true;
        expect(driverStub.switchTo.callCount).to.equal(2);
        expect(targetLocatorStub.frame.calledOnceWith(frameElementStub)).to.be.true;
        expect(targetLocatorStub.parentFrame.callCount).to.equal(1);
      });
    });
    describe('Frame is not frame', async () => {
      let sandbox: Sinon.SinonSandbox;
      let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
      let targetLocatorStub: Sinon.SinonStubbedInstance<TargetLocator>;
      let frameElementStub: Sinon.SinonStubbedInstance<WebElement>;
      let page: PageEighteen;
      let result: boolean;
      before(async () => {
        sandbox = Sinon.createSandbox();
        frameElementStub = sandbox.createStubInstance<WebElement>(WebElement);
        targetLocatorStub = sandbox.createStubInstance<TargetLocator>(
          TargetLocatorPlaceholder as unknown as typeof TargetLocator,
          {
            parentFrame: sandbox.stub<[], Promise<void>>(),
          },
        );
        targetLocatorStub.frame = sandbox.stub<[id: number | WebElement | null], Promise<void>>().throws(new error.NoSuchFrameError("no such frame"));
        driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
          findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(frameElementStub),
          switchTo: sandbox.stub<[], TargetLocator>().returns(targetLocatorStub),
        });

        page = new PageEighteen(driverStub);
        result = await page.component.iFrameIsReady();
      });
      after(() => {
        sandbox.restore();
      });
      it('pass the element to the frame method of the TargetLocator', () => {
        expect(result).to.be.false;
        expect(driverStub.switchTo.callCount).to.equal(1);
        expect(targetLocatorStub.frame.calledOnceWith(frameElementStub)).to.be.true;
        expect(targetLocatorStub.parentFrame.callCount).to.equal(0);
      });
    });
    describe('Frame has unknown error', async () => {
      let sandbox: Sinon.SinonSandbox;
      let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
      let targetLocatorStub: Sinon.SinonStubbedInstance<TargetLocator>;
      let frameElementStub: Sinon.SinonStubbedInstance<WebElement>;
      let page: PageNineteen;
      before(async () => {
        sandbox = Sinon.createSandbox();
        frameElementStub = sandbox.createStubInstance<WebElement>(WebElement);
        targetLocatorStub = sandbox.createStubInstance<TargetLocator>(
          TargetLocatorPlaceholder as unknown as typeof TargetLocator,
          {
            parentFrame: sandbox.stub<[], Promise<void>>(),
          },
        );
        targetLocatorStub.frame = sandbox.stub<[id: number | WebElement | null], Promise<void>>().throws(new Error("Unknown"));
        driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
          findElement: sandbox.stub<[locator: Locator], WebElementPromise>().resolves(frameElementStub),
          switchTo: sandbox.stub<[], TargetLocator>().returns(targetLocatorStub),
        });

        page = new PageNineteen(driverStub);
      });
      after(() => {
        sandbox.restore();
      });
      it('pass the element to the frame method of the TargetLocator', async () => {
        await expect(page.component.iFrameIsReady()).to.eventually.be.rejected;
        expect(driverStub.switchTo.callCount).to.equal(1);
        expect(targetLocatorStub.frame.calledOnceWith(frameElementStub)).to.be.true;
        expect(targetLocatorStub.parentFrame.callCount).to.equal(0);
      });
    });
    describe('Frame is not present', async () => {
      let sandbox: Sinon.SinonSandbox;
      let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
      let targetLocatorStub: Sinon.SinonStubbedInstance<TargetLocator>;
      let page: PageTwenty;
      let result: boolean;
      before(async () => {
        sandbox = Sinon.createSandbox();
        targetLocatorStub = sandbox.createStubInstance<TargetLocator>(
          TargetLocatorPlaceholder as unknown as typeof TargetLocator,
          {
            parentFrame: sandbox.stub<[], Promise<void>>(),
          },
        );
        targetLocatorStub.frame = sandbox.stub<[id: number | WebElement | null], Promise<void>>();
        driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
          findElement: sandbox.stub<[locator: Locator], WebElementPromise>().throws(new error.NoSuchElementError("no such element")),
          switchTo: sandbox.stub<[], TargetLocator>().returns(targetLocatorStub),
        });

        page = new PageTwenty(driverStub);
        result = await page.component.iFrameIsReady();
      });
      after(() => {
        sandbox.restore();
      });
      it('pass the element to the frame method of the TargetLocator', () => {
        expect(result).to.be.false;
        expect(driverStub.switchTo.callCount).to.equal(0);
        expect(targetLocatorStub.frame.callCount).to.equal(0);
        expect(targetLocatorStub.parentFrame.callCount).to.equal(0);
      });
    });
  });
});
