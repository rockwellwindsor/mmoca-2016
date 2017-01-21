(function (exports) {
    function urlsToAbsolute(nodeList) {
        if (!nodeList.length) {
            return [];
        }
        var attrName = 'href';
        if (nodeList[0].__proto__ === HTMLImageElement.prototype 
        || nodeList[0].__proto__ === HTMLScriptElement.prototype) {
            attrName = 'src';
        }
        nodeList = [].map.call(nodeList, function (el, i) {
            var attr = el.getAttribute(attrName);
            if (!attr) {
                return;
            }
            var absURL = /^(https?|data):/i.test(attr);
            if (absURL) {
                return el;
            } else {
                return el;
            }
        });
        return nodeList;
    }

    function screenshotPage() {

        var c = document.getElementById('canvas');
        ctx = c.getContext("2d");

        var img = document.getElementById('canvas');

        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        var img = canvas.toDataURL('jpg');
        // window.open(img);  

        var a = document.createElement('a');
        // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.  Just wanted to save this here in case we needed it.
        a.href = canvas.toDataURL();
        a.download = 'somefilename.jpg';
        a.click();
        location.reload();

    }

    function addOnPageLoad_() {
        window.addEventListener('DOMContentLoaded', function (e) {
            var scrollX = document.documentElement.dataset.scrollX || 0;
            var scrollY = document.documentElement.dataset.scrollY || 0;
            window.scrollTo(scrollX, scrollY);
        });
    }

    function generate() {
        window.URL = window.URL || window.webkitURL;
        window.open(window.URL.createObjectURL(screenshotPage()));
    }
    exports.screenshotPage = screenshotPage;
    exports.generate = generate;
})(window);