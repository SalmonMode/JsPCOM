# JsPCOM
JsPCOM is page component object framework for TypeScript and JavaScript based around Selenium.

It's built with TypeScript in mind for some fancy, more aesthetically pleasing features, but it's just as easy to use for JavaScript.

## Installation

```sh
npm install jspcom
```

## Page "Component" Object

Many have heard of the Page Object Model, but the original description [wasn't particularly effective at conveying how to build something that's easy to use and maintain (and possibly with reusable parts)](https://martinfowler.com/bliki/PageObject.html#:~:text=There%27s%20an%20argument,TwoHardThings). Many believed that page objects are [god objects](https://en.wikipedia.org/wiki/God_object) that have all the locators and logic for an entire page in one class, as that's what the original description unintentionally implied.

Really, though, pages are comprised of multiple nesting pieces, and not every part of the page needs to know about every other part of the page. As such, when looking to abstract interactions with a page, object composition is an ideal approach.

[Each logical part of the page is effectively a component](https://www.selenium.dev/documentation/en/guidelines_and_recommendations/page_object_models/#:~:text=A%20page%20object%20does%20not,code%20duplication.), and this extends downward to individual elements. The root component can also be an a reference to a specific element even if it has child components of its own.

This is still technically a "Page Object Framework", as it provides a `Page` class for making the root Page object. But the components are where the action is at, and so that's what's emphasized.

## Example

Enough about that though. Here's a quick example to help explain the concepts and get you on the move:

#### TypeScript

`src/pages/components/login.ts`:

```typescript
import { PageComponent, Component } from 'jspcom';
import { By } from 'selenium-webdriver';

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

  async fillOut(username: string, password: string) {
    await this.username.sendKeys(username);
    await this.password.sendKeys(password);
  }
}

```

`src/pages/login.ts`:

```typescript
import { Page, Component } from 'jspcom';
import { LoginForm } from './components/login';

class LoginPage extends Page {
  @Component()
  loginForm: LoginForm;

  async login(username: string, password: string) {
    await this.loginForm.fillOut(username, password);
    await this.loginForm.submit();
  }
}
```

And then here's how you'd use it:

`someScript.ts`:

```typescript
// it's assumed that driver is a WebDriver instance

const page = new LoginPage(driver);
await page.login('myusername', 'mypassword');
```

#### JavaScript

`src/pages/components/login.js`:

```javascript
const { By } = require('selenium-webdriver');
const { PageComponent } = require('jspcom');

class Password extends PageComponent {
  locator = By.id('password');
}
class Username extends PageComponent {
  locator = By.id('username');
}
export class LoginForm extends PageComponent {
  locator = By.id('loginForm');
  componentMappings = {
    username: Username,
    password: Password
  }

  async fillOut(username: string, password: string) {
    await this.username.sendKeys(username);
    await this.password.sendKeys(password);
  }
}

```

`src/pages/login.js`:

```javascript
const { Page } = require('jspcom');
const { LoginForm } = require('./components/login');

class LoginPage extends Page {
  componentMappings = {
    loginForm: LoginForm
  }

  async login(username: string, password: string) {
    await this.loginForm.fillOut(username, password);
    await this.loginForm.submit();
  }
}
```

And then here's how you'd use it:

`someScript.js`:

```javascript
// it's assumed that driver is a WebDriver instance

const page = new LoginPage(driver);
// always necessary to parse components
await page.loaded;
await page.login('myusername', 'mypassword');
```

## Waiting for things to load

Both `Page` and `PageComponent` objects will automatically try to kick off all of the conditions each one has as they are instantiated. "Conditions" can either be `Condition` objects made using the `Condition` class provided by `selenium-webdriver` itself (or its prefab `Condition` objects), or they can just be plain callables. But either way, they will be called repeatedly, being passed the `WebDriver` object each time, until either 1) they all return something truthy (in which case, the wait is finished successfully), or a timeout is reached (in which case, a timeout error is thrown).

The components are only instantiated when you reference them though, so it's recommended to do this either in each component's manager's `conditions` or by overriding the component's manager's `wait` method.

### :warning: Always await `.loaded`, and never call `.wait` directly

Due to how JavaScript works, it's not currently possible to make sure the component mapping is attached to the instance object before the framework attempts to parse that mapping in the constructor alone (as super calls will be necessary and it could get pretty boilerplate-y in the constructors themselves). As a result, it's always necessary to call `await page.loaded` before trying to do anything with the page object (so ideally, this would be done right after instantiating it).

Related to this, is also necessary to never call `.wait` directly. The reason for this, is because `.loaded` is a getter that triggers the component parsing right before it makes a call to `.wait`. `.loaded` returns the `Promise` provided by `.wait`, so that's what JS would be awaiting, but it needs to have the components parsed before then.

### Waiting logic example

Let's say you want the `LoginPage` to wait for the page to be fully rendered before proceeding, as the `LoginForm` is rendered after the `document.readystate` has been set to `complete` because it was rendered via JavaScript, but you know that as long as the form is actually rendered, you should be good. Here's how that could look:

#### TypeScript

`src/pages/components/login.ts`:

```typescript
import { PageComponent, Component } from 'jspcom';
import { By } from 'selenium-webdriver';

class Password extends PageComponent {
  locator: Locator = By.id('password');
}
class Username extends PageComponent {
  locator: Locator = By.id('username');
}
export class LoginForm extends PageComponent {
  locator: Locator = By.id('loginForm');

  @Component()
  username: Username;
  @Component()
  password: Password;

  conditions: <() => any>[] = [
    () => this.isDisplayed(),
  ]

  async fillOut(username: string, password: string) {
    await this.username.sendKeys(username);
    await this.password.sendKeys(password);
  }
}

```

`src/pages/login.ts`:

```typescript
import { Page, Component } from 'jspcom';
import { LoginForm } from './components/login';

class LoginPage extends Page {
  @Component()
  loginForm: LoginForm;

  async wait() {
    // never call `wait` directly
    await this.loginForm.loaded;
  }

  async login(username: string, password: string) {
    await this.loginForm.fillOut(username, password);
    await this.loginForm.submit();
  }
}
```

And then here's how you'd use it:

`someScript.ts`:

```typescript
// it's assumed that driver is a WebDriver instance

const page = new LoginPage(driver);
await page.loaded;
await page.login('myusername', 'mypassword');
```

#### JavaScript

The only thing that changes between TypeScript and JavaScript (other than the `@Component()` stuff), is that JavaScript wouldn't have the type annotations.

### Staleness check (and other non-initialization waits)

Checking for staleness is tricky, because it relies on having a reference to the `WebElement` beforehand. This framework doesn't fetch `WebElement` references until it absolutely has to, and even then, it doesn't hold onto them. But, it does have a special private attribute (`stalenessCache`) and two special methods (`cacheElementForStalenessCheck` and `cacheHasGoneStale`) that are used specifically for enabling this sort of check.

Here's how it can be used:

```javascript
class SignInForm extends PageComponent {
  locator = By.css('#signIn');

  @Component()
  username: Username;
  @Component()
  password: Password;
  @Component()
  signInButton: SignInButton;
  @Component()
  errorMessage: ErrorMessage;

  get conditions() {
    return [
      () => this.isDisplayed(),
    ];
  }

  async fillOut(username, password) {
    await this.username.sendKeys(username);
    await this.password.sendKeys(password);
  }

  async submit() {
    await this.cacheElementForStalenessCheck();
    await this.signInButton.click();
    await this.driver.wait(() => {
      if (await this.cacheHasGoneStale()) {
        return true;
      }
      if (await this.errorMessage.isPresent()) {
        throw new SignInError(await this.errorMessage.getText());
      }
      return false;
    });
  }
}
```

In this example, the submit method for the `SignInForm` knows it has to wait for either the form's `WebElement` to be removed from the DOM, or for the error message to show up after the sign in button has been clicked.

If the element is removed from the DOM (which it can tell if the reference went stale), then it knows the sign in succeeded, and it can return `true`.

If the element is still there, but no error has shown up, then it can return `false`, indicating it should attempt to check again.

#### Throwing an error

This example uses the `driver.wait` method provided by `selenium-webdriver`. This method accepts either a special `Condition` object, which is made from a `Condition` class also provided by `selenium-webdriver`, or a simple callable that return something `true` or `false` whenever it's called.

If the form's element is still in the DOM, but an error message has shown up, this will throw an error, which will break out of the `wait` call, and bubble the error up.

An error is thrown in the example callable to indicate that something happened that deviated from the "normal" flow. Even if the intent was to make that error show up, the page object doesn't need to know that your intent at some point would be exceptional.

This is extremely helpful in the context of automated checks (and code in general), because it makes it easier to convey intent in the code. In this case, if you wanted to make sure that bad credentials made the error message show up with particular text, you could have the error have that text as its message, and then you can assert that an error with that message was thrown.

Even better, when you intended it to get through signing in without issues, but one occurred, that error could contain some extremely helpful information to indicate what went wrong before investing more time into debugging it.

## Working with iFrames

iFrames are tricky, as you need to switch to them before you can do anything inside of them, or even to see inside of them at all. Some convenience methods have been provided for you to use and build off of when working with iFrames. Here's a quick example:

```typescript
class Something extends PageComponent {
  locator = By.css('.thing');

  async click() {
    await this.parent.switchTo();
    await this.click();
    await this.switchToParentFrame();
  }
}

class SomeIframe extends IframePageComponent {
  locator = By.css('iframe');

  @Component
  something: Something;

  conditions = [
    this.iFrameIsReady,
  ];

  async doTheThing() {
    await this.something.click();
  }
}
```
