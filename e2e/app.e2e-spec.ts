import { StockAppPage } from './app.po';

describe('stock-app App', () => {
  let page: StockAppPage;

  beforeEach(() => {
    page = new StockAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
