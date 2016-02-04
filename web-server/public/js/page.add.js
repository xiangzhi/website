//page.add.js

$( document ).ready(function() {
  $("#new-date").datepicker();
  $("#new-date").datepicker( "option", "dateFormat", "MM dd, yy" );


  $("#add-btn").click(function(){
    console.log("inside add btn")
      var obj = {};
      obj.date =  $("#new-date").val();
      obj.text =  $("#new-text").val();
      $.ajax({
        type: "POST",
        url: "/addNews",
        data: obj,
        success: function(result){
          alert("added done");  
          location.reload(false);      
        },
        dataType: "json"
      });
  })

  $(".delete-btn").click(function(){
    var btnVal = $(this).val()
    $.ajax({
        url: '/addNews?id=' + btnVal,
        type: 'DELETE',
        success: function(result) {
          alert("delete done");
          location.reload(false);
        }
    });
  })
})