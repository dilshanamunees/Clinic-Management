function checkTimeSlot(docId,date)
{
  let newdate=document.getElementById(date).value
var select = document.getElementById("selectTime"); 

  console.log(newdate)
   $.ajax({
          url:'/checkDate',
          data:{
              doctor:docId,
              date:newdate,
             

          },
          method:'post',
          success:(response)=>{
          console.log(response)
        select.innerHTML=""
           for (var i = 0; i < response.length; i++) { 
              var optn = response[i]; 
              var el = document.createElement("option"); 
              el.textContent = optn; 
              el.value = optn; 
              
              select.add(el); 
          } 
          }
   })
}
 
$( function() {
$("#datepicker").datepicker({
  minDate: 0  
})
})