import { Component, ViewEncapsulation } from '@angular/core';
import { Http } from '@angular/http';
import 'bulma/css/bulma.css';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { symbols } from './symbols';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

interface ChartOptions {
  series: any[];
  chart: any;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.css', '../../node_modules/bulma/css/bulma.css']
})
export class AppComponent {
  options: ChartOptions;
  seriesOptions: any[] = [];
  selectedSeries: any;
  dataSource: Observable<any>;

  public asyncSelected: string = 'JKCEMENT';
  public typeaheadLoading: boolean;
  public typeaheadNoResults: boolean;

  recentlyViewed = new Array<string>();

  constructor(private http: Http) {
    this.recentlyViewed.push('JKCEMENT');

    this.setChart('JKCEMENT');
    this.dataSource = Observable
      .create((observer: any) => {
        observer.next(this.asyncSelected);
      })
      .mergeMap((token: string) => this.getStatesAsObservable(token));
  }

  public getStatesAsObservable(token: string): Observable<any> {
    const query = new RegExp(token, 'ig');

    return Observable.of(
      symbols.filter((symb: any) => {
        return query.test(symb.symbol);
      })
    );


  }


  public changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  public changeTypeaheadNoResults(e: boolean): void {
    this.typeaheadNoResults = e;
  }

  public typeaheadOnSelect(e: TypeaheadMatch): void {
    console.log('Selected value: ', e.value);
    this.setChart(e.value);
    this.recentlyViewed.push(e.value);
    this.recentlyViewed = this.recentlyViewed.filter(function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    });
  }

  setChart(symb: string) {
    const quandlURL: any = `https://www.quandl.com/api/v3/datasets/XNSE/${symb}.json?api_key=gWf2CLShwrGUBVnqzsT4&start_date=2016-01-01&end_date=2017-06-01`;
    const highchartsURL: any = 'https://cdn.rawgit.com/gevgeny/angular2-highcharts/99c6324d/examples/aapl.json';
    this.http.get(quandlURL).subscribe(res => {

      const data = this.getData(res);

      if (data.length == 0) console.log("no data");

      this.seriesOptions = [{
        name: symb,
        data: data,
        tooltip: {
          valueDecimals: 2
        }
      }];

      this.selectedSeries = this.seriesOptions[0];

      this.options = this.getNewOptions();

    });
  }
  getData(res: any): any {
    return res.json().dataset.data.map(d => {
      return [new Date(d[0]).getTime(), d[4]];
    }).sort(function(a, b) {
      var d1: any = new Date(b[0]);
      var d2: any = new Date(a[0]);
      return (d2 - d1);
    });
  }

  addSymbol(symb: string, checked: any) {
    console.log("event : " + JSON.stringify(checked));

    if (checked == true) {
      const quandlURL: any = `https://www.quandl.com/api/v3/datasets/XNSE/${symb}.json?api_key=gWf2CLShwrGUBVnqzsT4&start_date=2016-01-01&end_date=2017-06-01`;
      this.http.get(quandlURL).subscribe(res => {

        const data = this.getData(res);

        if (this.seriesOptions.filter(e => e.name === symb).length === 0) {
          this.seriesOptions.push({
            name: symb,
            data: data,
            tooltip: {
              valueDecimals: 2
            }
          });
        } else {
          this.seriesOptions = this.seriesOptions.filter(e => e.name != symb);
        }


        this.options = this.getNewOptions();
      });
    } else {
      this.seriesOptions = this.seriesOptions.filter(e => e.name != symb);
    }

  }

  removeFromRecents(ticker: string, event: any) {
    if (this.recentlyViewed.length > 1) {
    this.recentlyViewed = this.recentlyViewed.filter(e => e != ticker);
      this.seriesOptions = this.seriesOptions.filter(e => e.name != ticker);
      this.options = this.getNewOptions();
    }
  }
  getNewOptions(): ChartOptions {
    return {
      series: this.seriesOptions,
      chart: {
        width: null,
        height: null
      }
    };
  }

}
