# JsPCOM
JsPCOM is page component object framework for TypeScript and JavaScript based around Selenium.

It's built with TypeScript in mind for some fancy, more aesthetically pleasing features, but it's just as easy to use for JavaScript.

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
  get componentMappings() {
    return {
      username: Username,
      password: Password
    };
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
  get componentMappings() {
    return {
      loginForm: LoginForm
    };
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
await page.login('myusername', 'mypassword');
```

## Waiting for things to load

Both `Page` and `PageComponent` objects will automatically try to kick off all of the conditions each one has as they are instantiated. "Conditions" can either be `Condition` objects made using the `Condition` class provided by `selenium-webdriver` itself (or its prefab `Condition` objects), or they can just be plain callables. But either way, they will be called repeatedly, being passed the `WebDriver` object each time, until either 1) they all return something truthy (in which case, the wait is finished successfully), or a timeout is reached (in which case, a timeout error is thrown).

The components are only instantiated when you reference them though, so it's recommended to do this either in each component's manager's `conditions` or by overriding the component's manager's `wait` method.

### :warning: It is _highly_ recommended to use _getters_

Due to how JavaScript currently works, it's not exactly possible to make sure things like the `locator` attribute is getting set when it should, and this can be a problem for wait logic, as they might need to have those attributes set before they start.

Additionally, you can use closures when defining your conditions to get easy access to things like the component instance.

Because of this, it's highly recommended to provide these pieces of information (if needed) through getters to make sure they are available when they should be, otherwise proper functionality can't be guaranteed:

1. `locator`
2. `findFromParent`
3. `conditions`
4. `componentMappings` (only if you aren't using the `@Component()` approach)

The above examples get away without getters because they don't have any waiting conditions to worry about.

### Waiting example

Let's say you want the `LoginPage` to wait for the page to be fully rendered before proceeding, as the `LoginForm` is rendered after the `document.readystate` has been set to `complete` because it was rendered via JavaScript, but you know that as long as the form is actually rendered, you should be good. Here's how that could look:

#### TypeScript

`src/pages/components/login.ts`:

```typescript
import { PageComponent, Component } from 'jspcom';
import { By } from 'selenium-webdriver';

class Password extends PageComponent {
  get locator(): Locator {
    return By.id('password');
    }
}
class Username extends PageComponent {
  get locator(): Locator {
    return By.id('username');
  }
}
export class LoginForm extends PageComponent {
  get locator(): Locator {
    return By.id('loginForm');
  }

  @Component()
  username: Username;
  @Component()
  password: Password;

  get conditions(): <() => any>[] {
    return [
      () => this.isDisplayed(),
    ]
  }

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
