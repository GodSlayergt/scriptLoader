const client_Map = {
  CEI: {
    localhost: "localhost",
  },
};
const defaultURL = "http://it:5003/manifest.json";

/**
 *  map the host enviroment with microapp enviroment
 * @returns {URL}- return the enviroment specific url object
 */
const getUrlBaseOnEnv = () => {
  const client_url_Obj = window.location;
  const microapp_url_Obj = new URL(defaultURL)
  let client = sessionStorage.getItem("Client");
  if (!client) {
    client = "CEI";
  }
  microapp_url_Obj.hostname =  client_Map[client][client_url_Obj.hostname] ;
  return microapp_url_Obj
};

class Load {
  constructor() {
    this.data = null;
    this.domain = getUrlBaseOnEnv()
  }
  /**
   *
   * @desc - fetch the manifest file from the server
   */
  fetchManifest = async () => {
    if (this.data) {
      return this.data;
    }
    const response = await fetch(this.domain.href);
    if (!response.ok) {
      return "Fail";
    }
    this.data = await response.json();
    return;
  };
  /**
   * @desc - search the container on which microapp to be loaded and call render method
   */
  mountOnContainers = () => {
    const containers = document.querySelectorAll("[data-widget-variation]");
    containers.forEach((ele) => {
      const value = ele.getAttribute("data-widget-variation");
      const variation = value.split("-")[0];
      const selector = `[data-widget-variation=${value}]`;
      const appdata = JSON.parse(ele.getAttribute("data-appdata"));
      const initObj = {
        selector: selector,
        props: appdata,
        variation: variation,
      };
      this.render(initObj);
    });
  };
  /**
   * @desc - loads the script into the dom
   * @param {String} key - Key corresponding to the microapp script to be loaded
   * @returns {HTMLScriptElement}
   */
  loadScript = (key) => {
    if (!this.data) {
      return;
    }

    const script = document.createElement("script");
    script.src = this.domain.origin + this.data[key];
    script.id = "load-widget";
    script.defer = true;
    document.body.appendChild(script);
    return script;
  };

  /**
   * render the microapp and provide initial data
   * @param {selector,props,variation} initObj
   */
  render = (initObj) => {
    if (window && this.namespace in window) {
      window["footerApp"].default.render(initObj);
    }
  };
}

window.onload = function () {
  const t = new Load();
  t.fetchManifest().then(() => {
    const script = t.loadScript("main.js");
    script.onload = () => {
      t.mountOnContainers();
    };
  });
};
