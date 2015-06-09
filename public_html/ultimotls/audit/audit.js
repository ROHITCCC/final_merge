/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/////JQUERY HANDLERS////
//Advance Search
$("#advanceSearch").click(function(){
    $("#freeFormSearch").hide("slow", function(){
       $("#advSearchBox").slideDown("fast");   
    });
    $("#rowOptions").attr("ng-click","doAdvanceSearch()");
});
$("#closeAdvanceField").click(function(){
    $("#advSearchBox").hide("slow", function(){
       $("#freeFormSearch").slideDown("fast");
    });
    $("#rowOptions").attr("ng-click","doSearch()");
});

//Slide Bar
$("#openSlide").click(function(){
   $("#sliderContent").animate(
        {"right": "0"},
        "slow");
});
$(".btn-primary").click(function(){
   $("#sliderContent").animate(
        {"right": "-50%"},
        "slow");
});
$("html").dblclick(function(){
   $("#sliderContent").animate(
        {"right": "-50%"},
        "slow");
});
