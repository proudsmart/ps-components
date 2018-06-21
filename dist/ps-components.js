(function(global, factory){
  if(typeof module !== "undefined" && typeof module.exports === "function"){
    module.exports = factory();
  } else if(typeof define === "function"){
    define(factory);
  } else if(global === window){
    factory();
  }
})(this, function(){
  var isArray = isType("Array"),
    splice = Array.prototype.splice;
  function isType(type){
    return function(obj){
      return Object.prototype.toString.call(obj) === "[object " + type + "]";
    }
  }
  function toJson(obj){
    return JSON.stringify(obj, null, 2);
  }
  function extend(a, b){
    for(var i in b){
      a[i] = b[i]
    }
    return a;
  }
  function each(arr, callback){
    var i = 0;
    for(;i < arr.length; i++){
      if(callback(arr[i], i)){
        return;
      };
    }
  }
  function find(arr, callback){
    var i = 0;
    for(;i < arr.length; i++){
      if(callback(arr[i], i)){
        return arr[i];
      };
    }
  }
  function some(arr, callback){
    var i = 0;
    for(;i < arr.length; i++){
      if(callback(arr[i], i)){
        return true;
      };
    }
    return false;
  }
  function createElement(tag, cls, css){
    var element = document.createElement(tag);
    return element;
  };
  function addEventListener(dom, eventname, handler){
    dom.addEventListener(eventname, handler);
    return function removeEventListener(){
      dom.removeEventListener(eventname, handler);
    }
  }
  function createCache(){
    var keys = []
    function cache(key, value){
      keys.push(key);
      cache[key] = cache[key] || [];
      cache[key].push(value);
    }
    return cache;
  }
  function eachProp(obj, callback){
    for(var i in obj){
      callback(obj[i], i)
    }
  }
  angular.module("psComponents", [])
    .factory("psComponents", ["$q", function($q){
      var psComponents = {}, cssStyle = {}, insertStyle, routerCheck,
        head = document.getElementsByTagName("head")[0];
      function addCssFile(url) {
        var defer = $q.defer(),
          removeEvent,
          link = createElement("link");
        extend(link, {
          rel: "stylesheet",
          type: "text/css",
          href: url
        })
        head.appendChild(link);
        removeEvent = addEventListener(link, "load", function (e) {
          removeEvent();
          defer.resolve(e);
        });
        return defer.promise;
      }
      function addCssFiles(urls, callback){
        if(isArray(urls)){
          var defers = []
          each(urls, function(url){
            defers.push(addCssFile(url));
          });
          $q.all(defers).then(callback);
        }  else {
          addCssFile(urls).then(callback);
        }
      }
      function addCssStyle(path, style){
        cssStyle[path] = extend((cssStyle[path] || {}), style);
        addStyleToHead();
      }
      function addStyleToHead(){
        var str = toJson(cssStyle),
          classNameExp = new RegExp("\\\"([a-zA-Z0-9#. ]+)\\\": (\\{)", "g"),
          attrValueExp = new RegExp("\\\"([a-zA-Z-]+)\\\": \\\"([a-zA-Z%0-9.(),]+)\\\"\\,?", "g"),
          wrapBeforeExp = new RegExp("^\\{\\n"),
          wrapAfterExp = new RegExp("\\}$");
        while(classNameExp.test(str)){
          str = str.replace(classNameExp, "$1 $2");
        }
        while(attrValueExp.test(str)){
          str = str.replace(attrValueExp, "$1: $2;");
        }
        str = str.replace(wrapBeforeExp, "\n");
        str = str.replace(wrapAfterExp, "");
        str = str.replace(",", "");
        if(!insertStyle){
          insertStyle = createElement("style");
          insertStyle.type = "text/css";
          head.appendChild(insertStyle);
        }
        insertStyle.innerHTML = str;
      }
      routerCheck = (function(){
        var word = "[a-zA-Z0-9-_]",
          searchCache = createCache(),
          regExpCache = [];
        Expr = {
          attr : {
            ":" : new RegExp("^:(" + word + "+)$", "g"),
            ":?" : new RegExp("^:(" + word + "+)\\?$", "g")
          },
          find : {
            "WORD" : new RegExp("^" + word + "+", "g"),
            "**" : new RegExp("^\\*\\*", "g"),
            "*" : new RegExp("^\\*", "g")
          },
          replace : {
            ":" : word + "*",
            ":?" : word + "*",
            "**" : ".*",
            "*" : word + "*"
          }
        };
        function tokenize(url){
          var tokens = url.split("/");
          function setToken(token, i){
            var soFar = token, rs = "", type, reg, match;
            for(type in Expr.attr){
              reg = Expr.attr[type];
              reg.lastIndex = 0;
              match = reg.exec(soFar);
              if(match){
                rs = Expr.replace[type]
                return {
                  value : match[1],
                  match : rs,
                  stable : false,
                  type : "attribute",
                  strict : type.indexOf("?") === -1
                }
              }
            };
            match = null;
            try{
              while(soFar && soFar.length > 0){
                for(type in Expr.find){
                  reg = Expr.find[type];
                  reg.lastIndex = 0;
                  if(match = reg.exec(soFar)){
                    break;
                  }
                }
                if(match){
                  rs += (Expr.replace[type] ? Expr.replace[type] : match[0])
                  soFar = soFar.substring(match[0].length);
                } else {
                  throw {
                    url : url,
                    token : token
                  }
                }
              }
            } catch(e){
              console.error("无效的URL,不可被解析", e);
              return null;
            }
            return {
              value : token,
              match : rs,
              stable : token == rs
            }
          }
          tokens[0] == "#" && tokens.shift();
          return tokens.map(setToken);
        }
        function routerCheck(){
          return new routerCheck.init();
        };
        routerCheck.init = function(){}
        function createMatch(match){
          return function(url){
            match.lastIndex = 0;
            return match.exec(url)
          }
        }
        function addRule(url, data, callback){
          var tokens = tokenize(url);
          if(!tokens)
            return this;

          var fullmatch = new RegExp("^#" + tokens.map(combineMatch).join("") + "$", "g"),
            seachObj = {
              fullmatch : fullmatch,
              exec : createMatch(fullmatch),
              tokens : tokens,
              callback : callback,
              data : data
            }, hasSearchKey;
          console.log(fullmatch);
          function combineMatch(token){
            return token.strict === false ?
              "(?:\\/(" + token.match + ")|)" : "\\/(" + token.match + ")";
          }
          each(tokens, function(token, i){
            if(token.stable){
              hasSearchKey = hasSearchKey || true;
              searchCache(token.value, seachObj)
            }
          });
          if(!hasSearchKey){
            regExpCache.push(seachObj)
          }
          return this;
        }
        function check(url){
          var tokens = url.split("/"), stableSearch, searchObj, match, searchTokens, result = {}, callback;
          tokens[0] == "#" && tokens.shift();
          match = (function() {
            var match;
            each(tokens, function (token, i) {
              stableSearch = searchCache[token] || [];
              for(var i = 0; i < stableSearch.length; i++){
                match = stableSearch[i] && stableSearch[i].exec(url);
                if(match){
                  searchObj = stableSearch[i];
                  searchTokens = stableSearch[i].tokens;
                  callback = stableSearch[i].callback;
                  return true;
                }
              }
            });
            return match;
          })();
          match || find(regExpCache, function(regExpSearch, i){
            match = regExpSearch.exec(url) || match;
            if(match) {
              searchObj = regExpSearch;
              searchTokens = regExpSearch.tokens;
              callback = regExpSearch.callback;
            };
            return regExpSearch.exec(url)
          });
          searchTokens && each(searchTokens, function(token, i){
            if(token.type === "attribute"){
              match[i - 0 + 1] && (result[token.value] = match[i - 0 + 1]);
            }
          });
          callback && callback({
            match : match,
            params : result,
            data : data
          });
          return searchObj || null;
        }
        extend(routerCheck.init.prototype, {
          addRule : addRule,
          check : check
        })
        return routerCheck;
      })();
      return extend(psComponents, {
        addCssFiles : addCssFiles,
        addCssStyle : addCssStyle,
        routerCheck : routerCheck
      });
    }])
})