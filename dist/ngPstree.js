if(typeof angular !== "object") { throw new Error("angularjs is a must!")};
var pstree = angular.module("ngPstree", []);
pstree.directive("dropDownTree", function(){
  return {
    restrict : "E",
    template : "<div></div>",
    replace : true,
    scope : {
      ngModel : "=",
      option : "="
    },
    link : function(scope, elem){
      var treeIns;
      function create(d){
        treeIns = psTree(elem[0], {
          display : "dropdown",
          value : scope.ngModel,
          animate : false,
          themes : "show-line",
          data : d,
          on : {
            init : function(event){
              this.open = false;
            },
            click : function(event){
              scope.ngModel = this.getParents().map;
            }
          }
        });
      }
      function destroy(){
        treeIns && treeIns.destroy();
        elem.children().remove();
      }
      scope.$watch("option", function(n, o, s){
        n ? create(n) : destroy();
      })
    }
  }
})