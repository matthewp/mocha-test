
class MochaTest extends HTMLElement {
  connectedCallback() {
    if(!this.hasSetup) {
      this.hasSetup = true;
      this._setup();
    }
  }

  _setup() {
    let doc = this.ownerDocument;
    let scriptTemplate = this.querySelector('template');
    let mochaDiv = document.createElement('div');
    mochaDiv.id = 'mocha';
    let pageDiv = document.createElement('div');
    pageDiv.id = 'page';
    let frag = doc.createDocumentFragment();
    [mochaDiv, pageDiv].forEach(div => frag.appendChild(div));

    var mochaScript = document.createElement('script');
    var chaiScript = document.createElement('script');
    var mochaLink = document.createElement('link');
    mochaLink.rel = 'stylesheet';

    var loadPromise = Promise.all([
      this._loadPromise(mochaScript),
      this._loadPromise(chaiScript),
      this._loadPromise(mochaLink)
    ]);

    mochaScript.src = this.mochaPath + '/mocha.js';
    chaiScript.src = this.chaiPath + '/chai.js';
    mochaLink.href = this.mochaPath + '/mocha.css';

    loadPromise.then(function(){
      window.assert = window.chai.assert;
      mocha.setup(this.ui);
      // Append the user script
      var frag = document.importNode(scriptTemplate.content, true);
      this.replaceChild(frag, scriptTemplate);

      if(window.Testee) {
        Testee.init();
      }

      mocha.run();
    }.bind(this));

    [ mochaScript, chaiScript, mochaLink ].forEach(function(el){
      this.appendChild(el);
    }.bind(this));
    this.appendChild(frag, this.firstChild);
  }

  get mochaPath() {
    // Default assumes this is running within node_modules or
    // bower_components and mocha is a sibling.
    return this._getPath('mocha-path', '../mocha');
  }

  get chaiPath() {
    return this._getPath('chai-path', '../chai');
  }

  get ui() {
    return this.getAttribute('ui') || 'bdd';
  }

  _getPath(attrName, def) {
    var pth = this.getAttribute(attrName);
    if(pth) {
      return pth;
    }
    var baseURI = doc.baseURI;
    var url = new URL(def, baseURI);
    return url.toString();
  }

  _loadPromise(el) {
    return new Promise(function(resolve){
      el.addEventListener('load', function onload(){
        el.removeEventListener('load', onload);
        resolve();
      });
    });
  }
}

customElements.define('mocha-test', MochaTest);
