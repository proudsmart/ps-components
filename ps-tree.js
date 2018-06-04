(function(global, factory){
  if(typeof module && typeof module.exports === "function"){
    module.exports = factory();
  } else if(typeof define === "function"){
    define(factory);
  } else if(global === window){
    global.psTree = factory();
  }
})(this, function(){
  var element = data.element,
    push = Array.prototype.push,
    slice = Array.prototype.slice,
    tostring = Object.prototype.toString,
    hasownprop = Object.prototype.hasOwnProperty,
    treemenu = createElement("div", "tree-menu2"),
    expression, initFn, paddingLeft = 20;
  function psTree(dom, data){
    return new psTree.init(dom, option);
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
    var oldcls = elem.getAttributes("class"),
      oldClsList = oldcls.split(" ");
    clsList = cls.split(" ");
    pushBack(oldClsList, clsList);
    elem.setAttributes("class", oldClsList.joint(" "));
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
    var events = {},
      _fa = "fa",
      _glyphicon = "glyphicon glyphicon-",
      _defaultIcon = "asterisk",
      _iconFold = "menu-left",
      _iconUnFold = "menu-down";
    function extend(a, b){
      eachProp(b, function(element, attr){
        a[attr] = element;
      })
    }
    function on(eventName, handler){
      events[eventName] = handler;
    };
    function emit(eventName, event){
      var fn = events[eventName];
      isFunc(fn) && fn(event);
    }
    function createRow(){
      return createElement("div", "tree-wrap");
    }
    function createText(text){
      var span = createElement("span");
      span.text(text);
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
    function createInner(icon, name, url, dept, row, hasChild){
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
        }
      }
      appendChildren.call(div, icon, text);
      div.on("click", function(e){
        extend(e, {
          $name : name,
          $url : url
        });
        row.hasClass("hide") && row.removeClass("hide") || row.addClass("hide");
        foldToggle && foldToggle();
        emit('menu:click', e);
      })
      return div;
    }
    function createItem(icon, name, url, dept, row, hasChild){
      var div = createElement("div", "tree-item");
      div.append(createInner(icon, name, url, dept, row, hasChild));
      return div;
    }
    function traverse(data, dept){
      var i, icon, name, url, children, repeat,
        row = createRow();
      each(data, function(dt, i, source){
        var itemDom, inner;
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
        inner = traverse(children, dept + 1);
        itemDom = createItem(icon, name, url, dept, inner, !!children.length);
        itemDom.append(inner);
        row.append(itemDom);
      });
      return row;
    }
    return {
      dom : traverse(data, 0),
      on : on
    }
  }
  function clearAll(){
    treemenu.children().remove();
  }
  function setOption(option){
    removeAllChildren(this.dom);
    this.dom.appendChild(createTree(option));
  }
  function destroyed(){

  }
  psTree.init = function(dom, option){
    this.dom = dom;
    this.option = option;
    option && dom.appendChild(createTree(option));
  }
  extend(psTree.init.prototype, {
    setOption : SetOption
  })
  return psTree();
});