(function(){

  function checkAllBoxes(menu){
    for(var i=0; i<menu.length; i++) {
      menu[i].checked = true;
    }
  }

  function init(){
    var menu1 = document.getElementsByClassName('menu1-inner');
    checkAllBoxes(menu1);
    var menu2 = document.getElementsByClassName('menu2-inner');
    checkAllBoxes(menu2);
  }

  init();

})();