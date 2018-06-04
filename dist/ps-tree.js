(function(global, factory){
  if(typeof module !== "undefined" && typeof module.exports === "function"){
    module.exports = factory();
  } else if(typeof define === "function"){
    define(factory);
  } else if(global === window){
    global.psTree = factory();
  }
})(this, function(){
  var push = Array.prototype.push,
    slice = Array.prototype.slice,
    tostring = Object.prototype.toString,
    hasownprop = Object.prototype.hasOwnProperty,
    treemenu = createElement("div", "tree-menu2"),
    paddingLeft = 20,
    _glyphicon = "glyphicon glyphicon-",
    _defaultIcon = "asterisk",
    _iconFold = "menu-left",
    _iconUnFold = "menu-down";
  function isObject(obj){
    return tostring.call(obj) == "[object Object]";
  }
  function isNull(obj){
    return tostring.call(obj) == "[object Null]";
  }
  function isUndefined(obj){
    return tostring.call(obj) == "[object Undefined]";
  }
  function isArray(obj){
    return tostring.call(obj) == "[object Array]";
  }
  function isNumber(obj){
    return tostring.call(obj) == "[object Number]" && obj === obj;
  }
  function isFunction(obj){
    return tostring.call(obj) == "[object Function]";
  }
  function isString(obj){
    return tostring.call(obj) == "[object String]";
  }
  function isNaN(num){
    return num !== num;
  }
  function bind(target, fn){
    return function() {
      return fn.apply(target, arguments);
    }
  }
  function find(arr, callback){
    var i;
    arr = arr || [];
    for(var i = 0; i < arr.length; i++){
      if(callback(arr[i], i)){
        return arr[i];
      }
    }
  }
  function filter(arr, callback){
    var i, rs = [];
    arr = arr || [];
    for(var i = 0; i < arr.length; i++){
      if(callback(arr[i], i)){
        rs.push(arr[i]);
      }
    }
    return rs;
  }
  function clone(obj){
    return JSON.parse(JSON.stringify(obj));
  }
  function extend(a, b){
    for(var i in b){
      a[i] = b[i]
    }
  }
  function each(arr, callback){
    var i;
    arr = arr || [];
    for(i=0; i<arr.length; i++){
      callback && callback(arr[i], i);
    }
  }
  function eachProp(obj, callback){
    var i;
    obj = obj || {};
    for(var i in obj){
      callback && callback(obj[i], i);
    }
  }
  function psTree(dom, config){
    return new psTree.init(dom, config);
  };
  function removeAllChildren(dom){
    each(dom.children, function(elem, i){
      elem.remove();
    })
  }
  function debug(fn){
    try { fn(); } catch(e) { error(e) }
  }
  function log(){
    console.log.apply(console, arguments);
  }
  function error(){
    console.error.apply(console, arguments);
  }
  function toGlyphicon(icon, lib){
    return glyphiconLike(icon) ? icon : lib + icon;
  }
  function glyphiconLike(str){
    return str.indexOf(_glyphicon) !== -1;
  }
  function addCss(elem, css){
    css && eachProp(css, function(element, attr){
      elem.style[attr] = element;
    });
  }
  function pushBack(a, b){
    push.apply(a, b);
  }
  function addClass(elem, cls){
    var oldcls = elem.getAttribute("class"),
      oldClsList = isString(oldcls) ? oldcls.split(" ") : [];
    clsList = cls.split(" ");
    pushBack(oldClsList, clsList);
    elem.setAttribute("class", oldClsList.join(" "));
  }
  function hasClass(elem, cls){
    var oldcls = elem.getAttribute("class"),
      oldClsList = isString(oldcls) ? oldcls.split(" ") : [];
    return oldClsList.indexOf(cls) != -1;
  }
  function removeClass(elem, cls){
    var oldcls = elem.getAttribute("class"),
      oldClsList = isString(oldcls) ? oldcls.split(" ") : [],
      i = oldClsList.indexOf(cls);
    i != -1 && oldClsList.splice(i, 1);
    elem.setAttribute("class", oldClsList.join(" "));
  }
  function appendChildren(){
    var self = this;
    var arr = slice.call(arguments, 0);
    each(arr, function(el){
      self.append(el);
    })
  }
  function createElement(tag, cls, css){
    var element = document.createElement(tag);
    cls && addClass(element, cls)
    addCss(element, css);
    return element;
  }
  function each(arr, callback){
    var i;
    for(i = 0; i < arr.length; i++){
      callback && callback(arr[i], i, arr);
    }
  }
  function hasProp(obj, attr){
    return hasownprop.call(obj, attr);
  }
  function eachProp(obj, callback){
    var i;
    for(i in obj){
      hasProp(obj, i) && callback(obj[i], i)
    }
  }
  function isFunc(fn){
    return tostring.call(fn) === "[object Function]";
  }
  function isArray(arr){
    return tostring.call(arr) === "[object Array]";
  }
  function createTree(data){
    var self = this;
    var context = {}, Node, traverseKey = "children",
      _fa = "fa";
    function extend(a, b){
      eachProp(b, function(element, attr){
        a[attr] = element;
      })
    }
    function on(eventName, handler){
      this.events[eventName] = handler;
    };
    function emit(eventName, event){
      var fn = this.events[eventName];
      isFunc(fn) && fn(event);
    }
    function createRow(){
      return createElement("div", "tree-wrap");
    }
    function createText(text){
      var span = createElement("span");
      span.innerText = text;
      return span;
    }
    function createIcon(icon, cls){
      icon = icon || _fa + ".circle";
      var arr = icon.split(".");
      if(arr.length > 1){
        lib = arr[0] + " " + arr[0] + "-";
        icon = arr[1];
      } else {
        lib = _glyphicon;
        icon = arr[0]
      }
      var span = createElement("span", toGlyphicon(icon, lib) + " " + cls);
      return span;
    }
    function createInner(icon, name, url, dept, row, node, hasChild){
      var foldToggle,
        cls = ( dept == 0 && hasChild ) ? "depth-" + dept + " open" : "depth-" + dept,
        div = createElement("div", "tree-element " + cls, {
          "padding-left" : paddingLeft * dept + "px"
        }),
        icon = createIcon(icon, "menu-before"),
        text = createText(name),
        foldIcon = createIcon(_iconUnFold, "menu-addon");
      if(hasChild){
        appendChildren.call(div, foldIcon);
        /**
        foldToggle = function(){
          if(foldIcon.hasClass(_glyphicon + _iconUnFold)){
            foldIcon.removeClass(_glyphicon + _iconUnFold)
            foldIcon.addClass(_glyphicon + _iconFold);
            div.removeClass("open")
          } else {
            foldIcon.removeClass(_glyphicon + _iconFold)
            foldIcon.addClass(_glyphicon + _iconUnFold);
            div.addClass("open")
          }
        }*/
      }
      appendChildren.call(div, icon, text);
      div.onclick = function(e){
        var allowDefaultBehavior = true;
        var event = {
          node : node,
          stopPropagation : e.stopPropagation,
          preventDefault : function(){
            allowDefaultBehavior = false;
          }
        }
        self.emit("click", event)
        if(allowDefaultBehavior){
          hasClass(row, "hide") ? (removeClass(row, "hide")) : addClass(row, "hide");
          foldToggle && foldToggle();
        }
      };
      return div;
    }
    function createItem(icon, name, url, dept, row, node, hasChild){
      var div = createElement("div", "tree-item");
      div.append(createInner(icon, name, url, dept, row, node, hasChild));
      return div;
    }
    function traverse(data, dept){
      var i, icon, name, url, children, repeat,
        row = createRow(),
        nodeList = [];
      each(data, bind(this, function(dt, i, source){
        var itemDom, inner, replaceNode, event = {
            render : function(node){
              replaceNode = node;
            }
          },
          newNode = new Node();
        if(isArray(dt)){
          if(isArray(dt[2])){
            icon = dt[0];
            name = dt[1];
            children = dt[2];
          } else if(isArray(dt[1])){
            name = dt[0];
            children = dt[1]
          } else if(dt.length < 2){
            name = dt[0];
            children = [];
          } else {
            icon = dt[0];
            name = dt[1];
            url = dt[2];
            children = [];
          }
        } else if(isObject(dt)){
          icon = dt.icon;
          name = dt.label;
          children = dt[traverseKey] || [];
        }
        inner = bind(self, traverse)(children, dept + 1);
        inner.nodeList.length && (newNode.children = inner.nodeList);
        this.emit("init", event);
        itemDom = replaceNode || createItem(icon, name, url, dept, inner.dom, newNode, !!children.length);
        itemDom.append(inner.dom);
        each(inner.nodeList, function(node){
          node.parent = newNode;
        })
        row.append(itemDom);
        nodeList.push(newNode);
      }));
      return {
        dom : row,
        nodeList : nodeList
      };
    }
    Node = function(){}
    Node.prototype.getChildren = function(){

    }
    Node.prototype.getParents = function(){

    }
    extend(context, bind(self, traverse)(data, 0));
    return context;
  }
  function clearAll(){
    removeAllChildren(treemenu);
  }
  function destroyed(){

  }
  function on(eventname, callback){
    if(isObject(eventname)){
      eachProp(eventname, bind(this, function(elem, attr){
        this.events[attr] = this.events[attr] || [];
        this.events[attr].push(elem);
      }));
    } else if(isString(eventname)){
      this.events[eventname] = this.events[eventname] || [];
      callback && this.events[eventname].push(callback);
    }
  }
  function emit(eventname, data){
    var  events = this.events[eventname];
    each(events, function(elem, i){
      elem(data);
    })
  }
  function setOption(option){
    clearAll();
    var tree = createTree.call(this, option);
    treemenu.appendChild(tree.dom);
  }
  psTree.init = function(dom, config){
    this.dom = dom;
    this.events = {};
    if(isArray(config)){
      this.option = config
    } else if(isObject(config)){
      this.on(config.on);
      this.option = config.data;
    }
    if(this.option){
      this.setOption(this.option);
    }
    this.dom.appendChild(treemenu);
  }
  extend(psTree.init.prototype, {
    on : on,
    emit : emit,
    setOption : setOption
  })
  return psTree;
});