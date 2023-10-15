import { expect } from 'chai';
import type { Locator, WebElementPromise } from 'selenium-webdriver';
import { By, WebDriver, WebElement } from 'selenium-webdriver';
import Sinon from 'sinon';
import { Component, Page, PageComponent } from './index.js';

class Password extends PageComponent {
  locator = By.id('password');
}
class Username extends PageComponent {
  locator = By.id('username');
}
export class LoginForm extends PageComponent {
  locator = By.id('loginForm');

  @Component()
  username: Username;
  @Component()
  password: Password;

  async fillOut(username: string, password: string): Promise<void> {
    await this.username.sendKeys(username);
    await this.password.sendKeys(password);
  }
}

class LoginPage extends Page {
  @Component()
  loginForm: LoginForm;

  async login(username: string, password: string): Promise<void> {
    await this.loginForm.fillOut(username, password);
    await this.loginForm.submit();
  }
}

describe('Page', () => {
  const username: string = "myusername";
  const password: string = "mypassword";
  let sandbox: Sinon.SinonSandbox;
  let driverStub: Sinon.SinonStubbedInstance<WebDriver>;
  let usernameElementStub: Sinon.SinonStubbedInstance<WebElement>;
  let passwordElementStub: Sinon.SinonStubbedInstance<WebElement>;
  let formElementStub: Sinon.SinonStubbedInstance<WebElement>;
  let page: LoginPage;
  before(() => {
    sandbox = Sinon.createSandbox();
    usernameElementStub = sandbox.createStubInstance<WebElement>(WebElement, {
      sendKeys: sandbox.stub<(string | number | Promise<string | number>)[], Promise<void>>().resolves(),
    });
    passwordElementStub = sandbox.createStubInstance<WebElement>(WebElement, {
      sendKeys: sandbox.stub<(string | number | Promise<string | number>)[], Promise<void>>().resolves(),
    });
    formElementStub = sandbox.createStubInstance<WebElement>(WebElement, {
      submit: sandbox.stub<[], Promise<void>>().resolves(),
    });
    driverStub = sandbox.createStubInstance<WebDriver>(WebDriver, {
      findElement: sandbox
        .stub<[locator: Locator], WebElementPromise>()
        .onCall(0)
        .resolves(usernameElementStub)
        .onCall(1)
        .resolves(passwordElementStub)
        .onCall(2)
        .resolves(formElementStub),
    });
    page = new LoginPage(driverStub);
  });
  after(() => {
    sandbox.restore();
  });
  describe('Login method', async () => {
    before(async () => {
      await page.login(username, password);
    });
    it('tries to find 3 elements', async () => {
      expect(driverStub.findElement.callCount).to.equal(3);
    });
    it('tries to send keys to username field first', async () => {
      expect(usernameElementStub.sendKeys.callCount).to.equal(1);
      expect(usernameElementStub.sendKeys.calledWith(username)).to.be.true;
    });
    it('tries to send keys to password field second', async () => {
      expect(passwordElementStub.sendKeys.callCount).to.equal(1);
      expect(passwordElementStub.sendKeys.calledWith(password)).to.be.true;
    });
    it('tries to submit the form third', async () => {
      expect(formElementStub.submit.callCount).to.equal(1);
    });
  });
});
