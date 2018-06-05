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
    marginLeft = 20,

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
  function setClass(elem, cs){
    elem.setAttribute("class", cs);
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
  function createComment(text){
    var element = document.createComment(text);
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
  function extend(a, b){
    eachProp(b, function(element, attr){
      a[attr] = element;
    })
  }
  function createTree(data){
    var self = this;
    var context = {}, Node, traverseKey = "children",
      _fa = "fa", currentHighlight;
    function on(eventName, handler){
      this.events[eventName] = handler;
    };
    function emit(eventName, event){
      var fn = this.events[eventName];
      isFunc(fn) && fn(event);
    }
    function createRow(dept){
      return createElement("div", "tree-wrap", {
        "margin-left" : (dept ? marginLeft : 0) + "px"
      });
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
    function createInner(dept, hasChild){
      var cls = ( dept == 0 && hasChild ) ? "depth-" + dept + " open" : "depth-" + dept,
        div = createElement("div", "tree-element " + cls + (hasChild ? "" : " leaf-node"), {
          "margin-left" : -paddingLeft * dept + "px",
          "padding-left" : paddingLeft * dept + "px"
        });
      return div;
    }
    function createItem(posi){
      var div = createElement("div", "tree-item" + (posi.length ? " " + posi : ""));
      return div;
    }
    function removeDom(){

    }
    function addDom(){

    }
    function setItemVisible(){
      if(this.show == true){
        var parent = this.placeholder.parentNode;
        if(parent){
          parent.insertBefore(this.item, this.placeholder);
        }
        this.placeholder.remove();
      } else {
        var parent = this.item.parentNode;
        if(parent){
          parent.insertBefore(this.placeholder, this.item);
        }
        this.item.remove();
      }
    }
    function traverse(data, dept){
      var i, icon, name, url, children, repeat,
        row = bind(this, createRow)(dept), foldIcon,
        nodeList = [];
      each(data, bind(this, function(dt, i, source){
        var itemDom, innerDom, itemWrap, inner, pos = "", replaceNode, event = {
            createElement : createElement,
            render : function(node){
              replaceNode = node;
            }
          },
          placeholder = createComment("---- node removed! -----"),
          newNode = new Node(),
          foldToggle = function(){
            if(hasClass(newNode.foldIcon, "ps-" + _iconUnFold)){
              removeClass(newNode.foldIcon, "ps-" + _iconUnFold)
              addClass(newNode.foldIcon, "ps-" + _iconFold);
              removeClass(itemDom, "open")
            } else {
              removeClass(newNode.foldIcon, "ps-" + _iconFold)
              addClass(newNode.foldIcon, "ps-" + _iconUnFold);
              addClass(itemDom, "open");
            }
          }
        extend(newNode, dt);
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
        function events(){}
        extend(events.prototype, {
          allowDefaultBehavior : true,
          preventDefault : function(){
            this.allowDefaultBehavior = false;
          },
          fold : foldToggle
        })
        inner = bind(self, traverse)(children, dept + 1);
        inner.nodeList.length && (newNode.children = inner.nodeList);
        this.emit("init", event);
        dept && i == 0 && (pos += "first");
        i === data.length - 1 && (pos += " last");
        newNode.placeholder = placeholder;
        newNode.item = itemDom = createItem(pos);
        newNode.inner = innerDom = bind(this, createInner)(dept, !!children.length);
        newNode.icon = icon && createIcon(icon, "menu-before");
        newNode.text = createText(name);
        newNode.foldIcon = createIcon("ps." + _iconUnFold, "menu-addon");
        children.length && innerDom.appendChild(newNode.foldIcon);
        newNode.icon && innerDom.appendChild(newNode.icon);
        replaceNode ? innerDom.appendChild(replaceNode) : innerDom.appendChild(newNode.text)
        itemDom.appendChild(innerDom)
        itemDom.appendChild(inner.dom);
        newNode.foldIcon.onclick = bind(this, function(e){
          e.stopPropagation();
          var foldEvent = new events();
          foldEvent.node = newNode;
          this.emit("fold", foldEvent);
          if(foldEvent.allowDefaultBehavior){
            hasClass(inner.dom, "hide") ? (removeClass(inner.dom, "hide")) : addClass(inner.dom, "hide");
            foldToggle && foldToggle();
          }
        });
        newNode.inner.onclick = bind(this, function(e){
          var clickEvent = new events();
          clickEvent.node = newNode;
          this.emit("fold", clickEvent);
          if(clickEvent.allowDefaultBehavior){
            currentHighlight && removeClass(currentHighlight, "high-light");
            currentHighlight !== newNode.inner ? addClass(newNode.inner, "high-light") : removeClass(newNode.inner, "high-light");
            currentHighlight = newNode.inner;
          }
        })
        each(inner.nodeList, function(node){
          node.parent = newNode;
        });
        row.append(itemDom);
        push.call(this, newNode);
        nodeList.push(newNode);
      }));
      return {
        dom : row,
        nodeList : nodeList
      };
    }
    Node = function(){}
    Node.prototype.update = function(){
      this.show == false;
      bind(this, setItemVisible)();
      this.updateItem();
      //updateIcon(this.icon);
      //updateFoldIcon(this.fold);
    }
    Node.prototype.updateItem = function(){
      var children = this.parent ? this.parent.children : self.nodeList,
        visiblechildren = filter(children, (bind, function(child){
          console.log(child.show);
          return child.show != false;
        })),
        pos = "",
        inx = visiblechildren.indexOf(this);
      this.parent && inx == 0 && (pos += "first");
      (inx === visiblechildren.length - 1) && (pos += " last");
      this.searched && (pos += " searched");
      console.log(inx, pos, visiblechildren, children);
      setClass(this.item, "tree-item " + pos);
    }
    Node.prototype.getChildren = function(){

    }
    Node.prototype.getParents = function(){

    }
    Node.prototype.remove = function(){

    }
    extend(context, bind(self, traverse)(data, 0));
    return context;
  }
  function clearAll(){
    removeAllChildren(treemenu);
  }
  function destroy(){

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
  function search(callback){
    this.each(function(n){
      n.show = false;
      delete n.searched;
    });
    this.each(bind(this, function(n){
      var searchFn = isFunction(callback) ? callback : function(n){
        return n.label.indexOf(callback) != -1;
      }, parent = n, find = searchFn(n);
      find && callback != "" && (n.searched = find);
      find && console.log(find);
      if(n.show !== true ){
        while(find && parent){
          console.log(parent.label);
          find && (parent.show = true);
          parent = parent.parent;
        }
      };
    }));
    this.each(function(n){
      n.update();
    });
  }
  function setOption(option){
    clearAll();
    var tree = createTree.call(this, option);
    this.nodeList = tree.nodeList;
    treemenu.appendChild(tree.dom);
  }
  psTree.init = function(dom, config){
    this.dom = dom;
    this.events = {};
    this.length = 0;
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
    setOption : setOption,
    destroy : destroy,
    search : search,
    each : function(callback){
      each(this, function(n){
        callback(n);
      })
    }
  })
  return psTree;
});