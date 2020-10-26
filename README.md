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

`src/pages/components/login.ts`:

```typescript
import { PageComponent, Component } from 'jspcom';
import { By } from 'selenium-webdriver';

class Password extends PageComponent {
  _locator = By.id('password');
}
class Username extends PageComponent {
  _locator = By.id('username');
}
export class LoginForm extends PageComponent {
  _locator = By.id('loginForm');

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
