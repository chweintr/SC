
    (function() {
      var cdnOrigin = "https://cdn.shopify.com";
      var scripts = ["https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/polyfills.DrBAsOCv.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/app.CkU1DeVZ.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/en.CxcLKemV.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/page-OnePage.CNwyHqCR.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/DeliveryMethodSelectorSection.CK06MpmK.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/useEditorShopPayNavigation.DjPv_uOq.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/VaultedPayment.MYODQ-OH.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/PaymentButtons.BeMcN9et.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/LocalizationExtensionField.C0-UedBQ.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/ShopPayOptInDisclaimer.nPBz0Sso.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/ShipmentBreakdown.DkjJmatz.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/MerchandiseModal.DXsdC18j.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/StackedMerchandisePreview.DEM-JrwO.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/PayButtonSection.mMdPRn93.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/component-ShopPayVerificationSwitch.BoxRvvhe.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/useSubscribeMessenger.CnTqjU0S.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/index.cokfysWz.js"];
      var styles = ["https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/assets/app.BFkZ4w-r.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/assets/OnePage.PMX4OSBO.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/assets/DeliveryMethodSelectorSection.BvrdqG-K.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/assets/useEditorShopPayNavigation.Dvkv4byz.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/assets/VaultedPayment.OxMVm7u-.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/assets/StackedMerchandisePreview.CKAakmU8.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/assets/ShopPayVerificationSwitch.DW7NMDXG.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = [];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = [cdnOrigin].concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  