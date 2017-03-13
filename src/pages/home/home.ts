import { Component } from '@angular/core';
import { Http, ResponseContentType } from '@angular/http';
import { DomSanitizer } from '@angular/platform-browser';
import { File, StatusBar, Splashscreen } from 'ionic-native';

import { NavController, Platform } from 'ionic-angular';

declare var cordova: any;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  test = {};
  base64bundleImage: any = '';
  imageOutsideBundle = '';
  origin = '';
  constructor(
    public navCtrl: NavController,
    public http: Http,
    public sanitizer: DomSanitizer,
    platform: Platform,

  ) {
    setTimeout(() => {
      StatusBar.styleDefault();
      Splashscreen.hide();
      this.testOrigin();

      this.testPostHTTP();
      this.testPostHTTPS();

      this.testXHRBundleText();
      this.testXHRBundleBinary();
      this.testXHRBundleBinary();

      this.testXHROutsideText();
      this.testOutsideAssert();
    }, 1000);
  }

  private get isCordova(): boolean {
    return !!window['cordova'];
  }

  private get fileSystem(): string {
    return cordova.file.dataDirectory;
  }

  testOrigin() {
    console.info("Starting testOrigin");
    this.http.get('https://httpbin.org/get')
      .subscribe((res) => {
        this.origin = res.json().headers.Origin;
        console.log("Origin", this.origin);
      });
  }

  testXHROutsideText() {
    if (!this.isCordova) {
      return;
    }
    console.info("Starting testXHROutsideText");
    const file = 'data.json';
    this.doesFileExist(file).then((exist) => {
      console.log("File exists:", file, exist);
      if (!exist) {
        this.http.get('assets/data.json')
          .subscribe(res => {
            File.writeFile(this.fileSystem, file, res.text()).then(() => {
              this.testXHROutsideTest_2();
            }).catch(e => console.error(e));
          });
      } else {
        this.testXHROutsideTest_2();
      }
    });
  }

  testOutsideAssert() {
    if (!this.isCordova) {
      return;
    }
    console.info("Starting testOutsideAssert");
    const file = 'image2.jpg';
    this.doesFileExist(file).then((exist) => {
      console.log("File exists:", file, exist);
      if (!exist) {
        this.http.get('assets/image2.jpg', {responseType: ResponseContentType.Blob})
          .subscribe(res => {
            File.writeFile(this.fileSystem, file, res.blob()).then(() => {
              this.testOutsideAssert_2();
            }).catch(e => console.error(e));
          });
      } else {
        this.testOutsideAssert_2();
      }
    });
  }

  doesFileExist(file: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {

        File.checkFile(this.fileSystem, file)
            .then(res => {
                if (res) {
                    console.log("file exists: " + this.fileSystem + file);
                    resolve(true);
                }
                else {
                    console.log("file does not exist:" + file);
                    resolve(false);
                }
            })
            .catch(err => {
                console.log("file does not exist on filesystem:" + file);
                resolve(false);
            });
    });
  }

  testOutsideAssert_2() {
    this.imageOutsideBundle = convertURL(this.fileSystem + 'image2.jpg');
    console.log("imageOutsideBundle:", this.imageOutsideBundle);
  }

  testXHROutsideTest_2() {
    this.http.get(convertURL(this.fileSystem+'data.json'))
      .subscribe(res => {
        console.log("testXHROutsideTest_2:", res);
        this.test['GET_outside_text'] = 'Fails';
        this.test['GET_outside_text'] = res.json().message;
    })
  }

  testPostHTTP() {
    console.info("Starting testPostHTTP");
    this.httpPostTest('POST_HTTP', 'http://httpbin.org/post');
  }

  testPostHTTPS() {
    console.info("Starting testPostHTTPS");
    this.httpPostTest('POST_HTTPS', 'https://httpbin.org/post');
  }

  testXHRBundleText() {
    console.info("Starting testXHRBundleText");
    this.http.get('assets/data.json')
      .subscribe(res => {
        console.log("testXHRBundleText:", res);
        this.test['GET_bundle_text'] = 'Fails';
        this.test['GET_bundle_text'] = res.json().message;
    })
  }

  testXHRBundleBinary() {
    console.info("Starting testXHRBundleBinary");
    this.http.get('assets/image.jpg', {
      responseType: ResponseContentType.Blob
    })
      .subscribe(res => {
        console.log("testXHRBundleBinary:", res);
        var urlCreator = window.URL || window['webkitURL'];
        var url = urlCreator.createObjectURL(res.blob());
        this.base64bundleImage = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    })
  }


  httpPostTest(testName: string, url: string) {
    const text = 'this is the POST body';
    this.http.post(url, text)
      .subscribe((res) => {
        console.log("httpPostTest:", res);
        this.test[testName] = (res.json().data === text) ? 'Passes' : 'Fails';
      });
  }

}

function convertURL(path: string) {
  return window.location.origin + path.replace('file:///', '/').replace('file://', '/');
}