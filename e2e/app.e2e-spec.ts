import { AppPage } from './app.po';
import {browser, element, by, protractor} from 'protractor';

describe('movie-rater-web App', () => {
  let page: AppPage;
  const ec = protractor.ExpectedConditions;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Login');
  });

  it('should be able to login', () => {
    const usernameField = browser.driver.findElement(by.id('username'));
    usernameField.sendKeys('krystian');
    const passwordField = browser.driver.findElement(by.id('password'));
    passwordField.sendKeys('movierater');
    browser.driver.findElement(by.id('submit')).click();

    const elm = element(by.id('logoutBtn'));
    browser.wait(ec.presenceOf(elm), 3000);
  });
});
