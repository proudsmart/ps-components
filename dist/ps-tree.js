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
    indexOf = Array.prototype.indexOf,
    splice = Array.prototype.splice,
    tostring = Object.prototype.toString,
    hasownprop = Object.prototype.hasOwnProperty,
    treemenu = createElement("div", "tree-menu2"),
    paddingLeft = 20,
    marginLeft = 20,
    _glyphicon = "glyphicon glyphicon-",
    _defaultIcon = "asterisk",
    _iconFold = "fold",
    _iconUnFold = "unfold";
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
  function extend(a, b){
    for(var i in b){
      a[i] = b[i]
    }
  }
  function each(arr, callback){
    var i, rs;
    arr = arr || [];
    for(i=0; i<arr.length; i++){
      rs = isFunction(callback) ? callback(arr[i], i) : undefined;
      if(rs !== undefined){
        return rs;
      }
    }
  }
  function find(arr, callback){
    return each(arr, function(n, i){
      if(callback(n, i)){
        return n;
      }
    });
  }
  function filter(arr, callback){
    var rs = [];
    each(arr, function(n, i){
      if(callback(n, i)){
        rs.push(n);
      }
    });
    return rs;
  }
  function some(arr, callback){
    var rs = each(arr, function(n, i){
      if(callback(n, i)){
        return true;
      }
    })
    return rs === undefined ? false : rs;
  }
  function every(arr, callback){
    var rs = each(arr, function(n, i){
      if(!callback(n, i)){
        return false;
      }
    })
    return rs === undefined ? true : rs;
  }
  function eachProp(obj, callback){
    var i;
    obj = obj || {};
    for(var i in obj){
      callback && callback(obj[i], i);
    }
  }
  function clone(obj){
    return JSON.parse(JSON.stringify(obj));
  }
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
    return a.length;
  }
  function pushDiff(a, b){
    var i = 0;
    a = a || [];
    b = b || [];
    for(; i < b.length; i++){
      if(a.indexOf(b[i]) === -1){
        a.push(b[i])
      }
    }
    return a.length;
  }
  function addClass(elem, cls){
    var oldcls = elem.getAttribute("class"),
      oldClsList = isString(oldcls) ? oldcls.split(" ") : [];
    clsList = cls.split(" ");
    pushDiff(oldClsList, clsList);
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
  function hasProp(obj, attr){
    return hasownprop.call(obj, attr);
  }
  function createTree(data){
    var self = this,
      context = {},
      Node, treeData,
      traverseKey = "children",
      _fa = "fa", currentHighlight;
    function on(eventName, handler){
      this.events[eventName] = handler;
    };
    function emit(eventName, event){
      var fn = this.events[eventName];
      isFunc(fn) && fn.call(event.node, event);
    }
    function createRow(dept){
      return createElement("div", "tree-wrap", {
        "margin-left" : (dept ? marginLeft : 0) + "px"
      });
    }
    function createText(text){
      var span = createElement("span", "title");
      span.innerText = text;
      return span;
    }
    function updateText(){
      this.text.innerText = this.label;
    }
    function createIcon(icon, cls){
      icon = icon || "";
      cls = " " + cls || ""
      var span = createElement("span", icon + cls);
      return span;
    }
    function updateCheckBoxCls(){
      this.checked == true ? addClass(this.checkbox, "checked") : removeClass(this.checkbox, "checked")
    }
    function updateCheckbox(){
      this.eachChild(bind(this, function(n){
        n.checked = this.checked;
        bind(n, updateCheckBoxCls)();
      }));
      this.eachParent(bind(this, function(n){
        !this.checked || every(n.children, function(n){
          return n.checked == true;
        }) ? n.checked = this.checked : null;
        bind(n, updateCheckBoxCls)();
      }))
      bind(this, updateCheckBoxCls)();
    }
    function updateFolder(){
      if(this.open == false){
        removeClass(this.foldIcon, "ps-" + _iconUnFold)
        addClass(this.foldIcon, "ps-" + _iconFold);
        var parent = this.fold.parentNode;
        if(parent){
          parent.insertBefore(this.foldplaceholder, this.fold);
        };
        this.fold.remove();
      } else {
        removeClass(this.foldIcon, "ps-" + _iconFold)
        addClass(this.foldIcon, "ps-" + _iconUnFold);
        var parent = this.foldplaceholder.parentNode;
        if(parent){
          parent.insertBefore(this.fold, this.foldplaceholder);
        };
        this.foldplaceholder.remove();
      }
    }
    function createInner(dept){
      var cls = "depth-" + dept,
        div = createElement("div", "tree-element " + cls, {
          "margin-left" : -paddingLeft * dept + "px",
          "padding-left" : paddingLeft * dept + "px"
        });
      return div;
    }
    function updateInner(){
      var hasChildren = some(this.children, function(n){
        return n.show !== false;
      });
      hasChildren ? bind(this, showfoldIcon)() : bind(this, hidefoldIcon)()
      hasChildren ? removeClass(this.inner, "leaf-node") : addClass(this.inner, "leaf-node");
    }
    function createItem(){
      var div = createElement("div", "tree-item");
      return div;
    }
    function updateItem(){
      var pos = "",
        children = (this.parent ? this.parent.children : self.nodeList),
        visiblechildren = filter(children, (bind, function(child){
          return child.show != false;
        })),
        inx = visiblechildren.indexOf(this);
      inx = inx == -1 ? null : inx;
      this.parent && inx == 0 && (pos += "first");
      (inx === visiblechildren.length - 1) && (pos += " last");
      this.searched && (pos += " searched");
      setClass(this.item, "tree-item " + pos);
    }
    function createCheckBox(){
      var checkbox = createElement("span", "checkbox");
      return checkbox;
    }
    function showfoldIcon(){
      addCss(this.foldIcon, {
        display : "inline"
      });
    }
    function hidefoldIcon(){
      addCss(this.foldIcon, {
        display : "none"
      });
    }
    function checkNodeVisibility(){
      if(this.show !== false){
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
    function contain(target, dom){
      var parent = dom;
      while(parent){
        if(parent === target){
          return true
        }
        parent = parent.parentNode;
      }
      return false;
    }
    function traverse(data, dept){
      var i, icon, name, url, children, repeat, nodeList = [],
        row = bind(this, createRow)(dept), foldIcon, visiblechildren, emptyplaceholder;
      each(data, bind(this, function(dt, i, source){
        var itemDom, innerDom, itemWrap, inner, pos = "", replaceNode, initEvent,
          foldplaceholder = createComment("------ node folded! -----"),
          placeholder = createComment("------ node removed! -----"),
          newNode = new Node();
        function events(){}
        extend(events.prototype, {
          replaceNode : null,
          allowDefaultBehavior : true,
          preventDefault : function(){
            this.allowDefaultBehavior = false;
          }
        });
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
        emptyplaceholder = createElement("span", "placeholder");
        inner = bind(self, traverse)(children, dept + 1, newNode);
        newNode.depth = dept;
        newNode.children  = inner.nodeList.length && inner.nodeList;
        initEvent = new events();
        initEvent.node = newNode;
        this.emit("init", initEvent);
        newNode.root = self;
        newNode.placeholder = placeholder;
        newNode.foldplaceholder = foldplaceholder;
        newNode.item = itemDom = createItem();
        newNode.fold = inner.dom;
        newNode.inner = innerDom = bind(this, createInner)(dept);
        newNode.icon = icon && createIcon(icon, "menu-before");
        newNode.checkbox = createCheckBox();
        newNode.text = createText(name);
        newNode.foldIcon = createIcon(null, "menu-addon ps");
        innerDom.appendChild(emptyplaceholder);
        innerDom.appendChild(newNode.foldIcon);
        innerDom.append(newNode.checkbox);
        newNode.icon && innerDom.appendChild(newNode.icon);
        newNode.text && innerDom.appendChild(newNode.text);
        newNode.custom && innerDom.appendChild(newNode.custom);
        newNode.item.appendChild(newNode.inner);
        newNode.item.appendChild(inner.dom);
        newNode.foldIcon.onclick = bind(this, function(e){
          e.stopPropagation();
          var foldEvent = new events();
          foldEvent.node = newNode;
          this.emit("fold", foldEvent);
          if(foldEvent.allowDefaultBehavior){
            newNode.toggle();
          }
        });
        newNode.checkbox.onclick = bind(this, function(e){
          e.stopPropagation();
          var checkboxEvent = new events();
          checkboxEvent.node = newNode;
          this.emit("check", checkboxEvent);
          if(checkboxEvent.allowDefaultBehavior){
            newNode.check();
          }
        })
        newNode.inner.onclick = bind(this, function(e){
          var clickEvent = new events();
          clickEvent.node = newNode;
          this.emit("click", clickEvent);
          if(clickEvent.allowDefaultBehavior){
            currentHighlight && removeClass(currentHighlight, "high-light");
            currentHighlight !== newNode.inner ?
              addClass(newNode.inner, "high-light") :
              removeClass(newNode.inner, "high-light");
            currentHighlight = newNode.inner;
          }
        });
        each(inner.nodeList, function(node){
          node.parent = newNode;
          node.update();
        });
        row.appendChild(newNode.item);
        push.call(this, newNode);
        nodeList.push(newNode);
      }));
      return {
        dom : row,
        nodeList : nodeList
      };
    }
    Node = function(){}
    extend(Node.prototype, {
      update : function(children){
        bind(this, checkNodeVisibility)();
        bind(this, updateItem)();
        bind(this, updateText)();
        bind(this, updateInner)();
        bind(this, updateFolder)();
      },
      setTitle : function(text){
        this.label = text;
        bind(this, updateText)(text);
      },
      createGroup : function(id){
        var group = createElement("span");
        group.setAttribute("id", id);
        return group;
      },
      createText : function(id, text, style){
        var span = createElement("span");
        span.setAttribute("id", id);
        span.innerText = text;
        addCss(span, style);
        return span;
      },
      createButton : function(id, text, style, callback){
        var button = createElement("button");
        button.setAttribute("id", id);
        button.innerText = text;
        addCss(button, style);
        button.onclick = bind(this, function(e){
          e.stopPropagation();
          bind(this, callback)(e);
        });
        return button;
      },
      getAllChecked : function(){
        var rs = [];
        each(self, function(n, i){
          if(n.checked == true){
            rs.push(n);
          }
        })
        return rs;
      },
      getById : function(id){
        function traverse(children){
          for(var i in children){
            if(children[i].getAttribute("id") == id){
              return children[i];
            } else {
              traverse(children[i].children);
            }
          }
        }
        return traverse(this.custom.children)
      },
      render : function(node){
        this.custom = node;
      },
      check : function(){
        this.checked = !this.checked;
        bind(this, updateCheckbox)();
      },
      toggle : function(){
        this.open = this.open === undefined ? false : !this.open;
        bind(this, updateFolder)();
      },
      append : function(d){
        var brothers = (this.parent ? this.parent.children : self.nodeList),
          i = brothers.indexOf(this), row;
        d = isArray(d) ? d : [d], length;
        this.children = isArray(this.children) ? this.children : [];
        row = bind(self, traverse)(d, this.depth + 1);
        length = pushBack(this.children, row.nodeList);
        each(row.dom.children, bind(this, function(n){
          this.fold.append(n);
        }));
        each(row.nodeList, bind(this, function(n, i){
          n.parent = this;
          n.update();
          i == 0 && bind(n, updateCheckbox)();
        }));
        length > 1 && this.children[length - 2].update();
        this.update();
      },
      remove : function(){
        var brothers = (this.parent ? this.parent.children : self.nodeList),
          i = brothers.indexOf(this);
        function traverse(children){
          each(children, function(n, i){
            n.destroy();
            n.children && traverse(n.children)
          })
        }
        traverse(this.children);
        brothers.splice(i, 1);
        each(brothers, function(n, i){
          bind(n, updateItem)();
          i == 0 && bind(n, updateCheckbox)();
        })
        this.destroy();
      },
      destroy : function(){
        var i = indexOf.call(self, this);
        this.item.remove();
        eachProp(this, bind(this, function(elem, attr){
          delete this[attr]
        }));
        splice.call(self, i, 1);
      },
      eachChild : function(callback){
        function traverse(children){
          each(children, function(n, i){
            callback(n, i);
            n.children && traverse(n.children)
          })
        }
        traverse(this.children);
      },
      eachParent : function(callback){
        var parent = this.parent, rs;
        while(parent){
          rs = callback(parent, stop)
          if(parent.parent && rs !== false){
            parent = parent.parent;
          } else {
            break;
          }
        }
      },
      getChildren : function(){
        var rs = [];
        this.eachChild(bind(this, function(n, i){
          rs.push(n);
        }));
        return rs;
      },
      getParents : function(){
        var rs = [], parent = this.parent;
        this.eachParent(function(p){
          rs.push(p);
        });
        return rs;
      }
    });
    treeData = bind(self, traverse)(data, 0);
    self.nodeList = treeData.nodeList;
    each(treeData.nodeList, function(n){
      n.update();
    });
    return treeData.dom
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
      elem.call(data.node, data);
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
      if(n.show !== true ){
        while(find && parent){
          find && (parent.show = true);
          parent = parent.parent;
        }
      };
    }));
    this.update();
  }
  function update(){
    this.each(function(n){
      n.update();
    });
  }
  function setOption(option){
    clearAll();
    treemenu.appendChild(bind(this, createTree)(option));
  }
  function psTree(dom, config){
    return new psTree.init(dom, config);
  };
  psTree.init = function(dom, config){
    this.dom = dom;
    this.events = {};
    this.length = 0;
    this.themes = config.themes;
    this.addtheme(this.themes);
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
    update : update,
    addtheme : function(theme){
      addClass(this.dom, theme);
    },
    removetheme : function(theme){
      removeClass(this.dom, theme);
    },
    settheme : function(theme){
      setClass(this.dom, theme);
    },
    each : function(callback){
      each(this, function(n, i){
        callback(n, i);
      })
    }
  })
  return psTree;
});